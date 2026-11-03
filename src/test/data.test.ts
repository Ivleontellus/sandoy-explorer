// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildExport, parseGeoJsonImport } from '../data/geojson'
import { parseGpx } from '../data/gpx'
import { baseProps, type MapFeature } from '../data/model'
import { compassName, sunPosition } from '../features/sun/sun'

const poi = (category: 'baer' | 'geologi', shareable: boolean, sensitive = false): MapFeature => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [11.08, 58.998] },
  properties: { ...baseProps('poi', category), kind: 'poi', category, shareable, sensitive },
})

describe('GPX-import', () => {
  it('leser spor som rådata, aldri som stier', () => {
    const text = readFileSync('samples/eksempel-radiacode-spor.gpx', 'utf8')
    const tracks = parseGpx(text, 'eksempel.gpx')
    expect(tracks).toHaveLength(1)
    expect(tracks[0].properties.kind).toBe('track')
    expect(tracks[0].properties.name).toBe('Testtur Søndre Sandøy')
    expect(tracks[0].properties.source.creator).toContain('RadiaCode')
    expect(tracks[0].properties.times).toHaveLength(40)
    expect(tracks[0].properties.shareable).toBe(false)
  })

  it('feiler tydelig på fil uten spor', () => {
    expect(() => parseGpx('<gpx xmlns="http://www.topografix.com/GPX/1/1"></gpx>', 'tom.gpx')).toThrow(/Fant ingen spor/)
  })
})

describe('GeoJSON-eksport', () => {
  it('delbar eksport utelater private, sårbare og mineraler', () => {
    const features = [poi('baer', true), poi('baer', false), poi('baer', true, true), poi('geologi', true, true)]
    const shared = buildExport(features, 'shareable')
    expect(shared.features).toHaveLength(1)
    expect(buildExport(features, 'backup').features).toHaveLength(4)
  })

  it('importerte fremmede linjer blir sti-utkast', () => {
    const text = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [[11, 59], [11.1, 59.1]] }, properties: { status: 'godkjent' } },
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] }, properties: {} },
      ],
    })
    const { features, skipped } = parseGeoJsonImport(text)
    expect(skipped).toBe(1)
    expect(features[0].properties.kind).toBe('path')
    expect(features[0].properties).toMatchObject({ status: 'utkast' })
  })

  it('rundtur eksport → import bevarer egne objekter', () => {
    const original = [poi('geologi', false, true)]
    const { features } = parseGeoJsonImport(JSON.stringify(buildExport(original, 'backup')))
    expect(features[0].properties).toMatchObject({ id: original[0].properties.id, category: 'geologi', sensitive: true })
  })

  it('bildestier i publisert datasett beholdes, ugyldige verdier filtreres', () => {
    const f = { ...poi('fiske', true, false), properties: { ...poi('fiske', true, false).properties, photos: ['bilder/a.jpg', 7] } }
    const { features } = parseGeoJsonImport(JSON.stringify({ type: 'FeatureCollection', features: [f] }))
    expect(features[0].properties.photos).toEqual(['bilder/a.jpg'])
    const { features: plain } = parseGeoJsonImport(JSON.stringify(buildExport([poi('fiske', true, false)], 'shareable')))
    expect(plain[0].properties.photos).toBeUndefined()
  })
})

describe('Solviser', () => {
  it('sola står omtrent i sør ved soltid-middag midtsommer', () => {
    // Søndre Sandøy ligger ~11.08°Ø, så sann middag er ca. kl. 11:16 UTC.
    const p = sunPosition(new Date('2026-06-21T11:16:00Z'), 58.998, 11.081)
    expect(p.azimuthDeg).toBeGreaterThan(175)
    expect(p.azimuthDeg).toBeLessThan(185)
    expect(p.altitudeDeg).toBeGreaterThan(53)
    expect(p.altitudeDeg).toBeLessThan(56)
    expect(compassName(p.azimuthDeg)).toBe('S')
  })

  it('sola er under horisonten midt på natta i desember', () => {
    expect(sunPosition(new Date('2026-12-21T00:00:00Z'), 58.998, 11.081).altitudeDeg).toBeLessThan(0)
  })
})

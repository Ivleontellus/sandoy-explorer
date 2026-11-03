// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { baseProps, type MapFeature, type PathFeature, type PoiFeature } from '../data/model'
import { fromBase64, removeFeature, toBase64, upsertFeature } from '../features/publish/github'
import { mergedTrails, publishedSpots } from '../features/guide/fromPublished'
import { GUIDE_TRAILS } from '../features/guide/guide'

const poi = (name: string): PoiFeature => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [11.07, 59.01] },
  properties: { ...baseProps('poi', name), kind: 'poi', category: 'servering', website: 'https://example.no', shareable: true },
})

describe('Publisering', () => {
  it('base64 tåler æøå og emoji', () => {
    const text = 'Sandøy – blåbær, Ærø og 🐟'
    expect(fromBase64(toBase64(text))).toBe(text)
  })

  it('oppdaterer objekt med samme id, legger til nye og fjerner', () => {
    const a = poi('A')
    const b = poi('B')
    let list: MapFeature[] = upsertFeature([], a)
    list = upsertFeature(list, b)
    list = upsertFeature(list, { ...a, properties: { ...a.properties, name: 'A2' } })
    expect(list.map((f) => f.properties.name)).toEqual(['A2', 'B'])
    expect(removeFeature(list, a.properties.id).map((f) => f.properties.name)).toEqual(['B'])
  })

  it('publiserte punkter blir kjente plasser med nettside', () => {
    const [s] = publishedSpots([poi('Kafé')])
    expect(s).toMatchObject({ name: 'Kafé', type: 'servering', position: [59.01, 11.07], website: 'https://example.no', published: true })
  })

  it('publisert sti som erstatter en kjent rute skjuler den gamle', () => {
    const path: PathFeature = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [[11.07, 59.01], [11.08, 59.02]] },
      properties: { ...baseProps('path', 'Hjertestien'), kind: 'path', status: 'godkjent', replacesTrail: 'hjertestien' },
    }
    const trails = mergedTrails([path])
    expect(trails.filter((t) => t.name === 'Hjertestien')).toHaveLength(1)
    expect(trails.find((t) => t.name === 'Hjertestien')).toMatchObject({ published: true, color: GUIDE_TRAILS.find((t) => t.id === 'hjertestien')!.color })
    expect(trails).toHaveLength(GUIDE_TRAILS.length)
  })
})

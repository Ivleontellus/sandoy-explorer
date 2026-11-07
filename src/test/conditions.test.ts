// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { currentDaypart, matchesBestTime } from '../features/conditions/bestTime'
import { toSite } from '../features/heritage/heritageApi'
import { parseTideXml, type TideEvent } from '../features/tide/tideApi'
import { migrateFeature } from '../data/model'

const TIDE_XML = `<tide><locationdata><location name="Viker" code="VIK"/>
<data type="prediction" unit="cm">
<waterlevel value="49.0" time="2026-11-03T04:59:00+01:00" flag="low"/>
<waterlevel value="77.5" time="2026-11-03T11:41:00+01:00" flag="high"/>
<waterlevel value="42.1" time="2026-11-03T17:55:00+01:00" flag="low"/>
</data></locationdata></tide>`

describe('Tidevann', () => {
  it('parser Kartverkets XML', () => {
    const ev = parseTideXml(TIDE_XML)
    expect(ev).toHaveLength(3)
    expect(ev[1]).toMatchObject({ level: 77.5, flag: 'high' })
  })
  it('kaster på feilmelding fra tjenesten', () => {
    expect(() => parseTideXml('<error>Unrecognized command</error>')).toThrow(/Unrecognized/)
  })
})

describe('Beste tid', () => {
  const tides: TideEvent[] = parseTideXml(TIDE_XML)
  const at = (h: number) => new Date(2026, 10, 3, h, 0)

  it('deler døgnet i morgen/dag/kveld', () => {
    expect(currentDaypart(at(7))).toBe('morgen')
    expect(currentDaypart(at(13))).toBe('dag')
    expect(currentDaypart(at(20))).toBe('kveld')
    expect(currentDaypart(at(2))).toBeNull()
  })

  it('treffer når både dagsdel og tidevann passer', () => {
    expect(matchesBestTime({ daypart: ['dag'], tide: ['hoyvann'] }, at(12), tides).matches).toBe(true)
    expect(matchesBestTime({ daypart: ['dag'], tide: ['lavvann'] }, at(12), tides).matches).toBe(false)
    expect(matchesBestTime({ daypart: ['morgen'], tide: [] }, at(12), tides).matches).toBe(false)
  })

  it('er ukjent uten tidevannsdata og uten valgte kriterier', () => {
    expect(matchesBestTime({ daypart: ['dag'], tide: ['hoyvann'] }, at(12), null).matches).toBeNull()
    expect(matchesBestTime({ daypart: [], tide: [] }, at(12), tides).matches).toBeNull()
  })
})

describe('Migrering', () => {
  it('mineraler blir geologi og sårbar', () => {
    const f = migrateFeature({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [11, 59] },
      properties: { id: 'a', kind: 'poi', category: 'mineraler', name: 'x', description: '', createdAt: '', updatedAt: '', sensitive: false, shareable: true },
    })
    expect(f?.properties).toMatchObject({ category: 'geologi', sensitive: true })
  })
})

describe('Kulturminner', () => {
  it('lager sentroid og felter fra Riksantikvarens feature', () => {
    const s = toSite({
      type: 'Feature',
      geometry: { type: 'MultiPolygon', coordinates: [[[[11.0, 59.0], [11.2, 59.0], [11.2, 59.2], [11.0, 59.2]]]] },
      properties: { navn: 'Salta', kulturminneId: '1-1', lokalitetskategori: 'L-ARK', vernetype: 'AUT', 'linkKulturminnesøk': 'https://kulturminnesok.no/x' },
    })
    expect(s?.centroid[0]).toBeCloseTo(59.1)
    expect(s?.centroid[1]).toBeCloseTo(11.1)
    expect(s?.name).toBe('Salta')
    expect(s?.link).toContain('kulturminnesok')
  })

  it('retter øynavnet fra registeret', () => {
    const s = toSite({
      type: 'Feature',
      geometry: { type: 'MultiPolygon', coordinates: [[[[11.0, 59.0], [11.2, 59.0], [11.2, 59.2], [11.0, 59.2]]]] },
      properties: { navn: 'Batteritangen Søre Sandøy', kulturminneId: '1-2' },
    })
    expect(s?.name).toBe('Batteritangen Søndre Sandøy')
  })
})

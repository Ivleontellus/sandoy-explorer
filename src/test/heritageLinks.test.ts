import { describe, expect, it } from 'vitest'
import { coveredHeritageIds, heritageAt } from '../features/guide/heritageLinks'
import type { HeritageSite } from '../features/heritage/heritageApi'

const site = (id: string, centroid: [number, number], ring: number[][]): HeritageSite => ({
  id,
  name: id,
  info: '',
  category: 'L-ARK',
  art: '',
  protection: 'AUT',
  link: null,
  centroid,
  geometry: { type: 'MultiPolygon', coordinates: [[ring]] },
})

/** Kvadrat rundt (lat, lon) med halv side d grader. */
const square = (lat: number, lon: number, d: number) => [
  [lon - d, lat - d], [lon + d, lat - d], [lon + d, lat + d], [lon - d, lat + d], [lon - d, lat - d],
]

// Lite minne, ca. 55 x 110 m.
const varde = site('varde', [59.0, 11.0], square(59.0, 11.0, 0.0005))
// Stort kulturmiljø, flere hundre meter bredt.
const miljo = site('miljo', [59.02, 11.0], square(59.02, 11.0, 0.005))

describe('kulturminner på samme sted som historier', () => {
  it('kobler plassen til kulturminnet når den står ved midtpunktet', () => {
    expect(heritageAt([59.0001, 11.0001], [varde, miljo]).map((s) => s.id)).toEqual(['varde'])
  })

  it('kobler plassen når den står inne i et lite kulturminne, litt unna midtpunktet', () => {
    expect(heritageAt([59.0004, 11.0004], [varde]).map((s) => s.id)).toEqual(['varde'])
  })

  it('kobler ikke et løsfunn 35 m unna til en annen plass', () => {
    expect(heritageAt([59.0, 11.0006], [site('funn', [59.0, 11.0], square(59.0, 11.0, 0.00001))])).toEqual([])
  })

  it('kobler ikke plasser inne i et stort kulturmiljø', () => {
    expect(heritageAt([59.022, 11.002], [miljo])).toEqual([])
    expect([...coveredHeritageIds([{ position: [59.0, 11.0] }, { position: [59.022, 11.002] }], [varde, miljo])]).toEqual(['varde'])
  })
})

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

// Et lite kvadrat rundt (59.0, 11.0), ca. 110 x 60 m.
const square = [[10.9995, 58.9995], [11.0005, 58.9995], [11.0005, 59.0005], [10.9995, 59.0005], [10.9995, 58.9995]]
const varde = site('varde', [59.0, 11.0], square)
const langt = site('langt', [59.01, 11.0], square.map(([x, y]) => [x, y + 0.01]))

describe('kulturminner på samme sted som historier', () => {
  it('finner kulturminnet når plassen står nær midtpunktet', () => {
    expect(heritageAt([59.0002, 11.0001], [varde, langt]).map((s) => s.id)).toEqual(['varde'])
  })

  it('finner kulturminnet når plassen står inne i lokaliteten, langt fra midtpunktet', () => {
    expect(heritageAt([59.0004, 11.0004], [varde]).map((s) => s.id)).toEqual(['varde'])
  })

  it('lar kulturminner andre steder være', () => {
    expect(heritageAt([59.005, 11.0], [varde, langt])).toEqual([])
    expect([...coveredHeritageIds([{ position: [59.0, 11.0] }], [varde, langt])]).toEqual(['varde'])
  })
})

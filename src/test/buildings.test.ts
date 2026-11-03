import { describe, expect, it } from 'vitest'
import { PERIOD_LABELS, prettyName, toBuilding } from '../features/buildings/sefrakApi'

describe('SEFRAK-bygninger', () => {
  it('oversetter registerets store bokstaver og koder', () => {
    expect(prettyName('FJØS, HVALER.')).toBe('Fjøs, Hvaler')
    expect(prettyName('LÅVE/FJØS, RØD NORD')).toBe('Låve/Fjøs, Rød Nord')
    const b = toBuilding({
      type: 'Feature',
      id: 480528,
      geometry: { type: 'Point', coordinates: [11.1, 59.02] },
      properties: { objektnavn: 'FJØS, HVALER', sefrakId: '0111-0102-043', tidsangivelse: '184', sefrakStatus: 2, lengde: 1740, bredde: 500, yttervegg: '15' },
    })
    expect(b).toMatchObject({ id: '480528', name: 'Fjøs, Hvaler', status: 2, length: 17.4, width: 5, outerWall: '15', position: [59.02, 11.1] })
    expect(PERIOD_LABELS[b!.period!]).toBe('1875–1899')
  })

  it('hopper over objekter uten punktgeometri', () => {
    expect(toBuilding({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} })).toBeNull()
  })
})

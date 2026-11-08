// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { POI_CATEGORIES } from '../data/model'
import { GUIDE_SPOTS, GUIDE_TRAILS, resolveSpots } from '../features/guide/guide'
import { ISLAND_BOUNDS } from '../map/publicLayers'
import { loadRoute, PREF_KEY } from '../features/ferry/route'

/** Litt romsligere enn startvisningen: Nordre Sandøy skole ligger rett nord for øya. */
const inArea = ([lat, lon]: [number, number]) =>
  lat > ISLAND_BOUNDS[0][0] - 0.01 && lat < ISLAND_BOUNDS[1][0] + 0.01 && lon > ISLAND_BOUNDS[0][1] - 0.01 && lon < ISLAND_BOUNDS[1][1] + 0.01

describe('Kjente plasser og turruter', () => {
  it('har unike id-er, gyldige kategorier og ligger ved øya', () => {
    const ids = [...GUIDE_SPOTS.map((s) => s.id), ...GUIDE_TRAILS.map((t) => t.id)]
    expect(new Set(ids).size).toBe(ids.length)
    for (const s of GUIDE_SPOTS) {
      expect(POI_CATEGORIES[s.type], s.id).toBeDefined()
      // Makø er en vanlig dagstur fra øya, så kafeen der får ligge litt utenfor.
      const pos: [number, number] = s.id === 's-mako' ? [s.position[0] - 0.02, s.position[1]] : s.position
      expect(inArea(pos), `${s.id} ${s.position}`).toBe(true)
    }
  })

  it('brukerens flytting og skjuling endrer ikke kildedataene', () => {
    const first = GUIDE_SPOTS[0]
    const moved = resolveSpots({ [first.id]: [59.01, 11.07] }, [first.id])
    expect(moved[0]).toMatchObject({ position: [59.01, 11.07], moved: true, hidden: true })
    expect(GUIDE_SPOTS[0].position).toEqual(first.position)
    expect(resolveSpots({})[0]).toMatchObject({ moved: false, hidden: false })
  })
})

describe('Lagret fergerute', () => {
  it('faller tilbake til standard ved ugyldige data', () => {
    localStorage.setItem(PREF_KEY, '{"from":"skjaerhalden","to":"skjaerhalden"}')
    expect(loadRoute()).toEqual({ from: 'skjaerhalden', to: 'nedgarden' })
    localStorage.setItem(PREF_KEY, 'ikke json')
    expect(loadRoute().from).toBe('skjaerhalden')
    localStorage.setItem(PREF_KEY, '{"from":"lauer","to":"skjaerhalden"}')
    expect(loadRoute()).toEqual({ from: 'lauer', to: 'skjaerhalden' })
  })
})

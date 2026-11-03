import { describe, expect, it } from 'vitest'
import { departuresForDay, nextDepartures, selectTimetable } from '../features/ferry/ferry'
import { TIMETABLES, bookingUrl } from '../features/ferry/timetables'

// 2026-11-04 er en onsdag, 2026-11-07 en lørdag.
const wed = (h: number, m = 0) => new Date(2026, 10, 4, h, m)
const sat = (h: number, m = 0) => new Date(2026, 10, 7, h, m)
const table = TIMETABLES[0]

describe('Rutetabell', () => {
  it('velger høsttabellen for datoer etter 17. august, og markerer tidligere datoer som usikre', () => {
    expect(selectTimetable(wed(12))).toMatchObject({ timetable: { id: 'host-2026' }, stale: false })
    expect(selectTimetable(new Date(2026, 5, 1))?.stale).toBe(true)
  })

  it('Skjærhalden → Nedgården på hverdag følger PDF-en', () => {
    const times = departuresForDay(table, 'skjaerhalden', 'nedgarden', wed(0)).map((d) => `${d.departure.getHours()}${String(d.departure.getMinutes()).padStart(2, '0')}`)
    expect(times).toEqual(['515', '600', '650', '725', '810', '910', '1130', '1250', '1410', '1610', '1720', '1805', '1915', '2020', '2145'])
  })

  it('velger den direkte returen når Nedgården anløpes to ganger', () => {
    const d = departuresForDay(table, 'nedgarden', 'skjaerhalden', wed(0)).find((x) => x.departure.getHours() === 10)
    expect(d?.departure.getMinutes()).toBe(20)
    expect(d?.arrival.getHours()).toBe(10)
    expect(d?.arrival.getMinutes()).toBe(35)
    expect(d?.onRequest).toBe(false)
  })

  it('11:30-turen går Nedgården før Herføl, ikke kolonnerekkefølgen', () => {
    const d = departuresForDay(table, 'nedgarden', 'herfol', wed(0)).find((x) => x.departure.getHours() === 11)
    expect(d).toBeDefined()
    expect(d!.departure.getMinutes()).toBe(45)
    expect(d!.arrival.getMinutes()).toBe(55)
    expect(d!.onRequest).toBe(true)
  })

  it('bestillingsflagg følger med fra Makø', () => {
    const d = departuresForDay(table, 'skjaerhalden', 'mako', wed(0))
    expect(d.map((x) => x.departure.getHours())).toEqual([9, 14, 18, 20])
    expect(d.every((x) => x.onRequest)).toBe(true)
  })

  it('08:10 går bare lørdag; søndag starter 09:10', () => {
    const satList = departuresForDay(table, 'skjaerhalden', 'nedgarden', sat(0))
    expect(satList).toHaveLength(11)
    expect(satList[0].departure.getHours()).toBe(8)
    const sunList = departuresForDay(table, 'skjaerhalden', 'nedgarden', new Date(2026, 10, 8))
    expect(sunList).toHaveLength(10)
    expect(sunList[0].departure.getHours()).toBe(9)
  })

  it('neste avganger fortsetter inn i neste dag etter siste tur', () => {
    const next = nextDepartures('skjaerhalden', 'nedgarden', wed(22, 30), 2)
    expect(next).toHaveLength(2)
    expect(next[0].departure.getDate()).toBe(5)
    expect(next[0].departure.getHours()).toBe(5)
  })

  it('lager ferdig utfylt bestillingslenke', () => {
    const url = bookingUrl('skjaerhalden', 'nedgarden', '2026-11-04')
    expect(url).toContain('SearchDate=2026-11-04')
    expect(url).toContain('QuayFromId=NSR%3AQuay%3A3173')
    expect(url).toContain('QuayToId=NSR%3AQuay%3A3183')
  })
})

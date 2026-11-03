import { TIMETABLES, type DayType, type StopId, type Timetable, type Trip } from './timetables'

const pad = (n: number) => String(n).padStart(2, '0')
export const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** Dagtypene en tur må ha for å kjøre denne datoen. */
export function dayTypesOf(date: Date): DayType[] {
  const d = date.getDay()
  if (d === 6) return ['lor-son', 'lor']
  if (d === 0) return ['lor-son']
  return ['man-fre']
}

export interface TimetableChoice {
  timetable: Timetable
  /** true når ingen tabell dekker datoen og vi viser siste kjente. */
  stale: boolean
}

/** Velger tabellen som gjelder for datoen. Faller tilbake til siste kjente med stale-flagg. */
export function selectTimetable(date: Date, tables: Timetable[] = TIMETABLES): TimetableChoice | null {
  if (!tables.length) return null
  const day = isoDay(date)
  const sorted = [...tables].sort((a, b) => a.validFrom.localeCompare(b.validFrom))
  // Den siste tabellen som har startet gjelder, med mindre den har utløpt.
  let current: Timetable | null = null
  for (const t of sorted) if (t.validFrom <= day) current = t
  if (current && (!current.validTo || current.validTo >= day)) return { timetable: current, stale: false }
  return { timetable: current ?? sorted[0], stale: true }
}

export interface Departure {
  trip: Trip
  departure: Date
  arrival: Date
  /** Avgangs- eller ankomststoppet kjøres kun etter bestilling. */
  onRequest: boolean
  fromIndex: number
  toIndex: number
}

function at(day: Date, hhmm: string): Date {
  const d = new Date(day)
  d.setHours(Number(hhmm.slice(0, 2)), Number(hhmm.slice(2, 4)), 0, 0)
  return d
}

/** Alle avganger fra `from` til `to` en gitt dag, i tidsrekkefølge. */
export function departuresForDay(timetable: Timetable, from: StopId, to: StopId, day: Date): Departure[] {
  const dayTypes = dayTypesOf(day)
  const out: Departure[] = []
  for (const trip of timetable.trips) {
    if (!dayTypes.includes(trip.days)) continue
    const stops = trip.stops
    // Samme stopp kan anløpes to ganger på en rundtur (f.eks. Nedgården 09:35 og 10:20).
    // Velg den seneste avgangen fra `from` som fortsatt har `to` etter seg – det er den direkte reisen.
    let best: Departure | null = null
    for (let i = 0; i < stops.length; i++) {
      if (stops[i].stop !== from) continue
      const j = stops.findIndex((s, k) => k > i && s.stop === to)
      if (j === -1) continue
      best = {
        trip,
        departure: at(day, stops[i].time),
        arrival: at(day, stops[j].time),
        onRequest: !!stops[i].onRequest || !!stops[j].onRequest,
        fromIndex: i,
        toIndex: j,
      }
    }
    if (best) out.push(best)
  }
  return out.sort((a, b) => a.departure.getTime() - b.departure.getTime())
}

/** Neste `count` avganger fra tidspunktet `now`, om nødvendig fra dagen etter. */
export function nextDepartures(from: StopId, to: StopId, now: Date, count = 3, tables: Timetable[] = TIMETABLES): Departure[] {
  const out: Departure[] = []
  for (let offset = 0; offset < 2 && out.length < count; offset++) {
    const day = new Date(now)
    day.setDate(day.getDate() + offset)
    const choice = selectTimetable(day, tables)
    if (!choice) break
    for (const d of departuresForDay(choice.timetable, from, to, day)) {
      if (d.departure.getTime() >= now.getTime()) out.push(d)
      if (out.length >= count) break
    }
  }
  return out
}

export function minutesUntil(now: Date, then: Date): number {
  return Math.round((then.getTime() - now.getTime()) / 60000)
}

export function formatCountdown(min: number): string {
  if (min < 1) return 'nå'
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h} t ${m} min` : `${h} t`
}

export const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

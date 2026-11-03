import { useEffect, useState } from 'react'
import { SANDOY_CENTER } from '../../map/publicLayers'

/**
 * Tidevann fra Kartverkets «Se havnivå»-API (vannstand.kartverket.no). Åpne data,
 * krever kildehenvisning. Nærmeste stasjon for Hvaler er Viker.
 * Dokumentasjon: https://vannstand.kartverket.no/tideapi_no.html
 */

export const TIDE_ATTRIBUTION = 'Tidevann: Kartverket (Viker)'
const BASE = 'https://vannstand.kartverket.no/tideapi.php'
const CACHE_PREFIX = 'sandoy-explorer:tide:'

export interface TideEvent {
  time: Date
  /** Vannstand i cm over sjøkartnull (CD). */
  level: number
  flag: 'high' | 'low'
}

const pad = (n: number) => String(n).padStart(2, '0')
const localDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** Parser XML-svaret med <waterlevel value time flag>. Eksportert for tester. */
export function parseTideXml(xml: string): TideEvent[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const err = doc.getElementsByTagName('error')[0]
  if (err) throw new Error(err.textContent || 'Ukjent feil fra tidevannstjenesten')
  return Array.from(doc.getElementsByTagName('waterlevel'))
    .map((el) => ({
      time: new Date(el.getAttribute('time') ?? ''),
      level: Number(el.getAttribute('value')),
      flag: el.getAttribute('flag') as TideEvent['flag'],
    }))
    .filter((e) => !isNaN(e.time.getTime()) && (e.flag === 'high' || e.flag === 'low'))
}

/** Høy- og lavvann for dagen `day` pluss dagen etter, så «neste» alltid finnes sent på kvelden. */
export async function fetchTides(day: Date, lat = SANDOY_CENTER[0], lon = SANDOY_CENTER[1]): Promise<TideEvent[]> {
  const key = `${CACHE_PREFIX}${localDay(day)}`
  try {
    const cached = sessionStorage.getItem(key)
    if (cached) return (JSON.parse(cached) as { t: string; l: number; f: TideEvent['flag'] }[]).map((e) => ({ time: new Date(e.t), level: e.l, flag: e.f }))
  } catch {
    /* ignorer ødelagt cache */
  }

  const from = new Date(day)
  from.setHours(0, 0, 0, 0)
  const to = new Date(from)
  to.setDate(to.getDate() + 2)
  const params = new URLSearchParams({
    lat: lat.toFixed(4),
    lon: lon.toFixed(4),
    fromtime: `${localDay(from)}T00:00`,
    totime: `${localDay(to)}T00:00`,
    datatype: 'tab',
    refcode: 'cd',
    lang: 'nb',
    interval: '60',
    dst: '0',
    tzone: '',
    tide_request: 'locationdata',
  })
  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) throw new Error(`Tidevannstjenesten svarte ${res.status}`)
  const events = parseTideXml(await res.text())
  try {
    sessionStorage.setItem(key, JSON.stringify(events.map((e) => ({ t: e.time.toISOString(), l: e.level, f: e.flag }))))
  } catch {
    /* lagring kan være blokkert */
  }
  return events
}

export interface TideState {
  events: TideEvent[]
  loading: boolean
  error: string | null
}

export function useTides(day: Date): TideState {
  const dayKey = localDay(day)
  const [state, setState] = useState<TideState>({ events: [], loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))
    fetchTides(new Date(dayKey + 'T12:00:00'))
      .then((events) => !cancelled && setState({ events, loading: false, error: null }))
      .catch((e: Error) => !cancelled && setState({ events: [], loading: false, error: e.message || 'Ikke tilgjengelig' }))
    return () => {
      cancelled = true
    }
  }, [dayKey])

  return state
}

/** Forrige og neste høy-/lavvann rundt et tidspunkt. */
export function tidesAround(events: TideEvent[], at: Date): { previous?: TideEvent; next?: TideEvent } {
  const t = at.getTime()
  let previous: TideEvent | undefined
  let next: TideEvent | undefined
  for (const e of events) {
    if (e.time.getTime() <= t) previous = e
    else if (!next) next = e
  }
  return { previous, next }
}

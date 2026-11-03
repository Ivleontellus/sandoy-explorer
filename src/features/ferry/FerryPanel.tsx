import { useEffect, useState } from 'react'
import { departuresForDay, formatCountdown, hhmm, isoDay, minutesUntil, nextDepartures, selectTimetable, type Departure } from './ferry'
import { BOOKING_PHONE, STOPS, STOP_ORDER, bookingUrl, type StopId } from './timetables'

const PREF_KEY = 'sandoy-explorer:ferry:route'

export interface FerryRoute {
  from: StopId
  to: StopId
}

export const DEFAULT_ROUTE: FerryRoute = { from: 'skjaerhalden', to: 'nedgarden' }

export function loadRoute(): FerryRoute {
  try {
    const r = JSON.parse(localStorage.getItem(PREF_KEY) ?? '')
    if (r && r.from in STOPS && r.to in STOPS && r.from !== r.to) return r
  } catch {
    /* ingen lagret rute */
  }
  return DEFAULT_ROUTE
}

interface Props {
  route: FerryRoute
  onRoute: (r: FerryRoute) => void
}

export function FerryPanel({ route, onRoute }: Props) {
  const [now, setNow] = useState(() => new Date())
  const [day, setDay] = useState(() => isoDay(new Date()))
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(route))
    } catch {
      /* lagring kan være blokkert */
    }
  }, [route])

  const isToday = day === isoDay(now)
  const dayDate = new Date(day + 'T12:00:00')
  const choice = selectTimetable(dayDate)
  const list: Departure[] = !choice
    ? []
    : showAll || !isToday
      ? departuresForDay(choice.timetable, route.from, route.to, dayDate)
      : nextDepartures(route.from, route.to, now, 4)

  const setStop = (key: keyof FerryRoute, id: StopId) => {
    const next = { ...route, [key]: id }
    if (next.from === next.to) {
      // Bytt plass så ruta alltid er gyldig.
      onRoute({ from: route.to, to: route.from })
    } else onRoute(next)
  }

  return (
    <div className="panel-section ferry">
      <div className="route-picker">
        <label className="field">
          Fra
          <select value={route.from} onChange={(e) => setStop('from', e.target.value as StopId)}>
            {STOP_ORDER.map((id) => (
              <option key={id} value={id}>{STOPS[id].name}</option>
            ))}
          </select>
        </label>
        <button type="button" className="icon swap" aria-label="Bytt retning" onClick={() => onRoute({ from: route.to, to: route.from })}>
          ⇅
        </button>
        <label className="field">
          Til
          <select value={route.to} onChange={(e) => setStop('to', e.target.value as StopId)}>
            {STOP_ORDER.map((id) => (
              <option key={id} value={id}>{STOPS[id].name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="row ferry-day">
        <label className="field">
          Dato
          <input type="date" value={day} onChange={(e) => e.target.value && setDay(e.target.value)} />
        </label>
        {isToday ? (
          <button type="button" className="link" onClick={() => setShowAll((s) => !s)}>
            {showAll ? 'Bare neste' : 'Hele dagen'}
          </button>
        ) : (
          <button type="button" className="link" onClick={() => setDay(isoDay(now))}>I dag</button>
        )}
      </div>

      {choice?.stale && (
        <p className="warning">
          Ingen rutetabell dekker denne datoen. Viser {choice.timetable.label} – sjekk ostfold-kollektiv.no for gjeldende tider.
        </p>
      )}

      {list.length === 0 ? (
        <p className="hint">Ingen flere avganger {isToday && !showAll ? 'i dag eller i morgen' : 'denne dagen'} for denne strekningen.</p>
      ) : (
        <ul className="departures">
          {list.map((d) => {
            const mins = minutesUntil(now, d.departure)
            const tomorrow = isoDay(d.departure) !== day
            return (
              <li key={d.departure.toISOString()} className={mins < 0 && isToday ? 'past' : ''}>
                <div className="dep-time">
                  <strong>{hhmm(d.departure)}</strong>
                  <span className="muted">→ {hhmm(d.arrival)}</span>
                </div>
                <div className="dep-info">
                  {isToday && !showAll && <span className="countdown">{tomorrow ? 'i morgen' : formatCountdown(mins)}</span>}
                  {d.onRequest && (
                    <a className="badge request" href={bookingUrl(route.from, route.to, isoDay(d.departure))} target="_blank" rel="noreferrer">
                      må bestilles ↗
                    </a>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {choice && (
        <>
          <div className="booking-box">
            <strong>Bestilling</strong>
            <p>
              Avganger merket «må bestilles» kjøres bare hvis noen har bestilt, senest 1 time før avgang fra Skjærhalden.
              Bil og henger må alltid bestilles. Passasjerer uten bil trenger ikke bestille på faste avganger.
            </p>
            <div className="actions wrap">
              <a className="button primary" href={bookingUrl(route.from, route.to, day)} target="_blank" rel="noreferrer">
                Bestill {STOPS[route.from].name} → {STOPS[route.to].name} ↗
              </a>
              <a className="button" href={`tel:${BOOKING_PHONE.replace(/\s/g, '')}`}>☎ {BOOKING_PHONE}</a>
            </div>
            <p className="hint">Lenken åpner bestillingssiden med strekning og dato ferdig utfylt. Selve bestillingen krever innlogging med telefonnummer der.</p>
          </div>
          <details className="notes">
            <summary>{choice.timetable.label} · gyldig fra {choice.timetable.validFrom}</summary>
            <ul>
              {choice.timetable.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <a href={choice.timetable.sourceUrl} target="_blank" rel="noreferrer">Original rutetabell (PDF)</a>
          </details>
        </>
      )}
    </div>
  )
}

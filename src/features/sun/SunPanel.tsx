import { useState } from 'react'
import { TIDE_ATTRIBUTION, useTides } from '../tide/tideApi'
import { compassName, sunPosition, sunTimes } from './sun'

interface Props {
  enabled: boolean
  onEnabled: (v: boolean) => void
  date: Date
  onDate: (d: Date) => void
  lat: number
  lon: number
}

const pad = (n: number) => String(n).padStart(2, '0')
const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fmtTime = (d: Date | null) => (!d || isNaN(d.getTime()) ? '–' : `${pad(d.getHours())}:${pad(d.getMinutes())}`)

export function SunPanel({ enabled, onEnabled, date, onDate, lat, lon }: Props) {
  const pos = sunPosition(date, lat, lon)
  const times = sunTimes(date, lat, lon)
  const minutes = date.getHours() * 60 + date.getMinutes()
  const tides = useTides(date)
  const [today] = useState(() => toDateInput(new Date()))
  const sameDay = (d: Date) => d.toDateString() === date.toDateString()

  const setDay = (value: string) => {
    const [y, m, d] = value.split('-').map(Number)
    if (!y) return
    const n = new Date(date)
    n.setFullYear(y, m - 1, d)
    onDate(n)
  }
  const setMinutes = (v: number) => {
    const n = new Date(date)
    n.setHours(Math.floor(v / 60), v % 60, 0, 0)
    onDate(n)
  }

  return (
    <div className="panel-section">
      <label className="toggle">
        <input type="checkbox" checked={enabled} onChange={(e) => onEnabled(e.target.checked)} />
        Vis solretning i kartet
      </label>

      <div className="row">
        <label className="field">
          Dato
          <input type="date" value={toDateInput(date)} onChange={(e) => setDay(e.target.value)} />
        </label>
        <label className="field">
          Klokkeslett
          <input
            type="time"
            value={`${pad(date.getHours())}:${pad(date.getMinutes())}`}
            onChange={(e) => {
              const [h, m] = e.target.value.split(':').map(Number)
              if (!isNaN(h)) setMinutes(h * 60 + (m || 0))
            }}
          />
        </label>
      </div>
      <input
        type="range"
        className="time-slider"
        min={0}
        max={1439}
        step={5}
        value={minutes}
        onChange={(e) => setMinutes(Number(e.target.value))}
        aria-label="Tid på døgnet"
      />
      <button className="link" onClick={() => onDate(new Date())}>Nå</button>

      <div className="sun-stats">
        <div className="sun-compass" aria-hidden>
          <div className="needle" style={{ transform: `rotate(${pos.azimuthDeg}deg)` }} />
          <span className="n">N</span>
        </div>
        <dl>
          <dt>Retning</dt>
          <dd>
            {Math.round(pos.azimuthDeg)}° ({compassName(pos.azimuthDeg)})
          </dd>
          <dt>Høyde</dt>
          <dd className={pos.altitudeDeg <= 0 ? 'muted' : ''}>
            {pos.altitudeDeg.toFixed(1)}° {pos.altitudeDeg <= 0 ? '– under horisonten' : ''}
          </dd>
          <dt>Soloppgang</dt>
          <dd>{fmtTime(times.sunrise)}</dd>
          <dt>Solnedgang</dt>
          <dd>{fmtTime(times.sunset)}</dd>
        </dl>
      </div>
      <h3>Tidevann {toDateInput(date) === today ? 'i dag' : toDateInput(date)}</h3>
      {tides.loading && <p className="muted">Henter …</p>}
      {tides.error && <p className="muted">Ikke tilgjengelig ({tides.error})</p>}
      {!tides.loading && !tides.error && (
        <ul className="tide-list">
          {tides.events.filter((e) => sameDay(e.time)).map((e) => (
            <li key={e.time.toISOString()} className={e.time <= date ? 'past' : ''}>
              <span className={`tide-flag ${e.flag}`}>{e.flag === 'high' ? '▲ Høyvann' : '▼ Lavvann'}</span>
              <span>{fmtTime(e.time)}</span>
              <span className="muted">{e.level.toFixed(0)} cm</span>
            </li>
          ))}
        </ul>
      )}
      <p className="hint">
        {TIDE_ATTRIBUTION}, vannstand over sjøkartnull. Solberegning for Søndre Sandøy i enhetens lokale tid. Pila i kartet følger kartets midtpunkt. Terreng og vegetasjon er ikke med i beregningen ennå.
      </p>
    </div>
  )
}

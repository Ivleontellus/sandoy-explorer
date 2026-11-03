import { useEffect, useState } from 'react'
import { DAYPARTS, TIDE_PREFS, type BestTimes } from '../../data/model'
import { compassName, sunPosition, sunTimes } from '../sun/sun'
import { TIDE_ATTRIBUTION, tidesAround, useTides } from '../tide/tideApi'
import { matchesBestTime } from './bestTime'

const pad = (n: number) => String(n).padStart(2, '0')
const hhmm = (d: Date | null | undefined) => (!d || isNaN(d.getTime()) ? '–' : `${pad(d.getHours())}:${pad(d.getMinutes())}`)

function relative(from: Date, to: Date): string {
  const min = Math.round((to.getTime() - from.getTime()) / 60000)
  if (min < 60) return `om ${min} min`
  const h = Math.floor(min / 60)
  return `om ${h} t ${min % 60} min`
}

/** Live forhold for en plass: brukerens «beste tid», sola nå og neste tidevann. */
export function PlaceConditions({ lat, lon, bestTimes }: { lat: number; lon: number; bestTimes?: BestTimes }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const tides = useTides(now)
  const sun = sunPosition(now, lat, lon)
  const times = sunTimes(now, lat, lon)
  const { previous, next } = tidesAround(tides.events, now)
  const verdict = matchesBestTime(bestTimes, now, tides.loading ? null : tides.events)
  const hasBest = !!bestTimes && (bestTimes.daypart.length > 0 || bestTimes.tide.length > 0 || !!bestTimes.note)

  return (
    <div className="conditions">
      {hasBest && (
        <div className="best-times">
          <div className="chips">
            {bestTimes!.daypart.map((d) => (
              <span key={d} className="chip static">{DAYPARTS[d].label}</span>
            ))}
            {bestTimes!.tide.map((t) => (
              <span key={t} className="chip static tide">{TIDE_PREFS[t]}</span>
            ))}
            {verdict.matches !== null && (
              <span className={`chip verdict ${verdict.matches ? 'ok' : 'no'}`}>{verdict.matches ? '✓ Passer nå' : 'Passer ikke nå'}</span>
            )}
          </div>
          {bestTimes!.note && <p className="muted">{bestTimes!.note}</p>}
        </div>
      )}

      <dl className="cond-grid">
        <dt>☀ Sol nå</dt>
        <dd>
          {sun.altitudeDeg > 0 ? `${Math.round(sun.azimuthDeg)}° (${compassName(sun.azimuthDeg)}), ${sun.altitudeDeg.toFixed(0)}° høy` : 'Under horisonten'}
          <span className="muted"> · opp {hhmm(times.sunrise)} · ned {hhmm(times.sunset)}</span>
        </dd>
        <dt>〰 Tidevann</dt>
        <dd>
          {tides.loading && 'Henter …'}
          {tides.error && <span className="muted">Ikke tilgjengelig ({tides.error})</span>}
          {!tides.loading && !tides.error && (
            <>
              {previous && (
                <span>
                  Sist {previous.flag === 'high' ? 'høyvann' : 'lavvann'} {hhmm(previous.time)}
                </span>
              )}
              {next && (
                <span>
                  {previous ? ' · ' : ''}Neste {next.flag === 'high' ? 'høyvann' : 'lavvann'} {hhmm(next.time)} ({relative(now, next.time)})
                </span>
              )}
            </>
          )}
        </dd>
      </dl>
      <p className="hint">{TIDE_ATTRIBUTION}. Terreng og vær er ikke med i beregningen.</p>
    </div>
  )
}

import { DAYPARTS, type BestTimes, type Daypart, type TidePreference } from '../../data/model'
import type { TideEvent } from '../tide/tideApi'
import { tidesAround } from '../tide/tideApi'

/** Hvor nær (i timer) et høy-/lavvann klokkeslettet må være for å «treffe». */
export const TIDE_WINDOW_HOURS = 2

export function currentDaypart(date: Date): Daypart | null {
  const h = date.getHours() + date.getMinutes() / 60
  for (const [id, d] of Object.entries(DAYPARTS) as [Daypart, (typeof DAYPARTS)[Daypart]][]) {
    if (h >= d.fromHour && h < d.toHour) return id
  }
  return null
}

/** Hvilken tidevannsfase (høy/lav) som er innenfor vinduet nå, om noen. */
export function currentTidePhase(events: TideEvent[], at: Date): TidePreference | null {
  const { previous, next } = tidesAround(events, at)
  const windowMs = TIDE_WINDOW_HOURS * 3600_000
  const t = at.getTime()
  const near = [previous, next].find((e) => e && Math.abs(e.time.getTime() - t) <= windowMs)
  if (!near) return null
  return near.flag === 'high' ? 'hoyvann' : 'lavvann'
}

export interface BestTimeMatch {
  /** true = alle valgte kriterier treffer nå. null = ikke nok data (f.eks. tidevann ikke lastet). */
  matches: boolean | null
  daypartOk: boolean | null
  tideOk: boolean | null
}

/**
 * Vurderer om «nå» passer med brukerens valgte beste tidspunkt.
 * Kriterier brukeren ikke har valgt teller som oppfylt. Mangler tidevannsdata
 * for et valgt tidevannskriterium, er svaret ukjent (null).
 */
export function matchesBestTime(best: BestTimes | undefined, at: Date, tides: TideEvent[] | null): BestTimeMatch {
  if (!best || (!best.daypart.length && !best.tide.length)) return { matches: null, daypartOk: null, tideOk: null }

  const daypartOk = best.daypart.length ? best.daypart.includes(currentDaypart(at) as Daypart) : true

  let tideOk: boolean | null = true
  if (best.tide.length) {
    if (!tides || !tides.length) tideOk = null
    else {
      const phase = currentTidePhase(tides, at)
      tideOk = phase !== null && best.tide.includes(phase)
    }
  }

  const matches = tideOk === null ? (daypartOk ? null : false) : daypartOk && tideOk
  return { matches, daypartOk: best.daypart.length ? daypartOk : null, tideOk: best.tide.length ? tideOk : null }
}

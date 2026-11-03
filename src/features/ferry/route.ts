import { STOPS, type StopId } from './timetables'

export const PREF_KEY = 'sandoy-explorer:ferry:route'

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


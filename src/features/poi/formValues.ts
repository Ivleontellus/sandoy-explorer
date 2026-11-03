import type { BestTimes, PoiCategory } from '../../data/model'

export interface PoiFormValues {
  category: PoiCategory
  name: string
  description: string
  /** Stedets egen nettside (valgfritt). */
  website?: string
  lat: number
  lon: number
  sensitive: boolean
  shareable: boolean
  bestTimes: BestTimes
}

export const EMPTY_BEST_TIMES: BestTimes = { daypart: [], tide: [] }

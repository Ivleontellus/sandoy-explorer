import { POI_CATEGORIES, type MapFeature, type PoiCategory } from '../data/model'

/** Tema-lag som kan slås av og på. Hvert lag styrer både private registreringer og evt. offentlige overlegg. */
export type ThemeLayerId = 'stier' | 'spor' | PoiCategory

export interface ThemeLayer {
  id: ThemeLayerId
  label: string
  color: string
}

export const THEME_LAYERS: ThemeLayer[] = [
  { id: 'stier', label: 'Stier', color: '#1f4d3a' },
  { id: 'spor', label: 'GPS-spor (rådata)', color: '#e65100' },
  ...(Object.entries(POI_CATEGORIES) as [PoiCategory, (typeof POI_CATEGORIES)[PoiCategory]][]).map(([id, c]) => ({
    id,
    label: c.label,
    color: c.color,
  })),
]

export type LayerVisibility = Record<ThemeLayerId, boolean>

export const DEFAULT_VISIBILITY: LayerVisibility = Object.fromEntries(
  THEME_LAYERS.map((l) => [l.id, true]),
) as LayerVisibility

export function themeOf(f: MapFeature): ThemeLayerId {
  switch (f.properties.kind) {
    case 'path':
      return 'stier'
    case 'track':
      return 'spor'
    case 'poi':
      return f.properties.category
  }
}

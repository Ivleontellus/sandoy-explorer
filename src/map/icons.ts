import L from 'leaflet'
import { POI_CATEGORIES, type PoiCategory } from '../data/model'

const cache = new Map<string, L.DivIcon>()

/** Egne div-ikoner per kategori, slik at vi slipper Leaflets standard-PNG-ikoner. */
export function poiIcon(category: PoiCategory, sensitive: boolean, selected: boolean): L.DivIcon {
  const key = `${category}|${sensitive}|${selected}`
  let icon = cache.get(key)
  if (!icon) {
    const c = POI_CATEGORIES[category]
    icon = L.divIcon({
      className: 'poi-icon-wrap',
      html: `<div class="poi-icon${selected ? ' selected' : ''}" style="--c:${c.color}">
        <span>${c.symbol}</span>${sensitive ? '<i class="lock" title="Sårbar">🔒</i>' : ''}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })
    cache.set(key, icon)
  }
  return icon
}

const heritageIcons = [false, true].map((selected) =>
  L.divIcon({
    className: 'heritage-icon-wrap',
    html: `<div class="heritage-icon${selected ? ' selected' : ''}">⚑</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  }),
)
export const heritageIcon = (selected: boolean) => heritageIcons[selected ? 1 : 0]

const guideCache = new Map<string, L.DivIcon>()
/** Kjente plasser fra turkartet: samme symbol som kategorien, men hul/gjennomsiktig stil for å skille fra egne punkter. */
export function guideIcon(type: PoiCategory, selected: boolean, uncertain = false): L.DivIcon {
  const key = `${type}|${selected}|${uncertain}`
  let icon = guideCache.get(key)
  if (!icon) {
    const c = POI_CATEGORIES[type]
    icon = L.divIcon({
      className: 'guide-icon-wrap',
      html: `<div class="guide-icon${selected ? ' selected' : ''}${uncertain ? ' uncertain' : ''}" style="--c:${c.color}"><span>${c.symbol}</span>${uncertain ? '<i class="q">?</i>' : ''}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    })
    guideCache.set(key, icon)
  }
  return icon
}

export const ferryIcon = L.divIcon({
  className: 'ferry-icon-wrap',
  html: '<div class="ferry-icon">⛴</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

export const sunIcon = L.divIcon({
  className: 'sun-icon-wrap',
  html: '<div class="sun-icon">☀</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

export const meIcon = L.divIcon({
  className: 'me-icon-wrap',
  html: '<div class="me-icon"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

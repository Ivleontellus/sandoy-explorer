import { haversine } from '../details/geo'
import type { HeritageSite } from '../heritage/heritageApi'

/** Så nær må en kjent plass ligge et kulturminne for at de regnes som samme sted. */
export const LINK_RADIUS_M = 40

function insideRing(lat: number, lon: number, ring: number[][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function insideSite([lat, lon]: [number, number], site: HeritageSite): boolean {
  const polygons = site.geometry.type === 'Polygon' ? [site.geometry.coordinates] : site.geometry.coordinates
  return polygons.some((p) => insideRing(lat, lon, p[0]))
}

/** Kulturminner som ligger der plassen står: i lokaliteten eller nær midtpunktet. */
export function heritageAt(position: [number, number], sites: HeritageSite[]): HeritageSite[] {
  return sites.filter(
    (s) =>
      haversine([position[1], position[0]], [s.centroid[1], s.centroid[0]]) <= LINK_RADIUS_M ||
      insideSite(position, s),
  )
}

/**
 * Kulturminner som allerede har en historie eller plass på samme sted. Kartet viser da bare
 * historiemerket (kulturminnet nås fra historien), så merkene ikke legger seg oppå hverandre.
 */
export function coveredHeritageIds(spots: { position: [number, number] }[], sites: HeritageSite[]): Set<string> {
  const ids = new Set<string>()
  for (const spot of spots) for (const s of heritageAt(spot.position, sites)) ids.add(s.id)
  return ids
}

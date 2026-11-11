import { haversine } from '../details/geo'
import type { HeritageSite } from '../heritage/heritageApi'

/** Så nær midtpunktet må en kjent plass ligge for at den regnes som samme sted som kulturminnet. */
export const LINK_RADIUS_M = 20
/**
 * Plassen kan også ligge inne i selve lokaliteten, men bare når den er liten (ett minne, ikke et
 * helt kulturmiljø som Gravningsund). Målt som lengste avstand fra midtpunktet til omrisset.
 */
export const SMALL_SITE_M = 80

const dist = (a: [number, number], b: [number, number]) => haversine([a[1], a[0]], [b[1], b[0]])

function rings(site: HeritageSite): number[][][] {
  return site.geometry.type === 'Polygon' ? [site.geometry.coordinates[0]] : site.geometry.coordinates.map((p) => p[0])
}

function insideRing(lat: number, lon: number, ring: number[][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function isSmall(site: HeritageSite): boolean {
  return rings(site).every((r) => r.every(([lon, lat]) => dist(site.centroid, [lat, lon]) <= SMALL_SITE_M))
}

/** Kulturminner som ligger der plassen står: helt ved midtpunktet, eller inne i et lite kulturminne. */
export function heritageAt(position: [number, number], sites: HeritageSite[]): HeritageSite[] {
  return sites.filter(
    (s) =>
      dist(position, s.centroid) <= LINK_RADIUS_M ||
      (isSmall(s) && rings(s).some((r) => insideRing(position[0], position[1], r))),
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

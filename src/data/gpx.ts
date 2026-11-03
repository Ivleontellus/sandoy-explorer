import { gpx } from '@tmcw/togeojson'
import type { LineString, MultiLineString, Position } from 'geojson'
import { baseProps, type TrackFeature } from './model'

/**
 * Leser en GPX-fil (f.eks. eksportert fra Radiacode) og returnerer GPS-spor.
 * Sporene blir ALDRI automatisk til stier – de er rådata som brukeren selv kan
 * velge å lage et sti-utkast fra.
 */
export function parseGpx(text: string, fileName: string): TrackFeature[] {
  const doc = new DOMParser().parseFromString(text, 'application/xml')
  if (doc.getElementsByTagName('parsererror').length > 0) throw new Error('Kunne ikke lese GPX-fila (ugyldig XML)')
  const creator = doc.documentElement.getAttribute('creator') ?? undefined

  const fc = gpx(doc)
  const tracks: TrackFeature[] = []

  for (const f of fc.features) {
    const g = f.geometry
    if (!g) continue
    const props = (f.properties ?? {}) as Record<string, unknown>
    const name = typeof props.name === 'string' && props.name ? props.name : fileName.replace(/\.gpx$/i, '')

    let geometry: LineString | MultiLineString | null = null
    if (g.type === 'LineString' && g.coordinates.length >= 2) geometry = g
    else if (g.type === 'MultiLineString') {
      const parts = g.coordinates.filter((c: Position[]) => c.length >= 2)
      if (parts.length === 1) geometry = { type: 'LineString', coordinates: parts[0] }
      else if (parts.length > 1) geometry = { type: 'MultiLineString', coordinates: parts }
    }
    if (!geometry) continue // Enkeltpunkter (waypoints) ignoreres i denne fasen.

    const cp = props.coordinateProperties as Record<string, unknown> | undefined
    const { times, ...otherPointProps } = cp ?? {}

    tracks.push({
      type: 'Feature',
      geometry,
      properties: {
        ...baseProps('track', name),
        kind: 'track',
        description: typeof props.desc === 'string' ? props.desc : '',
        source: { type: 'gpx', fileName, creator },
        times: Array.isArray(times) ? (times.flat() as string[]) : undefined,
        pointExtensions: Object.keys(otherPointProps).length ? otherPointProps : undefined,
      },
    })
  }

  if (tracks.length === 0) throw new Error('Fant ingen spor i GPX-fila')
  return tracks
}

/** Første linjestykke av et spor, brukt når brukeren lager et sti-utkast fra sporet. */
export function trackToLine(track: TrackFeature): Position[] {
  const g = track.geometry
  return g.type === 'LineString' ? g.coordinates : g.coordinates.flat()
}

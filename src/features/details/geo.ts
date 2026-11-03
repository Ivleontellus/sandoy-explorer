import type { LineString, MultiLineString, Position } from 'geojson'

const R = 6371000
const rad = (d: number) => (d * Math.PI) / 180

export function haversine(a: Position, b: Position): number {
  const dLat = rad(b[1] - a[1])
  const dLon = rad(b[0] - a[0])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function lineLengthMeters(g: LineString | MultiLineString): number {
  const lines = g.type === 'LineString' ? [g.coordinates] : g.coordinates
  let sum = 0
  for (const line of lines) for (let i = 1; i < line.length; i++) sum += haversine(line[i - 1], line[i])
  return sum
}

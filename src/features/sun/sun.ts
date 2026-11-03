import { getPosition, getTimes } from 'suncalc'

export interface SunPosition {
  /** Kompassretning i grader fra nord, med klokka (0 = nord, 90 = øst). */
  azimuthDeg: number
  /** Høyde over horisonten i grader. Negativ = under horisonten. */
  altitudeDeg: number
}

const RAD = 180 / Math.PI

export function sunPosition(date: Date, lat: number, lon: number): SunPosition {
  // SunCalc 2.x gir grader: asimut med klokka fra nord, høyde refraksjonskorrigert.
  const p = getPosition(date, lat, lon)
  return { azimuthDeg: ((p.azimuth % 360) + 360) % 360, altitudeDeg: p.altitude }
}

export function sunTimes(date: Date, lat: number, lon: number) {
  const t = getTimes(date, lat, lon)
  return { sunrise: t.sunrise, sunset: t.sunset, solarNoon: t.solarNoon }
}

const DIRECTIONS = ['N', 'NNØ', 'NØ', 'ØNØ', 'Ø', 'ØSØ', 'SØ', 'SSØ', 'S', 'SSV', 'SV', 'VSV', 'V', 'VNV', 'NV', 'NNV']

export function compassName(deg: number): string {
  return DIRECTIONS[Math.round(deg / 22.5) % 16]
}

/** Punkt i gitt kompassretning og avstand (meter) fra start, enkel sfærisk tilnærming. */
export function destination(lat: number, lon: number, bearingDeg: number, meters: number): [number, number] {
  const R = 6371000
  const d = meters / R
  const b = bearingDeg / RAD
  const la1 = lat / RAD
  const lo1 = lon / RAD
  const la2 = Math.asin(Math.sin(la1) * Math.cos(d) + Math.cos(la1) * Math.sin(d) * Math.cos(b))
  const lo2 = lo1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(la1), Math.cos(d) - Math.sin(la1) * Math.sin(la2))
  return [la2 * RAD, lo2 * RAD]
}

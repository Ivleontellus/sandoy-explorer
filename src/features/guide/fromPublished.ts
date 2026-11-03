import type { MapFeature } from '../../data/model'
import { lineLengthMeters } from '../details/geo'
import { GUIDE_TRAILS, type GuideSpot, type GuideTrail } from './guide'

/**
 * Det publiserte datasettet (det administratoren publiserer fra appen) vises som en del av
 * «Kjente plasser» og «Kjente turruter», ikke som et eget lag. Punkter blir plasser i riktig
 * gruppe; stier blir turruter, og en sti som erstatter en kjent rute skjuler den gamle linja.
 */

const PUBLISHED_TRAIL_COLOR = '#b71c1c'

export function publishedSpots(features: MapFeature[]): GuideSpot[] {
  const out: GuideSpot[] = []
  for (const f of features) {
    if (f.properties.kind !== 'poi' || f.geometry.type !== 'Point') continue
    const p = f.properties
    out.push({
      id: p.id,
      name: p.name,
      type: p.category,
      position: [f.geometry.coordinates[1], f.geometry.coordinates[0]],
      ...(p.description ? { note: p.description } : {}),
      ...(p.website ? { website: p.website } : {}),
      ...(p.bestTimes ? { bestTimes: p.bestTimes } : {}),
      ...(p.photos?.length ? { photos: p.photos } : {}),
      source: 'Sandøy Explorer',
      published: true,
    })
  }
  return out
}

/** Kjente turruter med publiserte stier lagt til, og ruter som er erstattet tatt bort. */
export function mergedTrails(features: MapFeature[]): GuideTrail[] {
  const published: GuideTrail[] = []
  const replaced = new Set<string>()
  for (const f of features) {
    if (f.properties.kind !== 'path' || f.geometry.type !== 'LineString') continue
    const p = f.properties
    const base = p.replacesTrail ? GUIDE_TRAILS.find((t) => t.id === p.replacesTrail) : undefined
    if (base) replaced.add(base.id)
    published.push({
      id: p.id,
      name: p.name,
      color: base?.color ?? PUBLISHED_TRAIL_COLOR,
      lengthKm: Math.round(lineLengthMeters(f.geometry) / 100) / 10,
      description: p.description || base?.description || '',
      via: base?.via ?? [],
      geometry: f.geometry,
      published: true,
    })
  }
  return [...GUIDE_TRAILS.filter((t) => !replaced.has(t.id)), ...published]
}

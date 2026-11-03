import type { Feature } from 'geojson'
import {
  isSensitive,
  newId,
  normalizeCategory,
  nowIso,
  type BestTimes,
  type MapFeature,
  type MapFeatureCollection,
} from './model'

export const EXPORT_APP_ID = 'sandoy-explorer'
export const EXPORT_VERSION = 1

export type ExportMode = 'backup' | 'shareable'

/**
 * backup    – alt, inkludert sårbare registreringer. Kun for egen sikkerhetskopi.
 * shareable – bare objekter brukeren har merket som delbare, og aldri sårbare.
 */
export function buildExport(features: MapFeature[], mode: ExportMode): MapFeatureCollection & Record<string, unknown> {
  const selected = mode === 'backup' ? features : features.filter((f) => f.properties.shareable && !isSensitive(f))
  return {
    type: 'FeatureCollection',
    app: EXPORT_APP_ID,
    version: EXPORT_VERSION,
    exportMode: mode,
    exportedAt: nowIso(),
    features: selected,
  }
}

export function downloadJson(data: unknown, fileName: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/geo+json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export interface ImportResult {
  features: MapFeature[]
  skipped: number
}

/**
 * Leser GeoJSON fra Sandøy Explorer eller andre kilder. Fremmede objekter normaliseres:
 * punkter blir interessepunkter (kategori "annet"), linjer blir sti-UTKAST – aldri godkjente stier.
 */
export function parseGeoJsonImport(text: string): ImportResult {
  const data = JSON.parse(text)
  const raw: Feature[] =
    data?.type === 'FeatureCollection' ? data.features : data?.type === 'Feature' ? [data] : []
  if (!Array.isArray(raw)) throw new Error('Fila er ikke gyldig GeoJSON')

  const out: MapFeature[] = []
  let skipped = 0
  for (const f of raw) {
    const n = normalizeFeature(f)
    if (n) out.push(n)
    else skipped++
  }
  return { features: out, skipped }
}

function normalizeFeature(f: Feature): MapFeature | null {
  if (!f || f.type !== 'Feature' || !f.geometry) return null
  const p = (f.properties ?? {}) as Record<string, unknown>
  const t = nowIso()
  const base = {
    id: typeof p.id === 'string' ? p.id : newId(),
    name: typeof p.name === 'string' ? p.name : 'Uten navn',
    description: typeof p.description === 'string' ? p.description : '',
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : t,
    updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : t,
    sensitive: p.sensitive === true,
    shareable: p.shareable === true,
  }
  const g = f.geometry

  if (g.type === 'Point') {
    const { category, forceSensitive } = normalizeCategory(p.category)
    const bestTimes = normalizeBestTimes(p.bestTimes)
    return {
      type: 'Feature',
      geometry: g,
      properties: { ...base, sensitive: base.sensitive || forceSensitive, kind: 'poi', category, ...(bestTimes ? { bestTimes } : {}) },
    }
  }
  if ((g.type === 'LineString' || g.type === 'MultiLineString') && p.kind === 'track') {
    return {
      type: 'Feature',
      geometry: g,
      properties: { ...base, kind: 'track', source: (p.source as never) ?? { type: 'gpx', fileName: 'ukjent' } },
    }
  }
  if (g.type === 'LineString') {
    // Bare objekter som allerede var godkjente stier i Sandøy Explorer beholder statusen.
    const status = p.kind === 'path' && p.status === 'godkjent' ? 'godkjent' : 'utkast'
    return { type: 'Feature', geometry: g, properties: { ...base, kind: 'path', status } }
  }
  return null
}

function normalizeBestTimes(raw: unknown): BestTimes | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const r = raw as Record<string, unknown>
  const pick = <T extends string>(v: unknown, allowed: readonly T[]): T[] =>
    Array.isArray(v) ? v.filter((x): x is T => typeof x === 'string' && (allowed as readonly string[]).includes(x)) : []
  const daypart = pick(r.daypart, ['morgen', 'dag', 'kveld'] as const)
  const tide = pick(r.tide, ['hoyvann', 'lavvann'] as const)
  const note = typeof r.note === 'string' && r.note.trim() ? r.note.trim() : undefined
  if (!daypart.length && !tide.length && !note) return undefined
  return { daypart, tide, note }
}

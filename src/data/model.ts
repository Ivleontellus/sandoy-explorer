import type { Feature, FeatureCollection, LineString, MultiLineString, Point } from 'geojson'

/**
 * Datamodell for PRIVATE registreringer. Alt her lagres lokalt i nettleseren
 * og forlater aldri enheten med mindre brukeren eksplisitt eksporterer det.
 * Offentlige kartdata (bakgrunnskart, NGU-geologi osv.) ligger i src/map/publicLayers.ts
 * og blandes aldri inn i denne modellen.
 */

export type PoiCategory =
  | 'geologi'
  | 'baer'
  | 'sopp'
  | 'planter'
  | 'dyr'
  | 'historisk'
  | 'fiske'
  | 'bade'
  | 'utsikt'
  | 'brygge'
  | 'servering'
  | 'bod'
  | 'kunst'
  | 'annet'

export const POI_CATEGORIES: Record<PoiCategory, { label: string; color: string; symbol: string; defaultSensitive?: boolean }> = {
  // Geologi inkluderer mineralforekomster, derfor sårbar som standard.
  geologi: { label: 'Geologi og mineraler', color: '#8a5a2b', symbol: '◆', defaultSensitive: true },
  baer: { label: 'Bær', color: '#c2185b', symbol: '●' },
  sopp: { label: 'Sopp', color: '#d9822b', symbol: '♣' },
  // Sjeldne planter og reir/hi kan være sårbare – brukeren velger selv per punkt.
  planter: { label: 'Planter og trær', color: '#558b2f', symbol: '❦' },
  dyr: { label: 'Dyr og insekter', color: '#795548', symbol: '🐾' },
  historisk: { label: 'Historiske steder', color: '#455a64', symbol: '⚑' },
  fiske: { label: 'Fiskeplasser', color: '#1565c0', symbol: '🐟' },
  bade: { label: 'Badeplasser', color: '#00897b', symbol: '≈' },
  utsikt: { label: 'Utsiktspunkter', color: '#6a3fb5', symbol: '◉' },
  brygge: { label: 'Brygger og ankerplasser', color: '#37474f', symbol: '⚓' },
  servering: { label: 'Kafé, gårdsutsalg og butikker', color: '#ad1457', symbol: '☕' },
  bod: { label: 'Utsalgsboder', color: '#ef6c00', symbol: '🧺' },
  kunst: { label: 'Kunst og gallerier', color: '#8e24aa', symbol: '🎨' },
  annet: { label: 'Annet', color: '#2e7d32', symbol: '★' },
}

/** Kategorier som er fjernet; gamle data mappes om ved innlasting og import. */
export const LEGACY_CATEGORIES: Record<string, { category: PoiCategory; forceSensitive: boolean }> = {
  mineraler: { category: 'geologi', forceSensitive: true },
}

export type Daypart = 'morgen' | 'dag' | 'kveld'
export type TidePreference = 'hoyvann' | 'lavvann'

export const DAYPARTS: Record<Daypart, { label: string; fromHour: number; toHour: number }> = {
  morgen: { label: 'Morgen', fromHour: 5, toHour: 10 },
  dag: { label: 'Dag', fromHour: 10, toHour: 17 },
  kveld: { label: 'Kveld', fromHour: 17, toHour: 23 },
}

export const TIDE_PREFS: Record<TidePreference, string> = { hoyvann: 'Høyvann', lavvann: 'Lavvann' }

/** Når plassen er på sitt beste. Brukerens egen vurdering, vises sammen med live sol og tidevann. */
export interface BestTimes {
  daypart: Daypart[]
  tide: TidePreference[]
  note?: string
}

/** Spor = rå GPS-logg (f.eks. fra Radiacode). Sti = kuratert linje som brukeren har tegnet eller godkjent. */
export type FeatureKind = 'poi' | 'path' | 'track'

/** Stier starter alltid som utkast. Bare en eksplisitt handling fra brukeren gjør dem godkjent. */
export type PathStatus = 'utkast' | 'godkjent'

export interface BaseProps {
  id: string
  kind: FeatureKind
  name: string
  description: string
  createdAt: string
  updatedAt: string
  /** Sårbar registrering. Tas aldri med i delbar eksport. */
  sensitive: boolean
  /** Brukeren har eksplisitt merket objektet som delbart. Standard er false. */
  shareable: boolean
  /**
   * Bildestier relativt til datasettets mappe (f.eks. «bilder/<id>.jpg»). Brukes BARE i eksporterte
   * og publiserte datasett; private bilder ligger i IndexedDB (features/photos) og refereres via featureId.
   */
  photos?: string[]
}

export interface PoiProps extends BaseProps {
  kind: 'poi'
  category: PoiCategory
  bestTimes?: BestTimes
  /** Stedets egen nettside. */
  website?: string
}

export interface PathProps extends BaseProps {
  kind: 'path'
  status: PathStatus
  /** Id til GPS-sporet stien eventuelt ble laget fra. */
  derivedFromTrack?: string
  /** Id til en kjent turrute som denne stien erstatter når den publiseres (f.eks. «hjertestien»). */
  replacesTrail?: string
}

export interface TrackProps extends BaseProps {
  kind: 'track'
  source: { type: 'gpx'; fileName: string; creator?: string }
  /** ISO-tidsstempler per punkt, når GPX-fila har dem. Bevares for fremtidig strålings-/tidsanalyse. */
  times?: string[]
  /** Ukjente per-punkt-egenskaper fra GPX-utvidelser (f.eks. dosrate fra Radiacode), bevart uendret. */
  pointExtensions?: Record<string, unknown>
}

export type PoiFeature = Feature<Point, PoiProps>
export type PathFeature = Feature<LineString, PathProps>
export type TrackFeature = Feature<LineString | MultiLineString, TrackProps>
export type MapFeature = PoiFeature | PathFeature | TrackFeature

export type MapFeatureCollection = FeatureCollection<MapFeature['geometry'], MapFeature['properties']> & {
  features: MapFeature[]
}

export function newId(): string {
  return crypto.randomUUID()
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function baseProps(kind: FeatureKind, name: string): BaseProps {
  const t = nowIso()
  return { id: newId(), kind, name, description: '', createdAt: t, updatedAt: t, sensitive: false, shareable: false }
}

export function isSensitive(f: MapFeature): boolean {
  return f.properties.sensitive
}

/** Normaliserer kategori fra lagrede/importerte data. Returnerer også om objektet må tvinges sårbart. */
export function normalizeCategory(raw: unknown): { category: PoiCategory; forceSensitive: boolean } {
  if (typeof raw === 'string') {
    if (raw in POI_CATEGORIES) return { category: raw as PoiCategory, forceSensitive: false }
    if (raw in LEGACY_CATEGORIES) return LEGACY_CATEGORIES[raw]
  }
  return { category: 'annet', forceSensitive: false }
}

/** Migrerer et lagret objekt fra eldre versjoner av appen. Ukjent/ødelagt input gir null. */
export function migrateFeature(raw: unknown): MapFeature | null {
  const f = raw as MapFeature
  if (!f || f.type !== 'Feature' || !f.geometry || !f.properties?.id) return null
  if (f.properties.kind === 'poi') {
    const { category, forceSensitive } = normalizeCategory(f.properties.category)
    const poi: PoiFeature = {
      ...f,
      geometry: f.geometry as Point,
      properties: { ...f.properties, category, sensitive: f.properties.sensitive || forceSensitive },
    }
    return poi
  }
  return f
}

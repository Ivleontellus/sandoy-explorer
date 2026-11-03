/**
 * OFFENTLIGE kartdata. Åpne tjenester uten innlogging eller API-nøkkel.
 * Nye offentlige lag (f.eks. terrengmodell, Norge i bilder, kulturminner) legges til her.
 */

export const SANDOY_CENTER: [number, number] = [58.9984, 11.0807] // Kartverket stedsnavn: Søndre Sandøy
export const DEFAULT_ZOOM = 15
/** Hele Søndre Sandøy med Herføl-sundet og Nedgården; startvisningen tilpasses skjermen. [[sør, vest], [nord, øst]] */
export const ISLAND_BOUNDS: [[number, number], [number, number]] = [
  [58.99, 11.052],
  [59.026, 11.114],
]

export interface BaseMap {
  id: string
  label: string
  url: string
  attribution: string
  maxZoom: number
}

export const BASEMAPS: BaseMap[] = [
  {
    id: 'kartverket-topo',
    label: 'Kartverket topografisk',
    url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png',
    attribution: '&copy; <a href="https://www.kartverket.no/">Kartverket</a>',
    maxZoom: 18,
  },
  {
    id: 'kartverket-grå',
    label: 'Kartverket gråtone',
    url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png',
    attribution: '&copy; <a href="https://www.kartverket.no/">Kartverket</a>',
    maxZoom: 18,
  },
  {
    id: 'osm',
    label: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-bidragsytere',
    maxZoom: 19,
  },
]

export interface WmsOverlay {
  id: string
  label: string
  /** Hvilket tema-lag overlegget hører til i lagpanelet. */
  theme: 'geologi'
  url: string
  layers: string
  attribution: string
  opacity: number
}

export const WMS_OVERLAYS: WmsOverlay[] = [
  {
    id: 'ngu-berggrunn',
    label: 'Berggrunn (NGU)',
    theme: 'geologi',
    url: 'https://geo.ngu.no/mapserver/BerggrunnWMS3',
    layers: 'Berggrunn_nasjonal_hovedbergarter',
    attribution: '&copy; <a href="https://www.ngu.no/">NGU</a>',
    opacity: 0.55,
  },
]

/**
 * Offentlige objektkilder (hentes som data, ikke fliser). Vises som egne lag i panelet.
 * Selve hentingen ligger i hver features-modul; dette er bare katalogen.
 */
export interface PublicFeatureSource {
  id: 'kulturminner' | 'bygninger' | 'ferge' | 'turruter' | 'plasser'
  label: string
  attribution: string
  color: string
}

export const PUBLIC_FEATURE_SOURCES: PublicFeatureSource[] = [
  { id: 'kulturminner', label: 'Kulturminner (Riksantikvaren)', attribution: 'Riksantikvaren / Kulturminnesøk', color: '#6d4c41' },
  { id: 'bygninger', label: 'Eldre bygninger (SEFRAK, Riksantikvaren)', attribution: 'Riksantikvaren, NLOD', color: '#8d6e63' },
  { id: 'ferge', label: 'Fergeleier (Hvalerferga)', attribution: 'Østfold kollektivtrafikk', color: '#0277bd' },
  { id: 'turruter', label: 'Kjente turruter', attribution: 'Havely Bryggerhus / OpenStreetMap', color: '#b71c1c' },
  { id: 'plasser', label: 'Kjente plasser (fiske, bade, kafé …)', attribution: 'Havely Bryggerhus / Kartverket / OpenStreetMap', color: '#1565c0' },
]

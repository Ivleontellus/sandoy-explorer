import type { LineString } from 'geojson'
import type { BestTimes, PoiCategory } from '../../data/model'
import hjertestien from './hjertestien.json'
import hovedveien from './hovedveien.json'
import kloverstien from './kloverstien.json'

/**
 * Kjente turer og plasser på Søndre Sandøy. OFFENTLIG informasjon fra turkartet
 * til Havely Bryggerhus (Facebook, 1. august 2020) og OpenStreetMap/Kartverket for stedfesting.
 * Dette er ikke brukerens registreringer og blandes aldri med dem.
 *
 * Hovedveien er hentet direkte fra OpenStreetMap. Hjertestien og Kløverstien finnes ikke
 * digitalt; linjene er REKONSTRUERT ved å rute gjennom OSMs vei- og stinett via stedene
 * turkartet viser (scratch-skript: route.cjs). De må kontrolleres på tur.
 */

export const GUIDE_ATTRIBUTION = 'Turkart: Havely Bryggerhus · stedfesting: Kartverket / OpenStreetMap'

export interface GuideTrail {
  id: string
  name: string
  color: string
  lengthKm: number
  description: string
  /** Stedsnavn turen går via, slik turkartet viser dem. */
  via: string[]
  geometry?: LineString
  /** Linja er rekonstruert fra OSM-stinettet, ikke offisielt oppmålt. */
  reconstructed?: boolean
  /** Publisert fra appen (det publiserte datasettet), ikke fra kildedataene her. */
  published?: boolean
}

export const GUIDE_TRAILS: GuideTrail[] = [
  {
    id: 'hovedveien',
    name: 'Hovedveien',
    color: '#1a237e',
    lengthKm: 2.5,
    description: 'Gruslagt vei fra Nedgården til Buvika (Gravningsund). Egner seg for sykkel, barnevogn og føtter.',
    via: ['Nedgården', 'Grendehuset', 'Veveriet', 'Bakkevika', 'Buvika'],
    geometry: hovedveien as LineString,
  },
  {
    id: 'hjertestien',
    name: 'Hjertestien',
    color: '#b71c1c',
    lengthKm: 5,
    description:
      'Tursti i variert terreng der du passerer en av øyas flotte strender. Linja er rekonstruert via Langåsveien, Gjøkvika, Fiskekroken og Stuevika; turkartets sløyfe ut til Reiertangen og Storhavna finnes ikke som sti i OpenStreetMap og mangler.',
    via: ['Veveriet', 'Langåsveien', 'Gjøkvika', '(Reiertangen, Storhavna)', 'Stenbruddet', 'Fiskekroken', 'Stuevika'],
    geometry: hjertestien as LineString,
    reconstructed: true,
  },
  {
    id: 'kloverstien',
    name: 'Kløverstien',
    color: '#1b5e20',
    lengthKm: 3,
    description: 'Rundtur fra krysset (Olasvingen) ovenfor Nedgården rundt Stuevika og Rød. Passer for gående, syklende og barnevogn.',
    via: ['Olasvingen', 'Veveriet', 'Stuevika', 'Rød'],
    geometry: kloverstien as LineString,
    reconstructed: true,
  },
]

/** Kjente plasser bruker de samme kategoriene som egne punkter. */
export type GuideSpotType = PoiCategory

export interface GuideSpot {
  id: string
  name: string
  type: GuideSpotType
  /** [lat, lon] */
  position: [number, number]
  note?: string
  /** Stedets egen nettside, vist som en tydelig knapp. */
  website?: string
  /** Når plassen er på sitt beste; gir live sol/tidevann i detaljvisningen. */
  bestTimes?: BestTimes
  source: string
  /** Posisjonen er et gjett eller ukjent; brukeren bør flytte markøren. */
  approximate?: boolean
  /** Bildestier relativt til public/data/ (bare publiserte plasser). */
  photos?: string[]
  /** Publisert fra appen; endres via egne registreringer + «Oppdater publisert». */
  published?: boolean
}

const MORNING_EVENING: BestTimes = { daypart: ['morgen', 'kveld'], tide: [] }
const ALL_DAY: BestTimes = { daypart: ['morgen', 'dag', 'kveld'], tide: [] }

/**
 * Plasseringene er kontrollert og justert lokalt (november 2026), med utgangspunkt i turkartet
 * og navneregistrene. Ikke justert ennå: Salta, Gjøkvika, Reiertangen, Stuevika badeplass,
 * Utkikkspunkt losen og Nordre Sandøy skole.
 */
export const GUIDE_SPOTS: GuideSpot[] = [
  // Fiske
  { id: 'f-lervika', name: 'Lervika', type: 'fiske', position: [59.020268, 11.073162], bestTimes: MORNING_EVENING, source: 'Turkart · lokalkunnskap' },
  { id: 'f-krossholmen', name: 'Krossholmen', type: 'fiske', position: [59.014256, 11.058061], bestTimes: ALL_DAY, source: 'Turkart · lokalkunnskap' },
  { id: 'f-salta', name: 'Salta', type: 'fiske', position: [59.01369, 11.06278], source: 'Turkart · Kartverket' },
  { id: 'f-sauholmen', name: 'Sauholmen', type: 'fiske', position: [59.009677, 11.057771], bestTimes: MORNING_EVENING, source: 'Turkart · lokalkunnskap' },
  { id: 'f-fiskekroken', name: 'Fiskekroken', type: 'fiske', position: [59.011588, 11.08807], bestTimes: ALL_DAY, source: 'Turkart · lokalkunnskap' },
  { id: 'f-gjokvika', name: 'Gjøkvika', type: 'fiske', position: [59.0174, 11.1054], source: 'Turkart · OpenStreetMap' },
  { id: 'f-reiertangen', name: 'Reiertangen', type: 'fiske', position: [59.01672, 11.10976], source: 'Turkart · Kartverket' },
  { id: 'f-storhavna', name: 'Storhavna', type: 'fiske', position: [59.021155, 11.112252], bestTimes: ALL_DAY, source: 'Turkart · lokalkunnskap' },
  { id: 'f-buvika', name: 'Buvika', type: 'fiske', position: [59.022969, 11.091889], bestTimes: MORNING_EVENING, source: 'Turkart · lokalkunnskap' },
  // Bading og båt
  { id: 'b-stuevika', name: 'Stuevika', type: 'bade', position: [59.0084, 11.0833], note: 'Bade- og teltplass med sandstrand.', source: 'Turkart · OpenStreetMap' },
  {
    id: 'br-stuevika',
    name: 'Stuevika brygge',
    type: 'brygge',
    position: [59.009042, 11.085935],
    note: 'Av- og påstigningsbrygge som hører til Stuevika teltplass.',
    bestTimes: { daypart: [], tide: ['hoyvann', 'lavvann'] },
    source: 'Lokalkunnskap',
  },
  // Natur og utsikt
  { id: 'u-losen', name: 'Utkikkspunkt losen', type: 'utsikt', position: [58.9942, 11.0623], source: 'OpenStreetMap' },
  { id: 'n-blabaer', name: 'Blåbær', type: 'baer', position: [59.012754, 11.079454], note: 'Godt med blåbær langs stien.', source: 'Lokalkunnskap' },
  // Publisert etter eksplisitt ønske fra den som registrerte den (mineralforekomster holdes ellers private).
  {
    id: 'g-kvarts',
    name: 'Kvartsforekomst',
    type: 'geologi',
    position: [59.007492, 11.085162],
    note: 'Fin hvit kvarts under mosen. Se og ta bilder, men la steinen ligge, så andre også kan oppleve den.',
    source: 'Lokalkunnskap',
  },
  // Kafé og gårdsutsalg
  {
    id: 's-oline',
    name: 'Café Oline',
    type: 'servering',
    position: [59.014952, 11.066966],
    note: 'Familiedrevet kafé og pub ved det gamle landhandleriet, i samme bygning siden 1906. Kiosk med is og bakst. Åpent i skoleferier og utvalgte helger.',
    bestTimes: { daypart: ['dag', 'kveld'], tide: [] },
    website: 'https://cafeoline.no/',
    source: 'Lokalkunnskap · cafeoline.no',
  },
  {
    id: 's-vingard',
    name: 'Ytre Hvaler Vingård',
    type: 'servering',
    position: [59.01141, 11.07309],
    note: 'Vingård som lager vin og andre lokale, bærekraftige drikkevarer.',
    website: 'https://www.ytre.vin/',
    source: 'Lokalkunnskap · ytre.vin',
  },
  { id: 'bod-fluge', name: 'Flugeboden', type: 'bod', position: [59.014024, 11.071091], note: 'Grønnsaker fra Svanekilen gård. Selvbetjent, i sommerhalvåret.', source: 'Lokalkunnskap' },
  { id: 'bod-sando', name: 'Sandø boden', type: 'bod', position: [59.005976, 11.072325], note: 'Tekstiler og keramikk. Selvbetjent.', source: 'Lokalkunnskap' },
  { id: 'bod-kvale', name: 'Kvale boden', type: 'bod', position: [59.014832, 11.068728], note: 'Honning og grønnsaker. Selvbetjent.', source: 'Lokalkunnskap' },
  // Praktisk info
  {
    id: 'p-oppslagstavle',
    name: 'Oppslagstavle',
    type: 'annet',
    position: [59.015017, 11.067704],
    note: 'Oppslagstavle med lokal info. Utsalgssted for Søndre Tidende.',
    source: 'Lokalkunnskap',
  },
  // Kultur og historie
  {
    id: 'h-lokkeberg-skole',
    name: 'Løkkeberg skole (gamle skolen)',
    type: 'historisk',
    position: [59.013298, 11.074699],
    note: 'Den gamle skolen på Søndre Sandøy, Stuevikveien 29, rett før Åsheim. Bygd i teglstein i en tradisjon som er typisk for skolebygg og forsamlingslokaler fra siste del av 1800-tallet og begynnelsen av 1900-tallet, på samme måte som skolene på Nordre Sandøy, Asmaløy og Spjærøy (Dypedal, 1893). I dag bolig for fastboende og base for kunstnerne bak «Den gamle skolen» og Mikrogalleri Nor. Ikke registrert i SEFRAK.',
    website: 'https://www.dengamleskolen.com/',
    source: 'Lokalhistorie · dengamleskolen.com',
  },
  {
    id: 'k-mikrogalleri-nor',
    name: 'Mikrogalleri Nor',
    type: 'kunst',
    position: [59.0133, 11.075],
    note: 'Kunstnerdrevet mikrogalleri ved Den gamle skolen – «der små ting får en størrelse». Gulvflate 150 × 60 cm, to etasjer og fire rom, synlig fra veien på vei til badestranda. Ved siden av henger «Månedens bilde», nytt bilde hver måned hele året. Drives av Vilde Rudjord, Magne Rudjord og Inger-Marie D. Thorkildsen.',
    website: 'https://www.dengamleskolen.com/mikrogallerinor',
    source: 'dengamleskolen.com',
  },
  {
    id: 'h-nordre-sandoy-skole',
    name: 'Nordre Sandøy skole',
    type: 'historisk',
    position: [59.03503, 11.09656],
    note: 'Gammel skole i teglstein fra samme tradisjon som Løkkeberg skole. I dag fritidsbolig. Posisjon fra SEFRAK-registeret («Skole, Nordre Sandø»).',
    source: 'Lokalhistorie · Riksantikvaren (SEFRAK)',
  },
]

/** Grupper for kjente plasser, så vanlige brukere kan slå av og på det de er ute etter. */
export interface SpotGroup {
  id: 'fiske' | 'bade' | 'mat' | 'kultur' | 'natur' | 'praktisk'
  label: string
  symbol: string
  types: PoiCategory[]
}

export const SPOT_GROUPS: SpotGroup[] = [
  { id: 'fiske', label: 'Fiske', symbol: '🐟', types: ['fiske'] },
  { id: 'bade', label: 'Bading og båt', symbol: '≈', types: ['bade', 'brygge'] },
  { id: 'mat', label: 'Kafé og gårdsutsalg', symbol: '☕', types: ['servering', 'bod'] },
  { id: 'kultur', label: 'Kultur og historie', symbol: '⚑', types: ['historisk', 'kunst'] },
  { id: 'natur', label: 'Natur og utsikt', symbol: '◉', types: ['utsikt', 'baer', 'sopp', 'planter', 'dyr', 'geologi'] },
  { id: 'praktisk', label: 'Praktisk info', symbol: 'ℹ', types: ['annet'] },
]

export function groupOf(type: PoiCategory): SpotGroup['id'] {
  return SPOT_GROUPS.find((g) => g.types.includes(type))?.id ?? 'praktisk'
}

const GROUPS_KEY = 'sandoy-explorer:guide-groups-off:v1'

/** Grupper brukeren har slått av (bekvemmelighet per enhet). */
export function loadGroupsOff(): SpotGroup['id'][] {
  try {
    const raw = JSON.parse(localStorage.getItem(GROUPS_KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((x) => SPOT_GROUPS.some((g) => g.id === x)) : []
  } catch {
    return []
  }
}

export function saveGroupsOff(ids: SpotGroup['id'][]) {
  try {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(ids))
  } catch {
    /* lagring kan være blokkert */
  }
}

const OVERRIDE_KEY = 'sandoy-explorer:guide-positions:v1'
export type GuideOverrides = Record<string, [number, number]>

/** Brukerens egne justeringer av offentlige plasser. Lagres lokalt, endrer aldri kildedataene. */
export function loadGuideOverrides(): GuideOverrides {
  try {
    const raw = JSON.parse(localStorage.getItem(OVERRIDE_KEY) ?? '{}')
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}

export function saveGuideOverrides(o: GuideOverrides) {
  try {
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(o))
  } catch {
    /* lagring kan være blokkert */
  }
}

const HIDDEN_KEY = 'sandoy-explorer:guide-hidden:v1'

/** Offentlige plasser brukeren har skjult (f.eks. fordi de har laget en egen, riktigere versjon). */
export function loadHiddenSpots(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function saveHiddenSpots(ids: string[]) {
  try {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids))
  } catch {
    /* lagring kan være blokkert */
  }
}

export type ResolvedSpot = GuideSpot & { moved: boolean; hidden: boolean }

/** Plasser med eventuelle lokale justeringer og skjuling lagt på. */
export function resolveSpots(overrides: GuideOverrides, hidden: string[] = [], extra: GuideSpot[] = []): ResolvedSpot[] {
  return [...GUIDE_SPOTS, ...extra].map((s) => ({
    ...s,
    position: overrides[s.id] ?? s.position,
    moved: !!overrides[s.id],
    hidden: hidden.includes(s.id),
  }))
}

/** Fiskeplasser fra turkartet som ikke lot seg stedfeste via navneregistrene. */
export const GUIDE_UNPLACED = ['Askjærholmen (sørvest)', 'Ødegårdstranda (sør)']

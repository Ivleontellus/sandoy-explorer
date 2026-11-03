import type { LineString } from 'geojson'
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

export type GuideSpotType = 'fiske' | 'bade' | 'utsikt' | 'brygge' | 'servering' | 'historisk'

export interface GuideSpot {
  id: string
  name: string
  type: GuideSpotType
  /** [lat, lon]. Stedfestet via navn, så plasseringen er omtrentlig. */
  position: [number, number]
  note?: string
  source: string
  /** Posisjonen er et gjett eller ukjent; brukeren bør flytte markøren. */
  approximate?: boolean
}

export const GUIDE_SPOTS: GuideSpot[] = [
  { id: 'f-lervika', name: 'Lervika', type: 'fiske', position: [59.02032, 11.07236], source: 'Turkart · Kartverket' },
  { id: 'f-krossholmen', name: 'Krossholmen', type: 'fiske', position: [59.01548, 11.05943], source: 'Turkart · Kartverket' },
  { id: 'f-salta', name: 'Salta', type: 'fiske', position: [59.01369, 11.06278], source: 'Turkart · Kartverket' },
  { id: 'f-sauholmen', name: 'Sauholmen', type: 'fiske', position: [59.00931, 11.06138], source: 'Turkart · Kartverket' },
  { id: 'f-fiskekroken', name: 'Fiskekroken', type: 'fiske', position: [59.01195, 11.08806], source: 'Turkart · Kartverket' },
  { id: 'f-gjokvika', name: 'Gjøkvika', type: 'fiske', position: [59.0174, 11.1054], source: 'Turkart · OpenStreetMap' },
  { id: 'f-reiertangen', name: 'Reiertangen', type: 'fiske', position: [59.01672, 11.10976], source: 'Turkart · Kartverket' },
  { id: 'f-storhavna', name: 'Storhavna', type: 'fiske', position: [59.02046, 11.1114], source: 'Turkart · Kartverket' },
  { id: 'f-buvika', name: 'Buvika', type: 'fiske', position: [59.024, 11.1007], source: 'Turkart · OpenStreetMap' },
  { id: 'b-stuevika', name: 'Stuevika', type: 'bade', position: [59.0084, 11.0833], note: 'Bade- og teltplass med sandstrand.', source: 'Turkart · OpenStreetMap' },
  { id: 'u-losen', name: 'Utkikkspunkt losen', type: 'utsikt', position: [58.9942, 11.0623], source: 'OpenStreetMap' },
  {
    id: 'br-stuevika',
    name: 'Stuevika brygge',
    type: 'brygge',
    position: [59.009, 11.084],
    note: 'Av- og påstigningsbrygge som hører til Stuevika teltplass.',
    source: 'Lokalkunnskap',
    approximate: true,
  },
  {
    id: 's-oline',
    name: 'Café Oline',
    type: 'servering',
    position: [59.0161, 11.0691],
    note: 'Familiedrevet kafé og pub ved Grendehuset, i samme bygning siden 1906. Kiosk med is og bakst. Åpent i skoleferier og utvalgte helger – se cafeoline.no.',
    source: 'Turkart · lokalhistoriewiki.no',
    approximate: true,
  },
  {
    id: 's-vingard',
    name: 'Ytre Hvaler Vingård',
    type: 'servering',
    position: [59.012, 11.078],
    note: 'Ny vingård på øya. Plassering ikke verifisert – flytt markøren til riktig sted.',
    source: 'Lokalkunnskap',
    approximate: true,
  },
  {
    id: 'h-lokkeberg-skole',
    name: 'Løkkeberg skole (gamle skolen)',
    type: 'historisk',
    position: [59.0133, 11.0745],
    note: 'Den gamle skolen på Søndre Sandøy, i Stuevikveien rett før Åsheim. Bygd i teglstein i en tradisjon som er typisk for skolebygg og forsamlingslokaler fra siste del av 1800-tallet og begynnelsen av 1900-tallet, på samme måte som skolene på Nordre Sandøy, Asmaløy og Spjærøy (Dypedal, 1893). I dag bolig for fastboende. Ikke registrert i SEFRAK. Plassering omtrentlig – flytt markøren om den ligger feil.',
    source: 'Lokalhistorie',
    approximate: true,
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
export function resolveSpots(overrides: GuideOverrides, hidden: string[] = []): ResolvedSpot[] {
  return GUIDE_SPOTS.map((s) => ({
    ...s,
    position: overrides[s.id] ?? s.position,
    moved: !!overrides[s.id],
    hidden: hidden.includes(s.id),
  }))
}

/** Fiskeplasser fra turkartet som ikke lot seg stedfeste via navneregistrene. */
export const GUIDE_UNPLACED = ['Askjærholmen (sørvest)', 'Ødegårdstranda (sør)']

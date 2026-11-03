import type { Feature } from 'geojson'
import { useEffect, useState } from 'react'

/**
 * SEFRAK-bygninger fra Riksantikvarens åpne OGC API Features (NLOD).
 * SEFRAK er et landsdekkende register over eldre bygninger (i hovedsak fra før 1900), registrert
 * i felt på 1970–90-tallet. Oppføring i SEFRAK betyr ikke at bygningen er fredet.
 * Offentlige data – eget lag, blandes aldri med brukerens registreringer.
 * Katalog: https://kartkatalog.geonorge.no/metadata/kulturminner-sefrak-bygninger/93f06149-037c-48cf-b294-d166f65b6838
 * Kodelister: SOSI produktspesifikasjon «Kulturminner – SEFRAK», versjon 20160503.
 */

const API = 'https://api.ra.no/KulturminnerSEFRAKbygninger/collections/sefrakbygninger/items'
/** [vest, sør, øst, nord] – denne tjenesten respekterer bbox. */
const ISLAND_BBOX = [11.04, 58.975, 11.14, 59.03] as const
const CACHE_KEY = 'sandoy-explorer:sefrak:v1'
const CACHE_TTL_MS = 30 * 24 * 3600_000

export interface SefrakBuilding {
  id: string
  sefrakId: string
  /** Funksjon og sted fra registeret, f.eks. «Fjøs, Hvaler». */
  name: string
  localName: string | null
  /** Tidsangivelse-kode, f.eks. «184». */
  period: string | null
  /** 2 = meldepliktig (§ 25), 1 = annet SEFRAK-objekt, 0 = ruin/fjernet. */
  status: number
  buildingType: string | null
  floors: string | null
  outerWall: string | null
  roof: string | null
  cellar: string | null
  socialMilieu: string | null
  physicalMilieu: string | null
  /** Meter, når registrert. */
  length: number | null
  width: number | null
  /** AF/AS = del av et anlegg, SF/SS = selvstendig bygning. */
  relation: string | null
  fieldRegistered: string | null
  askeladdenId: string | null
  /** [lat, lon] */
  position: [number, number]
}

export const PERIOD_LABELS: Record<string, string> = {
  '000': 'Ukjent alder',
  '050': 'Middelalder (før 1537)',
  '150': '1500-tallet',
  '160': '1600-tallet',
  '161': '1600–1624',
  '162': '1625–1649',
  '163': '1650–1674',
  '164': '1675–1699',
  '170': '1700-tallet',
  '171': '1700–1724',
  '172': '1725–1749',
  '173': '1750–1774',
  '174': '1775–1799',
  '180': '1800-tallet',
  '181': '1800–1824',
  '182': '1825–1849',
  '183': '1850–1874',
  '184': '1875–1899',
  '190': '1900-tallet',
  '191': '1900–1924',
  '192': '1925–1949',
  '193': '1950–1974',
  '194': '1975–1999',
  '200': '2000-tallet',
  '201': '2000–2024',
}

export const STATUS_LABELS: Record<number, string> = {
  2: 'Meldepliktig etter kulturminneloven § 25 (riving/ombygging skal meldes kommunen)',
  1: 'Registrert i SEFRAK, ikke meldepliktig',
  0: 'Ruin eller fjernet',
}

/** Bygningstype etter matrikkelens kodeliste (de som forekommer på øya). */
export const BUILDING_TYPE_LABELS: Record<string, string> = {
  '111': 'Enebolig',
  '113': 'Våningshus',
  '161': 'Hytte / sommerhus',
  '162': 'Helårsbolig brukt som fritidsbolig',
  '163': 'Våningshus brukt som fritidsbolig',
  '181': 'Garasje, uthus eller anneks til bolig',
  '182': 'Garasje, uthus eller anneks til fritidsbolig',
  '183': 'Naust, båthus eller sjøbu',
  '199': 'Annen boligbygning',
  '241': 'Hus for dyr / landbrukslager',
  '244': 'Driftsbygning for fiske og fangst',
  '245': 'Naust / redskapshus for fiske',
  '249': 'Annen landbruksbygning',
  '322': 'Butikk / forretningsbygning',
  '662': 'Bedehus / menighetshus',
  '669': 'Annen religiøs bygning',
}

export const OUTER_WALL_LABELS: Record<string, string> = {
  '10': 'Trekonstruksjon',
  '11': 'Tre, jordhyttekonstruksjon',
  '12': 'Tre, stavkonstruksjon',
  '13': 'Tre, reisverk',
  '14': 'Tre, sleppverk',
  '15': 'Laftet tømmer',
  '16': 'Tre, skjelterverk',
  '17': 'Bindingsverk',
  '19': 'Annen trekonstruksjon',
  '20': 'Murt (massiv)',
  '21': 'Naturstein, fuget eller tørrmur',
  '22': 'Teglstein',
  '23': 'Slagg- eller betongstein',
  '29': 'Annen steinmur',
  '30': 'Støpt (massiv)',
  '31': 'Stampejord',
  '32': 'Betong',
  '33': 'Plast',
  '39': 'Annen støpt vegg',
  '40': 'Metallkonstruksjon',
  '41': 'Støpejern',
  '42': 'Stål',
  '43': 'Aluminium',
  '49': 'Annen metallvegg',
  '50': 'Blandingskonstruksjon',
  '51': 'Blandingskonstruksjon',
  '52': 'Blandingskonstruksjon',
  '59': 'Blandingskonstruksjon, annen',
}

export const ROOF_LABELS: Record<string, string> = {
  '10': 'Saltak',
  '11': 'Saltak',
  '12': 'Saltak med buede flater',
  '13': 'Saltak med svai',
  '19': 'Annet saltak',
  '20': 'Valmtak',
  '21': 'Pyramidetak',
  '22': 'Helvalmet tak',
  '23': 'Halvvalmet tak',
  '24': 'Säteritak',
  '25': 'Mansardtak',
  '29': 'Annet valmtak',
  '30': 'Pulttak / flatt tak',
  '31': 'Pulttak',
  '33': 'Flatt tak',
  '39': 'Annet pulttak',
}

export const CELLAR_LABELS: Record<string, string> = {
  '10': 'Ingen kjeller, grunnen oppfylt',
  '11': 'Ingen kjeller, jordgulv',
  '12': 'Ingen kjeller, steinsatt gulv',
  '13': 'Ingen kjeller, tregulv rett på grunnen',
  '14': 'Ingen kjeller, tregulv under 50 cm over bakken',
  '15': 'Ingen kjeller, støpt gulv',
  '19': 'Ingen kjeller',
  '20': 'Kjeller i ganghøyde',
  '21': 'Kjeller i ganghøyde, trebjelkelag',
  '22': 'Kjeller i ganghøyde, steinheller på trebjelker',
  '23': 'Kjeller i ganghøyde, frittbærende steinheller',
  '24': 'Kjeller i ganghøyde, murt hvelv',
  '25': 'Kjeller i ganghøyde, murt kappehvelv',
  '26': 'Kjeller i ganghøyde, betong',
  '29': 'Kjeller i ganghøyde',
  '30': 'Kryperom',
  '31': 'Kryperom, trebjelkelag',
  '32': 'Kryperom, steinheller på trebjelker',
  '33': 'Kryperom, frittbærende steinheller',
  '34': 'Kryperom, murt hvelv',
  '35': 'Kryperom, murt kappehvelv',
  '36': 'Kryperom, betong',
  '39': 'Kryperom',
  '40': 'Åpent under gulvet',
  '41': 'Åpent under gulvet, trebjelkelag',
  '42': 'Åpent under gulvet, steinheller på trebjelker',
  '43': 'Åpent under gulvet, frittbærende steinheller',
  '44': 'Åpent under gulvet, murt hvelv',
  '45': 'Åpent under gulvet, murt kappehvelv',
  '46': 'Åpent under gulvet, betong',
  '49': 'Åpent under gulvet',
}

/** Hvem bygningen opprinnelig ble bygd for. */
export const SOCIAL_LABELS: Record<string, string> = {
  '10': 'Embetsverk / institusjon',
  '11': 'Kongehus eller adel',
  '12': 'Sivil embetsmann',
  '13': 'Militær embetsmann',
  '14': 'Offentlig institusjon',
  '15': 'Annen institusjon',
  '16': 'Forening, lag eller stiftelse',
  '19': 'Embetsverk / institusjon',
  '20': 'Næringsdrivende',
  '21': 'Godseier',
  '22': 'Væreier',
  '23': 'Bedriftsherre',
  '24': 'Handel og tjenesteyrker',
  '25': 'Bonde',
  '26': 'Fisker',
  '27': 'Håndverker / småindustri',
  '28': 'Selskap eller organisasjon',
  '29': 'Næringsdrivende',
  '30': 'Tjenestemenn, arbeidere, husmenn',
  '31': 'Tjenestemann / funksjonær',
  '32': 'Husmann eller strandsitter',
  '33': 'Arbeider',
  '39': 'Tjenestemenn, arbeidere, husmenn',
}

export const PHYSICAL_LABELS: Record<string, string> = {
  '10': 'Større tettsted',
  '20': 'Mindre tettsted',
  '21': 'Mindre tettsted med kirke, handel eller administrasjon',
  '22': 'Mindre tettsted, industristed',
  '23': 'Mindre tettsted, fiskevær',
  '24': 'Mindre tettsted, stasjonsby',
  '25': 'Mindre tettsted, strandsted',
  '26': 'Mindre tettsted, grend',
  '27': 'Mindre tettsted, storgård',
  '29': 'Mindre tettsted',
  '30': 'Gårdstun',
  '31': 'Gårdstun, nedlagt eller ute av bruk',
  '32': 'Gårdstun i vanlig drift',
  '33': 'Gårdstun i drift med tilleggsfunksjon',
  '34': 'Gårdstun med annen hovedfunksjon',
  '39': 'Gårdstun',
  '40': 'Seteranlegg',
  '50': 'Husgruppe utenom tettsted',
  '51': 'Boligfelt',
  '52': 'Hytteområde',
  '53': 'Gruppe av naust, sjøbuer o.l.',
  '55': 'Industrianlegg',
  '56': 'Møller, sager o.l.',
  '60': 'Enkelthus, spredt bebyggelse',
  '61': 'Enkelthus, bolig',
  '62': 'Enkelthus, hytte eller fritidsbolig',
  '63': 'Enkelthus: naust, sjøbu, utløe o.l.',
  '65': 'Enkelthus, industri',
  '69': 'Enkelthus',
}

export const RELATION_LABELS: Record<string, string> = {
  AF: 'Del av et tun/anlegg, frittstående',
  AS: 'Del av et tun/anlegg, sammenbygd med andre',
  SF: 'Selvstendig, frittstående bygning',
  SS: 'Selvstendig bygning, sammenbygd med andre',
}

/** «FJØS, HVALER.» → «Fjøs, Hvaler». Registeret er skrevet med store bokstaver. */
export function prettyName(raw: string): string {
  return raw
    .trim()
    .replace(/[.\s]+$/, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .toLowerCase()
    .replace(/(^|[\s,/(-])(\p{L})/gu, (_, pre: string, ch: string) => pre + ch.toUpperCase())
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : typeof v === 'number' ? String(v) : null
}

/** Eksportert for tester. */
export function toBuilding(f: Feature): SefrakBuilding | null {
  const g = f.geometry
  if (!g || g.type !== 'Point') return null
  const p = (f.properties ?? {}) as Record<string, unknown>
  const [lon, lat] = g.coordinates
  const cm = (v: unknown) => (typeof v === 'number' && v > 0 ? Math.round(v) / 100 : null)
  return {
    id: String(f.id ?? p.sefrakId ?? ''),
    sefrakId: str(p.sefrakId) ?? '',
    name: prettyName(str(p.objektnavn) ?? 'Bygning'),
    localName: str(p.lokaltNavn) ? prettyName(str(p.lokaltNavn) as string) : null,
    period: str(p.tidsangivelse),
    status: typeof p.sefrakStatus === 'number' ? p.sefrakStatus : 1,
    buildingType: str(p.bygningstype),
    floors: str(p.etasjetall),
    outerWall: str(p.yttervegg),
    roof: str(p.takform),
    cellar: str(p.kjeller),
    socialMilieu: str(p['opprinneligSosialtMiljø']),
    physicalMilieu: str(p['fysiskMiljø']),
    length: cm(p.lengde),
    width: cm(p.bredde),
    relation: str(p.forholdAndreHus),
    fieldRegistered: str(p.feltregistrert),
    askeladdenId: str(p.askeladdenId),
    position: [lat, lon],
  }
}

export async function fetchIslandBuildings(): Promise<SefrakBuilding[]> {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { at, buildings } = JSON.parse(cached) as { at: number; buildings: SefrakBuilding[] }
      if (Date.now() - at < CACHE_TTL_MS && Array.isArray(buildings)) return buildings
    }
  } catch {
    /* ødelagt cache ignoreres */
  }

  const out: SefrakBuilding[] = []
  let url: string | null = `${API}?f=json&limit=500&bbox=${ISLAND_BBOX.join(',')}`
  for (let page = 0; url && page < 10; page++) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Riksantikvaren svarte ${res.status}`)
    const data = (await res.json()) as { features?: Feature[]; links?: { rel: string; href: string }[] }
    for (const f of data.features ?? []) {
      const b = toBuilding(f)
      if (b) out.push(b)
    }
    url = data.links?.find((l) => l.rel === 'next')?.href ?? null
  }

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), buildings: out }))
  } catch {
    /* for stort eller blokkert – fungerer uten cache */
  }
  return out
}

export interface BuildingsState {
  buildings: SefrakBuilding[]
  loading: boolean
  error: string | null
}

/** Henter bygninger første gang `enabled` blir true, og beholder dem. */
export function useBuildings(enabled: boolean): BuildingsState {
  const [state, setState] = useState<BuildingsState>({ buildings: [], loading: false, error: null })
  const [requested, setRequested] = useState(false)

  useEffect(() => {
    if (!enabled || requested) return
    setRequested(true)
    setState({ buildings: [], loading: true, error: null })
    fetchIslandBuildings()
      .then((buildings) => setState({ buildings, loading: false, error: null }))
      .catch((e: Error) => {
        setState({ buildings: [], loading: false, error: e.message || 'Kunne ikke hente' })
        setRequested(false)
      })
  }, [enabled, requested])

  return state
}

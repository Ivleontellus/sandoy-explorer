import type { Feature, MultiPolygon, Polygon, Position } from 'geojson'
import { useEffect, useState } from 'react'

/**
 * Kulturminner (lokaliteter) fra Riksantikvarens åpne OGC API Features.
 * Offentlige data – vises som eget lag og blandes aldri med brukerens registreringer.
 * Katalog: https://kartkatalog.geonorge.no/ («Kulturminner - Lokaliteter, Enkeltminner og Sikringssoner»)
 */

export const HERITAGE_ATTRIBUTION = '&copy; <a href="https://www.riksantikvaren.no/">Riksantikvaren</a> / Kulturminnesøk'
const API = 'https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner/collections/lokaliteter/items'
const HVALER_KOMMUNE = '3110'
/** Tjenesten ignorerer bbox-parameteren, så vi henter hele kommunen og filtrerer selv. [vest, sør, øst, nord] */
const ISLAND_BBOX = [11.04, 58.975, 11.14, 59.03] as const
const CACHE_KEY = 'sandoy-explorer:heritage:v4'
const CACHE_TTL_MS = 30 * 24 * 3600_000

export interface HeritageSite {
  id: string
  name: string
  info: string
  /** L-ARK = arkeologisk, L-BVF = bygning/anlegg, L-KRK = kirkested */
  category: string
  art: string
  protection: string
  link: string | null
  /** [lat, lon] */
  centroid: [number, number]
  geometry: Polygon | MultiPolygon
}

export const PROTECTION_LABELS: Record<string, string> = {
  AUT: 'Automatisk fredet',
  FOR: 'Forskriftsfredet',
  VED: 'Vedtaksfredet',
  FJE: 'Fjernet',
  UAV: 'Uavklart',
  IKKEV: 'Ikke fredet',
  STAT: 'Statlig listeført',
  FVERN: 'Fredet (fartøy)',
}

/** Lokalitetsart-koder fra Askeladden som forekommer rundt øya, i klartekst. */
export const ART_LABELS: Record<string, string> = {
  '20159': 'Hustufter (Hvalertufter)',
  '20164': 'Gravminne / røys',
  '20168': 'Skipsfunn',
  '20183': 'Funnsted',
  '20118': 'Bygning',
  '20129': 'Bygning',
  '20131': 'Kulturmiljø',
  '20186': 'Sjømerke / varde',
}

/** Kort forklaring av begreper som går igjen i registertekstene. */
export const HERITAGE_GLOSSARY: Record<string, string> = {
  Hvalertufter:
    'Restene av små, runde eller firkantede steinhus bygd av rullestein, som er typiske for Hvaler. De ligger ofte i kløfter ved gamle strandlinjer, og mange er trolig fra middelalderen og brukt i fiskesesongen.',
  båtopptrekk: 'Et ryddet spor i steinura der båter ble dratt opp på land.',
  tuft: 'Grunnmuren eller sporene etter et hus som er borte.',
}

export const CATEGORY_LABELS: Record<string, string> = {
  'L-ARK': 'Arkeologisk minne',
  'L-BVF': 'Bygning / anlegg',
  'L-KRK': 'Kirkested',
}

function centroidOf(g: Polygon | MultiPolygon): [number, number] {
  const rings: Position[][] = g.type === 'Polygon' ? [g.coordinates[0]] : g.coordinates.map((p) => p[0])
  let x = 0
  let y = 0
  let n = 0
  for (const ring of rings)
    for (const [lon, lat] of ring) {
      x += lon
      y += lat
      n++
    }
  return n ? [y / n, x / n] : [0, 0]
}

function inBbox([lat, lon]: [number, number]): boolean {
  return lon >= ISLAND_BBOX[0] && lon <= ISLAND_BBOX[2] && lat >= ISLAND_BBOX[1] && lat <= ISLAND_BBOX[3]
}

/** Navn på lokaliteter som står uten navn i registeret. */
const NAME_OVERRIDES: Record<string, string> = {
  '32658': 'Hvalertufter ved Salta (Hjalmar Johnsens tuft)',
  '80415': 'Gravfelt med to gravrøyser',
}

/** Registeret skriver «Søre Sandøy»; øya heter Søndre Sandøy. */
function cleanName(name: string): string {
  return name.trim().replace(/Søre Sandøy/g, 'Søndre Sandøy')
}

/** Eksportert for tester. */
export function toSite(f: Feature): HeritageSite | null {
  const g = f.geometry
  if (!g || (g.type !== 'Polygon' && g.type !== 'MultiPolygon')) return null
  const p = (f.properties ?? {}) as Record<string, unknown>
  const centroid = centroidOf(g)
  // Samme kulturminneId kan ha flere geometrier (flere features), så feature-id-en er den unike.
  const id = String(f.id ?? p.kulturminneId ?? '')
  return {
    id,
    name: typeof p.navn === 'string' && p.navn.trim() ? cleanName(p.navn) : (NAME_OVERRIDES[id] ?? 'Uten navn'),
    info: typeof p.informasjon === 'string' ? p.informasjon.trim() : '',
    category: String(p.lokalitetskategori ?? ''),
    art: String(p.lokalitetsart ?? ''),
    protection: String(p.vernetype ?? ''),
    link: typeof p['linkKulturminnesøk'] === 'string' ? p['linkKulturminnesøk'] : null,
    centroid,
    geometry: g,
  }
}

export async function fetchIslandHeritage(): Promise<HeritageSite[]> {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { at, sites } = JSON.parse(cached) as { at: number; sites: HeritageSite[] }
      if (Date.now() - at < CACHE_TTL_MS && Array.isArray(sites)) return sites
    }
  } catch {
    /* ødelagt cache ignoreres */
  }

  const sites: HeritageSite[] = []
  let url: string | null = `${API}?f=json&limit=250&kommune=${HVALER_KOMMUNE}`
  for (let page = 0; url && page < 10; page++) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Riksantikvaren svarte ${res.status}`)
    const data = (await res.json()) as { features?: Feature[]; links?: { rel: string; href: string }[] }
    for (const f of data.features ?? []) {
      const s = toSite(f)
      if (s && inBbox(s.centroid)) sites.push(s)
    }
    url = data.links?.find((l) => l.rel === 'next')?.href ?? null
  }

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), sites }))
  } catch {
    /* for stort eller blokkert – fungerer uten cache */
  }
  return sites
}

export interface HeritageState {
  sites: HeritageSite[]
  loading: boolean
  error: string | null
}

/** Henter kulturminner første gang `enabled` blir true, og beholder dem. */
export function useHeritage(enabled: boolean): HeritageState {
  const [state, setState] = useState<HeritageState>({ sites: [], loading: false, error: null })
  const [requested, setRequested] = useState(false)

  useEffect(() => {
    if (!enabled || requested) return
    setRequested(true)
    setState({ sites: [], loading: true, error: null })
    fetchIslandHeritage()
      .then((sites) => setState({ sites, loading: false, error: null }))
      .catch((e: Error) => {
        setState({ sites: [], loading: false, error: e.message || 'Kunne ikke hente' })
        setRequested(false) // tillat nytt forsøk neste gang laget slås på
      })
  }, [enabled, requested])

  return state
}

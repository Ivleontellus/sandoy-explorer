import { GITHUB_BRANCH, GITHUB_REPO } from '../../config'
import { buildExport } from '../../data/geojson'
import { isSensitive, type MapFeature } from '../../data/model'
import { parseGeoJsonImport } from '../../data/geojson'
import { listPhotos } from '../photos/photoStore'

/**
 * PUBLISERING via GitHub: appen skriver det publiserte datasettet (public/data/publisert.geojson)
 * og bildene rett inn i repoet med GitHub sitt Contents-API. Hver slik commit utløser
 * publiseringsjobben, så siden er oppdatert for alle etter 1–2 minutter.
 *
 * Nøkkelen (fine-grained personal access token med «Contents: read and write» på dette ene
 * repoet) skrives inn av administratoren selv og lagres bare i nettleseren på den enheten.
 * Den fungerer i praksis som admin-passord: uten den kan ingen publisere.
 */

const TOKEN_KEY = 'sandoy-explorer:github-token'
const DATA_PATH = 'public/data/publisert.geojson'
const PHOTO_DIR = 'public/data/bilder'
const API = 'https://api.github.com'

export function loadToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveToken(token: string) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token.trim())
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* lagring blokkert */
  }
}

export class PublishError extends Error {}

async function gh(token: string, path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  if (res.status === 401) throw new PublishError('Nøkkelen er ugyldig eller utløpt. Lag en ny under Meny → Publisering.')
  if (res.status === 403 || res.status === 404)
    throw new PublishError(`Nøkkelen har ikke skrivetilgang til ${GITHUB_REPO}. Sjekk at den gjelder dette repoet med «Contents: Read and write».`)
  return res
}

/** UTF-8-trygg base64 (GitHub krever base64; btoa alene tåler ikke æøå). */
export function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}

export function fromBase64(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ''))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}

/** Sjekker at nøkkelen kan skrive til repoet. */
export async function verifyToken(token: string): Promise<string> {
  const res = await gh(token, `/repos/${GITHUB_REPO}`)
  if (!res.ok) throw new PublishError(`GitHub svarte ${res.status}`)
  const repo = (await res.json()) as { full_name: string; permissions?: { push?: boolean } }
  if (repo.permissions && !repo.permissions.push) throw new PublishError(`Nøkkelen kan lese, men ikke skrive til ${repo.full_name}.`)
  return repo.full_name
}

interface RemoteFile {
  sha: string | null
  features: MapFeature[]
}

async function readDataset(token: string): Promise<RemoteFile> {
  const res = await gh(token, `/repos/${GITHUB_REPO}/contents/${DATA_PATH}?ref=${GITHUB_BRANCH}`)
  if (res.status === 404) return { sha: null, features: [] }
  if (!res.ok) throw new PublishError(`Kunne ikke lese publisert datasett (${res.status})`)
  const file = (await res.json()) as { sha: string; content: string }
  return { sha: file.sha, features: parseGeoJsonImport(fromBase64(file.content)).features }
}

async function writeFile(token: string, path: string, base64: string, message: string, sha: string | null): Promise<Response> {
  return gh(token, `/repos/${GITHUB_REPO}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content: base64, branch: GITHUB_BRANCH, ...(sha ? { sha } : {}) }),
  })
}

async function existingSha(token: string, path: string): Promise<string | null> {
  const res = await gh(token, `/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`)
  if (!res.ok) return null
  return ((await res.json()) as { sha: string }).sha
}

/** Legger til eller erstatter ett objekt (samme id) i listen. Ren funksjon, eksportert for tester. */
export function upsertFeature(list: MapFeature[], f: MapFeature): MapFeature[] {
  const i = list.findIndex((x) => x.properties.id === f.properties.id)
  return i === -1 ? [...list, f] : list.map((x, j) => (j === i ? f : x))
}

export function removeFeature(list: MapFeature[], id: string): MapFeature[] {
  return list.filter((x) => x.properties.id !== id)
}

/** Det som publiseres: alltid merket delbart, aldri lokale bilde-id-er. */
function publicCopy(f: MapFeature, photoPaths: string[]): MapFeature {
  const { photos: _drop, ...props } = f.properties
  void _drop
  return { ...f, properties: { ...props, shareable: true, ...(photoPaths.length ? { photos: photoPaths } : {}) } } as MapFeature
}

/**
 * Skriv hele datasettet med én endring. Ved samtidig endring (sha passer ikke) leses fila på nytt
 * og endringen legges på igjen én gang.
 */
async function commitDataset(token: string, change: (list: MapFeature[]) => MapFeature[], message: string): Promise<MapFeature[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const remote = await readDataset(token)
    const next = change(remote.features)
    const body = JSON.stringify(buildExport(next, 'shareable'), null, 2) + '\n'
    const res = await writeFile(token, DATA_PATH, toBase64(body), message, remote.sha)
    if (res.ok) return next
    if (res.status !== 409 && res.status !== 422) throw new PublishError(`Publisering feilet (${res.status})`)
  }
  throw new PublishError('Datasettet ble endret samtidig et annet sted. Prøv igjen.')
}

/** Publiser (eller oppdater) en registrering for alle, med bildene. Returnerer det nye datasettet. */
export async function publishFeature(token: string, f: MapFeature): Promise<MapFeature[]> {
  if (isSensitive(f)) throw new PublishError('Sårbare registreringer publiseres aldri. Fjern «Sårbar» først hvis det er riktig.')
  const photos = await listPhotos(f.properties.id).catch(() => [])
  const paths: string[] = []
  for (const p of photos) {
    const repoPath = `${PHOTO_DIR}/${p.id}.jpg`
    const sha = await existingSha(token, repoPath)
    if (!sha) {
      const res = await writeFile(token, repoPath, await blobToBase64(p.blob), `Bilde til «${f.properties.name}»`, null)
      if (!res.ok) throw new PublishError(`Kunne ikke laste opp bilde (${res.status})`)
    }
    paths.push(`bilder/${p.id}.jpg`)
  }
  return commitDataset(token, (list) => upsertFeature(list, publicCopy(f, paths)), `Publiser «${f.properties.name}»`)
}

/** Fjern en registrering fra det publiserte datasettet (bildefilene blir liggende i repoet). */
export async function unpublishFeature(token: string, id: string, name: string): Promise<MapFeature[]> {
  return commitDataset(token, (list) => removeFeature(list, id), `Fjern «${name}» fra publisert`)
}

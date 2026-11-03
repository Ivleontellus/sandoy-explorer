import { useCallback, useEffect, useState } from 'react'
import { newId, nowIso } from '../../data/model'

/**
 * Bilder knyttet til private registreringer. Lagres som komprimert JPEG i IndexedDB på enheten
 * (localStorage er for lite), nøkkel = bilde-id, med indeks på featureId. Bildene forlater aldri
 * enheten med mindre brukeren eksporterer «med bilder».
 */

const DB_NAME = 'sandoy-explorer-photos'
const DB_VERSION = 1
const STORE = 'photos'

/** Lengste side etter komprimering. Nok for skjerm, lite nok til at hundrevis får plass. */
export const MAX_EDGE = 1600
const JPEG_QUALITY = 0.82

export interface PhotoRecord {
  id: string
  featureId: string
  blob: Blob
  width: number
  height: number
  createdAt: string
  caption?: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB er ikke tilgjengelig'))
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore(STORE, { keyPath: 'id' })
      store.createIndex('featureId', 'featureId', { unique: false })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('Kunne ikke åpne bildelageret'))
  })
}

function request<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error ?? new Error('Databasefeil'))
  })
}

async function withStore<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => Promise<T>): Promise<T> {
  const db = await openDb()
  try {
    const tx = db.transaction(STORE, mode)
    const result = await fn(tx.objectStore(STORE))
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('Databasefeil'))
      tx.onabort = () => reject(tx.error ?? new Error('Avbrutt'))
    })
    return result
  } finally {
    db.close()
  }
}

export function listPhotos(featureId: string): Promise<PhotoRecord[]> {
  return withStore('readonly', async (s) => {
    const rows = await request(s.index('featureId').getAll(featureId))
    return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  })
}

export function allPhotos(): Promise<PhotoRecord[]> {
  return withStore('readonly', (s) => request(s.getAll()))
}

export function putPhoto(rec: PhotoRecord): Promise<void> {
  return withStore('readwrite', async (s) => {
    await request(s.put(rec))
  })
}

export function removePhoto(id: string): Promise<void> {
  return withStore('readwrite', async (s) => {
    await request(s.delete(id))
  })
}

/** Slett alle bilder til en registrering (kalles når registreringen slettes). */
export function removePhotosFor(featureId: string): Promise<void> {
  return withStore('readwrite', async (s) => {
    const keys = await request(s.index('featureId').getAllKeys(featureId))
    for (const k of keys) await request(s.delete(k))
  })
}

/** Komprimer et bilde fra kamera/filvelger og lagre det på registreringen. */
export async function addPhotoFromFile(featureId: string, file: File): Promise<PhotoRecord> {
  const { blob, width, height } = await compressImage(file)
  const rec: PhotoRecord = { id: newId(), featureId, blob, width, height, createdAt: nowIso() }
  await putPhoto(rec)
  return rec
}

/** Lagre et allerede komprimert bilde (fra import). Eksisterende id overskrives. */
export async function importPhoto(id: string, featureId: string, blob: Blob, createdAt?: string, caption?: string): Promise<void> {
  const size = await imageSize(blob).catch(() => ({ width: 0, height: 0 }))
  await putPhoto({ id, featureId, blob, ...size, createdAt: createdAt ?? nowIso(), caption })
}

async function imageSize(blob: Blob): Promise<{ width: number; height: number }> {
  const bmp = await createImageBitmap(blob)
  const size = { width: bmp.width, height: bmp.height }
  bmp.close()
  return size
}

/** Skalerer til maks MAX_EDGE på lengste side og lagrer som JPEG. EXIF-rotasjon håndteres av createImageBitmap. */
export async function compressImage(file: Blob): Promise<{ blob: Blob; width: number; height: number }> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height))
    const width = Math.max(1, Math.round(bmp.width * scale))
    const height = Math.max(1, Math.round(bmp.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Kunne ikke tegne bildet')
    ctx.drawImage(bmp, 0, 0, width, height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
    if (!blob) throw new Error('Kunne ikke komprimere bildet')
    return { blob, width, height }
  } finally {
    bmp.close()
  }
}

/** Bilder for én registrering, med objekt-URL-er som ryddes opp automatisk. */
export function usePhotos(featureId: string | null) {
  const [photos, setPhotos] = useState<(PhotoRecord & { url: string })[]>([])
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!featureId) return setPhotos([])
    try {
      const rows = await listPhotos(featureId)
      setPhotos(rows.map((r) => ({ ...r, url: URL.createObjectURL(r.blob) })))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [featureId])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), [photos])

  return { photos, error, refresh }
}

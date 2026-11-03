import { allPhotos, importPhoto, type PhotoRecord } from '../features/photos/photoStore'
import { buildExport, parseGeoJsonImport, type ExportMode, type ImportResult } from './geojson'
import type { MapFeature } from './model'

/**
 * Zip-eksport/-import med bilder. Oppbygning:
 *   <navn>.geojson          – samme innhold som vanlig GeoJSON-eksport, men hvert objekt har
 *                             properties.photos = ['bilder/<id>.jpg', …]
 *   bilder/<id>.jpg         – komprimerte bilder
 * En delbar zip kan pakkes rett ut i public/data/ (fila heter da publisert.geojson), og bildene
 * vises i publisert innhold uten videre.
 *
 * jszip lastes først når noen faktisk eksporterer/importerer zip, så vanlige brukere slipper å laste det ned.
 */

const loadZip = async () => (await import('jszip')).default

export const PHOTO_DIR = 'bilder'

export function geojsonNameFor(mode: ExportMode): string {
  return mode === 'shareable' ? 'publisert.geojson' : 'sikkerhetskopi.geojson'
}

export async function buildArchive(features: MapFeature[], mode: ExportMode): Promise<{ blob: Blob; photoCount: number }> {
  const data = buildExport(features, mode)
  const byFeature = new Map<string, PhotoRecord[]>()
  for (const p of await allPhotos()) {
    const list = byFeature.get(p.featureId) ?? []
    list.push(p)
    byFeature.set(p.featureId, list)
  }

  const JSZip = await loadZip()
  const zip = new JSZip()
  let photoCount = 0
  const withPhotos = data.features.map((f) => {
    const photos = (byFeature.get(f.properties.id) ?? []).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    if (!photos.length) return f
    const paths: string[] = []
    for (const p of photos) {
      const path = `${PHOTO_DIR}/${p.id}.jpg`
      zip.file(path, p.blob, { date: new Date(p.createdAt) })
      paths.push(path)
      photoCount++
    }
    return { ...f, properties: { ...f.properties, photos: paths } } as MapFeature
  })

  zip.file(geojsonNameFor(mode), JSON.stringify({ ...data, features: withPhotos }, null, 2))
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
  return { blob, photoCount }
}

export async function importArchive(file: Blob): Promise<ImportResult & { photoCount: number }> {
  const JSZip = await loadZip()
  const zip = await JSZip.loadAsync(file)
  const geojsonEntry = Object.values(zip.files).find((e) => !e.dir && /\.(geojson|json)$/i.test(e.name))
  if (!geojsonEntry) throw new Error('Zip-fila inneholder ingen GeoJSON-fil')
  const result = parseGeoJsonImport(await geojsonEntry.async('string'))

  let photoCount = 0
  const features: MapFeature[] = []
  for (const f of result.features) {
    const { photos, ...rest } = f.properties
    for (const path of photos ?? []) {
      const entry = zip.file(path)
      if (!entry) continue
      const id = path.replace(/^.*\//, '').replace(/\.[^.]+$/, '')
      try {
        await importPhoto(id, f.properties.id, await entry.async('blob'), entry.date?.toISOString())
        photoCount++
      } catch {
        /* ugyldig bilde hoppes over */
      }
    }
    // Private bilder refereres via IndexedDB, ikke via stier i egenskapene.
    features.push({ ...f, properties: rest } as MapFeature)
  }
  return { features, skipped: result.skipped, photoCount }
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

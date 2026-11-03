import { useEffect, useState } from 'react'
import { parseGeoJsonImport } from './geojson'
import type { MapFeature } from './model'

/**
 * PUBLISERT INNHOLD: det kuraterte datasettet alle brukere ser. Ligger som statisk fil
 * (public/data/publisert.geojson) og lages fra «Delbar eksport» i redigeringsmodus.
 * Skrivebeskyttet i appen; egne notater lages som private punkter.
 */

export const PUBLISHED_URL = `${import.meta.env.BASE_URL}data/publisert.geojson`

export interface PublishedState {
  features: MapFeature[]
  loading: boolean
  error: string | null
  /** ISO-tidspunkt fra eksporten, hvis fila har det. */
  exportedAt: string | null
}

export async function fetchPublished(url = PUBLISHED_URL): Promise<{ features: MapFeature[]; exportedAt: string | null }> {
  const res = await fetch(url, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`Publisert datasett svarte ${res.status}`)
  const text = await res.text()
  const { features } = parseGeoJsonImport(text)
  let exportedAt: string | null = null
  try {
    const raw = JSON.parse(text)
    if (typeof raw.exportedAt === 'string') exportedAt = raw.exportedAt
  } catch {
    /* allerede validert av parseGeoJsonImport */
  }
  // Sikkerhetsnett: skulle noen publisere en sikkerhetskopi ved et uhell, holdes sårbare objekter utenfor.
  return { features: features.filter((f) => !f.properties.sensitive), exportedAt }
}

export function usePublished(): PublishedState {
  const [state, setState] = useState<PublishedState>({ features: [], loading: true, error: null, exportedAt: null })
  useEffect(() => {
    let cancelled = false
    fetchPublished()
      .then((r) => !cancelled && setState({ ...r, loading: false, error: null }))
      .catch((e: Error) => !cancelled && setState({ features: [], loading: false, error: e.message, exportedAt: null }))
    return () => {
      cancelled = true
    }
  }, [])
  return state
}

import { useRef, useState } from 'react'
import { buildArchive, downloadBlob, importArchive } from '../../data/archive'
import { buildExport, downloadJson, parseGeoJsonImport } from '../../data/geojson'
import { POI_CATEGORIES, isSensitive, type MapFeature } from '../../data/model'
import { useFeatureStore } from '../../data/store'

interface Props {
  onSelect: (id: string) => void
  onImportGpx: () => void
}

export function DataPanel({ onSelect, onImportGpx }: Props) {
  const { features, dispatch } = useFeatureStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [withPhotos, setWithPhotos] = useState(true)
  const [busy, setBusy] = useState(false)

  const stamp = () => new Date().toISOString().slice(0, 10)
  const shareableCount = features.filter((f) => f.properties.shareable && !isSensitive(f)).length

  const importFile = async (file: File) => {
    setBusy(true)
    try {
      if (/\.zip$/i.test(file.name)) {
        const { features: imported, skipped, photoCount } = await importArchive(file)
        dispatch({ type: 'merge', features: imported })
        setMsg(`Importerte ${imported.length} objekter og ${photoCount} bilder${skipped ? `, hoppet over ${skipped} ukjente` : ''}.`)
      } else {
        const { features: imported, skipped } = parseGeoJsonImport(await file.text())
        dispatch({ type: 'merge', features: imported })
        setMsg(`Importerte ${imported.length} objekter${skipped ? `, hoppet over ${skipped} ukjente` : ''}.`)
      }
    } catch (e) {
      setMsg(`Import feilet: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  const exportData = async (mode: 'backup' | 'shareable') => {
    const base = `sandoy-explorer-${mode === 'backup' ? 'sikkerhetskopi' : 'delbar'}-${stamp()}`
    if (!withPhotos) return downloadJson(buildExport(features, mode), `${base}.geojson`)
    setBusy(true)
    try {
      const { blob, photoCount } = await buildArchive(features, mode)
      downloadBlob(blob, `${base}.zip`)
      setMsg(`Eksporterte zip med ${photoCount} bilder.`)
    } catch (e) {
      setMsg(`Eksport feilet: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel-section">
      <h3>Importer</h3>
      <div className="actions wrap">
        <button onClick={onImportGpx}>⤓ GPX-spor</button>
        <button onClick={() => fileRef.current?.click()} disabled={busy}>⤓ GeoJSON / zip</button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".geojson,.json,.zip,application/geo+json,application/json,application/zip"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) importFile(f)
          e.target.value = ''
        }}
      />

      <h3>Eksporter</h3>
      <label className="toggle">
        <input type="checkbox" checked={withPhotos} onChange={(e) => setWithPhotos(e.target.checked)} />
        Ta med bilder (zip)
      </label>
      <div className="actions wrap">
        <button onClick={() => exportData('backup')} disabled={!features.length || busy}>
          ⤒ Privat sikkerhetskopi ({features.length})
        </button>
        <button onClick={() => exportData('shareable')} disabled={!shareableCount || busy}>
          ⤒ Delbar eksport ({shareableCount})
        </button>
      </div>
      <p className="hint">
        Sikkerhetskopien inneholder alt, også sårbare registreringer – ikke del den. Delbar eksport tar bare med objekter
        du har merket som delbare, og aldri sårbare registreringer. Zip-en fra delbar eksport kan pakkes rett ut i{' '}
        <code>public/data/</code> for å publisere den.
      </p>
      {msg && <p className="notice">{msg}</p>}

      <h3>Mine objekter ({features.length})</h3>
      {features.length === 0 && <p className="hint">Ingen registreringer ennå. Legg til et punkt, tegn en sti eller importer en GPX-fil.</p>}
      <ul className="feature-list">
        {features.map((f) => (
          <li key={f.properties.id}>
            <button onClick={() => onSelect(f.properties.id)}>
              <span className="sym">{symbolFor(f)}</span>
              <span className="name">{f.properties.name}</span>
              {isSensitive(f) && <span title="Sårbar">🔒</span>}
              {f.properties.kind === 'path' && f.properties.status === 'utkast' && <span className="badge utkast">utkast</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function symbolFor(f: MapFeature): string {
  if (f.properties.kind === 'poi') return POI_CATEGORIES[f.properties.category].symbol
  return f.properties.kind === 'track' ? '〰' : '⟋'
}

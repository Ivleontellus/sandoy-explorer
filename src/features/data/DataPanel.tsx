import { useRef, useState } from 'react'
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

  const stamp = () => new Date().toISOString().slice(0, 10)
  const shareableCount = features.filter((f) => f.properties.shareable && !isSensitive(f)).length

  const importGeoJson = async (file: File) => {
    try {
      const { features: imported, skipped } = parseGeoJsonImport(await file.text())
      dispatch({ type: 'merge', features: imported })
      setMsg(`Importerte ${imported.length} objekter${skipped ? `, hoppet over ${skipped} ukjente` : ''}.`)
    } catch (e) {
      setMsg(`Import feilet: ${(e as Error).message}`)
    }
  }

  return (
    <div className="panel-section">
      <h3>Importer</h3>
      <div className="actions wrap">
        <button onClick={onImportGpx}>⤓ GPX-spor</button>
        <button onClick={() => fileRef.current?.click()}>⤓ GeoJSON</button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".geojson,.json,application/geo+json,application/json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) importGeoJson(f)
          e.target.value = ''
        }}
      />

      <h3>Eksporter (GeoJSON)</h3>
      <div className="actions wrap">
        <button
          onClick={() => downloadJson(buildExport(features, 'backup'), `sandoy-explorer-sikkerhetskopi-${stamp()}.geojson`)}
          disabled={!features.length}
        >
          ⤒ Privat sikkerhetskopi ({features.length})
        </button>
        <button
          onClick={() => downloadJson(buildExport(features, 'shareable'), `sandoy-explorer-delbar-${stamp()}.geojson`)}
          disabled={!shareableCount}
        >
          ⤒ Delbar eksport ({shareableCount})
        </button>
      </div>
      <p className="hint">
        Sikkerhetskopien inneholder alt, også sårbare registreringer – ikke del den. Delbar eksport tar bare med objekter
        du har merket som delbare, og aldri mineraler eller andre sårbare registreringer.
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

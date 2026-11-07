import type { ReactNode } from 'react'
import type { MapFeature } from '../../data/model'
import { THEME_LAYERS, themeOf, type LayerVisibility, type ThemeLayerId } from '../../map/layers'
import { BASEMAPS, PUBLIC_FEATURE_SOURCES, type PublicFeatureSource } from '../../map/publicLayers'

interface Props {
  basemapId: string
  onBasemap: (id: string) => void
  activeSources: PublicFeatureSource['id'][]
  onToggleSource: (id: PublicFeatureSource['id']) => void
  /** Statusmelding per kilde, f.eks. «Henter …» eller en feil. */
  sourceStatus: Partial<Record<PublicFeatureSource['id'], string>>
  visibility: LayerVisibility
  onToggleTheme: (id: ThemeLayerId) => void
  onSetAllThemes: (on: boolean) => void
  features: MapFeature[]
  /** Utforsk-modus: ingen private lag å vise. */
  showPrivate: boolean
  /** Lister vist under lagene når de er på. */
  trailList?: ReactNode
  spotList?: ReactNode
}

export function LayerPanel(p: Props) {
  const counts = new Map<ThemeLayerId, number>()
  for (const f of p.features) counts.set(themeOf(f), (counts.get(themeOf(f)) ?? 0) + 1)

  return (
    <div className="panel-section">
      <h3>Offentlige kartdata</h3>
      <p className="hint">Åpne data fra Kartverket, Riksantikvaren og OpenStreetMap.</p>
      <div className="segmented">
        {BASEMAPS.map((b) => (
          <button key={b.id} className={b.id === p.basemapId ? 'active' : ''} onClick={() => p.onBasemap(b.id)}>
            {b.label}
          </button>
        ))}
      </div>
      {PUBLIC_FEATURE_SOURCES.map((s) => (
        <div key={s.id}>
          <label className="toggle">
            <input type="checkbox" checked={p.activeSources.includes(s.id)} onChange={() => p.onToggleSource(s.id)} />
            <span className="swatch" style={{ background: s.color }} />
            {s.label}
            {p.sourceStatus[s.id] && <span className="count">{p.sourceStatus[s.id]}</span>}
          </label>
          {s.id === 'turruter' && p.trailList}
          {s.id === 'plasser' && p.spotList}
        </div>
      ))}

      {p.showPrivate && (
        <>
      <div className="section-head">
        <h3>Mine registreringer</h3>
        <span>
          <button className="link" onClick={() => p.onSetAllThemes(true)}>Alle på</button>
          <button className="link" onClick={() => p.onSetAllThemes(false)}>Alle av</button>
        </span>
      </div>
      <p className="hint">Private data, lagret kun på denne enheten.</p>
      {THEME_LAYERS.map((l) => (
        <label key={l.id} className="toggle">
          <input type="checkbox" checked={p.visibility[l.id]} onChange={() => p.onToggleTheme(l.id)} />
          <span className="swatch" style={{ background: l.color }} />
          {l.label}
          <span className="count">{counts.get(l.id) ?? 0}</span>
        </label>
      ))}
      </>
      )}
    </div>
  )
}

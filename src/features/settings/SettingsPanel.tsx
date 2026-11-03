import type { AppMode } from '../../data/appMode'

interface Props {
  mode: AppMode
  onMode: (m: AppMode) => void
  publishedCount: number
  publishedAt: string | null
  publishedError: string | null
  onClose: () => void
}

export function SettingsPanel({ mode, onMode, publishedCount, publishedAt, publishedError, onClose }: Props) {
  return (
    <div className="panel-section">
      <div className="details-head">
        <span className="kind">Innstillinger</span>
        <button className="icon" onClick={onClose} aria-label="Lukk">✕</button>
      </div>
      <h3>Modus</h3>
      <div className="mode-switch">
        <button className={mode === 'utforsk' ? 'active' : ''} onClick={() => onMode('utforsk')}>
          <strong>Utforsk</strong>
          <span>For alle: kart, turruter, plasser, kulturminner, ferge og sol. Ingen redigering.</span>
        </button>
        <button className={mode === 'redigering' ? 'active' : ''} onClick={() => onMode('redigering')}>
          <strong>Redigering</strong>
          <span>For deg som vedlikeholder kartet: egne registreringer, stier, GPX og eksport.</span>
        </button>
      </div>

      <h3>Publisert innhold</h3>
      {publishedError ? (
        <p className="muted">Kunne ikke laste: {publishedError}</p>
      ) : (
        <p className="muted">
          {publishedCount} objekter{publishedAt ? `, eksportert ${new Date(publishedAt).toLocaleDateString('nb-NO')}` : ''}.
        </p>
      )}
      <p className="hint">
        Publisert innhold er det alle ser. For å oppdatere det: gå til Redigering → Mine data → «Delbar eksport», og legg fila som{' '}
        <code>public/data/publisert.geojson</code> i prosjektet. Bare objekter merket «kan deles» blir med, aldri sårbare.
      </p>
    </div>
  )
}

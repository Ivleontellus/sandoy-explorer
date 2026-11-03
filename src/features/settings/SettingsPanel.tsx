import type { AppMode } from '../../data/appMode'
import { APP_VERSION, BUILD_DATE, feedbackLink } from '../../config'
import { TokenSettings } from '../publish/TokenSettings'

interface Props {
  mode: AppMode
  onMode: (m: AppMode) => void
  onShowWelcome: () => void
  publishedCount: number
  publishedAt: string | null
  publishedError: string | null
  onClose: () => void
}

export function SettingsPanel({ mode, onMode, onShowWelcome, publishedCount, publishedAt, publishedError, onClose }: Props) {
  const feedback = feedbackLink()
  return (
    <div className="panel-section">
      <div className="details-head">
        <span className="kind">Meny</span>
        <button className="icon" onClick={onClose} aria-label="Lukk">✕</button>
      </div>

      <h3>Om appen</h3>
      <div className="actions wrap">
        <button onClick={onShowWelcome}>Slik bruker du kartet</button>
        {feedback && (
          <a className="button primary" href={feedback} target="_blank" rel="noreferrer">
            Gi tilbakemelding
          </a>
        )}
      </div>
      <p className="hint">
        Versjon {APP_VERSION}
        {BUILD_DATE ? ` · bygd ${new Date(BUILD_DATE).toLocaleDateString('nb-NO')}` : ''}. Kartdata: Kartverket,
        Riksantikvaren, NGU, OpenStreetMap og Østfold kollektivtrafikk.
      </p>

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

      {mode === 'redigering' && <TokenSettings />}
      <p className="hint">
        Publisert for alle: {publishedError ? `kunne ikke laste (${publishedError})` : `${publishedCount} plasser og stier`}
        {publishedAt ? `, sist endret ${new Date(publishedAt).toLocaleDateString('nb-NO')}` : ''}.
      </p>
    </div>
  )
}

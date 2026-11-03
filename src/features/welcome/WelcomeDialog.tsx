import { useState } from 'react'
import { createPortal } from 'react-dom'
import { APP_VERSION, WELCOME_VERSION, feedbackLink } from '../../config'

const SEEN_KEY = 'sandoy-explorer:welcome-seen'

function seenVersion(): number {
  try {
    return Number(localStorage.getItem(SEEN_KEY) ?? 0)
  } catch {
    return 0
  }
}

/** Vises automatisk første gang (og når WELCOME_VERSION økes), og kan åpnes igjen fra menyen. */
export function useWelcome() {
  const [visible, setVisible] = useState(() => seenVersion() < WELCOME_VERSION)
  return {
    visible,
    open: () => setVisible(true),
    close: () => {
      try {
        localStorage.setItem(SEEN_KEY, String(WELCOME_VERSION))
      } catch {
        /* privat modus – vises igjen neste gang */
      }
      setVisible(false)
    },
  }
}

export function WelcomeDialog({ onClose }: { onClose: () => void }) {
  const feedback = feedbackLink()
  return createPortal(
    <div className="welcome-backdrop" onClick={onClose}>
      <div className="welcome" role="dialog" aria-modal="true" aria-labelledby="welcome-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="welcome-title">Velkommen til Sandøy Explorer</h2>
        <p>Et natur- og turkart over Søndre Sandøy på Hvaler. Dette er en tidlig testversjon – takk for at du prøver den!</p>
        <ul className="welcome-list">
          <li>
            <strong>Trykk på symbolene</strong> i kartet for turruter, fiske- og badeplasser, kafeer og kulturminner.
          </li>
          <li>
            <strong>Kartlag</strong>: slå på kulturminner, eldre bygninger, berggrunn og fergeleier.
          </li>
          <li>
            <strong>Båt</strong>: neste avganger med Hvalerferga, og hvilke turer som må bestilles.
          </li>
          <li>
            <strong>Sol</strong>: hvor sola står, og tidevann fra Viker.
          </li>
          <li>
            <strong>Her</strong>: vis hvor du er (bare på din enhet).
          </li>
        </ul>
        <p className="hint">
          Ingen innlogging. Appen sender ingenting om deg noe sted; kartdata hentes fra Kartverket, Riksantikvaren og
          andre åpne kilder.
        </p>
        <p className="hint">
          På mobil kan du legge appen på hjemskjermen: «Del» → «Legg til på Hjem-skjerm» (iPhone) eller menyen → «Installer
          app» (Android).
        </p>
        <div className="actions">
          {feedback && (
            <a className="button" href={feedback} target="_blank" rel="noreferrer">
              Gi tilbakemelding
            </a>
          )}
          <button className="primary" onClick={onClose} autoFocus>
            Utforsk kartet
          </button>
        </div>
        <p className="version">Versjon {APP_VERSION}</p>
      </div>
    </div>,
    document.body,
  )
}

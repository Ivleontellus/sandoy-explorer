import { Component, type ErrorInfo, type ReactNode } from 'react'
import { APP_VERSION, feedbackLink } from './config'

interface State {
  error: Error | null
}

/** Viser en vennlig feilside i stedet for hvit skjerm. Brukerens data i nettleseren røres ikke. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Sandøy Explorer krasjet', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    const feedback = feedbackLink()
    return (
      <div className="crash">
        <h1>Noe gikk galt</h1>
        <p>Appen støtte på en feil. Dine egne registreringer er lagret på enheten og er ikke slettet.</p>
        <pre>{this.state.error.message}</pre>
        <div className="actions">
          <button className="primary" onClick={() => location.reload()}>
            Last inn på nytt
          </button>
          {feedback && (
            <a className="button" href={feedback} target="_blank" rel="noreferrer">
              Meld feilen
            </a>
          )}
        </div>
        <p className="version">Versjon {APP_VERSION}</p>
      </div>
    )
  }
}

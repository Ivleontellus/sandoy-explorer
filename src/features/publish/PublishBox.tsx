import { useState } from 'react'
import { isSensitive, type MapFeature } from '../../data/model'
import { PublishError, loadToken, publishFeature, unpublishFeature } from './github'

interface Props {
  feature: MapFeature
  /** Finnes objektet (samme id) i det publiserte datasettet nå? */
  isPublished: boolean
  onPublished: (dataset: MapFeature[]) => void
  onOpenSettings: () => void
}

/** «Publiser for alle» på egne punkter og stier. Krever GitHub-nøkkel lagt inn under Meny → Publisering. */
export function PublishBox({ feature: f, isPublished, onPublished, onOpenSettings }: Props) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const token = loadToken()

  if (f.properties.kind === 'track') return null
  if (isSensitive(f)) return <p className="hint">🔒 Sårbar – kan ikke publiseres.</p>
  // Bare kontrollerte stier går ut til alle; utkast (f.eks. fra GPS-spor) må godkjennes først.
  if (f.properties.kind === 'path' && f.properties.status !== 'godkjent' && !isPublished)
    return <p className="hint">Godkjenn stien når den er kontrollert, så kan du publisere den for alle.</p>

  const run = async (action: () => Promise<MapFeature[]>, done: string) => {
    setBusy(true)
    setMsg(null)
    try {
      onPublished(await action())
      setMsg({ ok: true, text: done })
    } catch (e) {
      setMsg({ ok: false, text: e instanceof PublishError ? e.message : `Noe gikk galt: ${(e as Error).message}` })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="publish-box">
      <h4>{isPublished ? '✓ Publisert for alle' : 'Publisering'}</h4>
      {!token ? (
        <p className="hint">
          For å publisere må du legge inn publiseringsnøkkelen én gang på denne enheten.{' '}
          <button className="link" onClick={onOpenSettings}>
            Åpne Meny → Publisering
          </button>
        </p>
      ) : (
        <>
          <p className="hint">
            {isPublished
              ? 'Endringer du gjør her vises for andre først når du trykker «Oppdater publisert».'
              : 'Gjør punktet synlig for alle som bruker kartet, med beskrivelse, beste tid og bilder.'}
          </p>
          <div className="actions wrap">
            {isPublished && (
              <button className="danger" disabled={busy} onClick={() => run(() => unpublishFeature(token, f.properties.id, f.properties.name), 'Fjernet fra publisert. Nettsiden oppdateres om 1–2 minutter.')}>
                Fjern fra publisert
              </button>
            )}
            <button className="primary" disabled={busy} onClick={() => run(() => publishFeature(token, f), 'Publisert! Synlig for alle om 1–2 minutter.')}>
              {busy ? 'Publiserer …' : isPublished ? 'Oppdater publisert' : 'Publiser for alle'}
            </button>
          </div>
        </>
      )}
      {msg && <p className={msg.ok ? 'notice' : 'error'}>{msg.text}</p>}
    </div>
  )
}

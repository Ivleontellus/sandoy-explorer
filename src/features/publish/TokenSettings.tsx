import { useState } from 'react'
import { GITHUB_REPO } from '../../config'
import { PublishError, loadToken, saveToken, verifyToken } from './github'

const NEW_TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new'

/** Publiseringsnøkkel i Meny (bare i redigeringsmodus). Nøkkelen skrives inn av administratoren selv. */
export function TokenSettings() {
  const [saved, setSaved] = useState(() => !!loadToken())
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const check = async (token: string) => {
    setBusy(true)
    setMsg(null)
    try {
      const repo = await verifyToken(token)
      saveToken(token)
      setSaved(true)
      setValue('')
      setMsg({ ok: true, text: `Klar: kan publisere til ${repo}.` })
    } catch (e) {
      setMsg({ ok: false, text: e instanceof PublishError ? e.message : `Kunne ikke kontakte GitHub: ${(e as Error).message}` })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h3>Publisering</h3>
      {saved ? (
        <>
          <p className="muted">✓ Publiseringsnøkkel er lagret på denne enheten.</p>
          <div className="actions wrap">
            <button disabled={busy} onClick={() => check(loadToken())}>
              {busy ? 'Sjekker …' : 'Test nøkkelen'}
            </button>
            <button
              className="danger"
              onClick={() => {
                saveToken('')
                setSaved(false)
                setMsg(null)
              }}
            >
              Glem nøkkelen
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="hint">
            For å publisere plasser og stier for alle trengs en GitHub-nøkkel med skrivetilgang til{' '}
            <code>{GITHUB_REPO}</code>. Den lagres bare her på enheten og virker som admin-passord.
          </p>
          <ol className="steps">
            <li>
              Åpne{' '}
              <a href={NEW_TOKEN_URL} target="_blank" rel="noreferrer">
                github.com → Fine-grained token ↗
              </a>
            </li>
            <li>Navn: «Sandøy publisering». Utløp: f.eks. 1 år.</li>
            <li>Repository access: «Only select repositories» → {GITHUB_REPO.split('/')[1]}.</li>
            <li>Permissions → Repository → Contents: «Read and write».</li>
            <li>Generate token, kopier den og lim den inn her.</li>
          </ol>
          <form
            className="token-form"
            onSubmit={(e) => {
              e.preventDefault()
              if (value.trim()) check(value.trim())
            }}
          >
            <input
              type="password"
              autoComplete="off"
              placeholder="github_pat_…"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-label="Publiseringsnøkkel"
            />
            <button className="primary" type="submit" disabled={busy || !value.trim()}>
              {busy ? 'Sjekker …' : 'Lagre'}
            </button>
          </form>
        </>
      )}
      {msg && <p className={msg.ok ? 'notice' : 'error'}>{msg.text}</p>}
    </>
  )
}

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { addPhotoFromFile, removePhoto, usePhotos } from './photoStore'

interface Props {
  featureId: string
  canEdit: boolean
}

/** Bilder på en privat registrering: miniatyrer, stor visning, legg til fra kamera/fil, slett. */
export function PhotoGallery({ featureId, canEdit }: Props) {
  const { photos, error, refresh } = usePhotos(featureId)
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const add = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    setMsg(null)
    let failed = 0
    for (const f of Array.from(files)) {
      try {
        await addPhotoFromFile(featureId, f)
      } catch {
        failed++
      }
    }
    if (failed) setMsg(`${failed} bilde${failed > 1 ? 'r' : ''} kunne ikke leses.`)
    setBusy(false)
    refresh()
  }

  const current = photos.find((p) => p.id === open)

  return (
    <div className="photos">
      <div className="section-head">
        <h4>Bilder{photos.length ? ` (${photos.length})` : ''}</h4>
        {canEdit && (
          <button className="link" disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? 'Legger til …' : '📷 Legg til'}
          </button>
        )}
      </div>
      {canEdit && (
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            add(e.target.files)
            e.target.value = ''
          }}
        />
      )}
      {error && <p className="notice">{error}</p>}
      {msg && <p className="notice">{msg}</p>}
      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map((p) => (
            <button key={p.id} className="photo-thumb" onClick={() => setOpen(p.id)} aria-label="Vis bilde">
              <img src={p.url} alt={p.caption ?? ''} loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {canEdit && photos.length === 0 && !busy && <p className="hint">Ingen bilder ennå. Bildene lagres bare på denne enheten.</p>}

      {current &&
        createPortal(
        <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-label="Bilde">
          <img src={current.url} alt={current.caption ?? ''} onClick={(e) => e.stopPropagation()} />
          <div className="lightbox-bar" onClick={(e) => e.stopPropagation()}>
            <span className="muted">
              {new Date(current.createdAt).toLocaleDateString('nb-NO')} · {current.width}×{current.height}
            </span>
            {canEdit && (
              <button
                className="danger"
                onClick={async () => {
                  await removePhoto(current.id)
                  setOpen(null)
                  refresh()
                }}
              >
                Slett bilde
              </button>
            )}
            <button onClick={() => setOpen(null)}>Lukk</button>
          </div>
        </div>,
        document.body,
        )}
    </div>
  )
}

/** Bilder fra det publiserte datasettet: stier relativt til data-mappa, skrivebeskyttet. */
export function PublishedPhotos({ paths, baseUrl }: { paths: string[]; baseUrl: string }) {
  const [open, setOpen] = useState<string | null>(null)
  if (!paths.length) return null
  return (
    <div className="photos">
      <h4>Bilder ({paths.length})</h4>
      <div className="photo-grid">
        {paths.map((p) => (
          <button key={p} className="photo-thumb" onClick={() => setOpen(p)} aria-label="Vis bilde">
            <img src={baseUrl + p} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      {open &&
        createPortal(
        <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-label="Bilde">
          <img src={baseUrl + open} alt="" onClick={(e) => e.stopPropagation()} />
          <div className="lightbox-bar" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(null)}>Lukk</button>
          </div>
        </div>,
        document.body,
        )}
    </div>
  )
}

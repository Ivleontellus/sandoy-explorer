import { useState } from 'react'
import { LinkedText } from '../common/Links'
import { POI_CATEGORIES, isSensitive, type MapFeature } from '../../data/model'
import { PlaceConditions } from '../conditions/PlaceConditions'
import { PhotoGallery } from '../photos/PhotoGallery'
import { lineLengthMeters } from './geo'

interface Props {
  feature: MapFeature
  onUpdate: (patch: Partial<MapFeature['properties']>) => void
  onDelete: () => void
  onEditPoi: () => void
  onEditGeometry: () => void
  /** Tegn videre fra slutten eller starten av stien. */
  onExtend: (side: 'end' | 'start') => void
  /** Flytt punktet ved å trykke i kartet. */
  onPickInMap: () => void
  onCreatePathFromTrack: () => void
  onClose: () => void
}

const KIND_LABEL = { poi: 'Interessepunkt', path: 'Sti', track: 'GPS-spor (rådata)' }

export function FeatureDetails({ feature: f, onUpdate, onDelete, onEditPoi, onEditGeometry, onExtend, onPickInMap, onCreatePathFromTrack, onClose }: Props) {
  const p = f.properties
  const [name, setName] = useState(p.name)
  const [description, setDescription] = useState(p.description)
  // Egen bekreftelse i panelet: window.confirm blokkeres i enkelte innebygde nettlesere.
  const [confirmDelete, setConfirmDelete] = useState(false)
  const dirty = name !== p.name || description !== p.description
  const sensitive = isSensitive(f)
  const length = f.geometry.type !== 'Point' ? lineLengthMeters(f.geometry) : null

  return (
    <div className="panel-section">
      <div className="details-head">
        <span className="kind">{KIND_LABEL[p.kind]}</span>
        <button className="icon" onClick={onClose} aria-label="Lukk">✕</button>
      </div>

      {f.properties.kind === 'poi' && f.geometry.type === 'Point' ? (
        <>
          <h3>
            {POI_CATEGORIES[f.properties.category].symbol} {p.name} {sensitive && '🔒'}
          </h3>
          <p className="muted">{POI_CATEGORIES[f.properties.category].label}</p>
          {p.description && (
            <p className="desc">
              <LinkedText text={p.description} />
            </p>
          )}
          <p className="coords">
            {f.geometry.coordinates[1].toFixed(6)}, {f.geometry.coordinates[0].toFixed(6)}
          </p>
          <p className="hint">Flytt punktet: dra markøren i kartet, eller trykk «Velg i kartet» og så på riktig sted.</p>
          <PlaceConditions lat={f.geometry.coordinates[1]} lon={f.geometry.coordinates[0]} bestTimes={f.properties.bestTimes} />
          <PhotoGallery featureId={p.id} canEdit />
          <ShareInfo sensitive={sensitive} shareable={p.shareable} />
          <div className="actions">
            <DeleteButton label="Slett" confirming={confirmDelete} onToggle={setConfirmDelete} onConfirm={onDelete} />
            <button onClick={onPickInMap}>Velg i kartet</button>
            <button className="primary" onClick={onEditPoi}>Rediger</button>
          </div>
        </>
      ) : (
        <>
          <label className="field">
            Navn
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field">
            Beskrivelse
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          {dirty && (
            <button className="primary" onClick={() => onUpdate({ name: name.trim() || p.name, description })}>
              Lagre tekst
            </button>
          )}
          {length !== null && <p className="muted">Lengde: {(length / 1000).toFixed(2)} km</p>}
          {f.properties.kind === 'path' && <PhotoGallery featureId={p.id} canEdit />}

          {f.properties.kind === 'track' && (
            <>
              <p className="muted">
                Importert fra {f.properties.source.fileName}
                {f.properties.source.creator ? ` (${f.properties.source.creator})` : ''}.
                {f.properties.times?.length ? ` ${f.properties.times.length} tidsstemplede punkter.` : ''}
              </p>
              <p className="hint">
                Et GPS-spor er rådata og regnes ikke som en sti. Lag et sti-utkast hvis sporet følger en faktisk sti, og
                godkjenn det etter at du har kontrollert det.
              </p>
              <div className="actions">
                <DeleteButton label="Slett spor" confirming={confirmDelete} onToggle={setConfirmDelete} onConfirm={onDelete} />
                <button className="primary" onClick={onCreatePathFromTrack}>Lag sti-utkast</button>
              </div>
            </>
          )}

          {f.properties.kind === 'path' && (
            <>
              <p>
                Status:{' '}
                <span className={`badge ${f.properties.status}`}>{f.properties.status === 'godkjent' ? 'Godkjent' : 'Utkast'}</span>
              </p>
              <label className="toggle">
                <input type="checkbox" checked={p.sensitive} onChange={(e) => onUpdate({ sensitive: e.target.checked, shareable: e.target.checked ? false : p.shareable })} />
                🔒 Sårbar (f.eks. går gjennom hekkeområde)
              </label>
              <label className="toggle">
                <input type="checkbox" checked={p.shareable && !sensitive} disabled={sensitive} onChange={(e) => onUpdate({ shareable: e.target.checked })} />
                Kan deles
              </label>
              <div className="actions wrap">
                <DeleteButton label="Slett" confirming={confirmDelete} onToggle={setConfirmDelete} onConfirm={onDelete} />
                <button onClick={onEditGeometry}>Rediger punkter</button>
                <button onClick={() => onExtend('end')}>Forleng fra slutten</button>
                <button onClick={() => onExtend('start')}>Forleng fra starten</button>
                {f.properties.status === 'utkast' ? (
                  <button className="primary" onClick={() => onUpdate({ status: 'godkjent' })}>Godkjenn sti</button>
                ) : (
                  <button onClick={() => onUpdate({ status: 'utkast' })}>Sett til utkast</button>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function ShareInfo({ sensitive, shareable }: { sensitive: boolean; shareable: boolean }) {
  if (sensitive) return <p className="hint">🔒 Sårbar – holdes privat og tas aldri med i delbar eksport.</p>
  return <p className="hint">{shareable ? 'Merket som delbar.' : 'Privat (ikke merket som delbar).'}</p>
}

function DeleteButton({ label, confirming, onToggle, onConfirm }: { label: string; confirming: boolean; onToggle: (v: boolean) => void; onConfirm: () => void }) {
  if (!confirming)
    return (
      <button className="danger" onClick={() => onToggle(true)}>
        {label}
      </button>
    )
  return (
    <span className="confirm-delete">
      <button className="danger" onClick={onConfirm}>
        Ja, slett
      </button>
      <button onClick={() => onToggle(false)}>Angre</button>
    </span>
  )
}

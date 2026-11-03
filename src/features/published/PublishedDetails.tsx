import { POI_CATEGORIES, type MapFeature } from '../../data/model'
import { PlaceConditions } from '../conditions/PlaceConditions'
import { lineLengthMeters } from '../details/geo'

interface Props {
  feature: MapFeature
  canEdit: boolean
  onCreatePoi: () => void
  onClose: () => void
}

/** Skrivebeskyttet visning av et objekt fra det publiserte datasettet. */
export function PublishedDetails({ feature: f, canEdit, onCreatePoi, onClose }: Props) {
  const p = f.properties
  const isPoi = f.properties.kind === 'poi' && f.geometry.type === 'Point'
  const length = f.geometry.type !== 'Point' ? lineLengthMeters(f.geometry) : null

  return (
    <div className="panel-section">
      <div className="details-head">
        <span className="kind">{p.kind === 'poi' ? 'Publisert plass' : 'Publisert rute'}</span>
        <button className="icon" onClick={onClose} aria-label="Lukk">✕</button>
      </div>
      <h3>
        {f.properties.kind === 'poi' ? `${POI_CATEGORIES[f.properties.category].symbol} ` : ''}
        {p.name}
      </h3>
      {f.properties.kind === 'poi' && <p className="muted">{POI_CATEGORIES[f.properties.category].label}</p>}
      {length !== null && <p className="muted">Lengde: {(length / 1000).toFixed(2)} km</p>}
      {p.description && <p className="desc">{p.description}</p>}
      {isPoi && f.properties.kind === 'poi' && f.geometry.type === 'Point' && (
        <>
          <p className="coords">
            {f.geometry.coordinates[1].toFixed(6)}, {f.geometry.coordinates[0].toFixed(6)}
          </p>
          <PlaceConditions lat={f.geometry.coordinates[1]} lon={f.geometry.coordinates[0]} bestTimes={f.properties.bestTimes} />
        </>
      )}
      {canEdit && (
        <div className="actions">
          <button className="primary" onClick={onCreatePoi}>Lag eget punkt her</button>
        </div>
      )}
    </div>
  )
}

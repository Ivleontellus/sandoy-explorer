import { POI_CATEGORIES } from '../../data/model'
import { PlaceConditions } from '../conditions/PlaceConditions'
import { LinkedText, WebsiteButton } from '../common/Links'
import { PublishedPhotos } from '../photos/PhotoGallery'

const PUBLISHED_BASE = `${import.meta.env.BASE_URL}data/`
import { GUIDE_ATTRIBUTION, GUIDE_UNPLACED, SPOT_GROUPS, groupOf, type GuideSpot, type GuideTrail, type ResolvedSpot, type SpotGroup } from './guide'

interface TrailListProps {
  trails: GuideTrail[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDrawTrail: (trail: GuideTrail) => void
}

/** Liste over kjente turruter, vist under laget i Kartlag-fanen. */
export function TrailList({ trails, selectedId, onSelect, onDrawTrail }: TrailListProps) {
  return (
    <div className="guide-list">
      <ul className="feature-list">
        {trails.map((t) => (
          <li key={t.id}>
            <button className={t.id === selectedId ? 'active' : ''} onClick={() => onSelect(t.id)}>
              <span className="sym trail-swatch" style={{ background: t.color }} />
              <span className="name">{t.name}</span>
              <span className="muted">{t.lengthKm} km</span>
              {!t.geometry && <span className="badge utkast">ikke tegnet</span>}
            </button>
          </li>
        ))}
      </ul>
      {trails.filter((t) => !t.geometry).length > 0 && (
        <p className="hint">
          Stier uten linje kan du tegne inn selv:{' '}
          {trails.filter((t) => !t.geometry).map((t) => (
            <button key={t.id} className="link" onClick={() => onDrawTrail(t)}>
              tegn {t.name}
            </button>
          ))}
        </p>
      )}
      <p className="hint">{GUIDE_ATTRIBUTION}.</p>
    </div>
  )
}

interface SpotListProps {
  spots: ResolvedSpot[]
  selectedId: string | null
  groupsOff: SpotGroup['id'][]
  onToggleGroup: (id: SpotGroup['id']) => void
  onSelect: (id: string) => void
  onUnhide: (id: string) => void
}

/** Kjente plasser gruppert (fiske, bading, kafé …), hver gruppe kan slås av og på. Skjulte vises nederst. */
export function SpotList({ spots, selectedId, groupsOff, onToggleGroup, onSelect, onUnhide }: SpotListProps) {
  const hidden = spots.filter((s) => s.hidden)
  return (
    <div className="guide-list">
      {SPOT_GROUPS.map((g) => {
        const items = spots.filter((s) => !s.hidden && groupOf(s.type) === g.id)
        if (!items.length) return null
        const on = !groupsOff.includes(g.id)
        return (
          <div key={g.id} className="spot-group">
            <label className="toggle sub">
              <input type="checkbox" checked={on} onChange={() => onToggleGroup(g.id)} />
              <span className="sym">{g.symbol}</span>
              {g.label}
              <span className="count">{items.length}</span>
            </label>
            {on && (
              <ul className="feature-list">
                {items.map((s) => (
                  <li key={s.id}>
                    <button className={s.id === selectedId ? 'active' : ''} onClick={() => onSelect(s.id)}>
                      <span className="sym">{POI_CATEGORIES[s.type].symbol}</span>
                      <span className="name">{s.name}</span>
                      {s.website && <span title="Har egen nettside">🌐</span>}
                      {s.approximate && !s.moved && <span className="badge utkast" title="Omtrentlig plassering">?</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
      {hidden.length > 0 && (
        <p className="hint">
          Skjult:{' '}
          {hidden.map((s) => (
            <button key={s.id} className="link" onClick={() => onUnhide(s.id)}>
              {s.name} ↺
            </button>
          ))}
        </p>
      )}
      <p className="hint">
        Ikke stedfestet: {GUIDE_UNPLACED.join(', ')}. {GUIDE_ATTRIBUTION}.
      </p>
    </div>
  )
}

interface DetailProps {
  item: GuideTrail | ResolvedSpot
  onCreatePoi: (spot: GuideSpot) => void
  onDrawTrail: (trail: GuideTrail) => void
  /** Kopier en kjent tur med geometri til et eget, redigerbart sti-utkast. */
  onCopyTrail: (trail: GuideTrail) => void
  /** Start «trykk i kartet»-modus for å plassere punktet. */
  onPickInMap: (spot: GuideSpot) => void
  onResetPosition: (spot: GuideSpot) => void
  /** Skjul plassen i kartet på denne enheten. */
  onHide: (spot: GuideSpot) => void
  onClose: () => void
  /** Redigeringsmodus: vis flytt/skjul/kopier-knapper. */
  canEdit: boolean
}

export function GuideDetails({ item, onCreatePoi, onDrawTrail, onCopyTrail, onPickInMap, onResetPosition, onHide, onClose, canEdit }: DetailProps) {
  const isTrail = 'lengthKm' in item
  return (
    <div className="panel-section">
      <div className="details-head">
        <span className="kind">{isTrail ? 'Kjent turrute' : 'Kjent plass'}</span>
        <button className="icon" onClick={onClose} aria-label="Lukk">✕</button>
      </div>
      {isTrail ? (
        <>
          <h3>
            <span className="trail-swatch inline" style={{ background: item.color }} /> {item.name}
          </h3>
          <p className="muted">{item.lengthKm} km</p>
          <p className="desc">{item.description}</p>
          {item.via.length > 0 && <p className="muted">Via: {item.via.join(' → ')}</p>}
          {!item.geometry && !canEdit ? (
            <p className="hint">Denne stien finnes ikke som digital linje ennå.</p>
          ) : !item.geometry ? (
            <>
              <p className="hint">Denne stien finnes ikke som digital linje. Tegn den inn i kartet, så lagres den som ditt eget sti-utkast.</p>
              <div className="actions">
                <button className="primary" onClick={() => onDrawTrail(item)}>Tegn inn {item.name}</button>
              </div>
            </>
          ) : canEdit && !item.published ? (
            <>
              <p className="hint">Vil du rette eller fullføre ruta? Lag en egen kopi, rediger og forleng den, godkjenn og publiser – da erstatter den denne linja for alle.</p>
              <div className="actions">
                <button className="primary" onClick={() => onCopyTrail(item)}>Lag eget sti-utkast av linja</button>
              </div>
            </>
          ) : canEdit && item.published ? (
            <p className="hint">Publisert fra dine stier. Endre stien under Mine data og trykk «Oppdater publisert».</p>
          ) : null}
        </>
      ) : (
        <>
          <h3>
            {POI_CATEGORIES[item.type].symbol} {item.name}
          </h3>
          <p className="muted">{POI_CATEGORIES[item.type].label}</p>
          {item.note && (
            <p className="desc">
              <LinkedText text={item.note} />
            </p>
          )}
          {item.photos && <PublishedPhotos paths={item.photos} baseUrl={PUBLISHED_BASE} />}
          {item.website && (
            <div className="actions">
              <WebsiteButton url={item.website} />
            </div>
          )}
          <p className="coords">
            {item.position[0].toFixed(5)}, {item.position[1].toFixed(5)}
            {item.moved && canEdit && <span className="muted"> · flyttet av deg</span>}
          </p>
          <PlaceConditions lat={item.position[0]} lon={item.position[1]} bestTimes={item.bestTimes} />
          {item.approximate && !item.moved && <p className="warning">Plasseringen er omtrentlig{canEdit ? '. Dra markøren i kartet eller trykk «Velg i kartet»' : ''}.</p>}
          {item.published ? (
            canEdit && <p className="hint">Publisert fra dine registreringer. Endre punktet under Mine data og trykk «Oppdater publisert».</p>
          ) : (
            <p className="hint">Kilde: {item.source}.{canEdit ? ' Flyttinger og skjuling lagres bare på denne enheten. Har du laget et eget punkt for stedet, kan du skjule dette.' : ''}</p>
          )}
          {canEdit && !item.published && (
          <div className="actions wrap">
            <button className="danger" onClick={() => onHide(item)}>Skjul plass</button>
            {item.moved && <button onClick={() => onResetPosition(item)}>Tilbakestill plass</button>}
            <button onClick={() => onPickInMap(item)}>Velg i kartet</button>
            <button className="primary" onClick={() => onCreatePoi(item)}>Lag eget punkt her</button>
          </div>
          )}
        </>
      )}
      <p className="hint">{GUIDE_ATTRIBUTION}</p>
    </div>
  )
}

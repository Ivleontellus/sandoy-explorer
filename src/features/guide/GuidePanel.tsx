import { POI_CATEGORIES } from '../../data/model'
import { GUIDE_ATTRIBUTION, GUIDE_TRAILS, GUIDE_UNPLACED, type GuideSpot, type GuideTrail, type ResolvedSpot } from './guide'

interface TrailListProps {
  selectedId: string | null
  onSelect: (id: string) => void
  onDrawTrail: (trail: GuideTrail) => void
}

/** Liste over kjente turruter, vist under laget i Kartlag-fanen. */
export function TrailList({ selectedId, onSelect, onDrawTrail }: TrailListProps) {
  return (
    <div className="guide-list">
      <ul className="feature-list">
        {GUIDE_TRAILS.map((t) => (
          <li key={t.id}>
            <button className={t.id === selectedId ? 'active' : ''} onClick={() => onSelect(t.id)}>
              <span className="sym trail-swatch" style={{ background: t.color }} />
              <span className="name">{t.name}</span>
              <span className="muted">{t.lengthKm} km</span>
              {!t.geometry && <span className="badge utkast">ikke tegnet</span>}
              {t.reconstructed && <span className="badge utkast" title="Rutet gjennom OSM-stinettet etter turkartet">rekonstruert</span>}
            </button>
          </li>
        ))}
      </ul>
      {GUIDE_TRAILS.filter((t) => !t.geometry).length > 0 && (
        <p className="hint">
          Stier uten linje kan du tegne inn selv:{' '}
          {GUIDE_TRAILS.filter((t) => !t.geometry).map((t) => (
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
  onSelect: (id: string) => void
  onUnhide: (id: string) => void
}

/** Liste over kjente plasser, vist under laget i Kartlag-fanen. Skjulte vises nederst og kan hentes fram. */
export function SpotList({ spots, selectedId, onSelect, onUnhide }: SpotListProps) {
  const hidden = spots.filter((s) => s.hidden)
  return (
    <div className="guide-list">
      <ul className="feature-list">
        {spots.filter((s) => !s.hidden).map((s) => (
          <li key={s.id}>
            <button className={s.id === selectedId ? 'active' : ''} onClick={() => onSelect(s.id)}>
              <span className="sym">{POI_CATEGORIES[s.type].symbol}</span>
              <span className="name">{s.name}</span>
              <span className="muted">{POI_CATEGORIES[s.type].label}</span>
              {s.approximate && !s.moved && <span className="badge utkast" title="Omtrentlig plassering – flytt markøren">?</span>}
            </button>
          </li>
        ))}
      </ul>
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
          <p className="muted">Via: {item.via.join(' → ')}</p>
          {item.reconstructed && (
            <p className="warning">Linja er rekonstruert ved å følge OpenStreetMaps veier og stier mellom stedene i turkartet. Kontroller på tur – lag gjerne ditt eget sti-utkast fra den.</p>
          )}
          {!item.geometry && !canEdit ? (
            <p className="hint">Denne stien finnes ikke som digital linje ennå.</p>
          ) : !item.geometry ? (
            <>
              <p className="hint">Denne stien finnes ikke som digital linje. Tegn den inn i kartet, så lagres den som ditt eget sti-utkast.</p>
              <div className="actions">
                <button className="primary" onClick={() => onDrawTrail(item)}>Tegn inn {item.name}</button>
              </div>
            </>
          ) : canEdit ? (
            <div className="actions">
              <button className="primary" onClick={() => onCopyTrail(item)}>Lag eget sti-utkast av linja</button>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <h3>
            {POI_CATEGORIES[item.type].symbol} {item.name}
          </h3>
          <p className="muted">{POI_CATEGORIES[item.type].label}</p>
          {item.note && <p className="desc">{item.note}</p>}
          <p className="coords">
            {item.position[0].toFixed(5)}, {item.position[1].toFixed(5)}
            {item.moved && <span className="muted"> · flyttet av deg</span>}
          </p>
          {item.approximate && !item.moved && <p className="warning">Plasseringen er omtrentlig{canEdit ? '. Dra markøren i kartet eller trykk «Velg i kartet»' : ''}.</p>}
          <p className="hint">Kilde: {item.source}.{canEdit ? ' Flyttinger og skjuling lagres bare på denne enheten. Har du laget et eget punkt for stedet, kan du skjule dette.' : ''}</p>
          {canEdit && (
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

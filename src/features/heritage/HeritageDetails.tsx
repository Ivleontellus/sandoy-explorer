import { ART_LABELS, CATEGORY_LABELS, HERITAGE_GLOSSARY, PROTECTION_LABELS, type HeritageSite } from './heritageApi'
import summariesJson from './summaries.json'

const SUMMARIES = summariesJson as Record<string, string>

/** Lettlest sammendrag: håndskrevet der det finnes, ellers en generell setning ut fra typen. */
function summaryFor(site: HeritageSite): string {
  if (SUMMARIES[site.id]) return SUMMARIES[site.id]
  const art = ART_LABELS[site.art]
  return art ? `${art}. Ingen lettlest beskrivelse ennå – se originalteksten under.` : 'Ingen lettlest beskrivelse ennå – se originalteksten under.'
}

interface Props {
  site: HeritageSite
  onCreatePoi: () => void
  onClose: () => void
}

/** Skrivebeskyttet visning av et offentlig kulturminne. Egne notater lages som eget, privat punkt. */
export function HeritageDetails({ site, onCreatePoi, onClose }: Props) {
  return (
    <div className="panel-section">
      <div className="details-head">
        <span className="kind">Kulturminne · Riksantikvaren</span>
        <button className="icon" onClick={onClose} aria-label="Lukk">✕</button>
      </div>
      <h3>⚑ {site.name}</h3>
      <p className="muted">
        {ART_LABELS[site.art] ?? CATEGORY_LABELS[site.category] ?? site.category}
        {site.protection && ` · ${PROTECTION_LABELS[site.protection] ?? site.protection}`}
      </p>
      <p className="desc summary">{summaryFor(site)}</p>
      {site.art === '20159' && <p className="hint">{HERITAGE_GLOSSARY.Hvalertufter}</p>}
      {site.info && (
        <details className="notes">
          <summary>Originaltekst fra Riksantikvarens register</summary>
          <p className="desc">{site.info}</p>
        </details>
      )}
      <p className="coords">
        {site.centroid[0].toFixed(5)}, {site.centroid[1].toFixed(5)}
      </p>
      {site.link && (
        <p>
          <a href={site.link} target="_blank" rel="noreferrer">Åpne i Kulturminnesøk ↗</a>
        </p>
      )}
      <p className="hint">Offentlige data. Automatisk fredete kulturminner har en sikringssone på 5 meter – ikke grav eller flytt stein.</p>
      <div className="actions">
        <button className="primary" onClick={onCreatePoi}>Lag eget punkt her</button>
      </div>
    </div>
  )
}

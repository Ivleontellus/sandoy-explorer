import {
  BUILDING_TYPE_LABELS,
  CELLAR_LABELS,
  OUTER_WALL_LABELS,
  PERIOD_LABELS,
  PHYSICAL_LABELS,
  RELATION_LABELS,
  ROOF_LABELS,
  SOCIAL_LABELS,
  STATUS_LABELS,
  type SefrakBuilding,
} from './sefrakApi'

interface Props {
  building: SefrakBuilding
  canEdit: boolean
  onCreatePoi: () => void
  onClose: () => void
}

/** Lettlest setning satt sammen av kodene: «Laftet bolighus fra 1875–1899, bygd for en fisker.» */
function summaryFor(b: SefrakBuilding): string {
  const parts: string[] = []
  const wall = b.outerWall ? OUTER_WALL_LABELS[b.outerWall] : null
  const period = b.period ? PERIOD_LABELS[b.period] : null
  const what = b.name.split(',')[0].toLowerCase()
  let s = wall === 'Laftet tømmer' ? `Laftet ${what}` : wall === 'Bindingsverk' ? `${capitalize(what)} i bindingsverk` : capitalize(what)
  if (period) s += ` fra ${period}`
  parts.push(s)
  const who = b.socialMilieu ? SOCIAL_LABELS[b.socialMilieu] : null
  if (who && !['Næringsdrivende', 'Embetsverk / institusjon', 'Tjenestemenn, arbeidere, husmenn'].includes(who)) parts.push(`bygd for ${article(who)}`)
  let out = parts.join(', ') + '.'
  if (b.status === 2) out += ' Bygningen er fra før 1850 og er meldepliktig: riving eller større ombygging skal meldes til kommunen.'
  if (b.status === 0) out += ' Registrert som ruin eller fjernet.'
  return out
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function article(who: string): string {
  const lower = who.toLowerCase()
  if (/^(bonde|fisker|håndverker|arbeider|husmann|godseier|væreier|bedriftsherre|tjenestemann)/.test(lower)) return `en ${lower}`
  return lower
}

/** Skrivebeskyttet visning av en SEFRAK-bygning. Egne notater lages som eget, privat punkt. */
export function BuildingDetails({ building: b, canEdit, onCreatePoi, onClose }: Props) {
  const rows: [string, string | null][] = [
    ['Byggetid', b.period ? (PERIOD_LABELS[b.period] ?? b.period) : null],
    ['Bruk i dag (matrikkelen)', b.buildingType ? (BUILDING_TYPE_LABELS[b.buildingType] ?? `kode ${b.buildingType}`) : null],
    ['Etasjer', b.floors ? b.floors.replace('.', ',') : null],
    ['Yttervegg', b.outerWall ? (OUTER_WALL_LABELS[b.outerWall] ?? `kode ${b.outerWall}`) : null],
    ['Tak', b.roof ? (ROOF_LABELS[b.roof] ?? `kode ${b.roof}`) : null],
    ['Kjeller', b.cellar ? (CELLAR_LABELS[b.cellar] ?? `kode ${b.cellar}`) : null],
    ['Størrelse', b.length && b.width ? `${fmt(b.length)} × ${fmt(b.width)} m` : null],
    ['Bygd for', b.socialMilieu ? (SOCIAL_LABELS[b.socialMilieu] ?? null) : null],
    ['Omgivelser', b.physicalMilieu ? (PHYSICAL_LABELS[b.physicalMilieu] ?? null) : null],
    ['Plassering', b.relation ? (RELATION_LABELS[b.relation] ?? null) : null],
  ]

  return (
    <div className="panel-section">
      <div className="details-head">
        <span className="kind">SEFRAK-bygning · Riksantikvaren</span>
        <button className="icon" onClick={onClose} aria-label="Lukk">✕</button>
      </div>
      <h3>🏠 {b.name}</h3>
      {b.localName && <p className="muted">Lokalt navn: {b.localName}</p>}
      <p className="muted">{STATUS_LABELS[b.status] ?? ''}</p>
      <p className="desc summary">{summaryFor(b)}</p>
      <dl className="facts">
        {rows
          .filter((r): r is [string, string] => !!r[1])
          .map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
      </dl>
      <details className="notes">
        <summary>Om registreringen</summary>
        <p className="hint">
          SEFRAK-id {b.sefrakId}
          {b.askeladdenId ? `, Askeladden ${b.askeladdenId}` : ''}. Registrert i felt: {b.fieldRegistered ?? 'ukjent'}.
          Opplysningene er fra feltregistreringen og kan være utdaterte. Kilde: Riksantikvaren (NLOD).
        </p>
      </details>
      {canEdit && (
        <div className="actions">
          <button className="primary" onClick={onCreatePoi}>Lag eget punkt her</button>
        </div>
      )}
    </div>
  )
}

function fmt(m: number): string {
  return m.toFixed(1).replace('.', ',').replace(',0', '')
}

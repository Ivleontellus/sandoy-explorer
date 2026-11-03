import { useEffect, useState } from 'react'
import { DAYPARTS, POI_CATEGORIES, TIDE_PREFS, type BestTimes, type Daypart, type PoiCategory, type TidePreference } from '../../data/model'

export interface PoiFormValues {
  category: PoiCategory
  name: string
  description: string
  lat: number
  lon: number
  sensitive: boolean
  shareable: boolean
  bestTimes: BestTimes
}

export const EMPTY_BEST_TIMES: BestTimes = { daypart: [], tide: [] }

interface Props {
  initial: PoiFormValues
  title: string
  onSave: (v: PoiFormValues) => void
  onCancel: () => void
  onUseMyPosition?: () => Promise<[number, number] | null>
  /** Gjeldende posisjon i kartet. Endres den (markøren dras / «Velg i kartet»), oppdateres feltene. */
  livePosition?: [number, number]
}

function toggleIn<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

export function PoiForm({ initial, title, onSave, onCancel, onUseMyPosition, livePosition }: Props) {
  const [v, setV] = useState(initial)
  const [lat, setLat] = useState(initial.lat.toFixed(6))
  const [lon, setLon] = useState(initial.lon.toFixed(6))
  const liveKey = livePosition ? `${livePosition[0].toFixed(6)},${livePosition[1].toFixed(6)}` : null
  useEffect(() => {
    if (!liveKey) return
    const [la, lo] = liveKey.split(',')
    setLat(la)
    setLon(lo)
  }, [liveKey])
  const latN = Number(lat.replace(',', '.'))
  const lonN = Number(lon.replace(',', '.'))
  const coordsOk = Math.abs(latN) <= 90 && Math.abs(lonN) <= 180 && lat !== '' && lon !== ''
  const valid = v.name.trim() !== '' && coordsOk
  const bt = v.bestTimes

  const setCategory = (category: PoiCategory) => {
    // Bytte til en kategori som er sårbar som standard krysser av, men brukeren kan skru av etterpå.
    const sensitive = v.sensitive || !!POI_CATEGORIES[category].defaultSensitive
    setV({ ...v, category, sensitive, shareable: v.shareable && !sensitive })
  }

  return (
    <form
      className="panel-section"
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) {
          const note = bt.note?.trim()
          onSave({
            ...v,
            name: v.name.trim(),
            lat: latN,
            lon: lonN,
            shareable: v.shareable && !v.sensitive,
            bestTimes: { daypart: bt.daypart, tide: bt.tide, ...(note ? { note } : {}) },
          })
        }
      }}
    >
      <h3>{title}</h3>
      <label className="field">
        Kategori
        <select value={v.category} onChange={(e) => setCategory(e.target.value as PoiCategory)}>
          {Object.entries(POI_CATEGORIES).map(([id, c]) => (
            <option key={id} value={id}>
              {c.symbol} {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Navn
        <input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} autoFocus required />
      </label>
      <label className="field">
        Beskrivelse
        <textarea rows={3} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
      </label>
      <div className="row">
        <label className="field">
          Breddegrad
          <input inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} />
        </label>
        <label className="field">
          Lengdegrad
          <input inputMode="decimal" value={lon} onChange={(e) => setLon(e.target.value)} />
        </label>
      </div>
      {onUseMyPosition && (
        <button
          type="button"
          className="link"
          onClick={async () => {
            const p = await onUseMyPosition()
            if (p) {
              setLat(p[0].toFixed(6))
              setLon(p[1].toFixed(6))
            }
          }}
        >
          ◎ Bruk min GPS-posisjon
        </button>
      )}
      {!coordsOk && <p className="error">Ugyldige koordinater (desimalgrader, WGS84).</p>}

      <fieldset className="chips-field">
        <legend>Best på</legend>
        <div className="chips">
          {(Object.keys(DAYPARTS) as Daypart[]).map((d) => (
            <button
              key={d}
              type="button"
              className={`chip${bt.daypart.includes(d) ? ' on' : ''}`}
              aria-pressed={bt.daypart.includes(d)}
              onClick={() => setV({ ...v, bestTimes: { ...bt, daypart: toggleIn(bt.daypart, d) } })}
            >
              {DAYPARTS[d].label}
            </button>
          ))}
          {(Object.keys(TIDE_PREFS) as TidePreference[]).map((t) => (
            <button
              key={t}
              type="button"
              className={`chip tide${bt.tide.includes(t) ? ' on' : ''}`}
              aria-pressed={bt.tide.includes(t)}
              onClick={() => setV({ ...v, bestTimes: { ...bt, tide: toggleIn(bt.tide, t) } })}
            >
              {TIDE_PREFS[t]}
            </button>
          ))}
        </div>
        <input
          placeholder="Notat, f.eks. «best i sørvestlig vind»"
          value={bt.note ?? ''}
          onChange={(e) => setV({ ...v, bestTimes: { ...bt, note: e.target.value } })}
        />
      </fieldset>

      <label className="toggle">
        <input
          type="checkbox"
          checked={v.sensitive}
          onChange={(e) => setV({ ...v, sensitive: e.target.checked, shareable: e.target.checked ? false : v.shareable })}
        />
        🔒 Sårbar registrering {POI_CATEGORIES[v.category].defaultSensitive && <em>(standard for geologi)</em>}
      </label>
      <label className="toggle">
        <input
          type="checkbox"
          checked={v.shareable && !v.sensitive}
          disabled={v.sensitive}
          onChange={(e) => setV({ ...v, shareable: e.target.checked })}
        />
        Kan deles (tas med i delbar eksport)
      </label>

      <div className="actions">
        <button type="button" onClick={onCancel}>Avbryt</button>
        <button type="submit" className="primary" disabled={!valid}>Lagre</button>
      </div>
    </form>
  )
}

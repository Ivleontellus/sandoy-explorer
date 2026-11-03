import L from 'leaflet'
import type { Position } from 'geojson'
import { Marker, Polyline, Tooltip } from 'react-leaflet'
import { isSensitive, type MapFeature } from '../data/model'
import { poiIcon } from './icons'

export const toLatLng = (p: Position): [number, number] => [p[1], p[0]]

interface Props {
  features: MapFeature[]
  selectedId: string | null
  /** Objektet som redigeres tegnes av EditablePath i stedet. */
  hiddenId: string | null
  interactive: boolean
  onSelect: (id: string) => void
  /** Valgt punkt kan dras til nytt sted. */
  onMovePoi: (id: string, lonLat: Position) => void
}

export function FeatureLayers({ features, selectedId, hiddenId, interactive, onSelect, onMovePoi }: Props) {
  // Spor først, så stier, så punkter øverst.
  const order = { track: 0, path: 1, poi: 2 }
  const sorted = [...features].sort((a, b) => order[a.properties.kind] - order[b.properties.kind])

  return (
    <>
      {sorted.map((f) => {
        const p = f.properties
        if (p.id === hiddenId) return null
        const selected = p.id === selectedId
        // Stopp klikket her, ellers tolker kartet det som klikk i tomt område og fjerner valget.
        const handlers = interactive
          ? { click: (e: L.LeafletMouseEvent) => (L.DomEvent.stopPropagation(e), onSelect(p.id)) }
          : {}

        if (f.properties.kind === 'poi' && f.geometry.type === 'Point') {
          return (
            <Marker
              key={p.id}
              position={toLatLng(f.geometry.coordinates)}
              icon={poiIcon(f.properties.category, isSensitive(f), selected)}
              eventHandlers={{
                ...handlers,
                dragend: (e) => {
                  const ll = (e.target as L.Marker).getLatLng()
                  onMovePoi(p.id, [Number(ll.lng.toFixed(6)), Number(ll.lat.toFixed(6))])
                },
              }}
              interactive={interactive}
              draggable={selected && interactive}
            >
              <Tooltip direction="top" offset={[0, -14]}>
                {p.name}
                {selected ? ' – dra for å flytte' : ''}
              </Tooltip>
            </Marker>
          )
        }

        const g = f.geometry
        const positions =
          g.type === 'LineString'
            ? g.coordinates.map(toLatLng)
            : g.type === 'MultiLineString'
              ? g.coordinates.map((line) => line.map(toLatLng))
              : null
        if (!positions) return null

        const isTrack = p.kind === 'track'
        const isDraft = f.properties.kind === 'path' && f.properties.status === 'utkast'
        return (
          <Polyline
            key={p.id}
            positions={positions}
            eventHandlers={handlers}
            interactive={interactive}
            pathOptions={{
              color: isTrack ? '#e65100' : '#1f4d3a',
              weight: selected ? 7 : isTrack ? 3 : 5,
              opacity: isTrack ? 0.75 : 0.95,
              dashArray: isDraft ? '8 8' : isTrack ? '2 6' : undefined,
              lineCap: 'round',
              bubblingMouseEvents: false,
            }}
          >
            <Tooltip sticky>
              {p.name}
              {isTrack ? ' (GPS-spor)' : isDraft ? ' (utkast)' : ''}
            </Tooltip>
          </Polyline>
        )
      })}
    </>
  )
}

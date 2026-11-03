import L from 'leaflet'
import { Marker, Polyline, Tooltip } from 'react-leaflet'
import { guideIcon } from '../../map/icons'
import { GUIDE_TRAILS, type ResolvedSpot } from './guide'

interface Props {
  showTrails: boolean
  spots: ResolvedSpot[]
  selectedId: string | null
  interactive: boolean
  onSelect: (id: string) => void
  /** Kalles når brukeren drar den valgte markøren til et nytt sted. */
  onMove: (id: string, position: [number, number]) => void
}

const toLatLng = (p: number[]): [number, number] => [p[1], p[0]]

/** Offentlige kjente turer (de som har geometri) og plasser fra turkartet. Valgt plass kan dras. */
export function GuideLayer({ showTrails, spots, selectedId, interactive, onSelect, onMove }: Props) {
  const handlers = (id: string) =>
    interactive ? { click: (e: L.LeafletMouseEvent) => (L.DomEvent.stopPropagation(e), onSelect(id)) } : {}

  return (
    <>
      {showTrails &&
        GUIDE_TRAILS.filter((t) => t.geometry).map((t) => (
        <Polyline
          key={t.id}
          positions={t.geometry!.coordinates.map(toLatLng)}
          interactive={interactive}
          eventHandlers={handlers(t.id)}
          pathOptions={{ color: t.color, weight: t.id === selectedId ? 7 : 4, opacity: 0.8, dashArray: '10 6', bubblingMouseEvents: false }}
        >
          <Tooltip sticky>{t.name} · {t.lengthKm} km</Tooltip>
        </Polyline>
        ))}
      {spots.map((s) => {
        const selected = s.id === selectedId
        return (
          <Marker
            key={s.id}
            position={s.position}
            icon={guideIcon(s.type, selected, s.approximate && !s.moved)}
            interactive={interactive}
            draggable={selected && interactive}
            eventHandlers={{
              ...handlers(s.id),
              dragend: (e) => {
                const ll = (e.target as L.Marker).getLatLng()
                onMove(s.id, [Number(ll.lat.toFixed(6)), Number(ll.lng.toFixed(6))])
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -12]}>
              {s.name}
              {selected ? ' – dra for å flytte' : ''}
            </Tooltip>
          </Marker>
        )
      })}
    </>
  )
}

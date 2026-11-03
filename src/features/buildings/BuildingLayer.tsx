import L from 'leaflet'
import { useState } from 'react'
import { Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import { buildingIcon } from '../../map/icons'
import { PERIOD_LABELS, type SefrakBuilding } from './sefrakApi'

interface Props {
  buildings: SefrakBuilding[]
  selectedId: string | null
  interactive: boolean
  onSelect: (id: string) => void
}

/** Under dette zoomnivået vises bare de meldepliktige (eldste) bygningene, ellers blir det 340 prikker oppå hverandre. */
const ALL_MIN_ZOOM = 15

/** Offentlige SEFRAK-bygninger: liten husmarkør, meldepliktige (før 1850) uthevet. */
export function BuildingLayer({ buildings, selectedId, interactive, onSelect }: Props) {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })

  const shown = zoom >= ALL_MIN_ZOOM ? buildings : buildings.filter((b) => b.status === 2 || b.id === selectedId)

  return (
    <>
      {shown.map((b) => {
        const selected = b.id === selectedId
        return (
          <Marker
            key={b.id}
            position={b.position}
            icon={buildingIcon(b.status === 2, b.status === 0, selected)}
            interactive={interactive}
            eventHandlers={interactive ? { click: (e) => (L.DomEvent.stopPropagation(e), onSelect(b.id)) } : {}}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              {b.name}
              {b.period && PERIOD_LABELS[b.period] ? ` · ${PERIOD_LABELS[b.period]}` : ''}
            </Tooltip>
          </Marker>
        )
      })}
    </>
  )
}

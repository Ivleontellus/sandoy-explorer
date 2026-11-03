import L from 'leaflet'
import { useState } from 'react'
import { GeoJSON, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import { heritageIcon } from '../../map/icons'
import type { HeritageSite } from './heritageApi'

interface Props {
  sites: HeritageSite[]
  selectedId: string | null
  interactive: boolean
  onSelect: (id: string) => void
}

const OUTLINE_MIN_ZOOM = 16

/** Offentlige kulturminner: markør i sentroiden, og omriss av lokaliteten når man er zoomet inn. */
export function HeritageLayer({ sites, selectedId, interactive, onSelect }: Props) {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })

  return (
    <>
      {sites.map((s) => {
        const selected = s.id === selectedId
        return (
          <Marker
            key={s.id}
            position={s.centroid}
            icon={heritageIcon(selected)}
            interactive={interactive}
            eventHandlers={interactive ? { click: (e) => (L.DomEvent.stopPropagation(e), onSelect(s.id)) } : {}}
          >
            <Tooltip direction="top" offset={[0, -12]}>{s.name}</Tooltip>
          </Marker>
        )
      })}
      {(zoom >= OUTLINE_MIN_ZOOM || selectedId) &&
        sites
          .filter((s) => zoom >= OUTLINE_MIN_ZOOM || s.id === selectedId)
          .map((s) => (
            <GeoJSON
              key={`${s.id}-${s.id === selectedId}`}
              data={s.geometry}
              interactive={false}
              style={{ color: '#6d4c41', weight: s.id === selectedId ? 3 : 1.5, fillOpacity: s.id === selectedId ? 0.25 : 0.1, dashArray: '4 4' }}
            />
          ))}
    </>
  )
}

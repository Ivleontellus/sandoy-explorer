import L from 'leaflet'
import { useState } from 'react'
import { GeoJSON, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import { heritageIcon } from '../../map/icons'
import type { HeritageSite } from './heritageApi'

interface Props {
  sites: HeritageSite[]
  selectedId: string | null
  /** Kulturminner som har en historie på samme sted: markøren skjules, omrisset vises fortsatt. */
  hiddenIds?: Set<string>
  interactive: boolean
  onSelect: (id: string) => void
}

/** Kulturminnene er mange, så markørene kommer først når man zoomer inn. Valgt kulturminne vises alltid. */
export const HERITAGE_MIN_ZOOM = 15.5
const OUTLINE_MIN_ZOOM = 16

/** Offentlige kulturminner: markør i sentroiden, og omriss av lokaliteten når man er zoomet inn. */
export function HeritageLayer({ sites, selectedId, hiddenIds, interactive, onSelect }: Props) {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })

  return (
    <>
      {sites.filter((s) => (zoom >= HERITAGE_MIN_ZOOM && !hiddenIds?.has(s.id)) || s.id === selectedId).map((s) => {
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

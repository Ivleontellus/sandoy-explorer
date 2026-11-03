import type { Map as LeafletMap } from 'leaflet'
import { useState } from 'react'
import { Marker, Polyline, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import { sunIcon } from '../../map/icons'
import { destination, sunPosition } from './sun'

/**
 * Viser solas retning fra midten av den synlige kartflaten: gul linje mot sola og stiplet linje i skyggeretningen.
 * Ingen terrengskygger ennå – det kommer som en egen modul basert på høydemodell.
 */
export function SunOverlay({ date }: { date: Date }) {
  const map = useMap()
  const [center, setCenter] = useState(() => visibleCenter(map))
  const [size, setSize] = useState(() => viewMeters(map))
  useMapEvents({
    move: () => setCenter(visibleCenter(map)),
    zoomend: () => setSize(viewMeters(map)),
    resize: () => {
      setSize(viewMeters(map))
      setCenter(visibleCenter(map))
    },
  })

  const { azimuthDeg, altitudeDeg } = sunPosition(date, center.lat, center.lng)
  const below = altitudeDeg <= 0
  const len = size * 0.35
  const sunPt = destination(center.lat, center.lng, azimuthDeg, len)
  const shadowPt = destination(center.lat, center.lng, (azimuthDeg + 180) % 360, len * 0.6)
  const c: [number, number] = [center.lat, center.lng]

  return (
    <>
      <Polyline
        positions={[c, sunPt]}
        interactive={false}
        pathOptions={{ color: below ? '#78909c' : '#f9a825', weight: 4, dashArray: below ? '4 8' : undefined }}
      />
      {!below && (
        <Polyline positions={[c, shadowPt]} interactive={false} pathOptions={{ color: '#37474f', weight: 3, dashArray: '6 6', opacity: 0.7 }} />
      )}
      <Marker position={sunPt} icon={sunIcon} interactive={!below} opacity={below ? 0.4 : 1}>
        <Tooltip permanent direction="right" offset={[16, 0]} className="sun-tooltip">
          {Math.round(azimuthDeg)}° · {altitudeDeg.toFixed(1)}° {below ? '(under horisonten)' : ''}
        </Tooltip>
      </Marker>
    </>
  )
}

/** Midten av kartflaten som ikke dekkes av panelet (samme bruddpunkt som App.css). */
function visibleCenter(map: LeafletMap) {
  const size = map.getSize()
  const desktop = window.innerWidth >= 900
  return map.containerPointToLatLng([desktop ? (size.x - 440) / 2 : size.x / 2, desktop ? size.y / 2 : size.y * 0.3])
}

function viewMeters(map: LeafletMap): number {
  const b = map.getBounds()
  return Math.min(b.getNorthWest().distanceTo(b.getSouthWest()), b.getNorthWest().distanceTo(b.getNorthEast()))
}

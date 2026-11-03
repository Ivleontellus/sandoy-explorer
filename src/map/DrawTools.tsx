import L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import type { Position } from 'geojson'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

// Geoman skal bare røre lag vi eksplisitt gir pmIgnore: false (også selve kartet, se MapView).
L.PM.setOptIn(true)

const toPositions = (latlngs: L.LatLng[]): Position[] => latlngs.map((ll) => [ll.lng, ll.lat])

/** Aktiverer tegning av en ny linje. Kaller onDone med koordinatene når brukeren avslutter. */
export function DrawLine({ onDone }: { onDone: (coords: Position[]) => void }) {
  const map = useMap()
  const cb = useRef(onDone)
  useLayoutEffect(() => {
    cb.current = onDone
  })

  useEffect(() => {
    map.pm.setLang('no')
    map.pm.enableDraw('Line', {
      snappable: true,
      pathOptions: { color: '#1f4d3a', weight: 5, dashArray: '8 8' },
      templineStyle: { color: '#1f4d3a' },
      hintlineStyle: { color: '#1f4d3a', dashArray: '4 6' },
      finishOn: 'dblclick',
    })
    const handler = (e: { layer: L.Layer }) => {
      const layer = e.layer as L.Polyline
      const coords = toPositions(layer.getLatLngs() as L.LatLng[])
      map.removeLayer(layer)
      if (coords.length >= 2) cb.current(coords)
    }
    map.on('pm:create', handler)
    return () => {
      map.off('pm:create', handler)
      map.pm.disableDraw()
    }
  }, [map])

  return null
}

/** Fullfører pågående linjetegning (for en «Ferdig»-knapp på mobil der dobbeltklikk er knotete). */
export function finishDrawing(map: L.Map) {
  const draw = (map.pm.Draw as unknown as { Line: { _finishShape?: () => void } }).Line
  draw._finishShape?.()
}

/** Gjør en eksisterende linje redigerbar (flytt, legg til og slett punkter). */
export function EditLine({
  initial,
  onChange,
}: {
  initial: Position[]
  onChange: (coords: Position[]) => void
}) {
  const map = useMap()
  const cb = useRef(onChange)
  useLayoutEffect(() => {
    cb.current = onChange
  })
  const start = useRef(initial)

  useEffect(() => {
    const layer = L.polyline(
      start.current.map((p) => [p[1], p[0]] as [number, number]),
      { pmIgnore: false, color: '#c62828', weight: 6 },
    ).addTo(map)
    // Trykk på et punkt sletter det (høyreklikk finnes ikke på mobil); dra flytter; midtmarkørene legger til.
    layer.pm.enable({ allowSelfIntersection: true, removeLayerBelowMinVertexCount: false, removeVertexOn: 'click' })
    const handler = () => cb.current(toPositions(layer.getLatLngs() as L.LatLng[]))
    layer.on('pm:edit', handler)
    return () => {
      layer.off('pm:edit', handler)
      layer.pm.disable()
      map.removeLayer(layer)
    }
  }, [map])

  return null
}

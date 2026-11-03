import 'leaflet/dist/leaflet.css'
import L, { type Map as LeafletMap } from 'leaflet'
import type { Position } from 'geojson'
import { MapContainer, Marker, ScaleControl, TileLayer, Tooltip, WMSTileLayer, useMapEvents } from 'react-leaflet'
import type { MapFeature } from '../data/model'
import { SunOverlay } from '../features/sun/SunOverlay'
import { DrawLine, EditLine } from './DrawTools'
import { FeatureLayers } from './FeatureLayers'
import { GuideLayer } from '../features/guide/GuideLayer'
import type { ResolvedSpot } from '../features/guide/guide'
import { HeritageLayer } from '../features/heritage/HeritageLayer'
import type { HeritageSite } from '../features/heritage/heritageApi'
import { STOPS, STOP_ORDER, type StopId } from '../features/ferry/timetables'
import { ferryIcon, meIcon } from './icons'
import { BASEMAPS, DEFAULT_ZOOM, SANDOY_CENTER, WMS_OVERLAYS } from './publicLayers'

// Canvas med klikktoleranse gjør tynne linjer lette å treffe med fingeren.
const renderer = L.canvas({ tolerance: 10 })

export type MapMode = 'browse' | 'addPoi' | 'drawPath' | 'editPath' | 'pickPlace'

/** Valgt OFFENTLIG objekt, holdt adskilt fra brukerens egne registreringer. */
export type PublicSelection =
  | { kind: 'heritage'; id: string }
  | { kind: 'ferry'; stop: StopId }
  | { kind: 'guide'; id: string }
  | { kind: 'published'; id: string }
  | null

interface Props {
  basemapId: string
  activeOverlays: string[]
  features: MapFeature[]
  /** Publisert, skrivebeskyttet innhold. */
  publishedFeatures: MapFeature[]
  selectedId: string | null
  mode: MapMode
  editing: { id: string; initial: Position[] } | null
  sunDate: Date | null
  myPosition: [number, number] | null
  heritageSites: HeritageSite[]
  showFerryStops: boolean
  showTrails: boolean
  showSpots: boolean
  guideSpots: ResolvedSpot[]
  onMoveGuide: (id: string, position: [number, number]) => void
  onMovePoi: (id: string, lonLat: Position) => void
  selectedPublic: PublicSelection
  onSelectPublic: (sel: PublicSelection) => void
  onReady: (map: LeafletMap) => void
  onSelect: (id: string | null) => void
  onMapClick: (lat: number, lon: number) => void
  onPathDrawn: (coords: Position[]) => void
  onPathEdited: (id: string, coords: Position[]) => void
}

function ClickHandler({ mode, onMapClick, onSelect }: Pick<Props, 'mode' | 'onMapClick' | 'onSelect'>) {
  useMapEvents({
    click: (e) => {
      if (mode === 'addPoi' || mode === 'pickPlace') onMapClick(e.latlng.lat, e.latlng.lng)
      else if (mode === 'browse') onSelect(null)
    },
  })
  return null
}

export function MapView(props: Props) {
  const basemap = BASEMAPS.find((b) => b.id === props.basemapId) ?? BASEMAPS[0]
  const { mode, editing } = props

  return (
    <MapContainer
      center={SANDOY_CENTER}
      zoom={DEFAULT_ZOOM}
      maxZoom={19}
      renderer={renderer}
      pmIgnore={false}
      className={`map mode-${mode}`}
      ref={(m) => {
        if (m) props.onReady(m)
      }}
    >
      <TileLayer key={basemap.id} url={basemap.url} attribution={basemap.attribution} maxZoom={19} maxNativeZoom={basemap.maxZoom} />
      {WMS_OVERLAYS.filter((o) => props.activeOverlays.includes(o.id)).map((o) => (
        <WMSTileLayer
          key={o.id}
          url={o.url}
          params={{ layers: o.layers, format: 'image/png', transparent: true }}
          opacity={o.opacity}
          attribution={o.attribution}
        />
      ))}
      <ScaleControl imperial={false} position="bottomleft" />

      <FeatureLayers
        features={props.publishedFeatures}
        selectedId={props.selectedPublic?.kind === 'published' ? props.selectedPublic.id : null}
        hiddenId={null}
        interactive={mode === 'browse'}
        readonly
        onSelect={(id) => props.onSelectPublic({ kind: 'published', id })}
        onMovePoi={() => {}}
      />
      <FeatureLayers
        features={props.publishedFeatures}
        selectedId={props.selectedPublic?.kind === 'published' ? props.selectedPublic.id : null}
        hiddenId={null}
        interactive={mode === 'browse'}
        readonly
        onSelect={(id) => props.onSelectPublic({ kind: 'published', id })}
        onMovePoi={() => {}}
      />
      <FeatureLayers
        features={props.features}
        selectedId={props.selectedId}
        hiddenId={editing?.id ?? null}
        interactive={mode === 'browse'}
        onSelect={props.onSelect}
        onMovePoi={props.onMovePoi}
      />

      <HeritageLayer
        sites={props.heritageSites}
        selectedId={props.selectedPublic?.kind === 'heritage' ? props.selectedPublic.id : null}
        interactive={mode === 'browse'}
        onSelect={(id) => props.onSelectPublic({ kind: 'heritage', id })}
      />
      {(props.showTrails || props.showSpots) && (
        <GuideLayer
          showTrails={props.showTrails}
          spots={props.showSpots ? props.guideSpots.filter((s) => !s.hidden) : []}
          selectedId={props.selectedPublic?.kind === 'guide' ? props.selectedPublic.id : null}
          interactive={mode === 'browse'}
          onSelect={(id) => props.onSelectPublic({ kind: 'guide', id })}
          onMove={props.onMoveGuide}
        />
      )}
      {props.showFerryStops &&
        STOP_ORDER.map((id) => (
          <Marker
            key={id}
            position={STOPS[id].position}
            icon={ferryIcon}
            interactive={mode === 'browse'}
            eventHandlers={mode === 'browse' ? { click: (e) => (L.DomEvent.stopPropagation(e), props.onSelectPublic({ kind: 'ferry', stop: id })) } : {}}
          >
            <Tooltip direction="top" offset={[0, -12]}>{STOPS[id].name} fergeleie</Tooltip>
          </Marker>
        ))}

      {props.myPosition && <Marker position={props.myPosition} icon={meIcon} interactive={false} />}
      {props.sunDate && <SunOverlay date={props.sunDate} />}

      <ClickHandler mode={mode} onMapClick={props.onMapClick} onSelect={props.onSelect} />
      {mode === 'drawPath' && <DrawLine onDone={props.onPathDrawn} />}
      {mode === 'editPath' && editing && (
        <EditLine key={editing.id} initial={editing.initial} onChange={(c) => props.onPathEdited(editing.id, c)} />
      )}
    </MapContainer>
  )
}

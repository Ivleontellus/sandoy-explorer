import L, { type Map as LeafletMap } from 'leaflet'
import type { LineString, Position } from 'geojson'
import { useCallback, useMemo, useRef, useState } from 'react'
import { parseGpx, trackToLine } from './data/gpx'
import { baseProps, type MapFeature, type PathFeature, type PoiFeature, type TrackFeature } from './data/model'
import { useFeatureStore } from './data/store'
import { useAppMode } from './data/appMode'
import { usePublished } from './data/published'
import { PublishedDetails } from './features/published/PublishedDetails'
import { SettingsPanel } from './features/settings/SettingsPanel'
import { DataPanel } from './features/data/DataPanel'
import { FeatureDetails } from './features/details/FeatureDetails'
import { LayerPanel } from './features/layers/LayerPanel'
import { PoiForm, EMPTY_BEST_TIMES, type PoiFormValues } from './features/poi/PoiForm'
import { FerryPanel, loadRoute, type FerryRoute } from './features/ferry/FerryPanel'
import { HeritageDetails } from './features/heritage/HeritageDetails'
import { useHeritage } from './features/heritage/heritageApi'
import {
  GUIDE_TRAILS,
  loadGuideOverrides,
  loadHiddenSpots,
  resolveSpots,
  saveGuideOverrides,
  saveHiddenSpots,
  type GuideOverrides,
  type GuideSpot,
  type GuideTrail,
} from './features/guide/guide'
import { GuideDetails, SpotList, TrailList } from './features/guide/GuidePanel'
import { SunPanel } from './features/sun/SunPanel'
import { finishDrawing } from './map/DrawTools'
import { DEFAULT_VISIBILITY, themeOf, type LayerVisibility } from './map/layers'
import { MapView, type MapMode, type PublicSelection } from './map/MapView'
import { BASEMAPS, SANDOY_CENTER, type PublicFeatureSource } from './map/publicLayers'
import './App.css'

type Tab = 'lag' | 'data' | 'bat' | 'sol'
const DEFAULT_SOURCES: PublicFeatureSource['id'][] = ['publisert']

/** Hold zoom-til-objekt fri av panelet (sidepanel på desktop, bunnark på mobil). */
const fitPadding = (): L.FitBoundsOptions =>
  window.innerWidth >= 900
    ? { paddingTopLeft: [40, 40], paddingBottomRight: [460, 40] }
    : { paddingTopLeft: [30, 80], paddingBottomRight: [80, window.innerHeight * 0.45] }
/** Panorer så punktet havner midt i den SYNLIGE kartflaten (utenfor sidepanel/bunnark), ikke bak panelet. */
const panToVisible = (map: LeafletMap, latlng: [number, number]) => {
  const size = map.getSize()
  const desktop = window.innerWidth >= 900
  const target = desktop ? L.point((size.x - 440) / 2, size.y / 2) : L.point(size.x / 2, size.y * 0.3)
  const centerPx = map.project(latlng, map.getZoom()).subtract(target.subtract(size.divideBy(2)))
  map.panTo(map.unproject(centerPx, map.getZoom()))
}

type PoiFormState = { id: string | null; initial: PoiFormValues }
type EditState = { id: string; initial: Position[]; original: LineString }

export default function App() {
  const { features, dispatch, byId } = useFeatureStore()
  const [map, setMap] = useState<LeafletMap | null>(null)
  const [basemapId, setBasemapId] = useState(BASEMAPS[0].id)
  const [overlays, setOverlays] = useState<string[]>([])
  const [sources, setSources] = useState<PublicFeatureSource['id'][]>(DEFAULT_SOURCES)
  const [selectedPublic, setSelectedPublic] = useState<PublicSelection>(null)
  const [ferryRoute, setFerryRoute] = useState<FerryRoute>(loadRoute)
  const [visibility, setVisibility] = useState<LayerVisibility>(DEFAULT_VISIBILITY)
  const [tab, setTab] = useState<Tab>('lag')
  const [panelOpen, setPanelOpen] = useState(false)
  const [mode, setMode] = useState<MapMode>('browse')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [poiForm, setPoiForm] = useState<PoiFormState | null>(null)
  const [editing, setEditing] = useState<EditState | null>(null)
  const [sunEnabled, setSunEnabled] = useState(false)
  const [sunDate, setSunDate] = useState(() => new Date())
  const [myPosition, setMyPosition] = useState<[number, number] | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const gpxRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<number>(undefined)

  const selected = byId(selectedId)
  const [appMode, setAppMode] = useAppMode()
  const canEdit = appMode === 'redigering'
  const [showSettings, setShowSettings] = useState(false)
  const published = usePublished()
  const selectedPublished = selectedPublic?.kind === 'published' ? published.features.find((f) => f.properties.id === selectedPublic.id) : undefined
  const [guideOverrides, setGuideOverrides] = useState<GuideOverrides>(loadGuideOverrides)
  const [pickingSpot, setPickingSpot] = useState<GuideSpot | null>(null)
  /** Eget punkt som skal flyttes med neste trykk i kartet. */
  const [pickingPoiId, setPickingPoiId] = useState<string | null>(null)
  const [hiddenSpots, setHiddenSpots] = useState<string[]>(loadHiddenSpots)
  const guideSpots = useMemo(() => resolveSpots(guideOverrides, hiddenSpots), [guideOverrides, hiddenSpots])
  const setSpotHidden = (id: string, hidden: boolean) =>
    setHiddenSpots((h) => {
      const next = hidden ? [...new Set([...h, id])] : h.filter((x) => x !== id)
      saveHiddenSpots(next)
      return next
    })
  const heritage = useHeritage(sources.includes('kulturminner'))
  const selectedSite = selectedPublic?.kind === 'heritage' ? heritage.sites.find((s) => s.id === selectedPublic.id) : undefined
  const selectedGuide =
    selectedPublic?.kind === 'guide' ? (GUIDE_TRAILS.find((t) => t.id === selectedPublic.id) ?? guideSpots.find((g) => g.id === selectedPublic.id)) : undefined
  const [pendingTrailName, setPendingTrailName] = useState<string | null>(null)
  /** Sti som skal forlenges med neste tegnede linje. */
  const [extending, setExtending] = useState<{ id: string; side: 'end' | 'start' } | null>(null)

  const moveGuide = (id: string, position: [number, number] | null) => {
    setGuideOverrides((o) => {
      const next = { ...o }
      if (position) next[id] = position
      else delete next[id]
      saveGuideOverrides(next)
      return next
    })
  }

  const notify = (text: string) => {
    setToast(text)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 4500)
  }

  const visibleFeatures = useMemo(
    () => features.filter((f) => visibility[themeOf(f)] || f.properties.id === selectedId || f.properties.id === editing?.id),
    [features, visibility, selectedId, editing],
  )

  const select = useCallback(
    (id: string | null) => {
      setSelectedId(id)
      if (id) {
        setSelectedPublic(null)
        setPanelOpen(true)
        const f = features.find((x) => x.properties.id === id)
        if (f && map) {
          const b = L.geoJSON(f).getBounds()
          if (f.geometry.type === 'Point') panToVisible(map, [b.getCenter().lat, b.getCenter().lng])
          else map.fitBounds(b, { ...fitPadding(), maxZoom: 17 })
        }
      }
    },
    [features, map],
  )

  const selectPublic = (sel: PublicSelection) => {
    setSelectedPublic(sel)
    if (!sel) return
    setSelectedId(null)
    setPoiForm(null)
    setPanelOpen(true)
    if (sel.kind === 'ferry') {
      // Fergeleie i kartet: Skjærhalden er naturlig «fra», øystoppene «til».
      setFerryRoute((r) => (sel.stop === 'skjaerhalden' ? { from: sel.stop, to: r.to === sel.stop ? r.from : r.to } : { from: r.from === sel.stop ? r.to : r.from, to: sel.stop }))
      setSelectedPublic(null)
      setTab('bat')
    } else if (sel.kind === 'heritage' && map) {
      const site = heritage.sites.find((s) => s.id === sel.id)
      if (site) panToVisible(map, site.centroid)
    } else if (sel.kind === 'published' && map) {
      const f = published.features.find((x) => x.properties.id === sel.id)
      if (f) {
        const b = L.geoJSON(f).getBounds()
        if (f.geometry.type === 'Point') panToVisible(map, [b.getCenter().lat, b.getCenter().lng])
        else map.fitBounds(b, { ...fitPadding(), maxZoom: 17 })
      }
    } else if (sel.kind === 'guide' && map) {
      const spot = guideSpots.find((g) => g.id === sel.id)
      const trail = GUIDE_TRAILS.find((t) => t.id === sel.id)
      if (spot) panToVisible(map, spot.position)
      else if (trail?.geometry) map.fitBounds(L.geoJSON(trail.geometry).getBounds(), { ...fitPadding(), maxZoom: 16 })
    }
  }

  const locate = (): Promise<[number, number] | null> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        notify('Enheten støtter ikke posisjon')
        return resolve(null)
      }
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const pos: [number, number] = [p.coords.latitude, p.coords.longitude]
          setMyPosition(pos)
          resolve(pos)
        },
        (err) => {
          notify(`Fant ikke posisjon: ${err.message}`)
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 15000 },
      )
    })

  // ---- Interessepunkter ----
  const startAddPoi = () => {
    setSelectedId(null)
    setSelectedPublic(null)
    setPoiForm(null)
    setMode('addPoi')
  }

  const savePoi = (v: PoiFormValues) => {
    const geometry = { type: 'Point' as const, coordinates: [v.lon, v.lat] }
    const props = {
      name: v.name,
      description: v.description,
      category: v.category,
      sensitive: v.sensitive,
      shareable: v.shareable,
      bestTimes: v.bestTimes,
    }
    if (poiForm?.id) {
      dispatch({ type: 'update', id: poiForm.id, patch: props, geometry })
      setSelectedId(poiForm.id)
    } else {
      const f: PoiFeature = { type: 'Feature', geometry, properties: { ...baseProps('poi', v.name), ...props, kind: 'poi' } }
      dispatch({ type: 'add', features: [f] })
      setSelectedId(f.properties.id)
      notify('Punkt lagret lokalt')
    }
    setPoiForm(null)
  }

  // ---- Stier ----
  const startDrawPath = () => {
    setSelectedId(null)
    setPoiForm(null)
    setMode('drawPath')
    notify('Trykk i kartet for hvert knekkpunkt. Dobbeltklikk eller «Ferdig» for å avslutte.')
  }

  const startDrawTrail = (trail: GuideTrail) => {
    setPendingTrailName(trail.name)
    setSelectedPublic(null)
    startDrawPath()
  }

  const startExtend = (f: MapFeature, side: 'end' | 'start') => {
    if (f.geometry.type !== 'LineString') return
    setExtending({ id: f.properties.id, side })
    setMode('drawPath')
    const end = side === 'end' ? f.geometry.coordinates[f.geometry.coordinates.length - 1] : f.geometry.coordinates[0]
    if (map) panToVisible(map, [end[1], end[0]])
    notify(`Tegn videre fra ${side === 'end' ? 'slutten' : 'starten'} av «${f.properties.name}». Første trykk kobles til stien.`)
  }

  const onPathDrawn = (coords: Position[]) => {
    if (extending) {
      const target = byId(extending.id)
      setExtending(null)
      setMode('browse')
      if (target && target.geometry.type === 'LineString') {
        const old = target.geometry.coordinates
        // Ved forlenging fra starten tegner brukeren utover fra stiens første punkt, så den nye biten snus.
        const merged = extending.side === 'end' ? [...old, ...coords] : [...[...coords].reverse(), ...old]
        dispatch({ type: 'update', id: target.properties.id, patch: {}, geometry: { type: 'LineString', coordinates: merged } })
        setSelectedId(target.properties.id)
        notify(`La til ${coords.length} punkter på «${target.properties.name}».`)
      }
      return
    }
    const name = pendingTrailName ?? `Ny sti ${new Date().toLocaleDateString('nb-NO')}`
    setPendingTrailName(null)
    const f: PathFeature = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords },
      properties: {
        ...baseProps('path', name),
        kind: 'path',
        status: 'utkast',
        description: pendingTrailName ? 'Tegnet etter turkartet (Havely Bryggerhus).' : '',
      },
    }
    dispatch({ type: 'add', features: [f] })
    setMode('browse')
    setSelectedId(f.properties.id)
    setPanelOpen(true)
  }

  const startEditPath = (f: MapFeature) => {
    if (f.geometry.type !== 'LineString') return
    setEditing({ id: f.properties.id, initial: f.geometry.coordinates, original: f.geometry })
    setMode('editPath')
    notify('Dra i punktene for å flytte dem. Trykk på et punkt for å fjerne det, og på midtpunktene for å legge til nye.')
  }

  const endEdit = (cancel: boolean) => {
    if (cancel && editing) dispatch({ type: 'update', id: editing.id, patch: {}, geometry: editing.original })
    setEditing(null)
    setMode('browse')
  }

  const pathFromTrack = (trackId: string) => {
    const t = byId(trackId)
    if (!t || t.properties.kind !== 'track') return
    const f: PathFeature = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: trackToLine(t as TrackFeature).map((p) => [p[0], p[1]]) },
      properties: {
        ...baseProps('path', `${t.properties.name} (sti)`),
        kind: 'path',
        status: 'utkast',
        derivedFromTrack: trackId,
      },
    }
    dispatch({ type: 'add', features: [f] })
    setSelectedId(f.properties.id)
    notify('Sti-utkast laget. Kontroller og rediger linja før du godkjenner den.')
  }

  // ---- GPX ----
  const importGpx = async (files: FileList) => {
    let total = 0
    const added: MapFeature[] = []
    for (const file of Array.from(files)) {
      try {
        const tracks = parseGpx(await file.text(), file.name)
        added.push(...tracks)
        total += tracks.length
      } catch (e) {
        notify(`${file.name}: ${(e as Error).message}`)
      }
    }
    if (!added.length) return
    dispatch({ type: 'add', features: added })
    setVisibility((v) => ({ ...v, spor: true }))
    map?.fitBounds(L.geoJSON(added).getBounds(), { ...fitPadding(), maxZoom: 17 })
    notify(`Importerte ${total} GPS-spor. De er lagret som rådata – ikke som stier.`)
  }

  const cancelMode = () => {
    setPendingTrailName(null)
    setExtending(null)
    setPickingSpot(null)
    setPickingPoiId(null)
    if (mode === 'editPath') endEdit(true)
    else setMode('browse')
  }

  // ---- Panelinnhold ----
  let panelContent
  if (showSettings) {
    panelContent = (
      <SettingsPanel
        mode={appMode}
        onMode={(m) => {
          setAppMode(m)
          if (m === 'utforsk') {
            setSelectedId(null)
            setPoiForm(null)
            setMode('browse')
            if (tab === 'data') setTab('lag')
          }
          notify(m === 'redigering' ? 'Redigeringsmodus på' : 'Utforsk-modus: ingen redigering')
        }}
        publishedCount={published.features.length}
        publishedAt={published.exportedAt}
        publishedError={published.error}
        onClose={() => setShowSettings(false)}
      />
    )
  } else if (selectedPublished) {
    panelContent = (
      <PublishedDetails
        key={selectedPublished.properties.id}
        feature={selectedPublished}
        canEdit={canEdit}
        onClose={() => setSelectedPublic(null)}
        onCreatePoi={() => {
          if (selectedPublished.geometry.type !== 'Point' || selectedPublished.properties.kind !== 'poi') return
          const [lon, lat] = selectedPublished.geometry.coordinates
          setSelectedPublic(null)
          setPoiForm({
            id: null,
            initial: { category: selectedPublished.properties.category, name: selectedPublished.properties.name, description: '', lat, lon, sensitive: false, shareable: false, bestTimes: EMPTY_BEST_TIMES },
          })
        }}
      />
    )
  } else if (poiForm) {
    panelContent = (
      <PoiForm
        key={poiForm.id ?? 'new'}
        title={poiForm.id ? 'Rediger punkt' : 'Nytt interessepunkt'}
        initial={poiForm.initial}
        onSave={savePoi}
        onCancel={() => setPoiForm(null)}
        onUseMyPosition={locate}
        livePosition={
          poiForm.id && selected?.geometry.type === 'Point' ? [selected.geometry.coordinates[1], selected.geometry.coordinates[0]] : undefined
        }
      />
    )
  } else if (selected) {
    panelContent = (
      <FeatureDetails
        key={selected.properties.id}
        feature={selected}
        onUpdate={(patch) => dispatch({ type: 'update', id: selected.properties.id, patch })}
        onDelete={() => {
          dispatch({ type: 'remove', id: selected.properties.id })
          setSelectedId(null)
          notify(`Slettet «${selected.properties.name}»`)
        }}
        onEditPoi={() => {
          if (selected.properties.kind !== 'poi' || selected.geometry.type !== 'Point') return
          const [lon, lat] = selected.geometry.coordinates
          const p = selected.properties
          setPoiForm({
            id: p.id,
            initial: { category: p.category, name: p.name, description: p.description, lat, lon, sensitive: p.sensitive, shareable: p.shareable, bestTimes: p.bestTimes ?? EMPTY_BEST_TIMES },
          })
        }}
        onEditGeometry={() => startEditPath(selected)}
        onPickInMap={() => {
          setPickingPoiId(selected.properties.id)
          setMode('pickPlace')
          notify(`Trykk i kartet der «${selected.properties.name}» skal ligge`)
        }}
        onExtend={(side) => startExtend(selected, side)}
        onCreatePathFromTrack={() => pathFromTrack(selected.properties.id)}
        onClose={() => setSelectedId(null)}
      />
    )
  } else if (selectedSite) {
    panelContent = (
      <HeritageDetails
        key={selectedSite.id}
        site={selectedSite}
        canEdit={canEdit}
        onClose={() => setSelectedPublic(null)}
        onCreatePoi={() => {
          setSelectedPublic(null)
          setPoiForm({
            id: null,
            initial: {
              category: 'historisk',
              name: selectedSite.name,
              description: '',
              lat: selectedSite.centroid[0],
              lon: selectedSite.centroid[1],
              sensitive: false,
              shareable: false,
              bestTimes: EMPTY_BEST_TIMES,
            },
          })
        }}
      />
    )
  } else if (selectedGuide) {
    panelContent = (
      <GuideDetails
        key={selectedGuide.id}
        item={selectedGuide}
        canEdit={canEdit}
        onClose={() => setSelectedPublic(null)}
        onDrawTrail={startDrawTrail}
        onCopyTrail={(trail) => {
          if (!trail.geometry) return
          const f: PathFeature = {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: trail.geometry.coordinates.map((c) => [c[0], c[1]]) },
            properties: {
              ...baseProps('path', `${trail.name} (min kopi)`),
              kind: 'path',
              status: 'utkast',
              description: 'Kopiert fra kjent tur i turkartet. Rediger og godkjenn etter kontroll på tur.',
            },
          }
          dispatch({ type: 'add', features: [f] })
          setSelectedPublic(null)
          setSelectedId(f.properties.id)
          notify(`Laget sti-utkast av ${trail.name}`)
        }}
        onPickInMap={(spot) => {
          setPickingSpot(spot)
          setMode('pickPlace')
          notify(`Trykk i kartet der ${spot.name} skal ligge`)
        }}
        onResetPosition={(spot) => moveGuide(spot.id, null)}
        onHide={(spot) => {
          setSpotHidden(spot.id, true)
          setSelectedPublic(null)
          notify(`Skjulte «${spot.name}». Hent den fram igjen i lagpanelet.`)
        }}
        onCreatePoi={(spot) => {
          setSelectedPublic(null)
          setPoiForm({
            id: null,
            initial: {
              category: spot.type,
              name: spot.name,
              description: spot.note ?? '',
              lat: spot.position[0],
              lon: spot.position[1],
              sensitive: false,
              shareable: false,
              bestTimes: EMPTY_BEST_TIMES,
            },
          })
        }}
      />
    )
  } else {
    panelContent = (
      <>
        <nav className="tabs" role="tablist">
          {(
            [
              ['lag', 'Kartlag'],
              ['data', 'Mine data'],
              ['bat', 'Båt'],
              ['sol', 'Sol'],
            ] as const
          )
            .filter(([id]) => canEdit || id !== 'data')
            .map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
        {tab === 'lag' && (
          <LayerPanel
            basemapId={basemapId}
            onBasemap={setBasemapId}
            activeOverlays={overlays}
            onToggleOverlay={(id) => setOverlays((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]))}
            activeSources={sources}
            onToggleSource={(id) => {
              setSources((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]))
              if (selectedPublic && ((selectedPublic.kind === 'heritage' && id === 'kulturminner') || (selectedPublic.kind === 'guide' && (id === 'turruter' || id === 'plasser'))))
                setSelectedPublic(null)
            }}
            showPrivate={canEdit}
            sourceStatus={{
              publisert: published.loading ? 'Henter …' : published.error ? 'Feil' : String(published.features.length),
              kulturminner: heritage.loading ? 'Henter …' : heritage.error ? 'Feil: ' + heritage.error : heritage.sites.length ? String(heritage.sites.length) : undefined,
            }}
            visibility={visibility}
            onToggleTheme={(id) => setVisibility((v) => ({ ...v, [id]: !v[id] }))}
            onSetAllThemes={(on) => setVisibility((v) => Object.fromEntries(Object.keys(v).map((k) => [k, on])) as LayerVisibility)}
            features={features}
            trailList={
              sources.includes('turruter') ? (
                <TrailList selectedId={selectedPublic?.kind === 'guide' ? selectedPublic.id : null} onSelect={(id) => selectPublic({ kind: 'guide', id })} onDrawTrail={canEdit ? startDrawTrail : () => setShowSettings(true)} />
              ) : null
            }
            spotList={
              sources.includes('plasser') ? (
                <SpotList
                  spots={guideSpots}
                  selectedId={selectedPublic?.kind === 'guide' ? selectedPublic.id : null}
                  onSelect={(id) => selectPublic({ kind: 'guide', id })}
                  onUnhide={(id) => setSpotHidden(id, false)}
                />
              ) : null
            }
          />
        )}
        {tab === 'bat' && <FerryPanel route={ferryRoute} onRoute={setFerryRoute} />}
        {tab === 'data' && <DataPanel onSelect={select} onImportGpx={() => gpxRef.current?.click()} />}
        {tab === 'sol' && (
          <SunPanel
            enabled={sunEnabled}
            onEnabled={setSunEnabled}
            date={sunDate}
            onDate={(d) => {
              setSunDate(d)
              setSunEnabled(true)
            }}
            lat={SANDOY_CENTER[0]}
            lon={SANDOY_CENTER[1]}
          />
        )}
      </>
    )
  }

  const MODE_TEXT: Record<MapMode, string> = {
    browse: '',
    addPoi: 'Trykk i kartet der punktet skal ligge',
    drawPath: extending ? 'Forlenger sti' : pendingTrailName ? `Tegner ${pendingTrailName}` : 'Tegner sti',
    editPath: 'Redigerer sti',
    pickPlace: pickingSpot
      ? `Trykk i kartet der ${pickingSpot.name} skal ligge`
      : pickingPoiId
        ? 'Trykk i kartet der punktet skal ligge'
        : 'Velg sted i kartet',
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">⛰</span>
          <div>
            <h1>Sandøy Explorer</h1>
            <p>Søndre Sandøy · Hvaler{canEdit ? ' · redigering' : ''}</p>
          </div>
        </div>
      </header>

      <MapView
        basemapId={basemapId}
        activeOverlays={overlays}
        features={canEdit ? visibleFeatures : []}
        publishedFeatures={sources.includes('publisert') ? published.features : []}
        selectedId={selectedId}
        mode={mode}
        editing={editing}
        sunDate={sunEnabled ? sunDate : null}
        myPosition={myPosition}
        heritageSites={sources.includes('kulturminner') ? heritage.sites : []}
        showFerryStops={sources.includes('ferge')}
        showTrails={sources.includes('turruter')}
        showSpots={sources.includes('plasser')}
        guideSpots={guideSpots}
        onMoveGuide={(id, pos) => moveGuide(id, pos)}
        onMovePoi={(id, lonLat) => dispatch({ type: 'update', id, patch: {}, geometry: { type: 'Point', coordinates: lonLat } })}
        selectedPublic={selectedPublic}
        onSelectPublic={selectPublic}
        onReady={setMap}
        onSelect={(id) => {
          select(id)
          if (!id) setSelectedPublic(null)
        }}
        onMapClick={(lat, lon) => {
          if (mode === 'pickPlace') {
            if (pickingPoiId) {
              dispatch({ type: 'update', id: pickingPoiId, patch: {}, geometry: { type: 'Point', coordinates: [Number(lon.toFixed(6)), Number(lat.toFixed(6))] } })
              setSelectedId(pickingPoiId)
              setPickingPoiId(null)
              setMode('browse')
              notify('Punktet er flyttet')
              return
            }
            if (pickingSpot) {
              moveGuide(pickingSpot.id, [Number(lat.toFixed(6)), Number(lon.toFixed(6))])
              setSelectedPublic({ kind: 'guide', id: pickingSpot.id })
            }
            setPickingSpot(null)
            setMode('browse')
            return
          }
          setMode('browse')
          setPanelOpen(true)
          setPoiForm({ id: null, initial: { category: 'annet', name: '', description: '', lat, lon, sensitive: false, shareable: false, bestTimes: EMPTY_BEST_TIMES } })
        }}
        onPathDrawn={onPathDrawn}
        onPathEdited={(id, coords) => dispatch({ type: 'update', id, patch: {}, geometry: { type: 'LineString', coordinates: coords } })}
      />

      {mode === 'browse' ? (
        <div className="toolbar">
          {canEdit && (
            <>
              <button onClick={startAddPoi} title="Nytt interessepunkt">
                <span>📍</span>Punkt
              </button>
              <button onClick={startDrawPath} title="Tegn ny sti">
                <span>✏️</span>Sti
              </button>
              <button onClick={() => gpxRef.current?.click()} title="Importer GPX">
                <span>⤓</span>GPX
              </button>
            </>
          )}
          <button
            onClick={async () => {
              const p = await locate()
              if (p) map?.flyTo(p, 17)
            }}
            title="Min posisjon"
          >
            <span>◎</span>Her
          </button>
          <button
            className={sunEnabled ? 'on' : ''}
            onClick={() => {
              if (sunEnabled) return setSunEnabled(false)
              setSunEnabled(true)
              setSelectedId(null)
              setPoiForm(null)
              setTab('sol')
              setPanelOpen(true)
            }}
            title="Solviser"
          >
            <span>☀</span>Sol
          </button>
          <button
            className={showSettings ? 'on' : ''}
            onClick={() => {
              setShowSettings((s) => !s)
              setPanelOpen(true)
            }}
            title="Innstillinger"
          >
            <span>⚙</span>{canEdit ? 'Admin' : 'Meny'}
          </button>
        </div>
      ) : (
        <div className="mode-banner">
          <strong>{MODE_TEXT[mode]}</strong>
          {mode === 'drawPath' && (
            <button className="primary" onClick={() => map && finishDrawing(map)}>
              Ferdig
            </button>
          )}
          {mode === 'editPath' && (
            <button className="primary" onClick={() => endEdit(false)}>
              Ferdig
            </button>
          )}
          <button onClick={cancelMode}>Avbryt</button>
        </div>
      )}

      <aside className={`panel ${panelOpen ? 'open' : ''}`}>
        <button className="panel-handle" onClick={() => setPanelOpen((o) => !o)} aria-label={panelOpen ? 'Skjul panel' : 'Vis panel'}>
          <span />
        </button>
        <div className="panel-body">{panelContent}</div>
      </aside>

      {toast && (
        <div className="toast" role="status" onClick={() => setToast(null)}>
          {toast}
        </div>
      )}

      <input
        ref={gpxRef}
        type="file"
        accept=".gpx,application/gpx+xml"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) importGpx(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

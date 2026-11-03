import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { migrateFeature, nowIso, type MapFeature } from './model'

const STORAGE_KEY = 'sandoy-explorer:features:v2'
const LEGACY_KEYS = ['sandoy-explorer:features:v1']

type Action =
  | { type: 'add'; features: MapFeature[] }
  | { type: 'update'; id: string; patch: Partial<MapFeature['properties']>; geometry?: MapFeature['geometry'] }
  | { type: 'remove'; id: string }
  | { type: 'merge'; features: MapFeature[] }

function reducer(state: MapFeature[], action: Action): MapFeature[] {
  switch (action.type) {
    case 'add':
      return [...state, ...action.features]
    case 'update':
      return state.map((f) =>
        f.properties.id === action.id
          ? ({
              ...f,
              geometry: action.geometry ?? f.geometry,
              properties: { ...f.properties, ...action.patch, updatedAt: nowIso() },
            } as MapFeature)
          : f,
      )
    case 'remove':
      return state.filter((f) => f.properties.id !== action.id)
    case 'merge': {
      // Ved import: nye id-er legges til, eksisterende erstattes bare hvis importen er nyere.
      const byId = new Map(state.map((f) => [f.properties.id, f]))
      for (const f of action.features) {
        const existing = byId.get(f.properties.id)
        if (!existing || f.properties.updatedAt > existing.properties.updatedAt) byId.set(f.properties.id, f)
      }
      return [...byId.values()]
    }
  }
}

function load(): MapFeature[] {
  try {
    // Eldre lagringsnøkler leses én gang og migreres; v2 lagres ved første endring.
    const raw = localStorage.getItem(STORAGE_KEY) ?? LEGACY_KEYS.map((k) => localStorage.getItem(k)).find(Boolean)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.map(migrateFeature).filter((f): f is MapFeature => f !== null)
  } catch {
    return []
  }
}

interface Store {
  features: MapFeature[]
  dispatch: (a: Action) => void
  byId: (id: string | null) => MapFeature | undefined
}

const StoreContext = createContext<Store | null>(null)

export function FeatureStoreProvider({ children }: { children: ReactNode }) {
  const [features, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(features))
    } catch (e) {
      console.error('Kunne ikke lagre lokalt', e)
    }
  }, [features])

  const value = useMemo<Store>(
    () => ({ features, dispatch, byId: (id) => features.find((f) => f.properties.id === id) }),
    [features],
  )
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useFeatureStore(): Store {
  const s = useContext(StoreContext)
  if (!s) throw new Error('useFeatureStore må brukes inne i FeatureStoreProvider')
  return s
}

import { useState } from 'react'

/**
 * Utforsk: vanlig bruker – ser kart, publisert innhold og offentlige lag, ingen redigering.
 * Redigering: admin – alle verktøy, egne registreringer, eksport til publisering.
 */
export type AppMode = 'utforsk' | 'redigering'

const KEY = 'sandoy-explorer:mode:v1'

export function loadAppMode(): AppMode {
  try {
    return localStorage.getItem(KEY) === 'redigering' ? 'redigering' : 'utforsk'
  } catch {
    return 'utforsk'
  }
}

export function useAppMode(): [AppMode, (m: AppMode) => void] {
  const [mode, setModeState] = useState<AppMode>(loadAppMode)
  const setMode = (m: AppMode) => {
    setModeState(m)
    try {
      localStorage.setItem(KEY, m)
    } catch {
      /* lagring kan være blokkert */
    }
  }
  return [mode, setMode]
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './ErrorBoundary.tsx'
import { FeatureStoreProvider } from './data/store.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <FeatureStoreProvider>
        <App />
      </FeatureStoreProvider>
    </ErrorBoundary>
  </StrictMode>,
)

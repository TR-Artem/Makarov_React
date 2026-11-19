import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import MonitoringProvider from './MonitoringProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <MonitoringProvider>
        <App />
      </MonitoringProvider>
    </BrowserRouter>
  </StrictMode>,
)

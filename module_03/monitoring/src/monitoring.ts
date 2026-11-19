import { createContext, useContext } from 'react'
import type { Run, Site } from './types'

export type Monitoring = {
  sites: Site[]
  history: Run[]
  loading: boolean
  error: string
}

export const MonitoringContext = createContext<Monitoring | null>(null)

export function useMonitoring(): Monitoring {
  const monitoring = useContext(MonitoringContext)
  if (monitoring === null) {
    throw new Error('useMonitoring вызван вне MonitoringProvider')
  }
  return monitoring
}

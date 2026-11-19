import { useEffect, useState, type ReactNode } from 'react'
import { MonitoringContext } from './monitoring'
import type { Run, Site } from './types'

async function loadJson(name: string) {
  const response = await fetch(`${import.meta.env.BASE_URL}data/${name}`)
  if (!response.ok) {
    throw new Error(`Файл ${name} не загрузился: код ${response.status}.`)
  }
  return response.json()
}

function MonitoringProvider({ children }: { children: ReactNode }) {
  const [sites, setSites] = useState<Site[]>([])
  const [history, setHistory] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const list: Site[] = await loadJson('sites.json')
        const results: { history: Run[] } = await loadJson('results.json')
        if (!ignore) {
          setSites(list)
          setHistory(results.history)
        }
      } catch (e) {
        if (!ignore) {
          setError((e as Error).message)
        }
      }
      if (!ignore) {
        setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <MonitoringContext value={{ sites, history, loading, error }}>{children}</MonitoringContext>
  )
}

export default MonitoringProvider

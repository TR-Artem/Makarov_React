import { useEffect, useState } from 'react'
import { createRequest, deleteRequest, fetchRequests, updateStatus } from './api'
import { nextStatus, upsertRequest, type NewRequest, type RequestItem, type Status } from './requests'
import { subscribeRequests } from './realtime'

export function useRequests() {
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const list = await fetchRequests()
        if (!ignore) {
          setRequests(list)
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
  }, [attempt])

  useEffect(() => {
    return subscribeRequests(({ action, record }) => {
      if (action === 'delete') {
        setRequests((list) => list.filter((r) => r.id !== record.id))
      } else {
        setRequests((list) => upsertRequest(list, record))
      }
    })
  }, [])

  function retry() {
    setError('')
    setLoading(true)
    setAttempt(attempt + 1)
  }

  async function add(data: NewRequest): Promise<RequestItem> {
    const created = await createRequest(data)
    setRequests((list) => upsertRequest(list, created))
    return created
  }

  async function next(id: string, status: Status) {
    const updated = await updateStatus(id, nextStatus(status))
    setRequests((list) => upsertRequest(list, updated))
  }

  async function remove(id: string) {
    await deleteRequest(id)
    setRequests((list) => list.filter((r) => r.id !== id))
  }

  return { requests, loading, error, retry, add, next, remove }
}

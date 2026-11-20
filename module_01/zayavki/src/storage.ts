import { initialRequests, type RequestItem } from './requests'

const KEY = 'zayavki'

export function loadRequests(): RequestItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null) {
      return initialRequests
    }
    const list: unknown = JSON.parse(raw)
    return Array.isArray(list) ? (list as RequestItem[]) : initialRequests
  } catch {
    return initialRequests
  }
}

export function saveRequests(list: RequestItem[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

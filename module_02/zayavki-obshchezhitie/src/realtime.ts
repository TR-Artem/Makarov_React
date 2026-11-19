import PocketBase from 'pocketbase'
import type { RequestItem } from './requests'

const pb = new PocketBase('http://localhost:8090')

export type RequestEvent = {
  action: string
  record: RequestItem
}

export function subscribeRequests(onEvent: (event: RequestEvent) => void): () => void {
  const pending = pb.collection('obshchezhitie').subscribe<RequestItem>('*', onEvent)
  return () => {
    pending.then((unsubscribe) => unsubscribe())
  }
}

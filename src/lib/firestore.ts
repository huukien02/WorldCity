import { collection, doc } from 'firebase/firestore'
import type { CollectionReference, DocumentReference } from 'firebase/firestore'
import { db } from './firebase'
import type {
  UserDoc,
  MapChunkDoc,
  ChatMessageDoc,
  ActivityDoc,
  MarketListingDoc,
  NotificationDoc,
  GoldTransactionDoc,
  DailyQuestDoc,
} from '@/types/firestore'

function col<T>(path: string) {
  return collection(db, path) as CollectionReference<T>
}

function d<T>(path: string, ...segments: string[]) {
  return doc(db, path, ...segments) as DocumentReference<T>
}

export const usersCol = col<UserDoc>('users')
export const userDoc = (uid: string) => d<UserDoc>('users', uid)

export const mapChunksCol = col<MapChunkDoc>('mapChunks')
export const chunkDoc = (chunkId: string) => d<MapChunkDoc>('mapChunks', chunkId)

export const chatCol = col<ChatMessageDoc>('globalChat')

export const activitiesCol = col<ActivityDoc>('activities')

export const marketplaceCol = col<MarketListingDoc>('marketplace')
export const listingDoc = (id: string) => d<MarketListingDoc>('marketplace', id)

export const notificationsCol = (userId: string) =>
  col<NotificationDoc>(`notifications/${userId}/items`)

export const goldLogsCol = (userId: string) =>
  col<GoldTransactionDoc>(`goldTransactions/${userId}/logs`)

export const dailyQuestDoc = (userId: string, date: string) =>
  d<DailyQuestDoc>(`users/${userId}/dailyProgress`, date)

export function getChunkId(tileX: number, tileY: number) {
  return `${Math.floor(tileX / 10)}_${Math.floor(tileY / 10)}`
}

export function getTileKey(tileX: number, tileY: number) {
  return `${tileX}_${tileY}`
}

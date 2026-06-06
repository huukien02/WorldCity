import type { Timestamp } from 'firebase/firestore'

export type BuildingType =
  | 'fence'
  | 'gate'
  | 'farm'
  | 'park'
  | 'house'
  | 'cafe'
  | 'gasStation'
  | 'school'
  | 'policeStation'
  | 'shop'
  | 'temple'
  | 'library'
  | 'bank'
  | 'factory'
  | 'cinema'
  | 'hospital'
  | 'arena'
  | 'tower'
  | 'hotel'
  | 'mall'
  | 'university'

export interface TileData {
  ownerId: string | null
  ownerName: string | null
  buildingType: BuildingType | null
  buildingName: string | null
  buildingLevel: number
  builtAt: Timestamp | null
  lastHarvestAt: Timestamp | null
}

export interface MapChunkDoc {
  tiles: Record<string, TileData>
  updatedAt: Timestamp
}

export interface UserDoc {
  uid: string
  displayName: string
  email: string
  photoURL: string
  createdAt: Timestamp
  gold: number
  landCount: number
  totalBuildings: number
  bio: string
  lastActiveAt: Timestamp
  guildId: string | null
  guildRole: 'leader' | 'officer' | 'member' | null
}

export interface ChatMessageDoc {
  userId: string
  userName: string
  userAvatar: string
  message: string
  createdAt: Timestamp
}

export interface ActivityDoc {
  type: 'claim' | 'build' | 'upgrade' | 'visit'
  userId: string
  userName: string
  tileX: number
  tileY: number
  detail: string
  createdAt: Timestamp
}

export interface MarketListingDoc {
  sellerId: string
  sellerName: string
  tileX: number
  tileY: number
  buildingType: BuildingType | null
  buildingLevel: number
  price: number
  status: 'active' | 'sold' | 'cancelled'
  createdAt: Timestamp
  soldAt: Timestamp | null
  buyerId: string | null
}

export interface NotificationDoc {
  type: 'visit' | 'neighbor'
  fromUserId: string
  fromUserName: string
  message: string
  tileId: string
  isRead: boolean
  createdAt: Timestamp
}

export interface GoldTransactionDoc {
  type: 'earn' | 'spend' | 'trade'
  amount: number
  reason: string
  balanceBefore: number
  balanceAfter: number
  createdAt: Timestamp
}

export type QuestType = 'claim' | 'build' | 'harvest'

export interface QuestDef {
  title: string
  description: string
  target: number
  reward: number
}

export interface QuestProgress {
  current: number
  rewardClaimed: boolean
}

export interface DailyQuestDoc {
  date: string
  quests: Record<QuestType, QuestDef>
  progress: Record<QuestType, QuestProgress>
  bonusRewardClaimed: boolean
  createdAt: Timestamp
}

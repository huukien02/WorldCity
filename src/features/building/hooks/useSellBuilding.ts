'use client'

import { runTransaction, serverTimestamp, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { userDoc, chunkDoc, goldLogsCol, activitiesCol, getChunkId, getTileKey } from '@/lib/firestore'
import { BUILDING_CONFIG, HARVEST_CAP_MINUTES } from '@/types'

export const SELL_REFUND_RATE = 0.5

export function useSellBuilding() {
  async function sellBuilding(uid: string, tileX: number, tileY: number): Promise<number> {
    const chunkId = getChunkId(tileX, tileY)
    const tileKey = getTileKey(tileX, tileY)
    let totalEarned = 0
    let buildingLabel = ''

    await runTransaction(db, async (tx) => {
      const userSnap = await tx.get(userDoc(uid))
      const chunkSnap = await tx.get(chunkDoc(chunkId))

      if (!userSnap.exists()) throw new Error('User not found')

      const user = userSnap.data()
      const tile = chunkSnap.data()?.tiles?.[tileKey]

      if (!tile?.buildingType) throw new Error('Không có công trình để bán')
      if (tile.ownerId !== uid) throw new Error('Không phải công trình của bạn')

      const config = BUILDING_CONFIG[tile.buildingType]
      buildingLabel = config.label
      const refund = Math.floor(config.cost * SELL_REFUND_RATE)

      // Thu gold tích lũy cùng lúc
      let pendingGold = 0
      if (tile.lastHarvestAt) {
        const elapsedMin = (Date.now() - tile.lastHarvestAt.toMillis()) / 60_000
        pendingGold = Math.floor(
          Math.min(elapsedMin, HARVEST_CAP_MINUTES) * config.incomePerMinute * (tile.buildingLevel ?? 1),
        )
      }

      totalEarned = refund + pendingGold

      tx.update(userDoc(uid), {
        gold: user.gold + totalEarned,
        totalBuildings: Math.max(0, user.totalBuildings - 1),
      })

      tx.update(chunkDoc(chunkId), {
        [`tiles.${tileKey}.buildingType`]: null,
        [`tiles.${tileKey}.buildingName`]: null,
        [`tiles.${tileKey}.buildingLevel`]: 1,
        [`tiles.${tileKey}.builtAt`]: null,
        [`tiles.${tileKey}.lastHarvestAt`]: null,
        updatedAt: serverTimestamp(),
      })
    })

    await Promise.all([
      addDoc(goldLogsCol(uid), {
        type: 'earn',
        amount: totalEarned,
        reason: `Bán ${buildingLabel} tại (${tileX}, ${tileY})`,
        balanceBefore: 0,
        balanceAfter: 0,
        createdAt: serverTimestamp(),
      }),
      addDoc(activitiesCol, {
        type: 'build',
        userId: uid,
        userName: '',
        tileX,
        tileY,
        detail: `Đã bán ${buildingLabel} tại (${tileX}, ${tileY})`,
        createdAt: serverTimestamp(),
      }),
    ])

    return totalEarned
  }

  return { sellBuilding }
}

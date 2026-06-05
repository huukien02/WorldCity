'use client'

import { runTransaction, serverTimestamp, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { userDoc, chunkDoc, goldLogsCol, getChunkId, getTileKey } from '@/lib/firestore'
import { BUILDING_CONFIG, HARVEST_CAP_MINUTES } from '@/types'
import { HARVEST_COOLDOWN_MS } from './usePendingGold'

export function useHarvest() {
  async function harvestTile(uid: string, tileX: number, tileY: number): Promise<number> {
    const chunkId = getChunkId(tileX, tileY)
    const tileKey = getTileKey(tileX, tileY)
    let earned = 0

    await runTransaction(db, async (tx) => {
      const userSnap = await tx.get(userDoc(uid))
      const chunkSnap = await tx.get(chunkDoc(chunkId))
      if (!userSnap.exists()) throw new Error('User not found')

      const user = userSnap.data()
      const tile = chunkSnap.data()?.tiles?.[tileKey]
      if (!tile?.buildingType || !tile.lastHarvestAt) throw new Error('Không có building để thu hoạch')
      if (tile.ownerId !== uid) throw new Error('Không phải đất của bạn')

      const config = BUILDING_CONFIG[tile.buildingType]
      const level = tile.buildingLevel ?? 1
      const elapsedMs = Date.now() - tile.lastHarvestAt.toMillis()
      if (elapsedMs < HARVEST_COOLDOWN_MS) {
        const secsLeft = Math.ceil((HARVEST_COOLDOWN_MS - elapsedMs) / 1000)
        throw new Error(`Chờ thêm ${secsLeft} giây nữa`)
      }

      const elapsedMinutes = elapsedMs / 60_000
      earned = Math.floor(Math.min(elapsedMinutes, HARVEST_CAP_MINUTES) * config.incomePerMinute * level)
      if (earned <= 0) throw new Error('Chưa có gold để thu hoạch')

      tx.update(userDoc(uid), { gold: user.gold + earned })
      tx.update(chunkDoc(chunkId), {
        [`tiles.${tileKey}.lastHarvestAt`]: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    })

    // Log sau transaction thành công
    if (earned > 0) {
      await addDoc(goldLogsCol(uid), {
        type: 'earn',
        amount: earned,
        reason: `Thu hoạch tại (${tileX}, ${tileY})`,
        balanceBefore: 0, // simplified - không query lại
        balanceAfter: 0,
        createdAt: serverTimestamp(),
      })
    }

    return earned
  }

  return { harvestTile }
}

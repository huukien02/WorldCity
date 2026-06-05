'use client'

import { runTransaction, serverTimestamp, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { userDoc, chunkDoc, activitiesCol, getChunkId, getTileKey } from '@/lib/firestore'
import { BUILDING_CONFIG } from '@/types'
import type { BuildingType } from '@/types/firestore'

export function useBuildOnTile() {
  async function buildOnTile(
    uid: string,
    displayName: string,
    tileX: number,
    tileY: number,
    buildingType: BuildingType,
    buildingName: string,
  ) {
    const config = BUILDING_CONFIG[buildingType]
    const chunkId = getChunkId(tileX, tileY)
    const tileKey = getTileKey(tileX, tileY)

    await runTransaction(db, async (tx) => {
      const userSnap = await tx.get(userDoc(uid))
      if (!userSnap.exists()) throw new Error('User not found')

      const user = userSnap.data()
      if (user.gold < config.cost) throw new Error(`Không đủ gold (cần ${config.cost})`)

      const chunkSnap = await tx.get(chunkDoc(chunkId))
      const tile = chunkSnap.data()?.tiles?.[tileKey]
      if (!tile) throw new Error('Ô đất chưa được claim')
      if (tile.ownerId !== uid) throw new Error('Bạn không sở hữu ô đất này')
      if (tile.buildingType) throw new Error('Ô đất đã có công trình')

      tx.update(userDoc(uid), {
        gold: user.gold - config.cost,
        totalBuildings: user.totalBuildings + 1,
      })

      // Use dot-notation to update only this tile — avoids overwriting other tiles in the chunk
      tx.update(chunkDoc(chunkId), {
        [`tiles.${tileKey}.buildingType`]: buildingType,
        [`tiles.${tileKey}.buildingName`]: buildingName,
        [`tiles.${tileKey}.buildingLevel`]: 1,
        [`tiles.${tileKey}.builtAt`]: serverTimestamp(),
        [`tiles.${tileKey}.lastHarvestAt`]: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    })

    await addDoc(activitiesCol, {
      type: 'build',
      userId: uid,
      userName: displayName,
      tileX,
      tileY,
      detail: `Đã xây ${config.label} tại (${tileX}, ${tileY})`,
      createdAt: serverTimestamp(),
    })
  }

  return { buildOnTile }
}

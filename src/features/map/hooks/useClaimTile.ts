'use client'

import { runTransaction, serverTimestamp, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { userDoc, chunkDoc, activitiesCol, getChunkId, getTileKey } from '@/lib/firestore'
import { CLAIM_COST } from '@/types'

export function useClaimTile() {
  async function claimTile(uid: string, displayName: string, tileX: number, tileY: number) {
    const chunkId = getChunkId(tileX, tileY)
    const tileKey = getTileKey(tileX, tileY)

    await runTransaction(db, async (tx) => {
      const userSnap = await tx.get(userDoc(uid))
      if (!userSnap.exists()) throw new Error('User not found')

      const user = userSnap.data()
      if (user.gold < CLAIM_COST) throw new Error('Không đủ gold để claim đất')

      const chunkSnap = await tx.get(chunkDoc(chunkId))
      const existingTile = chunkSnap.data()?.tiles?.[tileKey]
      if (existingTile?.ownerId) throw new Error('Ô đất này đã có chủ')

      tx.update(userDoc(uid), {
        gold: user.gold - CLAIM_COST,
        landCount: user.landCount + 1,
      })

      tx.set(chunkDoc(chunkId), {
        tiles: {
          ...chunkSnap.data()?.tiles,
          [tileKey]: {
            ownerId: uid,
            ownerName: displayName,
            buildingType: null,
            buildingName: null,
            buildingLevel: 1,
            builtAt: null,
            lastHarvestAt: null,
          },
        },
        updatedAt: serverTimestamp(),
      }, { merge: true })
    })

    await addDoc(activitiesCol, {
      type: 'claim',
      userId: uid,
      userName: displayName,
      tileX,
      tileY,
      detail: `Đã claim ô (${tileX}, ${tileY})`,
      createdAt: serverTimestamp(),
    })
  }

  return { claimTile }
}

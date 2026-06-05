'use client'

import { runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { chunkDoc, getChunkId, getTileKey } from '@/lib/firestore'
import type { TileData } from '@/types/firestore'

export type SwapResult = 'moved' | 'swapped'

export function useSwapBuilding() {
  async function swapBuilding(
    uid: string,
    srcX: number,
    srcY: number,
    dstX: number,
    dstY: number,
  ): Promise<SwapResult> {
    const srcChunkId = getChunkId(srcX, srcY)
    const dstChunkId = getChunkId(dstX, dstY)
    const srcKey = getTileKey(srcX, srcY)
    const dstKey = getTileKey(dstX, dstY)
    let result: SwapResult = 'moved'

    await runTransaction(db, async (tx) => {
      const srcSnap = await tx.get(chunkDoc(srcChunkId))
      const srcTile: TileData | undefined = srcSnap.data()?.tiles?.[srcKey]

      if (!srcTile?.buildingType) throw new Error('Ô nguồn không có công trình')
      if (srcTile.ownerId !== uid) throw new Error('Bạn không sở hữu ô nguồn')

      let dstTile: TileData | null = null
      if (srcChunkId === dstChunkId) {
        dstTile = srcSnap.data()?.tiles?.[dstKey] ?? null
      } else {
        const dstSnap = await tx.get(chunkDoc(dstChunkId))
        dstTile = dstSnap.data()?.tiles?.[dstKey] ?? null
      }

      if (!dstTile?.ownerId) throw new Error('Ô đích chưa được claim')
      if (dstTile.ownerId !== uid) throw new Error('Bạn không sở hữu ô đích')

      result = dstTile.buildingType ? 'swapped' : 'moved'

      // Fields to write to source tile (gets dst's building, or cleared if dst was empty)
      const srcUpdate: Record<string, unknown> = {
        [`tiles.${srcKey}.buildingType`]: dstTile.buildingType ?? null,
        [`tiles.${srcKey}.buildingName`]: dstTile.buildingName ?? null,
        [`tiles.${srcKey}.buildingLevel`]: dstTile.buildingLevel ?? 1,
        [`tiles.${srcKey}.builtAt`]: dstTile.builtAt ?? null,
        [`tiles.${srcKey}.lastHarvestAt`]: dstTile.lastHarvestAt ?? null,
      }

      // Fields to write to destination tile (gets src's building)
      const dstUpdate: Record<string, unknown> = {
        [`tiles.${dstKey}.buildingType`]: srcTile.buildingType,
        [`tiles.${dstKey}.buildingName`]: srcTile.buildingName ?? null,
        [`tiles.${dstKey}.buildingLevel`]: srcTile.buildingLevel ?? 1,
        [`tiles.${dstKey}.builtAt`]: srcTile.builtAt ?? null,
        [`tiles.${dstKey}.lastHarvestAt`]: srcTile.lastHarvestAt ?? null,
      }

      if (srcChunkId === dstChunkId) {
        tx.update(chunkDoc(srcChunkId), {
          ...srcUpdate,
          ...dstUpdate,
          updatedAt: serverTimestamp(),
        })
      } else {
        tx.update(chunkDoc(srcChunkId), { ...srcUpdate, updatedAt: serverTimestamp() })
        tx.update(chunkDoc(dstChunkId), { ...dstUpdate, updatedAt: serverTimestamp() })
      }
    })

    return result
  }

  return { swapBuilding }
}

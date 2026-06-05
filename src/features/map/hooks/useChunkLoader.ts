'use client'

import { useEffect, useRef } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { chunkDoc } from '@/lib/firestore'
import { useMapStore } from '../store'

const chunkListeners = new Map<string, () => void>()

export function useChunkLoader(visibleChunkIds: string[]) {
  const prevChunksRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const nextChunks = new Set(visibleChunkIds)
    const prev = prevChunksRef.current

    // Subscribe new chunks
    for (const id of nextChunks) {
      if (prev.has(id)) continue
      const unsub = onSnapshot(chunkDoc(id), (snap) => {
        const tiles = snap.exists() ? (snap.data().tiles ?? {}) : {}
        useMapStore.getState().setChunkData(id, tiles)
      })
      chunkListeners.set(id, unsub)
    }

    // Unsubscribe chunks out of view
    for (const id of prev) {
      if (nextChunks.has(id)) continue
      chunkListeners.get(id)?.()
      chunkListeners.delete(id)
      useMapStore.getState().clearChunkData(id)
    }

    prevChunksRef.current = nextChunks
  }, [visibleChunkIds.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
}

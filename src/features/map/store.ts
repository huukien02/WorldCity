'use client'

import { create } from 'zustand'
import type { TileCoord, Viewport } from '@/types'
import type { TileData } from '@/types/firestore'

interface MapStore {
  stagePos: { x: number; y: number }
  stageScale: number
  selectedTile: TileCoord | null
  hoveredTile: TileCoord | null
  chunkData: Record<string, Record<string, TileData>>
  movingFrom: TileCoord | null

  setStagePos: (pos: { x: number; y: number }) => void
  setStageScale: (scale: number) => void
  setSelectedTile: (tile: TileCoord | null) => void
  setHoveredTile: (tile: TileCoord | null) => void
  setChunkData: (chunkId: string, tiles: Record<string, TileData>) => void
  clearChunkData: (chunkId: string) => void
  setMovingFrom: (tile: TileCoord | null) => void

  getViewport: () => Viewport
}

export const useMapStore = create<MapStore>((set, get) => ({
  stagePos: { x: 0, y: 0 },
  stageScale: 1,
  selectedTile: null,
  hoveredTile: null,
  chunkData: {},
  movingFrom: null,

  setStagePos: (pos) => set({ stagePos: pos }),
  setStageScale: (scale) => set({ stageScale: scale }),
  setSelectedTile: (tile) => set({ selectedTile: tile }),
  setHoveredTile: (tile) => set({ hoveredTile: tile }),
  setChunkData: (chunkId, tiles) => set((s) => ({
    chunkData: { ...s.chunkData, [chunkId]: tiles },
  })),
  clearChunkData: (chunkId) => set((s) => {
    const next = { ...s.chunkData }
    delete next[chunkId]
    return { chunkData: next }
  }),
  setMovingFrom: (tile) => set({ movingFrom: tile }),

  getViewport: () => {
    const { stagePos, stageScale } = get()
    return { x: stagePos.x, y: stagePos.y, scale: stageScale }
  },
}))

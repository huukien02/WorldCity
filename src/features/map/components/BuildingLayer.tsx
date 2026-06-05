'use client'

import { memo } from 'react'
import { Layer, Text } from 'react-konva'
import { toIso } from '../utils/isoCoords'
import { TILE_W, BUILDING_CONFIG, BUILDING_EMOJI, MAP_SIZE } from '@/types'
import { getChunkId, getTileKey } from '@/lib/firestore'
import { useMapStore } from '../store'

interface BuildingLayerProps {
  minTile: number
  maxTile: number
}

export const BuildingLayer = memo(function BuildingLayer({ minTile, maxTile }: BuildingLayerProps) {
  const chunkData = useMapStore((s) => s.chunkData)
  const buildings: Array<{ x: number; y: number; type: string; level: number }> = []

  for (let x = minTile; x <= Math.min(maxTile, MAP_SIZE - 1); x++) {
    for (let y = minTile; y <= Math.min(maxTile, MAP_SIZE - 1); y++) {
      const tile = chunkData[getChunkId(x, y)]?.[getTileKey(x, y)]
      if (tile?.buildingType) {
        buildings.push({ x, y, type: tile.buildingType, level: tile.buildingLevel ?? 1 })
      }
    }
  }
  buildings.sort((a, b) => (a.x + a.y) - (b.x + b.y))

  return (
    <Layer listening={false}>
      {buildings.map(({ x, y, type, level }) => {
        const { screenX, screenY } = toIso(x, y)
        const config = BUILDING_CONFIG[type as keyof typeof BUILDING_CONFIG]
        const emoji = BUILDING_EMOJI[type] ?? '🏠'
        const fontSize = Math.max(10, 14 + level * 2)

        return (
          <Text
            key={`${x}_${y}`}
            x={screenX + TILE_W / 2 - fontSize / 2}
            y={screenY}
            text={emoji}
            fontSize={fontSize}
            fill={config?.color ?? '#fff'}
            shadowColor="black"
            shadowBlur={2}
            shadowOffsetX={1}
            shadowOffsetY={1}
          />
        )
      })}
    </Layer>
  )
})

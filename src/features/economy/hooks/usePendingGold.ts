'use client'

import { useEffect, useState } from 'react'
import type { TileData } from '@/types/firestore'
import { BUILDING_CONFIG, HARVEST_CAP_MINUTES } from '@/types'

export const HARVEST_COOLDOWN_MS = 60 * 60_000 // 60 phút

interface PendingGoldResult {
  pending: number
  secondsLeft: number   // giây còn lại trước khi được harvest
  canHarvest: boolean
}

export function usePendingGold(tile: TileData | null): PendingGoldResult {
  const [result, setResult] = useState<PendingGoldResult>({ pending: 0, secondsLeft: 60, canHarvest: false })

  useEffect(() => {
    if (!tile?.buildingType || !tile.lastHarvestAt) {
      setResult({ pending: 0, secondsLeft: 60, canHarvest: false })
      return
    }

    const config = BUILDING_CONFIG[tile.buildingType]
    const level = tile.buildingLevel ?? 1

    function calculate() {
      const lastMs = tile!.lastHarvestAt!.toMillis()
      const elapsedMs = Date.now() - lastMs
      const elapsedMinutes = elapsedMs / 60_000
      const capped = Math.min(elapsedMinutes, HARVEST_CAP_MINUTES)
      const pending = Math.floor(capped * config.incomePerMinute * level)
      const secondsLeft = Math.max(0, Math.ceil((HARVEST_COOLDOWN_MS - elapsedMs) / 1000))
      setResult({ pending, secondsLeft, canHarvest: secondsLeft === 0 && pending > 0 })
    }

    calculate()
    const interval = setInterval(calculate, 1_000) // cập nhật mỗi giây cho countdown
    return () => clearInterval(interval)
  }, [tile])

  return result
}

import { TILE_W, TILE_H } from '@/types'

export function toIso(tileX: number, tileY: number) {
  return {
    screenX: (tileX - tileY) * (TILE_W / 2),
    screenY: (tileX + tileY) * (TILE_H / 2),
  }
}

export function fromIso(screenX: number, screenY: number) {
  const x = (screenX / (TILE_W / 2) + screenY / (TILE_H / 2)) / 2
  const y = (screenY / (TILE_H / 2) - screenX / (TILE_W / 2)) / 2
  return {
    x: Math.floor(x),
    y: Math.floor(y),
  }
}

export function getVisibleTileRange(
  stageX: number,
  stageY: number,
  scale: number,
  viewW: number,
  viewH: number,
) {
  const pad = 3
  const left   = -stageX / scale
  const top    = -stageY / scale
  const right  = left + viewW / scale
  const bottom = top  + viewH / scale

  // Convert all 4 viewport corners from ISO screen space → tile coords
  const corners = [
    fromIso(left,  top),
    fromIso(right, top),
    fromIso(left,  bottom),
    fromIso(right, bottom),
  ]
  const allCoords = corners.flatMap(c => [c.x, c.y])
  const minTile = Math.max(0,  Math.floor(Math.min(...allCoords)) - pad)
  const maxTile = Math.min(99, Math.ceil(Math.max(...allCoords))  + pad)

  return { minTile, maxTile }
}

export function getVisibleChunks(
  stageX: number,
  stageY: number,
  scale: number,
  viewW: number,
  viewH: number,
): string[] {
  const { minTile, maxTile } = getVisibleTileRange(stageX, stageY, scale, viewW, viewH)
  const minChunk = Math.max(0, Math.floor(minTile / 10))
  const maxChunk = Math.min(9, Math.floor(maxTile / 10))
  const chunkIds: string[] = []

  for (let cx = minChunk; cx <= maxChunk; cx++) {
    for (let cy = minChunk; cy <= maxChunk; cy++) {
      chunkIds.push(`${cx}_${cy}`)
    }
  }

  return chunkIds
}

"use client";

import { memo, useCallback } from "react";
import { Layer, Shape } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Context } from "konva/lib/Context";
import type { Shape as KonvaShape } from "konva/lib/Shape";
import { toIso } from "../utils/isoCoords";
import { TILE_W, TILE_H, TILE_COLORS, MAP_SIZE } from "@/types";
import type { TileData } from "@/types/firestore";
import { getChunkId, getTileKey } from "@/lib/firestore";
import { useMapStore } from "../store";

interface TileLayerProps {
  currentUserId: string | undefined;
  minTile: number;
  maxTile: number;
  onTileSelect?: () => void;
}

function drawIsoDiamond(
  ctx: Context,
  sx: number,
  sy: number,
  shape: KonvaShape,
) {
  ctx.beginPath();
  ctx.moveTo(sx + TILE_W / 2, sy);
  ctx.lineTo(sx + TILE_W, sy + TILE_H / 2);
  ctx.lineTo(sx + TILE_W / 2, sy + TILE_H);
  ctx.lineTo(sx, sy + TILE_H / 2);
  ctx.closePath();
  ctx.fillStrokeShape(shape);
}

function getTileColor(
  tile: TileData | null,
  isHovered: boolean,
  isSelected: boolean,
  isMovingSource: boolean,
  uid?: string,
): string {
  if (isSelected) return TILE_COLORS.selected;
  if (isMovingSource) return TILE_COLORS.moving;
  if (isHovered) return TILE_COLORS.hovered;
  if (!tile?.ownerId) return TILE_COLORS.empty;
  if (tile.ownerId === uid) return TILE_COLORS.mine;
  return TILE_COLORS.owned;
}

export const TileLayer = memo(function TileLayer({
  currentUserId,
  minTile,
  maxTile,
  onTileSelect,
}: TileLayerProps) {
  const {
    hoveredTile,
    selectedTile,
    movingFrom,
    setHoveredTile,
    setSelectedTile,
    chunkData,
  } = useMapStore();

  const tiles: Array<{ x: number; y: number; data: TileData | null }> = [];
  for (let x = minTile; x <= Math.min(maxTile, MAP_SIZE - 1); x++) {
    for (let y = minTile; y <= Math.min(maxTile, MAP_SIZE - 1); y++) {
      const chunkId = getChunkId(x, y);
      const tileKey = getTileKey(x, y);
      const data = chunkData[chunkId]?.[tileKey] ?? null;
      tiles.push({ x, y, data });
    }
  }
  tiles.sort((a, b) => a.x + a.y - (b.x + b.y));

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const tileX = e.target.getAttr("tileX") as number | undefined;
      const tileY = e.target.getAttr("tileY") as number | undefined;
      if (tileX !== undefined && tileY !== undefined)
        setHoveredTile({ x: tileX, y: tileY });
    },
    [setHoveredTile],
  );

  const handleMouseLeave = useCallback(
    () => setHoveredTile(null),
    [setHoveredTile],
  );

  const handleClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const tileX = e.target.getAttr("tileX") as number | undefined;
      const tileY = e.target.getAttr("tileY") as number | undefined;
      if (tileX !== undefined && tileY !== undefined) {
        setSelectedTile({ x: tileX, y: tileY });
        onTileSelect?.();
      }
    },
    [setSelectedTile, onTileSelect],
  );

  // onTap is Konva's touch tap — fires on mobile when it's a clean tap (not drag)
  const handleTap = useCallback(
    (e: KonvaEventObject<Event>) => {
      const tileX = e.target.getAttr("tileX") as number | undefined;
      const tileY = e.target.getAttr("tileY") as number | undefined;
      if (tileX !== undefined && tileY !== undefined) {
        setSelectedTile({ x: tileX, y: tileY });
        onTileSelect?.();
      }
    },
    [setSelectedTile, onTileSelect],
  );

  return (
    <Layer>
      {tiles.map(({ x, y, data }) => {
        const { screenX, screenY } = toIso(x, y);
        const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;
        const isSelected = selectedTile?.x === x && selectedTile?.y === y;
        const isMovingSource = movingFrom?.x === x && movingFrom?.y === y;
        const fill = getTileColor(
          data,
          isHovered,
          isSelected,
          isMovingSource,
          currentUserId,
        );
        const stroke = isSelected
          ? "#fff"
          : isMovingSource
            ? "#93c5fd"
            : isHovered
              ? "#fde68a"
              : "#0f1117";

        return (
          <IsoTile
            key={`${x}_${y}`}
            screenX={screenX}
            screenY={screenY}
            tileX={x}
            tileY={y}
            fill={fill}
            stroke={stroke}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onTap={handleTap}
          />
        );
      })}
    </Layer>
  );
});

interface IsoTileProps {
  screenX: number;
  screenY: number;
  tileX: number;
  tileY: number;
  fill: string;
  stroke: string;
  onMouseMove: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseLeave: () => void;
  onClick: (e: KonvaEventObject<MouseEvent>) => void;
  onTap: (e: KonvaEventObject<Event>) => void;
}

const IsoTile = memo(
  function IsoTile({
    screenX,
    screenY,
    tileX,
    tileY,
    fill,
    stroke,
    onMouseMove,
    onMouseLeave,
    onClick,
    onTap,
  }: IsoTileProps) {
    return (
      <Shape
        tileX={tileX}
        tileY={tileY}
        sceneFunc={(ctx, shape) => drawIsoDiamond(ctx, screenX, screenY, shape)}
        fill={fill}
        stroke={stroke}
        strokeWidth={0.5}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onTap={onTap}
      />
    );
  },
  (prev, next) =>
    prev.fill === next.fill &&
    prev.stroke === next.stroke &&
    prev.screenX === next.screenX &&
    prev.screenY === next.screenY &&
    prev.onTap === next.onTap,
);

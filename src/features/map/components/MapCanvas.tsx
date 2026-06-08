"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Stage } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import { TileLayer } from "./TileLayer";
import { BuildingLayer } from "./BuildingLayer";
import { useMapStore } from "../store";
import { useChunkLoader } from "../hooks/useChunkLoader";
import {
  toIso,
  getVisibleChunks,
  getVisibleTileRange,
} from "../utils/isoCoords";

interface MapCanvasProps {
  currentUserId: string | undefined;
  onTileSelect?: () => void;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;

export function MapCanvas({ currentUserId, onTileSelect }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const { stagePos, stageScale, setStagePos, setStageScale } = useMapStore();
  const isDragging = useRef(false);
  const centeredRef = useRef(false);

  // Center on first real size measurement from ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      setSize({ w, h });
      if (!centeredRef.current && w > 0 && h > 0) {
        centeredRef.current = true;
        const { screenX, screenY } = toIso(50, 50);
        setStagePos({ x: w / 2 - screenX, y: h / 2 - screenY });
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [setStagePos]);

  const visibleChunks = getVisibleChunks(
    stagePos.x,
    stagePos.y,
    stageScale,
    size.w,
    size.h,
  );
  useChunkLoader(visibleChunks);

  const { minTile, maxTile } = getVisibleTileRange(
    stagePos.x,
    stagePos.y,
    stageScale,
    size.w,
    size.h,
  );

  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = e.target.getStage() as KonvaStage;
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const scaleBy = 1.12;
      const newScale =
        e.evt.deltaY < 0
          ? Math.min(oldScale * scaleBy, MAX_SCALE)
          : Math.max(oldScale / scaleBy, MIN_SCALE);

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      setStageScale(newScale);
      setStagePos({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    },
    [setStageScale, setStagePos],
  );

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      isDragging.current = false;
      const stage = e.target as KonvaStage;
      setStagePos({ x: stage.x(), y: stage.y() });
    },
    [setStagePos],
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-[#0a0f1a] cursor-grab active:cursor-grabbing"
    >
      <Stage
        width={size.w}
        height={size.h}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={stageScale}
        scaleY={stageScale}
        draggable
        onWheel={handleWheel}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <TileLayer
          currentUserId={currentUserId}
          minTile={minTile}
          maxTile={maxTile}
          onTileSelect={onTileSelect}
        />
        <BuildingLayer minTile={minTile} maxTile={maxTile} />
      </Stage>
    </div>
  );
}

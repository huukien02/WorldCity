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
const TILE_W = 64;
const TILE_H = 32;

export function MapCanvas({ currentUserId, onTileSelect }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const { stagePos, stageScale, setStagePos, setStageScale } = useMapStore();
  const isDragging = useRef(false);
  const centeredRef = useRef(false);

  // Touch state
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const lastPinchDist = useRef<number | null>(null);

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

  // ── Wheel zoom ────────────────────────────────────────────────────────────
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

  // ── Drag ──────────────────────────────────────────────────────────────────
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

  // ── Touch: tap detection + pinch-to-zoom ─────────────────────────────────
  const handleTouchStart = useCallback((e: KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length === 1) {
      touchStartPos.current = { x: touches[0].clientX, y: touches[0].clientY };
      lastPinchDist.current = null;
    } else if (touches.length === 2) {
      // Start pinch — cancel any pending tap
      touchStartPos.current = null;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: KonvaEventObject<TouchEvent>) => {
      const touches = e.evt.touches;
      if (touches.length !== 2 || lastPinchDist.current === null) return;
      e.evt.preventDefault();

      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      const ratio = newDist / lastPinchDist.current;
      lastPinchDist.current = newDist;

      const stage = e.target.getStage() as KonvaStage;
      const oldScale = stage.scaleX();
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, oldScale * ratio),
      );

      // Zoom toward midpoint of two fingers
      const rect = (stage.container() as HTMLElement).getBoundingClientRect();
      const midX = (touches[0].clientX + touches[1].clientX) / 2 - rect.left;
      const midY = (touches[0].clientY + touches[1].clientY) / 2 - rect.top;
      const mousePointTo = {
        x: (midX - stage.x()) / oldScale,
        y: (midY - stage.y()) / oldScale,
      };
      setStageScale(newScale);
      setStagePos({
        x: midX - mousePointTo.x * newScale,
        y: midY - mousePointTo.y * newScale,
      });
    },
    [setStageScale, setStagePos],
  );

  const handleTouchEnd = useCallback(
    (e: KonvaEventObject<TouchEvent>) => {
      lastPinchDist.current = null;
      if (!touchStartPos.current) return;
      const t = e.evt.changedTouches[0];
      if (!t) return;

      const dx = Math.abs(t.clientX - touchStartPos.current.x);
      const dy = Math.abs(t.clientY - touchStartPos.current.y);
      touchStartPos.current = null;

      // Only treat as tap if finger barely moved (< 10px) — not a pan
      if (dx > 10 || dy > 10) return;

      const stage = e.target.getStage() as KonvaStage;
      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Inverse iso: screen → world → tile
      const worldX = (pos.x - stage.x()) / stage.scaleX();
      const worldY = (pos.y - stage.y()) / stage.scaleY();
      const tileX = Math.floor(
        (worldX / (TILE_W / 2) + worldY / (TILE_H / 2)) / 2,
      );
      const tileY = Math.floor(
        (worldY / (TILE_H / 2) - worldX / (TILE_W / 2)) / 2,
      );

      if (tileX >= 0 && tileX < 100 && tileY >= 0 && tileY < 100) {
        useMapStore.getState().setSelectedTile({ x: tileX, y: tileY });
        onTileSelect?.();
      }
    },
    [onTileSelect],
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-[#0a0f1a] cursor-grab active:cursor-grabbing touch-none"
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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

"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMapStore } from "../store";
import { TILE_COLORS, MAP_SIZE } from "@/types";

const MINI_SIZE = 180; // canvas px
const TILE_PX = MINI_SIZE / MAP_SIZE; // pixel per tile (~1.8)

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);

  const chunkData = useMapStore((s) => s.chunkData);
  const stagePos = useMapStore((s) => s.stagePos);
  const stageScale = useMapStore((s) => s.stageScale);
  const setStagePos = useMapStore((s) => s.setStagePos);

  // Draw tiles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, MINI_SIZE, MINI_SIZE);

    // Background
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, MINI_SIZE, MINI_SIZE);

    // Tiles
    for (const [, tiles] of Object.entries(chunkData)) {
      for (const [key, tile] of Object.entries(tiles)) {
        const [tx, ty] = key.split("_").map(Number);
        const px = Math.floor(tx * TILE_PX);
        const py = Math.floor(ty * TILE_PX);
        const size = Math.max(1, Math.ceil(TILE_PX));

        if (tile.buildingType) {
          ctx.fillStyle = "#f59e0b";
        } else if (tile.ownerId) {
          ctx.fillStyle = TILE_COLORS.owned;
        } else {
          ctx.fillStyle = TILE_COLORS.empty;
        }
        ctx.fillRect(px, py, size, size);
      }
    }

    // Viewport rectangle — convert stage space → tile space → minimap space
    // Tile (0,0) in iso screen = (0,0). We need to figure out which tile is
    // at each corner of the viewport.
    // stagePos.x/y is the canvas translation; stageScale is zoom.
    // The iso formula: screenX=(tx-ty)*32, screenY=(tx+ty)*16
    // We estimate viewport as a rectangle in tile-space using a simplified flat approach
    // (good enough for minimap purposes)
    const TILE_W = 64;
    const TILE_H = 32;
    // Viewport corners in world (stage) coords
    const vpW = canvas?.parentElement?.parentElement?.clientWidth ?? 800;
    const vpH = canvas?.parentElement?.parentElement?.clientHeight ?? 600;
    const worldLeft = -stagePos.x / stageScale;
    const worldTop = -stagePos.y / stageScale;
    const worldRight = worldLeft + vpW / stageScale;
    const worldBottom = worldTop + vpH / stageScale;

    // Convert world corners to tile coords (flat approximation for the rect)
    function worldToTile(wx: number, wy: number) {
      const tx = (wx / (TILE_W / 2) + wy / (TILE_H / 2)) / 2;
      const ty = (wy / (TILE_H / 2) - wx / (TILE_W / 2)) / 2;
      return { tx, ty };
    }

    const corners = [
      worldToTile(worldLeft, worldTop),
      worldToTile(worldRight, worldTop),
      worldToTile(worldLeft, worldBottom),
      worldToTile(worldRight, worldBottom),
    ];
    const minTx = Math.max(0, Math.min(...corners.map((c) => c.tx)));
    const maxTx = Math.min(MAP_SIZE, Math.max(...corners.map((c) => c.tx)));
    const minTy = Math.max(0, Math.min(...corners.map((c) => c.ty)));
    const maxTy = Math.min(MAP_SIZE, Math.max(...corners.map((c) => c.ty)));

    const rx = minTx * TILE_PX;
    const ry = minTy * TILE_PX;
    const rw = (maxTx - minTx) * TILE_PX;
    const rh = (maxTy - minTy) * TILE_PX;

    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(rx, ry, rw, rh);
  }, [chunkData, stagePos, stageScale]);

  function minimapCoordsToStagePos(mx: number, my: number) {
    const TILE_W = 64;
    const TILE_H = 32;
    // mx/my → tile
    const tileX = mx / TILE_PX;
    const tileY = my / TILE_PX;
    // tile → iso screen
    const screenX = (tileX - tileY) * (TILE_W / 2);
    const screenY = (tileX + tileY) * (TILE_H / 2);
    const vw =
      canvasRef.current?.parentElement?.parentElement?.clientWidth ?? 800;
    const vh =
      canvasRef.current?.parentElement?.parentElement?.clientHeight ?? 600;
    return {
      x: vw / 2 - screenX * stageScale,
      y: vh / 2 - screenY * stageScale,
    };
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      isDragging.current = true;
      const rect = canvasRef.current!.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setStagePos(minimapCoordsToStagePos(mx, my));
    },
    [stageScale, setStagePos],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging.current) return;
      const rect = canvasRef.current!.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setStagePos(minimapCoordsToStagePos(mx, my));
    },
    [stageScale, setStagePos],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div className="absolute bottom-14 right-4 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      <div className="bg-slate-900/90 px-2 py-0.5 text-[10px] text-slate-500 tracking-wider uppercase">
        Minimap
      </div>
      <canvas
        ref={canvasRef}
        width={MINI_SIZE}
        height={MINI_SIZE}
        className="block cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}

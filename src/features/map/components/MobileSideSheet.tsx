"use client";

import { useEffect, useRef } from "react";
import { TileInfoPanel } from "./TileInfoPanel";
import { QuestPanel } from "@/features/quest/components/QuestPanel";
import { CityScoreCard } from "@/features/city/components/CityScoreCard";
import { useMapStore } from "../store";

interface MobileSideSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSideSheet({ open, onClose }: MobileSideSheetProps) {
  const selectedTile = useMapStore((s) => s.selectedTile);
  const sheetRef = useRef<HTMLDivElement>(null);
  // Remember tile at open time — only auto-close when THAT tile is deselected
  const tileWhenOpenedRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (open) {
      tileWhenOpenedRef.current = selectedTile;
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-close only if sheet was tile-triggered and that tile got deselected
  useEffect(() => {
    if (!open) return;
    if (tileWhenOpenedRef.current !== null && !selectedTile) {
      onClose();
    }
  }, [selectedTile, open, onClose]);

  // Close on backdrop tap
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <>
      {/* Backdrop — only visible on mobile */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } bg-black/40`}
        onClick={handleBackdropClick}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-slate-900 rounded-t-2xl border-t border-slate-700 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "75dvh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 shrink-0">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
            {selectedTile
              ? `Ô đất (${selectedTile.x}, ${selectedTile.y})`
              : "Thông tin ô đất"}
          </p>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          <TileInfoPanel />
          <QuestPanel />
          <CityScoreCard />
        </div>
      </div>
    </>
  );
}

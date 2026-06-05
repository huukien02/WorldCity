'use client'

import dynamic from 'next/dynamic'
import { Header } from '@/components/layout/Header'
import { TileInfoPanel } from './TileInfoPanel'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { useMapStore } from '../store'

const MapCanvas = dynamic(() => import('./MapCanvas').then(m => ({ default: m.MapCanvas })), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#0a0f1a]">
      <div className="text-slate-500 text-sm">Đang tải bản đồ...</div>
    </div>
  ),
})

export function GameScreen() {
  const user = useCurrentUser()

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto shrink-0">
          <div className="p-3 border-b border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Thông tin ô đất</p>
          </div>
          <TileInfoPanel />
        </aside>

        <main className="flex-1 relative">
          <MapCanvas currentUserId={user?.uid} />
          <ZoomControls />
        </main>
      </div>
    </div>
  )
}

function ZoomControls() {
  const { stageScale, stagePos, setStageScale, setStagePos } = useMapStore()

  function zoom(factor: number) {
    const newScale = Math.max(0.25, Math.min(4, stageScale * factor))
    const ratio = newScale / stageScale
    setStagePos({
      x: stagePos.x * ratio,
      y: stagePos.y * ratio,
    })
    setStageScale(newScale)
  }

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1">
      <button
        onClick={() => zoom(1.2)}
        className="w-8 h-8 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-white text-lg font-bold leading-none transition-colors"
      >
        +
      </button>
      <button
        onClick={() => zoom(1 / 1.2)}
        className="w-8 h-8 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-white text-lg font-bold leading-none transition-colors"
      >
        −
      </button>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useBuildOnTile } from '../hooks/useBuildOnTile'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { useUserGold } from '@/features/economy/hooks/useUserGold'
import { BUILDING_CONFIG, BUILDING_EMOJI } from '@/types'
import type { BuildingType } from '@/types/firestore'

interface BuildModalProps {
  tileX: number
  tileY: number
  onClose: () => void
}

export function BuildModal({ tileX, tileY, onClose }: BuildModalProps) {
  const currentUser = useCurrentUser()
  const { gold } = useUserGold(currentUser?.uid)
  const { buildOnTile } = useBuildOnTile()
  const [selected, setSelected] = useState<BuildingType>('house')
  const [name, setName] = useState('')
  const [building, setBuilding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBuild() {
    if (!currentUser) return
    setBuilding(true)
    setError(null)
    try {
      await buildOnTile(
        currentUser.uid,
        currentUser.displayName ?? 'Unnamed',
        tileX, tileY,
        selected,
        name.trim() || BUILDING_CONFIG[selected].label,
      )
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    } finally {
      setBuilding(false)
    }
  }

  const config = BUILDING_CONFIG[selected]
  const canAfford = gold >= config.cost

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-semibold">Xây công trình</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>

        <p className="text-slate-400 text-xs mb-3">
          Vị trí ({tileX}, {tileY}) · Gold hiện tại: <span className="text-yellow-400">{gold.toLocaleString()}</span>
        </p>

        {/* Scrollable building list */}
        <div className="overflow-y-auto flex-1 space-y-1.5 mb-3 pr-1">
          {(Object.entries(BUILDING_CONFIG) as [BuildingType, typeof BUILDING_CONFIG[BuildingType]][]).map(([type, cfg]) => {
            const canAffordThis = gold >= cfg.cost
            return (
              <button
                key={type}
                onClick={() => setSelected(type)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  selected === type
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="text-base w-6 text-center">{BUILDING_EMOJI[type] ?? '🏠'}</span>
                <span className="flex-1 text-left">{cfg.label}</span>
                <div className="text-right shrink-0">
                  <span className={canAffordThis ? 'text-yellow-400' : 'text-red-400'}>
                    {cfg.cost.toLocaleString()}g
                  </span>
                  <span className="text-slate-500 ml-1.5 text-xs">{cfg.incomePerMinute}/phút</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected building summary */}
        <div className="mb-3 p-2.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-2">
          <span className="text-xl">{BUILDING_EMOJI[selected] ?? '🏠'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">{config.label}</p>
            <p className="text-slate-400 text-xs">{config.incomePerMinute} gold/phút</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
              {config.cost.toLocaleString()} gold
            </p>
            {!canAfford && (
              <p className="text-red-400 text-xs">Thiếu {(config.cost - gold).toLocaleString()}</p>
            )}
          </div>
        </div>

        <input
          type="text"
          placeholder={`Tên (mặc định: ${config.label})`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 mb-3 outline-none focus:border-blue-500"
        />

        {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

        <button
          onClick={handleBuild}
          disabled={building || !canAfford}
          className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {building ? 'Đang xây...' : !canAfford ? 'Không đủ gold' : `Xây ${BUILDING_EMOJI[selected]} (${config.cost.toLocaleString()} gold)`}
        </button>
      </div>
    </div>
  )
}

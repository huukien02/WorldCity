'use client'

import type { QuestDef, QuestProgress, QuestType } from '@/types/firestore'

const QUEST_ICON: Record<QuestType, string> = {
  claim: '🏴',
  build: '🏗️',
  harvest: '🌾',
}

interface Props {
  type: QuestType
  def: QuestDef
  progress: QuestProgress
  onClaim: (type: QuestType) => void
  claiming: boolean
}

export function QuestItem({ type, def, progress, onClaim, claiming }: Props) {
  const pct = Math.min(100, Math.round((progress.current / def.target) * 100))
  const completed = progress.current >= def.target
  const claimed = progress.rewardClaimed

  return (
    <div className={`p-3 rounded-lg border transition-colors ${
      claimed
        ? 'border-slate-700 bg-slate-800/40 opacity-60'
        : completed
        ? 'border-yellow-600/60 bg-yellow-950/30'
        : 'border-slate-700 bg-slate-800/60'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">{QUEST_ICON[type]}</span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{def.title}</p>
            <p className="text-[11px] text-slate-500 truncate">{def.description}</p>
          </div>
        </div>
        <span className="text-xs text-yellow-400 font-medium shrink-0">+{def.reward}g</span>
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-slate-500">
            {progress.current}/{def.target}
          </span>
          <span className="text-[11px] text-slate-500">{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completed ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {completed && !claimed && (
        <button
          onClick={() => onClaim(type)}
          disabled={claiming}
          className="mt-2 w-full py-1 text-xs font-medium rounded bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white transition-colors"
        >
          {claiming ? 'Đang nhận...' : `Nhận thưởng +${def.reward}g`}
        </button>
      )}

      {claimed && (
        <p className="mt-2 text-center text-[11px] text-slate-500">Đã nhận thưởng ✓</p>
      )}
    </div>
  )
}

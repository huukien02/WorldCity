'use client'

import { useState } from 'react'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { useDailyQuests } from '../hooks/useDailyQuests'
import { useClaimQuestReward } from '../hooks/useClaimQuestReward'
import { QuestItem } from './QuestItem'
import { DAILY_BONUS_REWARD } from '../questConfig'
import type { QuestType } from '@/types/firestore'

export function QuestPanel() {
  const user = useCurrentUser()
  const { data, loading } = useDailyQuests(user?.uid)
  const { claimReward, claiming } = useClaimQuestReward()
  const [open, setOpen] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  if (!user) return null

  const allDone = data
    ? (['claim', 'build', 'harvest'] as QuestType[]).every(
        (t) => data.progress[t].rewardClaimed
      )
    : false

  async function handleClaim(type: QuestType) {
    if (!user) return
    try {
      const earned = await claimReward(user.uid, type)
      const bonus = earned > (data?.quests[type].reward ?? 0)
      setToast(
        bonus
          ? `+${earned}g (bao gồm bonus hoàn thành ngày +${DAILY_BONUS_REWARD}g)!`
          : `+${earned}g nhận thành công!`
      )
      setTimeout(() => setToast(null), 3000)
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Lỗi nhận thưởng')
      setTimeout(() => setToast(null), 3000)
    }
  }

  const questTypes: QuestType[] = ['claim', 'build', 'harvest']
  const completedCount = data
    ? questTypes.filter((t) => data.progress[t].current >= data.quests[t].target).length
    : 0

  return (
    <div className="border-t border-slate-800">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Nhiệm vụ hôm nay</span>
          {!allDone && (
            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-medium">
              {completedCount}/3
            </span>
          )}
          {allDone && (
            <span className="text-[10px] bg-yellow-600 text-white px-1.5 py-0.5 rounded-full font-medium">
              ✓
            </span>
          )}
        </div>
        <span className="text-slate-600 text-xs">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {loading || !data ? (
            <p className="text-xs text-slate-600 text-center py-2">Đang tải...</p>
          ) : (
            <>
              {questTypes.map((type) => (
                <QuestItem
                  key={type}
                  type={type}
                  def={data.quests[type]}
                  progress={data.progress[type]}
                  onClaim={handleClaim}
                  claiming={claiming}
                />
              ))}

              {/* Bonus indicator */}
              {!data.bonusRewardClaimed && (
                <p className="text-center text-[11px] text-slate-500 pt-1">
                  Hoàn thành cả 3 → bonus{' '}
                  <span className="text-yellow-500 font-medium">+{DAILY_BONUS_REWARD}g</span>
                </p>
              )}
              {data.bonusRewardClaimed && (
                <p className="text-center text-[11px] text-green-600 pt-1">
                  Bonus đã nhận hôm nay ✓
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="mx-3 mb-2 px-3 py-2 bg-yellow-900/80 border border-yellow-700 rounded text-xs text-yellow-200 text-center">
          {toast}
        </div>
      )}
    </div>
  )
}

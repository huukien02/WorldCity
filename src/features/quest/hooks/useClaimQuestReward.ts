'use client'

import { useState } from 'react'
import { runTransaction, serverTimestamp, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { dailyQuestDoc, userDoc, goldLogsCol } from '@/lib/firestore'
import { getTodayStr, DAILY_BONUS_REWARD } from '../questConfig'
import type { QuestType } from '@/types/firestore'

export function useClaimQuestReward() {
  const [claiming, setClaiming] = useState(false)

  async function claimReward(uid: string, type: QuestType): Promise<number> {
    setClaiming(true)
    let totalEarned = 0
    try {
      const today = getTodayStr()
      const questRef = dailyQuestDoc(uid, today)

      await runTransaction(db, async (tx) => {
        const [questSnap, userSnap] = await Promise.all([
          tx.get(questRef),
          tx.get(userDoc(uid)),
        ])

        if (!questSnap.exists()) throw new Error('Không tìm thấy quest hôm nay')
        if (!userSnap.exists()) throw new Error('User not found')

        const q = questSnap.data()
        const questDef = q.quests[type]
        const progress = q.progress[type]

        if (progress.current < questDef.target) throw new Error('Chưa hoàn thành quest')
        if (progress.rewardClaimed) throw new Error('Đã nhận thưởng rồi')

        totalEarned = questDef.reward

        // Kiểm tra bonus: tất cả quest khác đã claimed chưa
        const otherTypes = (['claim', 'build', 'harvest'] as QuestType[]).filter((t) => t !== type)
        const allOtherClaimed = otherTypes.every((t) => q.progress[t].rewardClaimed)
        const giveBonus = allOtherClaimed && !q.bonusRewardClaimed
        if (giveBonus) totalEarned += DAILY_BONUS_REWARD

        const user = userSnap.data()
        tx.update(userDoc(uid), { gold: user.gold + totalEarned })
        tx.update(questRef, {
          [`progress.${type}.rewardClaimed`]: true,
          ...(giveBonus ? { bonusRewardClaimed: true } : {}),
        })
      })

      await addDoc(goldLogsCol(uid), {
        type: 'earn',
        amount: totalEarned,
        reason: `Daily quest reward: ${type}`,
        balanceBefore: 0,
        balanceAfter: 0,
        createdAt: serverTimestamp(),
      })
    } finally {
      setClaiming(false)
    }
    return totalEarned
  }

  return { claimReward, claiming }
}

'use client'

import { useEffect, useState } from 'react'
import { onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { dailyQuestDoc } from '@/lib/firestore'
import { getDailyQuestDefs, getTodayStr } from '../questConfig'
import type { DailyQuestDoc, QuestType } from '@/types/firestore'

const QUEST_TYPES: QuestType[] = ['claim', 'build', 'harvest']

function buildInitialDoc(uid: string, dateStr: string): Omit<DailyQuestDoc, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } {
  const quests = getDailyQuestDefs(dateStr)
  const progress = Object.fromEntries(
    QUEST_TYPES.map((t) => [t, { current: 0, rewardClaimed: false }])
  ) as DailyQuestDoc['progress']
  return {
    date: dateStr,
    quests,
    progress,
    bonusRewardClaimed: false,
    createdAt: serverTimestamp(),
  }
}

export function useDailyQuests(uid: string | undefined) {
  const [data, setData] = useState<DailyQuestDoc | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) { setLoading(false); return }

    const today = getTodayStr()
    const ref = dailyQuestDoc(uid, today)

    const unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        // Tự động khởi tạo quest ngày hôm nay nếu chưa có
        await setDoc(ref, buildInitialDoc(uid, today) as unknown as DailyQuestDoc)
      } else {
        setData(snap.data())
        setLoading(false)
      }
    })

    return unsub
  }, [uid])

  return { data, loading }
}

import { updateDoc, increment } from 'firebase/firestore'
import { dailyQuestDoc } from '@/lib/firestore'
import { getTodayStr } from '../questConfig'
import type { QuestType } from '@/types/firestore'

// Fire-and-forget: gọi sau khi action chính thành công
// Không cần transaction vì đây là progress tracking — sai lệch 1 unit không critical
export async function trackQuestProgress(uid: string, type: QuestType, amount = 1) {
  try {
    await updateDoc(dailyQuestDoc(uid, getTodayStr()), {
      [`progress.${type}.current`]: increment(amount),
    })
  } catch {
    // Quest doc chưa tồn tại (user chưa init hôm nay) → ignore
  }
}

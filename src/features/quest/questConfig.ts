import type { QuestDef, QuestType } from '@/types/firestore'

// Pool theo từng loại — 3 mức khó: dễ / trung / khó
const CLAIM_POOL: QuestDef[] = [
  { title: 'Mở rộng lãnh thổ', description: 'Claim 1 ô đất mới', target: 1, reward: 50 },
  { title: 'Địa chủ', description: 'Claim 2 ô đất mới', target: 2, reward: 100 },
  { title: 'Bành trướng', description: 'Claim 3 ô đất mới', target: 3, reward: 180 },
]

const BUILD_POOL: QuestDef[] = [
  { title: 'Nhà xây nhà', description: 'Xây 1 công trình mới', target: 1, reward: 80 },
  { title: 'Kiến trúc sư', description: 'Xây 2 công trình mới', target: 2, reward: 150 },
  { title: 'Nhà thầu', description: 'Xây 3 công trình mới', target: 3, reward: 250 },
]

const HARVEST_POOL: QuestDef[] = [
  { title: 'Thu hoạch buổi sáng', description: 'Thu hoạch 1 lần từ building', target: 1, reward: 40 },
  { title: 'Nông dân chăm chỉ', description: 'Thu hoạch 3 lần từ building', target: 3, reward: 100 },
  { title: 'Mùa bội thu', description: 'Thu hoạch 5 lần từ building', target: 5, reward: 180 },
]

// Bonus khi hoàn thành cả 3 quest
export const DAILY_BONUS_REWARD = 300

// Hash đơn giản từ chuỗi ngày → chọn index trong pool
function dateToIndex(dateStr: string): number {
  return dateStr.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)
}

export function getDailyQuestDefs(dateStr: string): Record<QuestType, QuestDef> {
  const idx = dateToIndex(dateStr)
  return {
    claim:   CLAIM_POOL[idx % CLAIM_POOL.length],
    build:   BUILD_POOL[idx % BUILD_POOL.length],
    harvest: HARVEST_POOL[idx % HARVEST_POOL.length],
  }
}

export function getTodayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

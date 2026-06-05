# WorldCity — CLAUDE.md

## Dự án là gì

WorldCity là một thành phố ảo multiplayer trên web. Người dùng đăng nhập, chiếm ô đất trên bản đồ grid 100×100, xây công trình, kiếm gold thụ động, giao tiếp với nhau và tổ chức thành cộng đồng.

Chi tiết kế hoạch và roadmap: [WorldCity_Estimate.md](WorldCity_Estimate.md)

---

## Tech Stack

| Thư viện | Mục đích |
|----------|----------|
| Next.js 15 (App Router) | Framework frontend |
| TypeScript | Type safety toàn bộ |
| Firebase Auth | Đăng nhập Google/Github |
| Firestore | Database realtime |
| Firebase Storage | Upload avatar, assets |
| TailwindCSS v4 | Styling |
| Zustand | Client state (map, UI, auth) |
| React Query (TanStack) | Server state, caching |
| React Konva | Render bản đồ canvas |

---

## Trạng thái hiện tại

**Phase 1 — MVP** (chưa bắt đầu code)

Thứ tự ưu tiên thực tế (cho portfolio):
1. Phase 1 MVP đầy đủ
2. Isometric Map (Phase 5.1)
3. Minimap (Phase 5.2)
4. Global Chat (Phase 2.4)
5. User Profile (Phase 2.1)
6. Leaderboard (Phase 4.5)

---

## Folder Structure

```
src/
  app/                    # Next.js App Router
    (auth)/               # Route group: trang login
    (game)/               # Route group: trang game (cần auth)
      page.tsx            # Trang chính — bản đồ
      profile/[userId]/   # Profile người dùng
      marketplace/        # Chợ đất
      leaderboard/        # Bảng xếp hạng
    layout.tsx
    globals.css

  components/             # UI components dùng chung (không có business logic)
    ui/                   # Button, Modal, Toast, Badge...
    layout/               # Header, Sidebar, Panel...

  features/               # Feature modules — mỗi feature tự chứa logic của mình
    auth/
      components/         # LoginButton, UserAvatar...
      hooks/              # useAuth, useCurrentUser
      store.ts            # Zustand auth store
    map/
      components/         # MapCanvas, TileLayer, BuildingLayer...
      hooks/              # useMapViewport, useTileData, useChunkLoader
      store.ts            # Zustand map store (viewport, selectedTile)
      utils/              # isometric.ts, tileCoords.ts
    building/
      components/         # BuildModal, BuildingInfo, UpgradePanel...
      hooks/              # useBuilding, useHarvest
    chat/
      components/         # ChatPanel, ChatMessage...
      hooks/              # useGlobalChat
    economy/
      hooks/              # useGold, useIncome, useTransaction
    marketplace/
      components/
      hooks/

  lib/
    firebase.ts           # Firebase app init + exports
    firestore.ts          # Typed collection helpers
    storage.ts            # Upload helpers

  types/
    index.ts              # Shared TypeScript types
    firestore.ts          # Firestore document types
```

---

## Firestore Collections

```
users/{userId}
mapChunks/{chunkId}         # chunkId format: "cx_cy" (chunk x, chunk y)
globalChat/{messageId}
activities/{activityId}
notifications/{userId}/items/{notifId}
goldTransactions/{userId}/logs/{logId}
marketplace/{listingId}
visits/{visitId}
guilds/{guildId}
```

Chi tiết schema từng collection: xem [WorldCity_Estimate.md](WorldCity_Estimate.md)

---

## Map Architecture

**Grid:** 100×100 tiles. Tile size: 32×32px khi scale = 1.

**Chunk system:** Map chia thành chunks 10×10 tile (100 chunks tổng).
- chunkId = `"${Math.floor(x/10)}_${Math.floor(y/10)}"`
- Mỗi chunk = 1 Firestore document
- Chỉ subscribe chunks trong viewport, unsubscribe khi ra ngoài

**Tọa độ:**
- Grid: `(x, y)` — integer, 0–99
- Screen (flat): `screenX = x * tileSize`, `screenY = y * tileSize`
- Screen (isometric): `screenX = (x - y) * (tileW / 2)`, `screenY = (x + y) * (tileH / 2)`

**Tile key trong Firestore:** `"${x}_${y}"` (string)

---

## Key Patterns

### Zustand store
```ts
// Mỗi feature có store riêng, không dùng 1 store global
import { create } from 'zustand'

interface MapStore {
  viewport: { x: number; y: number; scale: number }
  selectedTile: { x: number; y: number } | null
  setSelectedTile: (x: number, y: number) => void
}

export const useMapStore = create<MapStore>((set) => ({
  viewport: { x: 0, y: 0, scale: 1 },
  selectedTile: null,
  setSelectedTile: (x, y) => set({ selectedTile: { x, y } }),
}))
```

### Firestore typed helper
```ts
// lib/firestore.ts
import { collection, doc } from 'firebase/firestore'
import type { UserDoc } from '@/types/firestore'

export const usersCol = collection(db, 'users')
export const userDoc = (uid: string) => doc(db, 'users', uid) as DocumentReference<UserDoc>
```

### React Query + Firestore
```ts
// Dùng React Query để cache, dùng onSnapshot cho realtime
export function useTileChunk(chunkId: string) {
  return useQuery({
    queryKey: ['chunk', chunkId],
    queryFn: () => getDoc(chunkDoc(chunkId)).then(d => d.data()),
    staleTime: Infinity, // Firestore subscription tự update
  })
}
```

### Firestore Transaction
```ts
// Luôn dùng transaction cho các thao tác thay đổi nhiều document
await runTransaction(db, async (tx) => {
  const userRef = userDoc(uid)
  const chunkRef = chunkDoc(chunkId)
  const user = await tx.get(userRef)
  // validate...
  tx.update(userRef, { gold: user.data()!.gold - cost })
  tx.update(chunkRef, { [`tiles.${tileKey}.ownerId`]: uid })
})
```

---

## Conventions

- **Không dùng `any`** — dùng `unknown` hoặc define type cụ thể
- **Component file:** PascalCase (`MapCanvas.tsx`)
- **Hook file:** camelCase bắt đầu bằng `use` (`useMapViewport.ts`)
- **Utility file:** camelCase (`isoCoords.ts`)
- **Export:** named export, không dùng default export (trừ page.tsx của Next.js)
- **Tailwind:** class trực tiếp, không tạo CSS file riêng trừ khi cần animation
- **Error handling:** chỉ try/catch ở boundary (UI handler, API route) — không wrap tất cả
- **Không comment** trừ khi logic thực sự khó hiểu

---

## Dev Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run type-check   # TypeScript check không build
npm run lint         # ESLint
```

Firebase Emulator (khi làm việc offline):
```bash
firebase emulators:start
```

---

## Environment Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

File `.env.local` — không commit lên git.

---

## Lưu ý quan trọng

- **Firestore reads:** Mọi query phải giới hạn scope — không bao giờ fetch toàn bộ collection lớn
- **Security Rules:** Mọi write operation cần có rule tương ứng — không để `allow write: if true`
- **Konva performance:** Dùng `React.memo` cho shape components, tách Layer theo loại (tiles / buildings / UI)
- **Gold:** Mọi thay đổi gold phải qua Transaction + ghi log vào `goldTransactions`

# WorldCity - Estimate & Roadmap

## Tổng quan

Dự án: WorldCity - Thành phố ảo cộng đồng

Stack:

- Next.js 15
- TypeScript
- Firebase Auth
- Firestore
- Firebase Storage
- TailwindCSS
- Zustand
- React Query
- React Konva

---

# Estimate Tổng Thể

| Giai đoạn | Nội dung | Thời gian |
|------------|-----------|------------|
| Phase 1 | MVP | 2 tuần |
| Phase 2 | Social Features | 2 tuần |
| Phase 3 | Economy System | 3 tuần |
| Phase 4 | Community Features | 4 tuần |
| Phase 5 | WOW Features | 4-8 tuần |
| Buffer & Testing | Bug Fix, Optimize | 2 tuần |

Tổng thời gian:

- MVP: 1 tháng
- Beta: 2 tháng
- Full sản phẩm: 4-5 tháng

---

# Phase 1 - MVP

## 1.1 Project Setup

**Tasks:**
- [ ] Khởi tạo Next.js 15 với TypeScript
- [ ] Cấu hình TailwindCSS
- [ ] Cấu hình Firebase (Auth, Firestore, Storage)
- [ ] Cấu hình Zustand store cơ bản
- [ ] Cấu hình React Query
- [ ] Setup folder structure

**Folder structure gợi ý:**
```
src/
  app/              # Next.js App Router pages
  components/       # UI components dùng chung
  features/         # Feature modules (map, auth, building...)
  hooks/            # Custom hooks
  lib/              # Firebase config, utils
  stores/           # Zustand stores
  types/            # TypeScript types/interfaces
```

**Done khi:** Project chạy được, connect Firebase thành công

Estimate: **1 ngày**

---

## 1.2 Authentication

**Tasks:**
- [ ] Cài đặt Firebase Auth
- [ ] Login bằng Google OAuth
- [ ] Login bằng Github OAuth
- [ ] Tạo/cập nhật user document trong Firestore khi login lần đầu
- [ ] Lưu auth state vào Zustand
- [ ] AuthGuard component (redirect nếu chưa login)
- [ ] Trang login UI
- [ ] Nút logout

**Firestore schema:**
```
users/{userId}
  uid: string
  displayName: string
  email: string
  photoURL: string
  createdAt: timestamp
  gold: number (default: 1000)
  landCount: number (default: 0)
```

**Done khi:** Login/logout được, user document tạo tự động

Estimate: **1 ngày**

---

## 1.3 Map System

**Tasks:**
- [ ] Cài đặt React Konva
- [ ] Render grid 100x100 bằng Konva Stage + Layer
- [ ] Mỗi tile = 32x32px (tổng canvas ~3200x3200)
- [ ] Implement Pan (kéo để di chuyển bản đồ)
- [ ] Implement Zoom (cuộn chuột để zoom in/out)
- [ ] Giới hạn zoom min/max (0.3x - 3x)
- [ ] Chỉ render tile trong viewport (virtualization) để tránh lag
- [ ] Click vào tile → hiện thông tin tile đó
- [ ] Highlight tile đang hover
- [ ] Màu tile theo trạng thái: trống (xanh lá), có chủ (xám), của mình (xanh dương)

**Zustand Map Store:**
```ts
mapStore:
  tiles: Map<string, TileData>  // key: "x_y"
  selectedTile: {x, y} | null
  viewport: {x, y, scale}
  setSelectedTile(x, y)
  setViewport(...)
```

**Lưu ý kỹ thuật:**
- Dùng `useCallback` và `memo` cho Konva shapes để tránh re-render
- Không load toàn bộ 10.000 tiles từ Firestore cùng lúc — chỉ subscribe theo vùng viewport

**Done khi:** Bản đồ render được, zoom/pan mượt, click tile hiện tọa độ

Estimate: **4 ngày**

---

## 1.4 Firestore Map Data Strategy

**Tasks:**
- [ ] Chia map thành chunks 10x10 (100 chunks tổng)
- [ ] Mỗi chunk là 1 Firestore document chứa 100 tile
- [ ] Chỉ load chunk khi viewport đi vào vùng đó
- [ ] Unsubscribe chunk khi viewport rời khỏi vùng đó

**Firestore schema:**
```
mapChunks/{chunkId}          // chunkId: "0_0", "0_1", ...
  tiles: {
    "0_0": { ownerId, buildingType, ... }
    "0_1": { ... }
    ...
  }
  updatedAt: timestamp
```

**Done khi:** Map load được từ Firestore, không bị lag khi pan

Estimate: **2 ngày** *(gộp chung với Map System)*

---

## 1.5 Land Ownership (Claim Đất)

**Tasks:**
- [ ] Nút "Claim Đất" khi click vào tile trống
- [ ] Kiểm tra tile đã có chủ chưa trước khi claim
- [ ] Kiểm tra user còn đủ gold không (claim tốn gold, ví dụ 100 gold)
- [ ] Cập nhật tile trong mapChunk document
- [ ] Cập nhật landCount và gold của user
- [ ] Dùng Firestore Transaction để đảm bảo atomic
- [ ] Hiển thị tên chủ sở hữu khi hover vào tile có chủ
- [ ] Firestore Security Rules: chỉ owner mới được sửa tile của mình

**Firestore Security Rules cơ bản:**
```
match /mapChunks/{chunkId} {
  allow read: if true;
  allow write: if request.auth != null;  // sẽ siết chặt hơn sau
}
```

**Done khi:** Claim đất được, không thể claim đất người khác, trừ gold đúng

Estimate: **2 ngày**

---

## 1.6 Building System

**Tasks:**
- [ ] Định nghĩa các loại building (House, Shop, Park, Factory...)
- [ ] Modal "Xây công trình" khi click vào tile của mình
- [ ] Hiển thị danh sách building có thể xây + chi phí
- [ ] Xây building → cập nhật tile trong Firestore
- [ ] Hiển thị icon/màu khác nhau trên tile theo loại building
- [ ] Panel thông tin building khi click vào tile có building (tên, loại, chủ, ngày xây)
- [ ] Giới hạn 1 building per tile

**Building types ban đầu:**
```ts
type BuildingType = 'house' | 'shop' | 'park' | 'factory' | 'tower'

buildings:
  house:   cost: 200 gold, income: 10/hour
  shop:    cost: 500 gold, income: 30/hour
  park:    cost: 150 gold, income: 5/hour
  factory: cost: 800 gold, income: 60/hour
  tower:   cost: 1200 gold, income: 100/hour
```

**Firestore schema bổ sung vào tile:**
```
tile:
  ownerId: string
  buildingType: BuildingType | null
  buildingName: string | null
  builtAt: timestamp | null
  level: number (default: 1)
```

**Done khi:** Xây được building, hiện thị đúng trên map, xem được thông tin

Estimate: **3 ngày**

---

## 1.7 UI Layout

**Tasks:**
- [ ] Layout chính: sidebar trái + canvas bản đồ chiếm phần còn lại
- [ ] Header: logo, tên user, số gold hiện tại
- [ ] Sidebar: thông tin tile đang chọn, actions (claim/build)
- [ ] Toolbar: zoom in/out buttons, nút về trung tâm map
- [ ] Loading state khi load map
- [ ] Toast notification (claim thành công, lỗi...)
- [ ] Responsive cơ bản (ít nhất dùng được trên desktop)

**Done khi:** UI nhìn clean, không bị vỡ layout

Estimate: **3 ngày**

---

**Tổng Phase 1: 10-14 ngày**

---

# Phase 2 - Social

## 2.1 User Profile Page

**Tasks:**
- [ ] Trang `/profile/[userId]`
- [ ] Hiển thị: avatar, tên, ngày tham gia, số ô đất, số building
- [ ] Danh sách tile/building của user đó (dạng grid nhỏ)
- [ ] Nút "Đến bản đồ" → pan bản đồ đến tile đầu tiên của user
- [ ] Edit profile (chỉ sửa được của mình): đổi display name, bio ngắn
- [ ] Upload avatar lên Firebase Storage

**Firestore bổ sung:**
```
users/{userId}
  bio: string
  totalBuildings: number
  lastActiveAt: timestamp
```

**Done khi:** Xem profile người khác được, tự edit profile của mình được

Estimate: **2 ngày**

---

## 2.2 Building Detail Page

**Tasks:**
- [ ] Trang `/building/[tileId]` hoặc modal chi tiết
- [ ] Hiển thị: tên building, loại, level, thu nhập/giờ
- [ ] Thông tin chủ sở hữu (avatar, tên, link profile)
- [ ] Lịch sử: ngày xây, ngày nâng cấp gần nhất
- [ ] Số lượt ghé thăm (visitor count)
- [ ] Nút "Ghé thăm" (tăng visitor count)

**Done khi:** Click vào building bất kỳ xem được thông tin đầy đủ

Estimate: **2 ngày**

---

## 2.3 Visit System

**Tasks:**
- [ ] Khi user A click vào building của user B → ghi lại visit
- [ ] Firestore collection `visits` lưu lịch sử ghé thăm
- [ ] Hiển thị "X người đã ghé thăm" trên building detail
- [ ] Danh sách visitor gần đây (5 người cuối)
- [ ] Không đếm visit của chính chủ building

**Firestore schema:**
```
visits/{visitId}
  buildingTileId: string
  visitorId: string
  visitorName: string
  visitedAt: timestamp
  buildingOwnerId: string
```

**Done khi:** Ghé thăm được ghi lại, hiện thị đúng số lượt

Estimate: **1 ngày**

---

## 2.4 Global Chat

**Tasks:**
- [ ] Chat panel ở góc dưới màn hình (có thể thu/mở)
- [ ] Realtime với Firestore onSnapshot
- [ ] Gửi tin nhắn text
- [ ] Hiển thị: avatar nhỏ, tên, tin nhắn, thời gian
- [ ] Click tên trong chat → mở profile
- [ ] Giới hạn lịch sử hiển thị 50 tin nhắn gần nhất
- [ ] Chặn spam: cooldown 3 giây giữa 2 tin

**Firestore schema:**
```
globalChat/{messageId}
  userId: string
  userName: string
  userAvatar: string
  message: string
  createdAt: timestamp
```

**Done khi:** Chat realtime hoạt động, nhiều tab cùng lúc thấy nhau

Estimate: **2 ngày**

---

## 2.5 Activity Feed

**Tasks:**
- [ ] Feed hiển thị các hoạt động gần đây trong thành phố
- [ ] Các sự kiện: claim đất mới, xây building mới, nâng cấp building
- [ ] Mỗi item: avatar, tên, hành động, tọa độ, thời gian
- [ ] Click vào item → pan map đến vị trí đó
- [ ] Realtime update
- [ ] Phân trang (load thêm khi scroll)

**Firestore schema:**
```
activities/{activityId}
  type: 'claim' | 'build' | 'upgrade' | 'visit'
  userId: string
  userName: string
  tileX: number
  tileY: number
  detail: string
  createdAt: timestamp
```

**Done khi:** Feed hiện thị được hoạt động mới nhất, click điều hướng được

Estimate: **2 ngày**

---

## 2.6 Notifications

**Tasks:**
- [ ] Bell icon ở header với badge số thông báo chưa đọc
- [ ] Dropdown hiện danh sách thông báo
- [ ] Các loại thông báo: có người ghé thăm building của mình, ai đó build cạnh mình
- [ ] Đánh dấu đã đọc (single + đọc tất cả)
- [ ] Tự động tạo notification khi có visit

**Firestore schema:**
```
notifications/{userId}/items/{notifId}
  type: 'visit' | 'neighbor'
  fromUserId: string
  fromUserName: string
  message: string
  tileId: string
  isRead: boolean
  createdAt: timestamp
```

**Done khi:** Nhận thông báo khi có người ghé thăm building

Estimate: **2 ngày**

---

**Tổng Phase 2: 9-11 ngày**

---

# Phase 3 - Economy

## 3.1 Gold System

**Tasks:**
- [ ] User bắt đầu với 1000 gold
- [ ] Hiển thị gold realtime ở header
- [ ] Lịch sử giao dịch gold của user
- [ ] Mỗi giao dịch ghi log (claim, build, receive income, trade)

**Firestore schema:**
```
goldTransactions/{userId}/logs/{logId}
  type: 'earn' | 'spend' | 'trade'
  amount: number
  reason: string
  balanceBefore: number
  balanceAfter: number
  createdAt: timestamp
```

**Done khi:** Gold thay đổi đúng khi claim/build, có log giao dịch

Estimate: **2 ngày**

---

## 3.2 Income Calculation (Thu nhập thụ động)

**Tasks:**
- [ ] Mỗi building tạo ra gold theo giờ
- [ ] Dùng Cloud Function (hoặc client-side calculate) để tính thu nhập
- [ ] Nút "Thu hoạch" để nhận gold từ tất cả building
- [ ] Hiển thị "Chờ thu hoạch: X gold" trên từng building
- [ ] Tối đa tích lũy 24 giờ (sau đó ngừng tích lũy nếu không harvest)
- [ ] Animation khi thu hoạch

**Logic tính:**
```
pendingGold = (currentTime - lastHarvestAt) / 3600000 * building.incomePerHour
pendingGold = min(pendingGold, building.incomePerHour * 24)  // cap 24h
```

**Done khi:** Thu nhập tích lũy đúng, harvest được gold

Estimate: **3 ngày**

---

## 3.3 Building Upgrade

**Tasks:**
- [ ] Mỗi building có level 1-5
- [ ] Mỗi level tăng income theo hệ số (x1.5 mỗi level)
- [ ] Hiển thị level hiện tại trên tile (badge nhỏ)
- [ ] Modal upgrade: chi phí, thu nhập hiện tại → sau upgrade
- [ ] Confirm trước khi upgrade (tránh nhấn nhầm)
- [ ] Visual khác nhau theo level (màu đậm hơn, icon lớn hơn)

**Chi phí upgrade:**
```
Level 1→2: buildingCost * 0.5
Level 2→3: buildingCost * 1.0
Level 3→4: buildingCost * 2.0
Level 4→5: buildingCost * 4.0
```

**Done khi:** Upgrade được, income tăng đúng, visual thay đổi

Estimate: **3 ngày**

---

## 3.4 Marketplace (Chợ đất)

**Tasks:**
- [ ] Trang `/marketplace`
- [ ] User có thể đăng bán tile (với giá tự định)
- [ ] Danh sách tile đang bán: lọc theo giá, loại building, vị trí
- [ ] Xem preview vị trí tile trên map nhỏ
- [ ] Nút "Mua" → confirm → chuyển quyền sở hữu
- [ ] Hủy bán (chỉ chủ mới hủy được)
- [ ] Lịch sử giao dịch đất

**Firestore schema:**
```
marketplace/{listingId}
  sellerId: string
  sellerName: string
  tileX: number
  tileY: number
  buildingType: string | null
  buildingLevel: number
  price: number
  status: 'active' | 'sold' | 'cancelled'
  createdAt: timestamp
  soldAt: timestamp | null
  buyerId: string | null
```

**Done khi:** Đăng bán được, mua được, quyền sở hữu chuyển đúng

Estimate: **5 ngày**

---

## 3.5 Trading Logic (An toàn giao dịch)

**Tasks:**
- [ ] Dùng Firestore Transaction cho mọi giao dịch mua/bán
- [ ] Kiểm tra buyer đủ gold trước khi mua
- [ ] Kiểm tra tile vẫn available (chưa bị mua bởi người khác)
- [ ] Atomic: trừ gold buyer + cộng gold seller + chuyển tile owner
- [ ] Nếu bất kỳ bước nào fail → rollback toàn bộ
- [ ] Log giao dịch cho cả 2 bên

**Done khi:** Không thể race condition khi 2 người cùng mua 1 tile

Estimate: **4 ngày** *(gộp phần lớn với Marketplace)*

---

**Tổng Phase 3: 17-20 ngày**

---

# Phase 4 - Community

## 4.1 Districts (Quận/Khu vực)

**Tasks:**
- [ ] Chia map thành các khu vực cố định (ví dụ 10 quận 10x10)
- [ ] Mỗi quận có tên, màu border trên map
- [ ] Hiển thị tên quận khi zoom out
- [ ] Thống kê quận: dân số (số owner), tổng building, top owner
- [ ] Trang `/district/[districtId]` với thông tin chi tiết

**Done khi:** Quận hiện thị trên map, xem được thống kê

Estimate: **3 ngày**

---

## 4.2 Guild System

**Tasks:**
- [ ] Tạo guild (tên, mô tả, icon)
- [ ] Mời thành viên (bằng userId hoặc username)
- [ ] Chấp nhận/từ chối lời mời
- [ ] Vai trò: Leader, Officer, Member
- [ ] Kick thành viên (Officer trở lên)
- [ ] Giải tán guild (chỉ Leader)
- [ ] Trang guild: danh sách thành viên, tổng tài sản của guild
- [ ] Màu/tag guild hiển thị cạnh tên user trong chat

**Firestore schema:**
```
guilds/{guildId}
  name: string
  description: string
  leaderId: string
  members: { [userId]: 'leader' | 'officer' | 'member' }
  memberCount: number
  createdAt: timestamp

users/{userId}
  guildId: string | null
  guildRole: string | null
```

**Done khi:** Tạo guild, mời và kick thành viên được, hiện tag trong chat

Estimate: **4 ngày**

---

## 4.3 Community Buildings

**Tasks:**
- [ ] Loại building đặc biệt: chỉ 1 per quận (Town Hall, Market, Library...)
- [ ] Cần nhiều người đóng góp gold để xây (crowdfund)
- [ ] Thanh tiến độ đóng góp
- [ ] Sau khi xây xong → toàn quận nhận buff (tăng income +10%)
- [ ] Chỉ thành viên quận mới đóng góp được

**Done khi:** Đóng góp được, building xuất hiện khi đủ fund

Estimate: **4 ngày**

---

## 4.4 Events (Sự kiện)

**Tasks:**
- [ ] Admin tạo event có thời gian bắt đầu/kết thúc
- [ ] Các loại event: Double Income Weekend, Land Rush (giảm giá claim), Building Contest
- [ ] Banner thông báo event trên UI
- [ ] Countdown timer
- [ ] Logic apply buff khi event active

**Done khi:** Event hiện thị, buff hoạt động trong thời gian event

Estimate: **3 ngày**

---

## 4.5 Leaderboard

**Tasks:**
- [ ] Trang `/leaderboard`
- [ ] Bảng xếp hạng theo: tổng gold, số đất, số building, tổng income/giờ
- [ ] Realtime top 50
- [ ] Highlight vị trí của bản thân
- [ ] Bảng xếp hạng theo quận
- [ ] Bảng xếp hạng theo guild

**Done khi:** Leaderboard hiện đúng, cập nhật khi có thay đổi

Estimate: **2 ngày**

---

**Tổng Phase 4: 16-18 ngày**

---

# Phase 5 - WOW Features

> Ưu tiên làm sớm nếu mục tiêu là Portfolio

## 5.1 Isometric Map

**Tasks:**
- [ ] Chuyển từ grid vuông sang isometric (góc 45°, tile hình thoi)
- [ ] Tính toán tọa độ isometric từ tọa độ grid (x, y) → (screenX, screenY)
- [ ] Vẽ tile isometric bằng Konva Polygon hoặc Image
- [ ] Xử lý z-order (tile gần camera vẽ sau để đè lên tile xa)
- [ ] Building sprite theo góc nhìn isometric
- [ ] Giữ nguyên toàn bộ logic click/hover/select

**Công thức isometric:**
```ts
screenX = (x - y) * (tileWidth / 2)
screenY = (x + y) * (tileHeight / 2)
```

**Lưu ý:** Đây là task phức tạp nhất — nên tạo branch riêng, không đụng vào logic hiện tại

**Done khi:** Map hiển thị isometric, click đúng tile, pan/zoom vẫn hoạt động

Estimate: **10 ngày**

---

## 5.2 Minimap

**Tasks:**
- [ ] Canvas nhỏ góc dưới phải (200x200px)
- [ ] Hiển thị toàn bộ 100x100 map thu nhỏ (mỗi tile = 2px)
- [ ] Màu theo trạng thái: trống/có chủ/building
- [ ] Rectangle hiển thị vùng viewport hiện tại
- [ ] Click vào minimap → pan main map đến vị trí đó
- [ ] Kéo rectangle trên minimap để pan

**Done khi:** Minimap phản ánh đúng map, navigation hoạt động

Estimate: **3 ngày**

---

## 5.3 Advanced Zoom

**Tasks:**
- [ ] Zoom smooth (easing animation)
- [ ] Zoom vào vị trí con trỏ chuột (không phải center)
- [ ] Pinch-to-zoom trên mobile/trackpad
- [ ] Zoom levels: 0.25x → 0.5x → 1x → 2x → 4x
- [ ] Ở zoom thấp hiện tên quận, ở zoom cao hiện tên building

**Done khi:** Zoom mượt, đúng vị trí chuột

Estimate: **2 ngày**

---

## 5.4 Day/Night Cycle

**Tasks:**
- [ ] Chu kỳ ngày/đêm theo giờ thực (hoặc game time accelerated)
- [ ] Overlay màu trên canvas thay đổi theo thời gian: sáng/chiều/tối/đêm
- [ ] Đèn đường/đèn building bật lên vào ban đêm (glow effect)
- [ ] Bầu trời gradient thay đổi phía sau map
- [ ] Buff: income tăng vào ban ngày, giảm vào ban đêm

**Done khi:** Nhìn thấy sự thay đổi visual theo thời gian

Estimate: **3 ngày**

---

## 5.5 NPC Simulation

**Tasks:**
- [ ] NPC là các chấm/sprite nhỏ di chuyển trên map
- [ ] Pathfinding đơn giản: di chuyển ngẫu nhiên, tránh ô không có đường
- [ ] Mật độ NPC tỷ lệ với số building trong khu vực
- [ ] NPC dừng ở building một lúc rồi đi tiếp
- [ ] Hiệu ứng đơn giản, không ảnh hưởng performance

**Done khi:** NPC di chuyển được, không gây lag

Estimate: **7 ngày**

---

## 5.6 Animations

**Tasks:**
- [ ] Animation khi xây building (xuất hiện từ dưới lên)
- [ ] Animation khi claim đất (ripple effect)
- [ ] Animation khi thu hoạch gold (gold coins bay lên)
- [ ] Idle animation cho building (khói từ nhà máy, đèn nhấp nháy...)
- [ ] Transition mượt khi pan/zoom

**Done khi:** Các animation cơ bản hoạt động, không lag

Estimate: **5 ngày**

---

**Tổng Phase 5: 30-40 ngày**

---

# Chi Phí Firebase Dự Kiến

## 100 Users

- Free Tier gần như đủ

## 1.000 Users

- Khoảng 10-30 USD/tháng

## 10.000 Users

- Khoảng 100-300 USD/tháng

---

# Firestore Security Rules Tổng Thể

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // User chỉ đọc/sửa profile của mình
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }

    // Map chunks: đọc public, ghi cần đăng nhập + validate
    match /mapChunks/{chunkId} {
      allow read: if true;
      allow write: if request.auth != null;
      // TODO: thêm validation cụ thể hơn
    }

    // Chat: đọc public, ghi cần đăng nhập
    match /globalChat/{messageId} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }

    // Notifications: chỉ đọc của mình
    match /notifications/{userId}/items/{notifId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

# Ưu Tiên Portfolio

Nếu mục tiêu là Portfolio, làm theo thứ tự này:

1. **Phase 1 đầy đủ** — nền tảng bắt buộc
2. **Phase 5.1 Isometric Map** — visual ấn tượng nhất
3. **Phase 5.2 Minimap** — UI hoàn thiện
4. **Phase 2.4 Global Chat** — chứng minh realtime skill
5. **Phase 2.1 User Profile** — social feature cơ bản
6. **Phase 4.5 Leaderboard** — dễ làm, visual tốt
7. **Phase 3.1-3.2 Gold + Income** — game loop cơ bản

> Hoàn thành các tính năng trên đã đủ tạo một dự án nổi bật cho CV Frontend/Fullstack.
> Deploy lên Vercel, record demo video 2-3 phút, push lên GitHub với README đẹp.

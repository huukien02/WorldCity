Tạo scaffold cho một feature module mới trong dự án WorldCity.

Feature name: $ARGUMENTS

Thực hiện các bước sau:

1. Tạo thư mục `src/features/$ARGUMENTS/` với cấu trúc:
   - `components/` — thư mục rỗng (tạo `.gitkeep`)
   - `hooks/` — thư mục rỗng (tạo `.gitkeep`)
   - `index.ts` — barrel export

2. Tạo file `src/features/$ARGUMENTS/index.ts`:
```ts
// Public API của feature $ARGUMENTS
// Export components và hooks tại đây khi đã tạo
```

3. Tạo file `src/features/$ARGUMENTS/store.ts` nếu feature cần client state:
```ts
import { create } from 'zustand'

interface ${PascalCase($ARGUMENTS)}Store {
  // TODO: define state
}

export const use${PascalCase($ARGUMENTS)}Store = create<${PascalCase($ARGUMENTS)}Store>()((set) => ({
  // TODO: implement
}))
```

4. Tạo file `src/types/firestore.ts` nếu chưa có, hoặc thêm interface mới cho feature này.

5. Sau khi tạo xong, in ra danh sách file đã tạo và hướng dẫn bước tiếp theo (implement hook đầu tiên hoặc component đầu tiên).

Lưu ý:
- Dùng named export, không dùng default export
- Không viết comment thừa
- Đặt tên file theo camelCase, component theo PascalCase

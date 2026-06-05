Tạo một React component mới cho dự án WorldCity.

Tên và vị trí component: $ARGUMENTS
(Ví dụ: "BuildModal trong features/building/components" hoặc chỉ "Button trong components/ui")

Thực hiện:

1. Phân tích $ARGUMENTS để xác định:
   - Tên component (PascalCase)
   - Thư mục đặt component
   - Loại component (UI generic hay feature-specific)

2. Đọc các file liên quan trong thư mục đó nếu đã tồn tại để hiểu pattern hiện tại.

3. Tạo file component với template sau:
```tsx
import type { FC } from 'react'

interface ${ComponentName}Props {
  // TODO: define props
}

export const ${ComponentName}: FC<${ComponentName}Props> = ({ ...props }) => {
  return (
    <div>
      {/* TODO */}
    </div>
  )
}
```

4. Nếu component cần state → thêm useState/useReducer phù hợp.
   Nếu component cần Firebase data → tạo hook riêng trong `hooks/` cùng thư mục.
   Nếu component cần Zustand → import store tương ứng.

5. Export component trong `index.ts` của feature (nếu là feature component).

6. Nếu là UI component trong `components/ui/`, kiểm tra xem có thể tái sử dụng primitive từ các component đã có không.

Conventions bắt buộc:
- Named export (không default export)
- TypeScript strict — không dùng `any`
- TailwindCSS cho styling — không viết CSS file riêng
- Không thêm comment giải thích "what" — chỉ thêm comment khi logic thực sự không rõ ràng

Kiểm tra tiến độ hiện tại của dự án WorldCity theo từng phase.

Thực hiện:

1. Đọc file `WorldCity_Estimate.md` để lấy danh sách task checklist của từng phase.

2. Đọc cấu trúc thư mục `src/` để xác định những gì đã được implement:
   - Kiểm tra các file tồn tại trong `src/features/`
   - Kiểm tra các page trong `src/app/`
   - Kiểm tra `src/lib/firebase.ts` (Firebase đã setup chưa)

3. Với mỗi Phase (1-5), in ra:
   - Tổng số task
   - Số task đã done (dựa trên code thực tế, không chỉ dựa checklist)
   - % hoàn thành
   - Các task còn lại quan trọng nhất (top 3)

4. In ra "Next recommended task" — task đơn lẻ nên làm tiếp theo dựa trên:
   - Phase hiện tại đang làm
   - Thứ tự ưu tiên portfolio (Isometric Map > Chat > Profile > Leaderboard)
   - Dependency (task A phải xong trước task B)

5. Format output:

```
## WorldCity — Phase Status

### Phase 1 — MVP: X/Y tasks (Z%)
✅ Project Setup
✅ Authentication  
🔄 Map System (đang làm)
⬜ Land Ownership
⬜ Building System

### Phase 2 — Social: 0/6 tasks (0%)
...

---
**Next task:** [Tên task cụ thể]
**Lý do:** [1 câu giải thích tại sao task này]
```

Nếu thư mục `src/` chưa tồn tại → báo "Dự án chưa có code, bắt đầu từ Phase 1.1 Project Setup".

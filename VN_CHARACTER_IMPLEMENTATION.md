# 🎮 KẾ HOẠCH TRIỂN KHAI NHÂN VẬT VISUAL NOVEL (SPRITES & POSITIONING)

Tài liệu này mô tả chi tiết các bước để hiển thị hình ảnh nhân vật (sprites) thay vì placeholder tĩnh, đồng thời xử lý vị trí nhân vật (trái/phải) lấp ló phía sau hộp thoại hội thoại theo chuẩn phong cách Visual Novel.

## 1. Cập nhật Dữ liệu JSON (`public/data/vn/vn_chapter_01.json`)

**Mục tiêu:** Định nghĩa vị trí mặc định trên khung hình và đường dẫn hình ảnh cho từng trạng thái cảm xúc của nhân vật.

**Cách làm:**
Thêm thuộc tính `position` (`"left"` | `"right"`) và `sprites` (object ánh xạ `emotion` -> `URL hình ảnh`) vào mỗi nhân vật trong khối `characters`.

```json
"characters": {
  "mascot": {
    "name": "Shiba",
    "color": "#FF9F1C",
    "position": "right",
    "sprites": {
      "idle": "/images/characters/shiba_idle.png",
      "happy": "/images/characters/shiba_happy.png",
      "success": "/images/characters/shiba_success.png",
      "fail": "/images/characters/shiba_sad.png"
    }
  },
  "nam": {
    "name": "Nam",
    "color": "#06D6A0",
    "position": "left",
    "sprites": {
      "idle": "/images/characters/nam_idle.png",
      "happy": "/images/characters/nam_happy.png"
    }
  }
}
```

## 2. Cập nhật Component `VNCharacter.tsx`

**Mục tiêu:** Render hình ảnh thực tế nếu có `sprites`, xử lý hiệu ứng trượt từ 2 bên mép màn hình vào.

**Cách làm:**

- **Bổ sung Props:** Component sẽ nhận thêm `position` (left/right) và `spriteUrl` (đường dẫn ảnh).
- **Hoạt ảnh (Animation):** Thay vì animate nhảy lên xuống (`y: 20 -> 0`), ta sẽ làm hiệu ứng trượt ngang:
  - Nếu `position === "left"`: Trượt từ trái vào (`x: -50 -> 0`).
  - Nếu `position === "right"`: Trượt từ phải vào (`x: 50 -> 0`).
- **Hiển thị Ảnh:** Sử dụng thẻ `<img src={spriteUrl} ... />`. Nếu không có `spriteUrl` (ví dụ chưa có ảnh), sẽ có UI fallback về cục khối màu placeholder cũ.

## 3. Cập nhật Layout trong `VisualNovelMode.tsx`

**Mục tiêu:** Xử lý layout sao cho nhân vật nằm phía sau khung chat và lệch sang hai bên như các game Visual Novel.

**Cách làm:**

- **Gỡ bỏ căn giữa:** Xóa class `flex justify-center` bao quanh thẻ `<VNCharacter>`.
- **Thay đổi Positioning:** Đặt container nhân vật `absolute` neo vào bottom (ví dụ `bottom-[15%]`), với `z-index` thấp hơn `VNDialogueBox` (`z-20`). Nhờ vậy nhân vật dạng trong suốt (.png) sẽ bị khung thoại che mất nửa dưới, tạo chiều sâu 3D.
- **Căn lề (Alignment):** Lấy thông tin `position` từ metadata của nhân vật (thông qua `storyData.characters`).
  - Áp dụng class `left-0` hoặc `right-0` tương ứng.
- **Truyền dữ liệu:** Truy xuất vào object `sprites` của nhân vật đang nói, lấy ra value dựa vào `displayNode.emotion` để lấy đúng ảnh và truyền vào `VNCharacter`.

## 4. Nâng cấp UI Lựa chọn (VNChoices - Dynamic Anime Style)

**Mục tiêu:** Tránh việc các nút bấm lựa chọn che mất hình ảnh nhân vật ở giữa màn hình. Mang lại trải nghiệm cá tính, năng động kiểu game Persona/Danganronpa.

**Cách làm:**

- **Vị trí (Positioning):** Bỏ neo ở chính giữa, thay vào đó để các lựa chọn dàn trải trên màn hình.
- **Hoạt ảnh (Animation):** Dựa vào vị trí chẵn/lẻ (index) để animate:
  - **Lựa chọn 1 (index chẵn):** Neo sát lề trái, trượt nhanh từ trái vào (`x: -100% -> 0`).
  - **Lựa chọn 2 (index lẻ):** Neo sát lề phải, trượt nhanh từ phải vào (`x: 100% -> 0`).
- **Thiết kế Nút (Styling):** Áp dụng hiệu ứng hơi nghiêng (`skew-x-[-2deg]`) để tạo cảm giác phá cách. Cỡ chữ to, viền dày dặn, đổ bóng đậm (solid shadow).
- **Tương tác:** Hover/Click sẽ làm nút phình to, khôi phục góc nghiêng về 0 để dễ đọc và sáng lên.

## 5. Các bước tiến hành Code thực tế (Roadmap)

- [ ] Bước 1: Sửa đổi file `vn_chapter_01.json` để thêm cấu hình vị trí & ảnh nhân vật.
- [ ] Bước 2: Cập nhật `VNCharacter.tsx` để hiển thị hình ảnh & animate theo chiều ngang.
- [ ] Bước 3: Sửa bố cục trong `VisualNovelMode.tsx` để điều phối vị trí nhân vật chuẩn xác.
- [ ] Bước 4: Thiết kế lại component `VNChoices.tsx` với hiệu ứng trượt so le.

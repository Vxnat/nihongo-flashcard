# Kế Hoạch Triển Khai: Tương Tác Sticker, Trang Phục Shiba & Chủ Đề Ứng Dụng

Tài liệu này chi tiết phương án kỹ thuật và thiết kế UI/UX để hiện thực hóa tính năng cho 3 nhóm vật phẩm: **Sticker (Hình dán)**, **Outfit (Trang phục)** và **Theme (Chủ đề)**.

---

## 🌸 1. Nhóm Vật Phẩm: Stickers (Hình Dán Tương Tác)

Stickers có hai tính năng chính: **Dán trang trí lên thẻ học** và **Tương tác tặng quà cho Shiba**.

### A. Tùy Biến Thẻ Học (Card Decoration)
* **Mô tả**: Trong giao diện học từ vựng (`src/components/Flashcard.tsx`), thêm một nút nhỏ hình bánh răng hoặc bảng vẽ ở góc. Khi click, mở ra khay chứa các Sticker đã mở khóa (`userStats.inventory` lọc theo tiền tố `stk_`).
* **Hoạt động**: Người dùng chọn sticker và click để dán vào một trong các vị trí cố định trên thẻ (ví dụ: góc trên trái, góc dưới phải, mặt sau). Vị trí dán sẽ được lưu cục bộ trong LocalStorage.
* **UI**: Sticker hiển thị nhỏ gọn (`w-8 h-8`), có animation bập bùng nhẹ khi xuất hiện.

### B. Cho Shiba Ăn & Nhận Xương (Interactive Feeding)
* **Mô tả**: Trong giao diện [ShibaRoom.tsx](file:///home/ubuntu/DuAn/nihongo-flashcard/src/components/ShibaRoom.tsx), khi mở hòm đồ tab Sticker, bên cạnh vật phẩm sẽ có nút **"TẶNG QUÀ"**.
* **Xử lý Logic**:
  * Tặng cơm nắm (`stk_onigiri`): Tốn 1 sticker cơm nắm. Chú Shiba sẽ nhảy lên vui mừng kèm hiệu ứng hạt biểu cảm (`🐾`). Cộng ngay lập tức từ `+5` đến `+10 Xương` vào tài khoản của người dùng.
  * Tặng trà xanh (`stk_matcha`): Tốn 1 sticker matcha. Shiba uống trà sẽ được "tỉnh táo" (kích hoạt buff hiệu suất phòng: nhân đôi sản lượng xương `bonesPerHour` trong 2 giờ tiếp theo). Trạng thái buff này lưu thời gian hết hạn `buffMatchaUntil: Date.now() + 2 * 60 * 60 * 1000`.

---

## 🧣 2. Nhóm Vật Phẩm: Outfits (Trang Phục Shiba)

Outfits mang lại diện mạo mới cho Shiba mascot và gia tăng chỉ số MMORPG cho căn phòng.

### A. Giao Diện Thay Trang Phục (Cosmetics Overlay)
* **Mô tả**: Thêm một ô khảm trang bị mới (Socket) trong phòng Shiba bên cạnh 4 socket cũ, đặt tên là **"Thời trang" (Outfit)**.
* **Cơ chế hiển thị**:
  * Chú Shiba mascot được hiển thị bằng một thẻ `div` tương đối (`relative`).
  * Khi trang bị một Outfit (`userStats.equippedOutfit`), hệ thống sẽ render thêm một layer ảnh PNG của phụ kiện (mũ, khăn, mặt nạ) đè lên trên ảnh Shiba.
  * Tọa độ của layer phụ kiện được căn chỉnh tuyệt đối (`absolute`) khớp với vị trí đầu/cổ của chú Shiba:
    * Khăn quàng đỏ (`out_scarf`): `bottom-[20%] left-[25%] w-[45%]`.
    * Mũ ếch xanh (`out_frog_hat`): `top-[-5%] left-[25%] w-[50%]`.
    * Đồ Ninja (`out_ninja`): Hiển thị mặt nạ ninja đè lên mặt Shiba.

### B. Chỉ Số Bổ Trợ & Sự Kiện "Đi Tuần" (Random Events)
* **Thuộc tính tĩnh**:
  * Khăn quàng đỏ: Tăng hiệu suất phòng `+1 Xương/giờ`.
  * Mũ ếch xanh: `5%` cơ hội nhân đôi số xương nhận được khi thu hoạch.
* **Cơ chế ngẫu nhiên "Đi tuần" (Chỉ áp dụng khi mặc Đồ Ninja `out_ninja`)**:
  * Khi người dùng ôn tập xong một xấp thẻ (xử lý trong hook `useFlashcardDeck.ts` khi kích hoạt `victory`), hoặc mỗi khi người dùng thu hoạch xương trong Shiba Room:
  * Chạy tỷ lệ `20%`. Nếu trúng, hệ thống cộng ngẫu nhiên `10 - 20 Xương`.
  * Hiển thị thông báo Toast đẹp mắt: *"🥷 Shiba Ninja vừa đi tuần tra và mang về thêm X Xương!"*.

---

## 🎨 3. Nhóm Vật Phẩm: Themes (Chủ Đề Ứng Dụng)

Themes thay đổi hoàn toàn phong cách màu sắc, không khí của toàn bộ app.

### A. Quản Lý Theme Bằng CSS Variables
Định nghĩa các Class chủ đề trong file CSS toàn cục `src/app/globals.css` (hoặc `index.css`), thay đổi các biến màu cốt lõi của Tailwind:
```css
/* Theme Sakura */
.theme-sakura {
  --background: #FFF5F7;
  --primary: #FF7096;
  --primary-hover: #FF8FAB;
  --primary-border: #C7486B;
  --card-bg: #FFFFFF;
}

/* Theme Divine Shiba */
.theme-divine {
  --background: #FFFDF2;
  --primary: #D4AF37;
  --primary-hover: #E5C258;
  --primary-border: #9E7815;
  --card-bg: #FFFFFF;
  --foreground: #4D3A1B;
}
```

### B. Các Hiệu Ứng Trực Quan Đi Kèm
1. **🌸 Chủ đề Sakura (`thm_sakura`)**:
   * Tông màu hồng phấn lãng mạn.
   * Thêm một thành phần hiệu ứng cánh hoa rơi chậm phủ mờ ở hình nền của toàn app (tương tự như hiệu ứng Sakura trong Shiba Room).
2. **✨ Thần Khuyển Tôn Cực (`thm_divine_shiba`)**:
   * Tông màu vàng kim hoàng gia và trắng sữa sang xịn.
   * Các nút bấm chính sẽ có hoạt họa viền phát sáng chạy vòng quanh (Animated Border Glow).
   * Khi người dùng nhấp chuột hoặc chạm vào màn hình, sẽ xuất hiện các hạt lấp lánh (Sparkle Particles) tỏa ra tại tọa độ click.

---

## 🛠️ 4. Các Bước Thực Hiện Kỹ Thuật

1. **Cấu trúc lại store (`useAppStore.ts`)**:
   * Thêm các trường dữ liệu: `equippedOutfit`, `activeTheme`, `buffs: { doubleBonesUntil: number }`.
   * Tạo action `equipOutfit(outfitId)` và `applyTheme(themeId)`.
   * Tạo action `useSticker(stickerId)` xử lý trừ sticker và cộng xương / kích hoạt buff.
2. **Tích hợp Theme Wrapper**:
   * Cập nhật file root layout (`src/app/layout.tsx` hoặc `page.tsx`) đọc state `activeTheme` từ store và thêm class tương ứng vào thẻ `body` (ví dụ: `className={activeTheme}`).
3. **Cập nhật UI Shiba Room**:
   * Bố trí ô khảm thời trang cho Shiba.
   * Render đè các asset trang phục lên trên hình ảnh Shiba mascot.
4. **Bổ sung hiệu ứng hình ảnh**:
   * Viết các hiệu ứng cánh hoa rơi, hạt sao lung linh, nhạc nền và hạt lấp lánh tương ứng cho từng Theme.

# 🐕 KẾ HOẠCH REBRANDING: SHIBA TOWN

**Ngữ cảnh:** 
Đổi tên và concept của ứng dụng Flashcard hiện tại thành **"Shiba Town"** (Thị trấn Shiba). Ứng dụng sẽ mang không khí chữa lành, nhập vai nhẹ nhàng, với nhân vật chính là một chú chó Shiba.

**Thay đổi cốt lõi:**
- **Tên ứng dụng:** Shiba Town
- **Slogan:** Khám phá tiếng Nhật cùng bé Shiba!
- **Đơn vị tiền tệ:** Xu (🪙/Coins) -> Xương (🦴/Bones)

---

## 📦 BƯỚC 1: CẬP NHẬT TÊN VÀ METADATA CƠ BẢN

1. **`src/app/layout.tsx`**
   - Đổi `metadata.title` thành `Shiba Town 🐕`.
   - Đổi `metadata.description` thành `Khám phá tiếng Nhật cùng bé Shiba!`.
   - Đổi `appleWebApp.title` thành `Shiba Town`.

2. **`src/app/page.tsx`**
   - Tìm thẻ `<h1>` ở màn hình chính, đổi text "Flashcard" (hoặc tên hiện tại) thành `Shiba Town 🐕`.
   - Tìm thẻ `<p>` hiển thị slogan dưới tiêu đề, đổi thành: `Khám phá tiếng Nhật cùng bé Shiba! ✨`.

3. **`src/components/SplashScreen.tsx`**
   - Đổi dòng text "Nihongo Card" (hoặc Flashcard) thành `Shiba Town`.
   - Thay icon chữ "あ" trong khối nghiêng thành 🐕 (hoặc một icon Shiba nếu có).

---

## 🦴 BƯỚC 2: CẬP NHẬT HỆ THỐNG TIỀN TỆ (XU -> XƯƠNG)

Cần tìm và thay thế tất cả các biểu tượng đồng xu (`🪙` hoặc icon `Coins` từ `lucide-react`) và chữ "Xu" thành "Xương" (`🦴`).

1. **`src/components/DailyQuestsModal.tsx`**
   - Thay text `"Làm nhiệm vụ để lấy Xu..."` thành `"Làm nhiệm vụ để lấy Xương..."`.
   - Đổi biến chứa Icon `<Coins />` thành `<Bone />` (cần import Bone từ lucide-react) hoặc dùng thẳng emoji `🦴`.
   - Sửa các text nút bấm: `"Nhận {reward} Xu"` -> `"Nhận {reward} Xương"`.

2. **`src/components/GachaShop.tsx`**
   - Thay text `"10 Xu / Lần"` thành `"10 Xương / Lần"`.
   - Đổi text báo lỗi: `"Không đủ Xu!"` -> `"Không đủ Xương!"`.
   - Cập nhật hiển thị số dư ở góc trên: Thay icon `<Coins />` thành `🦴`.

3. **`src/components/VNEndScreen.tsx`**
   - Khi hoàn thành Visual Novel, hiển thị phần thưởng: Đổi text `"Nhận Xu & Đóng"` thành `"Nhận Xương & Đóng"`.
   - Thay icon phần thưởng `🪙` bự giữa màn hình thành `🦴`.
   - Cập nhật nội dung toast notification: `"Đã nhận X Xu!"` -> `"Đã nhận X Xương!"`.

4. **`src/components/SystemRoadmap.tsx`**
   - Ở phần logic khi mở Rương (`item.deck.type === "chest"`): 
     - Đổi thông báo toast: `"Bạn nhận được X xu!"` -> `"Bạn nhận được X Xương!"`.

---

## 🎨 BƯỚC 3: CẬP NHẬT UI/UX PHỤ TRỢ (TÙY CHỌN)

- **Màu sắc:** Màu chủ đạo hiện tại (Cam `#FF9F1C`, Vàng `#FFD166`, Hồng `#FF7096`) đã rất hợp với vibe của Shiba Town. Có thể giữ nguyên.
- **Hình nền Gacha:** Đổi text `"Máy Quay Trứng"` thành `"Máy Phát Thưởng Shiba"` hoặc tương tự.

---

*Sau khi bạn xác nhận kế hoạch này, chúng ta sẽ tiến hành apply code cho từng bước một!*
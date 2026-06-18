# 🐕‍🦺 KẾ HOẠCH TRIỂN KHAI: HỆ THỐNG GỢI Ý "SƯ PHỤ SHIBA" (KANJI DOJO)

**Ngữ cảnh:**
Nâng cấp nút "Hỏi Sư Phụ" vô tri hiện tại thành một hệ thống tương tác có chiều sâu hơn. Người chơi sẽ đối thoại với "Sư Phụ Shiba", lựa chọn các gói viện trợ với mức giá (Xương) khác nhau thay vì chỉ có 1 lựa chọn.

---

## 🎯 PHẦN 1: PHÂN CẤP GỢI Ý & KINH TẾ (ECONOMY)

Sư phụ Shiba sẽ đưa ra 3 gói gợi ý cho đồ đệ lựa chọn:

1. **👀 Nhìn Lén (Gợi ý 1 nét):**
   - **Tác dụng:** Chỉ vẽ mẫu nhanh nét **tiếp theo** cần phải viết. Phù hợp khi người chơi chỉ quên 1 nét nhỏ, muốn tự lực cánh sinh ở phần còn lại.
   - **Chi phí:** Mất **1 Xương (🦴)**. KHÔNG áp dụng lượt Free (Vì rẻ quá rồi).
   
2. **🖌️ Múa Cọ (Gợi ý toàn bộ):**
   - **Tác dụng:** Sư phụ vẽ mẫu từ đầu đến cuối toàn bộ chữ Kanji để đồ đệ nhìn (Tính năng hiện tại).
   - **Chi phí:** Ưu tiên dùng **1 Lượt Hint Miễn phí (🛟)** mỗi ngày. Nếu hết, tốn **3 Xương (🦴)**.

3. **✨ Vượt Ải (Sư phụ viết hộ):**
   - **Tác dụng:** Sư phụ tự tay viết luôn chữ đó, tính là qua ải thành công, không bị trừ máu. Dành cho những ca "bó tay toàn tập".
   - **Chi phí:** Mất **5 Xương (🦴)**. KHÔNG áp dụng lượt Free.

---

## 🎨 PHẦN 2: THIẾT KẾ UI/UX (SƯ PHỤ SHIBA DIALOG - PHONG CÁCH "CHUI HẦM")

Thay vì dùng `ConfirmationPopover` khô khan, ta sẽ làm một Modal overlay mang phong cách Visual Novel mini ngay trong Đạo Đường với thiết kế lấp ló:

- **Hoạt ảnh xuất hiện:** Màn hình nền tối đi (Backdrop blur). Từ góc dưới màn hình, hình ảnh Sư Phụ Shiba (nửa người) sẽ **bật nảy (bounce) từ dưới lên**.
- **Bong bóng thoại (Speech Bubble):** Một bong bóng thoại lớn có đuôi nhọn chỉ thẳng vào mặt Sư phụ sẽ "Pop" ra.
- **Nội dung thoại:** *"Sao thế đồ đệ? Rơi mất nét nào rồi à? Đưa xương đây ta làm phép cho!"*
- **Menu lựa chọn:** Nằm gọn ngay bên trong bong bóng thoại, xếp dọc với màu sắc phân cấp rõ ràng:
  - `👀 Nhìn lén 1 nét` (Giá: 1 🦴) - Nút màu Xanh lam nhạt.
  - `🖌️ Xem múa cọ` (Giá: 3 🦴 hoặc 🛟 Miễn phí) - Nút màu Vàng rực lấp lánh (Khuyến khích).
  - `✨ Vượt Ải` (Giá: 5 🦴) - Nút màu Tím/Đỏ Epic (Quyền lực tối thượng).
  - `🏃 Thôi con tự làm (Đóng)` - Nút phụ dạng text mờ ở dưới đáy.

---

## ⚙️ PHẦN 3: NÂNG CẤP LÒ LUYỆN ĐAN (`KanjiCanvas.tsx`)

Thư viện `HanziWriter` mặc định **không có** hàm gọi API `showNextStrokeHint()` ra ngoài khi đang trong chế độ Quiz. Ta cần bổ sung logic theo dõi để ép thư viện vẽ nét đó:

- **Thêm State Nội Bộ:** Theo dõi `currentStrokeNum` (Bắt đầu từ 0, tăng dần lên mỗi khi trigger `onCorrectStroke`).
- **Thêm API `peekNextStroke()` vào Ref:** Gọi hàm `writer.highlightStroke` để nhấp nháy nét tiếp theo mà không làm mất trạng thái Quiz.
- **Thêm API `forceComplete()` vào Ref:** Gọi hàm vẽ toàn bộ chữ và kích hoạt luôn `onComplete`.

---

## 🚀 PHẦN 4: LỘ TRÌNH THỰC HIỆN CỤ THỂ CHO AI

**[x] Bước 1: Nâng cấp Bảng vẽ `KanjiCanvas.tsx`**
  - Khai báo state theo dõi nét. Viết logic hàm `peekNextStroke`.

**[x] Bước 2: Tích hợp Giao diện & Logic vào `KanjiDojoGame.tsx`**
  - Dựng UI Modal "Sư Phụ Shiba" (Ẩn/Hiện bằng State).
  - Kết nối các hàm trừ Xu (`deductCoins`) và gọi API vẽ từ `KanjiCanvas`.
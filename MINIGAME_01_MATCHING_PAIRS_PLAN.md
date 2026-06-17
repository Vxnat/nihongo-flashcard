# 🔗 KẾ HOẠCH TRIỂN KHAI: MINIGAME "NỐI TỪ" (MATCHING PAIRS)

## 1. MỤC TIÊU & GAMEPLAY
- **Trải nghiệm:** Nhẹ nhàng, giải trí, giúp não bộ phản xạ nhanh nối từ tiếng Nhật và nghĩa tiếng Việt.
- **Luồng chơi:** Màn hình hiển thị một lưới các thẻ bài lộn xộn. Một nửa là Tiếng Nhật (Kanji/Kana), một nửa là Tiếng Việt. Người chơi bấm lần lượt 2 thẻ.
- **Kết quả:** Chọn đúng cặp -> Thẻ phát sáng xanh và nổ tung (biến mất). Chọn sai -> Thẻ rung lắc đỏ, úp lại và **trừ 1 Máu (Shiba Heart)**. Thắng ải khi xóa sạch màn hình. Thua khi hết Máu.

## 2. CẤU TRÚC DỮ LIỆU
- Không cần làm file data mới.
- Trích xuất ngẫu nhiên 6-8 thẻ từ `public/data/n5/...` của các bài học trước đó.

## 3. KIẾN TRÚC COMPONENT (`MatchingPairsGame.tsx`)

**Các State cần thiết:**
- `boardItems`: Mảng đã xáo trộn chứa các mảnh ghép. Cấu trúc mỗi mảnh: `{ id: string, flashcardId: string, type: "jp" | "vi", text: string, isMatched: boolean }`.
- `selectedItems`: Mảng chứa tối đa 2 mảnh đang được lật (click).
- `hp`: Số máu hiện tại (VD: 3 hoặc 5).

**Logic xử lý:**
1. Render lưới CSS Grid (`grid-cols-3` hoặc `grid-cols-4`).
2. Khi click Mảnh 1 -> Thêm vào `selectedItems`.
3. Khi click Mảnh 2 -> Thêm vào `selectedItems` -> Chạy hàm kiểm tra:
   - Nếu `item1.flashcardId === item2.flashcardId` VÀ `item1.type !== item2.type`: Đánh dấu `isMatched = true` cho cả 2.
   - Nếu sai: Cho timeout 500ms rồi clear `selectedItems` để úp thẻ lại.
   - Kiểm tra thua cuộc: Nếu `hp === 0`, hiển thị Modal Game Over, cho phép chơi lại.

## 4. TÍCH HỢP ROADMAP
1. Thêm một Nút mới vào `system_decks.json` với `"type": "minigame_matching"`.
2. Cập nhật `SystemRoadmap.tsx` để hiển thị Icon đặc biệt (VD: 🧩).
3. Khi click, mở một Overlay Fullscreen giống Visual Novel chứa component `MatchingPairsGame`.

## 5. UI/UX (ANIMATION)
- **Hệ thống Máu (HP):** Hiển thị ở góc trên màn hình dưới dạng các Icon chú chó Shiba (`<img src="/images/shiba_heart_placeholder.png" alt="HP" />`). Khi mất máu, icon biến thành màu xám (grayscale) hoặc nổ tung.
- Dùng `framer-motion` `layout` prop để các thẻ tự động khép lại gần nhau khi các thẻ xung quanh biến mất.
- Kích nổ pháo bông nhỏ tại tọa độ của thẻ vừa nối đúng.

---

## 6. HỆ THỐNG GỢI Ý & KINH TẾ (DÀNH CHO N4 TRỞ XUỐNG)
**Ngữ cảnh:** 
Thẻ bài ở trình độ N5 sẽ mặc định hiển thị Furigana (cách đọc). Nhưng từ N4 trở xuống, Furigana sẽ bị ẩn để luyện phản xạ Hán tự. Để hỗ trợ người chơi không bị kẹt, game cung cấp 2 công cụ hỗ trợ:

### 6.1. Phao Bơi Toàn Cục (🛟 Lifebuoy)
- **Chức năng:** Hiển thị Furigana và **hiệu ứng Hào quang (Halo)** của TẤT CẢ các thẻ Kanji hiện có trên bàn trong vòng 5 giây.
- **Chi phí:** Tốn 2 Xương (🦴) cho mỗi lần dùng.
- **Lượt Free (Global Cooldown):** Mỗi ngày người chơi được tặng 3 lượt dùng Phao miễn phí cho toàn bộ hệ thống minigame (Cần lưu `freeHintsToday` vào `userStats.dailyQuests` hoặc một state tương tự reset qua ngày trong Zustand).
- **UI/UX:**
  - Nút Phao bơi ở góc dưới. Khi bấm vào, một **Popover xác nhận** nhỏ sẽ hiện ra hỏi `Dùng Phao? (-2🦴)`.
  - Sau khi xác nhận, nút Phao biến thành thanh tiến trình đếm ngược 5 giây và hiệu ứng được kích hoạt.

### 6.2. Kính Lúp Đơn Lẻ (🔍 Magnifier)
- **Chức năng (Hardcore):** Hiển thị Furigana và **hiệu ứng Hào quang (Halo)** cho 1 thẻ bài duy nhất trong **2 giây** rồi tắt hẳn. Thử thách trí nhớ ngắn hạn của người chơi.
- **Chi phí:** Tốn 1 Xương (🦴) cho mỗi lần soi. Không có lượt free.
- **UI/UX:** 
  - Bấm vào nút Kính Lúp -> Kích hoạt "Chế độ Soi" (Nút Kính lúp nhấp nháy/Sáng lên).
  - Lúc này, thao tác click vào một thẻ bài Nhật sẽ hiện **Popover xác nhận** `Xem gợi ý? (-1🦴)`.
  - Nếu đồng ý, hệ thống trừ 1 Xương, thẻ đó sẽ sáng lên và hiện Furigana trong 2 giây rồi tắt. Sau đó, game tự động thoát "Chế độ Soi".
  - Có thể bấm nút Kính Lúp lần nữa để hủy chế độ nếu đổi ý (không trừ Xương).

*💡 Chú ý quản lý State trong Component: Cần có các state `isPhaoActive` (boolean đếm ngược 5s), `isKinhLupActive` (boolean toggle), `revealedCardId` (lưu ID thẻ đang được soi trong 2s), và các state quản lý Popover xác nhận.*

---

## 7. ĐỒNG HỒ ĐẾM NGƯỢC & HỆ THỐNG THƯỞNG
**Mục tiêu:** Tăng tính thử thách và giá trị cho việc sử dụng gợi ý.

### 7.1. Đồng hồ đếm ngược (Countdown Timer)
- **Luồng chơi:** Mỗi màn chơi sẽ có một khoảng thời gian giới hạn để hoàn thành. Nếu hết giờ mà chưa nối hết các cặp, người chơi sẽ thua.
- **Cân bằng độ khó:** Thời gian sẽ linh hoạt theo cấp độ của minigame.
  - **N5:** Thời gian dài, dễ thở (VD: 90 giây).
  - **N4 trở xuống:** Thời gian ngắn hơn, đòi hỏi phản xạ nhanh (VD: 60 giây).
- **UI:** Một thanh tiến trình (Progress Bar) hoặc đồng hồ số sẽ hiển thị ở đầu màn hình, giảm dần theo thời gian.

### 7.2. Thưởng theo thành tích
- **Cơ chế:** Phần thưởng sẽ bao gồm phần thưởng cố định và thưởng thêm dựa trên thời gian hoàn thành.
- **Công thức đề xuất:** `Tổng thưởng = Thưởng cố định (lấy từ rewardCoins trong system_decks.json) + Thưởng thời gian (VD: 1 🦴 cho mỗi 5 giây còn lại)`.
- **Lợi ích:** Vừa đảm bảo phần thưởng cơ bản, vừa khuyến khích người chơi hoàn thành nhanh để tối đa hóa lợi nhuận, tăng tính cạnh tranh và giá trị chơi lại.

---
*💡 Chú ý cho AI khi code: Tránh lỗi người dùng click thẻ thứ 3 khi thẻ 1, 2 đang đợi timeout úp lại. Khóa click trong lúc chờ.*
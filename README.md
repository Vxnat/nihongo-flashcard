# 🗺️ Roadmap Phát Triển Ứng Dụng Flashcard Tiếng Nhật (Next.js 16)

**Mục tiêu:** Xây dựng web app học flashcard ưu tiên trải nghiệm mượt mà, UI tối giản (minimalist) và render dữ liệu trực tiếp từ file JSON nội bộ.

---

## 🛠️ Phase 1: Kiến trúc Dữ liệu & Tiện ích (Foundation)
*Tập trung vào tính chuẩn xác của dữ liệu và các hàm bổ trợ nền tảng.*

- [ ] **Định nghĩa Type/Interface:**
  - Tạo file `src/types/flashcard.ts`.
  - Export các interface `KanjiInfo` và `FlashcardData` bao gồm các trường mở rộng (transitivity, pitch_accent, example_jp_formatted...).
- [ ] **Chuẩn bị Mock Data:**
  - Tạo thư mục `public/data/`.
  - Tạo file `n5_deck_01.json` chứa khoảng 5-10 từ vựng theo đúng chuẩn schema để test.
- [ ] **Viết Helper Parse Furigana:**
  - Tạo file `src/utils/textParser.ts`.
  - Viết hàm chuyển đổi chuỗi định dạng `[Kanji]{furigana}` thành cấu trúc HTML sử dụng thẻ `<ruby>` và `<rt>`.

---

## 🎨 Phase 2: Dựng hình Core UI (Static Components)
*Dựng giao diện tĩnh, đảm bảo tính thẩm mỹ, gọn gàng, clean và không gây xao nhãng.*

- [ ] **Tạo Layout chung:**
  - Cấu hình file `src/app/layout.tsx` với font chữ phù hợp (nên ưu tiên các font hiển thị tiếng Nhật tốt như Noto Sans JP).
  - Setup UI nền tối giản (Zinc/Monochrome).
- [ ] **Dựng Component `FlashcardFront`:**
  - Hiển thị chữ Kanji/Từ vựng chính giữa thẻ với font size lớn.
- [ ] **Dựng Component `FlashcardBack`:**
  - Layout chia lưới (grid) hiển thị: Cách đọc (Romaji + Kana), Ý nghĩa, Âm On/Kun.
  - Hiển thị câu ví dụ có tích hợp Furigana (sử dụng helper ở Phase 1).
- [ ] **Dựng Bảng điều khiển (Control Panel):**
  - Sử dụng Button của shadcn/ui cho các nút: `Prev`, `Flip`, `Next`, `Shuffle`.
  - Thêm Progress Bar để hiển thị % tiến độ học của Deck.

---

## 🌀 Phase 3: Animation & Logic Tương Tác (Interaction)
*Biến các component tĩnh thành trải nghiệm tương tác thực tế.*

- [ ] **Quản lý State của Deck:**
  - Sử dụng `useState` để theo dõi: `currentIndex` (vị trí thẻ hiện tại) và `isFlipped` (trạng thái lật của thẻ).
- [ ] **Hiệu ứng Lật Thẻ (Framer Motion):**
  - Bọc thẻ Flashcard bằng `motion.div`.
  - Viết logic `animate={{ rotateY: isFlipped ? 180 : 0 }}` để tạo hiệu ứng xoay 3D mượt mà.
  - Xử lý việc ẩn/hiện nội dung Front/Back khi xoay (sử dụng CSS `backface-visibility: hidden`).
- [ ] **Hoàn thiện Logic Nút Bấm:**
  - `Next/Prev`: Thay đổi `currentIndex` và tự động reset `isFlipped` về `false`.
  - `Shuffle`: Viết hàm xáo trộn ngẫu nhiên mảng JSON.

---

## 💾 Phase 4: Quản lý Tiến trình (Local Storage)
*Lưu giữ kết quả học tập tại client, không cần Backend.*

- [ ] **Dashboard Chọn Deck (Trang chủ `/`):**
  - Dựng UI danh sách các bộ bài (vd: N5 Vocabulary, N4 Kanji).
  - Bấm vào mỗi Deck sẽ navigate sang route học (vd: `/deck/n4-01`).
- [ ] **Lưu trữ Trạng thái Học:**
  - Phân loại 2 nút khi lật thẻ: **"Đã nhớ" (Know)** và **"Cần ôn lại" (Review)**.
  - Lưu tiến trình này vào `localStorage` (thẻ nào đã nhớ sẽ không lặp lại trong phiên học tiếp theo).
- [ ] **Thuật toán Lặp lại đơn giản:**
  - Các thẻ đánh dấu "Cần ôn lại" sẽ được push lại vào cuối mảng để hiển thị tiếp cho đến khi thuộc.

---

## ✨ Phase 5: Đánh bóng Trải nghiệm (Polishing & Advanced)
*Tối ưu hóa các điểm chạm nhỏ để app mang lại cảm giác cao cấp.*

- [ ] **Phím tắt (Keyboard Shortcuts):**
  - Lắng nghe sự kiện bàn phím: `Space` (Lật thẻ), `Arrow Right` (Next), `Arrow Left` (Prev).
- [ ] **Vuốt trên Mobile (Swipe Gestures):**
  - Tích hợp tính năng vuốt trái/phải trên màn hình cảm ứng (có thể dùng `framer-motion` drag constraints).
- [ ] **Text-to-Speech (TTS):**
  - Tích hợp Web Speech API (hoặc thẻ `<audio>` nếu dùng link mp3 ngoài) để phát âm tiếng Nhật khi ấn vào nút loa hoặc tự động phát khi lật mặt thẻ.
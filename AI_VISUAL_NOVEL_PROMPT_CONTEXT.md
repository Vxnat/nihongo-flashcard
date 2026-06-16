# 📖 KIẾN TRÚC HỆ THỐNG VISUAL NOVEL (ĐỌC HIỂU TƯƠNG TÁC)

**Ngữ cảnh (Context):**
Dự án là ứng dụng học tiếng Nhật phong cách Gamification (Next.js, Tailwind, Zustand, Firebase).
Tính năng "Visual Novel" (VN) cho phép người dùng học Đọc hiểu (Dokkai) và Từ vựng/Ngữ pháp thông qua cốt truyện tương tác đa nhánh. Người dùng có thể click vào các từ vựng mới trong câu thoại để xem nghĩa và lưu vào "Bộ bài của tôi", đồng thời đưa ra lựa chọn để dẫn dắt câu chuyện.

---

## 🧠 PHẦN 1: CẤU TRÚC DỮ LIỆU (DATA SCHEMA)

Cốt truyện được lưu dưới dạng danh sách các **Node** (Nút) trong file JSON nội bộ (VD: `public/data/vn/vn_chapter_01.json`). Nó hoạt động như một Đồ thị có hướng.

```json
{
  "meta": {
    "id": "vn_chapter_01",
    "title": "Chuyến tàu đến Tokyo",
    "level": "N5",
    "rewardCoins": 20
  },
  "characters": {
    "mascot": { "name": "Shiba", "color": "#FF9F1C" },
    "stranger": { "name": "Người lạ", "color": "#5390D9" }
  },
  "nodes": [
    {
      "id": "node_001",
      "characterId": "mascot",
      "emotion": "happy", 
      "background": "/images/bg_train_station.jpg",
      "dialogue": {
        "jp": "おはよう！Hôm nay chúng ta sẽ đi 東京 nhé!",
        "vi": "Chào buổi sáng! Hôm nay chúng ta sẽ đi Tokyo nhé!"
      },
      "interactableWords": [
        {
          "word": "東京",
          "reading": "とうきょう",
          "meaning": "Tokyo",
          "id": "word_tokyo_01"
        }
      ],
      "nextNode": "node_002"
    },
    {
      "id": "node_002",
      "characterId": "stranger",
      "emotion": "idle",
      "background": "/images/bg_train_inside.jpg",
      "dialogue": {
        "jp": "すみません、この電車は東京に行きますか？",
        "vi": "Xin lỗi, chuyến tàu này có đi đến Tokyo không ạ?"
      },
      "interactableWords": [
        { "word": "電車", "reading": "でんしゃ", "meaning": "Tàu điện", "id": "word_train_01" }
      ],
      "choices": [
        {
          "text": "はい、行きます。 (Vâng, có đi ạ)",
          "isCorrect": true,
          "nextNode": "node_003_correct"
        },
        {
          "text": "いいえ、行きません。 (Không, không đi ạ)",
          "isCorrect": false,
          "nextNode": "node_003_wrong"
        }
      ]
    }
  ]
}
```
**Lưu ý:** Nếu Node có `choices`, không dùng `nextNode` ở Node cha nữa, mà phụ thuộc vào `nextNode` trong từng Choice. End story khi `nextNode === "END_STORY"`.

---

## 🧩 PHẦN 2: KIẾN TRÚC COMPONENTS

Vị trí dự kiến: `src/components/VisualNovel/`

1. **`VisualNovelMode.tsx` (Component Mẹ):**
   - Chịu trách nhiệm fetch file JSON cốt truyện.
   - Quản lý state cốt lõi: `currentNodeId`, `history` (để quay lại), `isTyping`.
   - Wrap các components con và cung cấp dữ liệu của `currentNode`.

2. **`VNBackground.tsx`:**
   - Render hình nền. Dùng `AnimatePresence` (framer-motion) để làm hiệu ứng Fade-in/out khi thuộc tính `background` thay đổi giữa các Node.

3. **`VNCharacter.tsx`:**
   - Render ảnh nhân vật (Sprite) dựa trên `characterId` và `emotion`. Có hiệu ứng nhún nhảy nhẹ (bounce) khi bắt đầu thoại.

4. **`VNDialogueBox.tsx`:**
   - Khung chat box phong cách kẹo dẻo ở đáy màn hình.
   - Chứa logic Typewriter (chữ chạy ra từ từ).
   - Chứa hàm quét (Regex) đoạn text hiện tại, so sánh với mảng `interactableWords` để biến chữ thường thành Nút bấm nổi bật.

5. **`VNChoices.tsx`:**
   - Khung chứa các nút bấm rẽ nhánh. Chỉ xuất hiện khi chữ đã chạy xong (`isTyping === false`) và mảng `choices` có dữ liệu.

6. **`VNWordTooltip.tsx` (Pop-up/Modal):**
   - Khi click vào từ vựng nổi bật, hiện pop-up nhỏ hiển thị: Hán tự, Furigana, Nghĩa và nút "Lưu vào Flashcard".

---

## 🚀 PHẦN 3: LỘ TRÌNH TRIỂN KHAI CHO AI (IMPLEMENTATION STEPS)

*(AI đọc phần này và thực hiện theo từng bước, không làm dồn dập)*

### Bước 1: Khởi tạo Helper & Hook (Core Logic)
- Tạo Regex text parser tại `src/utils/vnTextParser.ts`:
  - Input: chuỗi `dialogue.jp` và mảng `interactableWords`.
  - Output: React Node (mảng các chuỗi text thường và các thẻ `<button>` mang thông tin của từ vựng).
- Tạo custom hook `useTypewriter` tại `src/hooks/useTypewriter.ts`:
  - Cần hỗ trợ render từ từ một mảng React Node (chứ không chỉ chuỗi String) để không phá vỡ các thẻ HTML tương tác. Tốc độ gõ: ~30ms/ký tự.

### Bước 2: Dựng Layout Khung cơ bản
- Tạo `VisualNovelMode.tsx`. Load file JSON tĩnh mẫu (được cấp ở Phần 1).
- Khởi tạo State: `currentNode = nodes.find(n => n.id === "node_001")`.
- Dựng `VNBackground` và `VNCharacter` (tạm thời dùng các khối `div` màu hoặc placeholder image nếu chưa có ảnh).

### Bước 3: Hoàn thiện Dialogue Box & Lựa chọn
- Dựng `VNDialogueBox`. Tích hợp helper và hook ở Bước 1 vào đây.
- Logic Click:
  - Nếu người dùng click vào khung chat khi chữ đang chạy -> Force skip (hiện toàn bộ chữ ngay lập tức).
  - Nếu chữ đã chạy xong và click khung chat (không có choices) -> Nhảy sang `nextNode`.
- Dựng `VNChoices`. Nếu `currentNode` có choices, sau khi chữ chạy xong mới render nút với hiệu ứng pop-up (`framer-motion`).

### Bước 4: Chức năng Tooltip Từ vựng & Lưu Deck
- Tạo State `selectedWord` trong component Mẹ.
- Khi click vào 1 từ trong `VNDialogueBox` -> `setSelectedWord(word)`.
- Render `VNWordTooltip.tsx` dưới dạng Bottom Sheet hoặc Absolute Modal.
- Logic Nút "Lưu": Đọc `customDecks` từ Zustand/LocalStorage và push thẻ từ vựng này vào một deck mặc định (VD: "Từ vựng sưu tầm").

### Bước 5: Kết thúc Story & Tích hợp Gamification
- Khi `nextNode === "END_STORY"`, unmount VN UI.
- Hiện màn hình `VNEndScreen.tsx` tung pháo giấy (canvas-confetti).
- Gọi hàm `useAppStore` để cộng `rewardCoins` cho user và cập nhật tiến độ Daily Quest (ví dụ: Quest đọc 1 mẩu truyện).

---

## 🛑 CÁC LƯU Ý KỸ THUẬT QUAN TRỌNG
1. **Hiệu năng:** Không load lại toàn bộ background nếu Node tiếp theo dùng chung ảnh background cũ (chỉ thay đổi text).
2. **UI/UX:** Vẫn giữ nguyên phong cách Gummy/Cute (bo tròn to `rounded-3xl`, viền dày `border-4`, đổ bóng đặc `shadow-[0_8px_0_0_#...]`).
3. **Âm thanh:** Nếu có thiết lập `backgroundMusic` hoặc `sfx` trong file JSON, cần tích hợp HTML5 `<audio>` tự động play/pause.
4. **Responsive:** Text và khung chat phải hiển thị rõ ràng trên mobile, không bị che khuất bởi tai thỏ (safe-area).
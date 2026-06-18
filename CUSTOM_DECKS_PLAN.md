# 🗂️ KẾ HOẠCH TRIỂN KHAI: TỦ SÁCH CÁ NHÂN (CUSTOM DECKS & KANJI PRACTICE)

**Ngữ cảnh:**
Ngoài lộ trình học cố định (System Roadmap) và Minigames, ứng dụng cần một không gian riêng tư (Tab "Custom" / "Bộ bài của tôi"). Tại đây, người dùng có thể tự do tạo bộ thẻ từ vựng cá nhân và đặc biệt là **Luyện viết Kanji** không áp lực (Không tính thời gian, không trừ máu).

---

## 🎯 PHẦN 1: TỔNG QUAN KIẾN TRÚC GIAO DIỆN (UI/UX)

Trang `CustomDecks` (Tủ sách cá nhân) sẽ được chia làm 2 phân hệ chính thông qua một Toggle Switch hoặc Tabs:

### 1. 📇 Tab Flashcard (Thẻ từ vựng)
- Hiển thị danh sách các bộ bài do người dùng tự tạo.
- Hỗ trợ CRUD: Thêm, Sửa, Xóa bộ bài và các thẻ từ bên trong.
- Tính năng: Học lật thẻ truyền thống (như Quizlet).
- Nguồn dữ liệu: Tự nhập tay hoặc lưu từ Visual Novel / Minigame về.

### 2. 🖌️ Tab Luyện Viết (Kanji Practice)
- Hiển thị danh sách các bộ chữ Kanji cần luyện.
- **Hệ thống cung cấp sẵn:** Các bộ thủ cơ bản (214 Bộ thủ), Kanji theo cấp độ N5, N4...
- **Người dùng tự tạo:** Tự nhập một chuỗi các chữ Hán muốn luyện (VD: `["水", "火", "木", "金", "土"]`).
- Tính năng: Mở "Lò luyện đan" (`KanjiCanvas`) ở chế độ Free Practice (Luyện tập tự do).

---

## 🧠 PHẦN 2: CẤU TRÚC DỮ LIỆU (ZUSTAND STATE)

Mở rộng mảng `customDecks` trong Zustand store để phân biệt được đâu là bộ bài lật thẻ, đâu là bộ bài luyện viết.

```typescript
interface CustomDeck {
  id: string;
  title: string;
  type: "flashcard" | "kanji"; // Phân loại bộ bài
  createdAt: number;
  
  // Dành cho type === "flashcard"
  cards?: FlashcardData[]; 
  
  // Dành cho type === "kanji"
  kanjiList?: string[]; // Mảng chứa trực tiếp các ký tự Kanji
}
```

*Lưu ý:* Dữ liệu bộ thủ mồi sẵn (Pre-seeded Data) có thể lưu tĩnh trong một file `src/constants/radicals.ts`.

---

## 🧩 PHẦN 3: TÁI SỬ DỤNG COMPONENT "KANJI CANVAS"

Thiết kế `KanjiCanvas.tsx` (được xây dựng ở phase Minigame Kanji Dojo) thành một **Dumb Component** (chỉ nhận Props chữ Hán và truyền ra Event, không chứa Logic Game).

- **Ở Minigame (`KanjiDojoGame.tsx`):**
  - Bắt sự kiện `onMistake` -> Trừ 1 Máu (HP). Thêm áp lực thời gian.

- **Ở Tủ sách cá nhân (`KanjiPractice.tsx`):**
  - Không hiện thanh máu, không có đồng hồ đếm ngược.
  - Viết sai bao nhiêu lần cũng được, chữ mờ vẫn nằm đó cho người dùng đồ lại.
  - Có các nút điều khiển thân thiện: `[< Chữ trước]` | `[Làm lại chữ này]` | `[Chữ tiếp >]`.

---

*Tài liệu này sẽ được dùng làm bản lề khi hoàn thành xong tính năng Kanji Dojo Minigame và bắt đầu đắp thêm UI ở trang Custom.*
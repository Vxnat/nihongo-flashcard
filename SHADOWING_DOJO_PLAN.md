# 🎤 KẾ HOẠCH TRIỂN KHAI "SHADOWING DOJO" (LUYỆN PHÁT ÂM & BOSS FIGHT)

**Ngữ cảnh:**
Mở rộng hệ thống Gamification với tính năng luyện phát âm (Shadowing) bằng Web Speech API (Speech-to-Text). Đặc biệt, áp dụng tính năng này vào các ải Boss Fight để tạo trải nghiệm "Đọc thần chú tấn công Boss" thay vì gõ phím.

---

## 🧠 PHẦN 1: CÔNG NGHỆ LÕI & HELPERS (CORE LOGIC)

### 1. Custom Hook: `useSpeechRecognition`
- **Vị trí:** `src/hooks/useSpeechRecognition.ts`
- **Mục đích:** Giao tiếp với Web Speech API (`window.SpeechRecognition` hoặc `window.webkitSpeechRecognition`).
- **State quản lý:**
  - `isListening` (boolean): Đang thu âm hay không.
  - `transcript` (string): Văn bản nhận diện được.
  - `error` (string | null): Thông báo lỗi (từ chối mic, không nhận diện được...).
- **Hàm trả về:** `startListening`, `stopListening`, `resetTranscript`.
- **Cấu hình quan trọng:** 
  - `recognition.lang = 'ja-JP'` (Bắt buộc để nhận diện tiếng Nhật).
  - `recognition.interimResults = false` (Chỉ lấy kết quả cuối cùng cho chính xác).

### 2. Helper Chấm Điểm: `calculateSimilarity`
- **Vị trí:** `src/utils/stringUtils.ts`
- **Mục đích:** So sánh chuỗi người dùng đọc (`transcript`) với câu mẫu gốc.
- **Thuật toán đề xuất:** Khoảng cách Levenshtein (Levenshtein Distance).
- **Logic:** 
  - Cần loại bỏ dấu câu (chấm, phẩy, hỏi chấm) và khoảng trắng trước khi so sánh.
  - Tính toán số bước biến đổi chuỗi A thành chuỗi B -> Trả về tỷ lệ phần trăm (0 - 100%).
  - Cài đặt thư viện: `npm install fast-levenshtein` hoặc tự viết hàm thuần.

---

## 📂 PHẦN 2: CẤU TRÚC DỮ LIỆU (DATA SCHEMA)

### 1. File dữ liệu Shadowing
- **Vị trí:** `public/data/shadowing/sh_n5_01.json` (Ví dụ)
- **Cấu trúc:**
  ```json
  {
    "meta": { "id": "sh_n5_01", "title": "Luyện âm N5 - Bài 1" },
    "sentences": [
      {
        "id": "s_01",
        "text_jp": "これはペンです。",
        "text_vi": "Đây là cây bút.",
        "audio_url": "/audio/shadowing/kore_wa_pen_desu.mp3"
      }
    ]
  }
  ```

### 2. Tích hợp vào Lộ trình (`system_decks.json`)
- Thêm Node với `type: "shadowing"` để hiển thị trên bản đồ (icon Micro).
- Thêm Node với `type: "boss_voice"` (hoặc kết hợp vào type "boss" hiện tại).

---

## 🎨 PHẦN 3: KIẾN TRÚC UI COMPONENTS

### 1. `MicrophoneButton.tsx`
- Nút bấm trung tâm cho mọi tương tác giọng nói.
- **Trạng thái UI (Dùng framer-motion):**
  - *Idle:* Nút xám/xanh bình thường.
  - *Listening:* Nút đỏ, có vòng tròn (ring) nhấp nháy tỏa ra xung quanh báo hiệu đang thu âm.
  - *Processing:* Icon xoay (spinner) chờ API phân tích.

### 2. `ShadowingChallenge.tsx` (Màn chơi luyện âm thường)
- Hiển thị thẻ chứa: `text_jp` (chữ lớn), `text_vi` (nghĩa).
- Nút loa (🔊) để phát `audio_url`.
- Khu vực chứa `MicrophoneButton`.
- **Hệ thống Mạng (HP):** Có 3 Mạng hiển thị bằng hình bé Shiba (`<img src="/images/shiba_heart_placeholder.png" />`). 
- **Luồng:** Nghe mẫu -> Bấm giữ/Click Mic -> Đọc -> Chấm điểm -> Hiện popup `PronunciationResultModal` (Perfect/Great/Miss). Nếu Miss (<80%) trừ 1 Mạng Shiba. Hết 3 mạng -> Game Over. Qua ải -> Cộng xu.

### 3. `PronunciationResultModal.tsx`
- Pop-up hiện kết quả chấm điểm.
- Hiển thị: % chính xác, Câu gốc, Câu bạn đọc (Highlight màu đỏ các từ sai nếu có thể làm advanced).
- Hiệu ứng `canvas-confetti` nếu Perfect.

---

## 🐉 PHẦN 4: BOSS FIGHT BẰNG GIỌNG NÓI ("HÉT VÀO MẶT BOSS")

Thay vì sử dụng input gõ phím (`Typing Boss`), nâng cấp component `BossFight.tsx` hiện tại.

### 1. Giao diện (UI)
- Vẫn giữ thanh máu Boss, Avatar Boss (có animation nhún nhảy/thở).
- **Khu vực vũ khí:** Thay ô nhập text bằng `MicrophoneButton` siêu to khổng lồ.
- **Câu thần chú:** Hiển thị rõ ràng câu tiếng Nhật cần đọc. Kèm thanh tiến trình (thời gian đếm ngược để tung chiêu).

### 2. Gameplay Logic
- Boss chuẩn bị tấn công (hiện thanh đếm ngược 10s).
- User phải bấm Mic và đọc đúng câu thần chú.
- Khi có `transcript`:
  - Tính `similarity = calculateSimilarity(transcript, spell)`.
  - **Nếu > 80%:** 
    - Gửi event Tấn Công.
    - Kích hoạt animation chớp sáng, chém/bắn chưởng vào Boss (`framer-motion` x/y translation).
    - Trừ máu Boss. Đổi câu thần chú mới.
  - **Nếu < 80%:** 
    - Báo "Miss!" (Trượt). Boss hiện icon cười nhạo. User mất thời gian đọc lại.
  - **Nếu Hết giờ:** Boss tấn công, User trừ máu/mất lượt.

---

## 🚀 PHẦN 5: LỘ TRÌNH CODE CHO AI (CÁC BƯỚC THỰC HIỆN)

Khi bắt đầu code tính năng này, hãy tuân thủ đúng thứ tự sau:

**[ ] Bước 1: Core Speech & Logic**
  - Tạo `useSpeechRecognition.ts`. Xử lý cấp quyền mic cẩn thận.
  - Tạo `stringUtils.ts` chứa hàm chấm điểm chuỗi (Levenshtein).

**[ ] Bước 2: Dựng Nút Micro (`MicrophoneButton.tsx`)**
  - Dựng UI tĩnh, test thử việc bấm bắt đầu/kết thúc nhận diện giọng nói và in ra `console.log`.

**[ ] Bước 3: Dựng màn Luyện Âm Thường (`ShadowingChallenge.tsx`)**
  - Tạo component, map dữ liệu câu mẫu vào.
  - Kết hợp `MicrophoneButton` và UI chấm điểm (Modal + Pháo hoa).

**[ ] Bước 4: Tích hợp vào Boss Fight**
  - Copy component Boss Fight hiện có thành `VoiceBossFight.tsx` (hoặc nâng cấp nó thông qua props `mode="typing" | "voice"`).
  - Thay thế input bằng logic Speech-to-Text. Kết nối animation trừ máu.

**[ ] Bước 5: Cập nhật Lộ trình (Roadmap)**
  - Khai báo các màn Shadowing và Boss bằng Giọng nói vào `system_decks.json` để người dùng có thể chơi.

---
*Tài liệu này được tối ưu cho AI Assistant đọc hiểu và triển khai dần từng bước mà không làm vỡ cấu trúc project.*
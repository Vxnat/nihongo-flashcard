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
- **Thuật toán tối ưu hóa cho Tiếng Nhật**: Chuyển đổi cả hai chuỗi về dạng Romaji không dấu để tránh lỗi Kanji/Kana bất đồng nhất, sau đó dùng khoảng cách Levenshtein (Levenshtein Distance).
- **Thư viện cài đặt**: `npm install wanakana fast-levenshtein` và `npm install --save-dev @types/fast-levenshtein` (nếu dùng TypeScript).
- **Logic thực hiện**: 
  - Bước 1: Sử dụng `wanakana.toRomaji(text)` để chuyển cả câu mẫu gốc và chuỗi nhận diện `transcript` sang Romaji.
  - Bước 2: Loại bỏ tất cả dấu câu (chấm, phẩy, hỏi chấm, ngoặc kép...) và khoảng trắng trên chuỗi Romaji mới.
  - Bước 3: Tính toán khoảng cách Levenshtein giữa 2 chuỗi Romaji đã làm sạch.
  - Bước 4: Quy đổi ra tỷ lệ phần trăm khớp: `Similarity = (1 - distance / Math.max(lenA, lenB)) * 100`.

---

## 📂 PHẦN 2: CẤU TRÚC DỮ LIỆU (DATA SCHEMA)

### 1. File dữ liệu Shadowing
- **Vị trí:** `public/data/shadowing/sh_n5_01.json` (Ví dụ)
- **Cấu trúc (Bổ sung trường text_romaji để so khớp):**
  ```json
  {
    "meta": { "id": "sh_n5_01", "title": "Luyện âm N5 - Bài 1" },
    "sentences": [
      {
        "id": "s_01",
        "text_jp": "これはペンです。",
        "text_kana": "これはぺんです。",
        "text_romaji": "kore wa pen desu",
        "text_vi": "Đây là cây bút.",
        "audio_url": "/audio/shadowing/kore_wa_pen_desu.mp3"
      }
    ]
  }
  ```

### 2. Tích hợp vào Lộ trình (`system_decks.json`)

Chúng ta sẽ định nghĩa hai loại nút (Node) mới trên bản đồ hành trình:

#### A. Node Luyện âm thường (`minigame_shadowing`):
```json
{
  "id": "mg_shadowing_n5_01",
  "type": "minigame_shadowing",
  "title": "Luyện Phát Âm: Chào Hỏi",
  "description": "Bật micro và đọc to câu tiếng Nhật cùng Shiba!",
  "level": "N5",
  "chapter": 1,
  "order": 2.8,
  "prerequisite": "sys_n5_minna_02",
  "rewards": {
    "coins": 20,
    "exp": 50
  },
  "totalCards": 0,
  "shadowingDataPath": "/data/shadowing/sh_n5_01.json"
}
```

#### B. Node Đánh Boss Giọng Nói (`boss_voice`):
```json
{
  "id": "sys_n5_boss_voice_01",
  "type": "boss_voice",
  "title": "[Ải Giọng Nói]: Hộ Vệ Tengu",
  "description": "Đọc to thần chú tiếng Nhật chuẩn xác để phá giáp Tengu!",
  "level": "N5",
  "chapter": 1,
  "order": 5.58,
  "prerequisite": "sys_n5_boss_rpg_01",
  "rewards": {
    "coins": 150,
    "exp": 120
  },
  "totalCards": 0,
  "targetDeckIds": [
    "sys_n5_minna_01",
    "sys_n5_minna_02",
    "sys_n5_minna_03"
  ]
}
```

---

## 🎨 PHẦN 3: KIẾN TRÚC UI COMPONENTS (PHONG CÁCH GLASSMORPHISM & PASTEL GRADIENTS)

Toàn bộ phân hệ sẽ được thiết kế theo trường phái **Bóng kính (Glassmorphism)** kết hợp ánh sáng **Pastel Gradient** chuyển động huyền ảo để mang lại vẻ ngoài cao cấp và thu hút.

### 🌟 Hệ thống CSS Utility đề xuất:
- **Lớp kính nền (Glass container)**: `bg-white/20 backdrop-blur-lg border border-white/40 shadow-[0_8px_32px_0_rgba(255,182,193,0.15)]`
- **Pastel Gradient Aurora (Dành cho nền)**: `bg-gradient-to-tr from-[#E8D7FF]/30 to-[#C4D9FF]/30`
- **Pastel Gradient Success (Perfect)**: `bg-gradient-to-tr from-[#BFFCC6] to-[#DBFFD6]`
- **Pastel Gradient Warning (Good/Great)**: `bg-gradient-to-tr from-[#FFB7B2] to-[#FFDAC1]`

---

### 1. Nút Micro Pha Lê (`MicrophoneButton.tsx`)
Nút tròn được thiết kế như một viên ngọc pha lê 3D bóng bẩy.
*   **Trạng thái UI (Dùng framer-motion):**
    *   *Mặt kính phản chiếu*: Sử dụng phần tử giả (`before:absolute before:inset-x-2 before:top-1 before:h-4 before:bg-gradient-to-b before:from-white/40 before:to-transparent before:rounded-full`) tạo vệt sáng cong của thủy tinh.
    *   *Idle (Chờ)*: Chứa gradient tĩnh hồng-tím oải hương nhạt (`from-[#FFA6C9]/40 to-[#C4D9FF]/40`).
    *   *Listening (Thu âm)*: Gradient bên trong rực sáng và chạy hoạt ảnh xoay nhẹ (`from-[#FF85A1] via-[#FFCCD5] to-[#B5FFFC]`). Đồng thời xuất hiện các vòng tròn lan tỏa dạng **vòng thủy tinh mờ** (`border border-white/20 backdrop-blur-xs`) nở to dần và tan biến bằng `framer-motion`.
    *   *Processing (Xử lý)*: Kích hoạt hiệu ứng quét sáng (Shimmer) chạy lướt ngang qua mặt kính.

### 2. Thẻ Luyện Âm Thủy Tinh (`ShadowingChallenge.tsx`)
*   **Aesthetic**:
    *   Khung hộp bento bằng kính mờ: `bg-white/25 backdrop-blur-md border border-white/30 rounded-[2.5rem] p-6 shadow-lg`.
    *   Chữ Kanji lớn màu xám mực đậm tương phản (`text-[#1E293B]`) kết hợp Furigana nhỏ phía trên.
    *   **Thanh Sóng Âm (Sound Wave)**: 5-7 vạch sóng âm đứng bằng kính màu pastel phát sáng nhấp nhô ngẫu nhiên biểu thị giọng nói đang được ghi nhận.
    *   **Hệ thống Mạng (HP)**: 3 chiếc bong bóng hình đầu Shiba thủy tinh màu hồng phấn. Khi mất mạng, bong bóng sẽ lắc lư mạnh, phình to ra và "bể" thành các đốm hạt nhỏ li ti rồi mờ dần về `opacity: 0`.
*   **Luồng hoạt động**: Nghe mẫu -> Giữ/Bấm nút Micro Pha Lê -> Đọc -> Chấm điểm bằng Romaji -> Hiện modal kết quả.

### 3. Hộp Thoại Kết Quả Kính Mờ (`PronunciationResultModal.tsx`)
Khi hiển thị, toàn bộ màn hình phía sau sẽ bị làm mờ sâu (`backdrop-blur-2xl`).
*   **Giao diện**:
    *   Hộp thoại kính mờ lớn, bo góc tròn 30px.
    *   Phía sau hộp thoại tỏa ra một vầng hào quang (Glow) mềm màu pastel tùy theo kết quả:
        *   *Perfect (90-100%)*: Hào quang xanh ngọc rực rỡ + Pháo hoa giấy cầu vồng rơi đầy màn hình.
        *   *Great/Good (70-89%)*: Hào quang vàng cam ấm áp.
        *   *Miss (<70%)*: Hào quang xanh băng tuyết (Ice Blue) buồn nhẹ nhưng không gây căng thẳng.
    *   **Highlight Từ Vựng**:
        *   Những từ phát âm đúng được bọc trong các **viên nang thủy tinh xanh lá** (`bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 rounded-full px-2.5 py-0.5`).
        *   Những từ phát âm sai hoặc bị sót được bọc trong các **viên nang thủy tinh đỏ/hồng** (`bg-rose-500/10 border border-rose-500/25 text-rose-500 rounded-full px-2.5 py-0.5`).

---

## 🐉 PHẦN 4: BOSS FIGHT BẰNG GIỌNG NÓI (PHÁP TRẬN BÓNG KÍNH)

Chuyển đổi giao diện Đánh Boss bằng Giọng Nói thành một trận chiến ma pháp giả tưởng.

### 1. Giao diện Đấu Trường
*   Phông nền đền cổ ban đêm nhuốm màu tím Indigo huyền bí (`bg-indigo-950/90`) với các chấm đom đóm phát sáng bay lơ lửng.
*   **Thanh máu của Boss**: Được thiết kế là một **ống nghiệm thủy tinh nằm ngang** chứa chất lỏng ma thuật màu hồng đỏ gradient chuyển động gợn sóng (sử dụng SVG wave). Khi mất máu, chất lỏng sẽ tụt dần kèm bọt khí sủi lên.
*   **Vòng Tròn Pháp Trận (Incantation Circle)**: 2 vòng tròn hoa văn cổ trang Nhật Bản mảnh phát sáng vàng neon xoay ngược chiều nhau đằng sau nút Micro Pha Lê, tự động khép kín vòng tròn viền (stroke-dashoffset) biểu thị thời gian thu âm.

### 2. Logic Gameplay
*   Boss chuẩn bị chiêu thức (hiện đếm ngược 10s tại thanh thời gian kính mờ).
*   Người chơi nhấn Micro và đọc to câu thần chú hiển thị trên màn hình cuộn thư pháp.
*   **Kết quả**:
    *   *Đọc đúng*: Một dòng chữ Kanji neon sáng rực bay vút từ Micro người chơi đập thẳng vào Boss, trừ HP Boss kèm rung lắc màn hình.
    *   *Đọc sai/Hết giờ*: Pháp trận vỡ vụn, Boss tung chém chớp sáng đỏ vào Shiba khiến Shiba bị trừ máu/giáp.

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
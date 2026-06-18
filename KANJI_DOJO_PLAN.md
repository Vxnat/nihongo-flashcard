# 🖌️ KẾ HOẠCH TRIỂN KHAI: ĐẠO ĐƯỜNG HÁN TỰ (KANJI DOJO)

**Ngữ cảnh:**
Mở rộng hệ thống Minigame học tiếng Nhật bằng chế độ "Đạo đường Hán tự". Người dùng sẽ luyện viết chữ Kanji bằng cách vuốt/vẽ trực tiếp trên màn hình, ứng dụng công nghệ thẻ `<canvas>` và thư viện `HanziWriter` để chấm điểm thứ tự nét (Stroke Order) và tạo hiệu ứng mực nước chân thực.

---

## 🎯 PHẦN 1: TÌM KIẾM & XÂY DỰNG DỮ LIỆU LÕI (DATA FOUNDATION)

### 1. Thư viện cốt lõi
- Sử dụng **Hanzi Writer** (hỗ trợ Kanji tiếng Nhật qua dataset KanjiVG).
- Thư viện này hỗ trợ vẽ nét mờ, nhận diện thao tác vuốt, chấm điểm thứ tự nét, tạo hiệu ứng bút lông và **chạy hoạt ảnh (animate) thứ tự từng nét**.

### 2. Cấu trúc dữ liệu (`system_decks.json`)
- Thêm loại bài học mới: `"type": "minigame_kanji"`.
- Dữ liệu minigame sẽ chứa mảng các object Kanji cần luyện viết (bao gồm chữ và nghĩa tiếng Việt) trong cửa ải đó.
  ```json
  {
    "id": "sys_n5_kanji_01",
    "title": "Luyện viết Kanji Cơ bản 1",
    "type": "minigame_kanji",
    "rewardCoins": 15,
    "kanjiList": [
      { "char": "一", "meaning": "Số một" },
      { "char": "二", "meaning": "Số hai" }
    ]
  }
  ```

---

## ⚙️ PHẦN 2: THIẾT KẾ CORE COMPONENTS (LOGIC & UI)

### 1. `KanjiCanvas.tsx` (Lò luyện đan / Bảng vẽ)
- Chứa thẻ `<div id="kanji-target">` để mount `HanziWriter`.
- Nhận `props`: 
  - `character`: chữ Kanji hiện tại.
  - `onCorrectStroke`: callback khi viết đúng 1 nét.
  - `onMistake`: callback khi viết sai nét/sai thứ tự.
  - `onComplete`: callback khi viết xong cả chữ.

### 2. `KanjiDojoGame.tsx` (Giao diện chính của Game)
- **Khu vực trên:** Thanh Máu (Shiba Hearts) và Thanh tiến trình hoàn thành ải.
- **Khu vực giữa:** Bảng vẽ `KanjiCanvas` to, thiết kế giống một cuộn giấy cuộn hoặc bảng gỗ.
- **Khu vực dưới:** Nghĩa tiếng Việt và Âm đọc (Romaji/Kana) của chữ đang viết để hỗ trợ ghi nhớ.

---

## 🕹️ PHẦN 3: LUỒNG GAMEPLAY & CHẤM ĐIỂM (GAME LOOP)

- **Vào ải:** Bảng vẽ hiện lên. Chữ Kanji mục tiêu mờ ảo xuất hiện.
- **Tương tác:** 
  - **Đúng:** Nét mực đen (hiệu ứng bút lông) hiện ra. Phóng ra các hạt particle nhỏ.
  - **Sai:** Viết chệch/sai thứ tự -> Chữ rung lắc, trừ 1 Máu (HP).
- **Hoàn thành chữ:** Kanji sáng lên (Glow), phát âm thanh đọc chữ, rồi chuyển sang chữ tiếp theo.
- **Game Over / Win:** Hết máu -> Lose. Viết hết danh sách chữ -> Win -> Hiện Modal kết quả.

---

## 🎨 PHẦN 4: HIỆU ỨNG THỊ GIÁC & ÂM THANH (VFX & SFX)

- **VFX Mực nước (Ink Splatter):** Khi viết xong 1 nét hoàn hảo, kích hoạt hiệu ứng `canvas-confetti` (custom bằng hình ảnh giọt mực đen/vàng văng ra). Animation ấn triện khi xong chữ.
- **SFX Âm thanh:** Tiếng cọ quét trên giấy (Brush stroke sound) và tiếng chuông/chiêng nhẹ khi hoàn thành chữ.

---

## 🚀 PHẦN 5: LỘ TRÌNH CODE CHO AI (CÁC BƯỚC THỰC HIỆN)

**[x] Bước 1: Setup & Cài đặt thư viện**
  - Chạy `npm install hanzi-writer`.
  - Bổ sung data mẫu vào `system_decks.json`.

**[x] Bước 2: Dựng component `KanjiCanvas.tsx`**
  - Tạo component wrapper cho `HanziWriter`, xử lý các lifecycle mount/unmount của thư viện an toàn trong Next.js (chỉ chạy ở Client).

**[x] Bước 3: Dựng giao diện `KanjiDojoGame.tsx`**
  - Tích hợp `KanjiCanvas` vào giữa.
  - Quản lý state Máu (HP), Chữ Kanji hiện tại, Lỗi viết sai.

**[x] Bước 4: Tích hợp vào Lộ trình (Roadmap)**
  - Mở Overlay hoặc Modal khi bấm vào các node `"minigame_kanji"` trên `SystemRoadmap`.

**[x] Bước 5: Thêm hiệu ứng, SFX và Polish**
  - Tích hợp âm thanh quét cọ, pháo hoa giọt mực, và xử lý cộng thưởng/nhiệm vụ.
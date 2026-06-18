# ⌨️ KẾ HOẠCH TRIỂN KHAI CHI TIẾT: MINIGAME "TYPING RUSH"

**Ngữ cảnh:**
Tài liệu này mô tả chi tiết các bước kỹ thuật để xây dựng minigame "Typing Rush" (Băng chuyền). Trọng tâm là xây dựng một "Game Engine" nhỏ gọn, hiệu năng cao bằng `requestAnimationFrame` để đảm bảo trải nghiệm mượt mà, không giật lag, ngay cả khi có nhiều đối tượng di chuyển trên màn hình.

---

## 🎯 PHẦN 1: MỤC TIÊU & GAMEPLAY

- **Trải nghiệm:** Tốc độ cao, dồn dập, thử thách khả năng gõ phím nhanh và chính xác của người chơi.
- **Luồng chơi:**
  1. Các từ vựng (Kẻ địch) dưới dạng chữ Hán/Kana sẽ liên tục được "thả" từ cạnh trên màn hình và rơi xuống.
  2. Người chơi phải gõ chính xác cách đọc Romaji của từ đó.
  3. Gõ đúng, một bé Shiba sẽ hiện ra gõ búa "BONK" vào đầu Kẻ địch, khiến nó vỡ vụn thành bụi và cộng điểm.
  4. Nếu một Kẻ địch chạm "Rãnh dung nham dâu" (Màu hồng pastel) ở đáy màn hình, người chơi sẽ mất 1 Mạng (HP).
  5. Hết Mạng, trò chơi kết thúc (Game Over). Sống sót qua một khoảng thời gian hoặc đạt đủ điểm sẽ chiến thắng.

---

## 🧠 PHẦN 2: KIẾN TRÚC LÕI (CORE ARCHITECTURE - THE GAME ENGINE)

Để tránh việc re-render toàn bộ component 60 lần/giây gây sụt giảm hiệu năng, chúng ta sẽ tách biệt logic game và logic render.

### 2.1. Custom Hook: `useTypingRushEngine`
- **Vị trí:** `src/hooks/useTypingRushEngine.ts`
- **Mục đích:** Đóng gói toàn bộ logic của vòng lặp game, quản lý trạng thái của các đối tượng trong game.
- **State & Ref:**
  - `enemies (useRef)`: Mảng chứa các object Kẻ địch đang hoạt động. Mỗi object có dạng `{ id, card, x, y, speed }`. Dùng `useRef` để cập nhật tọa độ mà không gây re-render.
  - `gameState (useState)`: Trạng thái của game (`'playing'`, `'paused'`, `'gameOver'`). Dùng `useState` vì sự thay đổi này cần cập nhật UI (hiện menu, màn hình kết thúc...).
  - `score (useState)`, `hp (useState)`: Điểm số và Mạng.
  - `userInput (useState)`: Chuỗi người dùng đang gõ.
- **Vòng lặp Game (`gameLoop`):**
  - Sử dụng `requestAnimationFrame` để tạo một vòng lặp mượt mà, đồng bộ với tần số quét của màn hình.
  - **Tính toán Delta Time:** Đo lường thời gian chênh lệch giữa 2 khung hình để đảm bảo tốc độ rơi của Kẻ địch nhất quán trên mọi thiết bị (máy yếu, máy mạnh).
  - **Cập nhật Vị trí:** Trong mỗi frame, duyệt qua mảng `enemies.current` và cập nhật tọa độ `y` của từng Kẻ địch (`enemy.y += enemy.speed * deltaTime`).
  - **Kiểm tra Va chạm Đáy:** Nếu `enemy.y` vượt quá chiều cao màn hình, kích hoạt callback `onEnemyEscape`, xóa Kẻ địch khỏi mảng.
- **Bộ sinh Kẻ địch (Spawner):**
  - Dùng một bộ đếm thời gian bên trong `gameLoop`. Khi đủ thời gian (ví dụ: mỗi 2 giây), một Kẻ địch mới sẽ được tạo với tọa độ `x` ngẫu nhiên và thêm vào mảng `enemies.current`.

---

## 🎨 PHẦN 3: GIAO DIỆN VÀ TƯƠNG TÁC (UI & INTERACTION)

### 3.1. Component Chính: `TypingRushGame.tsx`
- Sử dụng hook `useTypingRushEngine` để lấy dữ liệu và các hàm điều khiển.
- Lắng nghe sự kiện bàn phím (`useEffect` với `window.addEventListener('keydown', ...)`).
- Khi người dùng gõ phím:
  - Cập nhật `userInput` state.
  - Kiểm tra xem `userInput` có khớp với `card.romaji` của Kẻ địch nào không.
  - Nếu khớp hoàn toàn:
    1. Gọi hàm `destroyEnemy(enemyId)` từ engine.
    2. Kích hoạt hoạt ảnh "Shiba Bonk" tại tọa độ Kẻ địch, kèm hiệu ứng nổ thành hạt bụi nhỏ (dust particles).
    3. Reset `userInput` về rỗng.
    4. Cộng điểm.
- Xử lý các callback từ engine:
  - `onEnemyEscape`: Trừ 1 HP, rung màn hình (Kẻ địch chìm vào dung nham).

### 3.2. Component Kẻ địch: `EnemyWord.tsx`
- Là một **Dumb Component**, chỉ nhận props `{ text, romaji, x, y }`.
- Sử dụng `React.memo` để tối ưu, chỉ re-render khi props thực sự thay đổi.
- Dùng `position: 'absolute'` và `transform: translate(x, y)` để CSS đặt vị trí. `transform` sẽ được GPU xử lý, giúp animation mượt hơn nhiều so với thay đổi `top` và `left`.

### 3.3. Các thành phần UI khác
- **Thanh Máu (HP Bar):** Một dãy các icon `<img src="/images/shiba_heart_placeholder.png" />`. Khi mất máu, một icon sẽ chuyển sang màu xám hoặc có hiệu ứng vỡ.
- **Hiển thị Input:** Một ô text ở dưới đáy màn hình, hiển thị chuỗi `userInput` mà người chơi đang gõ.
- **Bối cảnh:** Một ảnh nền bầu trời sao lofi. Dưới đáy là dải "dung nham" màu hồng pastel (strawberry lava) có animation sủi bọt êm ái.

---

## 🚀 PHẦN 4: LỘ TRÌNH TRIỂN KHAI CỤ THỂ

**Bước 1: Xây dựng "Động cơ" (`useTypingRushEngine.ts`)**
  - Khởi tạo hook, định nghĩa các state và ref.
  - Viết logic cho `gameLoop` bằng `requestAnimationFrame`.
  - Implement chức năng cho Kẻ địch rơi xuống (cập nhật tọa độ `y`).
  - Implement bộ sinh Kẻ địch (Spawner) theo thời gian.

**Bước 2: Dựng Giao diện và Render Kẻ địch**
  - Tạo component `TypingRushGame.tsx` và `EnemyWord.tsx`.
  - Trong `TypingRushGame`, gọi `useTypingRushEngine` và render một danh sách các `EnemyWord` dựa trên dữ liệu từ `enemies.current`.
  - Tại bước này, chúng ta chỉ cần thấy các từ rơi xuống màn hình một cách mượt mà.

**Bước 3: Tích hợp Logic Gõ phím & Tiêu diệt (Bonk)**
  - Trong `TypingRushGame`, thêm `useEffect` để bắt sự kiện `keydown`.
  - Viết logic so sánh `userInput` với `romaji` của Kẻ địch.
  - Gọi hàm `destroyEnemy`, xuất hiện hoạt ảnh Shiba gõ búa "Bonk" và hiệu ứng bụi pháo hoa.

**Bước 4: Hoàn thiện Hệ thống Game (Máu, Điểm, Thắng/Thua)**
  - Kết nối logic va chạm đáy màn hình với việc trừ HP.
  - Hiển thị điểm số và thanh máu.
  - Khi HP về 0, thay đổi `gameState` thành `'gameOver'` và hiển thị màn hình kết thúc.

**Bước 5: Tích hợp vào Lộ trình và Đánh bóng**
  - Thêm một mục có `"type": "minigame_rush"` vào file `system_decks.json`.
  - Cập nhật `SystemRoadmap.tsx` để render Node cho minigame này.
  - Thêm hiệu ứng âm thanh, nhạc nền và các hiệu ứng hình ảnh nhỏ khác để tăng tính hấp dẫn.

---
*Tài liệu này sẽ là kim chỉ nam để AI triển khai tính năng một cách bài bản, ưu tiên hiệu năng và cấu trúc code rõ ràng.*
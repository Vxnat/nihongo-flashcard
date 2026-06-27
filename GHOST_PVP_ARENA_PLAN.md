# ⚔️ KẾ HOẠCH TRIỂN KHAI: ĐẤU TRƯỜNG SHIBA (GHOST PvP ARENA)

Tài liệu này chi tiết hóa cách thức xây dựng chế độ **Đấu trường thi gõ/nghe từ vựng đối kháng** sử dụng giải pháp **Ghost PvP (chơi với bóng)**, giúp tối giản hóa hạ tầng máy chủ (không cần WebSocket phức tạp) nhưng vẫn mang lại trải nghiệm thi đấu hồi hộp, chân thực.

---

## 📐 PHẦN 1: CƠ CHẾ GHOST PvP (CHƠI VỚI BÓNG)

Thay vì kết nối trực tiếp hai người chơi cùng một lúc, hệ thống hoạt động dựa trên cơ chế:
1.  Khi người chơi hoàn thành một màn đấu từ vựng ở Đấu trường, toàn bộ tiến trình của họ sẽ được ghi lại thành một **Lịch sử lượt chạy (Run Replay Log)**.
2.  Khi một người chơi khác tham gia thách đấu, hệ thống sẽ tải bản ghi của người chơi trước đó và phát lại hành động của họ như thể họ đang chơi song song theo thời gian thực.

---

## 🗄️ PHẦN 2: CẤU TRÚC DỮ LIỆU (FIRESTORE SCHEMA)

### Collection `pvp_runs` (Lưu trữ lượt chạy của các đấu thủ)
```typescript
// path: /pvp_runs/{runId}
{
  runId: string;
  uid: string;
  displayName: string;
  photoURL: string;
  level: number;
  deckId: string;             // Bộ bài từ vựng dùng để thi đấu
  totalTimeSeconds: number;   // Tổng thời gian hoàn thành (ví dụ: 18.5s)
  score: number;              // Số câu trả lời đúng (ví dụ: 10/10)
  actionLog: {
    questionIndex: number;    // Vị trí câu hỏi (0 -> 9)
    timeOffsetMs: number;     // Mốc thời gian trả lời xong kể từ khi bắt đầu (ms)
    isCorrect: boolean;       // Trả lời đúng hay sai
  }[];
  createdAt: string;          // Chuỗi ISO
}
```

### Cập nhật Rank Point trong `users_stats`
Mỗi người dùng sẽ có thêm chỉ số **Điểm Hạng (Rank Points - Elo)** để làm cơ sở tìm đối thủ phù hợp:
```typescript
{
  // ... các trường cũ
  pvpRankPoints: number;      // Mặc định là 1000. Tăng khi thắng, giảm khi thua
}
```

---

## 🧠 PHẦN 3: LOGIC GHÉP TRẬN & TIẾN TRÌNH TRẬN ĐẤU

### 1. Thuật toán tìm đối thủ (Matchmaking)
Khi người chơi A bấm nút **"Tìm đối thủ"** tại Deck X:
1.  Hệ thống query Firestore trong collection `pvp_runs` lấy ra các lượt chạy:
    *   Có `deckId === X`
    *   Có `uid !== userStats.uid` (không lấy lượt chạy của chính mình)
    *   Sắp xếp ngẫu nhiên hoặc chọn lượt chạy có điểm xếp hạng của đối thủ gần với `pvpRankPoints` của A nhất.
2.  Tải dữ liệu `actionLog` của đối thủ B về máy khách.

### 2. Gameplay Loop (Vòng lặp trận đấu)
Khi trận đấu bắt đầu:
1.  **Đồng hồ đếm giờ (Timer)** chạy từ 0ms.
2.  **Người chơi A**: Tự trả lời các câu hỏi xuất hiện trên màn hình (dạng trắc nghiệm nghĩa, gõ Romaji hoặc điền từ).
3.  **Đối thủ B (Ghost)**: 
    *   Hệ thống dùng một hàm `setInterval` hoặc `requestAnimationFrame` để theo dõi thời gian trôi qua.
    *   So khớp thời gian hiện tại với mốc `timeOffsetMs` trong `actionLog` của B.
    *   Khi thời gian trôi qua vượt mốc `timeOffsetMs` của câu tiếp theo trong log, cập nhật UI dịch chuyển nhân vật Shiba của B tiến lên phía trước.

---

## 🎨 PHẦN 4: THIẾT KẾ GIAO DIỆN (UI COMPONENTS)

### 1. `PvPArenaModal.tsx` (Màn hình đấu trường)
*   **Khu vực hiển thị đường chạy (Race Track)**:
    *   Nằm ở 1/3 phía trên màn hình. Chia làm 2 làn đua song song.
    *   Làn 1: Shiba của người chơi A (vẫy đuôi chạy).
    *   Làn 2: Shiba của đối thủ B (ở trạng thái mờ nhẹ - bán trong suốt để biểu thị đây là "bóng").
    *   Vị trí của mỗi chú Shiba trên làn chạy tỷ lệ thuận với số câu hỏi đã trả lời xong (`questionIndex / tổng số câu * 100%`).
*   **Khu vực câu hỏi**:
    *   Hiển thị câu hỏi tiếng Nhật ở giữa.
    *   Các lựa chọn đáp án nằm ở dưới cùng.
    *   Gõ chữ hoặc bấm chọn thật nhanh để đẩy Shiba của mình tiến lên.
*   **Thanh chỉ số thời gian thực**:
    *   Đồng hồ đếm ngược.
    *   Chỉ báo khoảng cách: Hiển thị chữ `"BẠN ĐANG DẪN TRƯỚC!"` màu xanh lá hoặc `"ĐỐI THỦ ĐANG DẪN TRƯỚC!"` màu đỏ nhấp nháy.

### 2. `PvPEndScreen.tsx` (Màn hình kết quả)
*   **Hoạt ảnh**:
    *   **Thắng**: Chú Shiba của bạn mặc trang phục chiến binh cầm cúp vàng nhảy múa, nhạc chiến thắng phát lên.
    *   **Thua**: Shiba của bạn nằm gục, đối thủ đứng cười.
*   **Thống kê chi tiết**:
    *   Bảng so sánh thời gian gõ của 2 bên qua từng câu dưới dạng biểu đồ đường (Line Chart) cực kỳ trực quan.
    *   Cộng/trừ Điểm Hạng (Elo): Ví dụ: `+25 Rank Points (1025)`.
    *   Cộng phần thưởng: Xương và EXP.

---

## 🚀 PHẦN 5: LỘ TRÌNH THỰC HIỆN CỤ THỂ

*   **[ ] Bước 1: Thiết kế Replay Logger**
    *   Viết logic trong minigame để ghi nhận mốc thời gian (dùng `performance.now()`) từ lúc câu hỏi xuất hiện đến khi người chơi chọn xong đáp án.
    *   Lưu trữ mảng `actionLog` này cùng các thông tin metadata lên Firestore `pvp_runs`.
*   **[ ] Bước 2: Viết thuật toán Matchmaking trên Client**
    *   Viết hàm tìm kiếm bản ghi từ đối thủ phù hợp dựa theo chỉ số Elo của người dùng.
*   **[ ] Bước 3: Dựng giao diện Làn đua đối kháng (Race Track)**
    *   Sử dụng `framer-motion` để tạo hiệu ứng dịch chuyển mượt mà của 2 chú Shiba đại diện dọc theo làn đường đua chạy bằng SVG hoặc CSS Flexbox.
*   **[ ] Bước 4: Tích hợp logic đồng bộ thời gian thực (Ghost Engine)**
    *   Viết bộ đọc bản ghi log (Replay Player) để tự động kích hoạt trạng thái trả lời đúng/sai và dịch chuyển avatar của đối thủ B dựa trên thời gian thực tế trôi qua.
*   **[ ] Bước 5: Hoàn thiện hệ thống tính điểm Elo**
    *   Áp dụng công thức Elo tiêu chuẩn để tính toán điểm cộng/trừ sau trận đấu tùy thuộc vào chênh lệch điểm hạng ban đầu của hai bên.

---
*Cơ chế Ghost PvP giúp game vô cùng mượt mà, không gặp hiện tượng giật lag đường truyền mạng (lag latency) thường thấy ở real-time multiplayer.*

# 🏆 KẾ HOẠCH TRIỂN KHAI: BẢNG XẾP HẠNG & THĂM NHÀ BẠN BÈ (SOCIAL & LEADERBOARD)

Tài liệu này chi tiết hóa thiết kế hệ thống, cơ sở dữ liệu Firestore và các component giao diện để xây dựng tính năng **Bảng xếp hạng (Leaderboards)** và **Thăm phòng Shiba của bạn bè (Friend's Shiba Room)**.

---

## 🗄️ PHẦN 1: THIẾT KẾ CƠ SỞ DỮ LIỆU (FIRESTORE SCHEMA)

Dự án sử dụng Firebase Auth. Chúng ta sẽ lưu trữ dữ liệu xã hội trong Firestore dưới hai collection chính: `users_stats` (cập nhật từ dữ liệu hiện có) và `friendships_interacts` (quản lý lượt tương tác hàng ngày).

### 1. Cập nhật Collection `users_stats`
Mỗi khi người dùng có thay đổi về EXP, Coins hoặc trang trí phòng, dữ liệu sẽ được đồng bộ lên Firestore:
```typescript
// path: /users_stats/{uid}
{
  uid: string;
  displayName: string;
  photoURL: string;
  level: number;
  exp: number;
  weeklyExp: number;         // Reset về 0 vào mỗi Chủ Nhật bằng Cloud Function hoặc kiểm tra ngày đầu tuần
  streak: number;
  coins: number;
  goldenFur: number;
  equippedSlots: {           // Trang phục Shiba đang mặc
    head: string | null;
    armor: string | null;
    earring: string | null;
    gloves: string | null;
    mount: string | null;
    aura: string | null;
    costume: string | null;
  };
  equippedFurniture: {       // Nội thất trong phòng
    wall: string | null;
    corner: string | null;
    floor: string | null;
  };
  lastActiveDate: string;    // Chuỗi ISO
}
```

### 2. Collection mới `daily_interacts`
Dùng để giới hạn lượt tương tác của người chơi với Shiba nhà bạn bè (tránh spam để kiếm xu vô hạn):
```typescript
// path: /daily_interacts/{senderUid}_{receiverUid}_{dateStr}
{
  id: string;                // Định dạng: senderUid_receiverUid_YYYY-MM-DD
  senderUid: string;         // Người đi thăm
  receiverUid: string;       // Chủ nhà
  date: string;              // Định dạng YYYY-MM-DD
  petted: boolean;           // Đã vuốt ve hộ Shiba hôm nay chưa
  cleaned: boolean;          // Đã dọn dẹp hộ phòng hôm nay chưa
}
```

---

## 🧠 PHẦN 2: TÍCH HỢP STORE STATE (ZUSTAND SLICES)

Thêm các hàm tương tác xã hội vào Zustand store (`src/store/slices/socialSlice.ts` hoặc tích hợp vào `userStatsSlice.ts`).

### Các Actions đề xuất:
1.  `fetchLeaderboard(type: 'weekly' | 'streak' | 'coins')`:
    *   Tải danh sách Top 10-20 người dùng từ Firestore, sắp xếp giảm dần theo trường tương ứng (`weeklyExp`, `streak`, hoặc `coins`).
2.  `fetchFriendRoomData(friendUid: string)`:
    *   Tải cấu hình phòng (`equippedFurniture`, `equippedSlots`) và chỉ số Shiba của bạn bè để render phòng giả lập.
3.  `interactWithFriendShiba(friendUid: string, type: 'pet' | 'clean')`:
    *   Kiểm tra trong Firestore xem hôm nay người dùng đã tương tác với `friendUid` chưa.
    *   Nếu chưa: 
        *   Tạo bản ghi trong `daily_interacts`.
        *   Cộng xu/xương cho người đi thăm (`+10 Coins`).
        *   Gửi thông báo (Notification) hoặc tăng điểm thân thiết.

---

## 🎨 PHẦN 3: KIẾN TRÚC UI COMPONENTS

### 1. `LeaderboardTab.tsx` (Giao diện bảng xếp hạng)
*   **Vị trí**: Đặt làm một Tab phụ trong màn hình Hồ sơ hoặc tích hợp vào BottomNav.
*   **Thiết kế**:
    *   **Bộ lọc ngang**: 3 nút bấm gỗ cute: "Tuần này 🔥", "Chuỗi ngày ⚡", "Đại gia 🦴".
    *   **Danh sách cuộn**: Hiển thị Top 10 người đứng đầu.
        *   *Top 1, 2, 3*: Hiển thị kèm Vương miện Vàng, Bạc, Đồng lấp lánh.
        *   *Avatar*: Tròn trịa, hiển thị hình đại diện Google của người dùng.
        *   *Chi tiết*: Tên người dùng, Cấp độ (Lv.), Chỉ số (EXP/Streak/Coins).
    *   **Bảng xếp hạng của tôi**: Một banner cố định dưới đáy hiển thị vị trí hiện tại của chính người chơi nếu họ nằm ngoài Top 10.
    *   **Nút tương tác**: Cạnh mỗi người chơi sẽ có nút **"Thăm Nhà 🏠"** để chuyển sang phòng Shiba của họ.

### 2. `FriendRoomOverlay.tsx` (Chế độ xem phòng bạn bè)
*   Tái sử dụng component `ShibaRoom.tsx` hiện có bằng cách truyền thêm prop:
    *   `<ShibaRoom isReadOnly={true} friendData={friendData} />`
*   **Khi `isReadOnly = true`**:
    *   Ẩn các nút hành động cá nhân (Túi đồ, Đi ngủ, Gacha Shop).
    *   Hiện thanh tiêu đề: `"Đang ghé thăm nhà của [Tên Bạn Bè]"` kèm nút **"Trở về nhà ⬅️"**.
    *   Hiện 2 nút hành động xã hội nổi:
        *   **Nút "Vuốt ve 💖"**: Khi bấm, hiện hoạt ảnh thả tim bay lên xung quanh Shiba của bạn, hiện Toast thông báo: *"Bạn đã vuốt ve Shiba của [Tên] và nhận được 10 Xương! 🦴"*.
        *   **Nút "Dọn dẹp 🧹"**: Nếu phòng có rác (ngẫu nhiên xuất hiện 1-2 đốm bụi), bấm vào sẽ chạy hoạt ảnh quét dọn và cộng xu.

---

## 🚀 PHẦN 4: LỘ TRÌNH THỰC HIỆN CỤ THỂ

*   **[ ] Bước 1: Setup Cơ sở dữ liệu & Seed Data**
    *   Tạo chỉ mục (Index) trên Firestore cho các truy vấn sắp xếp `weeklyExp`, `streak`, `coins` kèm điều kiện giới hạn số tài liệu trả về (limit 20).
    *   Tạo rules bảo mật trên Firestore đảm bảo người chơi có thể đọc thông tin cơ bản của nhau nhưng chỉ ghi được vào phần của mình và `daily_interacts`.
*   **[ ] Bước 2: Viết Zustand Actions**
    *   Viết code gọi dữ liệu bảng xếp hạng và lưu trữ vào state tạm thời `leaderboards: { weekly: [], streak: [], coins: [] }`.
    *   Viết hàm tương tác `interactWithFriendShiba` ghi nhận vào Firestore.
*   **[ ] Bước 3: Dựng giao diện `LeaderboardTab`**
    *   Dựng UI danh sách bảng xếp hạng theo phong cách hoạt họa dễ thương, bo góc lớn, màu sắc pastel ấm cúng (monochrome kết hợp màu vàng/cam đất).
*   **[ ] Bước 4: Tích hợp chế độ Thăm nhà vào `ShibaRoom`**
    *   Điều chỉnh hook `useShibaRoom` nhận diện chế độ xem phòng người khác.
    *   Tạo các nút tương tác xã hội và kích hoạt các hiệu ứng hoạt ảnh thả tim, cộng xương bay lên.

---
*Tài liệu thiết kế này tối ưu hóa việc tái sử dụng UI cũ giúp tiết kiệm tối đa thời gian lập trình.*

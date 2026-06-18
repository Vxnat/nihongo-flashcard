# 🏡 KẾ HOẠCH TRIỂN KHAI GACHA 2.0 & META-GAME "SHIBA ROOM"

**Quyết định thiết kế:**
- Thêm Tab thứ 4 "Nhà" ở BottomNav.
- Bổ sung độ hiếm 0.1% (Divine) siêu khó.
- Vật phẩm trùng lặp phân rã thành "Lông Shiba Vàng".
- Đồ hiếm sẽ quay ra "Mảnh ghép", đủ mảnh mới hợp nhất thành đồ thật.
- Cơ chế "Bảo hiểm" (Pity system): Quay 50 lần chắc chắn ra đồ Epic trở lên.

---

## 🧱 PHASE 1: CHUẨN BỊ DỮ LIỆU & STATE (DATA SCHEMA)

**[ ] Bước 1: Cập nhật `useAppStore.ts`**
- Bổ sung `goldenFur` (số lượng Lông Vàng) vào `userStats`.
- Thêm `shards: Record<string, number>` (Lưu số lượng mảnh ghép đang có của mỗi vật phẩm).
- Thêm `furniture: string[]` (Đồ nội thất đã sở hữu).
- Thêm `equippedTheme: string | null` và `equippedOutfit: string | null`.
- Thêm `pityCounter: number` (Bộ đếm bảo hiểm, đụng mốc 50 sẽ nổ bảo hiểm).

**[ ] Bước 2: Thiết kế lại `gachaPool.ts`**
- Cấu trúc lại Item: `{ id, type, name, description, rarity, shardTarget? }`
- Các loại type: `sticker`, `theme`, `outfit`, `furniture`.
- Thang Tỷ lệ rớt (Drop Rate) & Yêu cầu mảnh ghép:
  *(Lưu ý: Mọi độ hiếm đều có thể rớt nguyên vật phẩm, nhưng tỷ lệ rớt nguyên vật phẩm sẽ nhỏ hơn rất nhiều so với rớt mảnh ghép)*
  - ⚪ **Common (60%):** Rớt nguyên vật phẩm (chủ yếu) hoặc mảnh (Cần 2 mảnh).
  - 🔵 **Rare (24%):** Rớt nguyên vật phẩm (tỷ lệ thấp) hoặc mảnh (Cần 3 mảnh).
  - 🟣 **Epic (10%):** Rớt nguyên vật phẩm (tỷ lệ rất thấp) hoặc mảnh (Cần 5 mảnh).
  - 🟡 **Legendary (4.9%):** Rớt nguyên vật phẩm (tỷ lệ cực thấp) hoặc mảnh (Cần 10 mảnh).
  - 🔴 **Mythic (1%):** Rớt nguyên vật phẩm (tỷ lệ siêu thấp) hoặc mảnh (Cần 20 mảnh).
  - 🌈 **Divine (0.1%):** Rớt nguyên vật phẩm (phép màu) hoặc mảnh (Cần 50 mảnh).

---

## 🎰 PHASE 2: CỬA HÀNG GACHA 2.0

**[ ] Bước 3: Cải tổ giao diện `GachaShop.tsx`**
- **Thiết kế Máy Quay (Robot Shiba):** Máy gacha mang hình dáng **Robot Shiba khổng lồ**. Bụng Shiba làm lồng kính trong suốt chứa trứng, cái chuông đeo cổ (hoặc rốn) là nút vặn.
- **Giao diện Gaming (UI Elements):**
  - Phía sau máy có **Poster Banner** quảng cáo vật phẩm đang Hot (VD: "SỰ KIỆN: NINJA MÈO XUẤT CHIÊU!").
  - Thêm **Thanh Pity (Bảo hiểm)** ngay dưới máy (VD: "Còn 12 lần chắc chắn nhận EPIC!").
  - Cung cấp 2 lựa chọn: **[Quay x1 (10 🦴)]** và **[Quay x10 (90 🦴)]** (rớt 10 quả trứng cùng lúc lỉa chỉa xuống khe).
- Xóa phần "Tủ đồ" (Inventory) hiển thị bên dưới máy quay.
- Thêm thanh hiển thị tiền tệ: `Xương` và `Lông Shiba Vàng` ở trên cùng.
- Thêm Nút `[ i ] Thông tin tỷ lệ` ở cạnh máy quay. Mở Modal hiển thị rõ bảng tỷ lệ %.

**[ ] Bước 4: Viết lại Logic Quay Gacha (`handleTwist`)**
- **Hiệu ứng "Vặn" Bùng nổ:** Rung bần bật toàn bộ màn hình (Camera Shake) khi bấm vặn để tạo lực ép mạnh mẽ.
- **Thiết kế Quả trứng (Capsules):** Trứng rớt xuống có đa dạng họa tiết (ngôi sao, sọc vằn, poke-ball), kèm hiệu ứng khói bụi (particles) nảy lên sinh động.
- **Hiệu ứng Ánh sáng (Anticipation):** Trứng rơi xuống chưa vỡ ngay mà phát sáng. Tia sáng Vàng (Legendary) hoặc Cầu vồng (Divine) sẽ nhấp nháy báo hiệu trúng đồ hiếm trước khi bung nổ.
- Xây dựng hàm quay random có trọng số (Weighted Random) dựa trên % tỷ lệ rớt.
- Logic khi quay trúng:
  - Rớt Mảnh: Cộng vào `shards`. Nếu đủ mảnh -> Hợp nhất thành Item -> Báo tin vui.
  - Trùng lặp (Duplicate): Nếu đã có Item đó rồi -> Báo "Đã sở hữu, phân rã thành X Lông Shiba Vàng!".

- **Hệ thống Bảo hiểm (Pity):** Mỗi lần quay tăng `pityCounter` lên 1. Nếu chạm mốc 50, ép kết quả quay rớt vào nhóm [Epic, Legendary, Mythic, Divine]. Tự động reset `pityCounter = 0` mỗi khi người chơi quay ra được đồ Epic trở lên (dù là nổ bảo hiểm hay nổ tự nhiên).

**[ ] Bước 5: Cửa Hàng Lông Vàng (Golden Fur Shop)**
- Tạo một khu vực nhỏ trong màn Shop để người dùng dùng Lông Vàng đổi trực tiếp lấy Mảnh ghép (Bảo hiểm xui xẻo) hoặc mua Theme đặc biệt.

---

## 🏠 PHASE 3: META-GAME "SHIBA ROOM" (CĂN PHÒNG SHIBA)

**[ ] Bước 6: Thêm Tab "Nhà" vào Hệ thống**
- Cập nhật `BottomNav.tsx` thêm nút có icon Ngôi Nhà 🏠.
- Cập nhật state quản lý tab trong `page.tsx` và `useHome.ts`.

**[ ] Bước 7: Dựng Giao diện `ShibaRoomTab.tsx`**
- Tạo giao diện không gian 2.5D tĩnh (Phòng trống, có vách tường, thảm tatami).
- Đặt chú Mascot Shiba vào giữa phòng.

**[ ] Bước 8: Hệ thống Túi Đồ (Inventory) tại Phòng**
- Tạo Menu để người chơi mở Túi Đồ (Nút Balo 🎒).
- Trong Balo chia Tab: *Nội Thất, Quần Áo, Chủ Đề, Mảnh Ghép*.
- Cho phép click vào Đồ nội thất để đặt vào trong Phòng (Bước đầu cứ làm kiểu xếp cứng vào các "Slot" có sẵn trong phòng cho dễ quản lý).

---

## ✨ PHASE 4: TÍCH HỢP HIỆU ỨNG VẬT PHẨM

**[ ] Bước 9: Kích hoạt Theme (Chủ Đề)**
- Viết logic nếu user trang bị một Theme, sẽ tự động đổi class CSS hoặc biến CSS (Color Variables) toàn App. (Ví dụ Theme Sakura đổi mọi viền cam thành viền hồng phấn).

**[ ] Bước 10: Mặc đồ cho Shiba (Outfits)**
- Nếu user đổi Outfit, thay thế sprite/GIF của Shiba trên toàn bộ hệ thống bằng hình ảnh có mặc đồ tương ứng.

---
*Tài liệu này là lộ trình kỹ thuật cho AI. Khi nhận lệnh, AI sẽ triển khai theo đúng thứ tự các Checkbox ở trên.*
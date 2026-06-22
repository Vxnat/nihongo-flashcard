# Kế hoạch: Di chuyển cấu hình Gacha, Shop, và Daily Quests lên Firebase Firestore

Hiện tại, các tệp cấu hình `gacha_pool.json`, `shop_items.json` và `daily_quests.json` đang được đọc ghi cục bộ thông qua Next.js Route API `/api/admin/save-json`. Cơ chế này chỉ chạy ở môi trường Development (do Next.js cấm ghi file trên Serverless Production như Vercel). 

Kế hoạch này sẽ di chuyển toàn bộ cấu hình này lên **Firebase Firestore** để hệ thống hoạt động hoàn chỉnh trên môi trường Production, đồng thời bảo mật và đồng bộ realtime.

---

## 1. Thiết kế Firestore Database Schema

Chúng ta sẽ lưu trữ các tệp cấu hình này dưới dạng các Document trong collection `system_config` hiện có để tối ưu hóa lượt đọc (read calls) và đồng bộ mượt mà:

* Collection **`system_config`**:
  * Document **`gacha_pool`**:
    * Trường `items`: `GachaItem[]` (Mảng chứa toàn bộ vật phẩm gacha).
  * Document **`shop_items`**:
    * Trường `exclusiveGoods`: `GachaItem[]` (Vật phẩm độc quyền).
    * Trường `consumableBuffs`: `any[]` (Các bùa lợi tiêu hao).
  * Document **`daily_quests`**:
    * Trường `quests`: `DailyQuest[]` (Danh sách nhiệm vụ hàng ngày mặc định).

---

## 2. Các thay đổi đề xuất (Proposed Changes)

### Bước 1: Tạo Script Import Dữ liệu lên Cloud
Chúng ta sẽ viết một script chạy một lần [import_to_firestore.js](file:///c:/Hoc_Tap/nihongo-flashcard/src/scripts/import_to_firestore.js) để:
* Đọc dữ liệu từ 3 file JSON cục bộ hiện tại.
* Sử dụng Firebase Client/Admin SDK để đẩy thẳng lên Firestore vào collection `system_config`.
* Sau khi đẩy thành công, ta giữ lại các file JSON trong dự án làm **Fallback (dự phòng)** khi mất mạng hoặc Firestore chưa load kịp.

---

### Bước 2: Mutate Dynamic References tại Client-Side
Để **tránh việc phải sửa hàng chục import** `ALL_ITEMS`, `GACHA_POOL` tĩnh trong các components (`ShibaAvatar`, `ShibaRoom`, `FurShopModal`, `MemeGalleryModal`...), chúng ta sẽ thực hiện mutate mảng tại chỗ:

#### [MODIFY] [gachaPool.ts](file:///c:/Hoc_Tap/nihongo-flashcard/src/constants/gachaPool.ts)
* Chuyển `GACHA_POOL` và `ALL_ITEMS` thành mảng mutable (giữ nguyên tham chiếu const nhưng thay đổi phần tử bên trong):
```typescript
export const GACHA_POOL: GachaItem[] = [...gachaPoolJson] as GachaItem[];
export const EXCLUSIVE_GOODS: GachaItem[] = (shopItemsJson.EXCLUSIVE_GOODS || []).map(...) as GachaItem[];
export const ALL_ITEMS: GachaItem[] = [...GACHA_POOL, ...EXCLUSIVE_GOODS];

// Thêm hàm helper cập nhật dữ liệu động khi fetch từ Firestore thành công
export function updateSystemConfigDynamic(newGacha: GachaItem[], newExclusives: GachaItem[]) {
  // Clear and push new gacha pool
  GACHA_POOL.length = 0;
  GACHA_POOL.push(...newGacha);

  // Clear and push new exclusives
  EXCLUSIVE_GOODS.length = 0;
  EXCLUSIVE_GOODS.push(...newExclusives);

  // Clear and push new all items
  ALL_ITEMS.length = 0;
  ALL_ITEMS.push(...GACHA_POOL, ...EXCLUSIVE_GOODS);
}
```

---

### Bước 3: Load Dữ liệu Firestore khi Khởi chạy Ứng dụng

#### [MODIFY] [useAppStore.ts](file:///c:/Hoc_Tap/nihongo-flashcard/src/store/useAppStore.ts)
* Thêm flag `configLoaded: boolean` vào state của Store.
* Thêm action `loadSystemConfigFromFirestore: () => Promise<void>`:
  * Fetch document `gacha_pool`, `shop_items` và `daily_quests` từ Firestore.
  * Nếu thành công:
    * Gọi hàm `updateSystemConfigDynamic` ở `gachaPool.ts`.
    * Cập nhật `DEFAULT_QUESTS` động trong store.
    * Gán `configLoaded: true`.
  * Nếu thất bại: Dùng dữ liệu fallback tĩnh đã import từ JSON (đảm bảo game vẫn chơi được ngoại tuyến).
* Gọi `loadSystemConfigFromFirestore()` bên trong hàm khởi tạo ứng dụng `loadUserStats()` hoặc tại component gốc.

---

### Bước 4: Cập nhật Trang quản trị Admin (Firestore Direct Update)

#### [MODIFY] [useAdmin.ts](file:///c:/Hoc_Tap/nihongo-flashcard/src/hooks/admin/useAdmin.ts)
* Thay thế toàn bộ các API call `fetch("/api/admin/save-json?filePath=...")` của Gacha, Shop, và Daily Quests bằng các lệnh Firestore trực tiếp:
  * **Đọc dữ liệu**: Dùng `getDoc(doc(db, "system_config", "gacha_pool"))`, `getDoc(doc(db, "system_config", "shop_items"))`,...
  * **Lưu dữ liệu**: Dùng `setDoc(doc(db, "system_config", "gacha_pool"), { items: updatedPool })`, ...
  * Nhờ đó, Admin có thể cập nhật cấu hình trực tiếp từ Production mà không bị chặn quyền ghi file.

---

## 3. Kế hoạch xác minh (Verification Plan)

### Kiểm thử Tự động
* Chạy `npx tsc --noEmit --skipLibCheck` để đảm bảo kiểu dữ liệu và code compile thành công.

### Kiểm thử Thủ công
1. Chạy script để đẩy dữ liệu lên Firestore. Mở Firebase Console để xác nhận các document `gacha_pool`, `shop_items`, `daily_quests` đã xuất hiện với đầy đủ danh sách vật phẩm.
2. Mở Shiba Town (ở chế độ thường), kiểm tra xem danh sách gacha, cửa hàng và nhiệm vụ vẫn hoạt động bình thường (được load động từ Firestore).
3. Đăng nhập trang Admin, thực hiện sửa đổi 1 vật phẩm Gacha (ví dụ: đổi tên) và lưu lại:
   * Xác nhận trên Firebase Console dữ liệu đã thay đổi.
   * F5 lại trang Client, kiểm tra xem vật phẩm đã đổi tên thành công.

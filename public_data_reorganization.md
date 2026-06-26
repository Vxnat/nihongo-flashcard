# Đề xuất tái cấu trúc thư mục `public/data/`

Hiện tại, thư mục `public/data/` đang chứa hỗn hợp nhiều nhóm file khác nhau ở cấp độ gốc (root), gây khó khăn cho việc mở rộng dự án sau này (khi thêm các cấp độ N4, N3, N2, N1) và dễ gây nhầm lẫn giữa dữ liệu hệ thống với dữ liệu học tập.

---

## 1. Phân tích hiện trạng cấu trúc thư mục

Thư mục `public/data/` hiện tại đang chứa:
* **Cấu hình hệ thống:** `daily_quests.json`, `gacha_pool.json`, `shop_items.json`, `system_decks.json`
* **Dữ liệu bài học (Decks):** Thư mục `n5/` (chứa các file từ vựng/kanji hệ thống) và file lẻ `n5_deck_01.json` ở ngoài root.
* **Cốt truyện Visual Novel:** Thư mục `vn/`
* **File mẫu / Templates:** `default_decks.json`, `mau_flashcard_cute.json`, `mau_kanji_cute.json`
* **Bản sao lưu:** Thư mục `backup/`

---

## 2. Cấu trúc đề xuất (Sạch sẽ & Dễ mở rộng)

Chúng ta nên phân nhóm rõ ràng theo chức năng của từng file:

```
public/data/
├── configs/                # Cấu hình hệ thống (Registry chính)
│   ├── daily_quests.json
│   ├── gacha_pool.json
│   ├── shop_items.json
│   └── system_decks.json
│
├── decks/                  # Dữ liệu từ vựng & minigame bài học
│   ├── n5/
│   │   ├── sys_n5_kana_01.json
│   │   └── ...
│   ├── n4/                 # Dễ dàng mở rộng thêm các cấp độ khác
│   └── n3/
│
├── stories/                # Nội dung cốt truyện Visual Novel (trước đây là vn/)
│   ├── vn_chapter_01.json
│   └── ...
│
├── templates/              # File mẫu hướng dẫn / import / mặc định
│   ├── default_decks.json  # Bộ thẻ mặc định cho Custom Tab
│   ├── mau_flashcard_cute.json
│   └── mau_kanji_cute.json
│
└── backups/                # Các bản sao lưu hệ thống (trước đây là backup/)
```

---

## 3. Phạm vi ảnh hưởng trong mã nguồn (Files cần cập nhật đường dẫn)

Nếu thực hiện chuyển đổi, chúng ta cần cập nhật đường dẫn tương ứng trong các file sau để tránh lỗi import/fetch:

### ⚙️ Các file Import trực tiếp ở Backend/Constants
1. **[useAppStore.ts](file:///c:/Hoc_Tap/nihongo-flashcard/src/store/useAppStore.ts):**
   * Cập nhật `import dailyQuestsJson from "../../public/data/daily_quests.json"` $\rightarrow$ `../../public/data/configs/daily_quests.json`
2. **[shopItems.ts](file:///c:/Hoc_Tap/nihongo-flashcard/src/constants/shopItems.ts):**
   * Cập nhật `import shopItemsJson from "../../public/data/shop_items.json"` $\rightarrow$ `../../public/data/configs/shop_items.json`
3. **[gachaPool.ts](file:///c:/Hoc_Tap/nihongo-flashcard/src/constants/gachaPool.ts):**
   * Cập nhật `import gachaPoolJson from "../../public/data/gacha_pool.json"` $\rightarrow$ `../../public/data/configs/gacha_pool.json`

### 🏮 File API & Dashboard Admin
4. **[route.ts](file:///c:/Hoc_Tap/nihongo-flashcard/src/app/api/admin/save-json/route.ts):**
   * Cập nhật đường dẫn thư mục sao lưu (`public/data/backup` $\rightarrow$ `public/data/backups`).
5. **[page.tsx](file:///c:/Hoc_Tap/nihongo-flashcard/src/app/admin/page.tsx):**
   * Cập nhật các đường dẫn load/save cấu hình hệ thống:
     * `public/data/system_decks.json` $\rightarrow$ `public/data/configs/system_decks.json`
     * `public/data/gacha_pool.json` $\rightarrow$ `public/data/configs/gacha_pool.json`
     * `public/data/shop_items.json` $\rightarrow$ `public/data/configs/shop_items.json`
     * `public/data/daily_quests.json` $\rightarrow$ `public/data/configs/daily_quests.json`
   * Cập nhật các đường dẫn ghi file từ vựng bài học:
     * `public/data/${folder}/${deck.id}.json` $\rightarrow$ `public/data/decks/${folder}/${deck.id}.json`

### 🎒 Client-side components & hooks (Fetch API)
6. **[page.tsx](file:///c:/Hoc_Tap/nihongo-flashcard/src/app/(user)/page.tsx):**
   * Cập nhật endpoint fetch `/data/system_decks.json` $\rightarrow$ `/data/configs/system_decks.json`
   * Cập nhật fetch bài học và minigame `/data/${folder}/...` $\rightarrow$ `/data/decks/${folder}/...`
7. **[useSystemRoadmap.ts](file:///c:/Hoc_Tap/nihongo-flashcard/src/hooks/useSystemRoadmap.ts):**
   * Cập nhật `/data/system_decks.json` $\rightarrow$ `/data/configs/system_decks.json`
8. **[VisualNovelMode.tsx](file:///c:/Hoc_Tap/nihongo-flashcard/src/components/VisualNovelMode.tsx):**
   * Cập nhật `/data/vn/${activeStoryId}.json` $\rightarrow$ `/data/stories/${activeStoryId}.json`
9. **[LoadDefaultDecksBtn.tsx](file:///c:/Hoc_Tap/nihongo-flashcard/src/components/LoadDefaultDecksBtn.tsx):**
   * Cập nhật `/data/default_decks.json` $\rightarrow$ `/data/templates/default_decks.json`
10. **[useImportDeck.ts](file:///c:/Hoc_Tap/nihongo-flashcard/src/hooks/useImportDeck.ts):**
    * Cập nhật link tải file mẫu `/data/mau_flashcard_cute.json` và `/data/mau_kanji_cute.json` $\rightarrow$ `/data/templates/mau_flashcard_cute.json` / `/data/templates/mau_kanji_cute.json`

---

## 4. Kế hoạch triển khai (Step-by-step)

1. **Bước 1 (Di chuyển file vật lý):**
   * Tạo các thư mục mới: `configs`, `decks`, `stories`, `templates`, `backups`.
   * Di chuyển các file tương ứng vào các thư mục mới này.
   * Di chuyển thư mục bài học `n5` vào bên trong `decks/` (thành `decks/n5`).
   * Di chuyển các file từ vựng cốt truyện trong `vn/` vào `stories/`.
   * Dọn dẹp các thư mục trống cũ.
2. **Bước 2 (Cập nhật Code):**
   * Cập nhật đường dẫn import tĩnh trong store và constants.
   * Cập nhật đường dẫn fetch ở Frontend (trang chủ, roadmap, VN mode, PWA button).
   * Cập nhật đường dẫn đọc/ghi file ở trang quản trị Admin và Backend API Route.
3. **Bước 3 (Kiểm tra & Biên dịch):**
   * Chạy lệnh `npm run build` để kiểm tra có lỗi import tĩnh nào xảy ra hay không.
   * Test thực tế các tính năng: tải dữ liệu bài học hệ thống, chơi minigame, xem cốt truyện, và thêm/xóa bài học ở trang Admin để đảm bảo việc đọc/ghi file thông qua API vẫn trơn tru.

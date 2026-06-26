# 🎮 KẾ HOẠCH QUY HOẠCH DỮ LIỆU MINIGAME (HYBRID APPROACH)

**Ngữ cảnh:** 
Hiện tại, các minigame đang lấy data bằng cách gộp "ngẫu nhiên" các thẻ từ những bài học trước. Cách này không tối ưu cho mục đích sư phạm và làm code fetch data trở nên cứng nhắc. Bên cạnh đó, việc nhét thẳng mảng dữ liệu (như `kanjiList`) vào `system_decks.json` sẽ làm file Roadmap bị phình to, ảnh hưởng đến tốc độ tải trang.

**Giải pháp:** Kết hợp 2 phương pháp lấy dữ liệu dựa trên "thể loại" (type) của minigame.

---

## 🧠 CÁCH 1: DÙNG `targetDeckIds` (Cho Game Ôn Tập)
**Áp dụng cho:** `minigame_matching` (Nối từ), `minigame_rush` (Băng chuyền).

**Ý tưởng:** 
Đây là những game dùng để kiểm tra lại những từ vựng người dùng VỪA MỚI HỌC. Thay vì lấy random, ta chỉ định đích danh ID của các bài học cần ôn tập ngay trong `system_decks.json`.

**Cấu trúc dữ liệu trong `system_decks.json`:**
```json
{
  "id": "mg_match_n5_01",
  "type": "minigame_matching",
  "title": "Minigame: Nối từ (Ôn tập bài 1-3)",
  "level": "N5",
  "targetDeckIds": ["sys_n5_minna_01", "sys_n5_minna_02", "sys_n5_minna_03"],
  "rewardCoins": 15
}
```

**Luồng xử lý (Logic):**
Khi mở Minigame, hệ thống sẽ đọc mảng `targetDeckIds`, âm thầm fetch 3 file `sys_n5_minna_01.json`, `sys_n5_minna_02.json`, `sys_n5_minna_03.json`, gộp chúng lại, xáo trộn (shuffle) và lấy ra một lượng thẻ nhất định (VD: 10-15 thẻ) để đưa vào Game.

---

## 📂 CÁCH 2: TÁCH FILE JSON RIÊNG BIỆT (Cho Game Đặc Thù)
**Áp dụng cho:** `minigame_kanji` (Luyện viết Hán tự), `story` (Visual novel).

**Ý tưởng:** 
Đây là những game có cấu trúc dữ liệu hoàn toàn khác biệt so với Flashcard thông thường (VD: Kanji cần `{char, meaning}`, Truyện cần node, thoại). Việc nhét vào `system_decks.json` là tối kỵ. Ta sẽ tạo một file `.json` riêng biệt, tên file trùng với `id` của minigame.

**Cấu trúc dữ liệu trong `system_decks.json`:**
```json
{
  "id": "sys_n5_kanji_01",
  "title": "Luyện viết Kanji Cơ bản 1",
  "type": "minigame_kanji",
  "level": "N5"
  // KHÔNG CÒN trường "kanjiList" ở đây nữa!
}
```

**File dữ liệu riêng (`public/data/n5/sys_n5_kanji_01.json`):**
```json
[
  { "char": "一", "meaning": "Số một" },
  { "char": "二", "meaning": "Số hai" },
  { "char": "三", "meaning": "Số ba" }
]
```

**Luồng xử lý (Logic):**
Khi mở Minigame, hệ thống nhận diện `type === "minigame_kanji"`, nó sẽ trực tiếp fetch file `/data/n5/sys_n5_kanji_01.json` và truyền thẳng mảng này vào component `KanjiDojoGame`.

---

## 🚀 CÁC BƯỚC TRIỂN KHAI (ROADMAP THỰC TẾ)

**[ ] Bước 1: Dọn dẹp `system_decks.json`**
- Xóa thuộc tính `kanjiList` khỏi tất cả các Node `minigame_kanji`.
- Thêm thuộc tính `targetDeckIds` vào các Node `minigame_matching` và `minigame_rush`, trỏ về ID của 2-3 bài học đứng ngay trước nó.

**[ ] Bước 2: Tạo các file Data Rời**
- Dựa vào data vừa xóa, tạo file mới (VD: `public/data/n5/sys_n5_kanji_01.json`) chứa mảng Kanji.

**[ ] Bước 3: Cập nhật hàm Fetch Data (`src/app/page.tsx`)**
- Chỉnh sửa lại hàm `fetchMinigameCards` bên trong `useEffect`:
  - `if (type === 'minigame_kanji')`: Fetch `[id].json`.
  - `if (type === 'minigame_matching' || 'minigame_rush')`: Map qua `targetDeckIds`, gọi `Promise.all` để fetch nhiều file cùng lúc, gộp mảng và `setCards`.

*Tài liệu này sẽ được dùng làm chuẩn để triển khai mã nguồn.*
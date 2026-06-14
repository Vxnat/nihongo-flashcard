# 🎮 KIẾN TRÚC HỆ THỐNG GAMIFICATION (ROADMAP + DAILY QUEST + GACHA)

**Ngữ cảnh (Context):** 
Dự án là một ứng dụng học Flashcard tiếng Nhật bằng Next.js (React), TailwindCSS, Zustand và Firebase. 
Mục tiêu của tài liệu này là hướng dẫn AI lập trình hệ thống Gamification bao gồm: 
1. Bản đồ lộ trình học (Roadmap) giống Duolingo.
2. Hệ thống nhiệm vụ hàng ngày (Daily Quests) để kiếm Xu.
3. Cửa hàng Gacha quay trứng sưu tầm Sticker.

---

## 🧠 PHẦN 1: CẤU TRÚC DỮ LIỆU (DATA SCHEMA)

### 1. Dữ liệu Bộ bài Hệ thống (Local JSON)
Nằm tại: `public/data/system_decks.json`.
Đây là danh sách tĩnh các bài học hệ thống. Người dùng bắt buộc phải học theo thứ tự dựa vào `prerequisite`.
```json
[
  {
    "id": "sys_n5_01",
    "title": "Bảng chữ cái Hiragana",
    "level": "N5",
    "chapter": 1,
    "order": 1,
    "prerequisite": null,
    "rewardCoins": 5,
    "cards": [] 
  },
  {
    "id": "sys_n5_02",
    "title": "Số đếm & Thời gian",
    "level": "N5",
    "chapter": 1,
    "order": 2,
    "prerequisite": "sys_n5_01",
    "rewardCoins": 3,
    "cards": []
  }
]
```

### 2. Trạng thái Người Dùng (Zustand + Firestore `user_stats`)
Nằm tại: `src/store/useAppStore.ts`.
Biến `userStats` lưu trữ toàn bộ tiền tệ và tiến trình nhiệm vụ.
```typescript
interface UserStats {
  // ... (các thông kê cũ: streak, learningTimeToday...)
  
  // Tiền tệ & Túi đồ
  coins: number;
  inventory: string[]; // Mảng chứa ID Sticker đã sở hữu
  equippedSticker: string | null;
  
  // Nhiệm vụ
  dailyQuests: {
    date: string; // Ngày lưu quest (YYYY-MM-DD), nếu qua ngày thì reset
    quests: DailyQuest[];
  };
}

interface DailyQuest {
  id: string; // "q_time", "q_flip", "q_combo"
  title: string;
  target: number;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  reward: number; // Xu nhận được
}
```

### 3. Dữ liệu Gacha Pool (Static Constants)
Nằm tại: `src/constants/gachaPool.ts`.
Danh sách phần thưởng tĩnh.
```typescript
export const GACHA_POOL = [
  { id: "stk_shiba_01", name: "Shiba Lười Biếng", imageUrl: "/stickers/shiba_01.png", rarity: "common" },
  { id: "stk_cat_ninja", name: "Ninja Mèo", imageUrl: "/stickers/cat_ninja.png", rarity: "epic" }
];
```

---

## 🚀 PHẦN 2: LUỒNG THỰC THI (IMPLEMENTATION FLOW)

*(AI đọc phần này để lập trình theo từng bước)*

### Bước 1: UI Cập nhật tiến độ Nhiệm vụ (Daily Quests Modal)
- **Component cần tạo:** `DailyQuestsModal.tsx` hoặc tích hợp vào một Drawer thả xuống.
- **Logic:** Render danh sách `useAppStore((state) => state.userStats.dailyQuests.quests)`.
- Mỗi quest render thanh Progress Bar `(progress / target) * 100`.
- Trạng thái nút:
  - Nếu `!isCompleted`: Nút xám "Đang làm...".
  - Nếu `isCompleted && !isClaimed`: Nút vàng nhấp nháy "Nhận X xu" -> Gọi hàm `claimQuestReward(questId)`.
  - Nếu `isClaimed`: Nút check xanh "Đã nhận".

### Bước 2: Kích hoạt tăng tiến độ ngầm (Auto-Questing)
- **Quest Học 5 phút (`q_time`):** Tự động tăng trong `useAppStore.ts` hàm `addLearningTime()`.
- **Quest Lật 50 thẻ (`q_flip`):** Tự động tăng trong `useAppStore.ts` hàm `recordAction()`.
- **Quest Đạt Combo (`q_combo`):** 
  - File: `src/hooks/useFlashcardDeck.ts`.
  - Logic: Khi `comboCount` đếm lên, gọi `updateQuestProgress("q_combo", comboCount, true)` (Cập nhật theo absolute max value).

### Bước 3: Giao diện Bản đồ Hệ thống (Roadmap UI)
- **Vị trí:** Tab "🗺️ Hành trình" tại `src/app/page.tsx`.
- **Component cần tạo:** `SystemRoadmap.tsx`.
- **Logic Render:**
  - Đọc data từ `/data/system_decks.json`.
  - Đọc `progress` từ Zustand để xác định trạng thái của Deck.
  - **Logic Khóa (Lock):** Một Deck chỉ mở khi `prerequisite === null` HOẶC `progress[prerequisite]` đạt 100% (learnedCardsCount === totalOriginalCards).
  - **CSS:** Render các Deck theo hình Zig-Zag dọc (dùng Flex-col, xen kẽ margin trái/phải hoặc chẵn/lẻ).
  - Giữa các điểm (Nodes), vẽ đường nối SVG đứt nét.
  - Nút Play: Bấm vào một Node đã mở sẽ chuyển hướng sang `router.push("/deck/sys_xxx")`.

### Bước 4: Màn hình Gacha (Gacha Machine)
- **Vị trí:** Có thể làm 1 Route riêng `/gacha` hoặc 1 Full-screen Modal.
- **UI:**
  - Hiển thị số Xu hiện tại: `🪙 {coins}`.
  - Nút to giữa màn hình: "Vặn Trứng (10 Xu)".
- **Logic:**
  - Bấm nút -> Gọi `deductCoins(10)`. Nếu true -> Tiếp tục.
  - Random 1 item trong `GACHA_POOL`. (Nâng cao: Tính xác suất Rarity).
  - Chạy Animation Rung lắc -> Pháo giấy `canvas-confetti` -> Rớt ra hình ảnh Sticker.
  - Gọi `unlockSticker(sticker.id)` để lưu vào Firestore/Zustand.

### Bước 5: Cập nhật UI Profile
- Góc trên cùng bên phải (`AuthButton.tsx`): 
  - Hiển thị nhỏ số Xu hiện có.
  - Hiển thị Sticker đang gắn (`equippedSticker`) đè lên mép Avatar.
- Nơi thay Sticker: Có thể làm một nút nhỏ "Tủ đồ" ở mục Settings hoặc ngay trong trang Gacha.

---

## 🛑 CÁC LƯU Ý KỸ THUẬT CHO AI CODE (RULES)
1. **Zustand State Mutation:** Luôn luôn dùng Spread Operator (`...`) khi update `userStats` để không làm mất các trường cũ.
2. **Firestore Sync:** Mọi thay đổi của Tiền và Quest phải được gọi ngầm `setDoc(..., {merge: true})` lên Firestore nếu `user` tồn tại.
3. **UI/UX:** Phong cách kẹo dẻo (Gummy/Pastel), bo góc lớn `rounded-[2rem]`, sử dụng `framer-motion` cho mọi tương tác nhấp nháy, trượt, pop-up.
4. **Responsive:** Bản đồ Roadmap phải trông gọn gàng trên màn hình điện thoại (mobile-first).
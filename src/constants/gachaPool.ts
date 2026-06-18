export type GachaRarity = "common" | "rare" | "epic" | "legendary" | "mythic" | "divine";
export type GachaItemType = "sticker" | "theme" | "outfit" | "furniture";

export interface GachaItem {
  id: string;
  type: GachaItemType;
  name: string;
  description: string;
  rarity: GachaRarity;
  emoji?: string; // Giữ lại emoji như một placeholder/icon nhanh cho UI
  shardTarget: number;
}

// Cấu hình Tỷ lệ rớt (Rate) và Mảnh ghép (Shards)
export const RARITY_CONFIG: Record<GachaRarity, { dropRate: number; shardTarget: number; dropFullRate: number }> = {
  common: { dropRate: 60, shardTarget: 2, dropFullRate: 0.3 },     // 30% trong số 60% sẽ rớt nguyên bản
  rare: { dropRate: 24, shardTarget: 3, dropFullRate: 0.15 },      // 15% trong số 24% sẽ rớt nguyên bản
  epic: { dropRate: 10, shardTarget: 5, dropFullRate: 0.05 },      // 5% rớt nguyên bản
  legendary: { dropRate: 4.9, shardTarget: 10, dropFullRate: 0.01 }, // 1% rớt nguyên bản
  mythic: { dropRate: 1, shardTarget: 20, dropFullRate: 0.005 },   // 0.5% rớt nguyên bản
  divine: { dropRate: 0.1, shardTarget: 50, dropFullRate: 0.001 }, // 0.1% rớt nguyên bản (phép màu)
};

export const GACHA_POOL: GachaItem[] = [
  // --- 1. STICKERS ---
  { id: "stk_shiba", type: "sticker", name: "Shiba Lười Biếng", description: "Bé Shiba đang nằm ườn.", emoji: "🐕", rarity: "common", shardTarget: RARITY_CONFIG.common.shardTarget },
  { id: "stk_sakura", type: "sticker", name: "Hoa Anh Đào", description: "Cánh hoa rơi rụng lả tả.", emoji: "🌸", rarity: "common", shardTarget: RARITY_CONFIG.common.shardTarget },
  { id: "stk_onigiri", type: "sticker", name: "Cơm Nắm Cute", description: "Cơm nắm nhân cá hồi thơm ngon.", emoji: "🍙", rarity: "common", shardTarget: RARITY_CONFIG.common.shardTarget },
  { id: "stk_matcha", type: "sticker", name: "Trà Xanh Matcha", description: "Ly trà xanh Nhật Bản nóng hổi.", emoji: "🍵", rarity: "common", shardTarget: RARITY_CONFIG.common.shardTarget },
  { id: "stk_daruma", type: "sticker", name: "Daruma May Mắn", description: "Búp bê Daruma cầu may đỏ rực.", emoji: "🎎", rarity: "rare", shardTarget: RARITY_CONFIG.rare.shardTarget },
  // --- 2. ĐỒ NỘI THẤT (FURNITURE) ---
  { id: "fur_cushion", type: "furniture", name: "Nệm Zabuton", description: "Nệm ngồi êm ái phong cách Nhật.", emoji: "🧎", rarity: "common", shardTarget: RARITY_CONFIG.common.shardTarget },
  { id: "fur_bonsai", type: "furniture", name: "Bonsai Mini", description: "Chậu cây nhỏ nhắn đặt trên bàn.", emoji: "🪴", rarity: "rare", shardTarget: RARITY_CONFIG.rare.shardTarget },
  { id: "fur_lantern", type: "furniture", name: "Đèn Lồng Đỏ", description: "Đèn lồng truyền thống thắp sáng trong đêm.", emoji: "🏮", rarity: "rare", shardTarget: RARITY_CONFIG.rare.shardTarget },
  { id: "fur_kotatsu", type: "furniture", name: "Bàn Kotatsu", description: "Bàn sưởi có chăn ấm áp cho mùa đông.", emoji: "🪑", rarity: "epic", shardTarget: RARITY_CONFIG.epic.shardTarget },
  { id: "fur_maneki", type: "furniture", name: "Mèo Thần Tài", description: "Bức tượng vẫy gọi khách hàng và may mắn.", emoji: "🐱", rarity: "epic", shardTarget: RARITY_CONFIG.epic.shardTarget },
  // --- 3. THỜI TRANG SHIBA (OUTFITS) ---
  { id: "out_scarf", type: "outfit", name: "Khăn Quàng Đỏ", description: "Khăn quàng ấm áp cho Shiba.", emoji: "🧣", rarity: "rare", shardTarget: RARITY_CONFIG.rare.shardTarget },
  { id: "out_frog_hat", type: "outfit", name: "Mũ Ếch Xanh", description: "Chiếc mũ dễ thương kêu ộp ộp.", emoji: "🐸", rarity: "epic", shardTarget: RARITY_CONFIG.epic.shardTarget },
  { id: "out_ninja", type: "outfit", name: "Đồ Ninja", description: "Trang phục hành tung bí ẩn.", emoji: "🥷", rarity: "legendary", shardTarget: RARITY_CONFIG.legendary.shardTarget },
  // --- 4. CHỦ ĐỀ APP (THEMES) ---
  { id: "thm_sakura", type: "theme", name: "Gói Sakura", description: "Đổi màu toàn bộ ứng dụng sang Hồng Phấn.", emoji: "🌸", rarity: "legendary", shardTarget: RARITY_CONFIG.legendary.shardTarget },
  { id: "thm_night", type: "theme", name: "Gói Lofi Night", description: "Dark mode với ánh đèn mờ ảo và nhạc lo-fi.", emoji: "🌙", rarity: "mythic", shardTarget: RARITY_CONFIG.mythic.shardTarget },
  { id: "thm_divine_shiba", type: "theme", name: "Thần Khuyển Tôn Cực", description: "Chủ đề huyền thoại với hiệu ứng Vàng lấp lánh.", emoji: "✨", rarity: "divine", shardTarget: RARITY_CONFIG.divine.shardTarget },
];

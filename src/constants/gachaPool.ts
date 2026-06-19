export type GachaRarity = "common" | "rare" | "epic" | "legendary" | "mythic" | "divine";
export type GachaItemType = "sticker" | "theme" | "outfit" | "furniture" | "meme" | "voice";

export interface GachaItem {
  id: string;
  type: GachaItemType;
  name: string;
  description: string;
  rarity: GachaRarity;
  imageUrl: string; // Path to item image asset
  shardTarget: number;
  japanesePoint?: {       // Cho loại meme
    word: string;
    meaning: string;
    grammarNote: string;
  };
  audioUrl?: string;      // Cho loại voice
  bonesPerHour?: number;  // Cho loại furniture để tự động sinh xương
  hpBonus?: number;       // RPG Stat: Lượng máu cộng thêm
  atkBonus?: number;      // RPG Stat: Sức công kích cộng thêm
  defBonus?: number;      // RPG Stat: Phòng thủ cộng thêm
  critBonus?: number;     // RPG Stat: Tỷ lệ chí mạng (%) cộng thêm
  rpgSlot?: "head" | "armor" | "earring" | "gloves" | "mount" | "aura"; // RPG Slot: Vị trí trang bị trên nhân vật
}

export interface MemeItem extends GachaItem {
  type: "meme";
  imageUrl: string;
  japanesePoint: {
    word: string;
    meaning: string;
    grammarNote: string;
  };
}


// Cấu hình Tỷ lệ rớt (Rate) và Mảnh ghép (Shards)
export const RARITY_CONFIG: Record<
  GachaRarity,
  {
    dropRate: number;
    shardTarget: number;
    dropFullRate: number;
    color: string;
    bgColor: string;
    glowColor: string;
    textColor: string;
  }
> = {
  common: {
    dropRate: 60,
    shardTarget: 2,
    dropFullRate: 0.3,
    color: "#A1A1AA", // zinc-400
    bgColor: "#F4F4F5", // zinc-100
    glowColor: "rgba(161, 161, 170, 0.3)",
    textColor: "#3F3F46", // zinc-700
  },
  rare: {
    dropRate: 24,
    shardTarget: 3,
    dropFullRate: 0.15,
    color: "#60A5FA", // blue-400
    bgColor: "#EFF6FF", // blue-50
    glowColor: "rgba(96, 165, 250, 0.4)",
    textColor: "#1D4ED8", // blue-700
  },
  epic: {
    dropRate: 10,
    shardTarget: 5,
    dropFullRate: 0.05,
    color: "#A78BFA", // purple-400
    bgColor: "#F5F3FF", // purple-50
    glowColor: "rgba(167, 139, 250, 0.5)",
    textColor: "#5B21B6", // purple-800
  },
  legendary: {
    dropRate: 4.9,
    shardTarget: 10,
    dropFullRate: 0.01,
    color: "#FBBF24", // amber-400
    bgColor: "#FFFBEB", // amber-50
    glowColor: "rgba(251, 191, 36, 0.6)",
    textColor: "#78350F", // amber-900
  },
  mythic: {
    dropRate: 1,
    shardTarget: 20,
    dropFullRate: 0.005,
    color: "#F43F5E", // rose-500
    bgColor: "#FFF1F2", // rose-50
    glowColor: "rgba(244, 63, 94, 0.7)",
    textColor: "#881337", // rose-900
  },
  divine: {
    dropRate: 0.1,
    shardTarget: 50,
    dropFullRate: 0.001,
    color: "#EC4899", // pink-500
    bgColor: "linear-gradient(135deg, #FFF1F2, #FDF4FF, #F0F9FF)", // gradient
    glowColor: "rgba(236, 72, 153, 0.8)",
    textColor: "#831843", // pink-900
  },
};

export const DUPLICATE_FUR_VALUES: Record<GachaRarity, number> = {
  common: 1,
  rare: 5,
  epic: 20,
  legendary: 100,
  mythic: 500,
  divine: 2000,
};

export const GACHA_POOL: GachaItem[] = [
  // --- 1. STICKERS ---
  { id: "stk_shiba", type: "sticker", name: "Shiba Lười Biếng", description: "Bé Shiba đang nằm ườn.", imageUrl: "/images/stickers/stk_shiba.svg", rarity: "common", shardTarget: RARITY_CONFIG.common.shardTarget, hpBonus: 30, rpgSlot: "earring" },
  { id: "stk_sakura", type: "sticker", name: "Hoa Anh Đào", description: "Cánh hoa rơi rụng lả tả.", imageUrl: "/images/stickers/stk_sakura.svg", rarity: "common", shardTarget: RARITY_CONFIG.common.shardTarget, critBonus: 5, rpgSlot: "aura" },
  { id: "stk_onigiri", type: "sticker", name: "Cơm Nắm Cute", description: "Cơm nắm nhân cá hồi thơm ngon.", imageUrl: "/images/stickers/stk_onigiri.svg", rarity: "common", shardTarget: RARITY_CONFIG.common.shardTarget, atkBonus: 10, rpgSlot: "gloves" },
  { id: "stk_matcha", type: "sticker", name: "Trà Xanh Matcha", description: "Ly trà xanh Nhật Bản nóng hổi.", imageUrl: "/images/stickers/stk_matcha.svg", rarity: "common", shardTarget: RARITY_CONFIG.common.shardTarget, defBonus: 10, rpgSlot: "gloves" },
  { id: "stk_daruma", type: "sticker", name: "Daruma May Mắn", description: "Búp bê Daruma cầu may đỏ rực.", imageUrl: "/images/stickers/stk_daruma.svg", rarity: "rare", shardTarget: RARITY_CONFIG.rare.shardTarget, atkBonus: 15, critBonus: 5, rpgSlot: "mount" },
  // --- 2. ĐỒ NỘI THẤT (FURNITURE) ---
  { id: "fur_cushion", type: "furniture", name: "Nệm Zabuton", description: "Nệm ngồi êm ái phong cách Nhật.", imageUrl: "/images/decorations/decoration_1.gif", rarity: "common", shardTarget: RARITY_CONFIG.common.shardTarget, bonesPerHour: 0 },
  { id: "fur_bonsai", type: "furniture", name: "Bonsai Mini", description: "Chậu cây nhỏ nhắn đặt trên bàn.", imageUrl: "/images/decorations/decoration_2.gif", rarity: "rare", shardTarget: RARITY_CONFIG.rare.shardTarget, bonesPerHour: 1 },
  { id: "fur_lantern", type: "furniture", name: "Đèn Lồng Đỏ", description: "Đèn lồng truyền thống thắp sáng trong đêm.", imageUrl: "/images/decorations/decoration_3.gif", rarity: "rare", shardTarget: RARITY_CONFIG.rare.shardTarget, bonesPerHour: 1 },
  { id: "fur_kotatsu", type: "furniture", name: "Bàn Kotatsu", description: "Bàn sưởi có chăn ấm áp cho mùa đông.", imageUrl: "/images/decorations/decoration_4.gif", rarity: "epic", shardTarget: RARITY_CONFIG.epic.shardTarget, bonesPerHour: 3 },
  { id: "fur_maneki", type: "furniture", name: "Mèo Thần Tài", description: "Bức tượng vẫy gọi khách hàng và may mắn.", imageUrl: "/images/decorations/decoration_5.gif", rarity: "epic", shardTarget: RARITY_CONFIG.epic.shardTarget, bonesPerHour: 3 },
  // --- 3. THỜI TRANG SHIBA (OUTFITS) ---
  { id: "out_scarf", type: "outfit", name: "Khăn Quàng Đỏ", description: "Khăn quàng ấm áp cho Shiba.", imageUrl: "/images/outfits/out_scarf.svg", rarity: "rare", shardTarget: RARITY_CONFIG.rare.shardTarget, hpBonus: 25, defBonus: 5, rpgSlot: "armor" },
  { id: "out_frog_hat", type: "outfit", name: "Mũ Ếch Xanh", description: "Chiếc mũ dễ thương kêu ộp ộp.", imageUrl: "/images/outfits/out_frog_hat.svg", rarity: "epic", shardTarget: RARITY_CONFIG.epic.shardTarget, defBonus: 15, rpgSlot: "head" },
  { id: "out_ninja", type: "outfit", name: "Đồ Ninja", description: "Trang phục hành tung bí ẩn.", imageUrl: "/images/outfits/out_ninja.svg", rarity: "legendary", shardTarget: RARITY_CONFIG.legendary.shardTarget, atkBonus: 30, defBonus: 10, rpgSlot: "armor" },
  // --- 4. CHỦ ĐỀ APP (THEMES) ---
  { id: "thm_sakura", type: "theme", name: "Gói Sakura", description: "Đổi màu toàn bộ ứng dụng sang Hồng Phấn.", imageUrl: "/images/themes/thm_sakura.svg", rarity: "legendary", shardTarget: RARITY_CONFIG.legendary.shardTarget },
  { id: "thm_night", type: "theme", name: "Gói Lofi Night", description: "Dark mode với ánh đèn mờ ảo và nhạc lo-fi.", imageUrl: "/images/themes/thm_night.svg", rarity: "mythic", shardTarget: RARITY_CONFIG.mythic.shardTarget },
  { id: "thm_divine_shiba", type: "theme", name: "Thần Khuyển Tôn Cực", description: "Chủ đề huyền thoại với hiệu ứng Vàng lấp lánh.", imageUrl: "/images/themes/thm_divine_shiba.svg", rarity: "divine", shardTarget: RARITY_CONFIG.divine.shardTarget },

  // --- 5. MEMES ---
  {
    id: "mem_nihongo_jouzu",
    type: "meme",
    name: "Nihongo Jouzu",
    description: "Meme về lời khen xã giao huyền thoại của người Nhật.",
    imageUrl: "/images/memes/nihongo_jouzu.png",
    rarity: "common",
    shardTarget: RARITY_CONFIG.common.shardTarget,
    japanesePoint: {
      word: "日本語が上手ですね！",
      meaning: "Tiếng Nhật của bạn giỏi quá nhỉ!",
      grammarNote: "Lời khen xã giao kinh điển của người Nhật khi thấy người nước ngoài nói tiếng Nhật. Phản xạ khiêm tốn chuẩn là: 'Iie, mada mada desu' (Dạ chưa đâu, tôi còn kém lắm)."
    }
  },
  {
    id: "mem_kanji_pain",
    type: "meme",
    name: "Cơn đau Kanji",
    description: "Khi bạn cố gắng ghi nhớ nét viết của chữ Hán.",
    imageUrl: "/images/memes/kanji_pain.png",
    rarity: "rare",
    shardTarget: RARITY_CONFIG.rare.shardTarget,
    japanesePoint: {
      word: "漢字 (Kanji)",
      meaning: "Chữ Hán tượng hình",
      grammarNote: "Hệ thống chữ tượng hình mượn từ chữ Hán. Một chữ thường có cách đọc Onyomi (âm Hán) và Kunyomi (âm Nhật). Hãy kiên trì học theo bộ thủ nhé!"
    }
  },
  {
    id: "mem_wa_ga",
    type: "meme",
    name: "Hố đen Wa vs Ga",
    description: "Sự bối rối tột độ khi phân biệt trợ từ は và が.",
    imageUrl: "/images/memes/wa_ga.png",
    rarity: "epic",
    shardTarget: RARITY_CONFIG.epic.shardTarget,
    japanesePoint: {
      word: "助詞 (Joshi)",
      meaning: "Trợ từ trong tiếng Nhật",
      grammarNote: "Trợ từ は (wa) dùng để chỉ chủ đề (nhấn mạnh vế sau), còn が (ga) chỉ chủ ngữ chính của hành động (nhấn mạnh danh từ đứng trước). Đây là ngữ pháp gây lú bậc nhất!"
    }
  },

  // --- 6. VOICE PACKS ---
  {
    id: "voc_shiba",
    type: "voice",
    name: "Bạn đồng hành Shiba",
    description: "Mở khóa gói âm thanh Shiba cổ vũ bạn khi lật thẻ học tập.",
    imageUrl: "/images/voices/voc_shiba.svg",
    rarity: "rare",
    shardTarget: RARITY_CONFIG.rare.shardTarget,
    audioUrl: "/audio/voices/shiba_correct.mp3"
  },

  // --- 7. EXCLUSIVE SHOP ITEMS ---
  {
    id: "fur_fuji_paint",
    type: "furniture",
    name: "Tranh Cổ Phú Sĩ",
    description: "Bức tranh cổ kính vẽ núi Phú Sĩ tuyết phủ trắng xóa.",
    imageUrl: "/images/decorations/decoration_fuji.png",
    rarity: "legendary",
    shardTarget: 1,
    bonesPerHour: 4
  },
  {
    id: "voc_tsundere",
    type: "voice",
    name: "Giọng Seiyuu Kiêu Kỳ",
    description: "Mở khóa giọng nói Tsundere cổ vũ bạn học tập.",
    imageUrl: "/images/voices/voc_tsundere.png",
    rarity: "mythic",
    shardTarget: 1,
    audioUrl: "/audio/voices/tsundere.mp3"
  },
  {
    id: "out_samurai_helmet",
    type: "outfit",
    name: "Mũ Samurai",
    description: "Mũ Samurai truyền thống oai dũng cho Shiba.",
    imageUrl: "/images/outfits/out_samurai.png",
    rarity: "legendary",
    shardTarget: 1,
    rpgSlot: "head",
    defBonus: 20,
    atkBonus: 5
  },
];

export type GachaRarity = "common" | "rare" | "epic" | "legendary" | "mythic" | "divine";
export type GachaItemType = "accessory" | "theme" | "outfit" | "furniture" | "meme" | "voice" | "costume";

export interface GachaItem {
  id: string;
  type: GachaItemType;
  name: string;
  description: string;
  rarity: GachaRarity;
  imageUrl: string; // Path to item image asset
  avatarUrl?: string; // Full character skin/costume image path
  booster?: string; // Learning booster/bonus (e.g. coin_boost_10)
  animation?: "none" | "pulse" | "float" | "spin"; // Dynamic animation style for layers
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
  rpgSlot?: "head" | "armor" | "earring" | "gloves" | "mount" | "aura"; // RPG Slot: Vị trí trang bị thực tế trên nhân vật (khớp với store)
  // Cấu hình linh hoạt cho đồ trang trí để tránh fix cứng trong code
  furnitureSlot?: "wall" | "corner" | "floor";
  roomStyle?: Record<string, string | number>;
  gardenStyle?: Record<string, string | number>;
  gardenImgStyle?: Record<string, string | number>;
  pedestalType?: "stone" | "wood" | "hanger";
  shibaMascotStyle?: Record<string, string | number>;
  shardPrice?: number;
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



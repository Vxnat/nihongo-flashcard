import { toast } from "react-hot-toast";
import { UserStats, DailyQuest } from "./types";

export const DEFAULT_QUESTS: DailyQuest[] = [
  {
    id: "q_time",
    title: "Học 5 phút",
    target: 300,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    reward: 1,
  },
  {
    id: "q_flip",
    title: "Lật 10 thẻ bài",
    target: 10,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    reward: 2,
  },
  {
    id: "q_combo",
    title: "Đạt Combo x5",
    target: 5,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    reward: 2,
  },
];

/**
 * Hàm phụ trợ dùng chung để phân bổ phần thưởng (Coins, EXP, Golden Fur, Items)
 * và tự động thực hiện thăng cấp (Level Up) khi điểm kinh nghiệm tích lũy vượt ngưỡng.
 */
export const applyRewards = (stats: UserStats, rewards: any): UserStats => {
  if (!rewards) return stats;
  const newStats = { ...stats };

  // 1. Cộng xu (Coins)
  if (rewards.coins) {
    newStats.coins = (newStats.coins || 0) + rewards.coins;
  }

  // 2. Cộng lông vàng (Golden Fur)
  if (rewards.goldenFur) {
    newStats.goldenFur = (newStats.goldenFur || 0) + rewards.goldenFur;
  }

  // 3. Thêm vật phẩm vào hành trang (Inventory)
  if (rewards.items && Array.isArray(rewards.items)) {
    const currentInventory = newStats.inventory || [];
    newStats.inventory = [...currentInventory, ...rewards.items];
  }

  // 4. Cộng điểm EXP & Tính toán thăng cấp (Level Up)
  if (rewards.exp) {
    let currentExp = (newStats.exp || 0) + rewards.exp;
    let currentLevel = newStats.level || 1;
    let maxExp = Math.round(100 * Math.pow(currentLevel, 1.3));

    while (currentExp >= maxExp) {
      currentExp -= maxExp;
      currentLevel += 1;
      maxExp = Math.round(100 * Math.pow(currentLevel, 1.3));

      // Thưởng thăng cấp: Level * 50 Coins
      newStats.coins = (newStats.coins || 0) + currentLevel * 50;

      // Hiển thị thông báo thăng cấp đẹp mắt
      toast.success(`Chúc mừng! Bạn đã thăng cấp lên Level ${currentLevel}!`, {
        duration: 4000,
      });
    }

    newStats.exp = currentExp;
    newStats.level = currentLevel;
  }

  return newStats;
};

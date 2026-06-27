import { StateCreator } from "zustand";
import { AppState, GachaQuestSlice } from "../types";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { applyRewards, DEFAULT_QUESTS } from "../helpers";
import { SHARD_PRICES } from "@/constants/shopItems";
import { toast } from "react-hot-toast";

/**
 * Slice quản lý các sự kiện game hóa (Gamification):
 * Nhiệm vụ ngày (Daily Quests), Quay Gacha (Gacha Rolls), Cửa hàng đổi mảnh/vật phẩm,
 * và các thiết lập tương tác trong phòng Shiba Room (Thu hoạch xương, Trang bị nội thất/trang phục).
 */
export const createGachaQuestSlice: StateCreator<
  AppState,
  [],
  [],
  GachaQuestSlice
> = (set, get) => ({
  activeStoryId: null,
  activeMinigameId: null,
  activeKanjiPracticeDeck: null,
  activeBossRPGId: null,
  shibaSessionHP: 100,
  shibaSessionShield: 0,
  shibaSessionBuffs: [],
  miniMapProgress: [],

  setActiveStoryId: (id) => set({ activeStoryId: id }),
  setActiveMinigameId: (id) => set({ activeMinigameId: id }),
  setActiveKanjiPracticeDeck: (deck) => set({ activeKanjiPracticeDeck: deck }),
  setActiveBossRPGId: (id) => set({ activeBossRPGId: id }),
  setShibaSessionHP: (hp) => set({ shibaSessionHP: hp }),
  setShibaSessionShield: (shield) => set({ shibaSessionShield: shield }),
  setShibaSessionBuffs: (buffs) => set({ shibaSessionBuffs: buffs }),
  setMiniMapProgress: (progress) => set({ miniMapProgress: progress }),
  resetMiniMapSession: () => set({ 
    shibaSessionHP: 100, 
    shibaSessionShield: 0, 
    shibaSessionBuffs: [], 
    miniMapProgress: [] 
  }),

  updateQuestProgress: async (questId, value, isAbsolute = false) => {
    const state = get();
    const today = new Date().toLocaleDateString("en-CA");

    let currentQuests = state.userStats.dailyQuests.quests;
    if (state.userStats.dailyQuests.date !== today) {
      // Khi qua ngày mới mid-session, chọn ngẫu nhiên 1 nhiệm vụ mới từ DB (dailyQuestsConfig)
      const pool = state.dailyQuestsConfig.length > 0 ? state.dailyQuestsConfig : DEFAULT_QUESTS;
      
      // Áp dụng thuật toán băm chuỗi (string hashing) để tạo số ngẫu nhiên đồng bộ (deterministic random).
      // Việc băm chuỗi ngày "today" đảm bảo tất cả các lần gọi hoặc F5 trang trong cùng ngày 
      // đều tính toán ra duy nhất một mã băm cố định, tránh đổi nhiệm vụ ngẫu nhiên liên tục.
      let hash = 0;
      for (let i = 0; i < today.length; i++) {
        // charCodeAt(i) trả về mã ASCII của ký tự thứ i.
        // Phép toán (hash << 5) - hash (thuật toán DJB2) giúp xáo trộn bit để tạo phân phối phân tán đều.
        hash = today.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      // Lấy phần dư với độ dài danh sách để quy đổi mã băm thành chỉ mục (index) hợp lệ trong pool
      const selectedIdx = Math.abs(hash) % pool.length;
      const selectedQuest = {
        ...pool[selectedIdx],
        progress: 0,
        isCompleted: false,
        isClaimed: false,
      };
      currentQuests = [selectedQuest];
    }

    let isChanged = false;
    const updatedQuests = currentQuests.map((q) => {
      if (q.id === questId && !q.isCompleted) {
        const newProgress = isAbsolute
          ? Math.max(q.progress, value) // Lấy giá trị lớn nhất giữa tiến độ cũ và giá trị mới gửi lên 
          : q.progress + value; // Cộng dồn giá trị mới vào tiến độ cũ
        const boundedProgress = Math.min(newProgress, q.target);

        if (boundedProgress !== q.progress) {
          isChanged = true;
        }
        return {
          ...q,
          progress: boundedProgress,
          isCompleted: boundedProgress >= q.target,
        };
      }
      return q;
    });

    if (!isChanged) return;

    const newDailyQuests = { date: today, quests: updatedQuests };
    const newUserStats = { ...state.userStats, dailyQuests: newDailyQuests };

    set({ userStats: newUserStats });

    const uid = get().user?.uid;
    if (uid) {
      try {
        await setDoc(
          doc(db, "user_stats", uid),
          { dailyQuests: newDailyQuests },
          { merge: true }
        );
      } catch (error) {
        console.error("Lỗi updateQuestProgress:", error);
      }
    }
  },

  claimQuestReward: async (questId) => {
    const state = get();
    let hasClaimed = false;
    let rewards: any = null;

    const updatedQuests = state.userStats.dailyQuests.quests.map((q) => {
      if (q.id === questId && q.isCompleted && !q.isClaimed) {
        hasClaimed = true;
        rewards = q.rewards || { coins: q.reward || 0, exp: 50 };
        return { ...q, isClaimed: true };
      }
      return q;
    });

    if (!hasClaimed) return;

    const newDailyQuests = {
      date: state.userStats.dailyQuests.date,
      quests: updatedQuests,
    };

    let newUserStats = applyRewards(state.userStats, rewards);
    newUserStats = { ...newUserStats, dailyQuests: newDailyQuests };

    set({ userStats: newUserStats });

    const uid = get().user?.uid;
    if (uid) {
      try {
        await setDoc(
          doc(db, "user_stats", uid),
          {
            coins: newUserStats.coins,
            inventory: newUserStats.inventory,
            level: newUserStats.level,
            exp: newUserStats.exp,
            goldenFur: newUserStats.goldenFur,
            dailyQuests: newDailyQuests,
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Lỗi claimQuestReward:", error);
      }
    }
  },

  deductCoins: async (amount) => {
    const state = get();
    if (state.userStats.coins >= amount) {
      const newCoins = state.userStats.coins - amount;
      const newUserStats = { ...state.userStats, coins: newCoins };
      set({ userStats: newUserStats });

      const uid = get().user?.uid;
      if (uid) {
        setDoc(
          doc(db, "user_stats", uid),
          { coins: newCoins },
          { merge: true }
        ).catch((error) => console.error("Lỗi deductCoins:", error));
      }
      return true;
    }
    return false;
  },

  deductGoldenFur: async (amount) => {
    const state = get();
    const goldenFur = state.userStats.goldenFur || 0;
    if (goldenFur >= amount) {
      const newGoldenFur = goldenFur - amount;
      const newUserStats = { ...state.userStats, goldenFur: newGoldenFur };
      set({ userStats: newUserStats });

      const uid = get().user?.uid;
      if (uid) {
        setDoc(
          doc(db, "user_stats", uid),
          { goldenFur: newGoldenFur },
          { merge: true }
        ).catch((error) => console.error("Lỗi deductGoldenFur:", error));
      }
      return true;
    }
    return false;
  },

  addCoins: async (amount) => {
    const state = get();
    const newCoins = state.userStats.coins + amount;
    const newUserStats = { ...state.userStats, coins: newCoins };
    set({ userStats: newUserStats });

    const uid = get().user?.uid;
    if (uid) {
      try {
        await setDoc(
          doc(db, "user_stats", uid),
          { coins: newCoins },
          { merge: true }
        );
      } catch (error) {
        console.error("Lỗi addCoins:", error);
      }
    }
  },

  processGachaRoll: async (item, isFullItem, duplicateFur, newPity) => {
    const results = await get().processGachaRollsBatch(
      [{ item, isFullItem, duplicateFur }],
      newPity
    );
    return results[0] || { unlocked: false, shardsNow: 0 };
  },

  processGachaRollsBatch: async (rolls, newPity) => {
    if (!rolls || rolls.length === 0) {
      return [];
    }
    const state = get();
    let newShards = { ...state.userStats.shards };
    let newInventory = [...(state.userStats.inventory || [])];
    let newFur = state.userStats.goldenFur || 0;

    let currentLuckyRolls = state.userStats.buffLuckyGachaRolls || 0;
    let luckyRollsConsumed = Math.min(currentLuckyRolls, rolls.length);
    let newLuckyRolls = currentLuckyRolls - luckyRollsConsumed;

    const results = rolls.map(({ item, isFullItem, duplicateFur }) => {
      let unlocked = false;
      const hasItem = newInventory.includes(item.id);
      newFur += duplicateFur;

      if (isFullItem && !hasItem) {
        unlocked = true;
      } else if (!isFullItem && !hasItem) {
        newShards[item.id] = (newShards[item.id] || 0) + 1;
        if (newShards[item.id] >= item.shardTarget) {
          newShards[item.id] -= item.shardTarget;
          unlocked = true;
        }
      }

      if (unlocked) {
        newInventory.push(item.id);
      }

      return {
        unlocked,
        shardsNow: newShards[item.id] || 0,
      };
    });

    const newUserStats = {
      ...state.userStats,
      shards: newShards,
      inventory: newInventory,
      goldenFur: newFur,
      pityCounter: newPity,
      buffLuckyGachaRolls: newLuckyRolls,
    };

    set({ userStats: newUserStats });

    const uid = state.user?.uid;
    if (uid) {
      setDoc(
        doc(db, "user_stats", uid),
        {
          shards: newShards,
          inventory: newInventory,
          goldenFur: newFur,
          pityCounter: newPity,
          buffLuckyGachaRolls: newLuckyRolls,
        },
        { merge: true }
      ).catch(() => { });
    }

    return results;
  },

  useFreeMinigameHint: async () => {
    const state = get();
    const currentHints = state.userStats.freeMinigameHints;

    if (currentHints > 0) {
      const newHints = currentHints - 1;
      const newUserStats = { ...state.userStats, freeMinigameHints: newHints };
      set({ userStats: newUserStats });

      const uid = get().user?.uid;
      if (uid) {
        setDoc(
          doc(db, "user_stats", uid),
          { freeMinigameHints: newHints },
          { merge: true }
        ).catch((error) => console.error("Lỗi đồng bộ useFreeMinigameHint:", error));
      }
      return true;
    }
    return false;
  },

  equipFurniture: async (slotId, itemId) => {
    const state = get();
    const newEquipped = { ...state.userStats.equippedFurniture };
    if (itemId === null) {
      delete newEquipped[slotId];
    } else {
      newEquipped[slotId] = itemId;
    }
    const newUserStats = { ...state.userStats, equippedFurniture: newEquipped };
    set({ userStats: newUserStats });

    const uid = state.user?.uid;
    if (uid) {
      try {
        await setDoc(
          doc(db, "user_stats", uid),
          { equippedFurniture: newEquipped },
          { merge: true }
        );
      } catch (error) {
        console.error("Lỗi equipFurniture:", error);
      }
    }
  },

  harvestBones: async () => {
    const state = get();
    const lastHarvest = new Date(
      state.userStats.lastHarvestTime || new Date().toISOString()
    ).getTime();
    const now = Date.now();
    const elapsedHours = (now - lastHarvest) / (1000 * 60 * 60);

    const totalBonesPerHour = Object.values(
      state.userStats.equippedFurniture || {}
    ).reduce((sum, itemId) => {
      const item = state.systemItems.find((i) => i.id === itemId);
      return sum + (item?.bonesPerHour || 0);
    }, 0);

    let pendingBones = Math.floor(elapsedHours * totalBonesPerHour);
    const isDoubleActive = state.userStats.buffDoubleBonesUntil
      ? new Date(state.userStats.buffDoubleBonesUntil).getTime() > now
      : false;
    if (isDoubleActive) {
      pendingBones *= 2;
    }
    if (pendingBones <= 0) return 0;

    const newCoins = state.userStats.coins + pendingBones;
    const nowStr = new Date().toISOString();
    const newUserStats = {
      ...state.userStats,
      coins: newCoins,
      lastHarvestTime: nowStr,
    };
    set({ userStats: newUserStats });

    const uid = state.user?.uid;
    if (uid) {
      setDoc(
        doc(db, "user_stats", uid),
        { coins: newCoins, lastHarvestTime: nowStr },
        { merge: true }
      ).catch((error) => {
        console.error("Lỗi đồng bộ harvestBones:", error);
      });
    }
    return pendingBones;
  },

  equipItem: async (slotKey, itemId) => {
    const state = get();
    const newEquippedSlots = state.userStats.equippedSlots
      ? { ...state.userStats.equippedSlots }
      : {
        head: null,
        armor: null,
        earring: null,
        gloves: null,
        mount: null,
        aura: null,
        costume: null,
        voice: null,
      };
    newEquippedSlots[slotKey as keyof typeof newEquippedSlots] = itemId;

    const newUserStats = { ...state.userStats, equippedSlots: newEquippedSlots };
    set({ userStats: newUserStats });

    const uid = state.user?.uid;
    if (uid) {
      try {
        await setDoc(
          doc(db, "user_stats", uid),
          { equippedSlots: newEquippedSlots },
          { merge: true }
        );
      } catch (error) {
        console.error("Lỗi đồng bộ equipItem:", error);
      }
    }
  },

  equipTheme: async (themeId) => {
    const state = get();
    const newUserStats = { ...state.userStats, equippedTheme: themeId };
    set({ userStats: newUserStats });

    const uid = state.user?.uid;
    if (uid) {
      try {
        await setDoc(
          doc(db, "user_stats", uid),
          { equippedTheme: themeId },
          { merge: true }
        );
      } catch (error) {
        console.error("Lỗi đồng bộ equipTheme:", error);
      }
    }
  },

  buyShopItem: async (shopItemId, type, targetId) => {
    const state = get();

    let cost = 0;
    if (type === "shard") {
      if (!targetId) return false;
      const targetItem = state.systemItems.find((i) => i.id === targetId);
      if (!targetItem) return false;
      cost =
        targetItem.shardPrice !== undefined
          ? targetItem.shardPrice
          : SHARD_PRICES[targetItem.rarity] || 0;
    } else if (type === "exclusive") {
      const item = state.systemItems.find((i) => i.id === shopItemId);
      if (!item) return false;
      cost = item.cost;
    } else if (type === "consumable") {
      const item = state.systemItems.find((i) => i.id === shopItemId);
      if (!item) return false;
      cost = item.cost;
    }

    if (cost <= 0 || (state.userStats.goldenFur || 0) < cost) {
      return false;
    }

    const newGoldenFur = (state.userStats.goldenFur || 0) - cost;
    const newShards = state.userStats.shards ? { ...state.userStats.shards } : {};
    const newInventory = state.userStats.inventory ? [...state.userStats.inventory] : [];
    let newDoubleBonesUntil = state.userStats.buffDoubleBonesUntil || null;
    let newLuckyGachaRolls = state.userStats.buffLuckyGachaRolls || 0;

    let dbUpdates: any = { goldenFur: newGoldenFur };

    if (type === "shard") {
      if (!targetId) return false;
      const targetItem = state.systemItems.find((i) => i.id === targetId);
      if (!targetItem) return false;

      const alreadyOwned = newInventory.includes(targetId);
      if (alreadyOwned) return false;

      newShards[targetId] = (newShards[targetId] || 0) + 1;

      if (newShards[targetId] >= targetItem.shardTarget) {
        newShards[targetId] = 0;
        newInventory.push(targetId);
      }

      dbUpdates.shards = newShards;
      dbUpdates.inventory = newInventory;
    } else if (type === "exclusive") {
      const alreadyOwned = newInventory.includes(shopItemId);
      if (alreadyOwned) return false;

      const targetItem = state.systemItems.find((i) => i.id === shopItemId);
      if (!targetItem) return false;

      newInventory.push(shopItemId);

      dbUpdates.inventory = newInventory;
    } else if (type === "consumable") {
      if (shopItemId === "buff_double_bones") {
        const currentUntil = newDoubleBonesUntil ? new Date(newDoubleBonesUntil).getTime() : 0;
        const baseTime = currentUntil > Date.now() ? currentUntil : Date.now();
        newDoubleBonesUntil = new Date(baseTime + 24 * 60 * 60 * 1000).toISOString();
        dbUpdates.buffDoubleBonesUntil = newDoubleBonesUntil;
      } else if (shopItemId === "buff_lucky_gacha") {
        newLuckyGachaRolls = (newLuckyGachaRolls || 0) + 5;
        dbUpdates.buffLuckyGachaRolls = newLuckyGachaRolls;
      }
      dbUpdates.buffDoubleBonesUntil = newDoubleBonesUntil;
      dbUpdates.buffLuckyGachaRolls = newLuckyGachaRolls;
    }

    const newUserStats = {
      ...state.userStats,
      goldenFur: newGoldenFur,
      shards: newShards,
      inventory: newInventory,
      buffDoubleBonesUntil: newDoubleBonesUntil,
      buffLuckyGachaRolls: newLuckyGachaRolls,
    };

    set({ userStats: newUserStats });

    const uid = state.user?.uid;
    if (uid) {
      setDoc(doc(db, "user_stats", uid), dbUpdates, { merge: true }).catch((err) => {
        console.error("Lỗi đồng bộ buyShopItem:", err);
      });
    }

    return true;
  },
});

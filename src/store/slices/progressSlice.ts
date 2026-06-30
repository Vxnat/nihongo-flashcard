import { StateCreator } from "zustand";
import { AppState, ProgressSlice } from "../types";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { applyRewards } from "../helpers";
import { toast } from "react-hot-toast";

/**
 * Slice quản lý tiến độ học tập (Progress) của người học đối với từng bộ thẻ,
 * trạng thái Boss (đang học, mở khóa boss, đã hoàn thành), số lần thua Boss và thống kê từ vựng đúng/sai.
 */
export const createProgressSlice: StateCreator<
  AppState,
  [],
  [],
  ProgressSlice
> = (set, get) => ({
  progress: {},
  bossStatus: {},
  bossFailedAttempts: {},
  completedDecks: {},

  loadProgress: async (deckId) => {
    const uid = get().user?.uid;

    if (!uid) {
      // Chưa đăng nhập -> Chỉ lưu tạm trong RAM, F5 là mất
      set((state) => ({
        progress: { ...state.progress, [deckId]: [] },
        bossStatus: { ...state.bossStatus, [deckId]: "learning" },
        bossFailedAttempts: { ...state.bossFailedAttempts, [deckId]: 0 },
        completedDecks: { ...state.completedDecks, [deckId]: false },
      }));
      return;
    }

    try {
      const docRef = doc(db, "user_progress", `${uid}_${deckId}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const knownIds = data.knownIds || [];
        const status = data.bossStatus || "learning";
        const attempts = data.bossFailedAttempts || 0;

        // Xác định trạng thái hoàn thành: lấy từ firestore hoặc tự động suy luận từ bossStatus/knownIds
        let isCompleted = data.isCompleted;
        if (isCompleted === undefined) {
          // Các node đặc biệt (Rương, Truyện, Minigames) không có Boss nên bossStatus luôn là "learning",
          // chúng được coi là hoàn thành nếu đã được ghi nhận tiến trình (knownIds có dữ liệu).
          const isSpecialTypeNode =
            deckId.startsWith("chest_") ||
            deckId.startsWith("vn_") ||
            deckId.includes("_kanji_") ||
            deckId.startsWith("mg_");
          isCompleted = isSpecialTypeNode
            ? knownIds.length > 0
            : status === "completed" || status === "boss_unlocked";
        }

        set((state) => ({
          progress: { ...state.progress, [deckId]: knownIds },
          bossStatus: { ...state.bossStatus, [deckId]: status },
          bossFailedAttempts: { ...state.bossFailedAttempts, [deckId]: attempts },
          completedDecks: { ...state.completedDecks, [deckId]: isCompleted },
        }));
      } else {
        set((state) => ({
          progress: { ...state.progress, [deckId]: [] },
          bossStatus: { ...state.bossStatus, [deckId]: "learning" },
          bossFailedAttempts: { ...state.bossFailedAttempts, [deckId]: 0 },
          completedDecks: { ...state.completedDecks, [deckId]: false },
        }));
      }
    } catch (error) {
      console.error("Lỗi lấy tiến độ từ mây:", error);
    }
  },

  saveProgress: async (deckId, knownIds) => {
    const state = get();
    const wasCompleted = state.completedDecks[deckId] || false;

    // Lấy thông tin bộ thẻ (từ customDecks hoặc fetch từ system_decks.json)
    let deck: any = state.customDecks.find((d) => d.id === deckId);
    let totalCards = deck?.cards?.length || 0;

    if (!deck) {
      try {
        const res = await fetch("/data/configs/system_decks.json");
        if (res.ok) {
          const decks = await res.json();
          deck = decks.find((d: any) => d.id === deckId);
          if (deck) {
            totalCards = deck.totalCards || 0;
          }
        }
      } catch (e) {
        console.error("Lỗi fetch system deck size trong saveProgress:", e);
      }
    }

    // Xác định trạng thái Boss và Hoàn thành học (isCompleted)
    const currentBossStatus = state.bossStatus[deckId] || "learning";
    let newBossStatus = currentBossStatus;
    let isCompleted = false;

    if (deck) {
      const isSpecialType = [
        "chest",
        "story",
        "minigame_matching",
        "minigame_kanji",
        "minigame_rush",
      ].includes(deck.type);
      isCompleted = isSpecialType
        ? knownIds.length > 0
        : totalCards === 0 || knownIds.length >= totalCards;
    }

    // Điều chỉnh bossStatus
    if (totalCards > 0 && knownIds.length >= totalCards) {
      if (currentBossStatus === "learning") {
        newBossStatus = "boss_unlocked";
      }
    } else {
      if (knownIds.length < totalCards) {
        newBossStatus = "learning";
      }
    }

    // 1. Cập nhật State cục bộ trước (Optimistic update)
    set((state) => ({
      progress: { ...state.progress, [deckId]: knownIds },
      bossStatus: { ...state.bossStatus, [deckId]: newBossStatus },
      completedDecks: { ...state.completedDecks, [deckId]: isCompleted },
    }));

    // 2. Trao phần thưởng nếu bài học vừa hoàn thành
    if (deck && isCompleted && !wasCompleted) {
      let rewards = deck.rewards;
      if (!rewards) {
        const fallbackCoins = deck.rewardCoins || 0;
        const fallbackExp = [
          "minigame_kanji",
          "minigame_rush",
          "minigame_matching",
        ].includes(deck.type)
          ? 50
          : 30;
        rewards = { coins: fallbackCoins, exp: fallbackExp };
      }

      if (deck.type === "chest") {
        rewards = { ...rewards, coins: 0 }; // Tránh thưởng trùng xu với cơ chế click rương riêng
      }

      const newUserStats = applyRewards(get().userStats, rewards);
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
            },
            { merge: true }
          );
        } catch (err) {
          console.error("Lỗi cập nhật user_stats trên cloud:", err);
        }
      }

      if (rewards.exp || rewards.coins || (rewards.items && rewards.items.length > 0)) {
        let msg = `Hoàn thành "${deck.title}"!`;
        if (rewards.exp) msg += ` +${rewards.exp} EXP`;
        if (rewards.coins) msg += ` +${rewards.coins} xu`;
        toast.success(msg);
      }
    }

    // 3. Đồng bộ tiến độ lên Firestore
    const uid = get().user?.uid;
    if (!uid) return;

    try {
      await setDoc(
        doc(db, "user_progress", `${uid}_${deckId}`),
        {
          userId: uid,
          deckId: deckId,
          knownIds: knownIds,
          bossStatus: newBossStatus,
          bossFailedAttempts: state.bossFailedAttempts[deckId] || 0,
          isCompleted: isCompleted,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Lỗi lưu tiến độ lên mây:", error);
    }
  },

  resetProgress: async (deckId) => {
    set((state) => ({
      progress: { ...state.progress, [deckId]: [] },
      bossStatus: { ...state.bossStatus, [deckId]: "learning" },
      bossFailedAttempts: { ...state.bossFailedAttempts, [deckId]: 0 },
      completedDecks: { ...state.completedDecks, [deckId]: false },
    }));

    const uid = get().user?.uid;
    if (!uid) return;

    try {
      await deleteDoc(doc(db, "user_progress", `${uid}_${deckId}`));
    } catch (error) {
      console.error("Lỗi reset tiến độ trên mây:", error);
    }
  },

  recordWordStat: async (wordId: string, isCorrect: boolean) => {
    const state = get();
    const currentStats = state.userStats.wordStats || {};
    const wordStat = currentStats[wordId]
      ? { ...currentStats[wordId] }
      : { wrongCount: 0, correctCount: 0 };

    if (isCorrect) {
      wordStat.correctCount += 1;
    } else {
      wordStat.wrongCount += 1;
    }

    const newWordStats = {
      ...currentStats,
      [wordId]: wordStat,
    };

    const newUserStats = {
      ...state.userStats,
      wordStats: newWordStats,
    };

    set({ userStats: newUserStats });

    const uid = state.user?.uid;
    if (uid) {
      try {
        await setDoc(
          doc(db, "user_stats", uid),
          { wordStats: newWordStats },
          { merge: true }
        );
      } catch (error) {
        console.error("Lỗi recordWordStat:", error);
      }
    }
  },

  submitBossResult: async (deckId: string, isWin: boolean) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("activeBossBattle");
    }
    const state = get();
    const uid = state.user?.uid;
    const currentAttempts = state.bossFailedAttempts[deckId] || 0;

    let newStatus = state.bossStatus[deckId] || "learning";
    let newAttempts = currentAttempts;
    let nextKnownIds = state.progress[deckId] || [];

    if (isWin) {
      newStatus = "completed";
      newAttempts = 0;

      // Thắng Boss: Thưởng theo cấu hình của bài học, mặc định 10 xu + 30 EXP
      let rewards = { coins: 10, exp: 30 };
      const customDeck = state.customDecks.find((d) => d.id === deckId);
      if (customDeck && (customDeck as any).rewards) {
        rewards = (customDeck as any).rewards;
      } else {
        try {
          const res = await fetch("/data/configs/system_decks.json");
          if (res.ok) {
            const decks = await res.json();
            const deck = decks.find((d: any) => d.id === deckId);
            if (deck && deck.rewards) {
              // Nhân đôi EXP và Coins khi thắng Boss
              const coins = deck.rewardCoins * 2 || 0;
              const exp = deck.rewardExp * 2 || 0;
              rewards = { coins, exp };
            }
          }
        } catch (e) {
          console.error("Lỗi fetch system deck rewards trong submitBossResult:", e);
        }
      }

      const newUserStats = applyRewards(state.userStats, rewards);
      set({ userStats: newUserStats });

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
            },
            { merge: true }
          );
        } catch (error) {
          console.error("Lỗi lưu user stats sau khi thắng boss:", error);
        }
      }

      toast.success(
        `Chúc mừng! Bạn đã tiêu diệt Boss thành công và hoàn thành bài học! Thưởng ${rewards.exp} EXP + ${rewards.coins} xu!`,
        {
          duration: 5000,
        }
      );
    } else {
      newAttempts += 1;
      if (newAttempts >= 3) {
        newStatus = "learning";
        newAttempts = 0;
        nextKnownIds = []; // reset progress

        toast.error(
          "Bạn đã thua 3 lần liên tiếp! Thách đấu Boss bị khóa. Bạn phải học lại từ đầu để mở khóa Boss!",
          {
            duration: 6000,
          }
        );
      } else {
        toast.error(
          `Chiến bại! Bạn còn ${3 - newAttempts} cơ hội trước khi tiến độ học bài này bị reset!`,
          {
            duration: 4000,
          }
        );
      }
    }

    // Cập nhật State
    set((state) => ({
      bossStatus: { ...state.bossStatus, [deckId]: newStatus },
      bossFailedAttempts: { ...state.bossFailedAttempts, [deckId]: newAttempts },
      progress: { ...state.progress, [deckId]: nextKnownIds },
      completedDecks: { ...state.completedDecks, [deckId]: newStatus !== "learning" },
    }));

    // Cập nhật Firestore user_progress
    if (uid) {
      try {
        await setDoc(
          doc(db, "user_progress", `${uid}_${deckId}`),
          {
            userId: uid,
            deckId: deckId,
            knownIds: nextKnownIds,
            bossStatus: newStatus,
            bossFailedAttempts: newAttempts,
            isCompleted: newStatus !== "learning",
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Lỗi đồng bộ submitBossResult:", error);
      }
    }
  },
});

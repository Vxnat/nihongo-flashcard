import { create } from "zustand";
import { User } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserStats {
  streak: number;
  cardsFlippedToday: number;
  totalLearned: number;
  learningTimeToday: number;
  lastActiveDate: string;
  // --- GACHA & QUESTS ---
  coins: number;
  inventory: string[];
  equippedSticker: string | null;
  dailyQuests: {
    date: string;
    quests: DailyQuest[];
  };
}

export interface DailyQuest {
  id: string;
  title: string;
  target: number;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  reward: number;
}

const DEFAULT_QUESTS: DailyQuest[] = [
  { id: "q_time", title: "Học 5 phút", target: 300, progress: 0, isCompleted: false, isClaimed: false, reward: 1 },
  { id: "q_flip", title: "Lật 50 thẻ bài", target: 50, progress: 0, isCompleted: false, isClaimed: false, reward: 2 },
  { id: "q_combo", title: "Đạt Combo x5", target: 5, progress: 0, isCompleted: false, isClaimed: false, reward: 2 },
];

export interface CustomDeck {
  id: string;
  title: string;
  description: string;
  count: number;
  level: string;
  cards: any[];
}

interface AppState {
  // --- APP SETTINGS SLICE ---
  appMode: "focus" | "fun";
  setAppMode: (mode: "focus" | "fun") => void;
  loadAppMode: () => void;

  // --- AUTH SLICE ---
  user: User | null;
  setUser: (user: User | null) => void;

  // --- USER STATS SLICE ---
  userStats: UserStats;
  loadUserStats: () => Promise<void>;
  recordAction: () => Promise<void>;
  addLearningTime: (seconds: number) => Promise<void>;

  // --- DECK SLICE ---
  customDecks: CustomDeck[];
  isLoadingDecks: boolean;
  loadCustomDecks: (uid?: string) => Promise<void>;
  addCustomDeck: (deck: CustomDeck) => void;
  deleteCustomDeck: (id: string) => void;

  // --- PROGRESS SLICE ---
  progress: Record<string, string[]>;
  loadProgress: (deckId: string) => Promise<void>;
  saveProgress: (deckId: string, knownIds: string[]) => Promise<void>;
  resetProgress: (deckId: string) => Promise<void>;

  // --- GACHA & QUESTS ACTIONS ---
  updateQuestProgress: (questId: string, value: number, isAbsolute?: boolean) => Promise<void>;
  claimQuestReward: (questId: string) => Promise<void>;
  deductCoins: (amount: number) => Promise<boolean>;
  unlockSticker: (stickerId: string) => Promise<void>;
  equipSticker: (stickerId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // 0. APP SETTINGS
  appMode: "focus",
  setAppMode: (mode) => {
    localStorage.setItem("flashcard_app_mode", mode);
    set({ appMode: mode });
  },
  loadAppMode: () => {
    const saved = localStorage.getItem("flashcard_app_mode");
    if (saved === "focus" || saved === "fun") {
      set({ appMode: saved as "focus" | "fun" });
    }
  },

  // 0. AUTH STATE
  user: null,
  setUser: (user) => set({ user }),

  // 1. STATE MẶC ĐỊNH
  userStats: {
    streak: 0,
    cardsFlippedToday: 0,
    totalLearned: 0,
    learningTimeToday: 0,
    lastActiveDate: new Date().toLocaleDateString("en-CA"),
    // --- GACHA & QUESTS ---
    coins: 0,
    inventory: [],
    equippedSticker: null,
    dailyQuests: { date: '', quests: DEFAULT_QUESTS },
  },

  // 2. HÀM TẢI DỮ LIỆU (Đã tích hợp Firestore)
  loadUserStats: async () => {
    const uid = get().user?.uid;
    const today = new Date().toLocaleDateString("en-CA");
    let savedStats: any = {};

    // Lấy dữ liệu từ Firestore nếu có đăng nhập
    if (uid) {
      try {
        const docRef = doc(db, "user_stats", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          savedStats = docSnap.data();
          localStorage.setItem("flashcard_user_stats", JSON.stringify(savedStats));
        } else {
          savedStats = JSON.parse(localStorage.getItem("flashcard_user_stats") || "{}");
        }
      } catch (error) {
        console.error("Lỗi lấy thống kê từ mây:", error);
        savedStats = JSON.parse(localStorage.getItem("flashcard_user_stats") || "{}");
      }
    } else {
      savedStats = JSON.parse(localStorage.getItem("flashcard_user_stats") || "{}");
    }

    let totalLearnedCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("flashcard_progress_")) {
        try {
          const learnedArray = JSON.parse(localStorage.getItem(key) || "[]");
          totalLearnedCount += learnedArray.length;
        } catch (e) {}
      }
    }

    let currentStreak = savedStats.streak || 0;
    let flippedToday = savedStats.cardsFlippedToday || 0;
    let learningTime = savedStats.learningTimeToday || 0;
    const lastActiveDate = savedStats.lastActiveDate;

    if (lastActiveDate !== today) {
      flippedToday = 0;
      learningTime = 0;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        lastActiveDate &&
        lastActiveDate !== yesterday.toLocaleDateString("en-CA") &&
        lastActiveDate !== today
      ) {
        currentStreak = 0;
      }

      // Tự động đẩy lên mây nếu qua ngày để reset Streak chuẩn trên hệ thống
      if (uid) {
        setDoc(doc(db, "user_stats", uid), {
          streak: currentStreak,
          cardsFlippedToday: flippedToday,
          learningTimeToday: learningTime,
          lastActiveDate: today,
        }, { merge: true }).catch(() => {});
      }
    }

    set({
      userStats: {
        streak: currentStreak,
        cardsFlippedToday: flippedToday,
        totalLearned: totalLearnedCount,
        learningTimeToday: learningTime,
        lastActiveDate: today || new Date().toLocaleDateString("en-CA"),
        // --- GACHA & QUESTS ---
        coins: savedStats.coins || 0,
        inventory: savedStats.inventory || [],
        equippedSticker: savedStats.equippedSticker || null,
        dailyQuests: (savedStats.dailyQuests && savedStats.dailyQuests.date === today) 
          ? savedStats.dailyQuests 
          : { date: today, quests: DEFAULT_QUESTS },
      },
    });
  },

  // 3. HÀM LƯU HÀNH ĐỘNG LẬT THẺ
  recordAction: async () => {
    const today = new Date().toLocaleDateString("en-CA");
    const savedStats = JSON.parse(
      localStorage.getItem("flashcard_user_stats") || "{}",
    );
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = savedStats.streak || 0;
    let newFlipped =
      (savedStats.cardsFlippedToday || 0) +
      (savedStats.lastActiveDate === today ? 1 : 1);
    let newLearningTime =
      savedStats.lastActiveDate === today
        ? savedStats.learningTimeToday || 0
        : 0;

    if (savedStats.lastActiveDate !== today) {
      newStreak =
        savedStats.lastActiveDate === yesterday.toLocaleDateString("en-CA")
          ? newStreak + 1
          : 1;
    }

    const updatedStats = {
      streak: newStreak,
      cardsFlippedToday: newFlipped,
      learningTimeToday: newLearningTime,
      lastActiveDate: today,
    };
    localStorage.setItem("flashcard_user_stats", JSON.stringify(updatedStats));
    set((state) => ({ userStats: { ...state.userStats, ...updatedStats } }));

    // Bắn dữ liệu lên Firestore ngầm
    const uid = get().user?.uid;
    if (uid) {
      try {
        await setDoc(doc(db, "user_stats", uid), updatedStats, { merge: true });
      } catch (error) {
        console.error("Lỗi đồng bộ recordAction:", error);
      }
    }

    // Tăng tiến độ quest lật thẻ
    get().updateQuestProgress("q_flip", 1);
  },

  // 4. HÀM CỘNG GIỜ HỌC
  addLearningTime: async (seconds: number) => {
    const today = new Date().toLocaleDateString("en-CA");
    const savedStats = JSON.parse(
      localStorage.getItem("flashcard_user_stats") || "{}",
    );
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let currentLearningTime =
      (savedStats.lastActiveDate === today ? savedStats.learningTimeToday : 0) +
      seconds;
    let currentFlipped =
      savedStats.lastActiveDate === today ? savedStats.cardsFlippedToday : 0;
    let currentStreak = savedStats.streak || 0;

    if (savedStats.lastActiveDate !== today) {
      currentStreak =
        savedStats.lastActiveDate === yesterday.toLocaleDateString("en-CA")
          ? currentStreak + 1
          : 1;
    }

    const updatedStats = {
      streak: currentStreak,
      cardsFlippedToday: currentFlipped,
      learningTimeToday: currentLearningTime,
      lastActiveDate: today,
    };
    localStorage.setItem("flashcard_user_stats", JSON.stringify(updatedStats));
    set((state) => ({ userStats: { ...state.userStats, ...updatedStats } }));

    // Bắn dữ liệu lên Firestore ngầm
    const uid = get().user?.uid;
    if (uid) {
      try {
        await setDoc(doc(db, "user_stats", uid), updatedStats, { merge: true });
      } catch (error) {
        console.error("Lỗi đồng bộ addLearningTime:", error);
      }
    }

    // Tăng tiến độ quest học thời gian
    get().updateQuestProgress("q_time", seconds);
  },

  // 5. HÀM QUẢN LÝ BỘ BÀI (DECK SLICE)
  customDecks: [],
  isLoadingDecks: true, // Bật mặc định khi mới vào
  loadCustomDecks: async (uid) => {
    set({ isLoadingDecks: true });
    try {
      if (uid) {
        // Lấy bộ bài của riêng user này từ Firestore mây ☁️
        const q = query(collection(db, "decks"), where("userId", "==", uid));
        const snapshot = await getDocs(q);
        const decks: CustomDeck[] = [];
        snapshot.forEach((doc) => decks.push(doc.data() as CustomDeck));
        
        // Xếp thẻ mới tạo lên trên cùng
        decks.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        set({ customDecks: decks, isLoadingDecks: false });
      } else {
        // Ai chưa đăng nhập thì kéo từ localStorage (tạm)
        const stored = JSON.parse(localStorage.getItem("custom_decks") || "[]");
        set({ customDecks: stored, isLoadingDecks: false });
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      set({ isLoadingDecks: false });
    }
  },
  addCustomDeck: (deck) => {
    const currentDecks = get().customDecks;
    const updated = [...currentDecks, deck];
    localStorage.setItem("custom_decks", JSON.stringify(updated));
    set({ customDecks: updated });
  },
  deleteCustomDeck: (id) => {
    const currentDecks = get().customDecks;
    const updated = currentDecks.filter((d) => d.id !== id);
    localStorage.setItem("custom_decks", JSON.stringify(updated));
    set({ customDecks: updated });
  },

  // 6. HÀM QUẢN LÝ TIẾN ĐỘ HỌC (PROGRESS SLICE)
  progress: {},
  loadProgress: async (deckId) => {
    const uid = get().user?.uid;
    
    // Nếu có đăng nhập, ưu tiên lấy từ Firestore
    if (uid) {
      try {
        const docRef = doc(db, "user_progress", `${uid}_${deckId}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const knownIds = docSnap.data().knownIds || [];
          // Lưu ngược lại local dự phòng và set vào state
          localStorage.setItem(`flashcard_progress_${deckId}`, JSON.stringify(knownIds));
          set((state) => ({ progress: { ...state.progress, [deckId]: knownIds } }));
          return;
        }
      } catch (error) {
        console.error("Lỗi lấy tiến độ từ mây:", error);
      }
    }
    
    // Fallback: Lấy từ LocalStorage nếu chưa đăng nhập hoặc mạng lỗi
    const savedLocal = localStorage.getItem(`flashcard_progress_${deckId}`);
    set((state) => ({
      progress: { ...state.progress, [deckId]: savedLocal ? JSON.parse(savedLocal) : [] },
    }));
  },
  
  saveProgress: async (deckId, knownIds) => {
    // 1. Luôn lưu Local và update State trước để UI mượt, không có độ trễ (Optimistic update)
    localStorage.setItem(`flashcard_progress_${deckId}`, JSON.stringify(knownIds));
    set((state) => ({
      progress: { ...state.progress, [deckId]: knownIds },
    }));
    
    // 2. Bắn data lên Firestore ngầm phía sau
    const uid = get().user?.uid;
    if (uid) {
      try {
        await setDoc(doc(db, "user_progress", `${uid}_${deckId}`), {
          userId: uid,
          deckId: deckId,
          knownIds: knownIds,
          updatedAt: new Date().toISOString()
        }, { merge: true }); // Dùng merge để không ghi đè mất các trường cũ nếu có
      } catch (error) {
        console.error("Lỗi lưu tiến độ lên mây:", error);
      }
    }
  },
  
  resetProgress: async (deckId) => {
    // 1. Xóa Local
    localStorage.removeItem(`flashcard_progress_${deckId}`);
    set((state) => ({
      progress: { ...state.progress, [deckId]: [] },
    }));
    
    // 2. Xóa trên Firestore
    const uid = get().user?.uid;
    if (uid) {
      try {
        await deleteDoc(doc(db, "user_progress", `${uid}_${deckId}`));
      } catch (error) {
        console.error("Lỗi reset tiến độ trên mây:", error);
      }
    }
  },

  // 7. HÀM QUẢN LÝ GACHA VÀ NHIỆM VỤ (QUESTS & GACHA SLICE)
  updateQuestProgress: async (questId, value, isAbsolute = false) => {
    const state = get();
    const today = new Date().toLocaleDateString("en-CA");
    
    let currentQuests = state.userStats.dailyQuests.quests;
    if (state.userStats.dailyQuests.date !== today) {
      currentQuests = DEFAULT_QUESTS.map(q => ({ ...q, progress: 0, isCompleted: false, isClaimed: false }));
    }

    let isChanged = false;
    const updatedQuests = currentQuests.map((q) => {
      if (q.id === questId && !q.isCompleted) {
        const newProgress = isAbsolute ? value : q.progress + value;
        const boundedProgress = Math.min(newProgress, q.target);
        isChanged = true;
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
    
    set((s) => ({
      userStats: { ...s.userStats, dailyQuests: newDailyQuests }
    }));

    const uid = get().user?.uid;
    if (uid) {
      try {
        await setDoc(doc(db, "user_stats", uid), { dailyQuests: newDailyQuests }, { merge: true });
      } catch (error) {
        console.error("Lỗi updateQuestProgress:", error);
      }
    }
  },

  claimQuestReward: async (questId) => {
    const state = get();
    let rewardCoins = 0;
    
    const updatedQuests = state.userStats.dailyQuests.quests.map((q) => {
      if (q.id === questId && q.isCompleted && !q.isClaimed) {
        rewardCoins = q.reward;
        return { ...q, isClaimed: true };
      }
      return q;
    });

    if (rewardCoins > 0) {
      const newCoins = state.userStats.coins + rewardCoins;
      const newDailyQuests = { ...state.userStats.dailyQuests, quests: updatedQuests };
      
      set((s) => ({
        userStats: { 
          ...s.userStats, 
          coins: newCoins,
          dailyQuests: newDailyQuests
        }
      }));

      const uid = get().user?.uid;
      if (uid) {
        try {
          await setDoc(doc(db, "user_stats", uid), { 
            coins: newCoins,
            dailyQuests: newDailyQuests
          }, { merge: true });
        } catch (error) {
          console.error("Lỗi claimQuestReward:", error);
        }
      }
    }
  },

  deductCoins: async (amount) => {
    const state = get();
    if (state.userStats.coins >= amount) {
      const newCoins = state.userStats.coins - amount;
      set((s) => ({
        userStats: { ...s.userStats, coins: newCoins }
      }));
      
      const uid = get().user?.uid;
      if (uid) {
        try {
          await setDoc(doc(db, "user_stats", uid), { coins: newCoins }, { merge: true });
        } catch (error) {
          console.error("Lỗi deductCoins:", error);
        }
      }
      return true;
    }
    return false;
  },

  unlockSticker: async (stickerId) => {
    const state = get();
    const currentInventory = state.userStats.inventory || [];
    
    // Nếu đã sở hữu sticker này rồi thì bỏ qua
    if (currentInventory.includes(stickerId)) return;

    const newInventory = [...currentInventory, stickerId];
    
    set((s) => ({
      userStats: { ...s.userStats, inventory: newInventory }
    }));

    const uid = get().user?.uid;
    if (uid) {
      try {
        await setDoc(doc(db, "user_stats", uid), { inventory: newInventory }, { merge: true });
      } catch (error) {
        console.error("Lỗi unlockSticker:", error);
      }
    }
  },
  
  equipSticker: async (stickerId) => {
    set((s) => ({
      userStats: { ...s.userStats, equippedSticker: stickerId }
    }));

    const uid = get().user?.uid;
    if (uid) {
      try {
        await setDoc(doc(db, "user_stats", uid), { equippedSticker: stickerId }, { merge: true });
      } catch (error) {
        console.error("Lỗi equipSticker:", error);
      }
    }
  },
}));

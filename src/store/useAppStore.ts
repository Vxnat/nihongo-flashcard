import { create } from "zustand";
import { User } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserStats {
  streak: number;
  cardsFlippedToday: number;
  totalLearned: number;
  learningTimeToday: number;
  lastActiveDate: string;
  role?: string | null;
  // --- LEVEL & EXP ---
  level: number;
  exp: number;
  dailyTimeGoalClaimed: boolean;
  studyHistory: Record<string, number>;
  // --- GACHA & QUESTS ---
  freeMinigameHints: number;
  coins: number;
  inventory: string[];
  dailyQuests: {
    date: string;
    quests: DailyQuest[];
  };
  // --- GACHA 2.0 & META-GAME ---
  goldenFur: number;
  shards: Record<string, number>;
  equippedTheme: string | null;
  pityCounter: number;
  // --- GACHA EXTENSION & META-GAME ---
  lastHarvestTime: string;
  equippedFurniture: Record<string, string>;
  equippedSlots: {
    head: string | null;
    armor: string | null;
    earring: string | null;
    gloves: string | null;
    mount: string | null;
    aura: string | null;
    costume: string | null;
    voice: string | null;
  };
  buffDoubleBonesUntil: string | null;
  buffLuckyGachaRolls: number;
  wordStats?: Record<string, { wrongCount: number, correctCount: number }>;
  baseStats?: {
    hp: number;
    atk: number;
    def: number;
    crit: number;
  };
}

// Unified Reward Distributor Helper Function
const applyRewards = (stats: UserStats, rewards: any): UserStats => {
  if (!rewards) return stats;
  const newStats = { ...stats };

  // 1. Coins
  if (rewards.coins) {
    newStats.coins = (newStats.coins || 0) + rewards.coins;
  }

  // 2. Golden Fur
  if (rewards.goldenFur) {
    newStats.goldenFur = (newStats.goldenFur || 0) + rewards.goldenFur;
  }

  // 3. Items
  if (rewards.items && Array.isArray(rewards.items)) {
    const currentInventory = newStats.inventory || [];
    newStats.inventory = [...currentInventory, ...rewards.items];
  }

  // 4. EXP & Level Up
  if (rewards.exp) {
    let currentExp = (newStats.exp || 0) + rewards.exp;
    let currentLevel = newStats.level || 1;
    let maxExp = Math.round(100 * Math.pow(currentLevel, 1.3));

    while (currentExp >= maxExp) {
      currentExp -= maxExp;
      currentLevel += 1;
      maxExp = Math.round(100 * Math.pow(currentLevel, 1.3));

      // Level up reward: Level * 50 Coins
      newStats.coins = (newStats.coins || 0) + (currentLevel * 50);

      // Trigger level up toast
      import("react-hot-toast").then(({ toast }) => {
        toast.success(`Chúc mừng! Bạn đã thăng cấp lên Level ${currentLevel}! 🎉`, {
          icon: "⭐",
          duration: 4000
        });
      });
    }

    newStats.exp = currentExp;
    newStats.level = currentLevel;
  }

  return newStats;
};

export interface DailyQuest {
  id: string;
  title: string;
  target: number;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  reward: number;
  rewards?: any;
  type?: string;
}

const DEFAULT_QUESTS: DailyQuest[] = [
  {
    id: "q_time",
    title: "Học 5 phút",
    target: 300,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    reward: 1
  },
  {
    id: "q_flip",
    title: "Lật 10 thẻ bài",
    target: 10,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    reward: 2
  },
  {
    id: "q_combo",
    title: "Đạt Combo x5",
    target: 5,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    reward: 2
  }
];

export interface CustomDeck {
  id: string;
  type?: "flashcard" | "kanji"; // Thêm loại kanji
  title: string;
  description: string;
  count: number;
  level: string;
  cards: any[];
  kanjiList?: { char: string; meaning: string }[]; // Mảng chứa chữ Hán
  folderId?: string | null;
  createdAt?: string;
}

export interface DeckFolder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  isPinned?: boolean;
}

interface AppState {
  // --- APP SETTINGS SLICE ---
  appMode: "focus" | "fun";
  setAppMode: (mode: "focus" | "fun") => void;
  loadAppMode: () => void;

  // --- DYNAMIC SYSTEM METADATA ---
  systemItems: any[];
  dailyQuestsConfig: DailyQuest[];
  systemAchievements: any[];
  typeWeights: Record<string, number>;
  dailyLearningTimeRequired: number;
  isMetadataLoaded: boolean;
  fetchSystemMetadata: () => Promise<void>;

  user: User | null;
  setUser: (user: User | null) => void;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;

  // --- USER STATS SLICE ---
  userStats: UserStats;
  loadUserStats: () => Promise<void>;
  recordAction: () => Promise<void>;
  addLearningTime: (seconds: number) => Promise<void>;

  // --- DECK SLICE ---
  customDecks: CustomDeck[];
  isLoadingDecks: boolean;
  loadCustomDecks: (uid?: string) => Promise<void>;
  addCustomDeck: (deck: CustomDeck) => Promise<void>;
  deleteCustomDeck: (id: string) => Promise<void>;
  updateCustomDeck: (deck: CustomDeck) => Promise<void>;

  // --- FOLDER SLICE ---
  folders: DeckFolder[];
  loadFolders: (uid?: string) => Promise<void>;
  addFolder: (folder: DeckFolder) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  updateFolder: (id: string, data: Partial<DeckFolder>) => Promise<void>;
  moveDeckToFolder: (deckId: string, folderId: string | null) => Promise<void>;

  // --- PROGRESS SLICE ---
  progress: Record<string, string[]>;
  bossStatus: Record<string, "learning" | "boss_unlocked" | "completed">;
  bossFailedAttempts: Record<string, number>;
  loadProgress: (deckId: string) => Promise<void>;
  saveProgress: (deckId: string, knownIds: string[]) => Promise<void>;
  resetProgress: (deckId: string) => Promise<void>;
  recordWordStat: (wordId: string, isCorrect: boolean) => Promise<void>;
  submitBossResult: (deckId: string, isWin: boolean) => Promise<void>;

  // --- GACHA & QUESTS ACTIONS ---
  updateQuestProgress: (
    questId: string,
    value: number,
    isAbsolute?: boolean,
  ) => Promise<void>;
  claimQuestReward: (questId: string) => Promise<void>;
  deductCoins: (amount: number) => Promise<boolean>;
  addCoins: (amount: number) => Promise<void>;
  useFreeMinigameHint: () => Promise<boolean>;

  processGachaRoll: (
    item: any,
    isFullItem: boolean,
    duplicateFur: number,
    newPity: number
  ) => Promise<{ unlocked: boolean; shardsNow: number }>;
  processGachaRollsBatch: (
    rolls: { item: any; isFullItem: boolean; duplicateFur: number }[],
    newPity: number
  ) => Promise<{ unlocked: boolean; shardsNow: number }[]>;

  // --- GACHA EXTENSION & META-GAME ACTIONS ---
  equipFurniture: (slotId: string, itemId: string | null) => Promise<void>;
  harvestBones: () => Promise<number>;
  equipItem: (slotKey: string, itemId: string | null) => Promise<void>;
  equipTheme: (themeId: string | null) => Promise<void>;
  buyShopItem: (shopItemId: string, type: "shard" | "exclusive" | "consumable", targetId?: string) => Promise<boolean>;

  // --- VISUAL NOVEL SLICE ---
  activeStoryId: string | null;
  setActiveStoryId: (id: string | null) => void;

  // --- MINIGAME SLICE ---
  activeMinigameId: string | null;
  setActiveMinigameId: (id: string | null) => void;

  // --- KANJI PRACTICE SLICE ---
  activeKanjiPracticeDeck: CustomDeck | null;
  setActiveKanjiPracticeDeck: (deck: CustomDeck | null) => void;
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

  user: null,
  setUser: (user) => set({ user }),
  loginWithGoogle: async () => {
    const { signInWithPopup } = await import("firebase/auth");
    const { auth, googleProvider } = await import("@/lib/firebase");
    const { toast } = await import("react-hot-toast");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      set({ user: result.user });
      toast.success("Đăng nhập thành công! 🎉", { icon: "🚀" });
      return result.user;
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      toast.error("Đăng nhập thất bại. Bạn thử lại nhé! 💦", { icon: "🥺" });
      throw error;
    }
  },
  logout: async () => {
    const { signOut } = await import("firebase/auth");
    const { auth } = await import("@/lib/firebase");
    const { toast } = await import("react-hot-toast");
    try {
      await signOut(auth);
      set({ user: null });
      toast.success("Đã đăng xuất! Hẹn gặp lại nhé 👋", { icon: "👋" });
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      toast.error("Đăng xuất thất bại!");
      throw error;
    }
  },

  // --- DYNAMIC SYSTEM METADATA STATE ---
  systemItems: [],
  dailyQuestsConfig: [],
  systemAchievements: [],
  typeWeights: {},
  dailyLearningTimeRequired: 300,
  isMetadataLoaded: false,

  fetchSystemMetadata: async () => {
    if (get().isMetadataLoaded) return;
    try {
      const [itemsSnap, questsSnap, weightsSnap, settingsSnap, achievementsSnap] = await Promise.all([
        getDocs(collection(db, "system_items")),
        getDocs(collection(db, "daily_quests")),
        getDoc(doc(db, "system_config", "gacha_type_weights")),
        getDoc(doc(db, "system_config", "settings")),
        getDocs(collection(db, "system_achievements"))
      ]);

      const items: any[] = [];
      itemsSnap.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });

      const quests: any[] = [];
      questsSnap.forEach(doc => {
        quests.push({ id: doc.id, ...doc.data() });
      });

      const achievements: any[] = [];
      achievementsSnap.forEach(doc => {
        achievements.push({ id: doc.id, ...doc.data() });
      });

      const weights = weightsSnap.exists() ? weightsSnap.data() : {
        theme: 10,
        outfit: 25,
        furniture: 50,
        voice: 60,
        meme: 80,
        accessory: 100,
        costume: 20
      };

      const settings = settingsSnap.exists() ? settingsSnap.data() : { daily_learning_time_required: 300 };
      const dailyLearningTimeRequired = settings.daily_learning_time_required || 300;

      set({
        systemItems: items,
        dailyQuestsConfig: quests,
        systemAchievements: achievements,
        typeWeights: weights,
        dailyLearningTimeRequired,
        isMetadataLoaded: true,
      });
      console.log("System metadata loaded dynamically from Firestore! count:", items.length, "achievements:", achievements.length);
    } catch (e) {
      console.error("Failed to load system metadata from Firestore:", e);
      // Keep isMetadataLoaded as false so components know we are offline/error
    }
  },

  // 1. STATE MẶC ĐỊNH
  userStats: {
    streak: 0,
    cardsFlippedToday: 0,
    totalLearned: 0,
    learningTimeToday: 0,
    lastActiveDate: new Date().toLocaleDateString("en-CA"),
    level: 1,
    exp: 0,
    dailyTimeGoalClaimed: false,
    studyHistory: {},
    // --- GACHA & QUESTS ---
    freeMinigameHints: 3,
    coins: 0,
    inventory: [],
    dailyQuests: { date: "", quests: DEFAULT_QUESTS },
    // --- GACHA 2.0 & META-GAME ---
    goldenFur: 0,
    shards: {},
    equippedTheme: null,
    pityCounter: 0,
    // --- GACHA EXTENSION & META-GAME ---
    lastHarvestTime: new Date().toISOString(),
    equippedFurniture: {},
    equippedSlots: {
      head: null,
      armor: null,
      earring: null,
      gloves: null,
      mount: null,
      aura: null,
      costume: null,
      voice: null,
    },
    buffDoubleBonesUntil: null,
    buffLuckyGachaRolls: 0,
    wordStats: {},
    baseStats: {
      hp: 150,
      atk: 25,
      def: 10,
      crit: 5,
    },
  },

  // 1.5 VISUAL NOVEL STATE
  activeStoryId: null,
  setActiveStoryId: (id) => set({ activeStoryId: id }),

  // 1.6 MINIGAME STATE
  activeMinigameId: null,
  setActiveMinigameId: (id) => set({ activeMinigameId: id }),

  // 1.7 KANJI PRACTICE STATE
  activeKanjiPracticeDeck: null,
  setActiveKanjiPracticeDeck: (deck) => set({ activeKanjiPracticeDeck: deck }),

  // 2. HÀM TẢI DỮ LIỆU (Đã tích hợp Firestore)
  loadUserStats: async () => {
    const uid = get().user?.uid;
    const today = new Date().toLocaleDateString("en-CA");

    // Load metadata first
    await get().fetchSystemMetadata();

    // Nếu chưa đăng nhập -> Trả về state mặc định sạch sẽ, KHÔNG ĐỌC LOCAL
    if (!uid) {
      set({
        userStats: {
          streak: 0,
          cardsFlippedToday: 0,
          totalLearned: 0, // Không còn local để đếm, mặc định là 0
          learningTimeToday: 0,
          lastActiveDate: today,
          level: 1,
          exp: 0,
          dailyTimeGoalClaimed: false,
          studyHistory: {},
          coins: 0,
          role: "user",
          freeMinigameHints: 3,
          inventory: [],
          dailyQuests: (() => {
            const pool = get().dailyQuestsConfig.length > 0 ? get().dailyQuestsConfig : DEFAULT_QUESTS;
            let hash = 0;
            for (let i = 0; i < today.length; i++) {
              hash = today.charCodeAt(i) + ((hash << 5) - hash);
            }
            const selectedIdx = Math.abs(hash) % pool.length;
            const selectedQuest = {
              ...pool[selectedIdx],
              progress: 0,
              isCompleted: false,
              isClaimed: false,
            };
            return { date: today, quests: [selectedQuest] };
          })(),
          goldenFur: 0,
          shards: {},
          equippedTheme: null,
          pityCounter: 0,
          lastHarvestTime: new Date().toISOString(),
          equippedFurniture: {},
          equippedSlots: {
            head: null,
            armor: null,
            earring: null,
            gloves: null,
            mount: null,
            aura: null,
            costume: null,
            voice: null,
          },
          buffDoubleBonesUntil: null,
          buffLuckyGachaRolls: 0,
          wordStats: {},
          baseStats: {
            hp: 150,
            atk: 25,
            def: 10,
            crit: 5,
          },
        },
      });
      return;
    }

    let savedStats: any = {};

    try {
      const docRef = doc(db, "user_stats", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        savedStats = docSnap.data();
      }
    } catch (error) {
      console.error("Lỗi lấy thống kê từ mây:", error);
    }

    // Tự động đồng bộ email và displayName lên mây để Admin có thể xem danh sách
    if (uid && get().user) {
      setDoc(
        doc(db, "user_stats", uid),
        {
          displayName: get().user?.displayName || "",
          email: get().user?.email || "",
        },
        { merge: true },
      ).catch(() => { });
    }

    let currentStreak = savedStats.streak || 0;
    let flippedToday = savedStats.cardsFlippedToday || 0;
    let learningTime = savedStats.learningTimeToday || 0;
    let freeHints = savedStats.freeMinigameHints ?? 3;
    let dailyTimeGoalClaimed = savedStats.dailyTimeGoalClaimed || false;
    let studyHistory = savedStats.studyHistory || {};
    const lastActiveDate = savedStats.lastActiveDate;

    if (lastActiveDate !== today) {
      flippedToday = 0;
      learningTime = 0;
      freeHints = 3; // Reset lượt free mỗi ngày
      dailyTimeGoalClaimed = false; // Reset dailyTimeGoalClaimed
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
      setDoc(
        doc(db, "user_stats", uid),
        {
          streak: currentStreak,
          cardsFlippedToday: flippedToday,
          learningTimeToday: learningTime,
          freeMinigameHints: freeHints,
          dailyTimeGoalClaimed: false,
          lastActiveDate: today,
        },
        { merge: true },
      ).catch(() => { });
    }

    set({
      userStats: {
        streak: currentStreak,
        cardsFlippedToday: flippedToday,
        totalLearned: savedStats.totalLearned || 0,
        learningTimeToday: learningTime,
        lastActiveDate: today || new Date().toLocaleDateString("en-CA"),
        level: savedStats.level || 1,
        exp: savedStats.exp || 0,
        dailyTimeGoalClaimed: dailyTimeGoalClaimed,
        studyHistory: studyHistory,
        // --- GACHA & QUESTS ---
        freeMinigameHints: freeHints,
        coins: savedStats.coins || 0,
        role: savedStats.role || "user",
        inventory: savedStats.inventory || [],
        dailyQuests: (() => {
          if (savedStats.dailyQuests && savedStats.dailyQuests.date === today) {
            return savedStats.dailyQuests;
          }
          const pool = get().dailyQuestsConfig.length > 0 ? get().dailyQuestsConfig : DEFAULT_QUESTS;
          let hash = 0;
          for (let i = 0; i < today.length; i++) {
            hash = today.charCodeAt(i) + ((hash << 5) - hash);
          }
          const selectedIdx = Math.abs(hash) % pool.length;
          const selectedQuest = {
            ...pool[selectedIdx],
            progress: 0,
            isCompleted: false,
            isClaimed: false,
          };
          return { date: today, quests: [selectedQuest] };
        })(),
        // --- GACHA 2.0 & META-GAME ---
        goldenFur: savedStats.goldenFur || 0,
        shards: savedStats.shards || {},
        equippedTheme: savedStats.equippedTheme || null,
        pityCounter: savedStats.pityCounter || 0,
        // --- GACHA EXTENSION & META-GAME ---
        lastHarvestTime: savedStats.lastHarvestTime || new Date().toISOString(),
        equippedFurniture: savedStats.equippedFurniture || {},
        equippedSlots: {
          head: savedStats.equippedSlots?.head || null,
          armor: savedStats.equippedSlots?.armor || null,
          earring: savedStats.equippedSlots?.earring || null,
          gloves: savedStats.equippedSlots?.gloves || null,
          mount: savedStats.equippedSlots?.mount || null,
          aura: savedStats.equippedSlots?.aura || null,
          costume: savedStats.equippedSlots?.costume || null,
          voice: savedStats.equippedSlots?.voice || null,
        },
        buffDoubleBonesUntil: savedStats.buffDoubleBonesUntil || null,
        buffLuckyGachaRolls: savedStats.buffLuckyGachaRolls || 0,
        wordStats: savedStats.wordStats || {},
        baseStats: savedStats.baseStats || {
          hp: 150,
          atk: 25,
          def: 10,
          crit: 5,
        },
      },
    });
  },

  // 3. HÀM LƯU HÀNH ĐỘNG LẬT THẺ
  recordAction: async () => {
    const state = get();
    const today = new Date().toLocaleDateString("en-CA");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = state.userStats.streak || 0;
    let newFlipped =
      (state.userStats.lastActiveDate === today
        ? state.userStats.cardsFlippedToday || 0
        : 0) + 1;
    let newLearningTime =
      state.userStats.lastActiveDate === today
        ? state.userStats.learningTimeToday || 0
        : 0;

    if (state.userStats.lastActiveDate !== today) {
      newStreak =
        state.userStats.lastActiveDate === yesterday.toLocaleDateString("en-CA")
          ? newStreak + 1
          : 1;
    }

    const updatedStats = {
      streak: newStreak,
      cardsFlippedToday: newFlipped,
      learningTimeToday: newLearningTime,
      lastActiveDate: today,
    };
    const newUserStats = { ...state.userStats, ...updatedStats };

    set({ userStats: newUserStats });

    // Bắn dữ liệu lên Firestore ngầm
    const uid = state.user?.uid;
    if (uid) {
      try {
        await setDoc(doc(db, "user_stats", uid), updatedStats, { merge: true });
      } catch (error) {
        console.error("Lỗi đồng bộ recordAction:", error);
      }
    }

    // Tăng tiến độ quest lật thẻ
    const activeQuest = state.userStats.dailyQuests.quests[0];
    if (activeQuest && (activeQuest.type === "flip_cards" || activeQuest.id === "q_flip")) {
      get().updateQuestProgress(activeQuest.id, 1);
    }
  },

  // 4. HÀM CỘNG GIỜ HỌC
  addLearningTime: async (seconds: number) => {
    const state = get();
    const today = new Date().toLocaleDateString("en-CA");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let currentLearningTime =
      (state.userStats.lastActiveDate === today
        ? state.userStats.learningTimeToday || 0
        : 0) + seconds;
    let currentFlipped =
      state.userStats.lastActiveDate === today
        ? state.userStats.cardsFlippedToday || 0
        : 0;
    let currentStreak = state.userStats.streak || 0;

    if (state.userStats.lastActiveDate !== today) {
      currentStreak =
        state.userStats.lastActiveDate === yesterday.toLocaleDateString("en-CA")
          ? currentStreak + 1
          : 1;
    }

    const studyHistory = { ...state.userStats.studyHistory };
    studyHistory[today] = (studyHistory[today] || 0) + seconds;

    let newStats = { ...state.userStats };
    let dailyTimeGoalClaimed = newStats.dailyTimeGoalClaimed || false;
    const requiredTime = state.dailyLearningTimeRequired || 300;

    if (currentLearningTime >= requiredTime && !dailyTimeGoalClaimed) {
      dailyTimeGoalClaimed = true;
      newStats = applyRewards(newStats, { exp: 50 });
      import("react-hot-toast").then(({ toast }) => {
        toast.success("Đạt mục tiêu học tối thiểu hôm nay! +50 EXP 🎉", { icon: "🔥" });
      });
    }

    const updatedStats = {
      streak: currentStreak,
      cardsFlippedToday: currentFlipped,
      learningTimeToday: currentLearningTime,
      lastActiveDate: today,
      studyHistory,
      dailyTimeGoalClaimed,
      level: newStats.level,
      exp: newStats.exp,
      coins: newStats.coins,
      inventory: newStats.inventory,
      goldenFur: newStats.goldenFur,
    };
    const newUserStats = { ...state.userStats, ...updatedStats };

    set({ userStats: newUserStats });

    // Bắn dữ liệu lên Firestore ngầm
    const uid = state.user?.uid;
    if (uid) {
      try {
        await setDoc(doc(db, "user_stats", uid), updatedStats, { merge: true });
      } catch (error) {
        console.error("Lỗi đồng bộ addLearningTime:", error);
      }
    }

    // Tăng tiến độ quest học thời gian
    const activeQuest = state.userStats.dailyQuests.quests[0];
    if (activeQuest && (activeQuest.type === "study_time" || activeQuest.id === "q_time")) {
      get().updateQuestProgress(activeQuest.id, seconds);
    }
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
        decks.sort(
          (a: any, b: any) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );
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
  addCustomDeck: async (deck) => {
    // Optimistic update, add to the top to match sorting logic in loadCustomDecks
    const currentDecks = get().customDecks;
    const updated = [deck, ...currentDecks];
    set({ customDecks: updated });

    const uid = get().user?.uid;
    if (uid) {
      await setDoc(doc(db, "decks", deck.id), { ...deck, userId: uid });
    } else {
      localStorage.setItem("custom_decks", JSON.stringify(updated));
    }
  },
  deleteCustomDeck: async (id) => {
    // Optimistic update
    const currentDecks = get().customDecks;
    const updated = currentDecks.filter((d) => d.id !== id);
    set({ customDecks: updated });

    const uid = get().user?.uid;
    if (uid) {
      await deleteDoc(doc(db, "decks", id));
    } else {
      localStorage.setItem("custom_decks", JSON.stringify(updated));
    }
  },
  updateCustomDeck: async (updatedDeck) => {
    // Optimistic UI update
    const currentDecks = get().customDecks;
    const updatedDecks = currentDecks.map((deck) =>
      deck.id === updatedDeck.id ? updatedDeck : deck,
    );
    set({ customDecks: updatedDecks });

    const uid = get().user?.uid;
    if (uid) {
      // Overwrite the document in Firestore with the new deck data
      await setDoc(doc(db, "decks", updatedDeck.id), updatedDeck, {
        merge: true,
      });
    } else {
      // Update in localStorage
      localStorage.setItem("custom_decks", JSON.stringify(updatedDecks));
    }
  },

  // 5.5. HÀM QUẢN LÝ THƯ MỤC (FOLDER SLICE)
  folders: [],
  loadFolders: async (uid) => {
    try {
      if (uid) {
        const q = query(collection(db, "folders"), where("userId", "==", uid));
        const snapshot = await getDocs(q);
        const folders: DeckFolder[] = [];
        snapshot.forEach((doc) => folders.push(doc.data() as DeckFolder));
        folders.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        set({ folders });
      } else {
        const stored = JSON.parse(
          localStorage.getItem("custom_folders") || "[]",
        );
        set({ folders: stored });
      }
    } catch (error) {
      console.error("Lỗi lấy thư mục:", error);
    }
  },
  addFolder: async (folder) => {
    const current = get().folders;
    const updated = [...current, folder];
    set({ folders: updated });

    const uid = get().user?.uid;
    if (uid) {
      await setDoc(doc(db, "folders", folder.id), { ...folder, userId: uid });
    } else {
      localStorage.setItem("custom_folders", JSON.stringify(updated));
    }
  },
  deleteFolder: async (id) => {
    const currentDecks = get().customDecks;
    const decksInFolder = currentDecks.filter((d) => d.folderId === id);

    const updatedDecks = currentDecks.map((d) =>
      d.folderId === id ? { ...d, folderId: null } : d,
    );
    const updatedFolders = get().folders.filter((f) => f.id !== id);
    set({ folders: updatedFolders, customDecks: updatedDecks });

    const uid = get().user?.uid;
    if (uid) {
      await deleteDoc(doc(db, "folders", id));

      // Đẩy tất cả deck trong folder ra ngoài kho chính trên Firebase
      await Promise.all(
        decksInFolder.map((d) =>
          setDoc(doc(db, "decks", d.id), { folderId: null }, { merge: true }),
        ),
      ).catch((err) => console.error("Lỗi đồng bộ đưa thẻ ra ngoài:", err));
    } else {
      localStorage.setItem("custom_folders", JSON.stringify(updatedFolders));
      localStorage.setItem("custom_decks", JSON.stringify(updatedDecks));
    }
  },
  updateFolder: async (id, data) => {
    const current = get().folders;
    const updated = current.map((f) => (f.id === id ? { ...f, ...data } : f));
    set({ folders: updated });

    const uid = get().user?.uid;
    if (uid) {
      await setDoc(doc(db, "folders", id), data, { merge: true });
    } else {
      localStorage.setItem("custom_folders", JSON.stringify(updated));
    }
  },
  moveDeckToFolder: async (deckId, folderId) => {
    const currentDecks = get().customDecks;
    const updatedDecks = currentDecks.map((d) =>
      d.id === deckId ? { ...d, folderId } : d,
    );
    set({ customDecks: updatedDecks });

    const uid = get().user?.uid;
    if (uid) {
      await setDoc(doc(db, "decks", deckId), { folderId }, { merge: true });
    } else {
      localStorage.setItem("custom_decks", JSON.stringify(updatedDecks));
    }
  },

  // 6. HÀM QUẢN LÝ TIẾN ĐỘ HỌC (PROGRESS SLICE)
  progress: {},
  bossStatus: {},
  bossFailedAttempts: {},
  loadProgress: async (deckId) => {
    const uid = get().user?.uid;

    if (!uid) {
      // Chưa đăng nhập -> Chỉ lưu tạm trong RAM, F5 là mất
      set((state) => ({
        progress: { ...state.progress, [deckId]: [] },
        bossStatus: { ...state.bossStatus, [deckId]: "learning" },
        bossFailedAttempts: { ...state.bossFailedAttempts, [deckId]: 0 },
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
        set((state) => ({
          progress: { ...state.progress, [deckId]: knownIds },
          bossStatus: { ...state.bossStatus, [deckId]: status },
          bossFailedAttempts: { ...state.bossFailedAttempts, [deckId]: attempts },
        }));
      } else {
        set((state) => ({
          progress: { ...state.progress, [deckId]: [] },
          bossStatus: { ...state.bossStatus, [deckId]: "learning" },
          bossFailedAttempts: { ...state.bossFailedAttempts, [deckId]: 0 },
        }));
      }
    } catch (error) {
      console.error("Lỗi lấy tiến độ từ mây:", error);
    }
  },

  saveProgress: async (deckId, knownIds) => {
    const state = get();
    const prevProgress = state.progress[deckId] || [];

    // Calculate bossStatus update
    const currentBossStatus = state.bossStatus[deckId] || "learning";
    let newBossStatus = currentBossStatus;

    let totalCards = 0;
    const customDeck = state.customDecks.find((d) => d.id === deckId);
    if (customDeck) {
      totalCards = customDeck.cards?.length || 0;
    }

    if (totalCards === 0) {
      try {
        const res = await fetch("/data/configs/system_decks.json");
        if (res.ok) {
          const decks = await res.json();
          const deck = decks.find((d: any) => d.id === deckId);
          if (deck) {
            totalCards = deck.totalCards || 0;
          }
        }
      } catch (e) {
        console.error("Lỗi fetch system deck size trong saveProgress:", e);
      }
    }

    if (totalCards > 0 && knownIds.length >= totalCards) {
      if (currentBossStatus === "learning") {
        newBossStatus = "boss_unlocked";
      }
    } else {
      if (knownIds.length < totalCards) {
        newBossStatus = "learning";
      }
    }

    // 1. Update State trước để UI mượt (Optimistic update)
    set((state) => ({
      progress: { ...state.progress, [deckId]: knownIds },
      bossStatus: { ...state.bossStatus, [deckId]: newBossStatus },
    }));

    // 2. Bắn data lên Firestore ngầm phía sau
    const uid = get().user?.uid;

    try {
      const res = await fetch("/data/configs/system_decks.json");
      if (res.ok) {
        const decks = await res.json();
        const deck = decks.find((d: any) => d.id === deckId);
        if (deck) {
          // Tính toán trạng thái hoàn thành trước đó
          const wasCompleted = deck.type === "chest" || deck.type === "story" || deck.type === "minigame_matching" || deck.type === "minigame_kanji" || deck.type === "minigame_rush"
            ? prevProgress.length > 0
            : (deck.totalCards === 0 || prevProgress.length >= (deck.totalCards || 0));

          // Tính toán trạng thái hoàn thành hiện tại
          const isCompleted = deck.type === "chest" || deck.type === "story" || deck.type === "minigame_matching" || deck.type === "minigame_kanji" || deck.type === "minigame_rush"
            ? knownIds.length > 0
            : (deck.totalCards === 0 || knownIds.length >= (deck.totalCards || 0));

          if (isCompleted && !wasCompleted) {
            let rewards = deck.rewards;
            if (!rewards) {
              const fallbackCoins = deck.rewardCoins || 0;
              const fallbackExp = (deck.type === "minigame_kanji" || deck.type === "minigame_rush" || deck.type === "minigame_matching") ? 50 : 30;
              rewards = { coins: fallbackCoins, exp: fallbackExp };
            }

            if (deck.type === "chest") {
              rewards = { ...rewards, coins: 0 }; // Deduplicate coin reward as chest handler already gives coins
            }

            const newUserStats = applyRewards(state.userStats, rewards);
            set({ userStats: newUserStats });

            if (uid) {
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
            }

            if (rewards.exp || rewards.coins || (rewards.items && rewards.items.length > 0)) {
              import("react-hot-toast").then(({ toast }) => {
                let msg = `Hoàn thành "${deck.title}"!`;
                if (rewards.exp) msg += ` +${rewards.exp} EXP`;
                if (rewards.coins) msg += ` +${rewards.coins} xu`;
                toast.success(msg, { icon: "🎉" });
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Lỗi khi tính toán phần thưởng node:", err);
    }

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
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Lỗi lưu tiến độ lên mây:", error);
    }
  },

  resetProgress: async (deckId) => {
    // 1. Xóa trong State
    set((state) => ({
      progress: { ...state.progress, [deckId]: [] },
      bossStatus: { ...state.bossStatus, [deckId]: "learning" },
      bossFailedAttempts: { ...state.bossFailedAttempts, [deckId]: 0 },
    }));

    // 2. Xóa trên Firestore
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

      import("react-hot-toast").then(({ toast }) => {
        toast.success(`Chúc mừng! Bạn đã tiêu diệt Boss thành công và hoàn thành bài học! Thưởng ${rewards.exp} EXP + ${rewards.coins} xu! 🎉🦊`, {
          duration: 5000,
          icon: "👑"
        });
      });
    } else {
      newAttempts += 1;
      if (newAttempts >= 3) {
        newStatus = "learning";
        newAttempts = 0;
        nextKnownIds = []; // reset progress

        // Toast cảnh báo
        import("react-hot-toast").then(({ toast }) => {
          toast.error("Bạn đã thua 3 lần liên tiếp! Thách đấu Boss bị khóa. Bạn phải học lại từ đầu để mở khóa Boss! 💔", {
            duration: 6000,
            icon: "💔"
          });
        });
      } else {
        // Toast báo số mạng còn lại
        import("react-hot-toast").then(({ toast }) => {
          toast.error(`Chiến bại! Bạn còn ${3 - newAttempts} cơ hội trước khi tiến độ học bài này bị reset! 💔`, {
            duration: 4000
          });
        });
      }
    }

    // Cập nhật State
    set((state) => ({
      bossStatus: { ...state.bossStatus, [deckId]: newStatus },
      bossFailedAttempts: { ...state.bossFailedAttempts, [deckId]: newAttempts },
      progress: { ...state.progress, [deckId]: nextKnownIds },
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
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Lỗi đồng bộ submitBossResult:", error);
      }
    }
  },

  // 7. HÀM QUẢN LÝ GACHA VÀ NHIỆM VỤ (QUESTS & GACHA SLICE)
  updateQuestProgress: async (questId, value, isAbsolute = false) => {
    const state = get();
    const today = new Date().toLocaleDateString("en-CA");

    let currentQuests = state.userStats.dailyQuests.quests;
    if (state.userStats.dailyQuests.date !== today) {
      currentQuests = DEFAULT_QUESTS.map((q) => ({
        ...q,
        progress: 0,
        isCompleted: false,
        isClaimed: false,
      }));
    }

    let isChanged = false;
    const updatedQuests = currentQuests.map((q) => {
      if (q.id === questId && !q.isCompleted) {
        // Nếu là update absolute (như Combo), chỉ cập nhật nếu giá trị mới cao hơn kỷ lục cao nhất hiện tại
        const newProgress = isAbsolute
          ? Math.max(q.progress, value)
          : q.progress + value;
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
          { merge: true },
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

    const newDailyQuests = { date: state.userStats.dailyQuests.date, quests: updatedQuests };

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
            dailyQuests: newDailyQuests
          },
          { merge: true },
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
        // Cập nhật ngầm lên mây (Fire and forget) để UI phản hồi ngay lập tức
        setDoc(doc(db, "user_stats", uid), { coins: newCoins }, { merge: true }).catch(
          (error) => console.error("Lỗi deductCoins:", error)
        );
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
          { merge: true },
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

    // Decrement buffLuckyGachaRolls by the number of rolls in the batch (up to available rolls)
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
        newShards[item.id] = (newShards[item.id] || 0) + 1; // Rớt 1 mảnh
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
        shardsNow: newShards[item.id] || 0
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
        { merge: true },
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
        // Cập nhật ngầm lên mây (Fire and forget) để UI phản hồi ngay lập tức
        setDoc(doc(db, "user_stats", uid), { freeMinigameHints: newHints }, { merge: true }).catch(
          (error) => console.error("Lỗi đồng bộ useFreeMinigameHint:", error)
        );
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
          { merge: true },
        );
      } catch (error) {
        console.error("Lỗi equipFurniture:", error);
      }
    }
  },

  harvestBones: async () => {
    const state = get();
    const lastHarvest = new Date(state.userStats.lastHarvestTime || new Date().toISOString()).getTime();
    const now = Date.now();
    const elapsedHours = (now - lastHarvest) / (1000 * 60 * 60);

    const totalBonesPerHour = Object.values(state.userStats.equippedFurniture || {}).reduce((sum, itemId) => {
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
        { merge: true },
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
          { merge: true },
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
          { merge: true },
        );
      } catch (error) {
        console.error("Lỗi đồng bộ equipTheme:", error);
      }
    }
  },

  buyShopItem: async (shopItemId, type, targetId) => {
    const state = get();
    const { SHARD_PRICES } = await import("@/constants/shopItems");

    let cost = 0;
    if (type === "shard") {
      if (!targetId) return false;
      const targetItem = state.systemItems.find(i => i.id === targetId);
      if (!targetItem) return false;
      cost = targetItem.shardPrice !== undefined ? targetItem.shardPrice : (SHARD_PRICES[targetItem.rarity] || 0);
    } else if (type === "exclusive") {
      const item = state.systemItems.find(i => i.id === shopItemId);
      if (!item) return false;
      cost = item.cost;
    } else if (type === "consumable") {
      const item = state.systemItems.find(i => i.id === shopItemId);
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
      const targetItem = state.systemItems.find(i => i.id === targetId);
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

      const targetItem = state.systemItems.find(i => i.id === shopItemId);
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
}));

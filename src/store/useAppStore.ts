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
import dailyQuestsJson from "../../public/data/configs/daily_quests.json";

interface UserStats {
  streak: number;
  cardsFlippedToday: number;
  totalLearned: number;
  learningTimeToday: number;
  lastActiveDate: string;
  role?: string | null;
  // --- GACHA & QUESTS ---
  freeMinigameHints: number;
  coins: number;
  inventory: string[];
  equippedSticker: string | null;
  dailyQuests: {
    date: string;
    quests: DailyQuest[];
  };
  // --- GACHA 2.0 & META-GAME ---
  goldenFur: number;
  shards: Record<string, number>;
  furniture: string[];
  equippedTheme: string | null;
  equippedOutfit: string | null;
  pityCounter: number;
  // --- GACHA EXTENSION & META-GAME ---
  lastHarvestTime: string;
  equippedFurniture: Record<string, string>;
  equippedVoicePack: string | null;
  unlockedMemes: string[];
  unlockedVoices: string[];
  equippedSlots: {
    head: string | null;
    armor: string | null;
    earring: string | null;
    gloves: string | null;
    mount: string | null;
    aura: string | null;
  };
  buffDoubleBonesUntil: string | null;
  buffLuckyGachaRolls: number;
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

const DEFAULT_QUESTS: DailyQuest[] = dailyQuestsJson as DailyQuest[];

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
  loadProgress: (deckId: string) => Promise<void>;
  saveProgress: (deckId: string, knownIds: string[]) => Promise<void>;
  resetProgress: (deckId: string) => Promise<void>;

  // --- GACHA & QUESTS ACTIONS ---
  updateQuestProgress: (
    questId: string,
    value: number,
    isAbsolute?: boolean,
  ) => Promise<void>;
  claimQuestReward: (questId: string) => Promise<void>;
  deductCoins: (amount: number) => Promise<boolean>;
  addCoins: (amount: number) => Promise<void>;
  unlockSticker: (stickerId: string) => Promise<void>;
  useFreeMinigameHint: () => Promise<boolean>;
  equipSticker: (stickerId: string) => Promise<void>;

  // --- GACHA 2.0 ACTIONS ---
  processGachaRoll: (
    item: any,
    isFullItem: boolean,
    duplicateFur: number,
    newPity: number
  ) => Promise<{ unlocked: boolean; shardsNow: number }>;

  // --- GACHA EXTENSION & META-GAME ACTIONS ---
  equipFurniture: (slotId: string, itemId: string | null) => Promise<void>;
  equipVoicePack: (voicePackId: string | null) => Promise<void>;
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
    freeMinigameHints: 3,
    coins: 0,
    inventory: [],
    equippedSticker: null,
    dailyQuests: { date: "", quests: DEFAULT_QUESTS },
    // --- GACHA 2.0 & META-GAME ---
    goldenFur: 0,
    shards: {},
    furniture: [],
    equippedTheme: null,
    equippedOutfit: null,
    pityCounter: 0,
    // --- GACHA EXTENSION & META-GAME ---
    lastHarvestTime: new Date().toISOString(),
    equippedFurniture: {},
    equippedVoicePack: null,
    unlockedMemes: [],
    unlockedVoices: [],
    equippedSlots: {
      head: null,
      armor: null,
      earring: null,
      gloves: null,
      mount: null,
      aura: null,
    },
    buffDoubleBonesUntil: null,
    buffLuckyGachaRolls: 0,
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

    // Nếu chưa đăng nhập -> Trả về state mặc định sạch sẽ, KHÔNG ĐỌC LOCAL
    if (!uid) {
      set({
        userStats: {
          streak: 0,
          cardsFlippedToday: 0,
          totalLearned: 0, // Không còn local để đếm, mặc định là 0
          learningTimeToday: 0,
          lastActiveDate: today,
          coins: 0,
          role: "user",
          freeMinigameHints: 3,
          inventory: [],
          equippedSticker: null,
          dailyQuests: { date: today, quests: DEFAULT_QUESTS },
          goldenFur: 0,
          shards: {},
          furniture: [],
          equippedTheme: null,
          equippedOutfit: null,
          pityCounter: 0,
          lastHarvestTime: new Date().toISOString(),
          equippedFurniture: {},
          equippedVoicePack: null,
          unlockedMemes: [],
          unlockedVoices: [],
          equippedSlots: {
            head: null,
            armor: null,
            earring: null,
            gloves: null,
            mount: null,
            aura: null,
          },
          buffDoubleBonesUntil: null,
          buffLuckyGachaRolls: 0,
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
    const lastActiveDate = savedStats.lastActiveDate;

    if (lastActiveDate !== today) {
      flippedToday = 0;
      learningTime = 0;
      freeHints = 3; // Reset lượt free mỗi ngày
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
        // --- GACHA & QUESTS ---
        freeMinigameHints: freeHints,
        coins: savedStats.coins || 0,
        role: savedStats.role || "user",
        inventory: savedStats.inventory || [],
        equippedSticker: savedStats.equippedSticker || null,
        dailyQuests:
          savedStats.dailyQuests && savedStats.dailyQuests.date === today
            ? savedStats.dailyQuests
            : { date: today, quests: DEFAULT_QUESTS },
        // --- GACHA 2.0 & META-GAME ---
        goldenFur: savedStats.goldenFur || 0,
        shards: savedStats.shards || {},
        furniture: savedStats.furniture || [],
        equippedTheme: savedStats.equippedTheme || null,
        equippedOutfit: savedStats.equippedOutfit || null,
        pityCounter: savedStats.pityCounter || 0,
        // --- GACHA EXTENSION & META-GAME ---
        lastHarvestTime: savedStats.lastHarvestTime || new Date().toISOString(),
        equippedFurniture: savedStats.equippedFurniture || {},
        equippedVoicePack: savedStats.equippedVoicePack || null,
        unlockedMemes: savedStats.unlockedMemes || [],
        unlockedVoices: savedStats.unlockedVoices || [],
        equippedSlots: savedStats.equippedSlots || {
          head: null,
          armor: null,
          earring: null,
          gloves: null,
          mount: null,
          aura: null,
        },
        buffDoubleBonesUntil: savedStats.buffDoubleBonesUntil || null,
        buffLuckyGachaRolls: savedStats.buffLuckyGachaRolls || 0,
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
    get().updateQuestProgress("q_flip", 1);
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

    const updatedStats = {
      streak: currentStreak,
      cardsFlippedToday: currentFlipped,
      learningTimeToday: currentLearningTime,
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
  loadProgress: async (deckId) => {
    const uid = get().user?.uid;

    if (!uid) {
      // Chưa đăng nhập -> Chỉ lưu tạm trong RAM, F5 là mất
      set((state) => ({
        progress: { ...state.progress, [deckId]: [] },
      }));
      return;
    }

    try {
      const docRef = doc(db, "user_progress", `${uid}_${deckId}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const knownIds = docSnap.data().knownIds || [];
        set((state) => ({
          progress: { ...state.progress, [deckId]: knownIds },
        }));
      } else {
        set((state) => ({
          progress: { ...state.progress, [deckId]: [] },
        }));
      }
    } catch (error) {
      console.error("Lỗi lấy tiến độ từ mây:", error);
    }
  },

  saveProgress: async (deckId, knownIds) => {
    // 1. Update State trước để UI mượt (Optimistic update)
    set((state) => ({
      progress: { ...state.progress, [deckId]: knownIds },
    }));

    // 2. Bắn data lên Firestore ngầm phía sau
    const uid = get().user?.uid;
    if (!uid) return;

    try {
      await setDoc(
        doc(db, "user_progress", `${uid}_${deckId}`),
        {
          userId: uid,
          deckId: deckId,
          knownIds: knownIds,
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
      const newDailyQuests = {
        ...state.userStats.dailyQuests,
        quests: updatedQuests,
      };
      const newUserStats = {
        ...state.userStats,
        coins: newCoins,
        dailyQuests: newDailyQuests,
      };
      set({ userStats: newUserStats });

      const uid = get().user?.uid;
      if (uid) {
        try {
          await setDoc(
            doc(db, "user_stats", uid),
            {
              coins: newCoins,
              dailyQuests: newDailyQuests,
            },
            { merge: true },
          );
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

  unlockSticker: async (stickerId) => {
    const state = get();
    const currentInventory = state.userStats.inventory || [];

    // Nếu đã sở hữu sticker này rồi thì bỏ qua
    if (currentInventory.includes(stickerId)) return;

    const newInventory = [...currentInventory, stickerId];
    const newUserStats = { ...state.userStats, inventory: newInventory };
    set({ userStats: newUserStats });

    const uid = get().user?.uid;
    if (uid) {
      try {
        await setDoc(
          doc(db, "user_stats", uid),
          { inventory: newInventory },
          { merge: true },
        );
      } catch (error) {
        console.error("Lỗi unlockSticker:", error);
      }
    }
  },

  processGachaRoll: async (item, isFullItem, duplicateFur, newPity) => {
    const state = get();
    let newShards = { ...state.userStats.shards };
    let newInventory = [...(state.userStats.inventory || [])];
    let newFurniture = [...(state.userStats.furniture || [])];
    let newMemes = [...(state.userStats.unlockedMemes || [])];
    let newVoices = [...(state.userStats.unlockedVoices || [])];
    let newFur = (state.userStats.goldenFur || 0) + duplicateFur;
    let unlocked = false;

    const hasItem =
      newInventory.includes(item.id) ||
      newFurniture.includes(item.id) ||
      newMemes.includes(item.id) ||
      newVoices.includes(item.id);

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
      if (item.type === "furniture") newFurniture.push(item.id);
      else if (item.type === "meme") newMemes.push(item.id);
      else if (item.type === "voice") newVoices.push(item.id);
      else newInventory.push(item.id); // theme, outfit, sticker
    }

    const newUserStats = {
      ...state.userStats,
      shards: newShards,
      inventory: newInventory,
      furniture: newFurniture,
      unlockedMemes: newMemes,
      unlockedVoices: newVoices,
      goldenFur: newFur,
      pityCounter: newPity,
    };

    set({ userStats: newUserStats });

    const uid = state.user?.uid;
    if (uid) {
      // Cập nhật ngầm lên Firestore để lưu thay đổi tài sản
      setDoc(
        doc(db, "user_stats", uid),
        {
          shards: newShards,
          inventory: newInventory,
          furniture: newFurniture,
          unlockedMemes: newMemes,
          unlockedVoices: newVoices,
          goldenFur: newFur,
          pityCounter: newPity,
        },
        { merge: true },
      ).catch(() => { });
    }

    return { unlocked, shardsNow: newShards[item.id] || 0 };
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

  equipSticker: async (stickerId) => {
    const state = get();
    const newUserStats = { ...state.userStats, equippedSticker: stickerId };
    set({ userStats: newUserStats });

    const uid = get().user?.uid;
    if (uid) {
      try {
        await setDoc(
          doc(db, "user_stats", uid),
          { equippedSticker: stickerId },
          { merge: true },
        );
      } catch (error) {
        console.error("Lỗi equipSticker:", error);
      }
    }
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

  equipVoicePack: async (voicePackId) => {
    const state = get();
    const newUserStats = { ...state.userStats, equippedVoicePack: voicePackId };
    set({ userStats: newUserStats });

    const uid = state.user?.uid;
    if (uid) {
      try {
        await setDoc(
          doc(db, "user_stats", uid),
          { equippedVoicePack: voicePackId },
          { merge: true },
        );
      } catch (error) {
        console.error("Lỗi equipVoicePack:", error);
      }
    }
  },

  harvestBones: async () => {
    const state = get();
    const lastHarvest = new Date(state.userStats.lastHarvestTime || new Date().toISOString()).getTime();
    const now = Date.now();
    const elapsedHours = (now - lastHarvest) / (1000 * 60 * 60);

    const { GACHA_POOL } = await import("@/constants/gachaPool");

    const totalBonesPerHour = Object.values(state.userStats.equippedFurniture || {}).reduce((sum, itemId) => {
      const item = GACHA_POOL.find((i) => i.id === itemId);
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
    const { SHARD_PRICES, EXCLUSIVE_GOODS, CONSUMABLE_BUFFS } = await import("@/constants/shopItems");
    const { GACHA_POOL } = await import("@/constants/gachaPool");

    let cost = 0;
    if (type === "shard") {
      if (!targetId) return false;
      const targetItem = GACHA_POOL.find(i => i.id === targetId);
      if (!targetItem) return false;
      const rarity = targetItem.rarity;
      cost = SHARD_PRICES[rarity] || 0;
    } else if (type === "exclusive") {
      const item = EXCLUSIVE_GOODS.find(i => i.id === shopItemId);
      if (!item) return false;
      cost = item.cost;
    } else if (type === "consumable") {
      const item = CONSUMABLE_BUFFS.find(i => i.id === shopItemId);
      if (!item) return false;
      cost = item.cost;
    }

    if (cost <= 0 || (state.userStats.goldenFur || 0) < cost) {
      return false;
    }

    const newGoldenFur = (state.userStats.goldenFur || 0) - cost;
    const newShards = state.userStats.shards ? { ...state.userStats.shards } : {};
    const newInventory = state.userStats.inventory ? [...state.userStats.inventory] : [];
    const newFurniture = state.userStats.furniture ? [...state.userStats.furniture] : [];
    const newUnlockedVoices = state.userStats.unlockedVoices ? [...state.userStats.unlockedVoices] : [];
    let newDoubleBonesUntil = state.userStats.buffDoubleBonesUntil || null;
    let newLuckyGachaRolls = state.userStats.buffLuckyGachaRolls || 0;

    let dbUpdates: any = { goldenFur: newGoldenFur };

    if (type === "shard") {
      if (!targetId) return false;
      const targetItem = GACHA_POOL.find(i => i.id === targetId);
      if (!targetItem) return false;

      const alreadyOwned = newInventory.includes(targetId) ||
        newFurniture.includes(targetId) ||
        newUnlockedVoices.includes(targetId) ||
        (state.userStats.unlockedMemes || []).includes(targetId);
      if (alreadyOwned) return false;

      newShards[targetId] = (newShards[targetId] || 0) + 1;

      if (newShards[targetId] >= targetItem.shardTarget) {
        newShards[targetId] = 0;
        if (targetItem.type === "furniture") newFurniture.push(targetId);
        else if (targetItem.type === "voice") newUnlockedVoices.push(targetId);
        else newInventory.push(targetId);
      }

      dbUpdates.shards = newShards;
      dbUpdates.inventory = newInventory;
      dbUpdates.furniture = newFurniture;
      dbUpdates.unlockedVoices = newUnlockedVoices;
    } else if (type === "exclusive") {
      const alreadyOwned = newInventory.includes(shopItemId) ||
        newFurniture.includes(shopItemId) ||
        newUnlockedVoices.includes(shopItemId);
      if (alreadyOwned) return false;

      const targetItem = GACHA_POOL.find(i => i.id === shopItemId);
      if (!targetItem) return false;

      if (targetItem.type === "furniture") newFurniture.push(shopItemId);
      else if (targetItem.type === "voice") newUnlockedVoices.push(shopItemId);
      else newInventory.push(shopItemId);

      dbUpdates.inventory = newInventory;
      dbUpdates.furniture = newFurniture;
      dbUpdates.unlockedVoices = newUnlockedVoices;
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
      furniture: newFurniture,
      unlockedVoices: newUnlockedVoices,
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

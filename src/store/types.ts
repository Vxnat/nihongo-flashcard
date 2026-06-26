import { User } from "firebase/auth";

export interface UserStats {
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
  wordStats?: Record<string, { wrongCount: number; correctCount: number }>;
  baseStats?: {
    hp: number;
    atk: number;
    def: number;
    crit: number;
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
  rewards?: any;
  type?: string;
}

export interface CustomDeck {
  id: string;
  type?: "flashcard" | "kanji";
  title: string;
  description: string;
  count: number;
  level: string;
  cards: any[];
  kanjiList?: { char: string; meaning: string }[];
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

// Slice Interfaces
export interface AppSettingsSlice {
  appMode: "focus" | "fun";
  setAppMode: (mode: "focus" | "fun") => void;
  loadAppMode: () => void;

  systemItems: any[];
  dailyQuestsConfig: DailyQuest[];
  systemAchievements: any[];
  typeWeights: Record<string, number>;
  dailyLearningTimeRequired: number;
  isMetadataLoaded: boolean;
  fetchSystemMetadata: () => Promise<void>;
}

export interface AuthSlice {
  user: User | null;
  setUser: (user: User | null) => void;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
}

export interface UserStatsSlice {
  userStats: UserStats;
  loadUserStats: () => Promise<void>;
  recordAction: () => Promise<void>;
  addLearningTime: (seconds: number) => Promise<void>;
}

export interface DeckFolderSlice {
  customDecks: CustomDeck[];
  isLoadingDecks: boolean;
  loadCustomDecks: (uid?: string) => Promise<void>;
  addCustomDeck: (deck: CustomDeck) => Promise<void>;
  deleteCustomDeck: (id: string) => Promise<void>;
  updateCustomDeck: (deck: CustomDeck) => Promise<void>;

  folders: DeckFolder[];
  loadFolders: (uid?: string) => Promise<void>;
  addFolder: (folder: DeckFolder) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  updateFolder: (id: string, data: Partial<DeckFolder>) => Promise<void>;
  moveDeckToFolder: (deckId: string, folderId: string | null) => Promise<void>;
}

export interface ProgressSlice {
  progress: Record<string, string[]>;
  bossStatus: Record<string, "learning" | "boss_unlocked" | "completed">;
  bossFailedAttempts: Record<string, number>;
  completedDecks: Record<string, boolean>;
  loadProgress: (deckId: string) => Promise<void>;
  saveProgress: (deckId: string, knownIds: string[]) => Promise<void>;
  resetProgress: (deckId: string) => Promise<void>;
  recordWordStat: (wordId: string, isCorrect: boolean) => Promise<void>;
  submitBossResult: (deckId: string, isWin: boolean) => Promise<void>;
}

export interface GachaQuestSlice {
  // Quests & Gacha Actions
  updateQuestProgress: (
    questId: string,
    value: number,
    isAbsolute?: boolean
  ) => Promise<void>;
  claimQuestReward: (questId: string) => Promise<void>;
  deductCoins: (amount: number) => Promise<boolean>;
  deductGoldenFur: (amount: number) => Promise<boolean>;
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

  // Shiba Room Actions
  equipFurniture: (slotId: string, itemId: string | null) => Promise<void>;
  harvestBones: () => Promise<number>;
  equipItem: (slotKey: string, itemId: string | null) => Promise<void>;
  equipTheme: (themeId: string | null) => Promise<void>;
  buyShopItem: (
    shopItemId: string,
    type: "shard" | "exclusive" | "consumable",
    targetId?: string
  ) => Promise<boolean>;

  // Visual Novel Slice
  activeStoryId: string | null;
  setActiveStoryId: (id: string | null) => void;

  // Minigame Slice
  activeMinigameId: string | null;
  setActiveMinigameId: (id: string | null) => void;

  // Kanji Practice Slice
  activeKanjiPracticeDeck: CustomDeck | null;
  setActiveKanjiPracticeDeck: (deck: CustomDeck | null) => void;
}

export type AppState = AppSettingsSlice &
  AuthSlice &
  UserStatsSlice &
  DeckFolderSlice &
  ProgressSlice &
  GachaQuestSlice;

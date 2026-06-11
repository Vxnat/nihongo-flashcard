import { create } from "zustand";

interface UserStats {
  streak: number;
  cardsFlippedToday: number;
  totalLearned: number;
  learningTimeToday: number;
  lastActiveDate: string;
}

export interface CustomDeck {
  id: string;
  title: string;
  description: string;
  count: number;
  level: string;
  cards: any[];
}

interface AppState {
  // --- USER STATS SLICE ---
  userStats: UserStats;
  loadUserStats: () => void;
  recordAction: () => void;
  addLearningTime: (seconds: number) => void;

  // --- DECK SLICE ---
  customDecks: CustomDeck[];
  loadCustomDecks: () => void;
  addCustomDeck: (deck: CustomDeck) => void;
  deleteCustomDeck: (id: string) => void;

  // --- PROGRESS SLICE ---
  progress: Record<string, string[]>;
  loadProgress: (deckId: string) => void;
  saveProgress: (deckId: string, knownIds: string[]) => void;
  resetProgress: (deckId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // 1. STATE MẶC ĐỊNH
  userStats: {
    streak: 0,
    cardsFlippedToday: 0,
    totalLearned: 0,
    learningTimeToday: 0,
    lastActiveDate: new Date().toLocaleDateString("en-CA"),
  },

  // 2. HÀM TẢI DỮ LIỆU (Sau này thay bằng fetch DB)
  loadUserStats: () => {
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

    const today = new Date().toLocaleDateString("en-CA");
    const savedStats = JSON.parse(
      localStorage.getItem("flashcard_user_stats") || "{}",
    );

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
    }

    set({
      userStats: {
        streak: currentStreak,
        cardsFlippedToday: flippedToday,
        totalLearned: totalLearnedCount,
        learningTimeToday: learningTime,
        lastActiveDate: today || new Date().toLocaleDateString("en-CA"),
      },
    });
  },

  // 3. HÀM LƯU HÀNH ĐỘNG LẬT THẺ
  recordAction: () => {
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
  },

  // 4. HÀM CỘNG GIỜ HỌC
  addLearningTime: (seconds: number) => {
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
  },

  // 5. HÀM QUẢN LÝ BỘ BÀI (DECK SLICE)
  customDecks: [],
  loadCustomDecks: () => {
    const stored = JSON.parse(localStorage.getItem("custom_decks") || "[]");
    set({ customDecks: stored });
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
  loadProgress: (deckId) => {
    const saved = localStorage.getItem(`flashcard_progress_${deckId}`);
    set((state) => ({
      progress: {
        ...state.progress,
        [deckId]: saved ? JSON.parse(saved) : [],
      },
    }));
  },
  saveProgress: (deckId, knownIds) => {
    localStorage.setItem(
      `flashcard_progress_${deckId}`,
      JSON.stringify(knownIds),
    );
    set((state) => ({
      progress: { ...state.progress, [deckId]: knownIds },
    }));
  },
  resetProgress: (deckId) => {
    localStorage.removeItem(`flashcard_progress_${deckId}`);
    set((state) => ({
      progress: { ...state.progress, [deckId]: [] },
    }));
  },
}));

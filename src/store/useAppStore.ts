import { create } from "zustand";
import { AppState } from "./types";
import { createAppSettingsSlice } from "./slices/appSettingsSlice";
import { createAuthSlice } from "./slices/authSlice";
import { createUserStatsSlice } from "./slices/userStatsSlice";
import { createDeckFolderSlice } from "./slices/deckFolderSlice";
import { createProgressSlice } from "./slices/progressSlice";
import { createGachaQuestSlice } from "./slices/gachaQuestSlice";

// Re-export all types so that components and hooks importing from '@/store/useAppStore' remain fully compatible.
export * from "./types";

/**
 * Zustand Store chính của ứng dụng Nihongo Flashcard.
 * Sử dụng Zustand Slice Pattern để gộp các lát cắt logic (app settings, auth, stats, custom decks, progress, gacha/quests)
 * thành một hook dùng chung duy nhất, tăng tính mở rộng và dễ bảo trì.
 */
export const useAppStore = create<AppState>()((...a) => ({
  ...createAppSettingsSlice(...a),
  ...createAuthSlice(...a),
  ...createUserStatsSlice(...a),
  ...createDeckFolderSlice(...a),
  ...createProgressSlice(...a),
  ...createGachaQuestSlice(...a),
}));

import { StateCreator } from "zustand";
import { AppState, AppSettingsSlice } from "../types";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Slice quản lý cấu hình giao diện ứng dụng (Focus/Fun Mode)
 * và tải toàn bộ metadata hệ thống (Vật phẩm, Nhiệm vụ ngày, Thành tựu) từ Firestore.
 */
export const createAppSettingsSlice: StateCreator<
  AppState,
  [],
  [],
  AppSettingsSlice
> = (set, get) => ({
  appMode: "focus",
  systemItems: [],
  dailyQuestsConfig: [],
  systemAchievements: [],
  typeWeights: {},
  dailyLearningTimeRequired: 300,
  isMetadataLoaded: false,

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

  fetchSystemMetadata: async () => {
    if (get().isMetadataLoaded) return;
    try {
      const [itemsSnap, questsSnap, weightsSnap, settingsSnap, achievementsSnap] =
        await Promise.all([
          getDocs(collection(db, "system_items")),
          getDocs(collection(db, "daily_quests")),
          getDoc(doc(db, "system_config", "gacha_type_weights")),
          getDoc(doc(db, "system_config", "settings")),
          getDocs(collection(db, "system_achievements")),
        ]);

      const items: any[] = [];
      itemsSnap.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });

      const quests: any[] = [];
      questsSnap.forEach((doc) => {
        quests.push({ id: doc.id, ...doc.data() });
      });

      const achievements: any[] = [];
      achievementsSnap.forEach((doc) => {
        achievements.push({ id: doc.id, ...doc.data() });
      });

      const weights = weightsSnap.exists()
        ? weightsSnap.data()
        : {
          theme: 10,
          outfit: 25,
          furniture: 50,
          voice: 60,
          meme: 80,
          accessory: 100,
          costume: 20,
        };

      const settings = settingsSnap.exists()
        ? settingsSnap.data()
        : { daily_learning_time_required: 300 };
      const dailyLearningTimeRequired = settings.daily_learning_time_required || 300;

      set({
        systemItems: items,
        dailyQuestsConfig: quests,
        systemAchievements: achievements,
        typeWeights: weights,
        dailyLearningTimeRequired,
        isMetadataLoaded: true,
      });
      console.log(
        "System metadata loaded dynamically from Firestore! count:",
        items.length,
        "achievements:",
        achievements.length
      );
    } catch (e) {
      console.error("Failed to load system metadata from Firestore:", e);
    }
  },
});

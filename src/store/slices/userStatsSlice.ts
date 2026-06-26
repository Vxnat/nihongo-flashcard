import { StateCreator } from "zustand";
import { AppState, UserStatsSlice, UserStats } from "../types";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { applyRewards, DEFAULT_QUESTS } from "../helpers";
import { toast } from "react-hot-toast";

/**
 * Trả về các chỉ số cơ bản của ngày học hiện tại (Streak, thẻ đã lật, thời gian học)
 * Đã tự động xử lý reset khi bước sang ngày mới và cập nhật chuỗi Streak.
 */
function getUpdatedDailyStats(userStats: UserStats) {
  const today = new Date().toLocaleDateString("en-CA");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString("en-CA");

  const lastActiveDate = userStats.lastActiveDate;
  const isNewDay = lastActiveDate !== today;

  let streak = userStats.streak || 0;
  if (isNewDay) {
    streak = lastActiveDate === yesterdayStr ? streak + 1 : 1;
  }

  const cardsFlippedToday = isNewDay ? 0 : userStats.cardsFlippedToday || 0;
  const learningTimeToday = isNewDay ? 0 : userStats.learningTimeToday || 0;

  return {
    streak,
    cardsFlippedToday,
    learningTimeToday,
    lastActiveDate: today,
    today,
  };
}

/**
 * Slice quản lý các số liệu thống kê học tập (Streak, Số từ đã học, Cấp độ, Kinh nghiệm)
 * và ghi nhận các hành động tương tác (Lật thẻ, học thêm thời gian).
 */
export const createUserStatsSlice: StateCreator<
  AppState,
  [],
  [],
  UserStatsSlice
> = (set, get) => ({
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
    freeMinigameHints: 3,
    coins: 0,
    inventory: [],
    dailyQuests: { date: "", quests: DEFAULT_QUESTS },
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

  loadUserStats: async () => {
    const uid = get().user?.uid;
    const today = new Date().toLocaleDateString("en-CA");

    // Tải cấu hình hệ thống trước
    await get().fetchSystemMetadata();

    // Nếu chưa đăng nhập -> Trả về state mặc định sạch sẽ, KHÔNG ĐỌC LOCAL
    if (!uid) {
      set({
        userStats: {
          streak: 0,
          cardsFlippedToday: 0,
          totalLearned: 0,
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
        { merge: true }
      ).catch(() => {});
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
        { merge: true }
      ).catch(() => {});
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
        freeMinigameHints: freeHints,
        coins: savedStats.coins || 0,
        role: savedStats.role || "user",
        inventory: savedStats.inventory || [],
        dailyQuests: (() => {
          if (savedStats.dailyQuests && savedStats.dailyQuests.date === today) {
            return savedStats.dailyQuests;
          }
          const pool = get().dailyQuestsConfig.length > 0 ? get().dailyQuestsConfig : DEFAULT_QUESTS;
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
          return { date: today, quests: [selectedQuest] };
        })(),
        goldenFur: savedStats.goldenFur || 0,
        shards: savedStats.shards || {},
        equippedTheme: savedStats.equippedTheme || null,
        pityCounter: savedStats.pityCounter || 0,
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

  recordAction: async () => {
    const state = get();
    const { streak, cardsFlippedToday, learningTimeToday, lastActiveDate } = getUpdatedDailyStats(state.userStats);

    const updatedStats = {
      streak,
      cardsFlippedToday: cardsFlippedToday + 1,
      learningTimeToday,
      lastActiveDate,
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

  addLearningTime: async (seconds: number) => {
    const state = get();
    const { streak, cardsFlippedToday, learningTimeToday, lastActiveDate, today } = getUpdatedDailyStats(state.userStats);

    const newLearningTime = learningTimeToday + seconds;
    const studyHistory = { ...state.userStats.studyHistory };
    studyHistory[today] = (studyHistory[today] || 0) + seconds;

    let newStats = { ...state.userStats };
    let dailyTimeGoalClaimed = newStats.dailyTimeGoalClaimed || false;
    const requiredTime = state.dailyLearningTimeRequired || 300;

    if (newLearningTime >= requiredTime && !dailyTimeGoalClaimed) {
      dailyTimeGoalClaimed = true;
      newStats = applyRewards(newStats, { exp: 50 });
      toast.success("Đạt mục tiêu học tối thiểu hôm nay! +50 EXP 🎉", { icon: "🔥" });
    }

    const updatedStats = {
      streak,
      cardsFlippedToday,
      learningTimeToday: newLearningTime,
      lastActiveDate,
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
});

"use client";
import { useState, useEffect, useCallback } from "react";

export interface UserStats {
  streak: number;
  cardsFlippedToday: number;
  totalLearned: number;
  learningTimeToday?: number; // Dòng mới: Tính bằng giây
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>({
    streak: 0,
    cardsFlippedToday: 0,
    totalLearned: 0,
    learningTimeToday: 0,
  });

  const loadStats = useCallback(() => {
    // 1. TÍNH TỔNG TỪ ĐÃ THUỘC (Quét toàn bộ thẻ nhớ localStorage)
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

    // 2. XỬ LÝ NGÀY THÁNG & CHUỖI LỬA (STREAK)
    const today = new Date().toLocaleDateString("en-CA"); // Lấy chuẩn YYYY-MM-DD
    const savedStats = JSON.parse(
      localStorage.getItem("flashcard_user_stats") || "{}",
    );

    let currentStreak = savedStats.streak || 0;
    let flippedToday = savedStats.cardsFlippedToday || 0;
    let learningTime = savedStats.learningTimeToday || 0;
    const lastActiveDate = savedStats.lastActiveDate;

    // Kiểm tra xem đã bước sang ngày mới chưa
    if (lastActiveDate !== today) {
      flippedToday = 0; // Sang ngày mới -> Reset lại số thẻ lật hôm nay về 0
      learningTime = 0; // Reset luôn đồng hồ học

      // Tính ngày hôm qua
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString("en-CA");

      // Nếu ngày học cuối cùng KHÔNG PHẢI là hôm qua (và cũng ko phải hôm nay)
      // -> Nghĩa là đã lười biếng bỏ học -> Đứt chuỗi, dập tắt lửa! 💦
      if (
        lastActiveDate &&
        lastActiveDate !== yesterdayStr &&
        lastActiveDate !== today
      ) {
        currentStreak = 0;
      }
    }

    setStats({
      streak: currentStreak,
      cardsFlippedToday: flippedToday,
      totalLearned: totalLearnedCount,
      learningTimeToday: learningTime,
    });
  }, []);

  // Lắng nghe sự kiện để đồng bộ giữa mọi màn hình
  useEffect(() => {
    loadStats();
    window.addEventListener("stats_updated", loadStats);
    return () => window.removeEventListener("stats_updated", loadStats);
  }, [loadStats]);

  // 3. HÀM GHI NHẬN HÀNH ĐỘNG (Gọi mỗi khi vuốt hoặc lật thẻ)
  const recordAction = () => {
    const today = new Date().toLocaleDateString("en-CA");
    const savedStats = JSON.parse(
      localStorage.getItem("flashcard_user_stats") || "{}",
    );

    let newStreak = savedStats.streak || 0;
    let newFlipped = savedStats.cardsFlippedToday || 0;
    let newLearningTime = savedStats.learningTimeToday || 0;
    const lastActiveDate = savedStats.lastActiveDate;

    if (lastActiveDate === today) {
      // Học tiếp trong cùng 1 ngày -> Tăng số lượng thẻ lật
      newFlipped += 1;
    } else {
      // Cú lật thẻ ĐẦU TIÊN của một ngày mới!
      newFlipped = 1;
      newLearningTime = 0; // Reset thời gian học của ngày cũ

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString("en-CA");

      if (lastActiveDate === yesterdayStr) {
        newStreak += 1; // Nối tiếp chuỗi từ hôm qua 🔥
      } else {
        newStreak = 1; // Thắp lại ngọn lửa mới từ đầu 🔥
      }
    }

    // Lưu lại não bộ
    localStorage.setItem(
      "flashcard_user_stats",
      JSON.stringify({
        streak: newStreak,
        cardsFlippedToday: newFlipped,
        lastActiveDate: today,
        learningTimeToday: newLearningTime,
      }),
    );

    // Phóng tín hiệu ra toàn app để update thanh UI ngay lập tức
    window.dispatchEvent(new Event("stats_updated"));
  };

  // 4. HÀM CỘNG THỜI GIAN HỌC THẬT (Mới)
  const addLearningTime = useCallback((seconds: number) => {
    const today = new Date().toLocaleDateString("en-CA");
    const savedStats = JSON.parse(
      localStorage.getItem("flashcard_user_stats") || "{}",
    );

    let currentLearningTime = savedStats.learningTimeToday || 0;
    let currentFlipped = savedStats.cardsFlippedToday || 0;
    let currentStreak = savedStats.streak || 0;

    // Đề phòng trường hợp mở tab từ đêm hôm trước sang ngày hôm sau
    if (savedStats.lastActiveDate === today) {
      currentLearningTime += seconds;
    } else {
      // Bước sang ngày mới -> Xử lý chuỗi lửa và reset thời gian / số thẻ
      currentLearningTime = seconds;
      currentFlipped = 0;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString("en-CA");

      if (savedStats.lastActiveDate === yesterdayStr) {
        currentStreak += 1; // Nối chuỗi 🔥
      } else {
        currentStreak = 1; // Bắt đầu chuỗi mới 🔥
      }
    }

    savedStats.learningTimeToday = currentLearningTime;
    savedStats.cardsFlippedToday = currentFlipped;
    savedStats.streak = currentStreak;
    savedStats.lastActiveDate = today;

    localStorage.setItem("flashcard_user_stats", JSON.stringify(savedStats));

    // Chỉ đẩy update ra UI (không bắt buộc tải lại toàn bộ app để tránh giật lag)
    window.dispatchEvent(new Event("stats_updated"));
  }, []);

  return { stats, recordAction, refreshStats: loadStats, addLearningTime };
}

"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export interface UserStats {
  streak: number;
  cardsFlippedToday: number;
  totalLearned: number;
  learningTimeToday: number;
  lastActiveDate: string;
}

export function useUserStats() {
  const stats = useAppStore((state) => state.userStats);
  const loadStats = useAppStore((state) => state.loadUserStats);
  const recordAction = useAppStore((state) => state.recordAction);
  const addLearningTime = useAppStore((state) => state.addLearningTime);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, recordAction, refreshStats: loadStats, addLearningTime };
}

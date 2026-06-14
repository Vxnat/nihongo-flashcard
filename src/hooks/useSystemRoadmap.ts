"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";

export interface SystemDeck {
  id: string;
  title: string;
  level: string;
  chapter: number;
  order: number;
  prerequisite: string | null;
  rewardCoins: number;
  totalCards: number;
}

export function useSystemRoadmap() {
  const [decks, setDecks] = useState<SystemDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState("N5");

  const progress = useAppStore((state) => state.progress);
  const loadProgress = useAppStore((state) => state.loadProgress);
  const user = useAppStore((state: any) => state.user);

  useEffect(() => {
    fetch("/data/system_decks.json")
      .then((res) => {
        if (!res.ok) throw new Error("File not found");
        return res.json();
      })
      .then((data) => {
        setDecks(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tải roadmap:", err);
        setIsLoading(false);
      });
  }, []);

  // Tự động tải lại tiến độ học (progress) bất cứ khi nào danh sách bài học đã được tải,
  // hoặc trạng thái người dùng (đăng nhập/đăng xuất) thay đổi.
  useEffect(() => {
    if (decks.length > 0) {
      decks.forEach((d: SystemDeck) => loadProgress(d.id));
    }
  }, [decks, user, loadProgress]);

  const filteredDecks = decks.filter((d) => d.level === selectedLevel);

  const getDeckStatus = useCallback(
    (deck: SystemDeck) => {
      const learnedCount = (progress[deck.id] || []).length;
      const totalCount = deck.totalCards || 0;
      const completed = totalCount > 0 && learnedCount >= totalCount;

      let unlocked = true;
      if (deck.prerequisite) {
        const prereqDeck = decks.find((d) => d.id === deck.prerequisite);
        if (prereqDeck) {
          const preLearned = (progress[deck.prerequisite] || []).length;
          const preTotal = prereqDeck.totalCards || 0;
          unlocked = preTotal === 0 || preLearned >= preTotal;
        }
      }
      return { completed, unlocked, learnedCount, totalCount };
    },
    [decks, progress],
  );

  const deckStatuses = filteredDecks.map((deck) => ({
    deck,
    ...getDeckStatus(deck),
  }));

  return {
    isLoading,
    decks,
    selectedLevel,
    setSelectedLevel,
    deckStatuses,
  };
}

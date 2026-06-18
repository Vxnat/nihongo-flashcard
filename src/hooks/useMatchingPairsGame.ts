import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

import { useAppStore } from "@/store/useAppStore";
import { FlashcardData } from "@/types/flashcard";
import { useMinigameTimer } from "@/hooks/useMinigameTimer";
import { SystemDeck } from "@/hooks/useSystemRoadmap";

export interface BoardItem {
  id: string;
  flashcardId: string;
  type: "jp" | "vi";
  text: string;
  isMatched: boolean;
}

const MAX_HP = 3;
export const PHAO_DURATION_SECONDS = 5;
export const KINH_LUP_DURATION_SECONDS = 2;
const BASE_TIME_N5 = 90;
const BASE_TIME_N4_BELOW = 60;
export const TIME_BONUS_PER_5_SECONDS = 1;

interface UseMatchingPairsGameProps {
  cards: FlashcardData[];
  minigameDeck: SystemDeck;
  onWin: () => void;
}

export function useMatchingPairsGame({
  cards,
  minigameDeck,
  onWin,
}: UseMatchingPairsGameProps) {
  const { level: gameLevel, rewardCoins: baseRewardCoins } = minigameDeck;

  const addCoins = useAppStore((state) => state.addCoins);
  const deductCoins = useAppStore((state) => state.deductCoins);
  const useFreeMinigameHint = useAppStore((state) => state.useFreeMinigameHint);
  const freeMinigameHints = useAppStore(
    (state) => state.userStats.freeMinigameHints,
  );
  const progress = useAppStore((state) => state.progress);
  const isFirstClearRef = useRef<boolean>(false);

  // --- Game State ---
  const [boardItems, setBoardItems] = useState<BoardItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<BoardItem[]>([]);
  const [wrongMatch, setWrongMatch] = useState<string[]>([]);
  const [hp, setHp] = useState(MAX_HP);
  const [minigameStatus, setMinigameStatus] = useState<
    "playing" | "win" | "lose"
  >("playing");

  // --- Hint System State ---
  const [isPhaoActive, setIsPhaoActive] = useState(false);
  const [isKinhLupActive, setIsKinhLupActive] = useState(false);
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);

  // --- Timer Hook ---
  const initialDuration =
    gameLevel === "N5" ? BASE_TIME_N5 : BASE_TIME_N4_BELOW;
  const {
    timeLeft,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    progressPercent,
  } = useMinigameTimer({
    duration: initialDuration,
    onTimeUp: () => setMinigameStatus("lose"),
  });

  // --- First Clear Check ---
  useEffect(() => {
    if (minigameDeck?.id) {
      const completed = progress[minigameDeck.id]?.includes("completed");
      isFirstClearRef.current = !completed;
    }
  }, [minigameDeck, progress]);

  // --- Game Setup (on mount or restart) ---
  const setupGame = useCallback(() => {
    if (cards.length === 0) {
      setMinigameStatus("lose");
      return;
    }

    const gameCards: BoardItem[] = [];
    cards.forEach((card) => {
      gameCards.push({
        id: `jp-${card.id}`,
        flashcardId: card.id,
        type: "jp",
        text: card.reading ? `[${card.word}]{${card.reading}}` : card.word,
        isMatched: false,
      });
      gameCards.push({
        id: `vi-${card.id}`,
        flashcardId: card.id,
        type: "vi",
        text: card.meaning,
        isMatched: false,
      });
    });

    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setBoardItems(shuffledCards);
    setSelectedItems([]);
    setWrongMatch([]);
    setHp(MAX_HP);
    setMinigameStatus("playing");
    setIsPhaoActive(false);
    setIsKinhLupActive(false);
    setRevealedCardId(null);
    resetTimer();
    startTimer();
  }, [cards, startTimer, resetTimer]);

  useEffect(() => {
    setupGame();
  }, [setupGame]);

  // --- Card Matching Logic ---
  useEffect(() => {
    if (selectedItems.length === 2) {
      const [card1, card2] = selectedItems;

      if (
        card1.flashcardId === card2.flashcardId &&
        card1.type !== card2.type
      ) {
        setBoardItems((prev) =>
          prev.map((item) =>
            item.flashcardId === card1.flashcardId
              ? { ...item, isMatched: true }
              : item,
          ),
        );
        setSelectedItems([]);
        setWrongMatch([]);

        const cardElements = document.querySelectorAll(
          `[data-card-id="${card1.id}"], [data-card-id="${card2.id}"]`,
        );
        cardElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          confetti({
            particleCount: 50,
            spread: 70,
            origin: {
              x: (rect.left + rect.right) / 2 / window.innerWidth,
              y: (rect.top + rect.bottom) / 2 / window.innerHeight,
            },
            colors: ["#FFD166", "#FF9F1C", "#06D6A0"],
          });
        });

        const remainingUnmatched = boardItems.filter(
          (item) => !item.isMatched,
        ).length;
        if (remainingUnmatched <= 2) {
          pauseTimer();
          setMinigameStatus("win");

          const duration = 2500;
          const end = Date.now() + duration;
          const frame = () => {
            confetti({
              particleCount: 5,
              angle: 60,
              spread: 55,
              origin: { x: 0, y: 0.8 },
              colors: ["#FF9F1C", "#FFD166", "#06D6A0", "#FF7096", "#5390D9"],
              zIndex: 2000,
            });
            confetti({
              particleCount: 5,
              angle: 120,
              spread: 55,
              origin: { x: 1, y: 0.8 },
              colors: ["#FF9F1C", "#FFD166", "#06D6A0", "#FF7096", "#5390D9"],
              zIndex: 2000,
            });
            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();
        }
      } else {
        setWrongMatch([card1.id, card2.id]);
        setHp((prev) => prev - 1);
        setTimeout(() => {
          setSelectedItems([]);
          setWrongMatch([]);
        }, 800);
      }
    }
  }, [selectedItems, boardItems, pauseTimer]);

  // --- HP Loss Logic ---
  useEffect(() => {
    if (hp <= 0 && minigameStatus === "playing") {
      pauseTimer();
      setMinigameStatus("lose");
    }
  }, [hp, minigameStatus, pauseTimer]);

  // --- Phao Bơi Logic ---
  useEffect(() => {
    let phaoTimer: NodeJS.Timeout;

    if (isPhaoActive) {
      phaoTimer = setTimeout(() => {
        setIsPhaoActive(false);
      }, PHAO_DURATION_SECONDS * 1000);
    }

    return () => {
      clearTimeout(phaoTimer);
    };
  }, [isPhaoActive]);

  // --- Kính Lúp Logic ---
  useEffect(() => {
    let kinhLupTimer: NodeJS.Timeout;

    if (revealedCardId) {
      kinhLupTimer = setTimeout(() => {
        setRevealedCardId(null);
      }, KINH_LUP_DURATION_SECONDS * 1000);
    }

    return () => {
      clearTimeout(kinhLupTimer);
    };
  }, [revealedCardId]);

  // --- Handlers ---
  const handleCardClick = (item: BoardItem) => {
    if (
      !isRunning ||
      item.isMatched ||
      wrongMatch.includes(item.id)
    ) {
      return;
    }

    const isAlreadySelected = selectedItems.some((i) => i.id === item.id);
    if (isAlreadySelected) {
      setSelectedItems((prev) => prev.filter((i) => i.id !== item.id));
      return;
    }

    if (selectedItems.length >= 2) {
      return;
    }

    if (isKinhLupActive) {
      setRevealedCardId(item.id);
      setIsKinhLupActive(false); // Soi xong thì tắt chế độ kính lúp
      return;
    }

    setSelectedItems((prev) => [...prev, item]);
  };

  const activatePhao = useCallback(() => setIsPhaoActive(true), []);
  const activateKinhLupMode = useCallback(() => setIsKinhLupActive(true), []);

  const handleRestartGame = useCallback(() => {
    setMinigameStatus("playing");
    resetTimer();
    setupGame();
  }, [resetTimer, setupGame]);

  const handleGameWin = useCallback(() => {
    if (isFirstClearRef.current) {
      const timeBonus = Math.floor(timeLeft / 5) * TIME_BONUS_PER_5_SECONDS;
      const totalReward = (baseRewardCoins || 0) + timeBonus;
      if (totalReward > 0) {
        addCoins(totalReward);
      }
    }
    onWin();
  }, [addCoins, baseRewardCoins, onWin, timeLeft]);

  const handleGameLose = useCallback(() => {
    pauseTimer();
  }, [pauseTimer]);

  useEffect(() => {
    if (minigameStatus === "lose") handleGameLose();
  }, [minigameStatus, handleGameLose]);

  return {
    gameLevel,
    baseRewardCoins,
    freeMinigameHints,
    boardItems,
    selectedItems,
    wrongMatch,
    hp,
    maxHp: MAX_HP,
    minigameStatus,
    isPhaoActive,
    isKinhLupActive,
    setIsKinhLupActive,
    revealedCardId,
    timeLeft,
    isRunning,
    progressPercent,
    isFirstClearRef,
    handleCardClick,
    activatePhao,
    activateKinhLupMode,
    handleRestartGame,
    handleGameWin,
  };
}
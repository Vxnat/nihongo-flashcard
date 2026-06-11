"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FlashcardData } from "@/types/flashcard";
import { playAudio } from "@/utils/tts";
import { playSFX } from "@/utils/sfx";
import { useUserStats } from "@/hooks/useUserStats";

interface UseFlashcardDeckProps {
  deckId: string;
  initialCards: FlashcardData[];
  isCustom?: boolean;
}

export function useFlashcardDeck({
  deckId,
  initialCards,
  isCustom,
}: UseFlashcardDeckProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [cards, setCards] = useState<FlashcardData[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<string[]>([]);
  const [exitDir, setExitDir] = useState<"left" | "right" | "none">("none");
  const [showFurigana, setShowFurigana] = useState(true);
  const { recordAction, addLearningTime } = useUserStats();
  const [globalMode, setGlobalMode] = useState<"swipe" | "typing" | "podcast">(
    "swipe",
  );
  const [tempTyping, setTempTyping] = useState(false);
  const [podcastIsPlaying, setPodcastIsPlaying] = useState(false);
  const [podcastSpeed, setPodcastSpeed] = useState<"slow" | "normal" | "fast">(
    "normal",
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- MASCOT (LINH VẬT) STATES ---
  const [showMascot, setShowMascot] = useState(true);
  const [mascotState, setMascotState] = useState<
    "idle" | "success" | "fail" | "sleep"
  >("idle");
  const mascotTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playMascotAnim = useCallback((state: "success" | "fail") => {
    setMascotState(state);
    if (mascotTimeoutRef.current) clearTimeout(mascotTimeoutRef.current);
    mascotTimeoutRef.current = setTimeout(() => setMascotState("idle"), 2000);
  }, []);

  const isTypingActive = globalMode === "typing" || tempTyping;

  useEffect(() => {
    setIsMounted(true);
    const savedProgress = localStorage.getItem(`flashcard_progress_${deckId}`);
    if (savedProgress) setKnownIds(JSON.parse(savedProgress));

    if (isCustom) {
      const allCustomDecks = JSON.parse(
        localStorage.getItem("custom_decks") || "[]",
      );
      const currentCustomDeck = allCustomDecks.find(
        (d: any) => d.id === deckId,
      );
      if (currentCustomDeck && currentCustomDeck.cards) {
        setCards(currentCustomDeck.cards);
      }
    }
  }, [deckId, isCustom]);

  const activeCards = cards.filter((card) => !knownIds.includes(card.id));
  const totalOriginalCards = cards.length;
  const learnedCardsCount = knownIds.length;
  const progressPercent =
    totalOriginalCards === 0
      ? 0
      : Math.round((learnedCardsCount / totalOriginalCards) * 100);
  const currentCard = activeCards[currentIndex];

  const handleFlip = () => {
    playSFX("flip");

    if (!isFlipped && activeCards.length > 0) {
      // Gọi đồng bộ ngay lập tức bên trong event click để vượt qua kiểm duyệt Autoplay của iOS
      playAudio(activeCards[currentIndex].word);
    }
    setIsFlipped((prev) => !prev);
  };

  const triggerSwipe = (
    dir: "left" | "right",
    forcedFlippedState?: boolean,
  ) => {
    if (!activeCards[currentIndex]) return;
    recordAction();
    setExitDir(dir);

    const currentFlipped =
      forcedFlippedState !== undefined ? forcedFlippedState : isFlipped;

    if (dir === "right") {
      if (currentFlipped) {
        const currentId = activeCards[currentIndex].id;
        const newKnownIds = [...knownIds, currentId];
        setKnownIds(newKnownIds);
        localStorage.setItem(
          `flashcard_progress_${deckId}`,
          JSON.stringify(newKnownIds),
        );
        if (currentIndex >= activeCards.length - 1) setCurrentIndex(0);
        setIsFlipped(false);
        playSFX("success");
        playMascotAnim("success");
      } else {
        if (currentIndex < activeCards.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setIsFlipped(false);
        }
      }
    } else {
      if (isFlipped) {
        setCurrentIndex((prev) => (prev + 1) % activeCards.length);
        setIsFlipped(false);
        playSFX("fail");
        playMascotAnim("fail");
      } else {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          setIsFlipped(false);
        }
      }
    }
  };

  const handlePodcastNext = useCallback(
    (direction: 1 | -1 = 1) => {
      setExitDir(direction === 1 ? "left" : "right");
      setTimeout(() => {
        setCurrentIndex((prev) => {
          if (direction === 1) return (prev + 1) % activeCards.length;
          return prev === 0 ? activeCards.length - 1 : prev - 1;
        });
        setIsFlipped(false);
        setExitDir("none");
      }, 400);
    },
    [activeCards.length],
  );

  useEffect(() => {
    if (
      globalMode !== "podcast" ||
      !podcastIsPlaying ||
      activeCards.length === 0
    )
      return;
    let timeout: NodeJS.Timeout;
    const getPodcastDelays = () => {
      switch (podcastSpeed) {
        case "slow":
          return { front: 3000, back: 4000 };
        case "fast":
          return { front: 1000, back: 1500 };
        default:
          return { front: 1500, back: 2500 };
      }
    };
    const delays = getPodcastDelays();

    if (!isFlipped) {
      timeout = setTimeout(() => {
        setIsFlipped(true);
        playAudio(activeCards[currentIndex].word); // Gọi phát âm thanh cho chế độ Podcast
      }, delays.front);
    } else {
      timeout = setTimeout(() => handlePodcastNext(1), delays.back);
    }

    return () => clearTimeout(timeout);
  }, [
    globalMode,
    podcastIsPlaying,
    isFlipped,
    currentIndex,
    podcastSpeed,
    activeCards.length,
    handlePodcastNext,
  ]);

  const globalModeRef = useRef(globalMode);
  const podcastIsPlayingRef = useRef(podcastIsPlaying);
  useEffect(() => {
    globalModeRef.current = globalMode;
    podcastIsPlayingRef.current = podcastIsPlaying;
  }, [globalMode, podcastIsPlaying]);

  useEffect(() => {
    if (!isMounted || !addLearningTime) return;
    let isActive = true;
    let afkTimer: NodeJS.Timeout;
    const resetAfk = () => {
      isActive = true;
      setMascotState((prev) => (prev === "sleep" ? "idle" : prev)); // Đánh thức linh vật
      clearTimeout(afkTimer);
      afkTimer = setTimeout(() => {
        isActive = false;
        setMascotState("sleep");
      }, 30000); // Ngủ gật
    };
    window.addEventListener("mousemove", resetAfk);
    window.addEventListener("keydown", resetAfk);
    window.addEventListener("touchstart", resetAfk);
    window.addEventListener("click", resetAfk);
    resetAfk();
    const trackingInterval = setInterval(() => {
      if (
        isActive ||
        (globalModeRef.current === "podcast" && podcastIsPlayingRef.current)
      ) {
        addLearningTime(5);
      }
    }, 5000);
    return () => {
      clearTimeout(afkTimer);
      clearInterval(trackingInterval);
      window.removeEventListener("mousemove", resetAfk);
      window.removeEventListener("keydown", resetAfk);
      window.removeEventListener("touchstart", resetAfk);
      window.removeEventListener("click", resetAfk);
    };
  }, [isMounted, addLearningTime]);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleShuffle = () => {
    setCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const resetProgress = () => {
    setKnownIds([]);
    localStorage.removeItem(`flashcard_progress_${deckId}`);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handlePlayAudio = () => {
    if (activeCards.length > 0) playAudio(activeCards[currentIndex].word);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName))
        return;
      if (globalMode === "podcast") {
        switch (event.code) {
          case "Space":
            event.preventDefault();
            setPodcastIsPlaying((p) => !p);
            break;
          case "ArrowRight":
            handlePodcastNext(1);
            break;
          case "ArrowLeft":
            handlePodcastNext(-1);
            break;
        }
        return;
      }
      switch (event.code) {
        case "Space":
          event.preventDefault();
          handleFlip();
          break;
        case "ArrowRight":
          triggerSwipe("right");
          break;
        case "ArrowLeft":
          triggerSwipe("left");
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isFlipped,
    currentIndex,
    activeCards,
    knownIds,
    globalMode,
    handlePodcastNext,
  ]);

  return {
    isMounted,
    activeCards,
    currentCard,
    globalMode,
    setGlobalMode,
    exitDir,
    isFlipped,
    setIsFlipped,
    showFurigana,
    setShowFurigana,
    podcastIsPlaying,
    setPodcastIsPlaying,
    podcastSpeed,
    setPodcastSpeed,
    progressPercent,
    learnedCardsCount,
    totalOriginalCards,
    tempTyping,
    setTempTyping,
    isTypingActive,
    currentIndex,
    isFullscreen,
    showMascot,
    setShowMascot,
    mascotState,
    playMascotAnim,
    handleFlip,
    triggerSwipe,
    handlePodcastNext,
    handleShuffle,
    resetProgress,
    handlePlayAudio,
    toggleFullscreen,
  };
}

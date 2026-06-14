"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FlashcardData } from "@/types/flashcard";
import { playAudio } from "@/utils/tts";
import { playSFX } from "@/utils/sfx";
import { useUserStats } from "@/hooks/useUserStats";
import { useAppStore } from "@/store/useAppStore";

interface UseFlashcardDeckProps {
  deckId: string;
  initialCards: FlashcardData[];
  isCustom?: boolean;
}

const EMPTY_KNOWN_IDS: string[] = [];

export function useFlashcardDeck({
  deckId,
  initialCards,
  isCustom,
}: UseFlashcardDeckProps) {
  const appMode = useAppStore((state: any) => state.appMode || "focus");
  const [comboCount, setComboCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [cards, setCards] = useState<FlashcardData[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [exitDir, setExitDir] = useState<"left" | "right" | "none">("none");
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
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
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(false);

  const customDecks = useAppStore((state) => state.customDecks);
  const knownIds = useAppStore(
    (state) => state.progress[deckId] || EMPTY_KNOWN_IDS,
  );
  const loadProgress = useAppStore((state) => state.loadProgress);
  const saveProgress = useAppStore((state) => state.saveProgress);
  const globalResetProgress = useAppStore((state) => state.resetProgress);
  const updateQuestProgress = useAppStore((state) => state.updateQuestProgress);

  // --- MASCOT (LINH VẬT) STATES ---
  const [showMascot, setShowMascot] = useState(true);
  const [mascotState, setMascotState] = useState<
    "idle" | "success" | "fail" | "sleep" | "hint"
  >("idle");
  const mascotTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playMascotAnim = useCallback((state: "success" | "fail" | "hint") => {
    setMascotState(state);
    if (mascotTimeoutRef.current) clearTimeout(mascotTimeoutRef.current);
    mascotTimeoutRef.current = setTimeout(() => setMascotState("idle"), 2000);
  }, []);

  const isTypingActive = globalMode === "typing" || tempTyping;

  useEffect(() => {
    setIsMounted(true);
    loadProgress(deckId);

    if (isCustom) {
      // Đọc từ localStorage nếu Zustand store chưa hydrate kịp (tránh lỗi nếu user reload trang học trực tiếp)
      const localDecks = JSON.parse(
        localStorage.getItem("custom_decks") || "[]",
      );
      const allCustomDecks = customDecks.length > 0 ? customDecks : localDecks;

      const currentCustomDeck = allCustomDecks.find(
        (d: any) => d.id === deckId,
      );
      if (currentCustomDeck && currentCustomDeck.cards) {
        setCards(currentCustomDeck.cards);
      }
    }
  }, [deckId, isCustom, customDecks, loadProgress]);

  const activeCards = isReviewMode
    ? cards.filter((card) => !reviewedIds.includes(card.id))
    : cards.filter((card) => !knownIds.includes(card.id));
  const totalOriginalCards = cards.length;
  const learnedCardsCount = isReviewMode ? reviewedIds.length : knownIds.length;
  const progressPercent =
    totalOriginalCards === 0
      ? 0
      : Math.round((learnedCardsCount / totalOriginalCards) * 100);
  const currentCard = activeCards[currentIndex];

  const startReview = useCallback(() => {
    setIsReviewMode(true);
    setReviewedIds([]);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

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
        if (isReviewMode) {
          setReviewedIds((prev) => [...prev, currentId]);
        } else if (!knownIds.includes(currentId)) {
          saveProgress(deckId, [...knownIds, currentId]);
        }
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

  // Ref để lưu trữ bộ đếm thời gian Combo
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 3. THÊM HÀM MỚI: Xử lý Combo bọc ngoài triggerSwipe
  const handleSwipeAction = (
    direction: "left" | "right",
    forceSwipe?: boolean,
  ) => {
    // Xóa bộ đếm thời gian cũ mỗi khi có hành động mới
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);

    // CHỈ áp dụng Combo khi đang ở chế độ Vui nhộn VÀ đang gõ phím (Boss Fight)
    if (appMode === "fun" && isTypingActive) {
      if (direction === "right") {
        // Gõ đúng = Tăng Combo
        setComboCount((prev) => {
          const next = prev + 1;

          // Cập nhật tiến độ nhiệm vụ ngầm (isAbsolute = true để ghi nhận mốc combo cao nhất)
          updateQuestProgress("q_combo", next, true);

          // Bắn pháo khi combo đạt 3, 5, 10, 15...
          if (next === 3 || next === 5 || next % 5 === 0) {
            import("canvas-confetti").then((confetti) => {
              let particleCount = 100;
              let spread = 70;
              let colors = [
                "#FF7096",
                "#06D6A0",
                "#FFD166",
                "#5390D9",
                "#FF9F1C",
              ]; // Mặc định kẹo ngọt

              if (next >= 15) {
                particleCount = 350; // Bắn siêu khủng
                spread = 130;
                colors = ["#FFD166", "#FF9F1C", "#E63946", "#FFFFFF"]; // Vàng, cam, đỏ rực
              } else if (next >= 10) {
                particleCount = 200; // Bắn vừa
                spread = 100;
                colors = ["#FF7096", "#FFB3C6", "#FFFFFF", "#FFD166"]; // Hồng, trắng, vàng
              } else if (next >= 5) {
                particleCount = 150;
                spread = 85;
                colors = ["#06D6A0", "#118AB2", "#FFFFFF", "#FFD166"]; // Xanh lá, xanh biển, vàng
              }

              confetti.default({
                particleCount,
                spread,
                origin: { y: 0.6 }, // Bắn từ nửa dưới màn hình lên
                colors,
                zIndex: 2000,
              });
            });
          }
          return next;
        });

        // Thiết lập thời gian "ngọn lửa tàn" nếu người dùng dừng suy nghĩ quá lâu (8 giây)
        comboTimeoutRef.current = setTimeout(() => {
          setComboCount(0);
        }, 8000);
      } else {
        setComboCount(0); // Gõ sai = Mất chuỗi 💦
      }
    } else {
      setComboCount(0); // Nếu quẹt thẻ bình thường thì reset combo về 0
    }

    // Cuối cùng vẫn gọi triggerSwipe gốc để app lật thẻ bình thường
    triggerSwipe(direction, forceSwipe);
  };

  // Dọn dẹp bộ đếm khi thoát khỏi màn hình học
  useEffect(() => {
    return () => {
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    };
  }, []);

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
    // Kiểm tra xem trình duyệt có hỗ trợ Fullscreen API không (iPhone Safari không hỗ trợ)
    const docEl = document.documentElement as any;
    const isSupported = !!(
      docEl.requestFullscreen ||
      docEl.webkitRequestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.msRequestFullscreen
    );
    setIsFullscreenSupported(isSupported);

    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(
        !!(
          doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
        ),
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, []);

  const toggleFullscreen = () => {
    const docEl = document.documentElement as any;
    const doc = document as any;
    const isCurrentlyFullscreen = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    if (!isCurrentlyFullscreen) {
      if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
      else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
      else if (docEl.mozRequestFullScreen) docEl.mozRequestFullScreen();
      else if (docEl.msRequestFullscreen) docEl.msRequestFullscreen();
    } else {
      if (doc.exitFullscreen) doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
      else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen();
      else if (doc.msExitFullscreen) doc.msExitFullscreen();
    }
  };

  const handleShuffle = () => {
    setCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const resetProgress = () => {
    globalResetProgress(deckId);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsReviewMode(false);
    setReviewedIds([]);
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
    isFullscreenSupported,
    showMascot,
    setShowMascot,
    mascotState,
    playMascotAnim,
    handleFlip,
    startReview,
    handlePodcastNext,
    handleShuffle,
    resetProgress,
    handlePlayAudio,
    toggleFullscreen,
    appMode,
    comboCount,
    setComboCount,
    handleSwipeAction,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { FlashcardData } from "@/types/flashcard";
import { playAudio } from "@/utils/tts";
import { playSFX } from "@/utils/sfx";
import { useUserStats } from "@/hooks/common/useUserStats";
import { useAppStore } from "@/store/useAppStore";
import { useLearningTimer } from "@/hooks/common/useLearningTimer";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Import các sub-hooks mới tách ra
import { useMascotAndCombo } from "./useMascotAndCombo";
import { usePodcastMode } from "./usePodcastMode";
import { useBossBattle } from "./useBossBattle";
import { useFullscreenAndShortcuts } from "./useFullscreenAndShortcuts";

interface UseFlashcardDeckProps {
  deckId: string;
  initialCards: FlashcardData[];
  isCustom?: boolean;
}

const EMPTY_KNOWN_IDS: string[] = [];

/**
 * Hook quản lý toàn bộ logic của một bộ thẻ từ vựng (Flashcard Deck).
 * Đã được chia nhỏ thành các hook con để dễ bảo trì và mở rộng.
 */
export function useFlashcardDeck({
  deckId,
  initialCards,
  isCustom,
}: UseFlashcardDeckProps) {
  // Hook thống kê hoạt động của người dùng
  const { recordAction } = useUserStats();

  // Đọc cấu hình/trạng thái từ Zustand store
  const appMode = useAppStore((state: any) => state.appMode || "focus");
  const customDecks = useAppStore((state) => state.customDecks);
  const loadProgress = useAppStore((state) => state.loadProgress);
  const saveProgress = useAppStore((state) => state.saveProgress);

  // Kết nối dữ liệu tiến độ đã thuộc của bộ thẻ này từ Store
  const knownIds = useAppStore(
    (state) => state.progress[deckId] || EMPTY_KNOWN_IDS,
  );

  // --- Trạng thái chung & Vận hành bộ thẻ ---
  const [isMounted, setIsMounted] = useState(false);
  const [cards, setCards] = useState<FlashcardData[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [exitDir, setExitDir] = useState<"left" | "right" | "none">("none");
  const [showFurigana, setShowFurigana] = useState(true);

  // --- Trạng thái Chế độ ôn tập ---
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);

  // --- Trạng thái Chế độ học & Đa phương tiện ---
  const [globalMode, setGlobalMode] = useState<"swipe" | "typing" | "podcast">("swipe");
  const [tempTyping, setTempTyping] = useState(false);

  // Kiểm tra xem chế độ gõ phím (Typing) có đang hoạt động hay không
  const isTypingActive = globalMode === "typing" || tempTyping;

  // Lọc ra các thẻ cần học dựa trên chế độ học bình thường hay ôn tập
  const activeCards = isReviewMode
    ? cards.filter((card) => !reviewedIds.includes(card.id))
    : cards.filter((card) => !knownIds.includes(card.id));

  const totalOriginalCards = cards.length;
  const learnedCardsCount = isReviewMode ? reviewedIds.length : knownIds.length;

  // Phần trăm tiến độ hoàn thành bộ thẻ
  const progressPercent =
    totalOriginalCards === 0
      ? 0
      : Math.round((learnedCardsCount / totalOriginalCards) * 100);

  // Thẻ từ vựng hiện tại đang hiển thị
  const currentCard = activeCards[currentIndex];

  // ============================================================================
  // INTEGRATE SUB-HOOKS (Liên kết các sub-hooks con)
  // ============================================================================

  // 1. Linh vật Mascot Shiba & chuỗi Combo
  const {
    showMascot,
    setShowMascot,
    mascotState,
    setMascotState,
    playMascotAnim,
    comboCount,
    setComboCount,
    comboTimeoutRef,
    playCompanionVoice,
  } = useMascotAndCombo(appMode, isTypingActive);

  // 2. Chế độ đọc Podcast tự động
  const {
    podcastIsPlaying,
    setPodcastIsPlaying,
    podcastSpeed,
    setPodcastSpeed,
    handlePodcastNext,
  } = usePodcastMode(
    activeCards,
    currentIndex,
    setCurrentIndex,
    isFlipped,
    setIsFlipped,
    setExitDir,
    globalMode
  );

  // 3. Hệ thống chiến đấu Boss Battle
  const {
    isBossMode,
    setIsBossMode,
    bossHp,
    bossMaxHp,
    shibaHp,
    bossWordsList,
    currentBossCard,
    bossTimeLeft,
    bossCardMaxTime,
    isHintRevealed,
    activeSkillEffect,
    activeDamageText,
    screenShake,
    bossFlash,
    projectileFlying,
    bossStatus,
    bossFailedAttempts,
    startBossMode,
    handleBossWordSubmit,
    usePhaoBoi,
    useKinhLup,
    handleBossCancel,
    isTimerActive,
    startBossBattleTimer,
  } = useBossBattle(
    deckId,
    cards,
    comboCount,
    setComboCount,
    comboTimeoutRef,
    playMascotAnim,
    playCompanionVoice
  );

  // ============================================================================
  // CORE FUNCTIONS (Các hàm lõi vận hành bộ thẻ)
  // ============================================================================

  /**
   * Bắt đầu chế độ Ôn tập (Review Mode): reset tiến trình ôn tập của phiên hiện tại về 0
   */
  const startReview = useCallback(() => {
    setIsReviewMode(true);
    setReviewedIds([]);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  /**
   * Lật thẻ giữa mặt trước (Từ tiếng Nhật) và mặt sau (Nghĩa/Giải thích)
   */
  const handleFlip = useCallback(() => {
    playSFX("flip");

    if (!isFlipped && activeCards.length > 0) {
      playAudio(activeCards[currentIndex].word);
    }
    setIsFlipped((prev) => !prev);
  }, [isFlipped, activeCards, currentIndex]);

  /**
   * Phát phát âm thanh từ vựng tiếng Nhật của thẻ hiện tại
   */
  const handlePlayAudio = useCallback(() => {
    if (activeCards.length > 0) playAudio(activeCards[currentIndex].word);
  }, [activeCards, currentIndex]);

  /**
   * Xáo trộn ngẫu nhiên thứ tự các thẻ trong bộ và đưa vị trí học về thẻ đầu tiên
   */
  const handleShuffle = useCallback(() => {
    setCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  /**
   * Logic cốt lõi khi trượt thẻ học.
   */
  const triggerSwipe = useCallback((
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
        let isVictory = false;

        if (isReviewMode) {
          const nextReviewed = [...reviewedIds, currentId];
          setReviewedIds(nextReviewed);
          if (nextReviewed.length === cards.length) {
            isVictory = true;
          }
        } else if (!knownIds.includes(currentId)) {
          const nextKnown = [...knownIds, currentId];
          saveProgress(deckId, nextKnown);
          if (nextKnown.length === cards.length) {
            isVictory = true;
          }
        }

        if (isVictory) {
          playCompanionVoice("victory");
        } else {
          playCompanionVoice("correct");
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
        playCompanionVoice("incorrect");
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
  }, [
    activeCards,
    currentIndex,
    isFlipped,
    isReviewMode,
    reviewedIds,
    cards,
    knownIds,
    deckId,
    saveProgress,
    recordAction,
    playCompanionVoice,
    playMascotAnim,
  ]);

  /**
   * Hàm bọc ngoài triggerSwipe để xử lý tích lũy chuỗi Combo
   */
  const handleSwipeAction = useCallback((
    direction: "left" | "right",
    forceSwipe?: boolean,
  ) => {
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);

    if (appMode === "fun" && isTypingActive) {
      if (direction === "right") {
        setComboCount((prev) => prev + 1);

        comboTimeoutRef.current = setTimeout(() => {
          setComboCount(0);
        }, 8000);
      } else {
        setComboCount(0);
      }
    } else {
      setComboCount(0);
    }

    triggerSwipe(direction, forceSwipe);
  }, [comboTimeoutRef, appMode, isTypingActive, setComboCount, triggerSwipe]);

  // 4. Trạng thái toàn màn hình và Phím tắt bàn phím
  const {
    isFullscreen,
    isFullscreenSupported,
    toggleFullscreen,
  } = useFullscreenAndShortcuts(
    globalMode,
    podcastIsPlaying,
    setPodcastIsPlaying,
    handlePodcastNext,
    handleFlip,
    triggerSwipe
  );

  // ============================================================================
  // EFFECTS (Hiệu ứng vòng đời)
  // ============================================================================

  // Tích hợp bộ đếm giờ học để chuyển đổi trạng thái Shiba ngủ gật (sleep) khi người dùng không hoạt động (AFK)
  useLearningTimer({
    isActive: isMounted,
    forceActive: globalMode === "podcast" && podcastIsPlaying,
    onActive: () => setMascotState((prev) => (prev === "sleep" ? "idle" : prev)),
    onAfk: () => setMascotState("sleep"),
  });

  // Effect tải dữ liệu tiến độ khi khởi chạy lần đầu và xử lý đồng bộ custom deck nếu cần
  useEffect(() => {
    loadProgress(deckId);

    if (isCustom) {
      const localDecks = JSON.parse(
        localStorage.getItem("custom_decks") || "[]",
      );

      const allCustomDecks = customDecks.length > 0 ? customDecks : localDecks;

      const currentCustomDeck = allCustomDecks.find(
        (d: any) => d.id === deckId,
      );
      if (currentCustomDeck && currentCustomDeck.cards) {
        setCards(currentCustomDeck.cards);
        setIsMounted(true);
      } else {
        const fetchCustomDeck = async () => {
          try {
            const docRef = doc(db, "decks", deckId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setCards(docSnap.data().cards || []);
            }
          } catch (error) {
            console.error("Lỗi fetch custom deck:", error);
          } finally {
            setIsMounted(true);
          }
        };
        fetchCustomDeck();
      }
    } else {
      setIsMounted(true);
    }
  }, [deckId, isCustom, customDecks, loadProgress]);

  // Effect tự động chuyển đổi sang ôn tập hoặc lặp lại vòng ôn tập khi học xong toàn bộ thẻ trong bộ học
  useEffect(() => {
    if (!isMounted) return;

    const total = cards.length;
    if (total === 0) return;

    if (knownIds.length >= total && !isReviewMode) {
      setIsReviewMode(true);
      setReviewedIds([]);
      setCurrentIndex(0);
      setIsFlipped(false);
    } else if (isReviewMode && reviewedIds.length >= total) {
      setReviewedIds([]);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [knownIds, reviewedIds, cards, isReviewMode, isMounted]);

  return {
    // --- Vận hành bộ thẻ & Trạng thái tải ---
    isMounted,
    activeCards,
    currentCard,
    currentIndex,
    
    // --- Tùy chọn hiển thị & Toàn màn hình ---
    showFurigana,
    setShowFurigana,
    isFullscreen,
    isFullscreenSupported,
    toggleFullscreen,

    // --- Chế độ học & Vuốt thẻ ---
    globalMode,
    setGlobalMode,
    exitDir,
    isFlipped,
    setIsFlipped,
    setTempTyping,
    isTypingActive,
    handleFlip,
    handleShuffle,
    handlePlayAudio,
    handleSwipeAction,

    // --- Tiến độ học tập ---
    progressPercent,
    learnedCardsCount,
    totalOriginalCards,
    startReview,

    // --- Chế độ Podcast tự động học ---
    podcastIsPlaying,
    setPodcastIsPlaying,
    podcastSpeed,
    setPodcastSpeed,
    handlePodcastNext,

    // --- Linh vật Companion Mascot ---
    showMascot,
    setShowMascot,
    mascotState,
    playMascotAnim,

    // --- Chuỗi combo vui vẻ ---
    appMode,
    comboCount,
    setComboCount,

    // --- Trạng thái đấu Boss ---
    isBossMode,
    setIsBossMode,
    bossHp,
    bossMaxHp,
    shibaHp,
    bossWordsList,
    currentBossCard,
    bossTimeLeft,
    bossCardMaxTime,
    isHintRevealed,
    bossStatus,
    bossFailedAttempts,

    // --- Hoạt ảnh trận đấu Boss ---
    activeSkillEffect,
    activeDamageText,
    screenShake,
    bossFlash,
    projectileFlying,

    // --- Hành động của Boss ---
    startBossMode,
    handleBossWordSubmit,
    usePhaoBoi,
    useKinhLup,
    handleBossCancel,
    isTimerActive,
    startBossBattleTimer,
  };
}

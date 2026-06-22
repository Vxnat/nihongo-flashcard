"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FlashcardData } from "@/types/flashcard";
import { playAudio } from "@/utils/tts";
import { playSFX } from "@/utils/sfx";
import { useUserStats } from "@/hooks/common/useUserStats";
import { useAppStore } from "@/store/useAppStore";
import { useLearningTimer } from "@/hooks/common/useLearningTimer";
import { useSystemItems } from "@/hooks/shiba-room/useSystemItems";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  const { gachaPool } = useSystemItems();
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
  const equippedVoicePack = useAppStore((state) => state.userStats.equippedSlots?.voice);

  const playCompanionVoice = useCallback((voiceType: "correct" | "incorrect" | "victory") => {
    if (!equippedVoicePack) return;
    const voiceItem = gachaPool.find((item) => item.id === equippedVoicePack);
    if (!voiceItem || !voiceItem.audioUrl) return;

    const audioPath = `${voiceItem.audioUrl}_${voiceType}.mp3`;
    const audio = new Audio(audioPath);
    audio.volume = 0.65;
    audio.play().catch((err) => console.warn("Failed to play companion voice:", err));
  }, [equippedVoicePack, gachaPool]);

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
        setIsMounted(true);
      } else {
        // Nếu chưa có trong RAM hay LocalStorage, thử fetch trực tiếp từ Firebase
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
        setComboCount((prev) => prev + 1);

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

  // Hiệu ứng và cập nhật tiến độ Combo
  useEffect(() => {
    if (comboCount > 0 && appMode === "fun") {
      updateQuestProgress("q_combo", comboCount, true);

      if (comboCount === 3 || comboCount === 5 || comboCount % 5 === 0) {
        import("canvas-confetti").then((confetti) => {
          let particleCount = 100;
          let spread = 70;
          let colors = ["#FF7096", "#06D6A0", "#FFD166", "#5390D9", "#FF9F1C"]; // Mặc định kẹo ngọt

          if (comboCount >= 15) {
            particleCount = 350; // Bắn siêu khủng
            spread = 130;
            colors = ["#FFD166", "#FF9F1C", "#E63946", "#FFFFFF"]; // Vàng, cam, đỏ rực
          } else if (comboCount >= 10) {
            particleCount = 200; // Bắn vừa
            spread = 100;
            colors = ["#FF7096", "#FFB3C6", "#FFFFFF", "#FFD166"]; // Hồng, trắng, vàng
          } else if (comboCount >= 5) {
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
    }
  }, [comboCount, appMode, updateQuestProgress]);

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

  useLearningTimer({
    isActive: isMounted,
    forceActive: globalMode === "podcast" && podcastIsPlaying,
    onActive: () => setMascotState((prev) => (prev === "sleep" ? "idle" : prev)),
    onAfk: () => setMascotState("sleep"),
  });

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
      if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => { });
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

  // --- BOSS FIGHT STATES ---
  const [isBossMode, setIsBossMode] = useState(false);
  const [bossHp, setBossHp] = useState(0);
  const [bossMaxHp, setBossMaxHp] = useState(0);
  const [shibaHp, setShibaHp] = useState(3);
  const [bossWordsList, setBossWordsList] = useState<FlashcardData[]>([]);
  const [currentBossCard, setCurrentBossCard] = useState<FlashcardData | null>(null);
  const [playedBossCardIds, setPlayedBossCardIds] = useState<string[]>([]);
  const [bossTimeLeft, setBossTimeLeft] = useState(0);
  const [bossCardMaxTime, setBossCardMaxTime] = useState(10);
  const [isHintRevealed, setIsHintRevealed] = useState(false);

  // FX States for battle animations
  const [activeSkillEffect, setActiveSkillEffect] = useState<"normal" | "double" | "shiba_special" | null>(null);
  const [activeDamageText, setActiveDamageText] = useState<{ damage: number; isCritical: boolean } | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [bossFlash, setBossFlash] = useState(false);
  const [projectileFlying, setProjectileFlying] = useState(false);

  // Zustand Store mappings
  const bossStatusMap = useAppStore((state) => state.bossStatus);
  const bossFailedAttemptsMap = useAppStore((state) => state.bossFailedAttempts);
  const wordStats = useAppStore((state) => state.userStats.wordStats || {});
  const recordWordStat = useAppStore((state) => state.recordWordStat);
  const submitBossResult = useAppStore((state) => state.submitBossResult);
  const deductCoins = useAppStore((state) => state.deductCoins);

  const bossStatus = bossStatusMap[deckId] || "learning";
  const bossFailedAttempts = bossFailedAttemptsMap[deckId] || 0;

  // Helpers
  const getBossWordCountLimit = (deckSize: number) => {
    if (deckSize <= 10) return Math.min(deckSize, 10);
    if (deckSize <= 20) return Math.min(deckSize, 12);
    if (deckSize <= 30) return Math.min(deckSize, 15);
    return Math.min(deckSize, 20);
  };

  const calculateBaseDamage = (card: FlashcardData) => {
    const romaji = card.romaji || card.reading || "";
    const word = card.word || "";
    const reading = card.reading || "";
    const hasKanji = word !== reading;
    return 10 + romaji.length + (hasKanji ? 5 : 0);
  };

  const getDamageMultiplier = (combo: number) => {
    if (combo >= 5) return 2.0;
    if (combo >= 3) return 1.5;
    return 1.0;
  };

  const getCardDifficulty = useCallback((card: FlashcardData): "easy" | "medium" | "hard" => {
    const word = card.word || "";
    const reading = card.reading || "";
    const romaji = card.romaji || card.reading || "";
    const hasKanji = word !== reading;
    const isKanaOnly = !hasKanji;
    const stat = wordStats[card.id];
    const isWeak = stat && stat.wrongCount >= 2;

    if (romaji.length < 5 && isKanaOnly && !isWeak) {
      return "easy";
    }
    if (romaji.length >= 8 || hasKanji || isWeak) {
      return "hard";
    }
    return "medium";
  }, [wordStats]);

  const getCardTimeLimit = useCallback((card: FlashcardData) => {
    const romaji = card.romaji || card.reading || "";
    const word = card.word || "";
    const reading = card.reading || "";
    const hasKanji = word !== reading;

    const baseTime = 2.5 + 0.35 * romaji.length;
    const clampedTime = Math.max(3, Math.min(9, baseTime));

    let modifier = 0;
    if (hasKanji) modifier += 1.5;
    else modifier -= 0.5;

    const stat = wordStats[card.id];
    if (stat) {
      if (stat.wrongCount >= 2) modifier += 1.0;
      if (stat.correctCount >= 5) modifier -= 1.0;
    }

    return Math.max(3, clampedTime + modifier);
  }, [wordStats]);

  const buildBossWordsList = useCallback(() => {
    const deckSize = cards.length;
    if (deckSize === 0) return [];
    const limit = getBossWordCountLimit(deckSize);

    const deckCards = [...cards];

    const weakCards = deckCards
      .filter(card => {
        const stat = wordStats[card.id];
        return stat && stat.wrongCount > 0;
      })
      .sort((a, b) => {
        const statA = wordStats[a.id];
        const statB = wordStats[b.id];
        return (statB?.wrongCount || 0) - (statA?.wrongCount || 0);
      });

    const reviewCards = deckCards.filter(card => {
      const stat = wordStats[card.id];
      return stat && stat.correctCount > (stat.wrongCount || 0);
    });

    const weakCountTarget = Math.max(1, Math.round(limit * 0.25));
    const reviewCountTarget = Math.max(1, Math.round(limit * 0.1));

    const selectedMap = new Map<string, FlashcardData>();

    weakCards.slice(0, weakCountTarget).forEach(card => {
      selectedMap.set(card.id, card);
    });

    for (const card of reviewCards) {
      if (selectedMap.size >= weakCountTarget + reviewCountTarget) break;
      if (!selectedMap.has(card.id)) {
        selectedMap.set(card.id, card);
      }
    }

    const shuffledDeck = [...deckCards].sort(() => Math.random() - 0.5);
    for (const card of shuffledDeck) {
      if (selectedMap.size >= limit) break;
      if (!selectedMap.has(card.id)) {
        selectedMap.set(card.id, card);
      }
    }

    for (const card of shuffledDeck) {
      if (selectedMap.size >= limit) break;
      selectedMap.set(card.id, card);
    }

    return Array.from(selectedMap.values()).sort(() => Math.random() - 0.5);
  }, [cards, wordStats]);

  const selectNextBossCard = useCallback((remainingCards: FlashcardData[], combo: number) => {
    if (remainingCards.length === 0) return null;

    const easyCards = remainingCards.filter(c => getCardDifficulty(c) === "easy");
    const mediumCards = remainingCards.filter(c => getCardDifficulty(c) === "medium");
    const hardCards = remainingCards.filter(c => getCardDifficulty(c) === "hard");

    if (combo === 0) {
      if (easyCards.length > 0) return easyCards[Math.floor(Math.random() * easyCards.length)];
      if (mediumCards.length > 0) return mediumCards[Math.floor(Math.random() * mediumCards.length)];
      return hardCards[Math.floor(Math.random() * hardCards.length)];
    } else if (combo >= 3) {
      if (hardCards.length > 0) return hardCards[Math.floor(Math.random() * hardCards.length)];
      if (mediumCards.length > 0) return mediumCards[Math.floor(Math.random() * mediumCards.length)];
      return easyCards[Math.floor(Math.random() * easyCards.length)];
    } else {
      if (mediumCards.length > 0) return mediumCards[Math.floor(Math.random() * mediumCards.length)];
      if (easyCards.length > 0) return easyCards[Math.floor(Math.random() * easyCards.length)];
      return hardCards[Math.floor(Math.random() * hardCards.length)];
    }
  }, [getCardDifficulty]);

  const handleBossWordSubmit = useCallback(async (input: string) => {
    if (!currentBossCard) return;

    const targetReading = (currentBossCard.romaji || currentBossCard.reading || "").toLowerCase().trim();
    const userInput = input.toLowerCase().trim();
    const isCorrect = userInput === targetReading;

    setIsHintRevealed(false);

    if (isCorrect) {
      playSFX("success");
      playMascotAnim("success");
      recordWordStat(currentBossCard.id, true);

      const newCombo = comboCount + 1;
      setComboCount(newCombo);

      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = setTimeout(() => {
        setComboCount(0);
      }, 8000);

      const baseDamage = calculateBaseDamage(currentBossCard);
      const multiplier = getDamageMultiplier(newCombo);
      const actualDamage = Math.round(baseDamage * multiplier);

      setProjectileFlying(true);
      setActiveSkillEffect(newCombo >= 5 ? "shiba_special" : newCombo >= 3 ? "double" : "normal");

      setTimeout(() => {
        setProjectileFlying(false);
        const nextHp = Math.max(0, bossHp - actualDamage);
        setBossHp(nextHp);
        if (nextHp <= 0) {
          playCompanionVoice("victory");
          submitBossResult(deckId, true);
          setIsBossMode(false);
        }

        setBossFlash(true);
        setScreenShake(true);
        setActiveDamageText({ damage: actualDamage, isCritical: newCombo >= 5 });

        setTimeout(() => {
          setBossFlash(false);
          setScreenShake(false);
        }, 300);

        setTimeout(() => {
          setActiveDamageText(null);
        }, 1000);
      }, 500);

      const nextBossHp = Math.max(0, bossHp - actualDamage);
      const nextPlayed = [...playedBossCardIds, currentBossCard.id];
      setPlayedBossCardIds(nextPlayed);

      if (nextBossHp <= 0) {
        // Boss is dead, do not load next card or reset timer
      } else {
        const remaining = bossWordsList.filter(c => !nextPlayed.includes(c.id));
        if (remaining.length === 0) {
          submitBossResult(deckId, false);
          setIsBossMode(false);
        } else {
          const nextCard = selectNextBossCard(remaining, newCombo);
          if (nextCard) {
            setCurrentBossCard(nextCard);
            const limit = getCardTimeLimit(nextCard);
            setBossCardMaxTime(limit);
            setBossTimeLeft(limit);
          }
        }
      }
    } else {
      playSFX("fail");
      playMascotAnim("fail");
      playCompanionVoice("incorrect");
      recordWordStat(currentBossCard.id, false);

      setComboCount(0);

      const nextShibaHp = shibaHp - 1;
      setShibaHp(nextShibaHp);

      if (nextShibaHp <= 0) {
        submitBossResult(deckId, false);
        setIsBossMode(false);
      } else {
        const remaining = bossWordsList.filter(c => !playedBossCardIds.includes(c.id));
        const nextCard = selectNextBossCard(remaining, 0);
        if (nextCard) {
          setCurrentBossCard(nextCard);
          const limit = getCardTimeLimit(nextCard);
          setBossCardMaxTime(limit);
          setBossTimeLeft(limit);
        }
      }
    }
  }, [
    currentBossCard,
    comboCount,
    bossWordsList,
    playedBossCardIds,
    bossHp,
    shibaHp,
    deckId,
    recordWordStat,
    submitBossResult,
    selectNextBossCard,
    getCardTimeLimit,
    playCompanionVoice,
    playMascotAnim
  ]);

  const startBossMode = useCallback(() => {
    const list = buildBossWordsList();
    if (list.length === 0) return;

    setBossWordsList(list);
    setPlayedBossCardIds([]);
    setShibaHp(3);
    setComboCount(0);

    const calculatedMaxHp = list.reduce((sum, card) => sum + calculateBaseDamage(card), 0);
    setBossMaxHp(calculatedMaxHp);
    setBossHp(calculatedMaxHp);
    setIsBossMode(true);

    const firstCard = selectNextBossCard(list, 0);
    if (firstCard) {
      setCurrentBossCard(firstCard);
      const limit = getCardTimeLimit(firstCard);
      setBossCardMaxTime(limit);
      setBossTimeLeft(limit);
    }
  }, [buildBossWordsList, selectNextBossCard, getCardTimeLimit]);

  const usePhaoBoi = useCallback(async () => {
    if (!isBossMode) return false;
    const success = await deductCoins(5);
    if (success) {
      setBossTimeLeft((prev) => prev + 5);
      setBossCardMaxTime((prev) => prev + 5);
      import("react-hot-toast").then(({ toast }) => {
        toast.success("Đã sử dụng Phao Bơi! +5 giây đóng băng! 🧊", { icon: "❄️" });
      });
      return true;
    } else {
      import("react-hot-toast").then(({ toast }) => {
        toast.error("Không đủ xu! Phao Bơi cần 5 xu. 🪙");
      });
      return false;
    }
  }, [isBossMode, deductCoins]);

  const useKinhLup = useCallback(async () => {
    if (!isBossMode || !currentBossCard) return false;
    if (isHintRevealed) return true;
    const success = await deductCoins(3);
    if (success) {
      setIsHintRevealed(true);
      import("react-hot-toast").then(({ toast }) => {
        toast.success("Đã sử dụng Kính Lúp! Gợi ý chữ cái đầu. 🔍", { icon: "🔍" });
      });
      return true;
    } else {
      import("react-hot-toast").then(({ toast }) => {
        toast.error("Không đủ xu! Kính Lúp cần 3 xu. 🪙");
      });
      return false;
    }
  }, [isBossMode, currentBossCard, isHintRevealed, deductCoins]);

  const handleBossCancel = useCallback(() => {
    submitBossResult(deckId, false);
    setIsBossMode(false);
  }, [deckId, submitBossResult]);

  // Automatically reset review progress if they swipe everything in review mode, or if they finish learning
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
      // Loop review mode
      setReviewedIds([]);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [knownIds, reviewedIds, cards, isReviewMode, isMounted]);

  // Timer useEffect for Boss Fight (only handles ticking down)
  useEffect(() => {
    if (!isBossMode || bossHp <= 0 || shibaHp <= 0 || !currentBossCard) return;

    const timer = setInterval(() => {
      setBossTimeLeft((prev) => Math.max(0, prev - 0.1));
    }, 100);

    return () => clearInterval(timer);
  }, [isBossMode, bossHp, shibaHp, currentBossCard]);

  // Handle timeout side effect
  useEffect(() => {
    // if (isBossMode && bossTimeLeft <= 0 && currentBossCard && bossHp > 0 && shibaHp > 0) {
    //   handleBossWordSubmit("");
    // }
  }, [bossTimeLeft, isBossMode, currentBossCard, bossHp, shibaHp, handleBossWordSubmit]);

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
    handlePlayAudio,
    toggleFullscreen,
    appMode,
    comboCount,
    setComboCount,
    handleSwipeAction,
    isBossMode,
    setIsBossMode,
    bossHp,
    bossMaxHp,
    shibaHp,
    bossWordsList,
    currentBossCard,
    bossTimeLeft,
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
    bossCardMaxTime,
  };
}

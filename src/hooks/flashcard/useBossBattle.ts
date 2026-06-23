import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { FlashcardData } from "@/types/flashcard";
import { playSFX } from "@/utils/sfx";
import { selectAdaptiveCards } from "@/utils/wordSelector";

/**
 * Custom hook quản lý hệ thống chiến đấu Boss (Boss Fight sub-system).
 * Điều khiển HP của Boss và Shiba, tính sát thương, kích hoạt hiệu ứng Visual FX và sử dụng đạo cụ hỗ trợ.
 */
export function useBossBattle(
  deckId: string,
  cards: FlashcardData[],
  comboCount: number,
  setComboCount: React.Dispatch<React.SetStateAction<number>>,
  comboTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>,
  playMascotAnim: (state: "success" | "fail" | "hint") => void,
  playCompanionVoice: (voiceType: "correct" | "incorrect" | "victory") => void
) {
  // --- Zustand Store Mappings ---
  const bossStatusMap = useAppStore((state) => state.bossStatus);
  const bossFailedAttemptsMap = useAppStore((state) => state.bossFailedAttempts);
  const wordStats = useAppStore((state) => state.userStats.wordStats || {});
  const recordWordStat = useAppStore((state) => state.recordWordStat);
  const submitBossResult = useAppStore((state) => state.submitBossResult);
  const deductCoins = useAppStore((state) => state.deductCoins);

  const bossStatus = bossStatusMap[deckId] || "learning";
  const bossFailedAttempts = bossFailedAttemptsMap[deckId] || 0;

  // --- Boss Battle States ---
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

  // --- Battle VFX States ---
  const [activeSkillEffect, setActiveSkillEffect] = useState<"normal" | "double" | "shiba_special" | null>(null);
  const [activeDamageText, setActiveDamageText] = useState<{ damage: number; isCritical: boolean } | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [bossFlash, setBossFlash] = useState(false);
  const [projectileFlying, setProjectileFlying] = useState(false);

  // --- Boss Helpers ---

  /**
   * Giới hạn số lượng từ sẽ xuất hiện trong trận đấu Boss
   */
  const getBossWordCountLimit = (deckSize: number) => {
    if (deckSize <= 10) return Math.min(deckSize, 10);
    if (deckSize <= 20) return Math.min(deckSize, 12);
    if (deckSize <= 30) return Math.min(deckSize, 15);
    return Math.min(deckSize, 20);
  };

  /**
   * Tính toán lượng sát thương cơ bản Shiba gây ra
   */
  const calculateBaseDamage = (card: FlashcardData) => {
    const romaji = card.romaji || card.reading || "";
    const word = card.word || "";
    const reading = card.reading || "";
    const hasKanji = word !== reading;
    return 10 + romaji.length + (hasKanji ? 5 : 0);
  };

  /**
   * Tính hệ số nhân sát thương theo Combo gõ đúng liên tục
   */
  const getDamageMultiplier = (combo: number) => {
    if (combo >= 5) return 2.0;
    if (combo >= 3) return 1.5;
    return 1.0;
  };

  /**
   * Đánh giá độ khó của thẻ từ vựng
   */
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

  /**
   * Tính toán thời gian tối đa để trả lời thẻ Boss
   */
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

  /**
   * Chuẩn bị danh sách từ đấu Boss (ưu tiên từ yếu, từ cần ôn tập)
   */
  const buildBossWordsList = useCallback(() => {
    const deckSize = cards.length;
    if (deckSize === 0) return [];
    const limit = getBossWordCountLimit(deckSize);

    return selectAdaptiveCards(cards, wordStats, limit, 0.25, 0.1);
  }, [cards, wordStats]);

  /**
   * Lựa chọn thẻ Boss tiếp theo theo mức độ combo của người chơi
   */
  const selectNextBossCard = useCallback((remainingCards: FlashcardData[], combo: number) => {
    if (remainingCards.length === 0) return null;

    const easyCards = remainingCards.filter((c) => getCardDifficulty(c) === "easy");
    const mediumCards = remainingCards.filter((c) => getCardDifficulty(c) === "medium");
    const hardCards = remainingCards.filter((c) => getCardDifficulty(c) === "hard");

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

  // --- Boss Actions ---

  /**
   * Kích hoạt trận chiến Boss
   */
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
  }, [buildBossWordsList, selectNextBossCard, getCardTimeLimit, setComboCount]);

  /**
   * Xử lý khi nộp từ vựng đấu Boss
   */
  const handleBossWordSubmit = useCallback(async (input: string) => {
    if (!currentBossCard) return;

    const targetReading = (currentBossCard.romaji || currentBossCard.reading || "").toLowerCase().trim();
    const userInput = input.toLowerCase().trim();
    const isCorrect = userInput === targetReading;

    setIsHintRevealed(false);

    if (isCorrect) {
      // --- TRẢ LỜI ĐÚNG ---
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

      if (nextBossHp > 0) {
        const remaining = bossWordsList.filter((c) => !nextPlayed.includes(c.id));
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
      // --- TRẢ LỜI SAI ---
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
        const remaining = bossWordsList.filter((c) => !playedBossCardIds.includes(c.id));
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
    playMascotAnim,
    setComboCount,
    comboTimeoutRef,
  ]);

  /**
   * Đạo cụ "Phao bơi": Sử dụng 5 xu đóng băng / tăng thêm 5 giây suy nghĩ
   */
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

  /**
   * Đạo cụ "Kính lúp": Sử dụng 3 xu gợi ý ký tự đầu tiên
   */
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

  /**
   * Hủy ngang trận chiến Boss
   */
  const handleBossCancel = useCallback(() => {
    submitBossResult(deckId, false);
    setIsBossMode(false);
  }, [deckId, submitBossResult]);

  // Vận hành đếm ngược thời gian đấu Boss
  useEffect(() => {
    if (!isBossMode || bossHp <= 0 || shibaHp <= 0 || !currentBossCard) return;

    const timer = setInterval(() => {
      setBossTimeLeft((prev) => Math.max(0, prev - 0.1));
    }, 100);

    return () => clearInterval(timer);
  }, [isBossMode, bossHp, shibaHp, currentBossCard]);

  return {
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
  };
}

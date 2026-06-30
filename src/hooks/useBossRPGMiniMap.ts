import { useState, useCallback, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";
import bossRpgMaps from "../../public/data/configs/boss_rpg_maps.json";

interface UseBossRPGMiniMapParams {
  deckId: string;
  onClose: () => void;
}

/**
 * Custom Hook useBossRPGMiniMap
 * Quản lý toàn bộ trạng thái tiến trình, giao dịch Shop, và logic chiến đấu Boss RPG.
 */
export function useBossRPGMiniMap({ deckId, onClose }: UseBossRPGMiniMapParams) {
  // ═══════════════════════════════════════════
  // 1. ZUSTAND STORE HOOKS & SELECTORS
  // ═══════════════════════════════════════════
  const coins = useAppStore((state) => state.userStats.coins);
  const deductCoins = useAppStore((state) => state.deductCoins);
  const goldenFur = useAppStore((state) => state.userStats.goldenFur);
  const deductGoldenFur = useAppStore((state) => state.deductGoldenFur);
  const saveProgress = useAppStore((state) => state.saveProgress);
  const wordStats = useAppStore((state) => state.userStats.wordStats || {});

  // Các chỉ số phiên chơi Shiba hiện tại (HP, Giáp ảo, Buff tấn công)
  const shibaSessionHP = useAppStore((state) => state.shibaSessionHP);
  const setShibaSessionHP = useAppStore((state) => state.setShibaSessionHP);
  const shibaSessionShield = useAppStore((state) => state.shibaSessionShield);
  const setShibaSessionShield = useAppStore((state) => state.setShibaSessionShield);
  const shibaSessionBuffs = useAppStore((state) => state.shibaSessionBuffs);
  const setShibaSessionBuffs = useAppStore((state) => state.setShibaSessionBuffs);
  const miniMapProgress = useAppStore((state) => state.miniMapProgress);
  const setMiniMapProgress = useAppStore((state) => state.setMiniMapProgress);
  const resetMiniMapSession = useAppStore((state) => state.resetMiniMapSession);

  // ═══════════════════════════════════════════
  // 2. TRẠNG THÁI CỤC BỘ BẢN ĐỒ & DI CHUYỂN
  // ═══════════════════════════════════════════
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [flippedStageId, setFlippedStageId] = useState<string | null>(null);

  // ═══════════════════════════════════════════
  // 3. TRẠNG THÁI THỬ THÁCH MINIGAME
  // ═══════════════════════════════════════════
  const [activeChallengeType, setActiveChallengeType] = useState<"matching" | "fill" | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
  const [challengeCards, setChallengeCards] = useState<any[]>([]);
  const [challengeQuizList, setChallengeQuizList] = useState<any[]>([]);

  // ═══════════════════════════════════════════
  // 4. TRẠNG THÁI TRẬN CHIẾN BOSS
  // ═══════════════════════════════════════════
  const [bossBattleActive, setBossBattleActive] = useState(false);
  const [bossHp, setBossHp] = useState(0);
  const [bossMaxHp, setBossMaxHp] = useState(0);
  const [shibaHp, setShibaHp] = useState(3);
  const [bossWordsList, setBossWordsList] = useState<any[]>([]);
  const [currentBossCard, setCurrentBossCard] = useState<any | null>(null);
  const [playedBossCardIds, setPlayedBossCardIds] = useState<string[]>([]);
  const [bossTimeLeft, setBossTimeLeft] = useState(0);
  const [bossCardMaxTime, setBossCardMaxTime] = useState(10);
  const [isHintRevealed, setIsHintRevealed] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [comboCount, setComboCount] = useState(0);

  // Hiệu ứng hình ảnh (VFX) trận chiến
  const [activeSkillEffect, setActiveSkillEffect] = useState<"normal" | "double" | "shiba_special" | null>(null);
  const [activeDamageText, setActiveDamageText] = useState<{ damage: number; isCritical: boolean } | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [bossFlash, setBossFlash] = useState(false);
  const [projectileFlying, setProjectileFlying] = useState(false);

  // Refs hỗ trợ đọc giá trị mới nhất trong closure Timer
  const currentCardRef = useRef<any>(null);
  currentCardRef.current = currentBossCard;
  const playedCardIdsRef = useRef<string[]>([]);
  playedCardIdsRef.current = playedBossCardIds;

  // Giải mã cấu hình bản đồ từ JSON
  const mapConfig = (bossRpgMaps as any)[deckId] || (bossRpgMaps as any)["sys_n5_boss_rpg_01"];
  const stages = mapConfig.stages || [];

  // ═══════════════════════════════════════════
  // 5. HELPER KIỂM TRA TIẾN TRÌNH ẢI (Phase 1)
  // ═══════════════════════════════════════════
  const isNodeCompleted = useCallback((nodeId: string): boolean => {
    return miniMapProgress.includes(nodeId);
  }, [miniMapProgress]);

  const isNodeUnlocked = useCallback((nodeId: string): boolean => {
    const idx = stages.findIndex((s: any) => s.id === nodeId);
    if (idx === -1) return false;
    if (idx === 0) return true;
    return isNodeCompleted(stages[idx - 1].id);
  }, [stages, isNodeCompleted]);

  const getShibaCurrentNodeId = useCallback((): string => {
    if (stages.length === 0) return "";
    const uncompleted = stages.find((s: any) => !isNodeCompleted(s.id));
    return uncompleted ? uncompleted.id : stages[stages.length - 1].id;
  }, [stages, isNodeCompleted]);

  const shibaCurrentNodeId = getShibaCurrentNodeId();
  const isShopUnlocked = stages.some((stage: any) => stage.unlocksShop && isNodeCompleted(stage.id));

  // ═══════════════════════════════════════════
  // 6. XỬ LÝ KHỞI CHẠY THỬ THÁCH MINIGAME
  // ═══════════════════════════════════════════
  const handleStartChallenge = async (node: any) => {
    setIsLoadingChallenge(true);
    try {
      if (node.challenge.type === "minigame_matching") {
        let combinedCards: any[] = [];
        const fetchPromises = node.challenge.sourceDeckIds.map((targetId: string) =>
          fetch(`/data/decks/minna/${targetId}.json`).then((r) => (r.ok ? r.json() : []))
        );
        const results = await Promise.all(fetchPromises);
        results.forEach((cards) => {
          combinedCards = [...combinedCards, ...cards];
        });

        const { selectAdaptiveCards } = await import("@/utils/wordSelector");
        const adaptiveCards = selectAdaptiveCards(combinedCards, wordStats, 8);
        setChallengeCards(adaptiveCards);
        setActiveChallengeType("matching");
      } else if (node.challenge.type === "minigame_fill") {
        let combinedQuizzes: any[] = [];
        const fetchPromises = node.challenge.sourceDeckIds.map((targetId: string) =>
          fetch(`/data/decks/minna/${targetId}.json`).then((r) => (r.ok ? r.json() : []))
        );
        const results = await Promise.all(fetchPromises);
        results.forEach((quizzes) => {
          combinedQuizzes = [...combinedQuizzes, ...quizzes];
        });

        setChallengeQuizList(combinedQuizzes);
        setActiveChallengeType("fill");
      }
    } catch (error) {
      console.error("Lỗi khi khiêu chiến ải:", error);
      toast.error("Không thể tải dữ liệu thử thách!");
    } finally {
      setIsLoadingChallenge(false);
    }
  };

  const handleChallengeWin = () => {
    if (selectedNodeId) {
      if (!miniMapProgress.includes(selectedNodeId)) {
        setMiniMapProgress([...miniMapProgress, selectedNodeId]);
      }
      toast.success(`Chiến thắng! Bạn đã vượt qua chướng ngại vật.`);
    }
    setActiveChallengeType(null);
    setSelectedNodeId(null);
  };

  const handleChallengeClose = () => {
    const stage = stages.find((s: any) => s.id === selectedNodeId);
    const damage = stage?.penaltyDamage ?? 25;
    const newHP = Math.max(0, shibaSessionHP - damage);
    setShibaSessionHP(newHP);
    toast.error(`Thất bại thử thách! Shiba bị mất ${damage} HP.`);

    if (newHP <= 0) {
      toast.error("Shiba đã kiệt sức! Hãy ghé Cửa Hàng ở góc để mua máu hồi phục.");
    }
    setActiveChallengeType(null);
    setSelectedNodeId(null);
  };

  // ═══════════════════════════════════════════
  // 7. GIAO DỊCH VÀ MUA VẬT PHẨM SHOP (Phase 2)
  // ═══════════════════════════════════════════
  const [shopPurchasedCounts, setShopPurchasedCounts] = useState<Record<string, number>>({});

  const handleBuyItem = async (item: any, currency: "bones" | "gold") => {
    const purchasedCount = shopPurchasedCounts[item.id] || 0;
    if (purchasedCount >= item.limit) {
      toast.error("Vật phẩm đã đạt giới hạn mua!");
      return;
    }

    if (item.effect.type === "heal" && shibaSessionHP >= 100) {
      toast.error("Máu Shiba đã đầy!");
      return;
    }
    if (item.effect.type === "buff_atk" && shibaSessionBuffs.includes(item.id)) {
      toast.error("Bạn đã sở hữu Bùa này rồi!");
      return;
    }

    // Trừ tiền tương ứng
    if (currency === "bones") {
      if (coins < item.costBones) {
        toast.error("Không đủ Xương!");
        return;
      }
      const ok = await deductCoins(item.costBones);
      if (!ok) return;
    } else {
      if (goldenFur < item.costGoldenFur) {
        toast.error("Không đủ Xu Vàng!");
        return;
      }
      const ok = await deductGoldenFur(item.costGoldenFur);
      if (!ok) return;
    }

    // Áp dụng hiệu quả vật phẩm
    if (item.effect.type === "heal") {
      setShibaSessionHP(Math.min(100, shibaSessionHP + item.effect.value));
      toast.success(`Hồi phục thành công +${item.effect.value} HP!`);
    } else if (item.effect.type === "shield") {
      setShibaSessionShield(shibaSessionShield + item.effect.value);
      toast.success(`Nhận Giáp Bảo Vệ: +${item.effect.value} Giáp!`);
    } else if (item.effect.type === "buff_atk") {
      setShibaSessionBuffs([...shibaSessionBuffs, item.id]);
      toast.success(`Kích hoạt Bùa Tăng Lực: Tăng 20% sát thương!`);
    }

    setShopPurchasedCounts((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  // ═══════════════════════════════════════════
  // 8. LOGIC CHIẾN ĐẤU BOSS (Phase 5)
  // ═══════════════════════════════════════════
  const calculateBaseDamage = (card: any) => {
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

  const getCardTimeLimit = (card: any) => {
    const romaji = card.romaji || card.reading || "";
    const baseTime = 2.5 + 0.35 * romaji.length;
    return Math.max(4, Math.min(10, baseTime));
  };

  const handleStartBossBattle = async (node: any) => {
    setIsLoadingChallenge(true);
    try {
      const res = await fetch(`/data/decks/minna/${node.challenge.sourceDeckIds[0]}.json`);
      if (!res.ok) throw new Error("Could not load boss deck");
      const list = await res.json();

      if (list.length === 0) return;

      setBossWordsList(list);
      setPlayedBossCardIds([]);
      setShibaHp(3);
      setComboCount(0);
      setIsTimerActive(false);

      const calculatedMaxHp = list.reduce((sum: number, card: any) => sum + calculateBaseDamage(card), 0);
      setBossMaxHp(calculatedMaxHp);
      setBossHp(calculatedMaxHp);

      const firstCard = list[0];
      setCurrentBossCard(firstCard);
      const limit = getCardTimeLimit(firstCard);
      setBossCardMaxTime(limit);
      setBossTimeLeft(limit);

      setSelectedNodeId(null);
      setBossBattleActive(true);
    } catch (error) {
      console.error("Lỗi khi tải trận chiến Boss:", error);
      toast.error("Không thể khởi động trận chiến Boss!");
    } finally {
      setIsLoadingChallenge(false);
    }
  };

  const handleBossBattleWin = () => {
    saveProgress(deckId, ["completed"]);
    resetMiniMapSession();

    // Thưởng x2 nếu vượt qua không ghé shop
    const hasSkippedShop = miniMapProgress.includes("skip_shop");
    const bonus = hasSkippedShop ? 300 : 150;

    const addCoinsStore = useAppStore.getState().addCoins;
    addCoinsStore(bonus);

    toast.success(`Chúc mừng! Bạn đã chinh phục Pháo Đài Kitsune và nhận ${bonus} Bones! ${hasSkippedShop ? "(x2 Thưởng Mạo Hiểm)" : ""}`, {
      duration: 6000
    });
    setBossBattleActive(false);
    onClose();
  };

  const handleBossBattleLose = () => {
    setBossBattleActive(false);
    const stage = stages.find((s: any) => s.id === selectedNodeId);
    const damage = stage?.penaltyDamage ?? 100;
    const newHP = Math.max(0, shibaSessionHP - damage);
    setShibaSessionHP(newHP);

    if (newHP <= 0) {
      toast.error("Trận chiến thất bại! Shiba kiệt sức và đã hết máu. Hãy ghé Cửa Hàng ở góc để mua máu hồi phục.", { duration: 5000 });
    } else {
      toast.error(`Trận chiến thất bại! Shiba bị mất ${damage} HP.`, { duration: 5000 });
    }
  };

  const handleUsePhaoBoi = async (currency: "coins" | "goldenFur") => {
    const cost = currency === "goldenFur" ? 1 : 5;
    const hasEnough = currency === "goldenFur" ? useAppStore.getState().userStats.goldenFur >= cost : coins >= cost;
    if (!hasEnough) {
      toast.error("Không đủ xu hoặc lông vàng!");
      return false;
    }
    if (currency === "goldenFur") {
      useAppStore.getState().deductGoldenFur(cost);
    } else {
      deductCoins(cost);
    }
    setBossTimeLeft((prev) => prev + 5);
    setBossCardMaxTime((prev) => prev + 5);
    toast.success("Đã quăng Phao Bơi! +5 giây suy nghĩ.");
    return true;
  };

  const handleUseKinhLup = async (currency: "coins" | "goldenFur") => {
    if (isHintRevealed) return true;
    const cost = currency === "goldenFur" ? 1 : 3;
    const hasEnough = currency === "goldenFur" ? useAppStore.getState().userStats.goldenFur >= cost : coins >= cost;
    if (!hasEnough) {
      toast.error("Không đủ xu hoặc lông vàng!");
      return false;
    }
    if (currency === "goldenFur") {
      useAppStore.getState().deductGoldenFur(cost);
    } else {
      deductCoins(cost);
    }
    setIsHintRevealed(true);
    toast.success("Đã dùng Kính Lúp! Gợi ý chữ cái đầu.");
    return true;
  };

  // Trả lời câu hỏi trong trận Boss
  const handleBossWordSubmit = useCallback(async (input: string) => {
    const activeCard = currentCardRef.current;
    if (!activeCard) return;

    const targetReading = (activeCard.romaji || activeCard.reading || "").toLowerCase().trim();
    const userInput = input.toLowerCase().trim();
    const isCorrect = userInput === targetReading;

    if (isCorrect) {
      const newCombo = comboCount + 1;
      setComboCount(newCombo);

      const baseDamage = calculateBaseDamage(activeCard);
      let multiplier = getDamageMultiplier(newCombo);

      if (shibaSessionBuffs.includes("item_atk_buff")) {
        multiplier *= 1.2;
      }

      const actualDamage = Math.round(baseDamage * multiplier);

      setProjectileFlying(true);
      setActiveSkillEffect(newCombo >= 5 ? "shiba_special" : newCombo >= 3 ? "double" : "normal");

      setTimeout(() => {
        setProjectileFlying(false);
        const nextHp = Math.max(0, bossHp - actualDamage);
        setBossHp(nextHp);

        setBossFlash(true);
        setScreenShake(true);
        setActiveDamageText({ damage: actualDamage, isCritical: newCombo >= 5 });

        setTimeout(() => {
          setBossFlash(false);
          setScreenShake(false);
          setActiveDamageText(null);

          if (nextHp <= 0) {
            handleBossBattleWin();
          } else {
            const nextPlayed = [...playedCardIdsRef.current, activeCard.id];
            setPlayedBossCardIds(nextPlayed);
            const remaining = bossWordsList.filter((c) => !nextPlayed.includes(c.id));
            if (remaining.length === 0) {
              handleBossBattleWin();
            } else {
              const nextCard = remaining[0];
              setCurrentBossCard(nextCard);
              const limit = getCardTimeLimit(nextCard);
              setBossCardMaxTime(limit);
              setBossTimeLeft(limit);
            }
          }
        }, 800);
      }, 500);
    } else {
      setComboCount(0);
      setBossFlash(true);
      setScreenShake(true);

      setTimeout(() => {
        setBossFlash(false);
        setScreenShake(false);

        const isShieldActive = shibaSessionShield > 0;
        if (isShieldActive) {
          setShibaSessionShield(Math.max(0, shibaSessionShield - 1));
          toast("Shiba bị tấn công nhưng Giáp Bảo Vệ đã đỡ đòn!");

          const nextPlayed = [...playedCardIdsRef.current, activeCard.id];
          setPlayedBossCardIds(nextPlayed);
          const remaining = bossWordsList.filter((c) => !nextPlayed.includes(c.id));
          if (remaining.length === 0) {
            handleBossBattleLose();
          } else {
            const nextCard = remaining[0];
            setCurrentBossCard(nextCard);
            const limit = getCardTimeLimit(nextCard);
            setBossCardMaxTime(limit);
            setBossTimeLeft(limit);
          }
        } else {
          const nextShibaHp = shibaHp - 1;
          setShibaHp(nextShibaHp);

          if (nextShibaHp <= 0) {
            handleBossBattleLose();
          } else {
            const nextPlayed = [...playedCardIdsRef.current, activeCard.id];
            setPlayedBossCardIds(nextPlayed);
            const remaining = bossWordsList.filter((c) => !nextPlayed.includes(c.id));
            if (remaining.length === 0) {
              handleBossBattleLose();
            } else {
              const nextCard = remaining[0];
              setCurrentBossCard(nextCard);
              const limit = getCardTimeLimit(nextCard);
              setBossCardMaxTime(limit);
              setBossTimeLeft(limit);
            }
          }
        }
      }, 500);
    }
  }, [comboCount, bossHp, bossWordsList, shibaHp, shibaSessionShield, shibaSessionBuffs]);

  // Bộ đếm thời gian lùi trong trận đánh Boss
  useEffect(() => {
    if (!bossBattleActive || !isTimerActive || bossHp <= 0 || shibaHp <= 0 || !currentBossCard) return;

    const timer = setInterval(() => {
      setBossTimeLeft((prev) => {
        if (prev <= 0.1) {
          handleBossWordSubmit("");
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [bossBattleActive, isTimerActive, bossHp, shibaHp, currentBossCard, handleBossWordSubmit]);

  const selectedNode = stages.find((n: any) => n.id === selectedNodeId);
  const mockMinigameDeck = selectedNode ? {
    id: selectedNode.id,
    title: selectedNode.title,
    type: selectedNode.challenge?.type,
    level: "N5",
    rewardCoins: 15
  } : null;

  return {
    coins,
    goldenFur,
    shibaSessionHP,
    shibaSessionShield,
    shibaSessionBuffs,
    stages,
    mapConfig,
    shopOpen,
    setShopOpen,
    flippedStageId,
    setFlippedStageId,
    activeChallengeType,
    isLoadingChallenge,
    challengeCards,
    challengeQuizList,
    handleStartChallenge,
    handleChallengeWin,
    handleChallengeClose,
    handleBuyItem,
    isShopUnlocked,
    shibaCurrentNodeId,
    isNodeCompleted,
    isNodeUnlocked,
    bossBattleActive,
    bossHp,
    bossMaxHp,
    shibaHp,
    bossTimeLeft,
    bossCardMaxTime,
    comboCount,
    activeSkillEffect,
    activeDamageText,
    screenShake,
    bossFlash,
    projectileFlying,
    isHintRevealed,
    handleBossWordSubmit,
    handleUsePhaoBoi,
    handleUseKinhLup,
    handleBossBattleLose,
    isTimerActive,
    setIsTimerActive,
    currentBossCard,
    handleStartBossBattle,
    mockMinigameDeck,
    selectedNodeId,
    setSelectedNodeId,
    shopPurchasedCounts
  };
}

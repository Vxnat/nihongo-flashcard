"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import { Heart, LogOut, Shield, Zap, Sparkles, Bone, ShoppingCart, DoorOpen, Lock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

// Import configurations
import bossRpgMaps from "../../../public/data/configs/boss_rpg_maps.json";

// Import real minigame components
import { MatchingPairsGame } from "@/components/games/matching-pairs/MatchingPairsGame";
import { FillBlanksGame } from "@/components/games/fill-blanks/FillBlanksGame";

// Import real Boss Battle component
import { BossBattleScreen } from "@/components/flashcard/BossBattleScreen";

interface BossRPGMiniMapProps {
  deckId: string;
  onClose: () => void;
}

export function BossRPGMiniMap({ deckId, onClose }: BossRPGMiniMapProps) {
  const coins = useAppStore((state) => state.userStats.coins);
  const deductCoins = useAppStore((state) => state.deductCoins);
  const saveProgress = useAppStore((state) => state.saveProgress);
  const wordStats = useAppStore((state) => state.userStats.wordStats || {});

  // RPG session state from store
  const shibaSessionHP = useAppStore((state) => state.shibaSessionHP);
  const setShibaSessionHP = useAppStore((state) => state.setShibaSessionHP);
  const shibaSessionShield = useAppStore((state) => state.shibaSessionShield);
  const setShibaSessionShield = useAppStore((state) => state.setShibaSessionShield);
  const shibaSessionBuffs = useAppStore((state) => state.shibaSessionBuffs);
  const setShibaSessionBuffs = useAppStore((state) => state.setShibaSessionBuffs);
  const miniMapProgress = useAppStore((state) => state.miniMapProgress);
  const setMiniMapProgress = useAppStore((state) => state.setMiniMapProgress);
  const resetMiniMapSession = useAppStore((state) => state.resetMiniMapSession);

  // Local state for modals, shop, and active minigame challenge
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isWalking, setIsWalking] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  const [shibaPos, setShibaPos] = useState({ x: 50, y: 85 });
  const [previousNodeId, setPreviousNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Bezier curve coordinate resolver for character travel
  const getBezierPoint = (x1: number, y1: number, x2: number, y2: number, t: number) => {
    const midY = (y1 + y2) / 2;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;
    return {
      x: mt3 * x1 + 3 * mt2 * t * x1 + 3 * mt * t2 * x2 + t3 * x2,
      y: mt3 * y1 + 3 * mt2 * t * midY + 3 * mt * t2 * midY + t3 * y2,
    };
  };

  // Challenge execution states
  const [activeChallengeType, setActiveChallengeType] = useState<"matching" | "fill" | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
  const [challengeCards, setChallengeCards] = useState<any[]>([]);
  const [challengeQuizList, setChallengeQuizList] = useState<any[]>([]);

  // ============================================================
  // REAL BOSS BATTLE BINDING STATES (Phase 5)
  // ============================================================
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

  // Battle VFX States
  const [activeSkillEffect, setActiveSkillEffect] = useState<"normal" | "double" | "shiba_special" | null>(null);
  const [activeDamageText, setActiveDamageText] = useState<{ damage: number; isCritical: boolean } | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [bossFlash, setBossFlash] = useState(false);
  const [projectileFlying, setProjectileFlying] = useState(false);

  // Store active card references for the timer closure
  const currentCardRef = useRef<any>(null);
  currentCardRef.current = currentBossCard;
  const playedCardIdsRef = useRef<string[]>([]);
  playedCardIdsRef.current = playedBossCardIds;

  // Get map config based on deckId (fallback to chapter 1 boss)
  const mapConfig = (bossRpgMaps as any)[deckId] || (bossRpgMaps as any)["sys_n5_boss_rpg_01"];
  const rows = mapConfig.rows || [];
  const nodes = React.useMemo(() => rows.flat(), [rows]);

  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const updatePositions = useCallback(() => {
    if (!mapContainerRef.current) return;
    const containerRect = mapContainerRef.current.getBoundingClientRect();
    const positions: Record<string, { x: number; y: number }> = {};

    nodes.forEach((node: any) => {
      const el = document.getElementById(`node-${node.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const x = ((rect.left + rect.width / 2 - containerRect.left) / containerRect.width) * 100;
        const y = ((rect.top + rect.height / 2 - containerRect.top) / containerRect.height) * 100;
        positions[node.id] = { x, y };
      }
    });

    setNodePositions(positions);
  }, [nodes]);

  // Node graph helper methods
  const isNodeUnlocked = (nodeId: string): boolean => {
    if (nodeId === mapConfig.startNodeId) return true;

    // Branch locking:
    if (nodeId === "shop" && miniMapProgress.includes("skip_shop")) return false;
    if (nodeId === "skip_shop" && miniMapProgress.includes("shop")) return false;

    // Find nodes that link to this nodeId
    const parents = nodes.filter((n: any) => n.next.includes(nodeId));

    // If any parent is completed, this node is unlocked
    return parents.some((parent: any) => {
      if (parent.id === "fork_decision") {
        return miniMapProgress.includes("guardian_1");
      }
      return miniMapProgress.includes(parent.id);
    });
  };

  const isNodeCompleted = (nodeId: string): boolean => {
    return miniMapProgress.includes(nodeId);
  };

  const getShibaCurrentNodeId = (): string => {
    if (miniMapProgress.includes("final_boss")) return "final_boss";
    if (miniMapProgress.includes("guardian_2")) return "final_boss";
    if (miniMapProgress.includes("shop") || miniMapProgress.includes("skip_shop")) return "guardian_2";
    if (shopOpen) return "shop";
    if (miniMapProgress.includes("guardian_1")) return "fork_decision";
    return "guardian_1";
  };

  const shibaCurrentNodeId = getShibaCurrentNodeId();

  // Setup coordinate observer for responsive layouts
  useEffect(() => {
    updatePositions();
    window.addEventListener("load", updatePositions);
    window.addEventListener("resize", updatePositions);

    const timeout = setTimeout(updatePositions, 100);
    const timeout2 = setTimeout(updatePositions, 500);

    return () => {
      window.removeEventListener("load", updatePositions);
      window.removeEventListener("resize", updatePositions);
      clearTimeout(timeout);
      clearTimeout(timeout2);
    };
  }, [updatePositions, miniMapProgress, shibaCurrentNodeId]);

  // Smoothly animate the player marker when shibaCurrentNodeId changes
  useEffect(() => {
    if (!previousNodeId) {
      const pos = nodePositions[shibaCurrentNodeId];
      if (pos) {
        setShibaPos({ x: pos.x, y: pos.y });
        setPreviousNodeId(shibaCurrentNodeId);
      }
      return;
    }

    const startPos = nodePositions[previousNodeId];
    const endPos = nodePositions[shibaCurrentNodeId];

    if (startPos && endPos && previousNodeId !== shibaCurrentNodeId) {
      setIsWalking(true);
      const controls = animate(0, 1, {
        duration: 1.2,
        ease: "easeInOut",
        onUpdate: (t) => {
          const pt = getBezierPoint(
            startPos.x,
            startPos.y,
            endPos.x,
            endPos.y,
            t
          );
          setShibaPos(pt);
        },
        onComplete: () => {
          setIsWalking(false);
          setPreviousNodeId(shibaCurrentNodeId);
        },
      });
      return () => controls.stop();
    } else if (previousNodeId === shibaCurrentNodeId) {
      const pos = nodePositions[shibaCurrentNodeId];
      if (pos) {
        setShibaPos({ x: pos.x, y: pos.y });
      }
    }
  }, [shibaCurrentNodeId, previousNodeId, nodePositions]);

  const handleNodeClick = (nodeId: string) => {
    if (!isNodeUnlocked(nodeId)) {
      toast.error("Đường này hiện đang bị khóa!");
      return;
    }

    setIsWalking(true);
    setTimeout(() => {
      setIsWalking(false);

      if (nodeId === "shop") {
        if (!miniMapProgress.includes("fork_decision")) {
          setMiniMapProgress([...miniMapProgress, "fork_decision"]);
        }
        setShopOpen(true);
      } else if (nodeId === "skip_shop") {
        if (!miniMapProgress.includes("fork_decision")) {
          setMiniMapProgress([...miniMapProgress, "fork_decision", "skip_shop"]);
        } else {
          setMiniMapProgress([...miniMapProgress, "skip_shop"]);
        }
        toast.success("Bạn đã chọn hướng Đi Thẳng mạo hiểm! Nhận x2 Bones khi thắng Boss.");
      } else {
        setSelectedNodeId(nodeId);
      }
    }, 450);
  };

  // Launch the real minigame challenge based on node type
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
          fetch(`/data/decks/grammar/${targetId}.json`).then((r) => (r.ok ? r.json() : []))
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
    const damage = 25;
    const newHP = Math.max(0, shibaSessionHP - damage);
    setShibaSessionHP(newHP);
    toast.error(`Thất bại thử thách! Shiba bị mất ${damage} HP.`);

    if (newHP <= 0) {
      toast.error("Shiba đã kiệt sức! Hãy ghé Trạm Dừng Chân để mua máu hồi phục.");
    }
    setActiveChallengeType(null);
    setSelectedNodeId(null);
  };

  const handleBuyItem = (item: any) => {
    if (coins < item.cost) {
      toast.error("Không đủ Bones!");
      return;
    }

    if (item.effect.type === "heal") {
      if (shibaSessionHP >= 100) {
        toast.error("Máu Shiba đã đầy!");
        return;
      }
      deductCoins(item.cost);
      setShibaSessionHP(Math.min(100, shibaSessionHP + item.effect.value));
      toast.success(`Hồi phục thành công +${item.effect.value} HP!`);
    } else if (item.effect.type === "shield") {
      deductCoins(item.cost);
      setShibaSessionShield(shibaSessionShield + item.effect.value);
      toast.success(`Nhận Giáp Bảo Vệ: +${item.effect.value} Giáp!`);
    } else if (item.effect.type === "buff_atk") {
      if (shibaSessionBuffs.includes(item.id)) {
        toast.error("Bạn đã sở hữu Buff này rồi!");
        return;
      }
      deductCoins(item.cost);
      setShibaSessionBuffs([...shibaSessionBuffs, item.id]);
      toast.success(`Kích hoạt Bùa Tăng Lực: Tăng 20% sát thương!`);
    }
  };

  const handleFinishShop = () => {
    if (!miniMapProgress.includes("shop")) {
      setMiniMapProgress([...miniMapProgress, "shop"]);
    }
    setShopOpen(false);
    toast.success("Rời trạm dừng chân. Hành trang đã sẵn sàng!");
  };

  // ============================================================
  // TURN-BASED BOSS BATTLE IMPLEMENTATION (Phase 5)
  // ============================================================
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

  const handleBossWordSubmit = useCallback(async (input: string) => {
    const activeCard = currentCardRef.current;
    if (!activeCard) return;

    const targetReading = (activeCard.romaji || activeCard.reading || "").toLowerCase().trim();
    const userInput = input.toLowerCase().trim();
    const isCorrect = userInput === targetReading;

    setIsHintRevealed(false);

    if (isCorrect) {
      // --- CORRECT ANSWER ---
      const newCombo = comboCount + 1;
      setComboCount(newCombo);

      const baseDamage = calculateBaseDamage(activeCard);
      let multiplier = getDamageMultiplier(newCombo);

      // Apply ATK Shop Buff multiplier (e.g. +20% damage)
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

        // Shake screen & flash boss
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

        if (nextHp <= 0) {
          // BOSS DEFEATED
          setTimeout(() => {
            handleBossBattleWin();
          }, 800);
          return;
        }

        // Load next card
        const nextPlayed = [...playedCardIdsRef.current, activeCard.id];
        setPlayedBossCardIds(nextPlayed);

        const remaining = bossWordsList.filter((c) => !nextPlayed.includes(c.id));
        if (remaining.length === 0) {
          // No more cards but boss not dead
          handleBossBattleLose();
        } else {
          const nextCard = remaining[0];
          setCurrentBossCard(nextCard);
          const limit = getCardTimeLimit(nextCard);
          setBossCardMaxTime(limit);
          setBossTimeLeft(limit);
        }
      }, 500);
    } else {
      // --- INCORRECT ANSWER (or timeout) ---
      setComboCount(0);

      // Check wooden shield absorption
      if (shibaSessionShield >= 25) {
        setShibaSessionShield(shibaSessionShield - 25);
        toast.success("Khiên Gỗ đã đỡ đòn hộ Shiba! (-25 Giáp)", { icon: "🛡️" });

        // Load next card anyway
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
    }
  }, [comboCount, bossHp, bossWordsList, shibaHp, shibaSessionShield, shibaSessionBuffs]);

  const handleBossBattleWin = () => {
    saveProgress(deckId, ["completed"]);
    resetMiniMapSession();

    // Check if player skipped shop to award double coins
    const hasSkippedShop = miniMapProgress.includes("skip_shop");
    const bonus = hasSkippedShop ? 300 : 150;

    // Add bonus coins to Zustand store
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
    setShibaSessionHP(10); // Reduce Shiba HP to 10 on map
    toast.error("Trận chiến thất bại! Shiba kiệt sức và chỉ còn 10 HP. Hãy mua hồi phục ở Trạm dừng chân.", { duration: 5000 });
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

  // Run the combat countdown timer
  React.useEffect(() => {
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

  const selectedNode = nodes.find((n: any) => n.id === selectedNodeId);
  const shopNode = nodes.find((n: any) => n.type === "shop");

  const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  };

  const mockMinigameDeck = selectedNode ? {
    id: selectedNode.id,
    title: selectedNode.title,
    type: selectedNode.challenge?.type,
    level: "N5",
    rewardCoins: 15
  } : null;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#FFFDF9] via-[#FFF3E8] to-[#FFE4D5] z-[300] flex flex-col font-rounded select-none overflow-hidden text-zinc-800 relative rounded-2xl animate-fade-in"
      style={{ fontFamily: "var(--font-cherry)" }}
    >

      {/* Embedded CSS animations for stardust path flowing */}
      <style>{`
        @keyframes stardustFlowAnimate {
          from { stroke-dashoffset: 60; }
          to { stroke-dashoffset: 0; }
        }
        .animate-stardust-flow {
          animation: stardustFlowAnimate 1.8s linear infinite;
        }
      `}</style>

      {/* Cosmic Nebula Pastel Clouds (Concept 4 style) */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#ffa6c9]/20 blur-[130px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#bdb2ff]/20 blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-[#a0c4ff]/15 blur-[120px] pointer-events-none z-0 animate-pulse" />

      {/* 2D STAR SPARKLES EFFECT (Pastel Pink) */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffa6c944_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

      {/* ═══════════════════════════════════════════ */}
      {/* 1. STATUS HEADER BAR (JRPG Hero Dashboard)   */}
      {/* ═══════════════════════════════════════════ */}
      <div className="w-full bg-white/40 border-b border-white/40 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between z-20 shrink-0 shadow-sm relative gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-[#ffa6c9]/10 border border-[#ffa6c9]/30 flex items-center justify-center text-[#FF7096] hover:text-white hover:bg-[#FF7096] hover:border-[#FF7096] transition-all cursor-pointer active:scale-90 shadow-sm"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div className="text-left">
            <h1
              className="text-sm sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#8C5E43] to-[#5C3E21] leading-tight filter drop-shadow-[0_1px_2px_rgba(140,94,67,0.15)] select-none uppercase tracking-wide"
            >
              {mapConfig.mapTitle}
            </h1>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* 2. 2D BRANCHING ROADMAP CANVAS              */}
      {/* ═══════════════════════════════════════════ */}
      <div className="flex-1 w-full relative overflow-y-auto px-4 py-8 flex justify-center items-start min-h-0 bg-transparent z-10">

        {/* Winding/Branching Map Container */}
        <div
          ref={mapContainerRef}
          className="relative w-full max-w-lg h-[680px] bg-white/40 border border-white/50 backdrop-blur-lg rounded-[2.5rem] shadow-[0_20px_40px_rgba(139,92,26,0.12)] p-6 overflow-hidden flex flex-col"
        >

          {/* Decorative Corner Stars (Concept 4 style) */}
          <div className="absolute top-3 left-3 text-[10px] text-[#ffa6c9]/80 animate-pulse select-none">✦</div>
          <div className="absolute top-3 right-3 text-[10px] text-[#ffa6c9]/80 animate-pulse select-none">✦</div>
          <div className="absolute bottom-3 left-3 text-[10px] text-[#ffa6c9]/80 animate-pulse select-none">✦</div>
          <div className="absolute bottom-3 right-3 text-[10px] text-[#ffa6c9]/80 animate-pulse select-none">✦</div>

          {/* Background Ambient Glows */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-amber-200/20 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-10 left-1/3 w-60 h-60 rounded-full bg-orange-200/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-rose-200/10 blur-[70px] pointer-events-none" />

          {/* Floating Shiba JRPG Stats Capsule */}
          <div className="absolute top-6 left-6 right-6 z-20 bg-white/70 backdrop-blur-md border border-white/60 p-3 rounded-3xl shadow-sm text-[#5C3E21] flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {/* Avatar frame */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD2B4] to-[#FFA6C9] border border-white/60 flex items-center justify-center relative shadow-sm shrink-0">
                <img
                  src="/images/ui/roadmap/shiba_marker.png"
                  alt="Dog"
                  className="w-10 h-10 object-contain"
                />
              </div>

              <div className="flex flex-col gap-1 flex-1">
                {/* Status bars container */}
                <div className="flex items-center gap-3 w-full">
                  {/* HP Bar */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-0" title={`Sinh lực: ${shibaSessionHP}/100`}>
                    <Heart className={`w-3.5 h-3.5 text-rose-500 shrink-0 ${shibaSessionHP > 0 ? "animate-pulse" : ""}`} fill="currentColor" />
                    <div className="flex-1 bg-zinc-100/50 h-2 rounded-full overflow-hidden border border-zinc-200/40 p-0.5">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#FF6B8B] to-[#FFA6C9] rounded-full"
                        animate={{ width: `${shibaSessionHP}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-[9px] font-black text-[#FF6B8B] font-sans leading-none shrink-0">{shibaSessionHP}</span>
                  </div>

                  {/* Shield Bar */}
                  {shibaSessionShield > 0 && (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0" title={`Giáp ảo: ${shibaSessionShield}`}>
                      <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" fill="currentColor" />
                      <div className="flex-1 bg-zinc-100/50 h-2 rounded-full overflow-hidden border border-zinc-200/40 p-0.5">
                        <motion.div
                          className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full"
                          animate={{ width: `${Math.min(100, shibaSessionShield * 2)}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className="text-[9px] font-black text-[#0284C7] font-sans leading-none shrink-0">{shibaSessionShield}</span>
                    </div>
                  )}
                </div>

                {/* Buffs and Currency row */}
                <div className="flex items-center justify-between mt-0.5 w-full">
                  {/* Buff indicators */}
                  <div className="flex gap-1">
                    {shibaSessionBuffs.length > 0 ? (
                      <span className="flex items-center gap-0.5 bg-[#FEF08A]/40 text-[#854D0E] border border-[#FEF08A]/80 px-1 py-0.2 rounded-sm text-[8px] font-bold animate-pulse leading-none">
                        <Zap className="w-2 h-2" />
                        <span>ATK x1.2</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Coins bone badge (Lucide Bone) */}
                  <div className="flex items-center gap-1.5 text-[#8C5E43] font-black text-[10px] bg-[#FAF0D7]/80 px-2.5 py-1 rounded-full border border-amber-200/40 leading-none shadow-sm animate-pulse-slow">
                    <span>{coins}</span>
                    <Bone className="w-3 h-3 rotate-45 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable map content */}
          <div className="flex-1 w-full relative mt-16 overflow-y-auto hide-scrollbar">

            {/* SVG PATHS (Drawing Connections) */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
            >
              <defs>
                <linearGradient id="stardustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>

              {nodePositions && nodes.map((node: any) => {
                return node.next.map((nextNodeId: string) => {
                  const nextNode = nodes.find((n: any) => n.id === nextNodeId);
                  if (!nextNode) return null;

                  const pos1 = nodePositions[node.id];
                  const pos2 = nodePositions[nextNodeId];
                  if (!pos1 || !pos2) return null;

                  const unlocked = isNodeUnlocked(nextNodeId);
                  const completed = isNodeCompleted(node.id);
                  const isLockedOutPath =
                    (nextNodeId === "shop" && miniMapProgress.includes("skip_shop")) ||
                    (nextNodeId === "skip_shop" && miniMapProgress.includes("shop"));

                  // Highlight paths based on state (Warm Cozy Pastel Colors)
                  let strokeColor = "#E2E8F0"; // Default locked path (Slate Gray)
                  if (isLockedOutPath) {
                    strokeColor = "#F1F5F9";
                  } else if (completed) {
                    strokeColor = "#34D399"; // completed path (Emerald Green)
                  } else if (unlocked && isNodeUnlocked(node.id)) {
                    strokeColor = "#F59E0B"; // active path (Amber Yellow)
                  }

                  return (
                    <g key={`${node.id}-${nextNodeId}`} opacity={isLockedOutPath ? 0.2 : 1}>
                      {/* Glowing blur trail */}
                      <path
                        d={getBezierPath(pos1.x, pos1.y, pos2.x, pos2.y)}
                        fill="none"
                        stroke={completed ? "#34D399" : unlocked && isNodeUnlocked(node.id) ? "#F59E0B" : strokeColor}
                        strokeWidth="12"
                        opacity={isLockedOutPath ? 0.02 : completed ? 0.12 : unlocked && isNodeUnlocked(node.id) ? 0.25 : 0.05}
                        className="blur-[2px] transition-all duration-300"
                      />
                      {/* Core path line */}
                      <path
                        d={getBezierPath(pos1.x, pos1.y, pos2.x, pos2.y)}
                        fill="none"
                        stroke={completed ? "#34D399" : unlocked && isNodeUnlocked(node.id) ? "#F59E0B" : strokeColor}
                        strokeWidth={completed ? "4" : unlocked && isNodeUnlocked(node.id) ? "3.5" : "3"}
                        strokeDasharray={completed ? "none" : unlocked && isNodeUnlocked(node.id) ? "8 6" : "6 6"}
                        className="transition-all duration-300"
                        opacity={completed ? 1 : unlocked && isNodeUnlocked(node.id) ? 1 : 0.6}
                      />
                      {/* Running stardust beads on active paths */}
                      {unlocked && isNodeUnlocked(node.id) && !completed && !isLockedOutPath && (
                        <path
                          d={getBezierPath(pos1.x, pos1.y, pos2.x, pos2.y)}
                          fill="none"
                          stroke="url(#stardustGradient)"
                          strokeWidth="3.5"
                          strokeDasharray="8 20"
                          className="animate-stardust-flow"
                          style={{
                            filter: "drop-shadow(0 0 3px rgba(245, 158, 11, 0.8))",
                          }}
                        />
                      )}
                    </g>
                  );
                });
              })}
            </svg>

            {/* RENDER NODE BUTTONS IN ROWS */}
            <div className="flex flex-col-reverse justify-between h-full py-12 relative z-10 w-full px-6 min-h-[500px]">
              {rows.map((row: any[], rowIndex: number) => (
                <div key={rowIndex} className="flex justify-center gap-16 relative w-full items-center">
                  {row.map((node) => {
                    const unlocked = isNodeUnlocked(node.id);
                    const completed = isNodeCompleted(node.id);
                    const isLockedOutNode =
                      (node.id === "shop" && miniMapProgress.includes("skip_shop")) ||
                      (node.id === "skip_shop" && miniMapProgress.includes("shop"));

                    return (
                      <div
                        key={node.id}
                        id={`node-${node.id}`}
                        className={`relative z-10 transition-opacity duration-300 flex flex-col items-center ${isLockedOutNode ? "opacity-25 pointer-events-none grayscale" : "opacity-100"
                          }`}
                      >
                        {/* Floating Glassmorphic Tooltip */}
                        <AnimatePresence>
                          {hoveredNodeId === node.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 12, scale: 0.95, x: "-50%" }}
                              animate={{ opacity: 1, y: -8, scale: 1, x: "-50%" }}
                              exit={{ opacity: 0, y: 12, scale: 0.95, x: "-50%" }}
                              className="absolute bottom-full mb-2 left-1/2 z-40 bg-white/95 border border-amber-200/50 p-3 rounded-2xl shadow-xl w-44 text-left pointer-events-none font-rounded text-[#8C5E43]"
                            >
                              <h5 className="font-rounded font-black text-xs text-[#8C5E43] leading-tight">
                                {node.title}
                              </h5>
                              <p className="text-[10px] text-zinc-500 font-bold mt-1 leading-snug">
                                {node.description || "Thử thách quyết đấu cùng Shiba."}
                              </p>
                              <div className="h-px bg-amber-200/30 my-2" />
                              <div className="flex justify-between items-center text-[9px] font-black">
                                <span className="text-zinc-400 uppercase tracking-wider">Thử thách:</span>
                                <span className="text-sky-600 capitalize">
                                  {node.type === "boss" ? "Đại Trùm" : node.type === "shop" ? "Cửa Hàng" : node.type === "fork" ? "Ngã Rẽ" : "Vệ Binh"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[9px] font-black mt-1">
                                <span className="text-zinc-400 uppercase tracking-wider">Phần thưởng:</span>
                                <span className="text-amber-600 flex items-center gap-0.5">
                                  {node.type === "boss" ? "100 / 50 EXP" : node.type === "shop" ? "Dược Phẩm" : node.type === "fork" ? "Mở Lối Đi" : "15 / 20 EXP"}
                                  {node.type !== "shop" && node.type !== "fork" && <Bone className="w-2.5 h-2.5 rotate-45" />}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Active Pulse Ring */}
                        {unlocked && node.id === shibaCurrentNodeId && (
                          <div className="absolute -inset-2 bg-amber-400/20 rounded-full animate-ping pointer-events-none" />
                        )}

                        {/* Node Button Orb (Frosted Candy style) */}
                        <motion.button
                          onClick={() => handleNodeClick(node.id)}
                          disabled={!unlocked || isLockedOutNode}
                          whileHover={unlocked && !isLockedOutNode ? { scale: 1.12 } : {}}
                          whileTap={unlocked && !isLockedOutNode ? { scale: 0.92 } : {}}
                          className={`w-16 h-16 rounded-full flex items-center justify-center border-2 shadow-md transition-all duration-300 relative cursor-pointer
                            ${completed
                              ? "bg-gradient-to-br from-[#A7F3D0]/50 to-[#6EE7B7]/50 border-white/80 shadow-[0_6px_16px_rgba(110,231,183,0.25)]"
                              : unlocked && !isLockedOutNode
                                ? node.type === "boss"
                                  ? "w-20 h-20 bg-gradient-to-br from-[#FECDD3]/50 to-[#FDA4AF]/50 border-white/90 shadow-[0_8px_20px_rgba(253,164,175,0.4)]"
                                  : node.type === "shop"
                                    ? "bg-gradient-to-br from-[#FEF08A]/50 to-[#FDE047]/50 border-white/80 shadow-[0_6px_16px_rgba(253,224,71,0.25)]"
                                    : "bg-gradient-to-br from-[#BAE6FD]/50 to-[#7DD3FC]/50 border-white/80 shadow-[0_6px_16px_rgba(125,211,252,0.25)]"
                                : "bg-zinc-200/30 border-zinc-300/30 opacity-40 shadow-none pointer-events-none"
                            }
                          `}
                        >
                          {/* Node Image */}
                          <img
                            src={unlocked && !isLockedOutNode ? node.img : "/images/ui/roadmap/node_vocab.png"}
                            alt={node.title}
                            className={`w-11 h-11 object-contain ${!unlocked || isLockedOutNode ? "grayscale opacity-25" : ""}`}
                          />

                          {/* Locked icon indicator */}
                          {(!unlocked || isLockedOutNode) && (
                            <div className="absolute inset-0 bg-zinc-200/40 rounded-full flex items-center justify-center">
                              <Lock className="w-4 h-4 text-zinc-400" />
                            </div>
                          )}
                        </motion.button>

                        {/* Title Label (Cozy Wood/Cream Style) */}
                        <span
                          className={`mt-2.5 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-xl shadow-sm whitespace-nowrap border font-rounded
                            ${completed
                              ? "bg-emerald-50/90 border-emerald-200/50 text-[#065F46]"
                              : unlocked && !isLockedOutNode
                                ? node.type === "boss"
                                  ? "bg-rose-50/90 border-rose-200/50 text-[#9F1239]"
                                  : node.type === "shop"
                                    ? "bg-[#FAF0D7]/90 border-amber-200/50 text-[#8C5E43]"
                                    : "bg-sky-50/90 border-sky-200/50 text-[#075985]"
                                : "bg-zinc-100/80 border-zinc-200/40 text-zinc-400"
                            }
                          `}
                        >
                          {node.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* RENDER DYNAMIC PLAYER MARKER */}
              {nodePositions[shibaCurrentNodeId] && (
                <motion.div
                  style={{
                    position: "absolute",
                    left: `${shibaPos.x}%`,
                    top: `${shibaPos.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  animate={isWalking ? { scale: [1, 1.1, 1], rotate: [-6, 6, -6] } : {}}
                  transition={isWalking ? { repeat: Infinity, duration: 0.45, ease: "linear" } : {}}
                  className="z-20 pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] flex flex-col items-center animate-bounce-slow"
                >
                  <img
                    src="/images/ui/roadmap/shiba_marker.png"
                    alt="Shiba Marker"
                    className="w-12 h-12 object-contain select-none pointer-events-none"
                  />
                  <div className="bg-[#FFD2B4] text-[#8C5E43] border border-[#FFA6C9] font-black text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-90 shadow-sm leading-none mt-0.5 select-none">
                    Shiba
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* 3. NODE DETAIL BOTTOM SHEET MODAL           */}
      {/* ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedNodeId !== null && selectedNode && (
          <div className="fixed inset-0 z-[350] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full max-w-md bg-gradient-to-br from-[#FAF5EF] to-[#FDFBF9] rounded-t-[2.5rem] sm:rounded-[2.5rem] border-4 border-[#FFA6C9]/40 shadow-[0_-8px_40px_rgba(139,92,26,0.15)] overflow-hidden text-zinc-700"
            >
              {/* Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-[#FFF0F2] to-[#FFF5F6] text-zinc-700 flex items-center justify-between border-b-2 border-dashed border-[#FFA6C9]/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border-2 border-[#FFA6C9]/30 shadow-sm">
                    <img src={selectedNode.img} alt={selectedNode.title} className="w-9 h-9 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#FF7096]" style={{ fontFamily: "var(--font-cherry)" }}>
                      {selectedNode.title}
                    </h3>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-rounded">
                      {selectedNode.type === "guardian" ? "Vệ binh giữ cửa ải" : "Đại trùm cuối hầm ngục"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="px-4 py-1.5 bg-white text-zinc-500 hover:text-zinc-700 rounded-full border border-zinc-200 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Đóng
                </button>
              </div>

              {/* Body */}
              <div className="p-6 text-left flex flex-col gap-4 font-rounded">
                <p className="text-sm font-bold text-zinc-600 leading-relaxed">
                  {selectedNode.description}
                </p>

                {selectedNode.type === "guardian" && (
                  <div className="bg-sky-500/10 border border-sky-500/20 p-3.5 rounded-2xl text-sky-700 text-xs font-bold leading-normal flex gap-2 items-center">
                    <Zap className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>Thử thách gồm các câu hỏi lấy ngẫu nhiên từ bài: <strong>{selectedNode.challenge.sourceDeckIds.join(", ")}</strong>. Thất bại bị mất 25 HP!</span>
                  </div>
                )}

                <div className="mt-2">
                  {/* Guardian Challenge (Real Minigame) */}
                  {selectedNode.type === "guardian" && (
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleStartChallenge(selectedNode)}
                        disabled={shibaSessionHP <= 0 || isLoadingChallenge}
                        className="w-full py-3.5 bg-gradient-to-r from-sky-400 to-[#5390D9] text-white font-black rounded-full shadow-lg hover:shadow-sky-400/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none text-sm"
                      >
                        {isLoadingChallenge ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Đang tải bài học...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 animate-spin-slow" />
                            Bắt Đầu Khiêu Chiến
                          </span>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Final Boss Fight */}
                  {selectedNode.type === "boss" && (
                    <div className="flex flex-col gap-3">
                      {shibaSessionHP <= 0 ? (
                        <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-2xl text-red-500 text-xs font-bold leading-normal flex gap-2 items-center justify-center">
                          Shiba đã kiệt sức! Cần quay lại trạm dừng chân mua máu.
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartBossBattle(selectedNode)}
                            disabled={isLoadingChallenge}
                            className="w-full py-3.5 bg-gradient-to-r from-[#FF7096] via-rose-400 to-orange-400 text-white font-black rounded-full shadow-lg hover:shadow-[#FF7096]/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 text-sm"
                          >
                            <Sparkles className="w-5 h-5" />
                            {isLoadingChallenge ? "Đang tải trận..." : "Quyết Chiến Boss Kitsune"}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════ */}
      {/* 4. MULTI-ITEM SHOP MODAL (Trạm dừng)        */}
      {/* ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {shopOpen && shopNode && (
          <div className="fixed inset-0 z-[350] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-gradient-to-br from-[#FAF5EF] to-[#FDFBF9] rounded-[2.5rem] border-4 border-[#FFA6C9]/40 shadow-2xl p-6 sm:p-8 text-zinc-700"
            >
              {/* Shop Header */}
              <div className="text-center pb-6 border-b-2 border-dashed border-[#FFA6C9]/20">
                <div className="w-20 h-20 bg-amber-500/10 border border-[#FFA6C9]/30 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <img src={shopNode.img} alt="Shop Keeper" className="w-16 h-16 object-contain animate-bounce-slow" />
                </div>
                <h3 className="text-xl font-black text-amber-600" style={{ fontFamily: "var(--font-cherry)" }}>
                  {shopNode.title}
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 font-rounded font-bold leading-snug">
                  Chào mừng nhà lữ hành! Đổi Xương để lấy vật phẩm hỗ trợ chiến đấu đắc lực.
                </p>
              </div>

              {/* Shop Items List */}
              <div className="py-6 flex flex-col gap-3">
                {shopNode.shopConfig.items.map((item: any) => {
                  const alreadyHasBuff = item.effect.type === "buff_atk" && shibaSessionBuffs.includes(item.id);
                  const isHPMax = item.effect.type === "heal" && shibaSessionHP >= 100;
                  const canBuy = coins >= item.cost && !alreadyHasBuff && !isHPMax;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-zinc-100 hover:border-amber-300 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3.5 text-left">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-zinc-100 overflow-hidden shrink-0 shadow-sm">
                          <img src={item.img} alt={item.name} className="w-9 h-9 object-contain" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-zinc-800" style={{ fontFamily: "var(--font-cherry)" }}>
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-zinc-500 font-rounded font-bold mt-0.5 leading-snug">{item.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuyItem(item)}
                        disabled={!canBuy}
                        className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer
                          ${canBuy
                            ? "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-md shadow-amber-500/10 hover:brightness-110"
                            : "bg-zinc-100 text-zinc-400 border border-transparent cursor-not-allowed"
                          }
                        `}
                      >
                        {alreadyHasBuff ? (
                          <span>Đã sở hữu</span>
                        ) : isHPMax ? (
                          <span>Đầy Máu</span>
                        ) : (
                          <>
                            <span>{item.cost}</span>
                            <Bone className="w-3.5 h-3.5 rotate-45" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Shop Footer */}
              <div className="flex gap-4">
                <div className="flex-1 flex items-center justify-center bg-white/40 border border-zinc-100 rounded-2xl px-4 py-3 font-rounded text-xs font-bold text-zinc-500">
                  Bạn có: <span className="text-amber-600 font-black text-sm ml-2 flex items-center gap-1">{coins} <Bone className="w-4 h-4 rotate-45" /></span>
                </div>
                <button
                  onClick={handleFinishShop}
                  className="flex-1 py-3.5 bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white font-black rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer text-sm flex items-center justify-center gap-1.5"
                >
                  <DoorOpen className="w-4 h-4" />
                  Xong & Đi Tiếp
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ═══════════════════════════════════════════ */}
      {/* 5. MINIGAME OVERLAYS (Phase 4)              */}
      {/* ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {activeChallengeType === "matching" && mockMinigameDeck && (
          <div className="fixed inset-0 z-[400] bg-black">
            <MatchingPairsGame
              cards={challengeCards}
              minigameDeck={mockMinigameDeck as any}
              onClose={handleChallengeClose}
              onWin={handleChallengeWin}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeChallengeType === "fill" && mockMinigameDeck && (
          <div className="fixed inset-0 z-[400] bg-black flex items-center justify-center">
            <FillBlanksGame
              quizList={challengeQuizList}
              minigameDeck={mockMinigameDeck}
              onClose={handleChallengeClose}
              onWin={handleChallengeWin}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════ */}
      {/* 6. TURN-BASED BOSS BATTLE ARENA OVERLAY (Phase 5) */}
      {/* ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {bossBattleActive && (
          <div className="fixed inset-0 z-[450] bg-black overflow-y-auto">
            <BossBattleScreen
              deckId={deckId}
              currentBossCard={currentBossCard}
              bossHp={bossHp}
              bossMaxHp={bossMaxHp}
              shibaHp={shibaHp}
              bossTimeLeft={bossTimeLeft}
              bossCardMaxTime={bossCardMaxTime}
              comboCount={comboCount}
              activeSkillEffect={activeSkillEffect}
              activeDamageText={activeDamageText}
              screenShake={screenShake}
              bossFlash={bossFlash}
              projectileFlying={projectileFlying}
              isHintRevealed={isHintRevealed}
              onSubmit={handleBossWordSubmit}
              usePhaoBoi={handleUsePhaoBoi}
              useKinhLup={handleUseKinhLup}
              onCancel={handleBossBattleLose}
              isTimerActive={isTimerActive}
              onStartBattle={() => setIsTimerActive(true)}
            />
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

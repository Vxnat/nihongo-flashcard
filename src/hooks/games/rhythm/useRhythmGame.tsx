"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Ham, Shield, Bone, Bug, Sparkles } from "lucide-react";
import { FlashcardData } from "@/types/flashcard";
import { selectAdaptiveCards } from "@/utils/wordSelector";
import { useAppStore } from "@/store/useAppStore";
import { playAudio, playAudioUrl } from "@/utils/tts";

export interface RhythmNote {
  id: string;
  char: React.ReactNode;
  lane: number; // 0, 1, 2, 3
  y: number; // 0% -> 100%
  isTarget: boolean;
  type: "normal" | "meat" | "shield" | "oni" | "coin";
  hit: boolean;
  missed: boolean;
}

interface UseRhythmGameProps {
  cards: FlashcardData[];
  rewards: { coins: number; exp: number };
  onWin: () => void;
  onClose: () => void;
}

export function useRhythmGame({
  cards,
  rewards,
  onWin,
  onClose,
}: UseRhythmGameProps) {
  const rawWordStats = useAppStore((state: any) => state.userStats?.wordStats);
  const rawAddCoins = useAppStore((state: any) => state.addCoins);
  const rawAddExp = useAppStore((state: any) => state.addExp);

  const wordStats = rawWordStats || {};
  const addCoins = rawAddCoins || ((n: number) => { });
  const addExp = rawAddExp || ((n: number) => { });

  // Game States
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hp, setHp] = useState(3);
  const [extraHearts, setExtraHearts] = useState(0);
  const [hasShield, setHasShield] = useState<number>(0);
  const [isFeverMode, setIsFeverMode] = useState(false);
  const [feverEnergy, setFeverEnergy] = useState(0);
  const [gameStatus, setGameStatus] = useState<"idle" | "playing" | "gameover" | "win">("idle");
  const [targetWord, setTargetWord] = useState<FlashcardData | null>(null);
  const [activeNotes, setActiveNotes] = useState<RhythmNote[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [blindActive, setBlindActive] = useState(false);
  const [hitFeedback, setHitFeedback] = useState<{
    lane: number;
    rating: "Perfect" | "Great" | "Good" | "Miss" | "";
  }[]>([
    { lane: 0, rating: "" },
    { lane: 1, rating: "" },
    { lane: 2, rating: "" },
    { lane: 3, rating: "" },
  ]);

  // Refs for loop management
  const gameStatusRef = useRef(gameStatus);
  const activeNotesRef = useRef<RhythmNote[]>([]);
  const targetWordRef = useRef<FlashcardData | null>(null);
  const hpRef = useRef(hp);
  const extraHeartsRef = useRef(extraHearts);
  const hasShieldRef = useRef(hasShield);
  const isFeverModeRef = useRef(isFeverMode);
  const feverEnergyRef = useRef(feverEnergy);
  const lastSpawnTimeRef = useRef<number>(0);
  const comboRef = useRef(combo);
  const earnedCoinsRef = useRef(earnedCoins);
  const blindTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync refs with states
  useEffect(() => { gameStatusRef.current = gameStatus; }, [gameStatus]);
  useEffect(() => { activeNotesRef.current = activeNotes; }, [activeNotes]);
  useEffect(() => { targetWordRef.current = targetWord; }, [targetWord]);
  useEffect(() => { hpRef.current = hp; }, [hp]);
  useEffect(() => { extraHeartsRef.current = extraHearts; }, [extraHearts]);
  useEffect(() => { hasShieldRef.current = hasShield; }, [hasShield]);
  useEffect(() => { isFeverModeRef.current = isFeverMode; }, [isFeverMode]);
  useEffect(() => { feverEnergyRef.current = feverEnergy; }, [feverEnergy]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { earnedCoinsRef.current = earnedCoins; }, [earnedCoins]);

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      if (blindTimeoutRef.current) clearTimeout(blindTimeoutRef.current);
    };
  }, []);

  // Web Audio Synth for Melody Output (0ms Latency)
  const playSynthNote = (lane: number) => {
    if (typeof window === "undefined" || isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Frequencies for lanes: C4 (Do), E4 (Mi), G4 (Sol), C5 (Do octave)
      const freqs = [261.63, 329.63, 392.00, 523.25];
      osc.frequency.value = freqs[lane] || 261.63;
      osc.type = "sine";

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn("Failed to play synth note:", e);
    }
  };

  // Adaptive Word selection
  const gameWordsRef = useRef<FlashcardData[]>([]);
  const completedWordsCountRef = useRef(0);
  const TOTAL_WORDS_TO_WIN = cards.length || 15;

  const initGame = useCallback(() => {
    const selected = selectAdaptiveCards(cards, wordStats, TOTAL_WORDS_TO_WIN);
    gameWordsRef.current = selected;
    completedWordsCountRef.current = 0;
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHp(3);
    setExtraHearts(0);
    setHasShield(0);
    setIsFeverMode(false);
    setFeverEnergy(0);
    setEarnedCoins(0);
    setBlindActive(false);
    setActiveNotes([]);
    setTargetWord(selected[0] || null);
    setGameStatus("playing");

    if (selected[0]) {
      setTimeout(() => {
        playAudio(selected[0].word, "ja-JP", () => {
          spawnNoteRef.current();
        });
      }, 500);
    }
  }, [cards, wordStats]);

  const selectNextTarget = useCallback(() => {
    completedWordsCountRef.current += 1;
    if (completedWordsCountRef.current >= gameWordsRef.current.length) {
      setGameStatus("win");
      addCoins(rewards.coins + earnedCoinsRef.current);
      addExp(rewards.exp);
      playAudioUrl("/sounds/success.mp3");
      return;
    }

    const nextWord = gameWordsRef.current[completedWordsCountRef.current];
    setTargetWord(nextWord);
    playAudio(nextWord.word, "ja-JP", () => {
      spawnNoteRef.current();
    });
  }, [addCoins, addExp, rewards]);

  const triggerFeedback = (lane: number, rating: "Perfect" | "Great" | "Good" | "Miss") => {
    setHitFeedback((prev) =>
      prev.map((fb, idx) => (idx === lane ? { lane, rating } : fb))
    );
    setTimeout(() => {
      setHitFeedback((prev) =>
        prev.map((fb, idx) => (idx === lane ? { lane, rating: "" } : fb))
      );
    }, 500);
  };

  const handleMissAction = useCallback((lane: number) => {
    triggerFeedback(lane, "Miss");
    playAudioUrl("/sounds/wrong.mp3");
    setCombo(0);
    setFeverEnergy((prev) => Math.max(0, prev - 8));

    if (hasShieldRef.current > 0) {
      setHasShield((prev) => Math.max(0, prev - 1));
    } else {
      if (extraHeartsRef.current > 0) {
        setExtraHearts((prev) => prev - 1);
      } else {
        setHp((prev) => {
          const nextHp = prev - 1;
          if (nextHp <= 0) {
            setGameStatus("gameover");
            playAudioUrl("/sounds/fail.mp3");
          }
          return nextHp;
        });
      }
    }
  }, []);

  // Wave Spawning: Sinh nốt theo đợt 4 làn
  const spawnNote = useCallback(() => {
    if (!targetWordRef.current) return;

    const newNotes: RhythmNote[] = [];
    const timestampId = Math.random().toString(36).substr(2, 5);

    // 1. FEVER MODE SPAWN: Toàn bộ nốt là sao vàng gõ tự do
    if (isFeverModeRef.current) {
      const activeLanesCount = Math.floor(Math.random() * 2) + 1; // 1 hoặc 2 làn ngẫu nhiên
      const chosenLanes: number[] = [];
      while (chosenLanes.length < activeLanesCount) {
        const l = Math.floor(Math.random() * 4);
        if (!chosenLanes.includes(l)) chosenLanes.push(l);
      }

      chosenLanes.forEach((l) => {
        newNotes.push({
          id: `fever-${timestampId}-${l}`,
          char: <Sparkles size={20} className="text-[#FF9F1C] fill-[#FF9F1C]" />,
          lane: l,
          y: 0,
          isTarget: true,
          type: "normal",
          hit: false,
          missed: false,
        });
      });

      setActiveNotes((prev) => [...prev, ...newNotes]);
      return;
    }

    // 2. NORMAL MODE SPAWN: Đợt nốt gồm 4 nốt (1 nốt đúng, 3 nốt nhiễu/Oni)
    const targetChar = targetWordRef.current.word.charAt(0);
    const correctLane = Math.floor(Math.random() * 4);

    // Danh sách chữ Hiragana nhiễu
    const dummiesList = ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ"];

    // 15% cơ hội sinh thêm nốt vật phẩm đặc biệt nếu combo >= 5
    const canSpawnItem = comboRef.current >= 5 && Math.random() < 0.15;
    const itemLane = canSpawnItem ? (correctLane + 1) % 4 : -1;
    let itemType: RhythmNote["type"] = "normal";
    let itemChar: React.ReactNode = "";

    if (canSpawnItem) {
      const specRand = Math.random();
      if (specRand < 0.4) {
        itemType = "meat";
        itemChar = <Ham size={20} className="fill-[#FF7096] text-[#FF7096]" />;
      } else if (specRand < 0.7) {
        itemType = "shield";
        itemChar = <Shield size={20} className="fill-[#06D6A0] text-[#05B889]" />;
      } else {
        itemType = "coin";
        itemChar = <Bone size={20} className="text-[#FF9F1C] fill-[#FF9F1C]/20 rotate-45" />;
      }
    }

    // Cơ hội xuất hiện nốt mặt quỷ Oni nhiễu (20% cơ hội)
    const hasOni = Math.random() < 0.2;
    const oniLane = hasOni ? (correctLane + 2) % 4 : -1;

    for (let l = 0; l < 4; l++) {
      if (l === correctLane) {
        // Nốt mục tiêu chính xác
        newNotes.push({
          id: `correct-${timestampId}-${l}`,
          char: targetChar,
          lane: l,
          y: 0,
          isTarget: true,
          type: "normal",
          hit: false,
          missed: false,
        });
      } else if (l === itemLane && canSpawnItem) {
        // Nốt vật phẩm thưởng
        newNotes.push({
          id: `item-${timestampId}-${l}`,
          char: itemChar,
          lane: l,
          y: 0,
          isTarget: false,
          type: itemType,
          hit: false,
          missed: false,
        });
      } else if (l === oniLane && hasOni) {
        // Nốt cản trở
        newNotes.push({
          id: `oni-${timestampId}-${l}`,
          char: <Bug size={20} className="text-amber-800" />,
          lane: l,
          y: 0,
          isTarget: false,
          type: "oni",
          hit: false,
          missed: false,
        });
      } else {
        // Nốt chữ nhiễu (Dummy)
        const randomDummy = dummiesList[Math.floor(Math.random() * dummiesList.length)];
        newNotes.push({
          id: `dummy-${timestampId}-${l}`,
          char: randomDummy,
          lane: l,
          y: 0,
          isTarget: false,
          type: "normal",
          hit: false,
          missed: false,
        });
      }
    }

    setActiveNotes((prev) => [...prev, ...newNotes]);
  }, []);

  const selectNextTargetRef = useRef(selectNextTarget);
  const spawnNoteRef = useRef(spawnNote);
  const handleMissActionRef = useRef(handleMissAction);

  useEffect(() => { selectNextTargetRef.current = selectNextTarget; }, [selectNextTarget]);
  useEffect(() => { spawnNoteRef.current = spawnNote; }, [spawnNote]);
  useEffect(() => { handleMissActionRef.current = handleMissAction; }, [handleMissAction]);

  // Main Game Loop using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      if (gameStatusRef.current !== "playing") return;

      const deltaTime = time - lastTime;
      lastTime = time;

      // Move active notes down
      const speedMultiplier = 1 + Math.min(0.5, comboRef.current * 0.01);
      const dy = 0.048 * deltaTime * speedMultiplier; // Speed calculation

      setActiveNotes((prev) => {
        const nextNotes = prev.map((note) => {
          if (note.hit) return note;
          const nextY = note.y + dy;

          // Handle Miss (Nốt nhạc chạm vạch gai đỏ ở Y = 90% mà chưa được gõ)
          if (nextY > 90 && !note.hit && !note.missed) {
            note.missed = true;
            if (note.isTarget && !isFeverModeRef.current) {
              // Missed target note
              handleMissActionRef.current(note.lane);

              // Instantly pick next target word so the game flow continues
              setTimeout(() => {
                selectNextTargetRef.current();
              }, 50);
            }
          }
          return { ...note, y: nextY };
        });

        return nextNotes.filter((n) => n.y < 105);
      });

      // Spawning Logic (Chỉ tự động spawn nốt trong Fever Mode)
      if (isFeverModeRef.current) {
        const currentSpawnInterval = Math.max(1300, 2200 - comboRef.current * 25);
        if (time - lastSpawnTimeRef.current > currentSpawnInterval) {
          spawnNoteRef.current();
          lastSpawnTimeRef.current = time;
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    if (gameStatus === "playing") {
      lastSpawnTimeRef.current = performance.now();
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameStatus]);

  // Handle Tap Lane action
  const handleTapLane = useCallback(
    (lane: number) => {
      if (gameStatusRef.current !== "playing") return;

      // Find the lowest untapped note in this lane
      const notesInLane = activeNotesRef.current.filter(
        (n) => n.lane === lane && !n.hit && n.y > 0
      );

      // Helper to handle wrong tap: punish and advance target
      const handleWrongTap = () => {
        handleMissActionRef.current(lane);
        if (!isFeverModeRef.current) {
          // Mark all current notes as missed so they don't trigger Miss again on spiked line
          setActiveNotes((prev) =>
            prev.map((n) => (!n.hit ? { ...n, missed: true } : n))
          );
          setTimeout(() => {
            selectNextTargetRef.current();
          }, 50);
        }
      };

      // RULE 1: Empty Tap - Bấm làn trống -> Phạt Miss
      if (notesInLane.length === 0) {
        handleWrongTap();
        return;
      }

      // Sort by Y desc (closest to Hit Line)
      notesInLane.sort((a, b) => b.y - a.y);
      const targetNote = notesInLane[0];

      // Tap hit window (30% to 90%) - Tiêu hủy trước khi chạm vạch gai đỏ ở 90%
      const isWithinHitWindow = targetNote.y >= 30 && targetNote.y <= 90;

      // RULE 2: Gõ khi nốt nằm ngoài Hit Window (quá sớm hoặc chạm gai) -> Phạt Miss
      if (!isWithinHitWindow) {
        handleWrongTap();
        return;
      }

      // Hit is successful!
      const yDist = targetNote.y;
      const rating: "Perfect" | "Great" | "Good" =
        yDist >= 30 && yDist < 60
          ? "Perfect"
          : yDist >= 60 && yDist < 78
            ? "Great"
            : "Good";

      // Mark note as hit
      setActiveNotes((prev) =>
        prev.map((n) => (n.id === targetNote.id ? { ...n, hit: true } : n))
      );

      triggerFeedback(lane, rating);
      playSynthNote(lane);

      // Process hit logic based on note details
      if (targetNote.isTarget || isFeverModeRef.current) {
        // Gõ trúng nốt mục tiêu (hoặc nốt vàng trong Fever Mode)
        const basePoints =
          rating === "Perfect"
            ? 100
            : rating === "Great"
              ? 60
              : 30;
        const pointsEarned = basePoints * (isFeverModeRef.current ? 2 : 1);
        setScore((s) => s + pointsEarned);

        setCombo((c) => {
          const nextCombo = c + 1;
          setMaxCombo((mc) => Math.max(mc, nextCombo));

          // Kích hoạt Fever Mode tại mốc 10 combo
          if (nextCombo > 0 && nextCombo % 10 === 0 && !isFeverModeRef.current) {
            setIsFeverMode(true);
            playAudioUrl("/sounds/coin.mp3");
            setTimeout(() => {
              setIsFeverMode(false);
            }, 5000); // Fever mode kéo dài 5 giây
          }
          return nextCombo;
        });

        setFeverEnergy((prev) =>
          Math.min(
            100,
            prev + (rating === "Perfect" ? 8 : rating === "Great" ? 5 : 2)
          )
        );

        // Target hit -> Đổi từ mục tiêu tiếp theo
        if (!isFeverModeRef.current) {
          selectNextTargetRef.current();
        }
      } else if (targetNote.type !== "normal") {
        // Gõ trúng nốt đặc biệt
        if (targetNote.type === "meat") {
          playAudioUrl("/sounds/brush.mp3");
          if (hpRef.current < 3) {
            setHp((prev) => prev + 1);
          } else {
            setExtraHearts((prev) => Math.min(2, prev + 1));
          }
        } else if (targetNote.type === "shield") {
          playAudioUrl("/sounds/splash.mp3");
          setHasShield((prev) => Math.min(5, prev + 1)); // Mỗi lần gõ trúng nốt khiên chỉ được cộng thêm 1 khiên, tối đa 5
        } else if (targetNote.type === "coin") {
          playAudioUrl("/sounds/coin.mp3");
          setEarnedCoins((prev) => prev + 2);
        } else if (targetNote.type === "oni") {
          // Bẫy
          playAudioUrl("/sounds/bonk.mp3");
          setBlindActive(true);
          if (blindTimeoutRef.current) clearTimeout(blindTimeoutRef.current);
          blindTimeoutRef.current = setTimeout(() => setBlindActive(false), 2000);

          if (hasShieldRef.current > 0) {
            setHasShield((prev) => Math.max(0, prev - 1));
          } else {
            if (extraHeartsRef.current > 0) {
              setExtraHearts((prev) => prev - 1);
            } else {
              setHp((prev) => {
                const nextHp = prev - 1;
                if (nextHp <= 0) {
                  setGameStatus("gameover");
                  playAudioUrl("/sounds/fail.mp3");
                }
                return nextHp;
              });
            }
          }
          setCombo(0);

          if (!isFeverModeRef.current) {
            // Đánh dấu tất cả các nốt hiện tại là missed để tránh phạt lần hai
            setActiveNotes((prev) =>
              prev.map((n) => (!n.hit ? { ...n, missed: true } : n))
            );
            setTimeout(() => {
              selectNextTargetRef.current();
            }, 50);
          }
        }
      } else {
        // Gõ nhầm làn chữ nhiễu (Dummy) -> Phạt Miss
        handleWrongTap();
      }
    },
    [activeNotes, isMuted]
  );

  return {
    score,
    combo,
    maxCombo,
    hp,
    extraHearts,
    hasShield,
    isFeverMode,
    feverEnergy,
    gameStatus,
    targetWord,
    activeNotes,
    hitFeedback,
    isMuted,
    earnedCoins,
    blindActive,
    totalWordsCount: gameWordsRef.current.length,
    currentWordIndex: completedWordsCountRef.current,
    setIsMuted,
    initGame,
    handleTapLane,
    setGameStatus,
  };
}

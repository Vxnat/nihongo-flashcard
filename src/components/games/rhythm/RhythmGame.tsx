"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FlashcardData } from "@/types/flashcard";
import { SystemDeck } from "@/types/flashcard";
import { useRhythmGame } from "@/hooks/games/rhythm/useRhythmGame";
import { RhythmTutorialOverlay } from "./RhythmTutorialOverlay";
import { RhythmIdleScreen } from "./RhythmIdleScreen";
import { RhythmPlayScreen } from "./RhythmPlayScreen";
import { RhythmResultScreen } from "./RhythmResultScreen";

interface RhythmGameProps {
  cards: FlashcardData[];
  minigameDeck: SystemDeck;
  onWin: () => void;
  onClose: () => void;
}

export function RhythmGame({
  cards,
  minigameDeck,
  onWin,
  onClose,
}: RhythmGameProps) {
  const rewards = minigameDeck.rewards || { coins: 20, exp: 50 };
  const {
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
    totalWordsCount,
    currentWordIndex,
    setIsMuted,
    initGame,
    handleTapLane,
  } = useRhythmGame({
    cards,
    rewards,
    onWin,
    onClose,
  });

  const [showTutorial, setShowTutorial] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [activeLanes, setActiveLanes] = useState<boolean[]>([false, false, false, false]);

  // Check tutorial on mount
  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenRhythmTutorial");
    if (!hasSeen) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem("hasSeenRhythmTutorial", "true");
    setShowTutorial(false);
    if (gameStatus === "idle") {
      initGame();
    }
  };

  // Keyboard controls listener (A, S, D, F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== "playing") return;
      const key = e.key.toLowerCase();
      let lane = -1;
      if (key === "a") lane = 0;
      else if (key === "s") lane = 1;
      else if (key === "d") lane = 2;
      else if (key === "f") lane = 3;

      if (lane !== -1) {
        handleTapLane(lane);
        setActiveLanes((prev) => {
          const next = [...prev];
          next[lane] = true;
          return next;
        });
        setTimeout(() => {
          setActiveLanes((prev) => {
            const next = [...prev];
            next[lane] = false;
            return next;
          });
        }, 150);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStatus, handleTapLane]);

  // Audio BGM loop management
  useEffect(() => {
    if (gameStatus === "playing") {
      bgmRef.current = new Audio("/sounds/rhythm_bgm.mp3");
      bgmRef.current.loop = true;
      bgmRef.current.volume = isMuted ? 0 : 0.25;
      bgmRef.current.play().catch((err) => {
        if (bgmRef.current) {
          bgmRef.current.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";
          bgmRef.current.play().catch((e) => console.warn("Failed to play backup BGM:", e));
        }
      });
    } else {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    }

    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, [gameStatus]);

  // Sync mute state to audio element
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = isMuted ? 0 : 0.25;
    }
  }, [isMuted]);

  return (
    <div className="w-full max-w-lg mx-auto h-[95vh] min-h-[600px] bg-gradient-to-b from-[#FFF8F0] via-[#FFE8D6] to-[#FFDAB9] rounded-[3rem] border-4 border-[#FFE2D1] shadow-[0_12px_40px_rgba(255,159,28,0.15)] overflow-hidden relative flex flex-col justify-between p-4 select-none">
      
      {/* CSS Styles injection for Spotlights & Club visual effects */}
      <style jsx global>{`
        @keyframes sweep-left {
          0% { transform: rotate(-35deg); }
          50% { transform: rotate(15deg); }
          100% { transform: rotate(-35deg); }
        }
        @keyframes sweep-right {
          0% { transform: rotate(35deg); }
          50% { transform: rotate(-15deg); }
          100% { transform: rotate(35deg); }
        }
        .spotlight-left {
          position: absolute;
          top: -20px;
          left: -20px;
          width: 150px;
          height: 500px;
          background: radial-gradient(circle, rgba(255,112,150,0.12) 0%, rgba(255,112,150,0) 80%);
          clip-path: polygon(0 0, 100% 0, 60% 100%, 40% 100%);
          transform-origin: top left;
          animation: sweep-left 4s ease-in-out infinite;
          pointer-events: none;
          z-index: 5;
        }
        .spotlight-right {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 150px;
          height: 500px;
          background: radial-gradient(circle, rgba(255,209,102,0.12) 0%, rgba(255,209,102,0) 80%);
          clip-path: polygon(0 0, 100% 0, 60% 100%, 40% 100%);
          transform-origin: top right;
          animation: sweep-right 4s ease-in-out infinite;
          pointer-events: none;
          z-index: 5;
        }
      `}</style>

      {/* 1. MÀN HÌNH CHỜ (IDLE SCREEN) */}
      {gameStatus === "idle" && (
        <RhythmIdleScreen
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          setShowTutorial={setShowTutorial}
          initGame={initGame}
          onClose={onClose}
        />
      )}

      {/* 2. MÀN HÌNH ĐANG CHƠI (PLAYING MODE) */}
      {gameStatus === "playing" && (
        <RhythmPlayScreen
          onClose={onClose}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          targetWord={targetWord}
          score={score}
          isFeverMode={isFeverMode}
          hasShield={hasShield}
          hp={hp}
          extraHearts={extraHearts}
          feverEnergy={feverEnergy}
          blindActive={blindActive}
          activeLanes={activeLanes}
          setActiveLanes={setActiveLanes}
          handleTapLane={handleTapLane}
          hitFeedback={hitFeedback}
          activeNotes={activeNotes}
          currentWordIndex={currentWordIndex}
          totalWordsCount={totalWordsCount}
          combo={combo}
        />
      )}

      {/* 3. MÀN HÌNH THẮNG/THUA (GAME OVER & WIN SCREEN) */}
      {(gameStatus === "gameover" || gameStatus === "win") && (
        <RhythmResultScreen
          gameStatus={gameStatus}
          score={score}
          maxCombo={maxCombo}
          rewards={rewards}
          earnedCoins={earnedCoins}
          initGame={initGame}
          onWin={onWin}
          onClose={onClose}
        />
      )}

      {/* 4. MODAL HƯỚNG DẪN CHƠI LẦN ĐẦU (TUTORIAL MODAL) */}
      <AnimatePresence>
        {showTutorial && (
          <RhythmTutorialOverlay onClose={handleCloseTutorial} />
        )}
      </AnimatePresence>
    </div>
  );
}

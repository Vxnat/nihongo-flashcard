"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Search, LifeBuoy, X, Heart } from "lucide-react";

import { FlashcardData } from "@/types/flashcard";
import { parseFurigana } from "@/utils/textParser";
import { TimerBar } from "@/components/games/shared/TimerBar";
import { GameResultModal } from "@/components/games/shared/GameResultModal";
import { ShibaMasterDialog, ShibaMasterOption } from "@/components/games/shared/ShibaMasterDialog";
import { SystemDeck } from "@/types/flashcard";
import { useMatchingPairsGame, TIME_BONUS_PER_5_SECONDS, PHAO_DURATION_SECONDS, KINH_LUP_DURATION_SECONDS } from "@/hooks/games/matching-pairs/useMatchingPairsGame";
import { useLearningTimer } from "@/hooks/common/useLearningTimer";

interface MatchingPairsGameProps {
  cards: FlashcardData[];
  minigameDeck: SystemDeck;
  onClose: () => void;
  onWin: () => void;
}

export function MatchingPairsGame({
  cards,
  minigameDeck,
  onClose,
  onWin,
}: MatchingPairsGameProps) {
  const {
    gameLevel,
    baseRewardCoins,
    boardItems,
    selectedItems,
    wrongMatch,
    hp,
    maxHp,
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
  } = useMatchingPairsGame({ cards, minigameDeck, onWin });

  useLearningTimer({ isActive: minigameStatus === "playing" });

  const [isMasterOpen, setIsMasterOpen] = React.useState(false);

  const masterOptions: ShibaMasterOption[] = [
    {
      id: "phao",
      icon: <LifeBuoy className="w-5 h-5" />,
      label: "Dùng Phao Bơi",
      cost: 2,
      allowFreeHint: true,
      colorClass: "bg-[#E0F7FA] text-[#00ACC1] border-[#80DEEA] hover:bg-[#B2EBF2]",
      onConfirm: () => activatePhao(),
    },
    {
      id: "kinhlup",
      icon: <Search className="w-5 h-5" />,
      label: "Dùng Kính Lúp",
      cost: 1,
      colorClass: "bg-[#FFF0F3] text-[#C7486B] border-[#FF7096] hover:bg-[#FFE0E6]",
      onConfirm: () => activateKinhLupMode(),
    },
  ];

  const showFuriganaByDefault = gameLevel === "N5";

  if (minigameStatus === "win" || minigameStatus === "lose") {
    const timeBonus =
      minigameStatus === "win" && isFirstClearRef.current
        ? Math.floor(timeLeft / 5) * TIME_BONUS_PER_5_SECONDS
        : 0;
    const rewardCoins =
      minigameStatus === "win" && isFirstClearRef.current ? baseRewardCoins : 0;

    return (
      <GameResultModal
        status={minigameStatus}
        reason={
          minigameStatus === "lose"
            ? hp <= 0
              ? "Hết máu rồi!"
              : "Hết giờ!"
            : undefined
        }
        rewardCoins={rewardCoins}
        timeBonus={timeBonus}
        onRestart={handleRestartGame}
        onClose={minigameStatus === "win" ? handleGameWin : onClose}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-br from-[#FDFBF7] to-[#FFF8E1] relative overflow-hidden">
      {/* Top Bar: Timer & HP */}
      <div className="w-full flex items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-6">
        <TimerBar timeLeft={timeLeft} progressPercent={progressPercent} />
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex gap-1.5 bg-white/90 border-2 border-[#FFE2D1] px-3 py-1.5 rounded-[1rem] shadow-[0_3px_0_0_#FFD6C0]">
            {[...Array(maxHp)].map((_, i) => (
              <motion.div
                key={i}
                animate={i < hp ? { scale: [1, 1.15, 1] } : { scale: 0.7 }}
                transition={{ repeat: i < hp ? Infinity : 0, duration: 2, repeatType: "reverse" }}
              >
                <Heart
                  size={18}
                  className={i < hp ? "text-[#FF7096] fill-[#FF7096]" : "text-zinc-300"}
                />
              </motion.div>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 shadow-sm transition-colors border-2 border-zinc-200 shrink-0"
            aria-label="Đóng minigame"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 overflow-y-auto hide-scrollbar flex items-center justify-center w-full max-w-2xl mx-auto py-2">
        <motion.div
          layout
          className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 w-full px-1"
        >
          <AnimatePresence>
            {boardItems.map((item) => {
              if (item.isMatched) return null; // Matched cards unmount

              const isSelected = selectedItems.some((i) => i.id === item.id);
              const isWrong = wrongMatch.includes(item.id);
              const isRevealed =
                (item.type === "jp" && showFuriganaByDefault) || // N5 always shows furigana
                (item.type === "jp" && isPhaoActive) || // Phao Bơi reveals all JP
                (item.type === "jp" && revealedCardId === item.id); // Kính Lúp reveals specific JP

              const showHalo =
                (item.type === "jp" && isPhaoActive) ||
                (item.type === "jp" && revealedCardId === item.id);

              return (
                <motion.button
                  layout // Important for cards to reflow when others disappear
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: isWrong ? [-8, 8, -8, 8, 0] : 0, // Shake effect on wrong match
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    duration: 0.3,
                    x: { duration: 0.4 }, // Shake duration
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCardClick(item)}
                  key={item.id}
                  data-card-id={item.id} // For confetti target
                  disabled={
                    !isRunning ||
                    selectedItems.length >= 2 ||
                    (isKinhLupActive && item.type === "vi")
                  } // Disable VI cards in Kính Lúp mode
                  className={`relative aspect-square sm:aspect-auto sm:h-28 rounded-xl sm:rounded-2xl p-1.5 min-[400px]:p-2 sm:p-4 flex flex-col items-center justify-center text-center shadow-sm border-b-4 transition-colors outline-none
                    ${isSelected && !isWrong
                      ? "bg-[#E0F7FA] border-[#80DEEA] border-b-[#80DEEA] shadow-[0_0_15px_rgba(128,222,234,0.5)]"
                      : isWrong
                        ? "bg-[#FFF0F3] border-[#FF7096] border-b-[#FF7096]"
                        : "bg-white border-[#FFE2D1] border-b-[#FFD166] hover:bg-orange-50"
                    }
                    ${isKinhLupActive && item.type === "jp"
                      ? "cursor-crosshair"
                      : "cursor-pointer"
                    }
                    ${!isRunning || selectedItems.length >= 2 || (isKinhLupActive && item.type === "vi") ? "opacity-70" : ""}
                  `}
                >
                  {showHalo && (
                    <motion.div
                      className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-300/50 to-orange-400/50 blur-md opacity-70 z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.7 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  )}
                  <span
                    className={`relative z-10 font-bold drop-shadow-sm line-clamp-3 sm:line-clamp-4 leading-tight ${item.type === "jp"
                        ? "text-lg min-[400px]:text-xl sm:text-3xl text-[#FF9F1C]"
                        : "text-[11px] min-[400px]:text-xs sm:text-sm text-[#5390D9]"
                      }`}
                    style={{
                      fontFamily:
                        item.type === "jp"
                          ? "var(--font-cherry)"
                          : "var(--font-rounded)",
                    }}
                  >
                    {item.type === "jp"
                      ? parseFurigana(item.text, isRevealed)
                      : item.text}
                  </span>
                  {item.type === "jp" && revealedCardId === item.id && (
                    <motion.div
                      className="absolute bottom-1 right-1 w-6 sm:w-8 h-1 bg-teal-400 rounded-full"
                      initial={{ scaleX: 1 }}
                      animate={{ scaleX: 0 }}
                      transition={{ duration: KINH_LUP_DURATION_SECONDS, ease: "linear" }}
                      style={{ originX: 0 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Bar: Shop / Active Buffs */}
      <div className="w-full flex justify-center mt-4 sm:mt-6 pb-2 h-14">
        {isPhaoActive && (
          <div className="flex-1 max-w-[220px] h-full bg-[#E0F7FA] border-4 border-[#80DEEA] rounded-2xl flex items-center justify-center relative shadow-sm">
            <div className="relative w-8 h-8 mr-2 flex items-center justify-center shrink-0 z-10">
              <svg viewBox="0 0 32 32" className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#00ACC1]/20" />
                <motion.circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-[#00ACC1]"
                  strokeLinecap="round"
                  initial={{ pathLength: 1 }}
                  animate={{ pathLength: 0 }}
                  transition={{ duration: PHAO_DURATION_SECONDS, ease: "linear" }}
                />
              </svg>
              <LifeBuoy className="w-4 h-4 text-[#00ACC1] animate-pulse" />
            </div>
            <span className="font-bold text-[#00ACC1] relative z-10 font-rounded">Phao Bơi (Đang bật)</span>
          </div>
        )}

        {isKinhLupActive && (
          <button
            onClick={() => setIsKinhLupActive(false)}
            className="flex-1 max-w-[220px] h-full bg-[#FFF0F3] border-4 border-[#FF7096] rounded-2xl flex items-center justify-center shadow-[0_4px_0_0_#FF7096] active:translate-y-1 active:shadow-none transition-all text-[#C7486B]"
          >
            <Search className="w-5 h-5 mr-2 animate-pulse" />
            <span className="font-bold font-rounded">Đang soi... (Hủy)</span>
          </button>
        )}

        {!isPhaoActive && !isKinhLupActive && (
          <button
            disabled={!isRunning}
            onClick={() => setIsMasterOpen(true)}
            className="w-full max-w-[220px] h-full bg-[#5390D9] hover:bg-[#4a81c3] disabled:bg-zinc-300 disabled:border-zinc-400 disabled:shadow-none disabled:active:translate-y-0 text-white rounded-2xl border-b-4 border-[#305f94] active:border-b-0 active:translate-y-1 font-bold text-lg transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span style={{ fontFamily: "var(--font-cherry)" }}>Hỏi Sư Phụ</span>
          </button>
        )}
      </div>

      <ShibaMasterDialog
        isOpen={isMasterOpen}
        onClose={() => setIsMasterOpen(false)}
        options={masterOptions}
        message="Bí từ quá à đồ đệ? Đưa Xương đây ta quăng phao cho!"
      />
    </div>
  );
}

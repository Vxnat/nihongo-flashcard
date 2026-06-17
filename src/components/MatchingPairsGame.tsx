"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bone, Search, LifeBuoy, X } from "lucide-react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

import { useAppStore } from "@/store/useAppStore";
import { FlashcardData } from "@/types/flashcard";
import { parseFurigana } from "@/utils/textParser";
import { useMinigameTimer } from "@/hooks/useMinigameTimer";
import { TimerBar } from "@/components/TimerBar";
import { GameResultModal } from "@/components/GameResultModal";
import { HintButton } from "@/components/HintButton";
import { ConfirmationPopover } from "@/components/ConfirmationPopover";
import { SystemDeck } from "@/hooks/useSystemRoadmap"; // To get minigameDeck type

// --- Interfaces ---
interface BoardItem {
  id: string; // Unique ID for this board item (e.g., "jp-word_id" or "vi-word_id")
  flashcardId: string; // ID of the original flashcard
  type: "jp" | "vi"; // Type of the card (Japanese or Vietnamese)
  text: string; // Display text (can be combined Kanji+Furigana string)
  isMatched: boolean;
}

interface MatchingPairsGameProps {
  cards: FlashcardData[]; // List of flashcards to use
  minigameDeck: SystemDeck; // The minigame deck data from system_decks.json
  onClose: () => void;
  onWin: () => void; // Called when game is won
}

// --- Constants ---
const MAX_HP = 3;
const PHAO_DURATION_SECONDS = 5;
const KINH_LUP_DURATION_SECONDS = 2;
const BASE_TIME_N5 = 90; // seconds
const BASE_TIME_N4_BELOW = 60; // seconds
const TIME_BONUS_PER_5_SECONDS = 1; // 1 Bone for every 5 seconds remaining

export function MatchingPairsGame({
  cards,
  minigameDeck,
  onClose,
  onWin,
}: MatchingPairsGameProps) {
  const { level: gameLevel, rewardCoins: baseRewardCoins } = minigameDeck;

  const addCoins = useAppStore((state) => state.addCoins);
  const deductCoins = useAppStore((state) => state.deductCoins);
  const useFreeMinigameHint = useAppStore((state) => state.useFreeMinigameHint);
  const freeMinigameHints = useAppStore((state) => state.userStats.freeMinigameHints);
  const progress = useAppStore((state) => state.progress);
  const isFirstClearRef = useRef<boolean>(false);

  // --- Game State ---
  const [boardItems, setBoardItems] = useState<BoardItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<BoardItem[]>([]);
  const [wrongMatch, setWrongMatch] = useState<string[]>([]); // IDs of cards that were part of a wrong match
  const [hp, setHp] = useState(MAX_HP);
  const [minigameStatus, setMinigameStatus] = useState<"playing" | "win" | "lose">(
    "playing",
  );

  // --- Hint System State ---
  const [isPhaoActive, setIsPhaoActive] = useState(false);
  const [phaoCountdownPercent, setPhaoCountdownPercent] = useState<number | undefined>(
    undefined,
  );
  const [isKinhLupActive, setIsKinhLupActive] = useState(false); // Magnifier mode active
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null); // Card currently revealed by Magnifier
  const [revealedCardCountdownPercent, setRevealedCardCountdownPercent] = useState<
    number | undefined
  >(undefined);
  const [showPhaoConfirm, setShowPhaoConfirm] = useState(false);
  const [showKinhLupConfirm, setShowKinhLupConfirm] = useState(false);
  const [currentKinhLupTargetId, setCurrentKinhLupTargetId] = useState<string | null>(
    null,
  );

  // --- Timer Hook ---
  const initialDuration = gameLevel === "N5" ? BASE_TIME_N5 : BASE_TIME_N4_BELOW;
  const { timeLeft, isRunning, startTimer, pauseTimer, resetTimer, progressPercent } =
    useMinigameTimer({
      duration: initialDuration,
      onTimeUp: () => setMinigameStatus("lose"),
    });

  // --- First Clear Check ---
  useEffect(() => {
    if (minigameDeck?.id) {
      const completed = progress[minigameDeck.id]?.includes("completed");
      isFirstClearRef.current = !completed;
    }
  }, [minigameDeck, progress]);

  // --- Game Setup (on mount or restart) ---
  const setupGame = useCallback(() => {
    if (cards.length === 0) {
      setMinigameStatus("lose"); // No cards to play with
      return;
    }

    const gameCards: BoardItem[] = [];
    cards.forEach((card) => {
      // Japanese card: Combine Kanji and Furigana for parseFurigana utility
      gameCards.push({
        id: `jp-${card.id}`,
        flashcardId: card.id,
        type: "jp",
        text: card.reading ? `[${card.word}]{${card.reading}}` : card.word,
        isMatched: false,
      });
      // Vietnamese card
      gameCards.push({
        id: `vi-${card.id}`,
        flashcardId: card.id,
        type: "vi",
        text: card.meaning,
        isMatched: false,
      });
    });

    // Shuffle the cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setBoardItems(shuffledCards);
    setSelectedItems([]);
    setWrongMatch([]);
    setHp(MAX_HP);
    setMinigameStatus("playing");
    setIsPhaoActive(false);
    setPhaoCountdownPercent(undefined);
    setIsKinhLupActive(false);
    setRevealedCardId(null);
    setRevealedCardCountdownPercent(undefined);
    setShowPhaoConfirm(false);
    setShowKinhLupConfirm(false);
    setCurrentKinhLupTargetId(null);
    resetTimer();
    startTimer();
  }, [cards, startTimer, resetTimer]);

  useEffect(() => {
    setupGame();
  }, [setupGame]);

  // --- Card Matching Logic ---
  useEffect(() => {
    if (selectedItems.length === 2) {
      const [card1, card2] = selectedItems;

      if (card1.flashcardId === card2.flashcardId && card1.type !== card2.type) {
        // Match!
        setBoardItems((prev) =>
          prev.map((item) =>
            item.flashcardId === card1.flashcardId ? { ...item, isMatched: true } : item,
          ),
        );
        setSelectedItems([]);
        setWrongMatch([]); // Clear any previous wrong match indication

        // Confetti effect at the position of the matched cards
        const cardElements = document.querySelectorAll(
          `[data-card-id="${card1.id}"], [data-card-id="${card2.id}"]`,
        );
        cardElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          confetti({
            particleCount: 50,
            spread: 70,
            origin: {
              x: (rect.left + rect.right) / 2 / window.innerWidth,
              y: (rect.top + rect.bottom) / 2 / window.innerHeight,
            },
            colors: ["#FFD166", "#FF9F1C", "#06D6A0"],
          });
        });

        // Check for win condition
        const remainingUnmatched = boardItems.filter((item) => !item.isMatched).length;
        if (remainingUnmatched <= 2) {
          pauseTimer();
          setMinigameStatus("win");

          // Hiệu ứng pháo hoa tưng bừng khi chiến thắng
          const duration = 2500;
          const end = Date.now() + duration;
          const frame = () => {
            confetti({
              particleCount: 5,
              angle: 60,
              spread: 55,
              origin: { x: 0, y: 0.8 },
              colors: ["#FF9F1C", "#FFD166", "#06D6A0", "#FF7096", "#5390D9"],
              zIndex: 2000,
            });
            confetti({
              particleCount: 5,
              angle: 120,
              spread: 55,
              origin: { x: 1, y: 0.8 },
              colors: ["#FF9F1C", "#FFD166", "#06D6A0", "#FF7096", "#5390D9"],
              zIndex: 2000,
            });
            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();
        }
      } else {
        // No match
        setWrongMatch([card1.id, card2.id]);
        setHp((prev) => prev - 1);
        setTimeout(() => {
          setSelectedItems([]);
          setWrongMatch([]);
        }, 800); // Short delay for shake animation
      }
    }
  }, [selectedItems, boardItems, pauseTimer]);

  // --- HP Loss Logic ---
  useEffect(() => {
    if (hp <= 0 && minigameStatus === "playing") {
      pauseTimer();
      setMinigameStatus("lose");
    }
  }, [hp, minigameStatus, pauseTimer]);

  // --- Phao Bơi Logic ---
  useEffect(() => {
    let phaoTimer: NodeJS.Timeout;
    let phaoInterval: NodeJS.Timeout;

    if (isPhaoActive) {
      let countdown = PHAO_DURATION_SECONDS;
      setPhaoCountdownPercent(100);

      phaoInterval = setInterval(() => {
        countdown--;
        setPhaoCountdownPercent((countdown / PHAO_DURATION_SECONDS) * 100);
        if (countdown <= 0) {
          clearInterval(phaoInterval);
        }
      }, 1000);

      phaoTimer = setTimeout(() => {
        setIsPhaoActive(false);
        setPhaoCountdownPercent(undefined);
      }, PHAO_DURATION_SECONDS * 1000);
    }

    return () => {
      clearTimeout(phaoTimer);
      clearInterval(phaoInterval);
    };
  }, [isPhaoActive]);

  // --- Kính Lúp Logic ---
  useEffect(() => {
    let kinhLupTimer: NodeJS.Timeout;
    let kinhLupInterval: NodeJS.Timeout;

    if (revealedCardId) {
      let countdown = KINH_LUP_DURATION_SECONDS;
      setRevealedCardCountdownPercent(100);

      kinhLupInterval = setInterval(() => {
        countdown--;
        setRevealedCardCountdownPercent(
          (countdown / KINH_LUP_DURATION_SECONDS) * 100,
        );
        if (countdown <= 0) {
          clearInterval(kinhLupInterval);
        }
      }, 1000);

      kinhLupTimer = setTimeout(() => {
        setRevealedCardId(null);
        setRevealedCardCountdownPercent(undefined);
      }, KINH_LUP_DURATION_SECONDS * 1000);
    }

    return () => {
      clearTimeout(kinhLupTimer);
      clearInterval(kinhLupInterval);
    };
  }, [revealedCardId]);

  // --- Handlers ---
  const handleCardClick = (item: BoardItem) => {
    if (
      !isRunning || // Game not running
      item.isMatched || // Already matched
      wrongMatch.includes(item.id) // Card is shaking from wrong match
    ) {
      return;
    }

    // Toggle: Bỏ chọn nếu click lại vào thẻ đang được chọn
    const isAlreadySelected = selectedItems.some((i) => i.id === item.id);
    if (isAlreadySelected) {
      setSelectedItems((prev) => prev.filter((i) => i.id !== item.id));
      return;
    }

    // Khóa click nếu đã chọn đủ 2 thẻ (đang chờ xử lý check đúng/sai)
    if (selectedItems.length >= 2) {
      return;
    }

    if (isKinhLupActive) {
      setCurrentKinhLupTargetId(item.id);
      setShowKinhLupConfirm(true);
      return;
    }

    setSelectedItems((prev) => [...prev, item]);
  };

  const handlePhaoConfirm = async () => {
    const usedFree = await useFreeMinigameHint();
    if (usedFree) {
      toast.success("Dùng Phao miễn phí!", { icon: "🛟" });
      setIsPhaoActive(true);
    } else {
      const success = await deductCoins(2);
      if (success) {
        toast.success("Dùng Phao (-2🦴)", { icon: "🛟" });
        setIsPhaoActive(true);
      } else {
        toast.error("Không đủ Xương để dùng Phao!", { icon: "🦴" });
      }
    }
    setShowPhaoConfirm(false);
  };

  const handleKinhLupConfirm = async () => {
    if (!currentKinhLupTargetId) return;

    const success = await deductCoins(1);
    if (success) {
      toast.success("Soi Kính Lúp (-1🦴)", { icon: "🔍" });
      setRevealedCardId(currentKinhLupTargetId);
      setIsKinhLupActive(false); // Deactivate magnifier mode after use
    } else {
      toast.error("Không đủ Xương để dùng Kính Lúp!", { icon: "🦴" });
    }
    setShowKinhLupConfirm(false);
    setCurrentKinhLupTargetId(null);
  };

  const handleRestartGame = useCallback(() => {
    setMinigameStatus("playing");
    resetTimer();
    setupGame();
  }, [resetTimer, setupGame]);

  const handleGameWin = useCallback(() => {
    if (isFirstClearRef.current) {
      const timeBonus = Math.floor(timeLeft / 5) * TIME_BONUS_PER_5_SECONDS;
      const totalReward = (baseRewardCoins || 0) + timeBonus;
      if (totalReward > 0) {
        addCoins(totalReward);
      }
    }
    onWin(); // Call parent onWin to save progress and close minigame
  }, [addCoins, baseRewardCoins, onWin, timeLeft]);

  const handleGameLose = useCallback(() => {
    pauseTimer();
  }, [pauseTimer]);

  // --- Game Status Change Logic ---
  useEffect(() => {
    // Only handle lose condition here. Win condition is handled by the modal button.
    if (minigameStatus === "lose") handleGameLose();
  }, [minigameStatus, handleGameLose]);

  // --- Render Logic ---
  const showFuriganaByDefault = gameLevel === "N5";

  if (minigameStatus === "win" || minigameStatus === "lose") {
    const timeBonus = minigameStatus === "win" && isFirstClearRef.current ? Math.floor(timeLeft / 5) * TIME_BONUS_PER_5_SECONDS : 0;
    const rewardCoins = minigameStatus === "win" && isFirstClearRef.current ? baseRewardCoins : 0;

    return (
      <GameResultModal
        status={minigameStatus}
        reason={minigameStatus === "lose" ? (hp <= 0 ? "Hết máu rồi!" : "Hết giờ!") : undefined}
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
          <div className="flex items-center gap-1 sm:gap-2">
            {Array.from({ length: MAX_HP }).map((_, index) => (
              <motion.img
                key={index}
                src="/images/shiba_heart.png"
                alt="HP"
                className={`w-6 h-6 min-[400px]:w-8 min-[400px]:h-8 sm:w-10 sm:h-10 transition-all duration-300 ${
                  index < hp ? "opacity-100" : "opacity-30 grayscale"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: index < hp ? 1 : 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
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
                  disabled={!isRunning || selectedItems.length >= 2 || (isKinhLupActive && item.type === "vi")} // Disable VI cards in Kính Lúp mode
                  className={`relative aspect-square sm:aspect-auto sm:h-28 rounded-xl sm:rounded-2xl p-1.5 min-[400px]:p-2 sm:p-4 flex flex-col items-center justify-center text-center shadow-sm border-b-4 transition-colors outline-none
                    ${
                      isSelected && !isWrong
                        ? "bg-[#E0F7FA] border-[#80DEEA] border-b-[#80DEEA] shadow-[0_0_15px_rgba(128,222,234,0.5)]"
                        : isWrong
                        ? "bg-[#FFF0F3] border-[#FF7096] border-b-[#FF7096]"
                        : "bg-white border-[#FFE2D1] border-b-[#FFD166] hover:bg-orange-50"
                    }
                    ${
                      isKinhLupActive && item.type === "jp"
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
                      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    />
                  )}
                  <span
                    className={`relative z-10 font-bold drop-shadow-sm line-clamp-3 sm:line-clamp-4 leading-tight ${
                      item.type === "jp"
                        ? "text-lg min-[400px]:text-xl sm:text-3xl text-[#FF9F1C]"
                        : "text-[11px] min-[400px]:text-xs sm:text-sm text-[#5390D9]"
                    }`}
                    style={{
                      fontFamily:
                        item.type === "jp" ? "var(--font-cherry)" : "var(--font-rounded)",
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
                      animate={{ scaleX: (revealedCardCountdownPercent || 0) / 100 }}
                      transition={{ duration: 0.1, ease: "linear" }}
                      style={{ originX: 0 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Bar: Hint Buttons */}
      <div className="w-full flex justify-center gap-2 sm:gap-4 mt-2 sm:mt-6 pb-2">
        {/* Phao Bơi Button */}
        <ConfirmationPopover
          open={showPhaoConfirm}
          setOpen={setShowPhaoConfirm}
          onConfirm={handlePhaoConfirm}
          onCancel={() => setShowPhaoConfirm(false)}
          message="Dùng Phao Bơi để xem tất cả Furigana trong 5 giây?"
          costLabel={
            freeMinigameHints > 0 ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">{freeMinigameHints} <LifeBuoy className="w-4 h-4" /></div> Miễn phí
              </div>
            ) : (
              <div className="flex items-center gap-1">
                2 <Bone className="w-4 h-4" />
              </div>
            )
          }
          popoverId="phao-confirm"
        >
          <HintButton
            icon={<LifeBuoy className="w-5 h-5" />}
            label="Phao Bơi"
            costLabel={
              freeMinigameHints > 0 ? (
                <>
                  {freeMinigameHints} <LifeBuoy className="w-3 h-3" />
                </>
              ) : (
                <>
                  2 <Bone className="w-3 h-3" />
                </>
              )
            }
            onClick={() => setShowPhaoConfirm(true)}
            disabled={!isRunning || isKinhLupActive}
            isActive={isPhaoActive}
            countdownPercent={phaoCountdownPercent}
          />
        </ConfirmationPopover>

        {/* Kính Lúp Button */}
        <ConfirmationPopover
          open={showKinhLupConfirm}
          setOpen={setShowKinhLupConfirm}
          onConfirm={handleKinhLupConfirm}
          onCancel={() => setShowKinhLupConfirm(false)}
          message="Dùng Kính Lúp để xem Furigana của 1 thẻ trong 2 giây?"
          costLabel={
            <div className="flex items-center gap-1">
              1 <Bone className="w-4 h-4" />
            </div>
          }
          popoverId="kinh-lup-confirm"
        >
          <HintButton
            icon={<Search className="w-5 h-5" />}
            label="Kính Lúp"
            costLabel={
              <>
                1 <Bone className="w-3 h-3" />
              </>
            }
            onClick={() => setIsKinhLupActive((prev) => !prev)}
            disabled={!isRunning || isPhaoActive}
            isActive={isKinhLupActive}
          />
        </ConfirmationPopover>
      </div>
    </div>
  );
}
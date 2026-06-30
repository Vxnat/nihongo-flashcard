"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Bone, LifeBuoy, Sparkles, ArrowLeft, AlertCircle, Lightbulb, GraduationCap, HelpCircle } from "lucide-react";
import { TimerBar } from "../shared/TimerBar";
import { GameResultModal } from "../shared/GameResultModal";
import { ShibaMasterDialog } from "../shared/ShibaMasterDialog";
import { CoinIcon } from "@/components/common/CoinIcon";
import { VNWordTooltip } from "@/components/visual-novel/VNWordTooltip";
import { parseFurigana } from "@/utils/textParser";
import { useFillBlanksGame } from "@/hooks/games/fill-blanks/useFillBlanksGame";
import { FBTutorialOverlay } from "./FBTutorialOverlay";

interface BlankDetail {
  correctAnswer: string;
  wrongAnswers: string[];
  hint: string;
  reading?: string;
  meaning?: string;
  romaji?: string;
}

interface QuizItem {
  id: string;
  sentence: string;
  translation: string;
  blanks: BlankDetail[];
}

interface FillBlanksGameProps {
  quizList: QuizItem[];
  minigameDeck: any;
  onWin: () => void;
  onClose: () => void;
}

export function FillBlanksGame({
  quizList = [],
  minigameDeck,
  onWin,
  onClose,
}: FillBlanksGameProps) {
  const {
    currentIndex,
    activeBlankIndex,
    filledAnswers,
    shibaHp,
    isGameOver,
    gameStatus,
    showFurigana,
    showShibaMaster,
    unlockedHints,
    options,
    wrongAttempts,
    activeHoverWord,
    timeLeft,
    progressPercent,
    totalTimeLimit,
    isFuriganaSupported,
    quiz,
    currentBlank,
    setShowFurigana,
    setShowShibaMaster,
    setUnlockedHints,
    setActiveHoverWord,
    startTimer,
    handleOptionClick,
    handleRestartGame,
  } = useFillBlanksGame({ quizList, minigameDeck, onWin });

  const [showTutorial, setShowTutorial] = useState(false);
  const [isFirstTutorial, setIsFirstTutorial] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeen = localStorage.getItem("fillblanks_tutorial_seen") === "true";
      if (!hasSeen) {
        setShowTutorial(true);
        setIsFirstTutorial(true);
      }
    }
  }, []);

  // Shiba Master hints options
  const hintOptions = React.useMemo(() => {
    const optionsList: any[] = [];
    if (!currentBlank) return [];

    optionsList.push({
      id: "free_hint",
      icon: <LifeBuoy className="w-5 h-5 text-emerald-600 animate-pulse" />,
      label: "Sư phụ chỉ điểm",
      cost: 0,
      allowFreeHint: true,
      colorClass: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800 border-2",
      onConfirm: async () => {
        setUnlockedHints((prev) => ({ ...prev, [activeBlankIndex]: true }));
      }
    });

    optionsList.push({
      id: "bones_hint",
      icon: <Bone className="w-5 h-5 text-orange-600" />,
      label: "Đổi 5 Xương lấy Gợi ý",
      cost: 5,
      currency: "coins",
      colorClass: "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-800 border-2",
      onConfirm: async () => {
        setUnlockedHints((prev) => ({ ...prev, [activeBlankIndex]: true }));
      }
    });

    optionsList.push({
      id: "fur_hint",
      icon: <CoinIcon size={18} />,
      label: "Đổi 1 Coin lấy Gợi ý",
      cost: 1,
      currency: "goldenFur",
      colorClass: "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800 border-2",
      onConfirm: async () => {
        setUnlockedHints((prev) => ({ ...prev, [activeBlankIndex]: true }));
      }
    });

    return optionsList;
  }, [currentBlank, activeBlankIndex, setUnlockedHints]);

  // --- Rendering helper for formatted sentence ---
  const renderSentenceElements = () => {
    if (!quiz) return null;
    const sentence = quiz.sentence;
    const elements: React.ReactNode[] = [];
    const regex = /(\[[^\]]+\]\{[^\}]+\})|(\{([0-9]+)\})/g;
    let lastIndex = 0;
    let match;
    let indexKey = 0;

    while ((match = regex.exec(sentence)) !== null) {
      if (match.index > lastIndex) {
        elements.push(
          <span key={`text-${indexKey++}`} className="align-middle">
            {sentence.substring(lastIndex, match.index)}
          </span>
        );
      }

      const token = match[0];
      if (token.startsWith("[")) {
        const furiganaMatch = token.match(/\[([^\]]+)\]\{([^\}]+)\}/);
        if (furiganaMatch) {
          const kanji = furiganaMatch[1];
          const furigana = furiganaMatch[2];
          elements.push(
            <ruby key={`furigana-${indexKey++}`} className="mx-[2px] align-middle">
              {kanji}
              <rt className={`text-[0.55em] text-teal-600/80 select-none font-bold transition-opacity duration-300 ${showFurigana ? "opacity-100" : "opacity-0"
                }`}>
                {furigana}
              </rt>
            </ruby>
          );
        }
      } else if (token.startsWith("{")) {
        const blankMatch = token.match(/\{([0-9]+)\}/);
        if (blankMatch) {
          const blankIdx = parseInt(blankMatch[1]);
          const isFilled = filledAnswers[blankIdx] !== undefined;
          const isActive = blankIdx === activeBlankIndex;
          const blankDetails = quiz.blanks[blankIdx];

          elements.push(
            <button
              key={`blank-${blankIdx}`}
              disabled={!isFilled}
              onClick={() => {
                if (isFilled && blankDetails) {
                  setActiveHoverWord({
                    word: blankDetails.correctAnswer,
                    meaning: blankDetails.meaning,
                    reading: blankDetails.reading,
                    romaji: blankDetails.romaji || ""
                  });
                }
              }}
              className={`inline-flex items-center justify-center min-w-[75px] h-10 mx-1 px-3 border-2 rounded-2xl text-center font-bold text-base transition-all duration-300 align-middle ${isFilled
                ? "bg-[#06D6A0] border-[#048c68] text-white hover:scale-105 shadow-sm cursor-pointer"
                : isActive
                  ? "bg-[#FFF8EE] border-dashed border-[#FBC579] text-[#C85A28] animate-pulse shadow-[0_0_12px_rgba(251,197,121,0.7)]"
                  : "bg-zinc-100 border-dashed border-zinc-300 text-zinc-300 cursor-not-allowed"
                }`}
            >
              {isFilled ? (
                <motion.span
                  layoutId={`flying-text-${filledAnswers[blankIdx]}`}
                  className="font-bold text-base select-none"
                >
                  {parseFurigana(filledAnswers[blankIdx], showFurigana)}
                </motion.span>
              ) : (
                "___"
              )}
            </button>
          );
        }
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < sentence.length) {
      elements.push(
        <span key={`text-${indexKey++}`} className="align-middle">
          {sentence.substring(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  if (quizList.length === 0 || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-zinc-400 mb-4 animate-bounce" />
        <p className="font-rounded font-bold text-zinc-500 text-lg">Không tìm thấy câu hỏi!</p>
        <button onClick={onClose} className="mt-4 px-6 py-2 bg-zinc-100 hover:bg-zinc-200 border-2 rounded-2xl">Đóng</button>
      </div>
    );
  }

  const isQuestionFinished = Object.keys(filledAnswers).length === quiz.blanks.length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl mx-auto min-h-[550px] bg-[#FFFDF9] rounded-[3rem] border-4 border-[#FFE2D1] shadow-[0_8px_0_0_#FFD6C0,0_16px_40px_rgba(255,159,28,0.1)] relative flex flex-col justify-between p-6 sm:p-8 overflow-hidden"
      >
        {/* Background decorative elements */}
        <div className="absolute top-[-50px] left-[-50px] w-48 h-48 rounded-full bg-orange-100/30 blur-2xl pointer-events-none" />
        <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 rounded-full bg-[#FFA6C9]/10 blur-2xl pointer-events-none" />

        {/* Header Section */}
        <div className="flex justify-between items-center z-10 w-full mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="font-rounded font-bold text-xs text-zinc-400 hover:text-zinc-600 px-4 py-2 bg-zinc-50 border-2 border-zinc-200 rounded-[1rem] shadow-[0_3px_0_0_#e4e4e7] active:translate-y-0.5 active:shadow-[0_0_0_0_#e4e4e7] transition-all cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <ArrowLeft size={14} /> Thoát
              </span>
            </button>
            <button
              onClick={() => setShowTutorial(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-400 hover:text-zinc-600 border-2 border-zinc-200 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
              title="Hướng dẫn"
            >
              <HelpCircle size={16} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-1"
            style={{
              fontFamily: "var(--font-cherry)"
            }}>
            <div className="bg-[#FFF3E0] border-2 border-[#FFE082] px-3 py-1 rounded-[1rem] font-bold text-[10px] text-amber-800 font-rounded shadow-sm leading-none">
              CÂU {currentIndex + 1} / {quizList.length}
            </div>
            {/* Hàng chấm tiến trình hạt tròn */}
            <div className="flex items-center gap-1 mt-0.5">
              {quizList.map((_, idx) => {
                const isPassed = idx < currentIndex;
                const isCurrent = idx === currentIndex;
                return (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${isPassed
                      ? "bg-[#06D6A0] shadow-[0_0_4px_rgba(6,214,160,0.5)] scale-100"
                      : isCurrent
                        ? "bg-[#FF9F1C] scale-120 animate-pulse ring-1 ring-[#FFD6A0]"
                        : "bg-zinc-200 scale-90"
                      }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Lives hearts display */}
          <div className="flex gap-1.5 bg-white/90 border-2 border-[#FFE2D1] px-3 py-1.5 rounded-[1rem] shadow-[0_3px_0_0_#FFD6C0]">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={i < shibaHp ? { scale: [1, 1.15, 1] } : { scale: 0.7 }}
                transition={{ repeat: i < shibaHp ? Infinity : 0, duration: 2, repeatType: "reverse" }}
              >
                <Heart
                  size={18}
                  className={i < shibaHp ? "text-[#FF7096] fill-[#FF7096]" : "text-zinc-300"}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timer Bar */}
        <div className="w-full z-10 mb-4">
          <TimerBar progressPercent={progressPercent} timeLeft={timeLeft} />
        </div>

        {/* Quiz Sentence Card Area */}
        <div className="flex-1 flex flex-col justify-center items-center z-10 my-4 relative min-h-[140px] px-2 w-full">
          <motion.div
            animate={{
              scale: isQuestionFinished ? 1.025 : 1,
              borderColor: isQuestionFinished ? "#06D6A0" : "#FFE2D1",
              boxShadow: isQuestionFinished
                ? "0 0 20px rgba(6,214,160,0.4), inset 0 2px 4px rgba(0,0,0,0.06)"
                : "none"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white border-4 rounded-[2.5rem] p-6 shadow-inner w-full text-center relative transition-colors duration-300"
          >
            <div className="absolute -top-3.5 left-10 bg-[#FFD166] text-white font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles size={10} /> Điền từ vào chỗ trống
            </div>

            {isFuriganaSupported && (
              <button
                onClick={() => setShowFurigana(!showFurigana)}
                className={`absolute -top-3.5 right-10 w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center font-bold text-xs cursor-pointer shadow-sm z-20 ${showFurigana
                  ? "bg-[#E0F7FA] border-[#80DEEA] text-[#00ACC1]"
                  : "bg-white border-zinc-200 text-zinc-400 opacity-60"
                  }`}
                title="Bật/tắt Furigana"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                あ
              </button>
            )}

            <div className="text-2xl sm:text-3xl text-zinc-800 font-black leading-relaxed mt-2 select-none">
              {renderSentenceElements()}
            </div>

            {/* Hint Display if unlocked */}
            <AnimatePresence>
              {unlockedHints[activeBlankIndex] && currentBlank && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 px-3 py-1.5 bg-amber-50 border-2 border-dashed border-[#FFD166]/60 rounded-xl text-amber-900 font-bold text-xs inline-flex items-center gap-1 shadow-xs"
                >
                  <Lightbulb size={14} className="text-amber-500 fill-amber-500/20 animate-pulse" />
                  <span>Gợi ý: {currentBlank.hint}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Translation Prompt (Helps learners understand context) */}
          <div className="text-center mt-3 max-w-[90%]">
            <p className="text-zinc-500 font-bold text-xs sm:text-sm font-rounded italic">
              "{quiz.translation}"
            </p>
          </div>
        </div>

        {/* Bottom Options and Shiba Master Assist buttons */}
        <div className="w-full z-10 mt-2 flex flex-col gap-4">

          {/* Candy Buttons Options Area */}
          <div className="grid grid-cols-2 gap-3.5 max-w-md mx-auto w-full">
            <AnimatePresence mode="popLayout">
              {options.map((opt) => {
                const isWrong = wrongAttempts[opt];
                return (
                  <motion.button
                    key={opt}
                    disabled={isQuestionFinished || isWrong}
                    onClick={() => handleOptionClick(opt)}
                    className={`h-18 py-2 font-rounded font-black text-base sm:text-lg border-2 rounded-2xl border-b-4 select-none cursor-pointer flex items-center justify-center px-4 relative transition-all ${isWrong
                      ? "bg-red-100 border-red-300 text-red-500 border-b-0 translate-y-1 opacity-50 cursor-not-allowed"
                      : "bg-white border-orange-100 text-orange-900 active:border-b-0 active:translate-y-1 shadow-[0_4px_0_0_#FFE2D1] hover:scale-[1.03]"
                      }`}
                    style={{
                      fontFamily: "var(--font-cute)",
                    }}
                    animate={isWrong ? { x: [-6, 6, -6, 6, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.span layoutId={`flying-text-${opt}`} className="flex items-center justify-center gap-0.5">
                      {parseFurigana(opt, showFurigana)}
                    </motion.span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Shiba Master hint trigger */}
          <div className="flex justify-center mt-1">
            <button
              onClick={() => setShowShibaMaster(true)}
              disabled={isQuestionFinished}
              className="flex items-center gap-2 bg-[#FFF8EE] hover:bg-[#FFE7C6] border-2 border-[#FBC579] px-4 py-2.5 rounded-full shadow-xs active:scale-95 transition-all text-[#C85A28] font-bold text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              <GraduationCap size={16} className="text-[#C85A28]" />
              <span>Hỏi Sư Phụ Shiba</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Shiba Master Dialog Modal */}
      <ShibaMasterDialog
        isOpen={showShibaMaster}
        onClose={() => setShowShibaMaster(false)}
        options={hintOptions}
        message={`Chào đồ đệ! Ôn trợ từ hay ngữ pháp là phải bền bỉ. Muốn sư phụ gợi ý cho ô trống số ${activeBlankIndex + 1} chứ?`}
      />

      {/* Game win/lose outcome modals */}
      <AnimatePresence>
        {isGameOver && (
          <GameResultModal
            status={gameStatus === "win" ? "win" : "lose"}
            reason={shibaHp <= 0 ? "Hết tim mất rồi!" : timeLeft <= 0 ? "Hết giờ rồi!" : ""}
            rewardCoins={minigameDeck?.rewards?.coins || minigameDeck?.rewardCoins || 15}
            timeBonus={gameStatus === "win" ? Math.floor(timeLeft / 10) : 0}
            onClose={onClose}
            onRestart={handleRestartGame}
          />
        )}
      </AnimatePresence>

      {/* Dictionary Popup tooltip */}
      <AnimatePresence>
        {activeHoverWord && (
          <VNWordTooltip
            word={activeHoverWord}
            onClose={() => setActiveHoverWord(null)}
          />
        )}
      </AnimatePresence>

      {/* MÀN HÌNH HƯỚNG DẪN CHƠI */}
      <AnimatePresence>
        {showTutorial && (
          <FBTutorialOverlay
            onClose={() => {
              setShowTutorial(false);
              localStorage.setItem("fillblanks_tutorial_seen", "true");
              if (isFirstTutorial) {
                startTimer();
                setIsFirstTutorial(false);
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

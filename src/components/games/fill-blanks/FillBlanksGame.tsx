"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Bone, LifeBuoy, Sparkles } from "lucide-react";
import { TimerBar } from "../shared/TimerBar";
import { GameResultModal } from "../shared/GameResultModal";
import { ShibaMasterDialog } from "../shared/ShibaMasterDialog";
import { CoinIcon } from "@/components/common/CoinIcon";
import { VNWordTooltip } from "@/components/visual-novel/VNWordTooltip";
import { playSFX } from "@/utils/sfx";

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
  // --- Game States ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeBlankIndex, setActiveBlankIndex] = useState(0);
  const [filledAnswers, setFilledAnswers] = useState<Record<number, string>>({});
  const [shibaHp, setShibaHp] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState<"playing" | "win" | "lose">("playing");
  const [showFurigana, setShowFurigana] = useState(true);

  // Hint states
  const [showShibaMaster, setShowShibaMaster] = useState(false);
  const [unlockedHints, setUnlockedHints] = useState<Record<number, boolean>>({});

  // Options state
  const [options, setOptions] = useState<string[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState<Record<string, boolean>>({});

  // Tooltip dictionary state
  const [activeHoverWord, setActiveHoverWord] = useState<any | null>(null);

  const quiz = quizList[currentIndex];

  // --- Dynamic Time Limit calculation ---
  const totalTimeLimit = useMemo(() => {
    if (!quizList || quizList.length === 0) return 90;
    const calculatedTime = quizList.reduce((acc, q) => {
      // Loại bỏ thẻ Ruby để tính chiều dài thật của chuỗi tiếng Nhật
      const cleanText = q.sentence.replace(/\[([^\]]+)\]\{[^\}]+\}/g, "$1");
      const sentenceLength = cleanText.length;
      const blanksCount = q.blanks?.length || 1;
      const sentenceTime = 6 + sentenceLength * 0.4 + blanksCount * 7; // 6s cơ bản + 0.4s/ký tự + 7s/ô trống
      return acc + sentenceTime;
    }, 0);
    return Math.ceil(calculatedTime) + 15; // Cộng thêm 15 giây bù sai số
  }, [quizList]);

  const [timeLeft, setTimeLeft] = useState(totalTimeLimit);

  // Sync timeLeft when totalTimeLimit changes
  useEffect(() => {
    setTimeLeft(totalTimeLimit);
  }, [totalTimeLimit]);

  // Countdown timer effect
  useEffect(() => {
    if (isGameOver || gameStatus !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameStatus("lose");
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, gameStatus]);

  // Shuffle answers options for current blank
  const currentBlank = quiz?.blanks?.[activeBlankIndex];
  useEffect(() => {
    if (!currentBlank) return;
    const allOptions = [
      currentBlank.correctAnswer,
      ...currentBlank.wrongAnswers,
    ];

    // Fisher-Yates shuffle
    const shuffled = [...allOptions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setOptions(shuffled);
    setWrongAttempts({});
  }, [currentIndex, activeBlankIndex, quiz, currentBlank]);

  // --- Option Click Handler ---
  const handleOptionClick = (option: string) => {
    if (!currentBlank || isGameOver || gameStatus !== "playing") return;
    if (wrongAttempts[option]) return; // Bỏ qua nếu đã click sai trước đó

    if (option === currentBlank.correctAnswer) {
      // Trả lời ĐÚNG
      setFilledAnswers((prev) => ({ ...prev, [activeBlankIndex]: option }));
      playSFX("success");

      // Nếu còn ô trống tiếp theo trong cùng câu hỏi
      if (activeBlankIndex < quiz.blanks.length - 1) {
        setActiveBlankIndex((prev) => prev + 1);
      } else {
        // Hoàn thành toàn bộ câu hỏi hiện tại!
        // Đọc câu hoàn chỉnh qua TTS (Text-to-Speech)
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const cleanSentence = quiz.sentence
            .replace(/\[([^\]]+)\]\{[^\}]+\}/g, "$1")
            .replace(/\{[0-9]+\}/g, (match) => {
              const idx = parseInt(match.replace(/\{|\}/g, ""));
              return filledAnswers[idx] || option;
            });
          const utterance = new SpeechSynthesisUtterance(cleanSentence);
          utterance.lang = "ja-JP";
          utterance.rate = 0.85;
          window.speechSynthesis.speak(utterance);
        }

        // Chờ 1.5s và chuyển câu tiếp theo hoặc thắng cuộc
        setTimeout(() => {
          if (currentIndex < quizList.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setActiveBlankIndex(0);
            setFilledAnswers({});
            setUnlockedHints({});
          } else {
            // Thắng cuộc!
            setGameStatus("win");
            setIsGameOver(true);
            onWin();
          }
        }, 1500);
      }
    } else {
      // Trả lời SAI
      playSFX("fail");
      setWrongAttempts((prev) => ({ ...prev, [option]: true }));
      setShibaHp((prev) => {
        const nextHp = prev - 1;
        if (nextHp <= 0) {
          setGameStatus("lose");
          setIsGameOver(true);
        }
        return nextHp;
      });
    }
  };

  // Shiba Master hints options
  const hintOptions = useMemo(() => {
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
      label: "Đổi 1 Lông Vàng lấy Gợi ý",
      cost: 1,
      currency: "goldenFur",
      colorClass: "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800 border-2",
      onConfirm: async () => {
        setUnlockedHints((prev) => ({ ...prev, [activeBlankIndex]: true }));
      }
    });

    return optionsList;
  }, [currentBlank, activeBlankIndex]);

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
              {isFilled ? filledAnswers[blankIdx] : "___"}
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
        <span className="text-4xl mb-4">🧩</span>
        <p className="font-rounded font-bold text-zinc-500 text-lg">Không tìm thấy câu hỏi!</p>
        <button onClick={onClose} className="mt-4 px-6 py-2 bg-zinc-100 hover:bg-zinc-200 border-2 rounded-2xl">Đóng</button>
      </div>
    );
  }

  const progressPercent = (timeLeft / totalTimeLimit) * 100;
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
          <button
            onClick={onClose}
            className="font-rounded font-bold text-xs text-zinc-400 hover:text-zinc-600 px-4 py-2 bg-zinc-50 border-2 border-zinc-200 rounded-[1rem] shadow-[0_3px_0_0_#e4e4e7] active:translate-y-0.5 active:shadow-[0_0_0_0_#e4e4e7] transition-all cursor-pointer"
          >
            🏃 Thoát
          </button>

          <div className="flex items-center gap-2"
            style={{
              fontFamily: "var(--font-cherry)"
            }}>
            <div className="bg-[#FFF3E0] border-2 border-[#FFE082] px-3 py-1 rounded-[1rem] font-bold text-xs text-amber-800 font-rounded shadow-sm">
              CÂU {currentIndex + 1} / {quizList.length}
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
        <div className="flex-1 flex flex-col justify-center items-center z-10 my-4 relative min-h-[140px] px-2">
          <div className="bg-white border-4 border-[#FFE2D1] rounded-[2.5rem] p-6 shadow-inner w-full text-center relative">
            <div className="absolute -top-3.5 left-10 bg-[#FFD166] text-white font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles size={10} /> Điền từ vào chỗ trống
            </div>

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
                  💡 Gợi ý: {currentBlank.hint}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
                    className={`h-14 font-rounded font-black text-base sm:text-lg border-2 rounded-2xl border-b-4 select-none cursor-pointer flex items-center justify-center px-4 relative transition-all ${isWrong
                      ? "bg-red-100 border-red-300 text-red-500 border-b-0 translate-y-1 opacity-50 cursor-not-allowed"
                      : "bg-white border-orange-100 text-orange-900 active:border-b-0 active:translate-y-1 shadow-[0_4px_0_0_#FFE2D1] hover:scale-[1.03]"
                      }`}
                    style={{
                      fontFamily: "var(--font-cute)",
                    }}
                    animate={isWrong ? { x: [-6, 6, -6, 6, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {opt}
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
              <span>🥋</span>
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
            onRestart={() => {
              setCurrentIndex(0);
              setActiveBlankIndex(0);
              setFilledAnswers({});
              setShibaHp(3);
              setTimeLeft(totalTimeLimit);
              setIsGameOver(false);
              setGameStatus("playing");
              setUnlockedHints({});
            }}
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
    </>
  );
}

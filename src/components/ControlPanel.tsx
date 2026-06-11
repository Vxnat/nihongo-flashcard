import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Shuffle,
  Volume2,
  Frown,
  Smile,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ControlPanelProps {
  onPrev: () => void;
  onNext: () => void;
  onFlip: () => void;
  onShuffle: () => void;
  onKnow: () => void;
  onReview: () => void;
  onPlayAudio: () => void;
  currentIndex: number;
  totalCards: number;
  isFlipped: boolean;
  showFurigana: boolean;
  onToggleFurigana: () => void; // Dòng mới: Cho phép toggle Furigana
}

export function ControlPanel({
  onPrev,
  onNext,
  onFlip,
  onShuffle,
  onKnow,
  onReview,
  onPlayAudio,
  currentIndex,
  totalCards,
  isFlipped,
  showFurigana,
  onToggleFurigana, // Dòng mới: Cho phép toggle Furigana
}: ControlPanelProps) {
  // Cấu hình ảnh tùy chỉnh (giữ nguyên như bạn đã setup)
  const customSadImg = "";
  const customHappyImg = "";

  // Animation Variant chuẩn phong cách "Squishy"
  const panelVariants: any = {
    hidden: { opacity: 0, y: 30, scale: 0.85 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 350, damping: 25 },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.85,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 h-24 flex items-center justify-center relative px-2">
      <AnimatePresence mode="popLayout">
        {isFlipped ? (
          /* ==========================================
             TRẠNG THÁI 2: SAU KHI LẬT (CẢM XÚC & ÂM THANH)
             ========================================== */
          <motion.div
            key="flipped-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-[50px_1fr_50px] sm:grid-cols-[80px_1fr_80px] items-center w-full"
          >
            {/* Cụm nút tiện ích bên trái */}
            <div className="flex flex-col gap-2">
              <motion.button
                layoutId="shuffle-btn"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                onClick={onShuffle}
                className="w-10 h-10 bg-white border-2 border-zinc-200 rounded-full shadow-[0_4px_0_0_#E4E4E7] text-zinc-400 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center hover:text-zinc-600"
              >
                <Shuffle size={16} strokeWidth={3} />
              </motion.button>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-2"
              >
                <button
                  onClick={onPlayAudio}
                  className="w-10 h-10 bg-[#E0F7FA] border-2 border-[#80DEEA] rounded-full shadow-[0_4px_0_0_#80DEEA] text-[#00ACC1] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center hover:bg-[#B2EBF2]"
                >
                  <Volume2 size={18} strokeWidth={2.5} />
                </button>
                <button
                  onClick={onToggleFurigana}
                  className={`w-10 h-10 rounded-full border-2 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center font-bold font-rounded text-[17px] ${
                    showFurigana
                      ? "bg-[#E0F7FA] border-[#80DEEA] shadow-[0_4px_0_0_#80DEEA] text-[#00ACC1]"
                      : "bg-white border-zinc-200 shadow-[0_4px_0_0_#E4E4E7] text-zinc-400 opacity-60"
                  }`}
                >
                  あ
                </button>
              </motion.div>
            </div>

            {/* Cặp nút Cảm xúc ở giữa */}
            <div className="flex justify-center gap-6">
              <button
                onClick={onReview}
                className="relative group w-20 h-20 bg-white border-4 border-[#FF7096] rounded-full shadow-[0_8px_0_0_#FF7096] hover:-translate-y-1 hover:shadow-[0_12px_0_0_#FF7096] active:translate-y-2 active:shadow-[0_0_0_0_#FF7096] transition-all duration-200 flex items-center justify-center"
              >
                <span className="text-[2.5rem] group-active:scale-90 transition-transform flex items-center justify-center">
                  {customSadImg ? (
                    <img
                      src={customSadImg}
                      alt="Quên"
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <Frown
                      size={44}
                      strokeWidth={2.5}
                      className="text-[#FF7096]"
                    />
                  )}
                </span>
                <span className="absolute -top-3 bg-[#FF7096] text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm whitespace-nowrap">
                  Quên rùi!
                </span>
              </button>

              <button
                onClick={onKnow}
                className="relative group w-20 h-20 bg-white border-4 border-[#06D6A0] rounded-full shadow-[0_8px_0_0_#06D6A0] hover:-translate-y-1 hover:shadow-[0_12px_0_0_#06D6A0] active:translate-y-2 active:shadow-[0_0_0_0_#06D6A0] transition-all duration-200 flex items-center justify-center"
              >
                <span className="text-[2.5rem] group-active:scale-90 transition-transform flex items-center justify-center">
                  {customHappyImg ? (
                    <img
                      src={customHappyImg}
                      alt="Nhớ"
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <Smile
                      size={44}
                      strokeWidth={2.5}
                      className="text-[#06D6A0]"
                    />
                  )}
                </span>
                <span className="absolute -top-3 bg-[#06D6A0] text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm whitespace-nowrap">
                  Nhớ luôn!
                </span>
              </button>
            </div>

            {/* Cột phải trống để cân bằng grid */}
            <div className="w-[50px] sm:w-[80px]" />
          </motion.div>
        ) : (
          /* ==========================================
             TRẠNG THÁI 1: TRƯỚC KHI LẬT (ĐIỀU HƯỚNG)
             ========================================== */
          <motion.div
            key="unflipped-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-[50px_1fr_50px] sm:grid-cols-[80px_1fr_80px] items-center w-full"
          >
            {/* Nút Shuffle bên trái */}
            <motion.button
              layoutId="shuffle-btn"
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={onShuffle}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 border-zinc-200 rounded-full shadow-[0_4px_0_0_#E4E4E7] text-zinc-400 active:translate-y-1 active:shadow-[0_0_0_0_#E4E4E7] transition-all flex items-center justify-center hover:text-zinc-600"
            >
              <Shuffle
                className="w-[18px] h-[18px] sm:w-5 sm:h-5"
                strokeWidth={2.5}
              />
            </motion.button>

            {/* Cụm Điều hướng ở giữa */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-3">
              <button
                onClick={onPrev}
                disabled={currentIndex === 0}
                className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-white border-2 border-[#FFE2D1] rounded-full shadow-[0_4px_0_0_#FFE2D1] text-orange-400 active:translate-y-1 active:shadow-[0_0_0_0_#FFE2D1] disabled:opacity-40 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_0_#FFE2D1] transition-all flex items-center justify-center"
              >
                <ArrowLeft
                  className="w-5 h-5 sm:w-[22px] sm:h-[22px]"
                  strokeWidth={3}
                />
              </button>

              <button
                onClick={onFlip}
                className="px-4 sm:px-8 h-12 sm:h-14 shrink-0 bg-[#FFD166] border-b-4 border-[#FF9F1C] rounded-[1.25rem] text-amber-900 font-black text-base sm:text-lg active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center shadow-sm"
              >
                <RotateCw
                  className="mr-1.5 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5"
                  strokeWidth={3}
                />
                <span className="whitespace-nowrap">Lật Thẻ</span>
              </button>

              <button
                onClick={onNext}
                disabled={currentIndex === totalCards - 1}
                className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-white border-2 border-[#FFE2D1] rounded-full shadow-[0_4px_0_0_#FFE2D1] text-orange-400 active:translate-y-1 active:shadow-[0_0_0_0_#FFE2D1] disabled:opacity-40 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_0_#FFE2D1] transition-all flex items-center justify-center"
              >
                <ArrowRight
                  className="w-5 h-5 sm:w-[22px] sm:h-[22px]"
                  strokeWidth={3}
                />
              </button>
            </div>

            {/* Cột phải trống */}
            <div className="w-[50px] sm:w-[80px]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

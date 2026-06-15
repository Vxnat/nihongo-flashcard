import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Shuffle,
  Volume2,
  BookMarked,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FlashcardData } from "@/types/flashcard";

interface ControlPanelProps {
  onPrev: () => void;
  onNext: () => void;
  onFlip: () => void;
  onShuffle: () => void;
  onPlayAudio: () => void;
  currentIndex: number;
  totalCards: number;
  isFlipped: boolean;
  showFurigana: boolean;
  onToggleFurigana: () => void; // Dòng mới: Cho phép toggle Furigana
  card: FlashcardData;
}

export function ControlPanel({
  onPrev,
  onNext,
  onFlip,
  onShuffle,
  onPlayAudio,
  currentIndex,
  totalCards,
  isFlipped,
  showFurigana,
  onToggleFurigana, // Dòng mới: Cho phép toggle Furigana
  card,
}: ControlPanelProps) {
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
    <div className="w-full max-w-md mx-auto mt-5 h-24 flex items-center justify-center relative px-2">
      <AnimatePresence mode="popLayout">
        {isFlipped ? (
          /* THANH CÔNG CỤ TIỆN ÍCH (Khi đã lật thẻ) */
          <motion.div
            key="flipped-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center justify-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-md p-2 border-2 border-zinc-100 rounded-full shadow-lg"
          >
            <button onClick={onPlayAudio} className="w-10 h-10 bg-[#E0F7FA] border-2 border-[#80DEEA] rounded-full shadow-[0_4px_0_0_#80DEEA] text-[#00ACC1] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center hover:bg-[#B2EBF2]" title="Phát âm">
              <Volume2 size={18} strokeWidth={2.5} />
            </button>
            <button onClick={onToggleFurigana} className={`w-10 h-10 rounded-full border-2 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center font-bold font-rounded text-[17px] ${ showFurigana ? "bg-[#E0F7FA] border-[#80DEEA] shadow-[0_4px_0_0_#80DEEA] text-[#00ACC1]" : "bg-white border-zinc-200 shadow-[0_4px_0_0_#E4E4E7] text-zinc-400 opacity-60" }`} title="Bật/tắt Furigana">
              あ
            </button>
            {card.kanji_info && card.kanji_info.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-10 h-10 bg-indigo-50 border-2 border-indigo-200 rounded-full shadow-[0_4px_0_0_#C7D2FE] text-indigo-400 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center hover:bg-indigo-100" title="Xem chi tiết Hán tự">
                    <BookMarked size={18} strokeWidth={2.5} />
                  </button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[420px] w-[95vw] p-0 bg-transparent border-none shadow-none">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex flex-col w-full h-full max-h-[85vh] rounded-xl overflow-hidden border-4 border-[#A0E8D5] shadow-2xl bg-[#FDFBF7]"
                  >
                    <DialogHeader className="bg-[#06D6A0] p-5 pb-6 border-b-4 border-[#A0E8D5] shrink-0 text-center">
                      <DialogTitle className="text-2xl text-white tracking-wider" style={{ fontFamily: "var(--font-cherry)" }}>
                        Chi tiết Hán tự
                      </DialogTitle>
                    </DialogHeader>
                    <div className="p-5 overflow-y-auto hide-scrollbar">
                      <div className="grid grid-cols-1 gap-3">
                        {card.kanji_info.map((kanjiItem, index) => (
                          <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-2xl border-2 border-[#A0E8D5] shadow-[0_4px_0_0_#A0E8D5]">
                            <span className="text-4xl text-[#FF9F1C]" style={{ fontFamily: "var(--font-cherry)" }}>
                              {kanjiItem.kanji}
                            </span>
                            <div className="flex flex-col font-rounded text-xs font-bold space-y-1 w-full overflow-hidden">
                              <div className="bg-orange-50 px-2 py-1 rounded-lg text-orange-800 border border-orange-100 flex justify-between gap-2">
                                <span>ON:</span>
                                <span className="text-[#FF9F1C] truncate text-right" title={kanjiItem.onyomi}>{kanjiItem.onyomi || "---"}</span>
                              </div>
                              <div className="bg-pink-50 px-2 py-1 rounded-lg text-pink-800 border border-pink-100 flex justify-between gap-2">
                                <span>KUN:</span>
                                <span className="text-[#FF7096] truncate text-right" title={kanjiItem.kunyomi}>{kanjiItem.kunyomi || "---"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </DialogContent>
              </Dialog>
            )}
            <button onClick={onShuffle} className="w-10 h-10 bg-white border-2 border-zinc-200 rounded-full shadow-[0_4px_0_0_#E4E4E7] text-zinc-400 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center hover:text-zinc-600" title="Xáo bài">
              <Shuffle size={16} strokeWidth={3} />
            </button>
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

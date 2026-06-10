import React from "react";
import { ArrowLeft, ArrowRight, RotateCw, Shuffle, Volume2 } from "lucide-react";
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
}: ControlPanelProps) {
  
  // Cấu hình ảnh tùy chỉnh (giữ nguyên như bạn đã setup)
  const customSadImg = ""; 
  const customHappyImg = ""; 

  // Animation Variant chuẩn phong cách "Squishy"
  const panelVariants : any= {
    hidden: { opacity: 0, y: 30, scale: 0.85 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 350, damping: 25 }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.85,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8 h-24 flex items-center justify-center relative px-2">
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
            className="flex items-center justify-center gap-8 w-full"
          >
            
            {/* Cụm nút tiện ích (Mini Gummies) đặt ở bên trái */}
            <div className="absolute left-2 flex flex-col gap-3">
              <button 
                onClick={onShuffle} 
                className="w-10 h-10 bg-white border-2 border-zinc-200 rounded-full shadow-[0_4px_0_0_#E4E4E7] text-zinc-400 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center hover:text-zinc-600"
              >
                <Shuffle size={16} strokeWidth={3} />
              </button>
              <button 
                onClick={onPlayAudio} 
                className="w-10 h-10 bg-[#E0F7FA] border-2 border-[#80DEEA] rounded-full shadow-[0_4px_0_0_#80DEEA] text-[#00ACC1] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center hover:bg-[#B2EBF2]"
              >
                <Volume2 size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Cặp nút Cảm xúc khổng lồ (Nằm giữa) */}
            <button 
              onClick={onReview}
              className="relative group w-20 h-20 bg-white border-4 border-[#FF7096] rounded-full shadow-[0_8px_0_0_#FF7096] hover:-translate-y-1 hover:shadow-[0_12px_0_0_#FF7096] active:translate-y-2 active:shadow-[0_0_0_0_#FF7096] transition-all duration-200 flex items-center justify-center ml-10"
            >
              <span className="text-[2.5rem] group-active:scale-90 transition-transform flex items-center justify-center">
                {customSadImg ? (
                  <img src={customSadImg} alt="Quên" className="w-10 h-10 object-contain" />
                ) : (
                  "😭"
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
                  <img src={customHappyImg} alt="Nhớ" className="w-10 h-10 object-contain" />
                ) : (
                  "🤩"
                )}
              </span>
              <span className="absolute -top-3 bg-[#06D6A0] text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm whitespace-nowrap">
                Nhớ luôn!
              </span>
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
            className="flex items-center justify-between w-full"
          >
            
            {/* Nút Trộn bài (Shuffle) độc lập bên trái */}
            <button 
              onClick={onShuffle} 
              className="w-12 h-12 bg-white border-2 border-zinc-200 rounded-full shadow-[0_4px_0_0_#E4E4E7] text-zinc-400 active:translate-y-1 active:shadow-[0_0_0_0_#E4E4E7] transition-all flex items-center justify-center hover:text-zinc-600"
            >
              <Shuffle size={20} strokeWidth={2.5} />
            </button>
            
            {/* Cụm Điều hướng (Prev - Flip - Next) */}
            <div className="flex items-center gap-3">
              <button 
                onClick={onPrev} 
                disabled={currentIndex === 0} 
                className="w-12 h-12 bg-white border-2 border-[#FFE2D1] rounded-full shadow-[0_4px_0_0_#FFE2D1] text-orange-400 active:translate-y-1 active:shadow-[0_0_0_0_#FFE2D1] disabled:opacity-40 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_0_#FFE2D1] transition-all flex items-center justify-center"
              >
                <ArrowLeft size={22} strokeWidth={3} />
              </button>
              
              <button 
                onClick={onFlip} 
                className="px-8 h-14 bg-[#FFD166] border-b-4 border-[#FF9F1C] rounded-[1.25rem] text-amber-900 font-black text-lg active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center shadow-sm"
              >
                <RotateCw className="mr-2" size={20} strokeWidth={3} /> Lật Thẻ
              </button>
              
              <button 
                onClick={onNext} 
                disabled={currentIndex === totalCards - 1} 
                className="w-12 h-12 bg-white border-2 border-[#FFE2D1] rounded-full shadow-[0_4px_0_0_#FFE2D1] text-orange-400 active:translate-y-1 active:shadow-[0_0_0_0_#FFE2D1] disabled:opacity-40 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_0_#FFE2D1] transition-all flex items-center justify-center"
              >
                <ArrowRight size={22} strokeWidth={3} />
              </button>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
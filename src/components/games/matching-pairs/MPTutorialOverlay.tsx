import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronDown } from "lucide-react";

interface MPTutorialOverlayProps {
  onClose: () => void;
}

export function MPTutorialOverlay({ onClose }: MPTutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // States cho Sandbox Trang 1 (Ghép đôi)
  const [step1JpSelected, setStep1JpSelected] = useState(false);
  const [step1ViSelected, setStep1ViSelected] = useState(false);
  const [step1Matched, setStep1Matched] = useState(false);

  // States cho Sandbox Trang 2 (HP & Sai)
  const [step2JpSelected, setStep2JpSelected] = useState(false);
  const [step2ViSelected, setStep2ViSelected] = useState(false);
  const [step2Wrong, setStep2Wrong] = useState(false);
  const [step2Hp, setStep2Hp] = useState(3);

  // States cho Sandbox Trang 3 (Sư Phụ & Gợi ý)
  const [step3MasterOpen, setStep3MasterOpen] = useState(false);
  const [step3HintActive, setStep3HintActive] = useState(false);

  // Render Sandbox Trang 1: Ghép đôi
  const renderStep1 = () => {
    return (
      <div className="w-full flex flex-col items-center space-y-4">
        <div className="grid grid-cols-2 gap-3 w-full max-w-[240px]">
          <AnimatePresence>
            {!step1Matched && (
              <>
                <motion.button
                  key="jp"
                  onClick={() => setStep1JpSelected(!step1JpSelected)}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className={`h-20 rounded-xl border flex items-center justify-center font-black text-xl transition-all shadow-sm relative select-none
                    ${step1JpSelected
                      ? "bg-[#E0F7FA] border-[#80DEEA] text-[#FF9F1C]"
                      : "bg-white border-[#FFE2D1] text-[#FF9F1C] hover:bg-orange-50"
                    }
                  `}
                  style={{ fontFamily: "var(--font-cherry)" }}
                >
                  猫
                  {!step1JpSelected && !step1ViSelected && (
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none text-zinc-500 font-extrabold text-[8px] bg-white border border-zinc-200 py-0.5 px-1 rounded shadow-sm whitespace-nowrap uppercase tracking-wider z-10">
                      Chọn thẻ
                    </span>
                  )}
                </motion.button>

                <motion.button
                  key="vi"
                  onClick={() => {
                    if (!step1JpSelected) return;
                    setStep1ViSelected(true);
                    setTimeout(() => {
                      setStep1Matched(true);
                    }, 600);
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className={`h-20 rounded-xl border flex items-center justify-center font-bold text-xs transition-all shadow-sm relative select-none
                    ${step1ViSelected
                      ? "bg-[#E0F7FA] border-[#80DEEA] text-[#5390D9]"
                      : "bg-white border-[#FFE2D1] text-[#5390D9] hover:bg-orange-50"
                    }
                  `}
                  style={{ fontFamily: "var(--font-rounded)" }}
                >
                  Con mèo
                  {step1JpSelected && !step1ViSelected && (
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none text-zinc-500 font-extrabold text-[8px] bg-white border border-zinc-200 py-0.5 px-1 rounded shadow-sm whitespace-nowrap uppercase tracking-wider z-10">
                      Ghép đôi
                    </span>
                  )}
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="h-10 flex items-center justify-center">
          {step1Matched ? (
            <p className="text-[#05B889] text-xs font-black uppercase tracking-wider animate-pulse">
              Ghép đúng! Thẻ tự tan biến.
            </p>
          ) : (
            <p className="text-zinc-400 text-[11px] font-bold italic text-center leading-relaxed">
              Ghép thử từ tiếng Nhật sang nghĩa tương ứng
            </p>
          )}
        </div>
      </div>
    );
  };

  // Render Sandbox Trang 2: Lỗi & HP
  const renderStep2 = () => {
    return (
      <div className="w-full flex flex-col items-center space-y-4">
        {/* HP Bar */}
        <div className="flex gap-1 bg-white border border-[#FFE2D1] px-2 py-1 rounded-lg shadow-sm">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={i < step2Hp ? { scale: 1 } : { scale: 0.7 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Heart
                size={14}
                className={i < step2Hp ? "text-[#FF7096] fill-[#FF7096]" : "text-zinc-300"}
              />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-[240px]">
          <motion.button
            animate={step2Wrong ? { x: [-5, 5, -5, 5, 0] } : {}}
            onClick={() => setStep2JpSelected(!step2JpSelected)}
            className={`h-20 rounded-xl border flex items-center justify-center font-black text-xl transition-all shadow-sm select-none
              ${step2JpSelected
                ? step2Wrong
                  ? "bg-[#FFF0F3] border-[#FF7096] text-[#FF9F1C]"
                  : "bg-[#E0F7FA] border-[#80DEEA] text-[#FF9F1C]"
                : "bg-white border-[#FFE2D1] text-[#FF9F1C] hover:bg-orange-50"
              }
            `}
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            犬
          </motion.button>

          <motion.button
            animate={step2Wrong ? { x: [-5, 5, -5, 5, 0] } : {}}
            onClick={() => {
              if (!step2JpSelected) return;
              setStep2ViSelected(true);
              setStep2Wrong(true);
              setStep2Hp(2);
              setTimeout(() => {
                setStep2JpSelected(false);
                setStep2ViSelected(false);
                setStep2Wrong(false);
              }, 1200);
            }}
            className={`h-20 rounded-xl border flex items-center justify-center font-bold text-xs transition-all shadow-sm select-none
              ${step2ViSelected
                ? step2Wrong
                  ? "bg-[#FFF0F3] border-[#FF7096] text-[#5390D9]"
                  : "bg-[#E0F7FA] border-[#80DEEA] text-[#5390D9]"
                : "bg-white border-[#FFE2D1] text-[#5390D9] hover:bg-orange-50"
              }
            `}
            style={{ fontFamily: "var(--font-rounded)" }}
          >
            Con mèo
          </motion.button>
        </div>

        <div className="h-10 flex items-center justify-center">
          {step2Wrong ? (
            <p className="text-[#FF7096] text-xs font-black uppercase tracking-wider">
              Sai rồi! Rung đỏ và trừ 1 tim HP!
            </p>
          ) : (
            <p className="text-zinc-400 text-[11px] font-bold italic text-center leading-relaxed">
              Ghép thử 2 từ không khớp để quan sát hình phạt
            </p>
          )}
        </div>
      </div>
    );
  };

  // Render Sandbox Trang 3: Hỏi Sư Phụ
  const renderStep3 = () => {
    return (
      <div className="w-full flex flex-col items-center space-y-4">
        {/* Card mẫu */}
        <div className="w-24 h-24 bg-white border border-[#FFE2D1] rounded-2xl flex flex-col items-center justify-center shadow-sm relative">
          <ruby className="text-xl font-black text-[#FF9F1C]" style={{ fontFamily: "var(--font-cherry)" }}>
            学生
            {step3HintActive && (
              <rt className="text-[10px] font-extrabold text-[#5390D9] tracking-widest select-none block mb-1 ml-1">
                gakusei
              </rt>
            )}
          </ruby>
        </div>

        {/* Nút Hỏi Sư Phụ mini */}
        <div className="w-full flex flex-col items-center relative">
          <button
            onClick={() => setStep3MasterOpen(!step3MasterOpen)}
            className="w-full max-w-[140px] h-9 bg-[#5390D9] hover:bg-[#4a81c3] text-white rounded-xl border-b-4 border-[#305f94] active:border-b-0 active:translate-y-0.5 font-bold text-xs transition-all shadow-sm flex items-center justify-center select-none"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            Hỏi Sư Phụ
          </button>

          {/* Dialog Sư Phụ giả lập */}
          <AnimatePresence>
            {step3MasterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-11 w-full max-w-[200px] bg-white rounded-2xl p-3 border-2 border-[#FFE2D1] shadow-lg space-y-2 z-20"
              >
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wider text-center border-b border-zinc-100 pb-1.5">
                  Lựa chọn bổ trợ
                </p>
                <button
                  onClick={() => {
                    setStep3HintActive(true);
                    setStep3MasterOpen(false);
                  }}
                  className="w-full py-1.5 px-2.5 bg-[#E0F7FA] border border-[#80DEEA] rounded-xl flex items-center justify-center text-[10px] font-black text-[#00ACC1] hover:bg-[#B2EBF2] transition-colors"
                >
                  Dùng Phao Bơi
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-10 flex items-center justify-center">
          {step3HintActive ? (
            <p className="text-[#00ACC1] text-xs font-black uppercase tracking-wider">
              Đã hiển thị phiên âm hỗ trợ!
            </p>
          ) : (
            <p className="text-zinc-400 text-[11px] font-bold italic text-center leading-relaxed">
              Nhấp Hỏi Sư Phụ để trải nghiệm bảo bối gợi ý
            </p>
          )}
        </div>
      </div>
    );
  };

  const steps = [
    {
      title: "Luật chơi ghép đôi",
      description: "Nhấp chọn từ tiếng Nhật và dịch nghĩa tiếng Việt tương ứng. Nếu đúng thẻ bài sẽ biến mất.",
      render: renderStep1,
    },
    {
      title: "Cảnh giác HP & thời gian",
      description: "Ghép cặp sai sẽ bị trừ máu. Hãy hoàn thành màn chơi trước khi hết giờ hoặc hết tim.",
      render: renderStep2,
    },
    {
      title: "Bảo bối của Sư Phụ",
      description: "Nhấp Hỏi Sư Phụ để dùng Phao bơi hiển thị toàn bộ phiên âm hoặc Kính lúp soi từng thẻ.",
      render: renderStep3,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 15 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
        className="relative w-[90%] max-w-[340px] bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-white/60 p-8 shadow-[0_16px_48px_rgba(0,0,0,0.2)] flex flex-col justify-between min-h-[440px] overflow-hidden"
      >
        {/* Nội dung thay đổi theo bước */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full flex flex-col items-center space-y-4"
            >
              <h3 className="text-xl font-black text-zinc-800 tracking-wide" style={{ fontFamily: "var(--font-cherry)" }}>
                {steps[currentStep].title}
              </h3>

              {/* Sandbox tương tác */}
              <div className="w-full bg-zinc-50/50 rounded-3xl p-4 border border-zinc-100/80 shadow-inner min-h-[220px] flex items-center justify-center">
                {steps[currentStep].render()}
              </div>

              <p className="text-zinc-500 font-bold text-xs leading-relaxed max-w-[280px]">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Chân trang */}
        <div className="mt-6 space-y-5">
          {/* Các dấu chấm chỉ báo */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? "w-6 bg-[#5390D9]" : "w-2 bg-zinc-200"}`}
              />
            ))}
          </div>

          {/* Nút hành động */}
          <button
            onClick={handleNext}
            className={`w-full h-12 rounded-2xl font-black text-base transition-all active:scale-[0.98] border shadow-sm flex items-center justify-center
              ${currentStep === steps.length - 1
                ? "bg-[#06D6A0]/15 border-[#06D6A0]/30 text-[#05B889] hover:bg-[#06D6A0]/25"
                : "bg-zinc-950/5 border-zinc-200 text-zinc-700 hover:bg-zinc-950/10"
              }
            `}
          >
            {currentStep === steps.length - 1 ? "Bắt đầu chơi" : "Tiếp theo"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

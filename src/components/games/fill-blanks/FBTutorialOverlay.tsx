import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, GraduationCap, Bone } from "lucide-react";

interface FBTutorialOverlayProps {
  onClose: () => void;
}

export function FBTutorialOverlay({ onClose }: FBTutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // States cho Sandbox Trang 1 (Ghép từ)
  const [step1Filled, setStep1Filled] = useState(false);

  // States cho Sandbox Trang 2 (HP & Lỗi)
  const [step2Hp, setStep2Hp] = useState(3);
  const [step2Wrong, setStep2Wrong] = useState(false);

  // States cho Sandbox Trang 3 (Hỏi Sư Phụ)
  const [step3MasterOpen, setStep3MasterOpen] = useState(false);
  const [step3HintActive, setStep3HintActive] = useState(false);

  // Render Sandbox Trang 1: Điền vào chỗ trống
  const renderStep1 = () => {
    return (
      <div className="w-full flex flex-col items-center space-y-4">
        {/* Câu mẫu giả lập */}
        <div className="text-sm font-bold text-zinc-700 bg-white border border-[#FFE2D1] px-4 py-3 rounded-2xl shadow-xs select-none">
          Tôi{" "}
          <span
            className={`inline-flex items-center justify-center min-w-[50px] h-8 mx-1 px-2 border-2 rounded-xl font-black text-xs transition-all duration-300 align-middle ${
              step1Filled
                ? "bg-[#06D6A0] border-[#048c68] text-white"
                : "bg-[#FFF8EE] border-dashed border-[#FBC579] text-[#C85A28] animate-pulse"
            }`}
          >
            {step1Filled ? "đang" : "___"}
          </span>{" "}
          học tiếng Nhật.
        </div>

        {/* Nút bấm đáp án */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-[200px]">
          <button
            onClick={() => {
              setStep1Filled(true);
            }}
            className={`h-10 rounded-xl border-2 font-black text-xs transition-all shadow-sm select-none ${
              step1Filled
                ? "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                : "bg-white border-[#FFE2D1] text-orange-900 hover:bg-orange-50 active:scale-95"
            }`}
          >
            đang
          </button>
          <button
            disabled={step1Filled}
            onClick={() => {
              // Bấm sai
            }}
            className="h-10 rounded-xl border-2 border-[#FFE2D1] bg-white text-orange-900 hover:bg-orange-50 active:scale-95 font-black text-xs select-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            đã
          </button>
        </div>

        <div className="h-6 flex items-center justify-center">
          {step1Filled ? (
            <p className="text-[#05B889] text-xs font-black uppercase tracking-wider animate-pulse">
              Chính xác! Ô trống đã được lấp đầy.
            </p>
          ) : (
            <p className="text-zinc-400 text-[10px] font-bold italic text-center">
              Hãy nhấp chọn từ "đang" để hoàn thành câu.
            </p>
          )}
        </div>
      </div>
    );
  };

  // Render Sandbox Trang 2: HP & Lỗi
  const renderStep2 = () => {
    return (
      <div className="w-full flex flex-col items-center space-y-4">
        {/* HP Bar giả lập */}
        <div className="flex gap-1.5 bg-white border-2 border-[#FFE2D1] px-2.5 py-1 rounded-xl shadow-xs">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={i < step2Hp ? { scale: 1 } : { scale: 0.7 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Heart
                size={16}
                className={i < step2Hp ? "text-[#FF7096] fill-[#FF7096]" : "text-zinc-300"}
              />
            </motion.div>
          ))}
        </div>

        {/* Nút bấm giả lập */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-[200px]">
          <button
            onClick={() => {
              // Đúng
            }}
            className="h-10 rounded-xl border-2 border-[#FFE2D1] bg-white text-orange-900 hover:bg-orange-50 active:scale-95 font-black text-xs select-none"
          >
            Đúng
          </button>

          <motion.button
            animate={step2Wrong ? { x: [-5, 5, -5, 5, 0] } : {}}
            onClick={() => {
              setStep2Wrong(true);
              setStep2Hp(2);
              setTimeout(() => {
                setStep2Wrong(false);
                setStep2Hp(3);
              }, 1200);
            }}
            className="h-10 rounded-xl border-2 border-red-200 bg-white text-red-600 hover:bg-red-50 active:scale-95 font-black text-xs select-none"
          >
            Sai
          </motion.button>
        </div>

        <div className="h-6 flex items-center justify-center">
          {step2Wrong ? (
            <p className="text-[#FF7096] text-xs font-black uppercase tracking-wider animate-pulse">
              Sai rồi! Rung đỏ và trừ 1 tim HP!
            </p>
          ) : (
            <p className="text-zinc-400 text-[10px] font-bold italic text-center">
              Nhấp thử nút "Sai" để kiểm tra cơ chế mất HP.
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
        {/* Câu khuyết có gợi ý */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-bold text-zinc-700 bg-white border border-[#FFE2D1] px-4 py-2.5 rounded-xl shadow-xs select-none">
            [明日]{" "}
            <span className="inline-flex items-center justify-center w-10 h-6 border border-dashed border-[#FBC579] rounded-md text-[10px] bg-[#FFF8EE] text-[#C85A28]">
              {step3HintActive ? "あした" : "___"}
            </span>
          </div>

          <AnimatePresence>
            {step3HintActive && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] font-bold text-amber-600 mt-1"
              >
                Gợi ý: Phiên âm cách đọc của ngày mai.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Nút Hỏi Sư Phụ giả lập */}
        <div className="w-full flex flex-col items-center relative">
          <button
            onClick={() => setStep3MasterOpen(!step3MasterOpen)}
            className="w-full max-w-[130px] h-9 bg-[#FFF8EE] hover:bg-[#FFE7C6] text-[#C85A28] border-2 border-[#FBC579] rounded-full active:scale-95 font-black text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 select-none"
          >
            <GraduationCap size={14} />
            Hỏi Sư Phụ
          </button>

          {/* Dialog Sư Phụ giả lập */}
          <AnimatePresence>
            {step3MasterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-11 w-full max-w-[180px] bg-white rounded-2xl p-3 border-2 border-[#FFE2D1] shadow-lg space-y-2 z-20"
              >
                <button
                  onClick={() => {
                    setStep3HintActive(true);
                    setStep3MasterOpen(false);
                  }}
                  className="w-full py-1.5 px-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl flex items-center justify-between text-[9px] font-black text-orange-800 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <Bone size={12} className="text-orange-500" /> Đổi 5 Xương
                  </span>
                  <span>Lấy Gợi ý</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-6 flex items-center justify-center">
          {step3HintActive ? (
            <p className="text-[#05B889] text-xs font-black uppercase tracking-wider">
              Gợi ý đã được hiển thị!
            </p>
          ) : (
            <p className="text-zinc-400 text-[10px] font-bold italic text-center">
              Nhấp Hỏi Sư Phụ để dùng xương đổi lấy gợi ý.
            </p>
          )}
        </div>
      </div>
    );
  };

  const steps = [
    {
      title: "Luật chơi Điền từ",
      description: "Đọc câu tiếng Nhật (có bản dịch nghĩa bên dưới để nắm ngữ cảnh), chọn từ chính xác để lắp đầy chỗ trống.",
      render: renderStep1,
    },
    {
      title: "Quản lý Sinh mệnh & HP",
      description: "Mỗi lần gõ sai phương án lựa chọn, bạn sẽ bị phạt trừ 1 tim HP. Hết 3 tim HP hoặc hết giờ chơi game sẽ kết thúc.",
      render: renderStep2,
    },
    {
      title: "Hỏi Sư Phụ Shiba",
      description: "Gặp câu hỏi khó? Hãy nhấn nút Hỏi Sư Phụ để dùng xương (hoặc coin) đổi lấy gợi ý gợi mở vô cùng hữu dụng.",
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
      className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
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
              <h3
                className="text-lg font-black text-zinc-800 tracking-wide"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                {steps[currentStep].title}
              </h3>

              {/* Sandbox tương tác */}
              <div className="w-full bg-zinc-50/50 rounded-3xl p-4 border border-zinc-100/80 shadow-inner min-h-[180px] flex items-center justify-center">
                {steps[currentStep].render()}
              </div>

              <p className="text-zinc-500 font-bold text-xs leading-relaxed max-w-[280px] font-rounded">
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
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? "w-6 bg-[#C85A28]" : "w-2 bg-zinc-200"
                }`}
              />
            ))}
          </div>

          {/* Nút hành động */}
          <button
            onClick={handleNext}
            className={`w-full h-12 rounded-2xl font-black text-sm transition-all active:scale-[0.98] border shadow-sm flex items-center justify-center cursor-pointer ${
              currentStep === steps.length - 1
                ? "bg-[#06D6A0]/15 border-[#06D6A0]/30 text-[#05B889] hover:bg-[#06D6A0]/25"
                : "bg-zinc-950/5 border-zinc-200 text-zinc-700 hover:bg-zinc-950/10"
            }`}
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            {currentStep === steps.length - 1 ? "Bắt đầu chơi" : "Tiếp theo"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

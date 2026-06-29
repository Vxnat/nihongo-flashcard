import React, { useState } from "react";
import { motion as motionFramer, AnimatePresence as AnimatePresenceFramer } from "framer-motion";
import { Check, Plus, Loader2, ChevronDown } from "lucide-react";

interface VNTutorialOverlayProps {
  onClose: () => void;
}

export function VNTutorialOverlay({ onClose }: VNTutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // States cho Sandbox Trang 1
  const [wordClicked, setWordClicked] = useState(false);
  const [wordSaved, setWordSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // States cho Sandbox Trang 2
  const [dialogueStep, setDialogueStep] = useState(0);

  // States cho Sandbox Trang 3
  const [sandboxAuto, setSandboxAuto] = useState(false);
  const [sandboxLog, setSandboxLog] = useState(false);

  // Render Slide 1: Tra từ tương tác
  const renderStep1 = () => {
    return (
      <div className="w-full flex flex-col items-center space-y-4">
        {/* Khung thoại mô phỏng */}
        <div className="w-full bg-[#FFFDF5]/80 backdrop-blur-sm border-2 border-[#FFE2D1] rounded-2xl p-4 shadow-sm relative text-left">
          <span className="text-[10px] font-black text-[#FF9F1C] tracking-wider uppercase block mb-1">
            Shiba
          </span>
          <p className="text-zinc-800 font-extrabold text-sm leading-relaxed">
            これは
            <span
              onClick={() => setWordClicked(true)}
              className="text-[#5390D9] border-b-2 border-dashed border-[#5390D9]/80 pb-0.5 cursor-pointer hover:bg-[#5390D9]/10 rounded px-1 transition-all select-none relative"
            >
              ご飯
              {!wordClicked && (
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none text-zinc-600 font-extrabold text-[9px] bg-white border border-zinc-200 py-0.5 px-1.5 rounded-md shadow-md uppercase tracking-wider whitespace-nowrap">
                  Chạm thử
                </span>
              )}
            </span>
            です。
          </p>
        </div>

        {/* Pop-up từ vựng mô phỏng */}
        <div className="h-40 w-full flex items-center justify-center relative">
          <AnimatePresenceFramer>
            {wordClicked && (
              <motionFramer.div
                initial={{ scale: 0.85, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 10 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="absolute inset-x-0 bg-white/95 backdrop-blur-md border border-white/60 rounded-3xl p-4 shadow-md flex flex-col justify-between h-36"
              >
                <div className="text-left">
                  <ruby className="text-lg font-black text-zinc-800 leading-none">
                    ご飯
                    <rt className="text-[10px] font-extrabold text-[#5390D9] tracking-wider select-none mb-1 ml-1 block">
                      gohan
                    </rt>
                  </ruby>
                  <p className="text-zinc-600 font-bold text-xs bg-zinc-50 border border-dashed border-zinc-150 p-2 rounded-xl mt-1 leading-relaxed">
                    Cơm, bữa ăn
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (wordSaved) return;
                    setIsSaving(true);
                    setTimeout(() => {
                      setIsSaving(false);
                      setWordSaved(true);
                    }, 800);
                  }}
                  className={`w-full h-8 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 border transition-all active:scale-[0.98]
                    ${wordSaved
                      ? "bg-[#06D6A0]/15 border-[#06D6A0]/30 text-[#05B889]"
                      : isSaving
                        ? "bg-zinc-500/10 border-zinc-200 text-zinc-400 cursor-not-allowed"
                        : "bg-[#FF7096]/15 border-[#FF7096]/30 text-[#E25C80] hover:bg-[#FF7096]/25 hover:text-[#C7486B]"
                    }
                  `}
                >
                  {wordSaved ? (
                    <><Check size={12} strokeWidth={3} /> Đã lưu</>
                  ) : isSaving ? (
                    <><Loader2 size={12} strokeWidth={3} className="animate-spin" /> Đang lưu</>
                  ) : (
                    <><Plus size={12} strokeWidth={3} /> Thêm vào thẻ</>
                  )}
                </button>
              </motionFramer.div>
            )}
          </AnimatePresenceFramer>

          {!wordClicked && (
            <p className="text-zinc-400 text-xs font-bold italic text-center leading-relaxed">
              Nhấp vào từ gạch chân màu xanh ở trên để xem giải nghĩa
            </p>
          )}
        </div>
      </div>
    );
  };

  // Render Slide 2: Chuyển thoại
  const renderStep2 = () => {
    const dialogues = [
      {
        jp: "これは何ですか？",
        vi: "Đây là cái gì vậy?",
        speaker: "Shiba",
      },
      {
        jp: "これは寿司です！",
        vi: "Đây là Sushi!",
        speaker: "Sakura",
      },
    ];

    return (
      <div className="w-full flex flex-col items-center space-y-4">
        {/* Khung thoại giả lập */}
        <div
          onClick={() => {
            setDialogueStep((prev) => (prev === 0 ? 1 : 0));
          }}
          className="w-full min-h-[110px] bg-[#FFFDF5]/90 backdrop-blur-md border-2 border-[#FFE2D1] rounded-[2rem] p-5 shadow-md relative cursor-pointer hover:border-[#FFD166] transition-all select-none flex flex-col justify-between text-left"
        >
          <div>
            <span
              className="text-[10px] font-black tracking-wider uppercase block mb-1"
              style={{ color: dialogueStep === 0 ? "#FF9F1C" : "#FF7096" }}
            >
              {dialogues[dialogueStep].speaker}
            </span>
            <p className="text-zinc-800 font-extrabold text-sm leading-relaxed">
              {dialogues[dialogueStep].jp}
            </p>
            <p className="text-zinc-400 font-bold text-xs mt-1 border-l-2 border-zinc-200 pl-2 leading-relaxed">
              {dialogues[dialogueStep].vi}
            </p>
          </div>

          <div className="absolute bottom-3 right-5 text-zinc-400 animate-bounce">
            <ChevronDown size={16} strokeWidth={3} />
          </div>
        </div>

        <p className="text-zinc-400 text-xs font-bold italic text-center max-w-[240px] leading-relaxed">
          Nhấp thử vào khung thoại ở trên để đổi sang câu tiếp theo
        </p>
      </div>
    );
  };

  // Render Slide 3: Quick Menu Panel
  const renderStep3 = () => {
    return (
      <div className="w-full flex flex-col items-center space-y-4 relative">
        {/* Thanh công cụ mini */}
        <div className="w-full bg-[#FFFDF5]/40 backdrop-blur-sm border border-zinc-200 rounded-2xl p-3 flex items-center justify-center gap-3">
          <button
            onClick={() => setSandboxAuto(!sandboxAuto)}
            className={`text-[10px] font-black tracking-widest uppercase h-8 px-3 rounded-full border transition-all active:scale-95 shadow-sm flex items-center justify-center
              ${sandboxAuto
                ? "bg-sky-500/80 border-sky-400 text-white shadow-sky-200/50"
                : "bg-white/70 border-white/50 text-zinc-500 hover:text-zinc-800"
              }
            `}
          >
            Auto
          </button>
          <button
            onClick={() => setSandboxLog(!sandboxLog)}
            className={`text-[10px] font-black tracking-widest uppercase h-8 px-3 rounded-full border transition-all active:scale-95 shadow-sm flex items-center justify-center
              ${sandboxLog
                ? "bg-zinc-800 border-zinc-800 text-white"
                : "bg-white/70 border-white/50 text-zinc-500 hover:text-zinc-800"
              }
            `}
          >
            Lịch sử
          </button>
        </div>

        {/* Khu vực mô tả hoạt động của sandbox */}
        <div className="w-full flex items-center justify-center min-h-[110px] relative">
          <AnimatePresenceFramer mode="wait">
            {sandboxLog ? (
              <motionFramer.div
                key="log"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="w-full bg-zinc-950/90 rounded-2xl p-3 text-left space-y-2 border border-zinc-800"
              >
                <div className="border-b border-zinc-850 pb-1 flex justify-between items-center">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Lịch sử thoại</span>
                  <span onClick={() => setSandboxLog(false)} className="text-[9px] font-bold text-zinc-400 hover:text-white cursor-pointer">Đóng</span>
                </div>
                <div className="space-y-1 max-h-[60px] overflow-y-auto pr-1">
                  <div>
                    <span className="text-[8px] font-black text-[#FF9F1C] uppercase">Shiba</span>
                    <p className="text-zinc-300 font-bold text-[10px] leading-tight">これは何ですか？</p>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-[#FF7096] uppercase">Sakura</span>
                    <p className="text-zinc-300 font-bold text-[10px] leading-tight">これは寿司です！</p>
                  </div>
                </div>
              </motionFramer.div>
            ) : sandboxAuto ? (
              <motionFramer.div
                key="auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-2"
              >
                <div className="w-6 h-6 rounded-full border-2 border-t-sky-500 border-sky-200 animate-spin mx-auto" />
                <p className="text-sky-500 text-xs font-extrabold animate-pulse">
                  Tự động chuyển câu thoại tiếp theo...
                </p>
              </motionFramer.div>
            ) : (
              <motionFramer.p
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-zinc-400 text-xs font-bold italic text-center max-w-[220px] leading-relaxed"
              >
                Nhấn bật Auto để chạy tự động, hoặc Lịch sử để xem lại câu nói trước
              </motionFramer.p>
            )}
          </AnimatePresenceFramer>
        </div>
      </div>
    );
  };

  const steps = [
    {
      title: "Tra từ tương tác",
      description: "Nhấp thử vào từ gạch chân màu xanh ở trên để xem nghĩa Furigana và lưu từ nhanh.",
      render: renderStep1,
    },
    {
      title: "Chuyển câu thoại",
      description: "Nhấp thử vào khung thoại ở trên để chuyển tiếp câu nói mới khi có mũi tên nhấp nháy.",
      render: renderStep2,
    },
    {
      title: "Công cụ điều khiển",
      description: "Auto giúp tự động chạy thoại. Lịch sử giúp xem lại các câu thoại cũ.",
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
    <motionFramer.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
    >
      <motionFramer.div
        initial={{ scale: 0.9, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 15 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
        className="relative w-[90%] max-w-[340px] bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-white/60 p-8 shadow-[0_16px_48px_rgba(0,0,0,0.2)] flex flex-col justify-between min-h-[440px] overflow-hidden"
      >
        {/* Nội dung thay đổi theo bước */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <AnimatePresenceFramer mode="wait">
            <motionFramer.div
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
            </motionFramer.div>
          </AnimatePresenceFramer>
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
            {currentStep === steps.length - 1 ? "Bắt đầu học" : "Tiếp theo"}
          </button>
        </div>
      </motionFramer.div>
    </motionFramer.div>
  );
}

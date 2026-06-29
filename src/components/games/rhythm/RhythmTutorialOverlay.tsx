"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Ham, Shield, HelpCircle, X, Check, Volume2, Keyboard, Sparkles, Bone, Bug } from "lucide-react";

interface RhythmTutorialOverlayProps {
  onClose: () => void;
}

export function RhythmTutorialOverlay({ onClose }: RhythmTutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // States cho Trang 1 (Gõ Nhịp)
  const [step1Success, setStep1Success] = useState(false);
  const [step1ActiveLane, setStep1ActiveLane] = useState(false);

  // States cho Trang 2 (Lọc Âm Tiết)
  const [step2Success, setStep2Success] = useState(false);
  const [step2Wrong, setStep2Wrong] = useState(false);
  const [step2Hp, setStep2Hp] = useState(3);

  // States cho Trang 3 (Bổ Trợ & Cạm Bẫy)
  const [selectedItem, setSelectedItem] = useState<string | null>("normal");

  // Xử lý sự kiện bàn phím cho Trang 1
  useEffect(() => {
    if (currentStep !== 0 || step1Success) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "a") {
        setStep1ActiveLane(true);
        setStep1Success(true);
        setTimeout(() => setStep1ActiveLane(false), 150);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, step1Success]);

  const handleStep1Tap = () => {
    if (step1Success) return;
    setStep1ActiveLane(true);
    setStep1Success(true);
    setTimeout(() => setStep1ActiveLane(false), 150);
  };

  const handleStep2TapCorrect = () => {
    setStep2Success(true);
    setStep2Wrong(false);
  };

  const handleStep2TapIncorrect = () => {
    if (step2Success) return;
    setStep2Wrong(true);
    setStep2Hp((prev) => Math.max(0, prev - 1));
    setTimeout(() => {
      setStep2Wrong(false);
    }, 1000);
  };

  // Trang 1: Hướng dẫn gõ đúng nhịp
  const renderStep1 = () => (
    <div className="flex flex-col items-center flex-1 justify-between">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-1">
          <span className="p-2.5 bg-amber-50 rounded-2xl text-amber-600 border border-amber-200">
            <Volume2 size={24} />
          </span>
        </div>
        <h3 className="text-amber-900 font-black text-lg font-rounded">Gõ Nhịp Đúng Lúc</h3>
        <p className="text-xs font-rounded font-bold text-amber-800/80 leading-relaxed max-w-[260px] mx-auto">
          Nhìn nốt nhạc rơi xuống. Nhấp chuột vào làn chơi hoặc gõ phím tương ứng khi nốt chạm vạch nhịp.
        </p>
      </div>

      {/* Vùng mô phỏng chơi game */}
      <div className="w-full max-w-[180px] h-[180px] bg-white/80 border-2 border-[#FFE2D1] rounded-2xl relative overflow-hidden flex flex-col justify-end items-center my-4 shadow-inner">
        {/* Vạch nhịp */}
        <div className="absolute bottom-[15%] left-0 right-0 h-4 border-y bg-[#FF9F1C]/10 border-[#FF9F1C]/30 flex items-center justify-center pointer-events-none">
          <span className="text-[7px] font-black text-[#FF9F1C] uppercase tracking-widest font-rounded">
            Vạch Nhịp
          </span>
        </div>

        {/* Làn chơi mô phỏng */}
        <div className="w-full h-full relative flex flex-col justify-end items-center cursor-pointer" onClick={handleStep1Tap}>
          {/* Flash sáng khi gõ */}
          <AnimatePresence>
            {step1ActiveLane && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-[#FF9F1C] via-transparent to-transparent pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Phím hỗ trợ */}
          <div className="absolute bottom-2 font-black font-rounded text-[10px] text-amber-700/40">
            PHÍM A
          </div>

          {/* Nốt nhạc rơi mẫu */}
          {!step1Success && (
            <motion.div
              animate={{ y: [-10, 115] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
              className="absolute top-0 w-10 h-10 rounded-full border border-[#FF9F1C] bg-white/95 text-amber-800 shadow-[0_4px_10px_rgba(255,159,28,0.1)] flex items-center justify-center font-black font-rounded text-sm"
            >
              か
            </motion.div>
          )}

          {/* Hiệu ứng gõ trúng */}
          <AnimatePresence>
            {step1Success && (
              <motion.div
                initial={{ scale: 0.6, y: -45, opacity: 0 }}
                animate={{ scale: 1.2, y: -65, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute font-black font-rounded text-xs text-[#FF9F1C]"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                PERFECT!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full flex flex-col items-center">
        {step1Success ? (
          <div className="text-center space-y-3 w-full">
            <p className="text-[11px] font-rounded font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl py-1.5 px-3">
              Tuyệt vời! Bạn đã gõ trúng vạch nhịp.
            </p>
            <button
              onClick={() => setCurrentStep(1)}
              className="w-full py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-[#FF9F1C] to-[#FFBF69] border-2 border-white/20 text-white shadow-[0_4px_0_0_#cc7a00] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              Tiếp tục
            </button>
          </div>
        ) : (
          <p className="text-[11px] font-rounded font-bold text-amber-700/60 animate-pulse py-2">
            Nhấp chuột vào làn hoặc nhấn phím A để thử...
          </p>
        )}
      </div>
    </div>
  );

  // Trang 2: Lọc âm tiết đúng của từ
  const renderStep2 = () => (
    <div className="flex flex-col items-center flex-1 justify-between">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-1">
          <span className="p-2.5 bg-amber-50 rounded-2xl text-amber-600 border border-amber-200">
            <Keyboard size={24} />
          </span>
        </div>
        <h3 className="text-amber-900 font-black text-lg font-rounded">Gõ Đúng Âm Tiết</h3>
        <p className="text-xs font-rounded font-bold text-amber-800/80 leading-relaxed max-w-[260px] mx-auto">
          Chỉ gõ các nốt mang âm tiết của từ vựng mục tiêu ở phía trên. Gõ sai hoặc gõ vào làn trống sẽ mất HP!
        </p>
      </div>

      {/* Sandbox Lọc âm tiết */}
      <div className="w-full max-w-[220px] bg-white/80 border-2 border-[#FFE2D1] rounded-[2rem] p-4 my-3 flex flex-col items-center shadow-inner relative">
        
        {/* Từ vựng mục tiêu giả lập */}
        <div className="bg-[#FFFDF5] border border-[#FFE2D1] rounded-2xl py-1.5 px-4 text-center mb-4">
          <div className="text-amber-700/50 text-[9px] font-bold font-rounded uppercase tracking-wider">Từ mục tiêu</div>
          <div className="text-amber-900 font-black text-lg font-rounded">ねこ</div>
        </div>

        {/* Bảng máu giả lập */}
        <div className="flex items-center gap-1.5 mb-4">
          {[1, 2, 3].map((heartIdx) => (
            <Heart
              key={heartIdx}
              size={14}
              className={`transition-colors duration-300 ${
                heartIdx <= step2Hp ? "text-red-500 fill-red-500" : "text-zinc-300 fill-zinc-200"
              }`}
            />
          ))}
        </div>

        {/* 2 Làn chơi mô phỏng */}
        <div className="w-full flex gap-3 h-[80px]">
          {/* Làn trái: Nốt Đúng (ね) */}
          <div
            onClick={handleStep2TapCorrect}
            className="flex-1 border border-dashed border-[#FFE2D1] rounded-xl flex items-center justify-center relative cursor-pointer hover:bg-emerald-50/20 active:scale-95 transition-all"
          >
            {!step2Success && (
              <div className="w-10 h-10 rounded-full border border-[#FF9F1C] bg-white/95 text-amber-800 flex items-center justify-center font-black font-rounded text-sm">
                ね
              </div>
            )}
            {step2Success && (
              <span className="text-emerald-500 bg-emerald-50 border border-emerald-200 rounded-full p-1">
                <Check size={14} />
              </span>
            )}
          </div>

          {/* Làn phải: Nốt Sai (い) */}
          <div
            onClick={handleStep2TapIncorrect}
            className={`flex-1 border border-dashed border-[#FFE2D1] rounded-xl flex items-center justify-center relative cursor-pointer active:scale-95 transition-all ${
              step2Wrong ? "bg-red-50 border-red-300" : ""
            }`}
          >
            <div className={`w-10 h-10 rounded-full border border-[#FF9F1C] bg-white/95 text-amber-800 flex items-center justify-center font-black font-rounded text-sm ${
              step2Wrong ? "animate-bounce border-red-400 bg-red-50 text-red-500" : ""
            }`}>
              い
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col items-center">
        {step2Success ? (
          <div className="text-center space-y-3 w-full">
            <p className="text-[11px] font-rounded font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl py-1.5 px-3">
              Chính xác! Âm ね thuộc từ ねこ.
            </p>
            <button
              onClick={() => setCurrentStep(2)}
              className="w-full py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-[#FF9F1C] to-[#FFBF69] border-2 border-white/20 text-white shadow-[0_4px_0_0_#cc7a00] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              Tiếp tục
            </button>
          </div>
        ) : (
          <p className="text-[11px] font-rounded font-bold text-amber-700/60 text-center px-4 leading-relaxed">
            Từ mục tiêu là ねこ. Hãy nhấp gõ nốt ở làn phù hợp (ね là đúng, い là sai).
          </p>
        )}
      </div>
    </div>
  );

  // Trang 3: Các loại nốt đặc biệt
  const renderStep3 = () => {
    const items = [
      {
        id: "normal",
        name: "Nốt Thường",
        desc: "Âm tiết cấu thành từ vựng mục tiêu. Hãy nhắm gõ chuẩn xác để qua ải.",
        style: "border-[#FF9F1C] bg-white/90 text-amber-900 shadow-sm",
        label: "か",
        icon: null
      },
      {
        id: "meat",
        name: "Nốt HP",
        desc: "Đặc biệt hồi 1 tim HP khi bạn gõ trúng. Rất hữu ích khi sắp hết mạng.",
        style: "border-[#FF7096] bg-[#FF7096]/15 text-[#FF7096] shadow-sm",
        label: null,
        icon: <Ham size={16} className="fill-[#FF7096]" />
      },
      {
        id: "shield",
        name: "Nốt Khiên",
        desc: "Tạo lớp khiên bảo hộ. Giúp bạn chắn 1 lỗi gõ sai mà không bị trừ máu HP.",
        style: "border-[#06D6A0] bg-[#06D6A0]/15 text-[#05B889] shadow-sm",
        label: null,
        icon: <Shield size={16} className="fill-[#06D6A0]" />
      },
      {
        id: "coin",
        name: "Nốt Xương",
        desc: "Mang lại xương phần thưởng sau khi hoàn thành. Hãy tích lũy thật nhiều xương.",
        style: "border-[#FFD166] bg-[#FFD166]/15 text-[#FF9F1C] shadow-sm",
        label: null,
        icon: <Bone size={16} className="rotate-45" />
      },
      {
        id: "oni",
        name: "Bẫy Bọ Lỗi",
        desc: "Cạm bẫy phá đám! Có hình thức giống nốt thường để đánh lừa bạn. Gõ trúng sẽ làm che khuất màn hình.",
        style: "border-[#FF9F1C] bg-white/90 text-amber-900 shadow-sm",
        label: null,
        icon: <Bug size={16} className="text-amber-800" />
      }
    ];

    const currentItemInfo = items.find((it) => it.id === selectedItem) || items[0];

    return (
      <div className="flex flex-col items-center flex-1 justify-between">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <span className="p-2.5 bg-amber-50 rounded-2xl text-amber-600 border border-amber-200">
              <Sparkles size={24} />
            </span>
          </div>
          <h3 className="text-amber-900 font-black text-lg font-rounded">Nốt Hỗ Trợ & Bẫy</h3>
          <p className="text-xs font-rounded font-bold text-amber-800/80 leading-relaxed max-w-[260px] mx-auto">
            Nhấp vào từng bong bóng bên dưới để tìm hiểu tác dụng của các loại nốt đặc biệt.
          </p>
        </div>

        {/* Khung trưng bày nốt */}
        <div className="w-full flex flex-col items-center my-3">
          <div className="flex justify-center gap-2 mb-4">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => setSelectedItem(it.id)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer relative ${
                  it.style
                } ${selectedItem === it.id ? "scale-120 ring-2 ring-amber-400 border-white" : "opacity-75 hover:opacity-100"}`}
              >
                {it.icon ? it.icon : <span className="font-rounded font-black text-xs">{it.label}</span>}
              </button>
            ))}
          </div>

          {/* Chi tiết nốt được chọn */}
          <div className="w-full bg-[#FFFDF5] border border-[#FFE2D1] rounded-2xl p-4 min-h-[90px] flex flex-col justify-center">
            <h4 className="text-xs font-black text-amber-900 font-rounded mb-1">{currentItemInfo.name}</h4>
            <p className="text-[11px] font-rounded font-bold text-amber-800/70 leading-relaxed">
              {currentItemInfo.desc}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentStep(3)}
          className="w-full py-3.5 rounded-2xl font-black text-base transition-all active:translate-y-1 active:shadow-[0_2px_0_0_#cc7a00] bg-gradient-to-r from-[#FF9F1C] to-[#FFBF69] border-2 border-white/20 text-white shadow-[0_6px_0_0_#cc7a00] hover:brightness-105 cursor-pointer select-none"
        >
          Tiếp tục
        </button>
      </div>
    );
  };

  // Trang 4: Bùng nổ Fever Mode
  const renderStep4 = () => (
    <div className="flex flex-col items-center flex-1 justify-between">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-1">
          <span className="p-2.5 bg-amber-50 rounded-2xl text-amber-600 border border-amber-200">
            <Sparkles size={24} />
          </span>
        </div>
        <h3 className="text-amber-900 font-black text-lg font-rounded">Bùng Nổ Fever Mode</h3>
        <p className="text-xs font-rounded font-bold text-amber-800/80 leading-relaxed max-w-[260px] mx-auto">
          Đạt mốc 10 combo để kích hoạt Fever Mode trong 5 giây. Tất cả nốt đều là nốt đúng và được nhân đôi (x2) điểm số!
        </p>
      </div>

      {/* Visual minh họa Fever Mode */}
      <div className="w-full max-w-[200px] bg-gradient-to-b from-[#FFF0F3] via-[#FFF5F5] to-[#FFF9E6] border-2 border-[#FFE2D1] rounded-[2rem] p-4 my-3 flex flex-col items-center shadow-inner relative overflow-hidden">
        
        {/* Spotlights giả lập */}
        <div className="absolute top-0 left-0 w-8 h-24 bg-pink-300/10 blur-[4px] rotate-12 origin-top-left" />
        <div className="absolute top-0 right-0 w-8 h-24 bg-amber-300/10 blur-[4px] -rotate-12 origin-top-right" />

        {/* Fever Bar đầy */}
        <div className="w-full bg-[#FFF8F0] h-2.5 rounded-full border-2 border-[#FFE2D1] overflow-hidden mb-3 relative z-10">
          <div className="h-full w-full bg-gradient-to-r from-yellow-300 to-amber-500 animate-pulse" />
        </div>

        {/* Vách nhịp */}
        <div className="w-full h-[54px] border-2 border-dashed border-[#FFE2D1] rounded-xl flex items-center justify-center relative bg-white/40">
          <span className="text-sm text-amber-600 font-black tracking-wide animate-pulse">FEVER TIME x2</span>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3.5 rounded-2xl font-black text-base transition-all active:translate-y-1 active:shadow-[0_2px_0_0_#cc7a00] bg-gradient-to-r from-[#FF9F1C] to-[#FFBF69] border-2 border-white/20 text-white shadow-[0_6px_0_0_#cc7a00] hover:brightness-105 cursor-pointer select-none"
      >
        Bắt đầu chơi
      </button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" />

      {/* Card hướng dẫn */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: "spring", bounce: 0.35, duration: 0.55 }}
        className="relative bg-white rounded-[2.5rem] border-4 border-[#FFE2D1] shadow-2xl w-full max-w-sm p-6 pt-8 z-10 min-h-[480px] flex flex-col justify-between"
      >
        {/* Shiba Sensei Mascot thò đầu ở góc */}
        <div className="absolute -top-10 -right-2 w-20 h-20 z-20 pointer-events-none">
          <img
            src="/images/mascot/shiba_master.gif"
            alt="Shiba Sensei"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>

        {/* Top Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-800">
            <HelpCircle size={20} />
          </span>
          <span
            className="text-amber-900 font-black text-sm uppercase tracking-wider"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            Hướng Dẫn
          </span>
        </div>

        {/* Nội dung các trang */}
        <div className="flex-1 flex flex-col justify-center">
          {currentStep === 0 && renderStep1()}
          {currentStep === 1 && renderStep2()}
          {currentStep === 2 && renderStep3()}
          {currentStep === 3 && renderStep4()}
        </div>

        {/* Dòng phân trang (Dots) */}
        <div className="flex justify-center items-center gap-2 mt-4">
          {[0, 1, 2, 3].map((stepIdx) => (
            <button
              key={stepIdx}
              onClick={() => {
                // Chỉ cho phép click lùi trang hoặc chuyển trang nếu đã thắng trang trước
                if (
                  stepIdx < currentStep ||
                  (stepIdx === 1 && step1Success) ||
                  (stepIdx === 2 && step2Success) ||
                  (stepIdx === 3 && step2Success)
                ) {
                  setCurrentStep(stepIdx);
                }
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentStep === stepIdx ? "w-6 bg-[#FF9F1C]" : "bg-amber-200 hover:bg-amber-300"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

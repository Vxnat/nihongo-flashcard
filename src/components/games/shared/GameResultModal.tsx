import React from "react";
import { motion } from "framer-motion";
import { RotateCcw, X } from "lucide-react";

interface GameResultModalProps {
  status: "win" | "lose";
  reason?: string; // e.g., "Hết giờ!", "Hết máu rồi!"
  rewardCoins?: number;
  timeBonus?: number;
  scoreBonus?: number;
  score?: number;
  onRestart: () => void;
  onClose: () => void;
}

export function GameResultModal({
  status,
  reason,
  rewardCoins = 0,
  timeBonus = 0,
  scoreBonus = 0,
  score,
  onRestart,
  onClose,
}: GameResultModalProps) {
  const isWin = status === "win";
  const totalReward = rewardCoins + timeBonus + scoreBonus;

  const config = {
    win: {
      borderColor: "#FFD166",
      shadowColor: "#FFD166",
      titleColor: "#FF9F1C",
      buttonBg: "#06D6A0",
      buttonHoverBg: "#05b889",
      buttonBorder: "#048c68",
      icon: "🎉",
      title: "Chiến thắng!",
      message: "Bạn đã hoàn thành xuất sắc thử thách!",
      primaryButtonText: "Tuyệt vời!",
    },
    lose: {
      borderColor: "#FF7096",
      shadowColor: "#FF7096",
      titleColor: "#FF7096",
      buttonBg: "#FF7096",
      buttonHoverBg: "#FF5C8A",
      buttonBorder: "#C7486B",
      icon: "😭",
      title: reason || "Thất bại!",
      message: "Đừng nản lòng, cố gắng ở lần sau nhé!",
      primaryButtonText: "Chơi lại",
    },
  };

  const currentConfig = config[status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#FDFBF7] border-4 rounded-[2.5rem] p-6 sm:p-8 max-w-[340px] w-full text-center"
        style={{
          borderColor: currentConfig.borderColor,
          boxShadow: `0 12px 0 0 ${currentConfig.shadowColor}`,
        }}
      >
        <span className="text-6xl mb-4 block animate-bounce">{currentConfig.icon}</span>
        <h3 className="text-3xl mb-2" style={{ fontFamily: "var(--font-cherry)", color: currentConfig.titleColor }}>
          {currentConfig.title}
        </h3>
        <p className="font-rounded text-zinc-500 font-bold mb-6">{currentConfig.message}</p>

        {score !== undefined && (
          <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-4 w-full mb-6 relative overflow-hidden flex flex-col items-center justify-center gap-1 shadow-inner">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block font-rounded">Điểm số</span>
            <span className="text-5xl font-bold text-[#FF7096] drop-shadow-md" style={{ fontFamily: "var(--font-cherry)" }}>{score}</span>
          </div>
        )}

        {isWin && totalReward > 0 && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-4 w-full mb-6 relative overflow-hidden flex flex-col items-center justify-center gap-1 shadow-inner">
            <span className="text-xs font-black text-orange-400 uppercase tracking-wider block">Phần thưởng</span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-bold text-[#FF9F1C] drop-shadow-md" style={{ fontFamily: "var(--font-cherry)" }}>+{totalReward}</span>
              <span className="text-3xl filter drop-shadow-sm pb-1">🦴</span>
            </div>
            {(timeBonus > 0 || scoreBonus > 0) && <p className="text-xs font-bold text-orange-400 font-rounded">({rewardCoins} cơ bản + {timeBonus > 0 ? `${timeBonus} thời gian` : `${scoreBonus} điểm thưởng`})</p>}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button onClick={isWin ? onClose : onRestart} className="w-full h-14 text-white font-bold text-lg rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center" style={{ backgroundColor: currentConfig.buttonBg, borderColor: currentConfig.buttonBorder, }} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = currentConfig.buttonHoverBg)} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = currentConfig.buttonBg)}>
            {isWin ? currentConfig.primaryButtonText : <><RotateCcw className="mr-2 w-5 h-5" strokeWidth={3} /> {currentConfig.primaryButtonText}</>}
          </button>
          <button onClick={onClose} className="w-full h-12 bg-white border-2 border-zinc-200 hover:bg-zinc-50 text-zinc-500 font-bold rounded-2xl active:translate-y-1 transition-all flex items-center justify-center">
            <X className="mr-2 w-5 h-5" strokeWidth={3} /> Thoát
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
"use client";

import { motion } from "framer-motion";
import { Trophy, X, RefreshCw, Bone } from "lucide-react";

interface RhythmResultScreenProps {
  gameStatus: "win" | "gameover";
  score: number;
  maxCombo: number;
  rewards: { coins: number; exp: number };
  earnedCoins: number;
  initGame: () => void;
  onWin: () => void;
  onClose: () => void;
}

export function RhythmResultScreen({
  gameStatus,
  score,
  maxCombo,
  rewards,
  earnedCoins,
  initGame,
  onWin,
  onClose
}: RhythmResultScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 z-10">
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        className={`w-28 h-28 flex items-center justify-center rounded-[2rem] border-4 mb-6 shadow-md ${gameStatus === "win"
          ? "border-yellow-400 bg-yellow-50 text-yellow-500"
          : "border-red-400 bg-red-50 text-red-500"
          }`}
      >
        {gameStatus === "win" ? <Trophy size={60} /> : <X size={60} />}
      </motion.div>

      <h2
        className="text-4xl font-black mb-2"
        style={{
          fontFamily: "var(--font-cherry)",
          color: gameStatus === "win" ? "#FF9F1C" : "#E63946",
        }}
      >
        {gameStatus === "win" ? "CHIẾN THẮNG!" : "THUA CUỘC!"}
      </h2>
      <p className="font-rounded font-bold text-zinc-500 text-sm mb-8">
        {gameStatus === "win"
          ? "Bạn đã xuất sắc chinh phục bản nhạc cùng Shiba!"
          : "Đừng buồn, hãy thử lại để cải thiện điểm số nhé!"}
      </p>

      {/* Results Summary Box */}
      <div className="w-full bg-white border-4 border-[#FFE2D1] rounded-[2rem] p-5 shadow-sm flex flex-col gap-3 mb-8">
        <div className="flex justify-between items-center font-rounded font-bold text-amber-900 text-sm">
          <span>Điểm số:</span>
          <span className="text-lg font-black text-amber-900">{score}</span>
        </div>
        <div className="flex justify-between items-center font-rounded font-bold text-amber-900 text-sm">
          <span>Combo lớn nhất:</span>
          <span className="text-lg font-black text-amber-900">x{maxCombo}</span>
        </div>
        <div className="flex justify-between items-center font-rounded font-bold text-amber-900 text-sm border-t border-[#FFE2D1] pt-3">
          <span>Xương kiếm được:</span>
          <span className="text-lg font-black text-[#FF9F1C] flex items-center gap-1">
            + {gameStatus === "win" ? rewards.coins + earnedCoins : 0}
            <Bone size={16} className="text-[#FF9F1C] fill-[#FF9F1C]/20 rotate-45" />
          </span>
        </div>
      </div>

      {/* Buttons Area */}
      <div className="flex gap-4 w-full">
        <button
          onClick={initGame}
          className="flex-1 h-14 bg-[#FF9F1C] hover:bg-[#e68a00] text-white font-black text-lg rounded-[1.25rem] border-b-4 border-[#cc7a00] active:border-b-0 active:translate-y-1 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          <RefreshCw size={20} /> CHƠI LẠI
        </button>
        <button
          onClick={() => {
            if (gameStatus === "win") {
              onWin();
            } else {
              onClose();
            }
          }}
          className="flex-1 h-14 bg-white hover:bg-zinc-50 border-2 border-zinc-200 text-zinc-600 font-rounded font-bold text-lg rounded-[1.25rem] shadow-[0_3px_0_0_#e4e4e7] active:translate-y-1 active:shadow-[0_0_0_0_#e4e4e7] transition-all cursor-pointer"
        >
          VỀ BẢN ĐỒ
        </button>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Volume2, VolumeX, HelpCircle, X } from "lucide-react";

interface RhythmIdleScreenProps {
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  setShowTutorial: (val: boolean) => void;
  initGame: () => void;
  onClose: () => void;
}

export function RhythmIdleScreen({
  isMuted,
  setIsMuted,
  setShowTutorial,
  initGame,
  onClose
}: RhythmIdleScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-[3rem] p-8 w-full max-w-[340px] shadow-[0_16px_48px_rgba(255,159,28,0.08)] flex flex-col items-center justify-between min-h-[460px] relative text-center">

        {/* Top controls: Mute & Help */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 flex items-center justify-center bg-white/60 backdrop-blur-sm border border-[#FFE2D1]/40 rounded-xl shadow-sm text-amber-800 hover:text-amber-950 active:scale-95 transition-all cursor-pointer"
              title="Âm lượng BGM"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button
              onClick={() => setShowTutorial(true)}
              className="w-10 h-10 flex items-center justify-center bg-white/60 backdrop-blur-sm border border-[#FFE2D1]/40 rounded-xl shadow-sm text-amber-800 hover:text-amber-950 active:scale-95 transition-all cursor-pointer"
              title="Hướng dẫn"
            >
              <HelpCircle size={20} />
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white/60 backdrop-blur-sm border border-[#FFE2D1]/40 rounded-xl shadow-sm text-zinc-400 hover:text-zinc-600 active:scale-95 transition-all cursor-pointer"
            title="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mascot */}
        <div className="flex-1 flex flex-col items-center justify-center mt-12 mb-4">
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-32 h-32 relative"
          >
            <img
              src="/images/mascot/shiba_master.gif"
              alt="Shiba DJ"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </motion.div>
        </div>

        {/* Info and button */}
        <div className="w-full flex flex-col items-center space-y-4">
          <h2
            className="text-4xl text-amber-900 font-black tracking-wide"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            Nhịp Điệu Shiba
          </h2>
          <p className="font-rounded font-bold text-amber-800/70 text-xs max-w-xs leading-relaxed">
            Luyện thính giác nhạy bén, gõ phím bắt đúng phách nhạc để cùng Shiba vượt ải!
          </p>

          <button
            onClick={initGame}
            className="w-full max-w-[220px] py-3.5 rounded-2xl font-black text-xl transition-all active:translate-y-1 active:shadow-[0_2px_0_0_#cc7a00] bg-gradient-to-r from-[#FF9F1C] to-[#FFBF69] border-2 border-white/20 text-white shadow-[0_6px_0_0_#cc7a00] hover:brightness-105 cursor-pointer select-none"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            VÀO CHƠI
          </button>
        </div>

      </div>
    </div>
  );
}

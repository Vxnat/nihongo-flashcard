"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Volume2, ZoomIn, Star } from "lucide-react";
import { GACHA_POOL, MemeItem } from "@/constants/gachaPool";
import { useAppStore } from "@/store/useAppStore";

interface MemeGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemeGalleryModal({ isOpen, onClose }: MemeGalleryModalProps) {
  const unlockedMemes = useAppStore((state) => state.userStats.unlockedMemes || []);
  const memeItems = GACHA_POOL.filter((item) => item.type === "meme") as MemeItem[];

  const [selectedMeme, setSelectedMeme] = useState<MemeItem | null>(null);

  // Phát âm tiếng Nhật sử dụng SpeechSynthesis chuẩn của trình duyệt
  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Tắt giọng cũ đang đọc dở
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.85; // Đọc chậm một chút để dễ nghe
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-[#FFFDF5] border-4 border-[#FBC579] rounded-[2.5rem] p-6 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl relative cursor-default overflow-hidden"
            style={{ fontFamily: "var(--font-cherry)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dải sáng holo lướt nhẹ qua khung */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)",
                backgroundSize: "250% 250%",
              }}
              animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            {/* Nút Đóng */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-[#FFE7C6] hover:bg-[#FFD9A8] text-[#C85A28] rounded-full transition-colors border-2 border-white shadow-sm z-20"
            >
              <X size={18} strokeWidth={3} />
            </button>

            {/* Tiêu đề */}
            <div className="text-center mb-6 relative z-10 flex flex-col items-center">
              <div className="relative">
                <h3
                  className="text-3xl text-[#C85A28] tracking-wide"
                  style={{ textShadow: "0 0 10px rgba(200,90,40,0.25), 0 2px 0 #fff" }}
                >
                  Bộ Sưu Tập Meme
                </h3>
                <Star className="w-4 h-4 text-[#FFD166] fill-[#FFD166] absolute -top-2 -left-6 animate-pulse" />
                <Star className="w-4 h-4 text-[#E8743B] fill-[#E8743B] absolute -bottom-2 -right-6 animate-bounce" />
              </div>
              <p className="text-xs text-zinc-500 font-sans font-bold mt-1">
                Thu thập các meme học tiếng Nhật siêu mặn từ máy Gacha! 🦴
              </p>
            </div>

            {/* Danh sách Grid Meme */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-4 pb-2 relative z-10">
              {memeItems.map((meme) => {
                const isUnlocked = unlockedMemes.includes(meme.id);
                return (
                  <div
                    key={meme.id}
                    onClick={() => isUnlocked && setSelectedMeme(meme)}
                    className={`aspect-square rounded-3xl border-2 overflow-hidden relative shadow-sm transition-all duration-300 ${
                      isUnlocked
                        ? "border-[#FBC579] bg-[#FFF8EE] hover:scale-105 active:scale-95 cursor-pointer hover:shadow-md"
                        : "border-zinc-200 bg-zinc-100"
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <img
                          src={meme.imageUrl}
                          alt={meme.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Kính lúp hiển thị ảnh to */}
                        <div className="absolute top-2 right-2 w-6 h-6 bg-black/40 text-white rounded-full flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn size={12} />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 text-left">
                          <p className="text-white text-xs font-sans font-bold truncate">
                            {meme.name}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-1.5 p-4 text-center">
                        <Lock size={20} className="stroke-[2.5]" />
                        <span className="text-[10px] font-sans font-black tracking-wider text-zinc-400 uppercase">
                          CẦN MẢNH
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* MODAL XEM CHI TIẾT MEME ĐÃ MỞ KHÓA */}
      <AnimatePresence>
        {selectedMeme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer"
            onClick={() => setSelectedMeme(null)}
          >
            <motion.div
              initial={{ scale: 0.9, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.9, rotate: 2, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white border-8 border-white rounded-[2.5rem] p-5 max-w-sm w-full shadow-2xl relative cursor-default flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Nút đóng ảnh chi tiết */}
              <button
                onClick={() => setSelectedMeme(null)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-[#FFE7C6] hover:bg-[#FFD9A8] text-[#C85A28] rounded-full transition-colors border-2 border-white shadow-sm z-20"
              >
                <X size={18} strokeWidth={3} />
              </button>

              {/* Polaroid Photo Frame */}
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 relative shadow-inner mb-4">
                <img
                  src={selectedMeme.imageUrl}
                  alt={selectedMeme.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Japanese Point Study Card */}
              <div className="w-full bg-[#FFF8EE] border-2 border-[#FDD49A] rounded-2xl p-4 text-center font-sans">
                <h4 className="text-[#C85A28] font-bold text-xs uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-cherry)" }}>
                  💡 Điểm Tiếng Nhật
                </h4>
                
                {/* Từ vựng có phát âm */}
                <div 
                  onClick={(e) => handleSpeak(e, selectedMeme.japanesePoint.word)}
                  className="flex items-center justify-center gap-2 bg-[#FEEFD8] active:bg-[#FDD49A] px-3 py-2 rounded-xl border border-[#FBC579] text-[#7A3E18] font-bold text-base cursor-pointer transition-colors mb-2 inline-flex"
                >
                  <span>{selectedMeme.japanesePoint.word}</span>
                  <Volume2 size={16} className="text-[#C85A28]" />
                </div>

                <div className="text-zinc-700 font-bold text-sm mb-3">
                  {selectedMeme.japanesePoint.meaning}
                </div>

                <div className="text-left bg-white/70 border border-[#FEEFD8] rounded-xl p-2.5 text-xs text-zinc-600 leading-relaxed font-bold">
                  {selectedMeme.japanesePoint.grammarNote}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

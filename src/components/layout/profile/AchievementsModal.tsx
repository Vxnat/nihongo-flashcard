"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles } from "lucide-react";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shelfRows: any[][];
  isMetadataLoaded: boolean;
}

export function AchievementsModal({
  isOpen,
  onClose,
  shelfRows,
  isMetadataLoaded,
}: AchievementsModalProps) {
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const earnedCount = shelfRows.flat().filter(a => a.condition).length;
  const totalCount = shelfRows.flat().length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Cupboard Box container */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFDF9] border-4 border-[#FFE2D1] rounded-[2.5rem] p-6 shadow-2xl text-left max-w-sm sm:max-w-md w-full relative z-10 flex flex-col gap-4 max-h-[85vh] overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#8C5E43] hover:text-[#5C3A21] transition-colors p-1.5 bg-[#FAF6EF] border border-[#FFE2D1] rounded-full cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header info */}
            <div className="flex justify-between items-center mt-2 pr-6 mb-1">
              <h3
                className="text-2xl text-zinc-700 font-black"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Kệ Trưng Bày
              </h3>
              <span className="font-rounded font-black text-[10px] text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full shrink-0">
                Đã đạt: {earnedCount}/{totalCount}
              </span>
            </div>

            {/* Physical Wood Shelf cabinet box */}
            <div className="flex-1 overflow-y-auto bg-[#593116] border-8 border-[#8C5226] rounded-[2rem] p-4 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5),_0_10px_20px_rgba(0,0,0,0.15)] flex flex-col gap-5 relative scrollbar-thin max-h-[50vh]">
              {!isMetadataLoaded ? (
                <div className="grid grid-cols-3 gap-6 pt-4 pb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                      <div className="w-14 h-14 rounded-full bg-amber-950/60 border-4 border-amber-900" />
                      <div className="h-3 w-16 bg-amber-950/40 rounded mt-1" />
                    </div>
                  ))}
                </div>
              ) : shelfRows.length === 0 ? (
                <div className="py-8 text-center text-amber-100/50 font-rounded font-bold text-sm">
                  Chưa có danh hiệu nào trên kệ!
                </div>
              ) : (
                shelfRows.map((row, rowIdx) => (
                  <div key={rowIdx} className="relative w-full flex flex-col gap-1 mt-4 first:mt-2">
                    {/* Grid shelf items */}
                    <div className="grid grid-cols-3 gap-5 px-1 relative z-10">
                      {row.map((ach) => (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedBadge(ach)}
                          key={ach.id}
                          className="flex flex-col items-center justify-center cursor-pointer relative group"
                        >
                          <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-md border-4 bg-zinc-50 relative overflow-hidden transition-all duration-300
                              ${ach.condition
                                ? "border-amber-400 shadow-amber-950/80 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.8)]"
                                : "border-amber-900 grayscale opacity-45 contrast-75 group-hover:grayscale-0 group-hover:opacity-100"
                              }`}
                          >
                            <img
                              src={ach.imageUrl || "/images/ui/badges/default.png"}
                              alt={ach.title}
                              className="w-full h-full object-cover"
                            />
                            {ach.condition && (
                              <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-white rounded-full p-0.5 border border-white z-10 shadow-sm scale-90">
                                <Check size={8} strokeWidth={5} />
                              </span>
                            )}
                          </div>

                          <h4 className="font-rounded font-black text-[9px] text-amber-100/90 text-center mt-2.5 truncate max-w-full group-hover:text-yellow-300 transition-colors">
                            {ach.title}
                          </h4>
                        </motion.div>
                      ))}
                    </div>

                    {/* Horizontal Wooden Plank */}
                    <div className="w-full h-4.5 rounded-full bg-gradient-to-b from-[#C68A4C] to-[#804E1E] border-b-[4px] border-[#5A330F] shadow-md -mt-1 relative z-0" />
                  </div>
                ))
              )}
            </div>

            <button
              onClick={onClose}
              className="mt-2 w-full py-3 bg-[#FF9F1C] hover:bg-[#E08A12] text-white font-black font-rounded text-sm rounded-2xl border-b-4 border-[#C77A0F] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-sm"
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              Đóng
            </button>
          </motion.div>
        </div>
      )}

      {/* SINGLE BADGE DETAIL MODAL overlay */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[#FFFDF9] border-[6px] border-[#FFE2D1] rounded-[2.5rem] p-6 shadow-2xl text-center max-w-xs sm:max-w-sm w-full relative z-[130] overflow-hidden flex flex-col items-center gap-4"
            >
              <div className="absolute top-3 left-3 text-[#FFB84D] animate-bounce">
                <Sparkles className="w-5 h-5 fill-[#FFB84D]" />
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors p-1 bg-zinc-100 hover:bg-zinc-200 rounded-full cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="font-rounded font-black text-[9px] text-[#A06C30] uppercase tracking-widest bg-[#FFF2E6] border border-[#FFD166] px-3 py-1 rounded-full mt-2">
                Huy hiệu Danh giá
              </span>

              <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg border-4 border-white bg-zinc-50 relative overflow-hidden mt-2 ${selectedBadge.condition ? "" : "grayscale opacity-50"}`}>
                <img
                  src={selectedBadge.imageUrl || "/images/ui/badges/default.png"}
                  alt={selectedBadge.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl text-[#5C3A21] font-black" style={{ fontFamily: "var(--font-cherry)" }}>
                  {selectedBadge.title}
                </h3>
                <p className="text-xs text-zinc-500 font-rounded font-bold leading-relaxed px-4">
                  {selectedBadge.desc}
                </p>
              </div>

              <div className="w-full bg-[#FAF0D7]/40 border border-[#FFE2D1] p-3.5 rounded-2xl space-y-2.5 mt-1 text-left">
                <div className="flex justify-between items-center text-xs font-rounded font-bold text-[#8C5E43]">
                  <span>Yêu cầu đạt mốc:</span>
                  <span className="bg-[#FAF0D7] px-2 py-0.5 rounded-full text-[9px] font-black">
                    {selectedBadge.progressText}
                  </span>
                </div>

                {/* Progress bar */}
                {(() => {
                  const target = selectedBadge.targetValue || 1;
                  const current = selectedBadge.userValue || 0;
                  const ratio = Math.min(100, (current / target) * 100);
                  return (
                    <div className="h-3 w-full bg-[#EFE5CC] rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-[#DCA842] to-[#B07E2A]"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  );
                })()}
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="mt-2 w-full py-3 bg-[#FF9F1C] hover:bg-[#E08A12] text-white font-black font-rounded text-sm rounded-2xl border-b-4 border-[#C77A0F] active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Đồng ý
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar } from "lucide-react";

interface WeeklyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekDays: any[];
}

export function WeeklyLogModal({
  isOpen,
  onClose,
  weekDays,
}: WeeklyLogModalProps) {
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

          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFDF9] border-4 border-[#FFE2D1] rounded-[2.5rem] p-6 shadow-2xl text-left max-w-sm sm:max-w-md w-full relative z-10 flex flex-col gap-4 overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#8C5E43] hover:text-[#5C3A21] transition-colors p-1.5 bg-[#FAF6EF] border border-[#FFE2D1] rounded-full cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-1 mt-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2 mx-auto border-2 border-orange-200">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
              <h3
                className="text-2xl text-zinc-700 font-black"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Nhật Ký Tuần
              </h3>
              <p className="font-rounded text-zinc-500 font-bold text-xs mt-2 px-4 leading-relaxed">
                Nhật ký thời gian học tập trong tuần của bạn. Học đều đặn mỗi ngày để xây dựng thói quen tốt nhé! 🐾
              </p>
            </div>

            {/* Weekly Days List */}
            <div className="bg-[#FFFDF9] border-2 border-[#FFE2D1]/60 rounded-2xl p-4 flex flex-col gap-3 shadow-inner">
              <p className="text-center font-rounded font-black text-[10px] text-amber-900/50 uppercase tracking-widest">
                Lịch sử tuần hiện tại
              </p>
              
              <div className="grid grid-cols-7 gap-1.5 py-1">
                {weekDays.map((day) => {
                  let shibaGif = "/images/mascot/mascot-sleep.gif";
                  let bgClass = "bg-zinc-50 border-zinc-200 text-zinc-400";

                  if (day.isFuture) {
                    shibaGif = "/images/mascot/mascot-sleep.gif";
                    bgClass = "bg-zinc-50/40 border-zinc-100 text-zinc-300";
                  } else if (day.isCompleted) {
                    shibaGif = "/images/mascot/mascot-success.gif";
                    bgClass = "bg-[#F0FAF5] border-[#A0E8D5] text-emerald-700 shadow-[0_4px_0_0_#A0E8D5]";
                  } else {
                    shibaGif = "/images/mascot/mascot-fail.gif";
                    bgClass = day.isToday
                      ? "bg-zinc-100 border-[#FFE2D1] text-zinc-500 animate-pulse border-dashed border-4"
                      : "bg-zinc-100 border-zinc-300 text-zinc-400";
                  }

                  return (
                    <div
                      key={day.dateStr}
                      className={`flex flex-col items-center py-2 px-0.5 rounded-xl border text-center transition-all ${bgClass} ${day.isToday ? "scale-[1.03] relative z-10" : ""}`}
                    >
                      <span className="font-rounded font-black text-[9px] sm:text-[10px] uppercase tracking-tight">
                        {day.name}
                      </span>
                      <div className="w-8 h-8 my-1 select-none pointer-events-none flex items-center justify-center">
                        <img src={shibaGif} alt="Shiba Status" className="w-full h-full object-contain" />
                      </div>
                      <span className="font-rounded font-black text-[8px] sm:text-[9px] truncate max-w-full">
                        {day.isFuture ? "-" : `${Math.floor(day.timeStudied / 60)}m`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-2 w-full py-3 bg-[#FF9F1C] hover:bg-[#E08A12] text-white font-black font-rounded text-sm rounded-2xl border-b-4 border-[#C77A0F] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-sm"
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              Đồng ý
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

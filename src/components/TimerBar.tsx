import React from "react";
import { motion } from "framer-motion";
import { Timer } from "lucide-react";

interface TimerBarProps {
  progressPercent: number;
  timeLeft: number;
}

export function TimerBar({ progressPercent, timeLeft }: TimerBarProps) {
  const barColor =
    progressPercent > 50
      ? "bg-teal-400"
      : progressPercent > 20
      ? "bg-yellow-400"
      : "bg-red-500";

  return (
    <div className="w-full flex items-center gap-2 sm:gap-3 px-4">
      <div className="p-2 bg-white/80 rounded-full shadow-inner border-2 border-white">
        <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-500" />
      </div>
      <div className="flex-1 h-5 sm:h-6 bg-black/10 rounded-full shadow-inner p-1 border-2 border-white">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          style={{ originX: 0 }}
          initial={{ width: "100%" }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        />
      </div>
      <div
        className="w-16 text-center font-cherry text-2xl sm:text-3xl text-zinc-600 drop-shadow-sm"
        style={{ fontFamily: "var(--font-cherry)" }}
      >
        {timeLeft}
      </div>
    </div>
  );
}
import React from "react";
import { motion } from "framer-motion";

interface HintButtonProps {
  icon: React.ReactNode;
  label: string;
  costLabel: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  countdownPercent?: number; // 0-100 for progress bar
  className?: string;
}

export function HintButton({
  icon,
  label,
  costLabel,
  onClick,
  isActive = false,
  disabled = false,
  countdownPercent,
  className = "",
}: HintButtonProps) {
  const isCountdown = typeof countdownPercent === "number";

  const baseBg = "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50";
  const activeBg = "bg-yellow-400 border-yellow-500 text-yellow-900 shadow-yellow-600/50";
  const disabledBg = "bg-zinc-200 border-zinc-300 text-zinc-400 cursor-not-allowed";

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isCountdown}
      className={`relative flex items-center justify-center gap-2 px-4 py-2 rounded-full font-bold border-b-4 shadow-sm transition-all duration-150 overflow-hidden
        ${disabled ? disabledBg : isActive ? activeBg : baseBg}
        ${isCountdown ? "cursor-wait" : "active:translate-y-0.5 active:border-b-2"}
        ${className}
      `}
      style={{ fontFamily: "var(--font-cherry)" }}
      whileTap={!disabled && !isCountdown ? { scale: 0.97 } : {}}
    >
      {/* Thanh tiến trình đếm ngược */}
      {isCountdown && (
        <motion.div
          className="absolute inset-0 bg-teal-400/60 origin-left"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: countdownPercent / 100 }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      )}

      <div className="relative z-10">{icon}</div>
      <div className="relative flex flex-col items-start leading-tight z-10">
        <span className="text-sm">{label}</span>
        <div className="text-xs font-rounded font-bold opacity-80 flex items-center gap-1">
          {costLabel}
        </div>
      </div>
    </motion.button>
  );
}
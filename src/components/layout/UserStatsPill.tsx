"use client";

import React from "react";
import { useUserStats } from "@/hooks/common/useUserStats";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { CoinIcon } from "../common/CoinIcon";

interface UserStatsPillProps {
  onTabChange: (tab: "journey" | "custom" | "shop" | "room" | "profile") => void;
}

export function UserStatsPill({ onTabChange }: UserStatsPillProps) {
  const { stats } = useUserStats();

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => onTabChange("profile")}
      className="fixed top-4 left-4 z-[50] flex items-center gap-3 bg-white/90 backdrop-blur-sm px-4 py-2 border-2 border-[#FFE2D1] rounded-full shadow-sm cursor-pointer hover:bg-white hover:scale-105 active:scale-95 transition-all select-none"
      title="Xem Hồ sơ & Thành tích học tập!"
      style={{ fontFamily: "var(--font-cherry)" }}
    >
      {/* 1. Streak */}
      <div className="flex items-center gap-1.5">
        <Flame
          className={`w-5 h-5 ${stats.streak > 0 ? "text-[#FF9F1C] fill-[#FF9F1C]" : "text-zinc-300"}`}
          style={stats.streak > 0 ? { filter: "drop-shadow(0 2px 4px rgba(255, 159, 28, 0.4))" } : {}}
        />
        <span className={`font-rounded font-black text-sm ${stats.streak > 0 ? "text-[#FF9F1C]" : "text-zinc-400"}`}>
          {stats.streak}
        </span>
      </div>

      <div className="w-px h-4 bg-zinc-200" />

      {/* 2. Coins */}
      <div className="flex items-center gap-1.5">
        <CoinIcon />
        <span className="font-rounded font-black text-sm text-amber-700/80">
          {stats.coins || 0}
        </span>
      </div>
    </motion.div>
  );
}
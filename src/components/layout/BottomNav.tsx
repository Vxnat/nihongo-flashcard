"use client";

import React from "react";
import { motion } from "framer-motion";

interface BottomNavProps {
  activeTab: "journey" | "custom" | "shop" | "room" | "profile";
  handleTabChange: (tab: "journey" | "custom" | "shop" | "room" | "profile") => void;
}

export function BottomNav({ activeTab, handleTabChange }: BottomNavProps) {
  const tabs = [
    {
      id: "journey" as const,
      label: "Trang chủ",
      iconSrc: "/images/ui/nav/nav-journey.png", // Shiba mascot head
    },
    {
      id: "custom" as const,
      label: "Bài học",
      iconSrc: "/images/ui/nav/nav-lessons.png", // Book
    },
    {
      id: "room" as const,
      label: "Căn phòng",
      iconSrc: "/images/ui/nav/nav-practice.png", // Practice pad
    },
    {
      id: "shop" as const,
      label: "Cửa hàng",
      iconSrc: "/images/ui/nav/nav-community.png", // Speech bubble
    },
    {
      id: "profile" as const,
      label: "Hồ sơ",
      iconSrc: "/images/ui/nav/nav-profile.png", // User profile
    },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl bg-white rounded-t-[2rem] border-t-4 border-[#FFE2D1] shadow-[0_-8px_30px_rgba(0,0,0,0.05)] px-4 pt-2.5 pb-3 sm:pb-5 flex justify-around items-center select-none"

    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            whileTap={{ y: 2 }}
            className="flex flex-col items-center justify-center flex-1 py-1 tap-highlight-transparent cursor-pointer relative"
          >
            {/* Thanh border nhỏ nằm phía trên active tab (nằm đè lên viền của BottomNav) */}
            {isActive && (
              <motion.div
                layoutId="active-nav-top-border"
                className="absolute top-[-14px] left-1/2 -translate-x-1/2 w-12 h-1.5 bg-[#A0E8D5] rounded-full z-20"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            {/* Hình tròn nền của Icon khi Active */}
            <div className="w-11 h-11 relative flex items-center justify-center mb-1">
              {isActive && (
                <motion.div
                  layoutId="active-nav-circle"
                  className="absolute inset-0 rounded-full bg-[#A0E8D5] border-2 border-teal-800/10 shadow-[0_4px_0_0_#75CBB2]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center">
                <img
                  src={tab.iconSrc}
                  alt={tab.label}
                  className={`w-7 h-7 sm:w-8 sm:h-8 object-contain select-none transition-all duration-200 ${isActive ? "scale-105" : "opacity-75 hover:opacity-100"
                    }`}
                  draggable={false}
                />
              </div>
            </div>

            {/* Chữ hiển thị dưới Icon */}
            <span
              className={`text-[10px] sm:text-xs transition-colors duration-200 whitespace-nowrap font-black uppercase tracking-wider ${isActive ? "text-zinc-800 font-extrabold" : "text-zinc-400 font-medium"
                }`}
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

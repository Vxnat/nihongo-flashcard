"use client";

import { motion } from "framer-motion";

interface BottomNavProps {
  activeTab: "journey" | "custom" | "shop";
  handleTabChange: (tab: "journey" | "custom" | "shop") => void;
}

export function BottomNav({ activeTab, handleTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-[400px] md:max-w-[450px]">
      <div className="flex bg-white/95 backdrop-blur-md border-4 border-[#FFE2D1] p-1.5 sm:p-2 rounded-[2rem] shadow-[0_6px_0_0_#FFE2D1] sm:shadow-[0_8px_0_0_#FFE2D1] justify-between items-center relative">
        {[
          {
            id: "journey",
            icon: "🗺️",
            label: "Hành trình",
            color: "#FFD166",
            shadow: "#e6bc5c",
            text: "text-amber-900",
          },
          {
            id: "custom",
            icon: "🎒",
            label: "Kho thẻ",
            color: "#5390D9",
            shadow: "#4a81c3",
            text: "text-white",
          },
          {
            id: "shop",
            icon: "🏪",
            label: "Cửa hàng",
            color: "#FF7096",
            shadow: "#C7486B",
            text: "text-white",
          },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 tap-highlight-transparent cursor-pointer"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-bubble"
                  className="absolute inset-0 rounded-[1.5rem] z-0"
                  style={{
                    backgroundColor: tab.color,
                    boxShadow: `0 4px 0 0 ${tab.shadow}`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
              <motion.div
                className="relative z-10 flex flex-col items-center justify-center h-full"
                animate={{ y: isActive ? -2 : 0 }}
              >
                <span className="text-xl sm:text-2xl drop-shadow-sm">{tab.icon}</span>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider mt-0.5 sm:mt-1 ${tab.text} whitespace-nowrap`}
                    style={{ fontFamily: "var(--font-rounded)" }}
                  >
                    {tab.label}
                  </motion.span>
                )}
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { Sparkles } from "lucide-react";
import { SystemRoadmap } from "@/components/SystemRoadmap";
import { GachaShop } from "@/components/GachaShop";
import { motion, AnimatePresence } from "framer-motion";
import { UserStatsPill } from "@/components/UserStatsPill";
import { AuthButton } from "@/components/AuthButton";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { useHome } from "@/hooks/useHome";
import { CustomDecksTab } from "@/components/CustomDecksTab";
import { BottomNav } from "@/components/BottomNav";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { VisualNovelMode } from "../../VisualNovelMode";
import { useAppStore } from "@/store/useAppStore";

export default function Home() {
  const homeState = useHome();
  const pwaState = usePwaInstall();
  const { activeTab, handleTabChange } = homeState;
  const activeStoryId = useAppStore((state) => state.activeStoryId);

  return (
    <div className="w-full flex flex-col items-center pb-32 relative">
      {/* VIÊN THUỐC TRẠNG THÁI LUÔN LƠ LỬNG */}
      <UserStatsPill />

      {/* COMPONENT ĐĂNG NHẬP (GÓC TRÊN PHẢI) */}
      <AuthButton />

      {/* TIÊU ĐỀ APP */}
      <div className="text-center mb-6 space-y-4 pt-20 md:pt-12 relative">
        <h1
          className="text-5xl md:text-6xl text-[#FF7096] tracking-wider drop-shadow-sm"
          style={{ fontFamily: "var(--font-cherry)" }} // Áp dụng font Cherry Bomb siêu cute
        >
          Flashcard
          <Sparkles
            className="inline-block w-8 h-8 ml-2 mb-4 text-[#FFD166]"
            fill="#FFD166"
          />
        </h1>
        <p
          className="font-rounded text-zinc-500 font-bold tracking-wide text-sm md:text-base bg-white px-4 py-1.5 rounded-full border-2 border-zinc-200 inline-block shadow-sm"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          Chọn lộ trình để bắt đầu học nhé! ﾉ*:･ﾟ✧
        </p>
      </div>

      {/* NỘI DUNG TỪNG TAB */}
      <AnimatePresence mode="wait">
        {/* TAB 1: BẢN ĐỒ HÀNH TRÌNH */}
        {activeTab === "journey" && (
          <motion.div
            key="journey-tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col items-center justify-center max-w-2xl px-4"
          >
            <SystemRoadmap />
          </motion.div>
        )}

        {/* TAB 2: KHO THẺ CÁ NHÂN */}
        {activeTab === "custom" && (
          <motion.div
            key="custom-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col items-center justify-center max-w-2xl px-4"
          >
            <CustomDecksTab homeState={homeState} />
          </motion.div>
        )}

        {/* TAB 3: CỬA HÀNG GACHA */}
        {activeTab === "shop" && (
          <motion.div
            key="shop-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col items-center justify-center max-w-2xl px-4"
          >
            <GachaShop />
          </motion.div>
        )}
      </AnimatePresence>

      <PwaInstallPrompt pwaState={pwaState} />
      <BottomNav activeTab={activeTab} handleTabChange={handleTabChange} />

      {/* MÀN HÌNH VISUAL NOVEL OVERLAY (FULL SCREEN) */}
      <AnimatePresence>
        {activeStoryId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center sm:p-4"
          >
            <VisualNovelMode />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

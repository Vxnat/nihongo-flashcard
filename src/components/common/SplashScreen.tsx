"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { playSFX } from "@/utils/sfx";

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const [interactionNeeded, setInteractionNeeded] = useState(false);

  useEffect(() => {
    const audio = new Audio("/sounds/splash.mp3");
    audio.volume = 0.3;

    audio
      .play()
      .then(() => {
        // Nếu trình duyệt cho phép tự phát (VD: Đã cài PWA) -> Tự đóng sau 1.5s
        setTimeout(() => setShow(false), 1500);
      })
      .catch(() => {
        // Nếu trình duyệt chặn (Chính sách Autoplay) -> Đợi người dùng chạm
        setInteractionNeeded(true);
      });
  }, []);

  const handleTapToStart = () => {
    if (!interactionNeeded) return;
    playSFX("splash");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          onClick={handleTapToStart}
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.5, ease: "easeInOut" },
          }}
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FDFBF7] ${interactionNeeded ? "cursor-pointer" : ""}`}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex flex-col items-center"
          >
            <div className="w-28 h-28 bg-[#FF7096] rounded-[2rem] rotate-12 flex items-center justify-center shadow-[0_8px_0_0_#C7486B] mb-8 border-4 border-white">
              <span
                className="text-6xl text-white -rotate-12 font-bold"
                style={{ fontFamily: "var(--font-rounded)" }}
              >
                あ
              </span>
            </div>
            <h1
              className="text-3xl text-[#FF7096] tracking-wider flex items-center gap-2 drop-shadow-sm"
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              Shiba Town
              <Sparkles className="w-6 h-6 text-[#FFD166]" fill="#FFD166" />
            </h1>

            {/* Dòng chữ nhấp nháy báo hiệu cần chạm vào màn hình */}
            {interactionNeeded && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  repeatType: "reverse",
                }}
                className="mt-8 font-rounded font-bold text-zinc-400 text-sm tracking-wide"
              >
                Chạm vào màn hình để bắt đầu ✨
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

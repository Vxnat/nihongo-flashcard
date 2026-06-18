"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface BonkEffectProps {
  x: number;
  y: number;
}

export function BonkEffect({ x, y }: BonkEffectProps) {
  const [isHitting, setIsHitting] = useState(false);

  useEffect(() => {
    // Đổi hình ảnh từ giơ búa sang đập búa sau 50ms tạo cảm giác dập mạnh
    const timer = setTimeout(() => setIsHitting(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="absolute z-50 pointer-events-none flex justify-center items-end"
      style={{
        left: `${x}vw`,
        top: `${y}vh`,
        transform: "translate(-50%, -80%)",
        width: "120px",
        height: "120px",
      }}
    >
      <img
        src={isHitting ? "/images/shiba_hammer_down.png" : "/images/shiba_hammer_up.png"}
        alt="Bonk!"
        className="w-full h-full object-contain drop-shadow-xl"
      />
    </motion.div>
  );
}
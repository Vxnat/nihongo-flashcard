import React from "react";
import { motion } from "framer-motion";

interface VNCharacterProps {
  characterId: string;
  emotion: string;
}

export function VNCharacter({ characterId, emotion }: VNCharacterProps) {
  // Mock Sprite (Thay thế bằng <img> thật khi bạn có ảnh)
  const getPlaceholderSprite = () => {
    const colors: Record<string, string> = {
      mascot: "#FF9F1C",
      stranger: "#5390D9",
    };
    const emojis: Record<string, string> = {
      happy: "😄",
      idle: "😐",
      success: "🎉",
      fail: "😭",
    };

    return (
      <div
        className="w-40 h-40 flex items-center justify-center rounded-full border-4 border-white shadow-[0_8px_0_0_rgba(0,0,0,0.1)] text-6xl"
        style={{ backgroundColor: colors[characterId] || "#ccc" }}
      >
        {emojis[emotion] || "🙂"}
      </div>
    );
  };

  return (
    <motion.div
      key={`${characterId}-${emotion}`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.6, duration: 0.5 }}
      className="relative z-10 drop-shadow-xl"
    >
      {getPlaceholderSprite()}
    </motion.div>
  );
}
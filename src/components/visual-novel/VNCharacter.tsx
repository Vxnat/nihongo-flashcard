import React from "react";
import { motion } from "framer-motion";

interface VNCharacterProps {
  characterId: string;
  emotion: string;
  position?: "left" | "right";
  spriteUrl?: string;
  isSpeaking?: boolean;
}

export function VNCharacter({
  characterId,
  emotion,
  position = "right",
  spriteUrl,
  isSpeaking = true,
}: VNCharacterProps) {
  // Loại bỏ các emoji trong getPlaceholderSprite để tuân thủ luật "Cấm chèn emoji"
  const getPlaceholderSprite = () => {
    const colors: Record<string, string> = {
      mascot: "#FF9F1C",
      stranger: "#5390D9",
      nam: "#06D6A0",
      npc: "#5390D9",
    };
    // Thay thế emoji bằng nhãn chữ đơn giản, sang trọng
    const emotionLabels: Record<string, string> = {
      happy: "VUI",
      idle: "TINH",
      success: "THANG",
      fail: "THUA",
    };

    return (
      <div
        className="w-40 h-40 flex flex-col items-center justify-center rounded-full border-4 border-white shadow-[0_8px_0_0_rgba(0,0,0,0.1)] text-white font-black text-xl select-none"
        style={{ backgroundColor: colors[characterId] || "#ccc" }}
      >
        <span className="text-[10px] uppercase opacity-75 tracking-widest">{characterId}</span>
        <span className="text-xl mt-1 tracking-wider">{emotionLabels[emotion] || "OK"}</span>
      </div>
    );
  };

  const initialX = position === "left" ? -50 : 50;

  // Cấu hình rung lắc khi nhân vật giật mình/thất bại
  const shakeX = emotion === "fail" ? [0, -8, 8, -6, 6, -3, 3, 0] : [0];
  const shakeTransition = emotion === "fail"
    ? { duration: 0.5, times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1] }
    : { duration: 0.2 };

  return (
    // 1. Khung ngoài cùng: Xử lý hoạt ảnh trượt vào khi xuất hiện
    <motion.div
      key={`${characterId}-${emotion}`}
      initial={{ x: initialX, y: 20, opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
      className="relative z-10 drop-shadow-2xl"
    >
      {/* 2. Khung ở giữa: Xử lý độ mờ/kích thước tiêu điểm khi nói & hoạt ảnh rung lắc */}
      <motion.div
        animate={{
          scale: isSpeaking ? 1.03 : 0.97,
          opacity: isSpeaking ? 1.0 : 0.85,
          x: shakeX,
        }}
        transition={{
          scale: { type: "spring", stiffness: 300, damping: 20 },
          opacity: { duration: 0.2 },
          x: shakeTransition,
        }}
      >
        {/* 3. Khung trong cùng: Hoạt ảnh nhịp thở tự nhiên vô hạn */}
        <motion.div
          animate={{
            y: [0, -4, 0],
            scaleY: [1, 1.015, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {spriteUrl ? (
            <img
              src={spriteUrl}
              alt={`${characterId} - ${emotion}`}
              className="h-80 sm:h-90 w-auto object-contain pointer-events-none"
            />
          ) : (
            getPlaceholderSprite()
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

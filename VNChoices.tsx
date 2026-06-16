import React from "react";
import { motion } from "framer-motion";

interface Choice {
  text: string;
  isCorrect: boolean;
  nextNode: string;
}

interface VNChoicesProps {
  choices: Choice[];
  onSelect: (nextNodeId: string) => void;
}

export function VNChoices({ choices, onSelect }: VNChoicesProps) {
  if (!choices || choices.length === 0) return null;

  return (
    <div className="absolute top-[35%] left-0 right-0 z-30 flex flex-col items-center justify-center gap-4 px-6 pointer-events-none">
      {choices.map((choice, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.5, delay: index * 0.1 }}
          onClick={(e) => {
            e.stopPropagation(); // Tránh bị dính click xuyên xuống khung hình nền/chat
            onSelect(choice.nextNode);
          }}
          className="w-full max-w-[300px] pointer-events-auto bg-white border-4 border-[#5390D9] text-[#5390D9] font-bold text-lg py-3 px-6 rounded-2xl shadow-[0_6px_0_0_#5390D9] hover:-translate-y-1 hover:shadow-[0_8px_0_0_#5390D9] hover:bg-blue-50 active:translate-y-1 active:shadow-none transition-all"
        >
          {choice.text}
        </motion.button>
      ))}
    </div>
  );
}
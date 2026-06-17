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
    <div className="absolute top-[20%] inset-x-0 z-40 flex flex-col gap-6 px-4 pointer-events-none">
      {choices.map((choice, index) => {
        const isEven = index % 2 === 0;
        return (
          <motion.button
            key={index}
            initial={{ x: isEven ? -200 : 200, opacity: 0, skewX: -5 }}
            animate={{ x: 0, opacity: 1, skewX: -5 }}
            whileHover={{ skewX: 0, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              bounce: 0.4,
              duration: 0.5,
              delay: index * 0.1,
            }}
            onClick={(e) => {
              e.stopPropagation(); // Tránh bị dính click xuyên xuống khung hình nền/chat
              onSelect(choice.nextNode);
            }}
            className={`group pointer-events-auto relative w-[90%] max-w-[320px] bg-white border-4 border-zinc-800 text-zinc-800 font-black text-lg py-3 px-6 shadow-[4px_6px_0_0_rgba(39,39,42,1)] transition-colors
              ${isEven ? "self-start rounded-r-2xl rounded-l-md border-l-8 border-l-[#06D6A0]" : "self-end text-right rounded-l-2xl rounded-r-md border-r-8 border-r-[#FF9F1C]"}
              hover:bg-zinc-800 hover:text-white
            `}
          >
            <span className="block skew-x-[5deg] group-hover:skew-x-0 transition-transform">
              {choice.text}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

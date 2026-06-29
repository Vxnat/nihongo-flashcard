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
    <>
      {/* Lớp phủ tối mờ hậu cảnh để tập trung lựa chọn */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[1px] z-30 pointer-events-auto"
      />

      {/* Container chứa các nút lựa chọn */}
      <div className="absolute inset-x-0 top-[22%] z-40 flex flex-col gap-5 px-6 pointer-events-none">
        {choices.map((choice, index) => {
          const isEven = index % 2 === 0;
          return (
            <motion.button
              key={index}
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                delay: index * 0.08,
              }}
              onClick={(e) => {
                e.stopPropagation(); // Tránh click xuyên xuống khung cảnh phía sau
                onSelect(choice.nextNode);
              }}
              className={`group pointer-events-auto w-[92%] max-w-[320px] bg-white/90 backdrop-blur-md border border-white/50 text-zinc-800 font-extrabold text-[15px] py-4 px-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:bg-white hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] transition-all rounded-[1.25rem] text-center border-l-4
                ${isEven ? "self-start border-l-[#5390D9]" : "self-end border-l-[#06D6A0]"}
              `}
            >
              <span className="block transition-transform">
                {choice.text}
              </span>
            </motion.button>
          );
        })}
      </div>
    </>
  );
}

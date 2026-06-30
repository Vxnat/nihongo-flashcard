"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Map, RotateCcw, Flower } from "lucide-react";
import { useRouter } from "next/navigation";

interface EndScreenProps {
  onReview?: () => void;
}

function FallingSakura() {
  const [petals, setPetals] = useState<any[]>([]);

  useEffect(() => {
    const arr = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 4 + 4,
      delay: Math.random() * 4,
      size: Math.random() * 10 + 12,
      rotate: Math.random() * 360,
    }));
    setPetals(arr);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute text-pink-300 drop-shadow-sm"
          style={{ left: petal.left, top: "-10%", fontSize: petal.size }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
            rotate: [petal.rotate, petal.rotate + 360],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Flower size={petal.size} className="fill-pink-200 stroke-pink-300/40" />
        </motion.div>
      ))}
    </div>
  );
}

export function EndScreen({ onReview }: EndScreenProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center px-4 pt-10 relative w-full min-h-[500px]">
      <FallingSakura />
      <div className="relative z-10 w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm p-8 rounded-[3rem] border-4 border-[#FFD166] shadow-[0_12px_0_0_#FFD166] text-center flex flex-col items-center animate-in zoom-in-90 duration-500">
        <h2
          className="text-4xl text-[#FF9F1C] mb-2 leading-snug"
          style={{
            fontFamily: "var(--font-cherry)",
            filter: "drop-shadow(0px 3px 0px rgba(255, 209, 102, 1))",
          }}
        >
          Giỏi quá ta ơi!
        </h2>
        <p className="font-rounded font-bold text-amber-700 mb-8 text-lg">
          Bạn đã hoàn thành xuất sắc bộ bài này!
        </p>

        <div className="flex flex-col gap-3 w-full">
          {onReview && (
            <button
              onClick={onReview}
              className="w-full bg-[#FF7096] hover:bg-[#FF5C8A] text-white h-14 rounded-2xl font-bold text-xl border-b-4 border-[#C7486B] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center shadow-sm"
            >
              <RotateCcw className="w-6 h-6 mr-2" strokeWidth={3} /> Ôn tập lại
            </button>
          )}
          <button
            onClick={() => router.push("/")}
            className="w-full bg-[#06D6A0] hover:bg-[#05b889] text-white h-14 rounded-2xl font-bold text-xl border-b-4 border-[#048c68] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center shadow-sm"
          >
            <Map className="w-6 h-6 mr-2" strokeWidth={3} /> Tiếp tục Hành trình
          </button>
        </div>
      </div>
    </div>
  );
}

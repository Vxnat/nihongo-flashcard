"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function FallingSparkles() {
  const [sparkles, setSparkles] = useState<any[]>([]);
  
  useEffect(() => {
    const arr = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 4 + 6,
      delay: Math.random() * 5,
      size: Math.random() * 10 + 10,
    }));
    setSparkles(arr);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    >
      {sparkles.map((star) => (
        <motion.div key={star.id} className="absolute text-yellow-100/80 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" style={{ left: star.left, top: "-5%" }} animate={{ y: ["0vh", "110vh"], opacity: [0, 1, 0.8, 0], rotate: [0, 180] }} transition={{ duration: star.duration, delay: star.delay, repeat: Infinity, ease: "linear" }}>
          <span style={{ fontSize: star.size }}>✨</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
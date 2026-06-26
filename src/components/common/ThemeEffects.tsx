"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// ==========================================
// 1. SAKURA EFFECT (Falling Petals)
// ==========================================
export function SakuraEffect() {
  const [petals, setPetals] = useState<any[]>([]);

  useEffect(() => {
    // Generate 20 petals with random properties
    const newPetals = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 12,
      size: 10 + Math.random() * 14,
      rotateStart: Math.random() * 360,
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute rounded-full bg-gradient-to-tr from-[#FFB7B2] to-[#FFD1D1] opacity-75"
          style={{
            left: petal.left,
            top: -20,
            width: petal.size,
            height: petal.size * 0.7,
            borderRadius: "50% 0 50% 50%", // petal shape
          }}
          initial={{ y: -20, rotate: petal.rotateStart, x: 0 }}
          animate={{
            y: "105vh",
            x: [0, 50, -50, 20],
            rotate: [petal.rotateStart, petal.rotateStart + 360 * 2],
          }}
          transition={{
            duration: petal.duration,
            repeat: Infinity,
            delay: petal.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}


// ==========================================
// 3. DIVINE SHIBA EFFECT (Click Sparkles)
// ==========================================
interface Sparkle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  distance: number;
  size: number;
}

export function DivineShibaEffect() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    let sparkleId = 0;
    const handleClick = (e: MouseEvent) => {
      // Spawn 8 golden sparkles
      const newSparkles = Array.from({ length: 8 }).map(() => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 50;
        const size = 6 + Math.random() * 10;
        const colors = ["#FFD700", "#FFF8DC", "#DAA520", "#FFF5EE", "#FFDF00"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return {
          id: sparkleId++,
          x: e.clientX,
          y: e.clientY,
          color,
          angle,
          distance,
          size,
        };
      });

      setSparkles((prev) => [...prev, ...newSparkles]);
    };

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  // Cleanup old sparkles from memory
  useEffect(() => {
    if (sparkles.length > 50) {
      setSparkles((prev) => prev.slice(-30));
    }
  }, [sparkles]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {sparkles.map((sparkle) => {
          const targetX = Math.cos(sparkle.angle) * sparkle.distance;
          const targetY = Math.sin(sparkle.angle) * sparkle.distance;
          
          return (
            <motion.div
              key={sparkle.id}
              className="absolute"
              style={{
                left: sparkle.x,
                top: sparkle.y,
              }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: targetX,
                y: targetY,
                scale: [0, 1.2, 0.4, 0],
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
            >
              <svg
                width={sparkle.size}
                height={sparkle.size}
                viewBox="0 0 24 24"
                fill={sparkle.color}
                style={{
                  filter: `drop-shadow(0 0 4px ${sparkle.color})`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
              </svg>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

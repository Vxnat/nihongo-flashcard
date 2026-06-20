"use client";

import React, { useRef } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { FlashcardData } from "@/types/flashcard";
import { FlashcardFront } from "./FlashcardFront";
import { FlashcardBack } from "./FlashcardBack";
import { Frown, Smile } from "lucide-react";

interface SwipeCardProps {
  card: FlashcardData;
  isFlipped: boolean;
  onFlip: () => void;
  onSwipe: (direction: 'left' | 'right') => void;
  exitDir: 'left' | 'right' | 'none';
  showFurigana: boolean;
  isPodcastMode?: boolean;
  podcastIsPlaying?: boolean;
}

export function SwipeCard({ card, isFlipped, onFlip, onSwipe, exitDir, showFurigana, isPodcastMode, podcastIsPlaying }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  
  const opacityRight = useTransform(x, [30, 100], [0, 1]);
  const opacityLeft = useTransform(x, [-30, -100], [0, 1]);

  const isDragging = useRef(false);

  const handleDragEnd = (e: any, info: PanInfo) => {
    const threshold = 80; 
    if (info.offset.x > threshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      onSwipe('left');
    }
    setTimeout(() => isDragging.current = false, 150);
  };

  const cardVariants: any = {
    initial: { opacity: 0, scale: 0.8, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: (dir: string) => ({
      x: dir === 'right' ? 400 : dir === 'left' ? -400 : 0, 
      y: dir !== 'none' ? 100 : 0,
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.4, ease: "easeOut" }
    })
  };

  const customSadImg = "/images/ui/sad.png";
  const customHappyImg = "/images/ui/happy.png";

  return (
    <motion.div
      className="absolute inset-0 w-full h-full"
      style={{ x, y, rotate }}
      drag={!isPodcastMode}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} 
      dragElastic={0.8} 
      onDragStart={() => (isDragging.current = true)}
      onDragEnd={handleDragEnd}
      onTap={() => { if (!isDragging.current && !isPodcastMode) onFlip(); }}
      variants={cardVariants}
      custom={exitDir}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="absolute inset-0 z-20 touch-pan-y" />

      {isFlipped && (
        <>
          <motion.div className="absolute inset-0 z-10 bg-[#FF7096]/20 rounded-xl flex items-center justify-center pointer-events-none" style={{ opacity: opacityLeft }}>
            <div className="drop-shadow-2xl flex items-center justify-center">
              {customSadImg ? (
                <img src={customSadImg} alt="Quên" className="w-28 h-28 object-contain drop-shadow-md opacity-70" />
              ) : (
                <Frown size={120} strokeWidth={2.5} className="text-[#FF7096]" />
              )}
            </div>
          </motion.div>
          <motion.div className="absolute inset-0 z-10 bg-[#06D6A0]/20 rounded-xl flex items-center justify-center pointer-events-none" style={{ opacity: opacityRight }}>
            <div className="drop-shadow-2xl flex items-center justify-center">
              {customHappyImg ? (
                <img src={customHappyImg} alt="Nhớ" className="w-28 h-28 object-contain drop-shadow-md opacity-70" />
              ) : (
                <Smile size={120} strokeWidth={2.5} className="text-[#06D6A0]" />
              )}
            </div>
          </motion.div>
        </>
      )}

      {isPodcastMode && podcastIsPlaying && isFlipped && (
        <div className="absolute top-6 right-6 z-30 flex items-end gap-1 h-6">
          <motion.div className="w-1.5 bg-[#FF7096] rounded-full" animate={{ height: ["40%", "100%", "40%"] }} transition={{ repeat: Infinity, duration: 0.6 }} />
          <motion.div className="w-1.5 bg-[#FF7096] rounded-full" animate={{ height: ["80%", "30%", "80%"] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} />
          <motion.div className="w-1.5 bg-[#FF7096] rounded-full" animate={{ height: ["50%", "90%", "50%"] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.2 }} />
        </div>
      )}

      <motion.div
        className="w-full h-full relative pointer-events-none bg-transparent"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 25 }}
      >
        <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: "hidden" }}>
          <FlashcardFront card={card} />
        </div>
        <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <FlashcardBack card={card} showFurigana={showFurigana} />
        </div>
      </motion.div>
    </motion.div>
  );
}
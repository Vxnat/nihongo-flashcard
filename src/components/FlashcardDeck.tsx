"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, PanInfo, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { FlashcardData } from "@/types/flashcard";
import { FlashcardFront } from "./FlashcardFront";
import { FlashcardBack } from "./FlashcardBack";
import { playAudio } from "@/utils/tts";
import { RotateCcw } from "lucide-react";
import { ControlPanel } from "./ControlPanel";

// ==========================================
// COMPONENT CON: THẺ VUỐT (KẸO DẺO)
// ==========================================
interface SwipeCardProps {
  card: FlashcardData;
  isFlipped: boolean;
  onFlip: () => void;
  onSwipe: (direction: 'left' | 'right') => void;
  exitDir: 'left' | 'right' | 'none';
}

function SwipeCard({ card, isFlipped, onFlip, onSwipe, exitDir }: SwipeCardProps) {
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

  return (
    <motion.div
      className="absolute inset-0 w-full h-full"
      style={{ x, y, rotate }}
      drag 
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} 
      dragElastic={0.8} 
      onDragStart={() => (isDragging.current = true)}
      onDragEnd={handleDragEnd}
      onTap={() => { if (!isDragging.current) onFlip(); }}
      
      variants={cardVariants}
      custom={exitDir}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="absolute inset-0 z-20 touch-pan-y" />

      {/* OVERLAY KHI VUỐT (Chỉ hiện khi đang lật) */}
      {isFlipped && (
        <>
            {(() => {
                const customSadImg = ""; // VD: "/meu.png"
                const customHappyImg = ""; // VD: "/lap-lanh.png"

                return (
                <>
                    
                    <motion.div
                    className="absolute inset-0 z-10 bg-[#FF7096]/20 rounded-xl flex items-center justify-center pointer-events-none"
                    style={{ opacity: opacityLeft }}
                    >
                    <div className="text-[6rem] drop-shadow-2xl scale-125 flex items-center justify-center">
                        {customSadImg ? (
                        <img src={customSadImg} alt="Quên" className="w-32 h-32 object-contain drop-shadow-lg" />
                        ) : (
                        "😭"
                        )}
                    </div>
                    </motion.div>

                    
                    <motion.div
                    className="absolute inset-0 z-10 bg-[#06D6A0]/20 rounded-xl flex items-center justify-center pointer-events-none"
                    style={{ opacity: opacityRight }}
                    >
                    <div className="text-[6rem] drop-shadow-2xl scale-125 flex items-center justify-center">
                        {customHappyImg ? (
                        <img src={customHappyImg} alt="Nhớ" className="w-32 h-32 object-contain drop-shadow-lg" />
                        ) : (
                        "🤩"
                        )}
                    </div>
                    </motion.div>
                </>
                );
            })()}
        </>
      )}

      {/* KHUNG CHỨA THẺ (Xóa viền thô cứng để nhường chỗ cho style Front/Back) */}
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
          <FlashcardBack card={card} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==========================================
// COMPONENT CHA: QUẢN LÝ LOGIC DECK
// ==========================================
interface FlashcardDeckProps {
  deckId: string;
  initialCards: FlashcardData[];
  isCustom?: boolean;
}

export function FlashcardDeck({ deckId, initialCards, isCustom }: FlashcardDeckProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [cards, setCards] = useState<FlashcardData[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<string[]>([]);
  const [exitDir, setExitDir] = useState<'left' | 'right' | 'none'>('none');

  useEffect(() => {
    setIsMounted(true);
    const savedProgress = localStorage.getItem(`flashcard_progress_${deckId}`);
    if (savedProgress) setKnownIds(JSON.parse(savedProgress));

    if (isCustom) {
      const allCustomDecks = JSON.parse(localStorage.getItem("custom_decks") || "[]");
      const currentCustomDeck = allCustomDecks.find((d: any) => d.id === deckId);
      if (currentCustomDeck && currentCustomDeck.cards) {
        setCards(currentCustomDeck.cards);
      }
    }
  }, [deckId, isCustom]);

  const activeCards = cards.filter((card) => !knownIds.includes(card.id));

  // TÍNH TOÁN TIẾN ĐỘ THỰC TẾ
  const totalOriginalCards = cards.length;
  const learnedCardsCount = knownIds.length;
  const progressPercent = totalOriginalCards === 0 ? 0 : Math.round((learnedCardsCount / totalOriginalCards) * 100);

  useEffect(() => {
    if (isFlipped && activeCards.length > 0) {
      playAudio(activeCards[currentIndex].word);
    }
  }, [isFlipped, currentIndex, activeCards]);

  const handleFlip = () => setIsFlipped((prev) => !prev);

  const triggerSwipe = (dir: 'left' | 'right') => {
    if (!activeCards[currentIndex]) return;
    setExitDir(dir);
    
    if (dir === 'right') {
      if (isFlipped) {
        const currentId = activeCards[currentIndex].id;
        const newKnownIds = [...knownIds, currentId];
        setKnownIds(newKnownIds);
        localStorage.setItem(`flashcard_progress_${deckId}`, JSON.stringify(newKnownIds));
        if (currentIndex >= activeCards.length - 1) setCurrentIndex(0);
        setIsFlipped(false);
      } else {
        if (currentIndex < activeCards.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setIsFlipped(false);
        }
      }
    } else { 
      if (isFlipped) {
        setCurrentIndex((prev) => (prev + 1) % activeCards.length);
        setIsFlipped(false);
      } else {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          setIsFlipped(false);
        }
      }
    }
  };

  const handleShuffle = () => {

    const shuffled = [...cards].sort(() => Math.random() - 0.5);

    setCards(shuffled);

    setCurrentIndex(0);

    setIsFlipped(false);

    };

  const resetProgress = () => {
    setKnownIds([]);
    localStorage.removeItem(`flashcard_progress_${deckId}`);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handlePlayAudio = () => {

    if (activeCards.length > 0) playAudio(activeCards[currentIndex].word);

    };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) return;
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          handleFlip();
          break;
        case 'ArrowRight':
          triggerSwipe('right');
          break;
        case 'ArrowLeft':
          triggerSwipe('left');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, activeCards, knownIds]);

  if (!isMounted) return <div className="h-[400px] w-full max-w-md mx-auto bg-[#FFE2D1]/30 animate-pulse rounded-[3rem]" />;

  // ==========================================
  // MÀN HÌNH CHÚC MỪNG (END SCREEN KẸO DẺO)
  // ==========================================
  if (activeCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 pt-10">
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-[3rem] border-4 border-[#FFD166] shadow-[0_12px_0_0_#FFD166] text-center flex flex-col items-center animate-in zoom-in-90 duration-500">
          <span className="text-6xl animate-bounce mb-4">🎉</span>
          <h2 
            className="text-4xl text-[#FF9F1C] mb-2 leading-snug" 
            style={{ fontFamily: "var(--font-cherry)", filter: "drop-shadow(0px 3px 0px rgba(255, 209, 102, 1))" }}
          >
            Giỏi quá ta ơi!
          </h2>
          <p className="font-rounded font-bold text-amber-700 mb-8 text-lg">
            Bạn đã cày nát bộ bài này rồi <br/> (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
          </p>
          <button 
            onClick={resetProgress} 
            className="w-full bg-[#06D6A0] hover:bg-[#05b889] text-white h-14 rounded-2xl font-bold text-xl border-b-4 border-[#048c68] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center"
          >
            <RotateCcw className="w-6 h-6 mr-2" strokeWidth={3} /> Học lại từ đầu
          </button>
        </div>
      </div>
    );
  }

  const currentCard = activeCards[currentIndex];

  // ==========================================
  // MÀN HÌNH HỌC CHÍNH (MAIN PLAY SCREEN)
  // ==========================================
  return (
    <div className="flex flex-col items-center w-full overflow-hidden px-4 pt-4 pb-20">
      
      {/* 1. THANH KẸO TIẾN TRÌNH (Giữ nguyên như cũ) */}
      <div className="w-full max-w-md mx-auto mb-6">
        <div className="flex justify-between items-end mb-2 px-2">
          <span className="font-rounded font-bold text-amber-800 text-sm">Tiến độ cày cuốc!</span>
          <span className="font-rounded font-black text-[#FF9F1C] text-lg">{learnedCardsCount} / {totalOriginalCards}</span>
        </div>
        <div className="w-full h-5 bg-white border-4 border-[#FFE2D1] rounded-full overflow-hidden shadow-[0_4px_0_0_#FFE2D1]">
          <div 
            className="h-full bg-[#06D6A0] rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute top-0.5 left-2 right-2 h-1 bg-white/40 rounded-full" />
          </div>
        </div>
      </div>

      {/* 2. KHU VỰC THẺ BÀI */}
      <div className="w-full max-w-md h-[400px] relative z-10" style={{ perspective: 1200 }}>
        <AnimatePresence custom={exitDir} mode="popLayout">
          <SwipeCard
            key={currentCard.id} 
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            onSwipe={triggerSwipe}
            exitDir={exitDir}
          />
        </AnimatePresence>
      </div>

      {/* 3. BẢNG ĐIỀU KHIỂN (Đã được tách Component siêu gọn) */}
      <ControlPanel
        onPrev={() => triggerSwipe('left')}
        onNext={() => triggerSwipe('right')}
        onFlip={handleFlip}
        onShuffle={handleShuffle}
        onKnow={() => triggerSwipe('right')}
        onReview={() => triggerSwipe('left')}
        onPlayAudio={handlePlayAudio}
        currentIndex={currentIndex}
        totalCards={activeCards.length}
        isFlipped={isFlipped}
      />

    </div>
  );
}
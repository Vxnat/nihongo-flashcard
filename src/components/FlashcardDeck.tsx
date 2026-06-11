"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, PanInfo, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { FlashcardData } from "@/types/flashcard";
import { FlashcardFront } from "./FlashcardFront";
import { FlashcardBack } from "./FlashcardBack";
import { playAudio } from "@/utils/tts";
import { RotateCcw, Headphones, Play, Pause, SkipBack, SkipForward, Layers, Keyboard, Frown, Smile, Maximize, Minimize } from "lucide-react";
import { ControlPanel } from "./ControlPanel";
import { playSFX } from "@/utils/sfx";
import { useUserStats } from "@/hooks/useUserStats";
import { TypingBossFight } from "@/components/TypingBossFight";

// ==========================================
// COMPONENT CON: HIỆU ỨNG SAO RƠI (CHILL MODE)
// ==========================================
function FallingSparkles() {
  const [sparkles, setSparkles] = useState<any[]>([]);
  
  useEffect(() => {
    // Dùng useEffect sinh mảng sao để tránh lỗi Hydration của Next.js
    const arr = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 4 + 6, // Rơi chậm rãi từ 6 - 10s
      delay: Math.random() * 5,
      size: Math.random() * 10 + 10, // Kích thước ngẫu nhiên 10-20px
    }));
    setSparkles(arr);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    >
      {sparkles.map((star) => (
        <motion.div
          key={star.id}
          className="absolute text-yellow-100/80 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
          style={{ left: star.left, top: "-5%" }}
          animate={{ y: ["0vh", "110vh"], opacity: [0, 1, 0.8, 0], rotate: [0, 180] }}
          transition={{ duration: star.duration, delay: star.delay, repeat: Infinity, ease: "linear" }}
        >
          <span style={{ fontSize: star.size }}>✨</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ==========================================
// COMPONENT CON: THẺ VUỐT (KẸO DẺO)
// ==========================================
interface SwipeCardProps {
  card: FlashcardData;
  isFlipped: boolean;
  onFlip: () => void;
  onSwipe: (direction: 'left' | 'right') => void;
  exitDir: 'left' | 'right' | 'none';
  showFurigana: boolean; // Dòng mới: Cho phép toggle Furigana
  isPodcastMode?: boolean; // Cờ nhận biết đang ở chế độ rảnh tay
  podcastIsPlaying?: boolean;
}

function SwipeCard({ card, isFlipped, onFlip, onSwipe, exitDir, showFurigana, isPodcastMode, podcastIsPlaying }: SwipeCardProps) {
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
      drag={!isPodcastMode} // Vô hiệu hoá vuốt thủ công khi đang ở chế độ Podcast
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

      {/* OVERLAY KHI VUỐT (Chỉ hiện khi đang lật) */}
      {isFlipped && (
        <>
            {(() => {
                const customSadImg = "/images/sad.png"; // VD: "/meu.png"
                const customHappyImg = "/images/happy.png"; // VD: "/lap-lanh.png"

                return (
                <>
                    
                    <motion.div
                    className="absolute inset-0 z-10 bg-[#FF7096]/20 rounded-xl flex items-center justify-center pointer-events-none"
                    style={{ opacity: opacityLeft }}
                    >
                    <div className="drop-shadow-2xl flex items-center justify-center">
                        {customSadImg ? (
                        <img src={customSadImg} alt="Quên" className="w-28 h-28 object-contain drop-shadow-md opacity-70" />
                        ) : (
                        <Frown size={120} strokeWidth={2.5} className="text-[#FF7096]" />
                        )}
                    </div>
                    </motion.div>

                    
                    <motion.div
                    className="absolute inset-0 z-10 bg-[#06D6A0]/20 rounded-xl flex items-center justify-center pointer-events-none"
                    style={{ opacity: opacityRight }}
                    >
                    <div className="drop-shadow-2xl flex items-center justify-center">
                        {customHappyImg ? (
                        <img src={customHappyImg} alt="Nhớ" className="w-28 h-28 object-contain drop-shadow-md opacity-70" />
                        ) : (
                        <Smile size={120} strokeWidth={2.5} className="text-[#06D6A0]" />
                        )}
                    </div>
                    </motion.div>
                </>
                );
            })()}
        </>
      )}

      {/* SÓNG ÂM VISUALIZER (Chỉ hiện khi chế độ rảnh tay đang phát tiếng ở mặt sau) */}
      {isPodcastMode && podcastIsPlaying && isFlipped && (
        <div className="absolute top-6 right-6 z-30 flex items-end gap-1 h-6">
          <motion.div className="w-1.5 bg-[#FF7096] rounded-full" animate={{ height: ["40%", "100%", "40%"] }} transition={{ repeat: Infinity, duration: 0.6 }} />
          <motion.div className="w-1.5 bg-[#FF7096] rounded-full" animate={{ height: ["80%", "30%", "80%"] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} />
          <motion.div className="w-1.5 bg-[#FF7096] rounded-full" animate={{ height: ["50%", "90%", "50%"] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.2 }} />
        </div>
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
          <FlashcardBack card={card} showFurigana={showFurigana} />
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
  const [showFurigana, setShowFurigana] = useState(true); // Dòng mới: Cho phép toggle Furigana
  const { recordAction, addLearningTime } = useUserStats(); // 👈 Gọi thêm hàm cộng giờ
  const [globalMode, setGlobalMode] = useState<"swipe" | "typing" | "podcast">("swipe");
  const [tempTyping, setTempTyping] = useState(false);
  const [podcastIsPlaying, setPodcastIsPlaying] = useState(false);
  const [podcastSpeed, setPodcastSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Biến rút gọn để biết lúc nào thì nên hiển thị UI Gõ phím
  const isTypingActive = globalMode === "typing" || tempTyping;

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

  const handleFlip = () => {
    playSFX('flip'); // 👈 Phát tiếng lật giấy
    setIsFlipped((prev) => !prev);
  };

  const triggerSwipe = (dir: 'left' | 'right', forcedFlippedState?: boolean) => {
    if (!activeCards[currentIndex]) return;
    recordAction(); // 👈 Gọi cảm biến
    setExitDir(dir);
    
    const currentFlipped = forcedFlippedState !== undefined ? forcedFlippedState : isFlipped;
    
    if (dir === 'right') {
      if (currentFlipped) {
        const currentId = activeCards[currentIndex].id;
        const newKnownIds = [...knownIds, currentId];
        setKnownIds(newKnownIds);
        localStorage.setItem(`flashcard_progress_${deckId}`, JSON.stringify(newKnownIds));
        if (currentIndex >= activeCards.length - 1) setCurrentIndex(0);
        setIsFlipped(false);
        // 👈 VUỐT PHẢI: Phát tiếng TING ✨
        playSFX('success'); 
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
        // 👈 VUỐT TRÁI: Phát tiếng BÓP 💦
        playSFX('fail');
      } else {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          setIsFlipped(false);
        }
      }
    }
  };

  // HÀM CHUYỂN THẺ RẢNH TAY (KHÔNG TÍNH ĐIỂM / STREAK)
  const handlePodcastNext = useCallback((direction: 1 | -1 = 1) => {
    setExitDir(direction === 1 ? 'left' : 'right');
    setTimeout(() => {
      setCurrentIndex((prev) => {
        if (direction === 1) return (prev + 1) % activeCards.length; // Nếu là thể đầu tiên thì + 1 , nếu là cuối cùng thì vòng về đầu đầu
        return prev === 0 ? activeCards.length - 1 : prev - 1; // Trừ đi 1 , nếu là số 0 thì nhảy về thẻ cuối bộ bài
      });
      setIsFlipped(false);
      setExitDir('none');
    }, 400); // Khớp với thời lượng exit animation
  }, [activeCards.length]);

  // LOGIC RHYTHM PODCAST MODE
  useEffect(() => {
    if (globalMode !== "podcast" || !podcastIsPlaying || activeCards.length === 0) return;

    let timeout: NodeJS.Timeout;
    const getPodcastDelays = () => {
      switch (podcastSpeed) {
        case "slow": return { front: 3000, back: 4000 };
        case "fast": return { front: 1000, back: 1500 };
        default: return { front: 1500, back: 2500 };
      }
    };
    const delays = getPodcastDelays();

    if (!isFlipped) {
      // Đang ở mặt Kanji -> Chờ rồi tự lật (khi lật hàm phát audio sẽ tự chạy)
      timeout = setTimeout(() => setIsFlipped(true), delays.front);
    } else {
      // Đang ở mặt Tiếng Việt -> Chờ nhẩm ý nghĩa rồi trượt sang thẻ mới
      timeout = setTimeout(() => handlePodcastNext(1), delays.back);
    }

    return () => clearTimeout(timeout);
  }, [globalMode, podcastIsPlaying, isFlipped, currentIndex, podcastSpeed, activeCards.length, handlePodcastNext]);

  // ==========================================
  // ĐỒNG HỒ ĐẾM GIỜ HỌC & CHỐNG TREO MÁY (AFK)
  // ==========================================
  const globalModeRef = useRef(globalMode);
  const podcastIsPlayingRef = useRef(podcastIsPlaying);
  useEffect(() => {
    globalModeRef.current = globalMode;
    podcastIsPlayingRef.current = podcastIsPlaying;
  }, [globalMode, podcastIsPlaying]);

  useEffect(() => {
    if (!isMounted || !addLearningTime) return;
    
    let isActive = true;
    let afkTimer: NodeJS.Timeout;
    
    const resetAfk = () => {
      isActive = true;
      clearTimeout(afkTimer);
      // Nếu không đụng vào máy sau 30 giây -> Báo AFK
      afkTimer = setTimeout(() => {
        isActive = false;
      }, 30000); 
    };

    // Các sự kiện kích hoạt trạng thái "Đang học"
    window.addEventListener("mousemove", resetAfk);
    window.addEventListener("keydown", resetAfk);
    window.addEventListener("touchstart", resetAfk);
    window.addEventListener("click", resetAfk);
    resetAfk();

    // Cứ mỗi 5 giây, cộng dồn thời gian học lên LocalStorage
    const trackingInterval = setInterval(() => {
      // Đang cầm chuột học HOẶC Đang bật chế độ phát nhạc Rảnh tay
      if (isActive || (globalModeRef.current === "podcast" && podcastIsPlayingRef.current)) {
        addLearningTime(5);
      }
    }, 5000);

    return () => {
      clearTimeout(afkTimer);
      clearInterval(trackingInterval);
      window.removeEventListener("mousemove", resetAfk);
      window.removeEventListener("keydown", resetAfk);
      window.removeEventListener("touchstart", resetAfk);
      window.removeEventListener("click", resetAfk);
    };
  }, [isMounted, addLearningTime]);

  // ==========================================
  // LOGIC TOÀN MÀN HÌNH (FULLSCREEN NATIVE)
  // ==========================================
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Trình duyệt không hỗ trợ Fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
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
      
      if (globalMode === "podcast") {
        switch (event.code) {
          case 'Space':
            event.preventDefault();
            setPodcastIsPlaying(p => !p);
            break;
          case 'ArrowRight':
            handlePodcastNext(1);
            break;
          case 'ArrowLeft':
            handlePodcastNext(-1);
            break;
        }
        return;
      }

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
  }, [isFlipped, currentIndex, activeCards, knownIds, globalMode, handlePodcastNext]);

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
    <div className="flex flex-col items-center w-full overflow-hidden px-4 pt-4 pb-20 min-h-[100dvh]">
      
      {/* ZEN MODE BACKGROUND OVERLAY (Chỉ tối đi khi bật Podcast) */}
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 z-0 overflow-hidden ${
          globalMode === "podcast" ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* 1. Ảnh nền Lofi (Có thể tải file ảnh/GIF vào thư mục public và đổi src thành "/ten-anh.gif") */}
        <img 
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1920" 
          alt="Lofi Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-50" 
        />
        
        {/* 2. Lớp phủ màu Đêm Trăng Kẹo Ngọt để giữ độ mộng mơ và làm mờ (blur) bớt ảnh gốc */}
        <div className="absolute inset-0 bg-[#4A306D]/70 backdrop-blur-[3px]" />

        {/* Hiệu ứng sao rơi chỉ bật khi vào mode Podcast */}
        <AnimatePresence>{globalMode === "podcast" && <FallingSparkles />}</AnimatePresence>
      </div>

      {/* 1. THANH TIẾN TRÌNH VIỀN TRÊN (TOP EDGE GLOW BAR) */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-50 bg-zinc-200/40 overflow-hidden animate-in slide-in-from-top-2 duration-700">
        <div 
          // Nếu 0% thì set cứng w-3 (một chấm sáng) và cho nhấp nháy để gọi mời
          className={`h-full bg-[#06D6A0] transition-all duration-700 ease-out relative shadow-[0_0_12px_2px_rgba(6,214,160,0.8)] rounded-r-full ${
            progressPercent === 0 ? 'w-3 animate-pulse' : ''
          }`}
          style={progressPercent > 0 ? { width: `${progressPercent}%` } : {}}
        >
          {/* Điểm nhấn chói sáng ở mũi nhọn */}
          <div className="absolute right-0 top-0 h-full w-4 bg-white/80 blur-[1px] rounded-full" />
        </div>
      </div>

      {/* HIỂN THỊ SỐ LƯỢNG VÀ CÔNG TẮC TOÀN CỤC (Chung 1 dòng để tiết kiệm không gian) */}
      <div className="w-full max-w-md mx-auto mb-4 mt-6 flex justify-between items-center px-4 relative z-20">
        
        {/* NÚT TAI NGHE BÊN TRÁI (Bật/tắt chế độ Rảnh tay) */}
        <button
          onClick={() => {
            const newMode = globalMode === "podcast" ? "swipe" : "podcast";
            setGlobalMode(newMode);
            if (newMode === "podcast") {
              setPodcastIsPlaying(true);
              setIsFlipped(false);
              setTempTyping(false);
            } else {
              setPodcastIsPlaying(false);
            }
          }}
          className={`relative z-10 w-[42px] h-[42px] flex items-center justify-center rounded-full transition-all duration-300 active:duration-75 active:translate-y-1 active:scale-90 shadow-sm ${
            globalMode === "podcast" 
              ? "bg-[#FF7096] text-white shadow-[0_0_15px_rgba(255,112,150,0.8)] border-2 border-[#FFB3C6] scale-110" 
              : "bg-zinc-100/80 text-zinc-500 border border-zinc-200/80 hover:bg-zinc-200 grayscale"
          }`}
          title="Chế độ Rảnh Tay (Podcast)"
        >
          <Headphones className="w-5 h-5" />
        </button>

        {/* CÔNG TẮC TIC-TAC (Micro-Pill Toggle) */}
        <div className={`relative flex w-[88px] h-[38px] bg-zinc-100/80 backdrop-blur-sm p-1 rounded-full shadow-inner border border-zinc-200/80 transition-opacity ${globalMode === "podcast" ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
          {/* Cục kẹo dẻo chạy qua chạy lại làm nền */}
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.1)] border border-zinc-100"
            animate={{ left: globalMode === "swipe" ? "4px" : "calc(50% + 0px)" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />

          {/* Nút Lật Thẻ */}
          <button
            onClick={() => {
              setGlobalMode("swipe");
              setTempTyping(false);
              setIsFlipped(false);
            }}
            className={`relative z-10 flex-1 flex items-center justify-center transition-all duration-300 active:duration-75 active:translate-y-[2px] active:scale-90 ${
              globalMode === "swipe" ? "scale-110 text-[#FF7096] drop-shadow-sm" : "scale-90 text-zinc-400 hover:text-zinc-600"
            }`}
            title="Chế độ lật thẻ"
          >
            <Layers strokeWidth={2.5} className="w-5 h-5" />
          </button>

          {/* Nút Gõ Phím */}
          <button
            onClick={() => {
              setGlobalMode("typing");
              setTempTyping(false);
              setIsFlipped(false);
            }}
            className={`relative z-10 flex-1 flex items-center justify-center transition-all duration-300 active:duration-75 active:translate-y-[2px] active:scale-90 ${
              globalMode === "typing" ? "scale-110 text-[#06D6A0] drop-shadow-sm" : "scale-90 text-zinc-400 hover:text-zinc-600"
            }`}
            title="Chế độ gõ phím"
          >
            <Keyboard strokeWidth={2.5} className="w-5 h-5" />
          </button>
        </div>

        {/* CỤC ĐẾM SỐ (Bên phải) */}
        <div className="relative z-10">
          {progressPercent === 0 && (
            <span className="absolute -inset-1 rounded-full bg-[#06D6A0]/40 animate-ping duration-1000" />
          )}
          <span className="relative font-rounded font-black text-[#06D6A0] text-sm bg-[#F0FAF5] px-3 py-1.5 rounded-full border border-[#A0E8D5]/50 shadow-sm transition-all flex items-center justify-center h-[38px]"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            {learnedCardsCount} / {totalOriginalCards}
          </span>
        </div>

      </div>

      {globalMode === "podcast" ? (
        // --- CHẾ ĐỘ RẢNH TAY (PODCAST / ZEN MODE) ---
        <>
          <div className="w-full max-w-md h-[400px] relative z-10 mt-5" style={{ perspective: 1200 }}>
            <AnimatePresence custom={exitDir} mode="popLayout">
              <SwipeCard
                key={currentCard.id}
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={handleFlip}
                onSwipe={triggerSwipe}
                exitDir={exitDir}
                showFurigana={showFurigana}
                isPodcastMode={true}
                podcastIsPlaying={podcastIsPlaying}
              />
            </AnimatePresence>
          </div>

          {/* AUDIO PLAYER UI CHO PODCAST */}
          <div className="w-full max-w-md mx-auto relative z-10 mt-10 px-4 animate-in slide-in-from-bottom-6 fade-in duration-500">
            <div className="flex justify-center gap-1 sm:gap-3 mb-6 bg-[#FDFBF7] p-1.5 sm:p-2.5 rounded-full border-4 border-[#FFE2D1] w-fit mx-auto shadow-[0_8px_0_0_#FFE2D1] max-w-full overflow-x-auto hide-scrollbar">
              <button onClick={() => setPodcastSpeed("slow")} className={`px-3 sm:px-4 py-1.5 rounded-full text-sm sm:text-base transition-all border-2 flex items-center gap-1 sm:gap-1.5 shrink-0 active:translate-y-1 active:shadow-none ${podcastSpeed === 'slow' ? 'bg-[#FFD166] border-[#FFD166] text-white shadow-[0_4px_0_0_#E6B74A] -translate-y-1' : 'bg-white border-[#FFE2D1] text-zinc-400 hover:text-zinc-500 shadow-[0_4px_0_0_#FFE2D1]'}`}>
                <span className="text-xs sm:text-sm">🐢</span>
                <span style={{ fontFamily: "var(--font-cherry)", letterSpacing: "1px", paddingTop: "2px" }}>Chậm</span>
              </button>
              <button onClick={() => setPodcastSpeed("normal")} className={`px-3 sm:px-4 py-1.5 rounded-full text-sm sm:text-base transition-all border-2 flex items-center gap-1 sm:gap-1.5 shrink-0 active:translate-y-1 active:shadow-none ${podcastSpeed === 'normal' ? 'bg-[#06D6A0] border-[#06D6A0] text-white shadow-[0_4px_0_0_#05B889] -translate-y-1' : 'bg-white border-[#FFE2D1] text-zinc-400 hover:text-zinc-500 shadow-[0_4px_0_0_#FFE2D1]'}`}>
                <span className="text-xs sm:text-sm">🚶</span>
                <span style={{ fontFamily: "var(--font-cherry)", letterSpacing: "1px", paddingTop: "2px" }}>Vừa</span>
              </button>
              <button onClick={() => setPodcastSpeed("fast")} className={`px-3 sm:px-4 py-1.5 rounded-full text-sm sm:text-base transition-all border-2 flex items-center gap-1 sm:gap-1.5 shrink-0 active:translate-y-1 active:shadow-none ${podcastSpeed === 'fast' ? 'bg-[#FF9F1C] border-[#FF9F1C] text-white shadow-[0_4px_0_0_#E68E19] -translate-y-1' : 'bg-white border-[#FFE2D1] text-zinc-400 hover:text-zinc-500 shadow-[0_4px_0_0_#FFE2D1]'}`}>
                <span className="text-xs sm:text-sm">🐇</span>
                <span style={{ fontFamily: "var(--font-cherry)", letterSpacing: "1px", paddingTop: "2px" }}>Nhanh</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 bg-[#FDFBF7] p-5 rounded-[2.5rem] border-4 border-[#FFE2D1] shadow-[0_12px_0_0_#FFE2D1]">
              <button onClick={() => handlePodcastNext(-1)} className="w-14 h-14 flex items-center justify-center bg-white text-[#FF9F1C] border-2 border-[#FFE2D1] rounded-2xl shadow-[0_4px_0_0_#FFE2D1] active:translate-y-1 active:shadow-none transition-all hover:bg-orange-50">
                <SkipBack size={24} strokeWidth={3} fill="currentColor" />
              </button>
              
              <button onClick={() => setPodcastIsPlaying(!podcastIsPlaying)} className="w-20 h-20 flex items-center justify-center bg-[#FF7096] text-white border-b-4 border-[#C7486B] rounded-full shadow-md hover:bg-[#FF5C8A] active:border-b-0 active:translate-y-1 transition-all">
                {podcastIsPlaying ? <Pause size={32} strokeWidth={3} fill="currentColor" /> : <Play size={32} strokeWidth={3} fill="currentColor" className="ml-1" />}
              </button>
              
              <button onClick={() => handlePodcastNext(1)} className="w-14 h-14 flex items-center justify-center bg-white text-[#FF9F1C] border-2 border-[#FFE2D1] rounded-2xl shadow-[0_4px_0_0_#FFE2D1] active:translate-y-1 active:shadow-none transition-all hover:bg-orange-50">
                <SkipForward size={24} strokeWidth={3} fill="currentColor" />
              </button>
            </div>
          </div>
        </>
      ) : isTypingActive ? (
        // --- CHẾ ĐỘ BOSS FIGHT ---
        <div className="w-full max-w-md mx-auto relative z-10 px-4 mt-2">
          <TypingBossFight
            key={`typing-${currentCard.id}`} // Quan trọng: Ép React reset BossFight khi thẻ thay đổi
            card={currentCard}
            onCorrect={() => {
              triggerSwipe('right' , true);
              // Gõ đúng xong thì CHỈ tắt chế độ tạm thời. 
              // Nếu đang bật globalMode = "typing" thì nó vẫn giữ nguyên màn hình Gõ phím cho thẻ tiếp theo!
              setTempTyping(false); 
            }}
            onCancel={() => {
              // Bấm nút Thoát ải: Tắt temp. Nếu đang ở global gõ phím thì ép về lại global quẹt thẻ.
              setTempTyping(false);
              setGlobalMode("swipe");
            }}
          />
        </div>
      ) : (
        // --- CHẾ ĐỘ QUẸT THẺ (MẶC ĐỊNH) ---
        <>
          {/* 2. KHU VỰC THẺ BÀI (Giữ nguyên code cũ của bạn) */}
          <div className="w-full max-w-md h-[400px] relative z-10 mt-5" style={{ perspective: 1200 }}>
            <AnimatePresence custom={exitDir} mode="popLayout">
              <SwipeCard
                key={currentCard.id}
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={handleFlip}
                onSwipe={triggerSwipe}
                exitDir={exitDir}
                showFurigana={showFurigana}
              />
            </AnimatePresence>
          </div>

          {/* 3. BẢNG ĐIỀU KHIỂN (Giữ nguyên code cũ của bạn) */}
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
            showFurigana={showFurigana}
            onToggleFurigana={() => setShowFurigana(!showFurigana)}
          />

          {/* 4. NÚT VÀO ẢI (Hiển thị ngay dưới ControlPanel) */}
          <div className="w-full max-w-md mx-auto mt-10 px-4">
            <button
              onClick={() => {
                setTempTyping(true); // Bật công tắc tạm thời
                setIsFlipped(false); // Đảm bảo thẻ úp lại trước khi vào ải
              }}
              className="w-full h-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-500 rounded-2xl font-bold border-2 border-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span style={{ fontFamily: "var(--font-cherry)", letterSpacing: "1px", paddingTop: "2px" }}>Gõ đáp án</span>
            </button>
          </div>
        </>
      )}

      {/* NÚT FULLSCREEN NỔI (FLOATING ACTION BUTTON) TẠI GÓC DƯỚI PHẢI */}
      <button
        onClick={toggleFullscreen}
        className={`fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[100] w-[50px] h-[50px] flex items-center justify-center rounded-full transition-all duration-300 active:duration-75 active:scale-90 ${
          globalMode === "podcast" 
            ? "bg-white/10 backdrop-blur-md text-white/70 border-2 border-white/20 hover:text-white hover:bg-white/20 shadow-lg" 
            : "bg-white text-zinc-400 border-2 border-zinc-200 shadow-[0_4px_0_0_#e4e4e7] hover:text-[#5390D9] hover:-translate-y-1 hover:shadow-[0_6px_0_0_#e4e4e7] active:translate-y-1 active:shadow-none"
        }`}
        title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
      >
        {isFullscreen ? <Minimize size={22} strokeWidth={2.5} /> : <Maximize size={22} strokeWidth={2.5} />}
      </button>

    </div>
  );
}
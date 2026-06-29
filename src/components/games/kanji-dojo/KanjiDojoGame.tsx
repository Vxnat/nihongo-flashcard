"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, Eye, Brush, Wand2, Heart } from "lucide-react";
import confetti from "canvas-confetti";

import { KanjiCanvas, KanjiCanvasRef } from "@/components/games/kanji-dojo/KanjiCanvas";
import { GameResultModal } from "@/components/games/shared/GameResultModal";
import { ShibaMasterDialog, ShibaMasterOption } from "@/components/games/shared/ShibaMasterDialog";
import { useAppStore } from "@/store/useAppStore";
import { SystemDeck } from "@/types/flashcard";
import { useLearningTimer } from "@/hooks/common/useLearningTimer";

interface KanjiDojoGameProps {
  minigameDeck: SystemDeck;
  onClose: () => void;
  onWin: () => void;
}

const MAX_HP = 3;

export function KanjiDojoGame({
  minigameDeck,
  onClose,
  onWin,
}: KanjiDojoGameProps) {
  const { kanjiList = [], rewardCoins = 0, id: deckId } = minigameDeck;
  const totalKanji = kanjiList.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hp, setHp] = useState(MAX_HP);
  const [status, setStatus] = useState<"playing" | "win" | "lose">("playing");
  const [isShaking, setIsShaking] = useState(false);

  useLearningTimer({ isActive: status === "playing" });

  const addCoins = useAppStore((state) => state.addCoins);
  const progress = useAppStore((state) => state.progress);
  const isFirstClearRef = useRef<boolean>(false);

  const canvasRef = useRef<KanjiCanvasRef>(null);
  const [isMasterOpen, setIsMasterOpen] = useState(false);

  // Kiểm tra xem đã qua ải này lần nào chưa để thưởng xu
  useEffect(() => {
    if (deckId) {
      const completed = progress[deckId]?.includes("completed");
      isFirstClearRef.current = !completed;
    }
  }, [deckId, progress]);

  // Logic Thua cuộc khi hết máu
  useEffect(() => {
    if (hp <= 0 && status === "playing") {
      setStatus("lose");
    }
  }, [hp, status]);

  // Handlers
  const playSound = useCallback((src: string, volume: number = 0.5) => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => { });
  }, []);

  const handleCorrectStroke = useCallback(() => {
    playSound("/sounds/brush.mp3", 0.6); // Tiếng cọ quét trên giấy
  }, [playSound]);

  const handleMistake = useCallback(() => {
    setHp((prev) => prev - 1);
    setIsShaking(true);
    playSound("/sounds/wrong.mp3", 0.4); // Tiếng gỗ gõ cộc cộc báo lỗi
    setTimeout(() => setIsShaking(false), 500);
  }, [playSound]);

  const handleComplete = useCallback(() => {
    playSound("/sounds/gong.mp3", 0.5); // Tiếng chiêng hoặc chuông leng keng

    // Hiệu ứng hạt mực văng ra khi hoàn thành 1 chữ
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#18181B", "#52525B", "#E4E4E7"], // Các tone màu mực/xám
      zIndex: 2000,
    });

    setTimeout(() => {
      setCurrentIndex((prev) => {
        if (prev < totalKanji - 1) {
          return prev + 1;
        } else {
          setStatus("win");
          return prev;
        }
      });
    }, 1200); // Đợi 1.2s cho người dùng ngắm chữ hoàn hảo rồi chuyển
  }, [playSound, totalKanji]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setHp(MAX_HP);
    setStatus("playing");
  };

  const handleWin = () => {
    if (isFirstClearRef.current && rewardCoins > 0) {
      addCoins(rewardCoins);
    }
    onWin();
  };

  const progressPercent =
    totalKanji > 0 ? (currentIndex / totalKanji) * 100 : 0;
  const currentItem = kanjiList[currentIndex] || { char: "", meaning: "" };
  const currentCharacter = typeof currentItem === "string" ? currentItem : currentItem.char;
  const currentMeaning = typeof currentItem === "string" ? "" : currentItem.meaning;

  const masterOptions: ShibaMasterOption[] = [
    {
      id: "peek",
      icon: "",
      label: "Nhìn lén 1 nét",
      cost: 1,
      colorClass: "bg-blue-50 text-[#5390D9] border-[#A0C4FF] hover:bg-blue-100",
      onConfirm: () => {
        if (canvasRef.current) canvasRef.current.peekNextStroke();
      }
    },
    {
      id: "animate",
      icon: "",
      label: "Xem múa cọ",
      cost: 3,
      allowFreeHint: true,
      colorClass: "bg-[#FFD166] text-amber-900 border-[#FF9F1C] hover:bg-[#ffc640]",
      onConfirm: () => {
        if (canvasRef.current) canvasRef.current.animateCharacter();
      }
    },
    // {
    //   id: "force",
    //   icon: <Wand2 className="w-5 h-5" />,
    //   label: "Vượt ải",
    //   cost: 5,
    //   colorClass: "bg-[#FF7096] text-white border-[#C7486B] hover:bg-[#FF5C8A]",
    //   onConfirm: () => {
    //     if (canvasRef.current) canvasRef.current.forceComplete();
    //     setHp(MAX_HP); // Đặc quyền: Phục hồi lại đầy máu
    //   }
    // }
  ];

  if (status === "win" || status === "lose") {
    return (
      <GameResultModal
        status={status}
        reason={status === "lose" ? "Chệch nét, hết máu rồi!" : undefined}
        rewardCoins={
          status === "win" && isFirstClearRef.current ? rewardCoins : 0
        }
        onRestart={handleRestart}
        onClose={status === "win" ? handleWin : onClose}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-br from-[#FDFBF7] to-[#FFF8E1] relative overflow-hidden">
      {/* Thanh Trạng Thái (Top Bar) */}
      <div className="w-full flex items-center justify-between gap-4 mb-6 relative z-10">
        {/* Thanh Tiến Trình */}
        <div className="flex-1 max-w-[200px] h-6 bg-white rounded-full shadow-inner border-4 border-[#FFE2D1] p-0.5 overflow-hidden">
          <motion.div
            className="h-full bg-[#06D6A0] rounded-full shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Máu (HP Shiba Hearts) */}
        <div className="flex gap-1.5 bg-white/90 border-2 border-[#FFE2D1] px-3 py-1.5 rounded-[1rem] shadow-[0_3px_0_0_#FFD6C0]">
          {[...Array(MAX_HP)].map((_, i) => (
            <motion.div
              key={i}
              animate={i < hp ? { scale: [1, 1.15, 1] } : { scale: 0.7 }}
              transition={{ repeat: i < hp ? Infinity : 0, duration: 2, repeatType: "reverse" }}
            >
              <Heart
                size={18}
                className={i < hp ? "text-[#FF7096] fill-[#FF7096]" : "text-zinc-300"}
              />
            </motion.div>
          ))}
        </div>

        {/* Nút Đóng */}
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 shadow-sm transition-colors border-2 border-zinc-200 shrink-0"
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Khu vực Bảng Vẽ Chính */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
        {/* Nhãn báo số thứ tự chữ */}
        <div className="text-center mb-6">
          <span className="text-[#FF9F1C] font-black tracking-widest text-xs sm:text-sm bg-orange-50 px-5 py-2 rounded-2xl border-4 border-orange-200 shadow-sm"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            {currentIndex + 1} / {totalKanji}
          </span>
        </div>

        {/* Khung Gỗ bọc lấy Lò Luyện Đan */}
        <motion.div
          animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="relative p-3 sm:p-4 bg-[#FFD166] rounded-[2.5rem] shadow-[0_12px_0_0_#FF9F1C] border-4 border-[#FF9F1C]"
        >
          {currentCharacter && (
            <KanjiCanvas
              ref={canvasRef}
              character={currentCharacter}
              onCorrectStroke={handleCorrectStroke}
              onMistake={handleMistake}
              onComplete={handleComplete}
            />
          )}
        </motion.div>

        {/* Text hiển thị chữ mục tiêu để dễ hình dung */}
        <div className="mt-10 bg-white px-8 py-5 rounded-[2rem] border-4 border-[#06D6A0] shadow-[0_8px_0_0_#06D6A0] text-center min-w-[220px] flex flex-col items-center">
          <h3
            className="text-5xl text-[#06D6A0] drop-shadow-sm mb-3"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            {currentCharacter}
          </h3>
          {currentMeaning && (
            <p className="text-teal-800 text-sm font-bold bg-[#E0F7FA] px-4 py-1.5 rounded-xl border-2 border-[#80DEEA] shadow-inner"
              style={{ fontFamily: "var(--font-hachi-maru-pop)" }}
            >
              {currentMeaning}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsMasterOpen(true)}
          className="mt-6 flex items-center justify-center w-full max-w-[220px] h-14 rounded-2xl font-black text-base transition-all active:scale-[0.97] bg-[#5390D9]/15 backdrop-blur-md border border-[#5390D9]/30 text-[#3f73b3] hover:bg-[#5390D9]/25 hover:text-[#305f94] shadow-sm select-none"
        >
          <span style={{ fontFamily: "var(--font-cherry)" }}>Hỏi Sư Phụ</span>
        </button>
      </div>
      <ShibaMasterDialog
        isOpen={isMasterOpen}
        onClose={() => setIsMasterOpen(false)}
        options={masterOptions}
      />
    </div>
  );
}
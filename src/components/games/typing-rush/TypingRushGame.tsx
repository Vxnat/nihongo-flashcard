"use client";

import React, { useEffect, useState, useRef } from "react";
import { useTypingRushEngine } from "@/hooks/games/typing-rush/useTypingRushEngine";
import { EnemyWord } from "./EnemyWord";
import { BonkEffect } from "./BonkEffect";
import { FlashcardData } from "@/types/flashcard";
import confetti from "canvas-confetti";
import { X } from "lucide-react";
import { GameResultModal } from "@/components/games/shared/GameResultModal";
import { useAppStore } from "@/store/useAppStore";
import { SystemDeck } from "@/hooks/roadmap/useSystemRoadmap";
import { useLearningTimer } from "@/hooks/common/useLearningTimer";

interface TypingRushGameProps {
  cards: FlashcardData[];
  minigameDeck?: SystemDeck;
  onWin: () => void;
  onLose: () => void;
}

export const TypingRushGame = ({ cards, minigameDeck, onWin, onLose }: TypingRushGameProps) => {
  // Chuẩn bị dữ liệu từ điển cho Engine
  const vocabularyList = cards.map((c) => ({
    text: c.word,
    romaji: c.romaji || c.reading || "",
  }));

  const {
    gameState,
    score,
    hp,
    userInput,
    timeLeft,
    setUserInput,
    enemiesRef,
    tick,
    startGame,
    destroyEnemy,
  } = useTypingRushEngine({
    vocabularyList,
    onEnemyEscape: () => {
      // Rung màn hình khi lọt từ (Sẽ tích hợp ở Bước sau)
      console.log("Ouch! Rớt 1 chữ xuống dung nham!");
    },
    initialHp: 3,
  });

  useLearningTimer({ isActive: gameState === "playing" });

  const [bonks, setBonks] = useState<{ id: string; x: number; y: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addCoins = useAppStore((state) => state.addCoins);
  const progress = useAppStore((state) => state.progress);

  const isFirstClearRef = useRef<boolean>(false);
  const [rewardGranted, setRewardGranted] = useState(false);
  const [scoreBonus, setScoreBonus] = useState(0);

  useEffect(() => {
    if (minigameDeck?.id) {
      const completed = progress[minigameDeck.id]?.includes("completed");
      isFirstClearRef.current = !completed;
    }
  }, [minigameDeck, progress]);

  // Hàm tính toán và trao thưởng ngay khi thắng
  useEffect(() => {
    if (gameState === "won" && !rewardGranted) {
      if (isFirstClearRef.current) {
        const baseReward = minigameDeck?.rewardCoins || 15;
        const bonus = Math.floor(score / 50); // Mỗi 50 điểm được 1 xương thưởng
        const totalReward = baseReward + bonus;
        
        if (totalReward > 0) {
          addCoins(totalReward);
          setScoreBonus(bonus);
        }
      }
      setRewardGranted(true);
    }
  }, [gameState, rewardGranted, score, minigameDeck, addCoins]);

  const handleStartGame = () => {
    setRewardGranted(false);
    setScoreBonus(0);
    startGame();
  };

  // Tự động start game khi màn hình hiện lên
  useEffect(() => {
    handleStartGame();
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      inputRef.current?.focus(); // Ép focus vào input khi game bắt đầu để gọi bàn phím ảo
    }
  }, [gameState]);

  // Xử lý sự kiện gõ phím thông qua thẻ Input (Hỗ trợ tốt cho Mobile)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== "playing") return;

    // Lọc bỏ ký tự không phải chữ cái (phòng hờ bàn phím đt tự động thêm dấu/khoảng trắng)
    const nextInput = e.target.value.toLowerCase().replace(/[^a-z]/g, "");

    // Xử lý xóa (Backspace)
    if (nextInput.length < userInput.length) {
      setUserInput(nextInput);
      return;
    }

    // 1. Kiểm tra xem có gõ đúng hoàn toàn từ nào không
    const matchedEnemy = enemiesRef.current.find((enemy) => enemy.romaji === nextInput);

    if (matchedEnemy) {
      destroyEnemy(matchedEnemy.id);
      
      const bonkId = Date.now().toString() + Math.random().toString();
      setBonks((b) => [...b, { id: bonkId, x: matchedEnemy.x, y: matchedEnemy.y }]);
      setTimeout(() => setBonks((b) => b.filter((item) => item.id !== bonkId)), 300);

      // Phát âm thanh Bonk
      const bonkAudio = new Audio("/sounds/bonk.mp3");
      bonkAudio.volume = 0.6; // Bạn có thể chỉnh âm lượng từ 0.0 đến 1.0
      bonkAudio.play().catch(() => {}); // catch để tránh lỗi DOM Exception trên một số trình duyệt

      confetti({
        particleCount: 25,
        spread: 60,
        origin: { x: matchedEnemy.x / 100, y: matchedEnemy.y / 100 },
        colors: ["#A1A1AA", "#D4D4D8", "#FDE68A", "#71717A"], 
        scalar: 0.8,
        gravity: 0.6,
        ticks: 80,
        disableForReducedMotion: true,
      });

      setUserInput("");
      return;
    }

    // 2. Kiểm tra Prefix
    const isPrefix = enemiesRef.current.some((enemy) => enemy.romaji.startsWith(nextInput));
    if (!isPrefix) {
      setUserInput(""); // Gõ sai -> Phạt xóa trắng
      return;
    }

    setUserInput(nextInput);
  };

  return (
    <div
      className="relative w-full h-full min-h-[100dvh] bg-gradient-to-b from-[#E0F7FA] via-[#E1BEE7] to-[#FFB3C6] overflow-hidden font-nunito select-none"
      data-tick={tick} // Ép React sử dụng biến tick để trigger re-render khi mảng enemies thay đổi
      onClick={() => inputRef.current?.focus()} // Chạm bất cứ đâu trên màn hình cũng gọi lại bàn phím
    >
      {/* Bối cảnh: Bầu trời mây Pastel */}
      <div className="absolute inset-0 z-0 opacity-60 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent"></div>

      {/* Khu vực trên: Header & Máu */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLose();
            }}
            className="w-10 h-10 mr-1 sm:mr-2 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-sm text-zinc-500 hover:text-[#C7486B] hover:bg-white/80 shadow-sm transition-colors border-2 border-white/60 shrink-0"
            title="Thoát game"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
          </button>
          {Array.from({ length: 3 }).map((_, i) => (
             <img 
               key={i} 
               src="/images/mascot/shiba_heart.png" 
               alt="HP" 
               className={`w-8 h-8 transition-all ${i < hp ? "opacity-100" : "opacity-30 grayscale"}`} 
             />
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-lg sm:text-xl font-black bg-white/40 text-teal-800 px-3 py-1 sm:px-4 rounded-full backdrop-blur-sm shadow-sm border-2 border-white/60 flex items-center gap-2">
            ⏳ {timeLeft}s
          </div>
          <div className="text-lg sm:text-xl font-bold bg-white/40 text-teal-800 px-3 py-1 sm:px-4 rounded-full backdrop-blur-sm shadow-sm border-2 border-white/60">
            Score: {score}
          </div>
        </div>
      </div>

      {/* Khu vực Chơi: Nơi render chữ rơi xuống */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {enemiesRef.current.map((enemy) => (
          <EnemyWord key={enemy.id} id={enemy.id} text={enemy.text} romaji={enemy.romaji} x={enemy.x} y={enemy.y} />
        ))}
        {bonks.map((bonk) => (
          <BonkEffect key={bonk.id} x={bonk.x} y={bonk.y} />
        ))}
      </div>

      {/* Khu vực dưới: Rãnh dung nham dâu (Strawberry Lava) */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-[#FFB3C6] border-t-8 border-[#FF7096] z-20 shadow-[0_-10px_30px_rgba(255,112,150,0.4)] flex items-end justify-center overflow-hidden">
        {/* Hiệu ứng sủi bọt dâu tây */}
        <div className="absolute inset-0 opacity-70 pointer-events-none">
          <div className="absolute bottom-2 left-[15%] w-6 h-6 bg-white/40 rounded-full animate-bounce"></div>
          <div className="absolute -bottom-2 left-[35%] w-8 h-8 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "1.2s" }}></div>
          <div className="absolute bottom-4 left-[65%] w-4 h-4 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s", animationDuration: "0.9s" }}></div>
          <div className="absolute -bottom-1 left-[85%] w-7 h-7 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.8s", animationDuration: "1.5s" }}></div>
        </div>
        
        {/* Vùng hiển thị chữ đang gõ (Input hiển thị) */}
        <div className="absolute bottom-6 bg-white/90 backdrop-blur-md px-8 py-2 rounded-full border-4 border-[#FF7096] shadow-md min-w-[200px] text-center min-h-[48px] flex items-center justify-center">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            autoCapitalize="none"
            className="bg-transparent border-none outline-none text-2xl font-black text-[#C7486B] tracking-widest uppercase w-full text-center placeholder:text-[#C7486B]/30"
          />
        </div>
      </div>

      {/* Màn hình kết thúc (Thắng / Thua) */}
      {gameState !== "playing" && gameState !== "idle" && (
        <GameResultModal
          status={gameState === "won" ? "win" : "lose"}
          reason={gameState === "gameOver" ? "Chìm trong dung nham!" : undefined}
          score={score}
          rewardCoins={isFirstClearRef.current ? (minigameDeck?.rewardCoins || 15) : 0}
          scoreBonus={isFirstClearRef.current ? scoreBonus : 0}
          onRestart={handleStartGame}
          onClose={gameState === "won" ? onWin : onLose}
        />
      )}
    </div>
  );
};

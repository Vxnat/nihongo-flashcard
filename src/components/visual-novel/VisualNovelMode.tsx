"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VNBackground } from "./VNBackground";
import { VNCharacter } from "./VNCharacter";
import { Sparkles, X, HelpCircle } from "lucide-react";
import { VNDialogueBox } from "./VNDialogueBox";
import { VNChoices } from "./VNChoices";
import { VNWordTooltip } from "./VNWordTooltip";
import { VNInteractableWord } from "@/utils/vnTextParser";
import { VNEndScreen } from "./VNEndScreen";
import { VNTutorialOverlay } from "./VNTutorialOverlay";
import { useAppStore } from "@/store/useAppStore";
import { useLearningTimer } from "@/hooks/common/useLearningTimer";

export function VisualNovelMode() {
  const activeStoryId = useAppStore((state) => state.activeStoryId);
  const setActiveStoryId = useAppStore((state) => state.setActiveStoryId);
  const saveProgress = useAppStore((state) => state.saveProgress);
  const progress = useAppStore((state) => state.progress);
  const [storyData, setStoryData] = useState<any>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string>("node_001");
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [selectedWord, setSelectedWord] = useState<VNInteractableWord | null>(
    null,
  );
  const lastNodeRef = useRef<any>(null);
  const isFirstClearRef = useRef<boolean>(false);

  // Các state hỗ trợ Quick Menu (Lịch sử & Tự động chạy)
  const [dialogueHistory, setDialogueHistory] = useState<any[]>([]);
  const [autoMode, setAutoMode] = useState<boolean>(false);
  const [showLog, setShowLog] = useState<boolean>(false);
  const autoTimerRef = useRef<any>(null);

  // State kiểm soát màn hình hướng dẫn (Tutorial)
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  // Kiểm tra trạng thái xem hướng dẫn sau khi mount để tránh lỗi Hydration của Next.js
  useEffect(() => {
    const tutorialSeen = localStorage.getItem("vn_tutorial_seen");
    if (tutorialSeen !== "true") {
      setShowTutorial(true);
    }
  }, []);

  // Load Data
  useEffect(() => {
    if (!activeStoryId) return;

    const completed = progress[activeStoryId]?.includes("completed");
    isFirstClearRef.current = !completed;

    // Reset các chế độ khi đổi câu chuyện
    setDialogueHistory([]);
    setAutoMode(false);
    setShowLog(false);

    fetch(`/data/stories/${activeStoryId}.json`)
      .then((res) => res.json())
      .then((data) => setStoryData(data))
      .catch((err) => console.error("Failed to load VN data:", err));
  }, [activeStoryId]);

  // Lưu tiến độ khi đã đi đến cảnh kết thúc truyện
  useEffect(() => {
    if (currentNodeId === "END_STORY" && activeStoryId) {
      saveProgress(activeStoryId, ["completed"]);
    }
  }, [currentNodeId, activeStoryId, saveProgress]);

  useLearningTimer({
    isActive: true,
  });

  // Hàm xử lý nhảy sang Node tiếp theo
  const handleNextNode = (nextNodeId: string) => {
    if (nextNodeId) {
      setCurrentNodeId(nextNodeId);
    }
  };

  // Ghi nhận lịch sử hội thoại
  useEffect(() => {
    if (!storyData || !currentNodeId) return;
    const currentNode = storyData.nodes.find((n: any) => n.id === currentNodeId);
    if (currentNode) {
      setDialogueHistory((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].id === currentNode.id) {
          return prev;
        }
        return [...prev, currentNode];
      });
    }
  }, [currentNodeId, storyData]);

  // Cơ chế Tự động chạy (Auto Mode)
  useEffect(() => {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
    }

    if (autoMode && !isTyping && storyData && currentNodeId) {
      const currentNode = storyData.nodes.find((n: any) => n.id === currentNodeId);
      if (currentNode && (!currentNode.choices || currentNode.choices.length === 0) && currentNode.nextNode) {
        autoTimerRef.current = setTimeout(() => {
          handleNextNode(currentNode.nextNode);
        }, 2500);
      }
    }

    return () => {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
      }
    };
  }, [autoMode, isTyping, currentNodeId, storyData]);

  if (!storyData) {
    return (
      <div className="w-full max-w-md mx-auto h-[600px] bg-[#FFE2D1]/30 animate-pulse rounded-[3rem] flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-[#FF9F1C] animate-spin" />
      </div>
    );
  }

  const currentNode = storyData.nodes.find((n: any) => n.id === currentNodeId);

  // Lưu lại Node cuối cùng để giữ hình nền không bị mất khi End Story
  if (currentNode) {
    lastNodeRef.current = currentNode;
  }
  const displayNode = currentNode || lastNodeRef.current;
  const currentCharacterMeta = storyData.characters[displayNode?.characterId];

  if (!displayNode) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-3xl border-4 border-green-200 text-center text-green-600 font-bold">
        Lỗi: Không tìm thấy nội dung truyện!
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px] sm:h-[700px] overflow-hidden rounded-[2.5rem] border-4 border-[#FFE2D1] shadow-2xl bg-[#FFFDF5]">
      {/* NÚT THOÁT */}
      <button
        onClick={() => setActiveStoryId(null)}
        className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/30 backdrop-blur-md hover:bg-white/90 border-2 border-white/50 rounded-full flex items-center justify-center text-zinc-700 transition-all active:scale-90 shadow-sm"
      >
        <X size={20} strokeWidth={3} />
      </button>

      {/* HÌNH NỀN */}
      <VNBackground src={displayNode.background} />

      {/* NHÂN VẬT (Nằm ở góc lấp ló sau khung chat) */}
      <div
        className={`absolute bottom-[15%] pointer-events-none z-10 ${currentCharacterMeta?.position === "left" ? "left-[-10px]" : "right-[-10px]"}`}
      >
        <VNCharacter
          characterId={displayNode.characterId}
          emotion={displayNode.emotion}
          position={currentCharacterMeta?.position}
          spriteUrl={currentCharacterMeta?.sprites?.[displayNode.emotion]}
          isSpeaking={isTyping}
        />
      </div>

      {/* NÚT LỰA CHỌN (Chỉ hiện khi chữ đã chạy xong và có lựa chọn) */}
      {currentNode && !isTyping && currentNode.choices && (
        <VNChoices choices={currentNode.choices} onSelect={handleNextNode} />
      )}

      {/* THANH ĐIỀU KHIỂN NHANH (QUICK MENU) */}
      {currentNode && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-auto select-none">
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`text-[10px] font-black tracking-widest uppercase h-10 px-4 rounded-full border-2 transition-all active:scale-90 shadow-sm backdrop-blur-md flex items-center justify-center
              ${autoMode
                ? "bg-sky-500/80 border-sky-400 text-white shadow-sky-200/50"
                : "bg-white/30 border-white/50 text-zinc-700 hover:bg-white/90"
              }
            `}
          >
            Auto
          </button>
          <button
            onClick={() => setShowLog(true)}
            className="text-[10px] font-black tracking-widest uppercase h-10 px-4 bg-white/30 backdrop-blur-md hover:bg-white/90 border-2 border-white/50 text-zinc-700 rounded-full transition-all active:scale-90 shadow-sm flex items-center justify-center"
          >
            Lịch sử
          </button>
          <button
            onClick={() => setShowTutorial(true)}
            className="w-10 h-10 bg-white/30 backdrop-blur-md hover:bg-white/90 border-2 border-white/50 text-zinc-700 rounded-full transition-all active:scale-90 shadow-sm flex items-center justify-center"
            title="Hướng dẫn"
          >
            <HelpCircle size={18} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* KHU VỰC CHATBOX THỰC TẾ */}
      {currentNode && (
        <VNDialogueBox
          node={currentNode}
          characterMeta={currentCharacterMeta}
          onNext={handleNextNode}
          onTypingComplete={setIsTyping}
          onWordClick={setSelectedWord}
        />
      )}

      {/* POP-UP TỪ VỰNG */}
      <VNWordTooltip
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
      />

      {/* OVERLAY LỊCH SỬ THOẠI (LOG OVERLAY) */}
      <AnimatePresence>
        {showLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/70 backdrop-blur-md z-50 flex flex-col p-6 pointer-events-auto"
          >
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-4">
              <span className="text-sm font-black tracking-widest text-zinc-400 uppercase">Lịch sử thoại</span>
              <button
                onClick={() => setShowLog(false)}
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
              {dialogueHistory.length === 0 ? (
                <p className="text-zinc-500 text-center font-bold mt-10">Chưa có hội thoại nào được ghi lại.</p>
              ) : (
                dialogueHistory.map((item, idx) => {
                  const charMeta = storyData.characters[item.characterId];
                  return (
                    <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                      <span
                        className="text-xs font-black tracking-wider block"
                        style={{ color: charMeta?.color || "#FF9F1C" }}
                      >
                        {charMeta?.name || "Unknown"}
                      </span>
                      <p className="text-zinc-200 font-bold text-sm leading-relaxed mt-1 select-all">
                        {item.dialogue.jp}
                      </p>
                      <p className="text-zinc-400 font-medium text-xs leading-relaxed mt-1 pl-2 border-l border-zinc-800">
                        {item.dialogue.vi}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MÀN HÌNH KẾT THÚC TRUYỆN */}
      {currentNodeId === "END_STORY" && (
        <VNEndScreen
          rewardCoins={
            isFirstClearRef.current ? storyData.meta.rewardCoins || 20 : 0
          }
          onClose={() => setActiveStoryId(null)}
        />
      )}

      {/* MÀN HÌNH HƯỚNG DẪN CHƠI */}
      <AnimatePresence>
        {showTutorial && (
          <VNTutorialOverlay
            onClose={() => {
              setShowTutorial(false);
              localStorage.setItem("vn_tutorial_seen", "true");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

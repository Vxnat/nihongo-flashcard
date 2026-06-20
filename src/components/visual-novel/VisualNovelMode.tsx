"use client";

import React, { useState, useEffect, useRef } from "react";
import { VNBackground } from "./VNBackground";
import { VNCharacter } from "./VNCharacter";
import { Sparkles, X } from "lucide-react";
import { VNDialogueBox } from "./VNDialogueBox";
import { VNChoices } from "./VNChoices";
import { VNWordTooltip } from "./VNWordTooltip";
import { VNInteractableWord } from "@/utils/vnTextParser";
import { VNEndScreen } from "./VNEndScreen";
import { useAppStore } from "@/store/useAppStore";

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

  // Load Data
  useEffect(() => {
    if (!activeStoryId) return;

    const completed = progress[activeStoryId]?.includes("completed");
    isFirstClearRef.current = !completed;

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

  // Hàm xử lý nhảy sang Node tiếp theo
  const handleNextNode = (nextNodeId: string) => {
    if (nextNodeId) {
      setCurrentNodeId(nextNodeId);
    }
  };

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
        />
      </div>

      {/* NÚT LỰA CHỌN (Chỉ hiện khi chữ đã chạy xong và có lựa chọn) */}
      {currentNode && !isTyping && currentNode.choices && (
        <VNChoices choices={currentNode.choices} onSelect={handleNextNode} />
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

      {/* MÀN HÌNH KẾT THÚC TRUYỆN */}
      {currentNodeId === "END_STORY" && (
        <VNEndScreen
          rewardCoins={
            isFirstClearRef.current ? storyData.meta.rewardCoins || 20 : 0
          }
          onClose={() => setActiveStoryId(null)}
        />
      )}
    </div>
  );
}

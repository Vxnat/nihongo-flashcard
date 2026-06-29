import React, { useEffect, useMemo } from "react";
import { parseVNText, VNInteractableWord } from "@/utils/vnTextParser";
import { useTypewriter } from "@/hooks/common/useTypewriter";

interface VNDialogueBoxProps {
  node: any;
  characterMeta: any;
  onNext: (nextNodeId: string) => void;
  onTypingComplete: (isTyping: boolean) => void;
  onWordClick?: (word: VNInteractableWord) => void;
}

export function VNDialogueBox({
  node,
  characterMeta,
  onNext,
  onTypingComplete,
  onWordClick,
}: VNDialogueBoxProps) {
  // 1. Quét câu thoại tiếng Nhật, bọc các từ vựng interactableWords thành Nút có thể click
  const parsedNodes = useMemo(() => {
    return parseVNText(node.dialogue.jp, node.interactableWords || [], onWordClick);
  }, [node.dialogue.jp, node.interactableWords, onWordClick]);

  // 2. Chạy hiệu ứng máy đánh chữ (Typewriter)
  const { displayedNodes, isTyping, skipTypewriter } = useTypewriter(
    parsedNodes,
    node.id, // ID thay đổi -> Typewriter reset lại
    30 // Tốc độ chạy chữ: 30ms/ký tự
  );

  // 3. Báo lên component cha trạng thái chữ đang chạy hay dừng (để cha biết lúc nào hiện VNChoices)
  useEffect(() => {
    onTypingComplete(isTyping);
  }, [isTyping, onTypingComplete]);

  // 4. Xử lý Logic khi User tap vào khung thoại
  const handleClick = () => {
    if (isTyping) {
      skipTypewriter(); // Bấm vội -> Dừng hiệu ứng hiện cả câu ngay
    } else {
      // Nếu chữ đã gõ xong, và KHÔNG CÓ lựa chọn nào, thì mới cho next câu tiếp theo
      if (!node.choices || node.choices.length === 0) {
        if (node.nextNode) onNext(node.nextNode);
      }
    }
  };

  return (
    <div className="absolute bottom-0 w-full p-4 z-20" onClick={handleClick}>
      <div className="bg-white/75 backdrop-blur-md border border-white/50 rounded-[2rem] p-6 min-h-[165px] shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] cursor-pointer transition-all hover:bg-white/80 active:scale-[0.99] relative">

        {/* Bảng tên nhân vật (Nổi lên góc trên trái) */}
        <div
          className="absolute -top-4 left-6 text-sm font-black px-4 py-1.5 rounded-full border border-white/60 backdrop-blur-md shadow-sm transition-all"
          style={{
            color: characterMeta?.color || "#FF9F1C",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            borderColor: characterMeta?.color || "#FFE2D1",
            boxShadow: `0 4px 12px rgba(0, 0, 0, 0.04)`,
          }}
        >
          {characterMeta?.name || "Unknown"}
        </div>

        <div className="mt-2">
          <p className="text-zinc-800 font-bold text-xl leading-relaxed min-h-[32px]">
            {displayedNodes}
          </p>
          <div className={`mt-3 pt-3 border-t border-dashed border-[#FFE2D1] transition-opacity duration-500 ${isTyping ? 'opacity-0' : 'opacity-100'}`}>
            <p className="text-[#5390D9] font-medium text-lg leading-relaxed">
              {node.dialogue.vi}
            </p>
          </div>
        </div>

        {!isTyping && (!node.choices || node.choices.length === 0) && (
          <div className="absolute bottom-4 right-6 flex items-center gap-1.5 text-xs text-zinc-400/80 font-bold tracking-widest uppercase animate-bounce pointer-events-none select-none">
            <svg
              className="w-3.5 h-3.5 text-zinc-400/80"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
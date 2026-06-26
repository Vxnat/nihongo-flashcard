"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";
import HanziWriter from "hanzi-writer";
import { Eye, EyeOff } from "lucide-react";

interface KanjiCanvasProps {
  character: string; // Chữ Kanji cần vẽ
  onCorrectStroke?: (strokeData: any) => void; // Trigger khi vẽ đúng 1 nét
  onMistake?: (strokeData: any) => void; // Trigger khi vẽ sai nét / sai thứ tự
  onComplete?: (summaryData: any) => void; // Trigger khi vẽ xong toàn bộ chữ
}

export interface KanjiCanvasRef {
  animateCharacter: () => void;
  resetCanvas: () => void;
  peekNextStroke: () => void;
  forceComplete: () => void;
}

export const KanjiCanvas = forwardRef<KanjiCanvasRef, KanjiCanvasProps>(({
  character,
  onCorrectStroke,
  onMistake,
  onComplete,
}, ref) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const currentStrokeRef = useRef(0);

  const [strokeStarts, setStrokeStarts] = useState<{x: number, y: number}[]>([]);
  const [showNumbers, setShowNumbers] = useState(true);
  const [currentStroke, setCurrentStroke] = useState(0);

  useImperativeHandle(ref, () => ({
    animateCharacter: () => {
      if (writerRef.current) {
        writerRef.current.animateCharacter({
          onComplete: () => {
            setTimeout(() => {
              if (writerRef.current) {
                // Khởi động lại chế độ Quiz sau 1 giây
                writerRef.current.quiz({
                  onMistake: (strokeData) => {
                    if (onMistake) onMistake(strokeData);
                  },
                  onCorrectStroke: (strokeData) => {
                    currentStrokeRef.current = strokeData.strokeNum + 1;
                    setCurrentStroke(strokeData.strokeNum + 1);
                    if (onCorrectStroke) onCorrectStroke(strokeData);
                  },
                  onComplete: (summaryData) => {
                    if (onComplete) onComplete(summaryData);
                  },
                });
              }
            }, 500);
          },
        });
      }
    },
    resetCanvas: () => {
      if (writerRef.current) {
        writerRef.current.hideCharacter();
        currentStrokeRef.current = 0;
        setCurrentStroke(0);
        writerRef.current.quiz({
          onMistake: (strokeData) => {
            if (onMistake) onMistake(strokeData);
          },
          onCorrectStroke: (strokeData) => {
            currentStrokeRef.current = strokeData.strokeNum + 1;
            setCurrentStroke(strokeData.strokeNum + 1);
            if (onCorrectStroke) onCorrectStroke(strokeData);
          },
          onComplete: (summaryData) => {
            if (onComplete) onComplete(summaryData);
          },
        });
      }
    },
    peekNextStroke: () => {
      if (writerRef.current) {
        // highlightStroke làm nhấp nháy nét mà không reset tiến trình Quiz
        writerRef.current.highlightStroke(currentStrokeRef.current);
      }
    },
    forceComplete: () => {
      if (writerRef.current) {
        writerRef.current.animateCharacter({
          onComplete: () => {
            setCurrentStroke(100); // Ẩn hết số sau khi vẽ xong
            if (onComplete) onComplete({ forced: true });
          }
        });
      }
    }
  }));

  useEffect(() => {
    // Nếu không có thẻ div hoặc không có chữ Hán thì bỏ qua
    if (!targetRef.current || !character) return;
    currentStrokeRef.current = 0; // Reset số đếm nét khi chữ đổi
    setCurrentStroke(0);
    setStrokeStarts([]);

    HanziWriter.loadCharacterData(character).then((charData: any) => {
      const starts = charData.medians.map((median: any) => median[0]);
      const scale = (280 - 40) / 1024;
      const mapped = starts.map((pt: any) => ({
        x: 20 + pt[0] * scale,
        y: 280 - 20 - pt[1] * scale
      }));
      setStrokeStarts(mapped);
    }).catch((err: any) => {
      console.error("Failed to load character medians", err);
    });

    // Dọn dẹp nội dung cũ nếu chữ Hán thay đổi (chuyển sang màn mới)
    if (writerRef.current) {
      targetRef.current.innerHTML = "";
    }

    // Khởi tạo HanziWriter
    const writer = HanziWriter.create(targetRef.current, character, {
      width: 280,
      height: 280,
      padding: 20,
      showOutline: true, // Hiện nét mờ để người dùng đồ theo
      strokeAnimationSpeed: 2, // Tốc độ hoạt ảnh
      delayBetweenStrokes: 50,
      outlineColor: "#E4E4E7", // Màu nét mờ (Kẽm nhạt - Zinc 200)
      drawingColor: "#18181B", // Màu mực khi người dùng đang vẽ (Đen - Zinc 900)
      strokeColor: "#18181B", // Màu nét mực sau khi vẽ xong
      highlightColor: "#FF7096", // Màu báo lỗi khi vẽ sai (Hồng/Đỏ)
      drawingWidth: 40, // Độ to của ngòi bút lông
      showHintAfterMisses: 1, // Hiện gợi ý chớp nháy sau 1 lần vẽ sai
      
      // Tùy chọn: Nếu sau này cần force nét chuẩn Nhật (KanjiVG), 
      // ta có thể ghi đè charDataLoader ở đây. Hiện tại dùng mặc định là đủ tốt cho N5.
    });

    writerRef.current = writer;

    // Bật chế độ "Quiz" (Luyện viết)
    writer.quiz({
      onMistake: (strokeData) => {
        if (onMistake) onMistake(strokeData);
      },
      onCorrectStroke: (strokeData) => {
        currentStrokeRef.current = strokeData.strokeNum + 1;
        setCurrentStroke(strokeData.strokeNum + 1);
        if (onCorrectStroke) onCorrectStroke(strokeData);
      },
      onComplete: (summaryData) => {
        if (onComplete) onComplete(summaryData);
      },
    });

    // Cleanup function: Xóa thẻ SVG khi component unmount
    return () => {
      if (targetRef.current) {
        targetRef.current.innerHTML = "";
      }
    };
  }, [character, onCorrectStroke, onMistake, onComplete]);

  return (
    <div className="relative flex items-center justify-center p-2 bg-[#FDFBF7] rounded-2xl shadow-sm border-4 border-zinc-200 overflow-hidden touch-none select-none">
      
      {/* Nút bật/tắt hiển thị số thứ tự nét */}
      <button 
        onClick={() => setShowNumbers(!showNumbers)}
        className="absolute top-2 right-2 z-40 p-1.5 bg-white/80 rounded-lg text-zinc-400 hover:text-[#06D6A0] border border-zinc-200 shadow-sm transition-all active:scale-90"
        title="Bật/Tắt số thứ tự nét"
      >
        {showNumbers ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>

      {/* Khung kẻ ô ly luyện chữ (Trục chữ thập + Đường chéo) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
        <div className="w-full h-[2px] bg-red-400/20 absolute border-dashed border-t-[2px] border-red-400/20" />
        <div className="h-full w-[2px] bg-red-400/20 absolute border-dashed border-l-[2px] border-red-400/20" />
        <div className="absolute inset-2 border-2 border-red-400/20" />
      </div>

      {/* Vùng chứa thẻ SVG của Hanzi Writer */}
      <div ref={targetRef} className="relative z-10 cursor-crosshair" />

      {/* Overlay chứa số thứ tự nét */}
      <div className="absolute inset-2 z-30 pointer-events-none">
        {showNumbers && strokeStarts.map((pt, idx) => {
          if (idx < currentStroke) return null; // Ẩn đi các nét đã vẽ xong
          
          const isCurrent = idx === currentStroke;
          return (
            <div
              key={idx}
              className={`absolute flex items-center justify-center rounded-full font-bold transition-all duration-300 ${
                isCurrent 
                  ? "w-5 h-5 bg-[#06D6A0] text-white text-xs shadow-md scale-110 z-30 ring-2 ring-white" 
                  : "w-4 h-4 bg-zinc-400/30 text-zinc-600 text-[10px] opacity-50 z-20"
              }`}
              style={{
                left: pt.x - (isCurrent ? 12 : 8),
                top: pt.y - (isCurrent ? 12 : 8),
              }}
            >
              {idx + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
});

KanjiCanvas.displayName = "KanjiCanvas";
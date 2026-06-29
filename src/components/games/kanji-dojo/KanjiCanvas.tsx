"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback } from "react";
import HanziWriter from "hanzi-writer";
import { Eye, EyeOff } from "lucide-react";

export const PALETTE_CONFIGS = {
  sakura: {
    arrow: "#FF85A1",
    startCircle: "#FFB5A7",
  },
  mint: {
    arrow: "#80FFDB",
    startCircle: "#A2D2FF",
  },
  lavender: {
    arrow: "#BDB2FF",
    startCircle: "#D8B4FE",
  },
  peach: {
    arrow: "#FFCAD4",
    startCircle: "#FAD2E1",
  },
};

interface KanjiCanvasProps {
  character: string; // Chữ Kanji cần vẽ
  onCorrectStroke?: (strokeData: any) => void; // Trigger khi vẽ đúng 1 nét
  onMistake?: (strokeData: any) => void; // Trigger khi vẽ sai nét / sai thứ tự
  onComplete?: (summaryData: any) => void; // Trigger khi vẽ xong toàn bộ chữ
  paletteType?: keyof typeof PALETTE_CONFIGS;
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
  paletteType = "sakura",
}, ref) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const currentStrokeRef = useRef(0);
  const idleTimeoutRef = useRef<any>(null);

  const [strokeStarts, setStrokeStarts] = useState<{ x: number, y: number }[]>([]);
  const [strokePaths, setStrokePaths] = useState<{ start: { x: number; y: number }; pathData: string }[]>([]);

  // Chế độ tự động hiện gợi ý (true = luôn hiện, false = tự học - chỉ hiện khi idle/vẽ sai)
  const [autoHintMode, setAutoHintMode] = useState(true);
  // Trạng thái hiển thị thực tế của các số gợi ý
  const [showHint, setShowHint] = useState(true);
  const [currentStroke, setCurrentStroke] = useState(0);

  // Tông màu hiển thị gợi ý hiện tại
  const [currentPalette, setCurrentPalette] = useState<keyof typeof PALETTE_CONFIGS>(paletteType);

  useEffect(() => {
    setCurrentPalette(paletteType);
  }, [paletteType]);

  // Sử dụng ref để lưu trữ các hàm callback và state động, giúp giữ cho các hàm xử lý sự kiện stable
  // và tránh việc khởi tạo lại HanziWriter không cần thiết khi autoHintMode thay đổi.
  const callbacksRef = useRef<any>(null);
  callbacksRef.current = { onCorrectStroke, onMistake, autoHintMode, resetIdleTimer };

  // Hàm đếm ngược thời gian đứng im (Idle)
  function resetIdleTimer() {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    const { autoHintMode: mode } = callbacksRef.current;
    if (mode) {
      setShowHint(true);
      return;
    }
    // Chế độ tự học: 4s không tương tác sẽ tự hiện gợi ý
    idleTimeoutRef.current = setTimeout(() => {
      setShowHint(true);
    }, 4000);
  }

  // Handler xử lý vẽ đúng nét
  const handleCorrectStrokeInternal = useCallback((strokeData: any) => {
    currentStrokeRef.current = strokeData.strokeNum + 1;
    setCurrentStroke(strokeData.strokeNum + 1);

    const { autoHintMode: mode, onCorrectStroke: cb } = callbacksRef.current;
    if (!mode) {
      setShowHint(false); // Vẽ đúng thì ẩn ngay
      resetIdleTimer(); // Đếm ngược lại
    }

    if (cb) cb(strokeData);
  }, []);

  // Handler xử lý vẽ sai nét
  const handleMistakeInternal = useCallback((strokeData: any) => {
    const { autoHintMode: mode, onMistake: cb } = callbacksRef.current;
    if (!mode) {
      setShowHint(true); // Vẽ sai thì lập tức hiện gợi ý cứu cánh
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      // Ẩn gợi ý sau 2 giây và kích hoạt lại idle timer
      idleTimeoutRef.current = setTimeout(() => {
        setShowHint(false);
        resetIdleTimer();
      }, 2000);
    }

    if (cb) cb(strokeData);
  }, []);

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

        if (!autoHintMode) {
          setShowHint(false);
          resetIdleTimer();
        } else {
          setShowHint(true);
        }

        writerRef.current.quiz({
          onMistake: handleMistakeInternal,
          onCorrectStroke: handleCorrectStrokeInternal,
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

        // Hiện gợi ý trong 3 giây khi nhấn nhìn lén ở chế độ tự học
        if (!autoHintMode) {
          setShowHint(true);
          if (idleTimeoutRef.current) {
            clearTimeout(idleTimeoutRef.current);
          }
          idleTimeoutRef.current = setTimeout(() => {
            setShowHint(false);
            resetIdleTimer();
          }, 3000);
        }
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

  // Lắng nghe hành động chạm/click của người học trên canvas để ẩn gợi ý và reset idle timer
  useEffect(() => {
    const container = targetRef.current;
    if (!container) return;

    const handlePointerDown = () => {
      const { autoHintMode: mode } = callbacksRef.current;
      if (!mode) {
        setShowHint(false); // Người dùng chạm tay vẽ thì tạm thời ẩn gợi ý số
        resetIdleTimer(); // Khởi động lại thời gian chờ idle
      }
    };

    container.addEventListener("pointerdown", handlePointerDown);
    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    // Nếu không có thẻ div hoặc không có chữ Hán thì bỏ qua
    if (!targetRef.current || !character) return;
    currentStrokeRef.current = 0; // Reset số đếm nét khi chữ đổi
    setCurrentStroke(0);
    setStrokeStarts([]);
    setStrokePaths([]);

    HanziWriter.loadCharacterData(character).then((charData: any) => {
      // Sử dụng giá trị dịch chuyển và tỉ lệ chuẩn từ HanziWriter.getScalingTransform(280, 280, 20)
      // giúp khắc phục triệt để lỗi lệch tọa độ Y khoảng 29px.
      const scale = 0.234375;
      const yOffset = 230.9375;
      const paths = charData.medians.map((median: any[]) => {
        const mappedPoints = median.map((pt: any) => ({
          x: 20 + pt[0] * scale,
          y: yOffset - pt[1] * scale
        }));
        const start = mappedPoints[0] || { x: 0, y: 0 };
        const pathData = mappedPoints.length > 0
          ? `M ${mappedPoints[0].x} ${mappedPoints[0].y} ` + mappedPoints.slice(1).map((pt: any) => `L ${pt.x} ${pt.y}`).join(" ")
          : "";
        return { start, pathData };
      });
      setStrokePaths(paths);

      const starts = paths.map((p: any) => p.start);
      setStrokeStarts(starts);
    }).catch((err: any) => {
      console.error("Failed to load character medians", err);
    });

    // Dọn dẹp nội dung cũ nếu chữ Hán thay đổi (chuyển sang màn mới)
    if (writerRef.current) {
      targetRef.current.innerHTML = "";
    }

    // Reset gợi ý số và bộ đếm thời gian
    if (!autoHintMode) {
      setShowHint(false);
      resetIdleTimer();
    } else {
      setShowHint(true);
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
      onMistake: handleMistakeInternal,
      onCorrectStroke: handleCorrectStrokeInternal,
      onComplete: (summaryData) => {
        if (onComplete) onComplete(summaryData);
      },
    });

    // Cleanup function: Xóa thẻ SVG khi component unmount
    return () => {
      if (targetRef.current) {
        targetRef.current.innerHTML = "";
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [character, onComplete]); // Chỉ khởi động lại HanziWriter khi character hoặc onComplete thay đổi

  return (
    <div className="relative flex items-center justify-center p-2 bg-[#FDFBF7] rounded-2xl shadow-sm border-4 border-zinc-200 overflow-hidden touch-none select-none">

      {/* Nút bật/tắt chế độ tự động gợi ý */}
      <button
        onClick={() => {
          const nextMode = !autoHintMode;
          setAutoHintMode(nextMode);
          setShowHint(nextMode);
          if (!nextMode) {
            resetIdleTimer();
          } else if (idleTimeoutRef.current) {
            clearTimeout(idleTimeoutRef.current);
          }
        }}
        className="absolute top-2 right-2 z-40 p-1.5 bg-white/80 rounded-lg text-zinc-400 hover:text-[#06D6A0] border border-zinc-200 shadow-sm transition-all active:scale-90"
        title={autoHintMode ? "Chuyển sang Chế độ Tự học" : "Chuyển sang Luôn hiển thị gợi ý"}
      >
        {autoHintMode ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>

      {/* Nút chuyển đổi các tông màu gợi ý */}
      <button 
        onClick={() => {
          const palettes = Object.keys(PALETTE_CONFIGS) as (keyof typeof PALETTE_CONFIGS)[];
          const nextIndex = (palettes.indexOf(currentPalette) + 1) % palettes.length;
          setCurrentPalette(palettes[nextIndex]);
        }}
        className="absolute top-2 left-2 z-40 p-1.5 bg-white/80 rounded-lg text-zinc-400 hover:text-amber-500 border border-zinc-200 shadow-sm transition-all active:scale-90 flex items-center justify-center"
        title="Đổi tông màu gợi ý"
      >
        <span className="text-sm">🎨</span>
      </button>

      {/* Khung kẻ ô ly luyện chữ (Trục chữ thập + Đường chéo) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
        <div className="w-full h-[2px] bg-red-400/20 absolute border-dashed border-t-[2px] border-red-400/20" />
        <div className="h-full w-[2px] bg-red-400/20 absolute border-dashed border-l-[2px] border-red-400/20" />
        <div className="absolute inset-2 border-2 border-red-400/20" />
      </div>

      {/* Vùng chứa thẻ SVG của Hanzi Writer */}
      <div ref={targetRef} className="relative z-10 cursor-crosshair" />

      {/* Overlay chứa các số thứ tự nét dạng Sliding Window (tối đa 3 số gần nhất) */}
      {showHint && strokePaths.length > 0 && (
        <svg
          className="absolute inset-2 z-30 pointer-events-none"
          width="280"
          height="280"
          viewBox="0 0 280 280"
        >
          {strokePaths.map((path, idx) => {
            // Chỉ hiển thị các nét chưa vẽ
            if (idx < currentStroke) return null;

            const relativeIndex = idx - currentStroke;
            // Chỉ hiển thị tối đa 3 số nét gần nhất
            if (relativeIndex > 2) return null;

            const isCurrent = relativeIndex === 0;
            const isSecond = relativeIndex === 1;

            // Thiết lập kích thước, độ mờ và màu sắc theo phân cấp thị giác
            let r = 6.5;
            let opacity = 0.3;
            let fill = "#D4D4D8"; // Nét thứ 3 mặc định màu xám pastel nhạt
            let fontSize = "7px";
            let strokeWidth = "1.5";

            if (isCurrent) {
              r = 10;
              opacity = 1.0;
              fill = PALETTE_CONFIGS[currentPalette].arrow; // Hồng Sakura đậm
              fontSize = "11px";
              strokeWidth = "2.5";
            } else if (isSecond) {
              r = 8;
              opacity = 0.6;
              fill = PALETTE_CONFIGS[currentPalette].startCircle; // Hồng Sakura nhạt
              fontSize = "8.5px";
              strokeWidth = "2";
            }

            return (
              <g
                key={idx}
                style={{
                  opacity,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
                className={isCurrent ? "animate-pulse" : ""}
              >
                {/* Vòng tròn nền chứa số */}
                <circle
                  cx={path.start.x}
                  cy={path.start.y}
                  r={r}
                  fill={fill}
                  stroke="#FFF"
                  strokeWidth={strokeWidth}
                />
                {/* Chữ số hiển thị */}
                <text
                  x={path.start.x}
                  y={path.start.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#FFF"
                  fontSize={fontSize}
                  fontWeight="900"
                  fontFamily="system-ui, sans-serif"
                >
                  {idx + 1}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
});

KanjiCanvas.displayName = "KanjiCanvas";
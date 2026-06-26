import { useState, useEffect, useCallback } from "react";
import { playAudio } from "@/utils/tts";
import { FlashcardData } from "@/types/flashcard";

/**
 * Custom hook quản lý vòng lặp phát âm tự động và chuyển thẻ ở chế độ Podcast.
 */
export function usePodcastMode(
  activeCards: FlashcardData[],
  currentIndex: number,
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>,
  isFlipped: boolean,
  setIsFlipped: React.Dispatch<React.SetStateAction<boolean>>,
  setExitDir: React.Dispatch<React.SetStateAction<"left" | "right" | "none">>,
  globalMode: "swipe" | "typing" | "podcast"
) {
  const [podcastIsPlaying, setPodcastIsPlaying] = useState(false);
  const [podcastSpeed, setPodcastSpeed] = useState<"slow" | "normal" | "fast">("normal");

  /**
   * Hàm chuyển sang thẻ kế tiếp hoặc quay lại thẻ trước ở chế độ Podcast
   */
  const handlePodcastNext = useCallback(
    (direction: 1 | -1 = 1) => {
      if (activeCards.length === 0) return;
      setExitDir(direction === 1 ? "left" : "right");
      setTimeout(() => {
        setCurrentIndex((prev) => {
          if (direction === 1) return (prev + 1) % activeCards.length;
          return prev === 0 ? activeCards.length - 1 : prev - 1;
        });
        setIsFlipped(false);
        setExitDir("none");
      }, 400);
    },
    [activeCards.length, setExitDir, setCurrentIndex, setIsFlipped]
  );

  // Vòng lặp quản lý tự động phát âm thanh và chuyển thẻ
  useEffect(() => {
    if (
      globalMode !== "podcast" ||
      !podcastIsPlaying ||
      activeCards.length === 0
    ) {
      return;
    }

    let timeout: NodeJS.Timeout;

    const getPodcastDelays = () => {
      switch (podcastSpeed) {
        case "slow":
          return { front: 3000, back: 4000 };
        case "fast":
          return { front: 1000, back: 1500 };
        default:
          return { front: 1500, back: 2500 };
      }
    };

    const delays = getPodcastDelays();

    if (!isFlipped) {
      // Đang ở mặt trước (tiếng Nhật), chờ hết thời gian front để tự lật xem nghĩa
      timeout = setTimeout(() => {
        setIsFlipped(true);
        if (activeCards[currentIndex]) {
          playAudio(activeCards[currentIndex].word);
        }
      }, delays.front);
    } else {
      // Đang ở mặt sau (tiếng Việt), chờ hết thời gian back để tự chuyển sang thẻ tiếp
      timeout = setTimeout(() => handlePodcastNext(1), delays.back);
    }

    return () => clearTimeout(timeout);
  }, [
    globalMode,
    podcastIsPlaying,
    isFlipped,
    currentIndex,
    podcastSpeed,
    activeCards,
    handlePodcastNext,
    setIsFlipped,
  ]);

  return {
    podcastIsPlaying,
    setPodcastIsPlaying,
    podcastSpeed,
    setPodcastSpeed,
    handlePodcastNext,
  };
}

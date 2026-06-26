import { useState, useEffect } from "react";

/**
 * Custom hook quản lý trạng thái Toàn màn hình (Fullscreen API)
 * và đăng ký các phím tắt bàn phím vật lý (Phím cách lật thẻ, phím mũi tên chuyển bài).
 */
export function useFullscreenAndShortcuts(
  globalMode: "swipe" | "typing" | "podcast",
  podcastIsPlaying: boolean,
  setPodcastIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  handlePodcastNext: (direction?: 1 | -1) => void,
  handleFlip: () => void,
  triggerSwipe: (dir: "left" | "right") => void
) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(false);

  // Đăng ký và kiểm tra Fullscreen API
  useEffect(() => {
    const docEl = document.documentElement as any;
    const isSupported = !!(
      docEl.requestFullscreen ||
      docEl.webkitRequestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.msRequestFullscreen
    );
    setIsFullscreenSupported(isSupported);

    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(
        !!(
          doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
        )
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  // Hàm chuyển đổi toàn màn hình
  const toggleFullscreen = () => {
    const docEl = document.documentElement as any;
    const doc = document as any;
    const isCurrentlyFullscreen = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    if (!isCurrentlyFullscreen) {
      if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
      else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
      else if (docEl.mozRequestFullScreen) docEl.mozRequestFullScreen();
      else if (docEl.msRequestFullscreen) docEl.msRequestFullscreen();
    } else {
      if (doc.exitFullscreen) doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
      else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen();
      else if (doc.msExitFullscreen) doc.msExitFullscreen();
    }
  };

  // Lắng nghe phím tắt bàn phím
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Bỏ qua nếu người dùng đang gõ phím trong khung nhập liệu
      if (["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)) {
        return;
      }

      if (globalMode === "podcast") {
        switch (event.code) {
          case "Space":
            event.preventDefault();
            setPodcastIsPlaying((p) => !p);
            break;
          case "ArrowRight":
            handlePodcastNext(1);
            break;
          case "ArrowLeft":
            handlePodcastNext(-1);
            break;
        }
        return;
      }

      switch (event.code) {
        case "Space":
          event.preventDefault();
          handleFlip();
          break;
        case "ArrowRight":
          triggerSwipe("right");
          break;
        case "ArrowLeft":
          triggerSwipe("left");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    globalMode,
    podcastIsPlaying,
    setPodcastIsPlaying,
    handlePodcastNext,
    handleFlip,
    triggerSwipe,
  ]);

  return {
    isFullscreen,
    isFullscreenSupported,
    toggleFullscreen,
  };
}

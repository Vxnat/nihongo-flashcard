import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

interface UseLearningTimerOptions {
  isActive: boolean;
  forceActive?: boolean;
  onActive?: () => void;
  onAfk?: () => void;
}

export function useLearningTimer({
  isActive,
  forceActive = false,
  onActive,
  onAfk,
}: UseLearningTimerOptions) {
  const addLearningTime = useAppStore((state) => state.addLearningTime);

  // Dùng refs để giữ nguyên các giá trị mới nhất mà không kích hoạt lại useEffect
  const forceActiveRef = useRef(forceActive);
  const onActiveRef = useRef(onActive);
  const onAfkRef = useRef(onAfk);
  const isUserActiveRef = useRef(true);

  useEffect(() => {
    forceActiveRef.current = forceActive;
    onActiveRef.current = onActive;
    onAfkRef.current = onAfk;
  }, [forceActive, onActive, onAfk]);

  useEffect(() => {
    if (!isActive || !addLearningTime) return;

    isUserActiveRef.current = true;
    let afkTimer: NodeJS.Timeout;

    const resetAfk = () => {
      isUserActiveRef.current = true;
      if (onActiveRef.current) {
        onActiveRef.current();
      }
      clearTimeout(afkTimer);
      afkTimer = setTimeout(() => {
        isUserActiveRef.current = false;
        if (onAfkRef.current) {
          onAfkRef.current();
        }
      }, 30000); // 30 giây không tương tác sẽ coi là AFK
    };

    // Đăng ký lắng nghe tương tác người dùng
    window.addEventListener("mousemove", resetAfk);
    window.addEventListener("keydown", resetAfk);
    window.addEventListener("touchstart", resetAfk);
    window.addEventListener("click", resetAfk);

    resetAfk();

    // Mỗi 5 giây chạy kiểm tra và cộng dồn 5 giây học nếu người dùng đang hoạt động
    const trackingInterval = setInterval(() => {
      if (isUserActiveRef.current || forceActiveRef.current) {
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
  }, [isActive, addLearningTime]);
}

import { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useSystemItems } from "@/hooks/shiba-room/useSystemItems";

/**
 * Custom hook quản lý linh vật đồng hành Shiba và chuỗi Combo trả lời đúng.
 * Tự động bắn pháo hoa Confetti và tăng tiến trình nhiệm vụ ngày tại các mốc combo ấn tượng.
 */
export function useMascotAndCombo(appMode: string, isTypingActive: boolean) {
  const { gachaPool } = useSystemItems();
  const equippedVoicePack = useAppStore((state) => state.userStats.equippedSlots?.voice);
  const updateQuestProgress = useAppStore((state) => state.updateQuestProgress);

  // --- MASCOT (LINH VẬT) STATES ---
  const [showMascot, setShowMascot] = useState(true);
  const [mascotState, setMascotState] = useState<
    "idle" | "success" | "fail" | "sleep" | "hint"
  >("idle");
  const mascotTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- COMBO STATES ---
  const [comboCount, setComboCount] = useState(0);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Phát giọng nói bạn đồng hành tương ứng theo kết quả (Đúng, Sai, Chiến thắng)
   */
  const playCompanionVoice = useCallback(
    (voiceType: "correct" | "incorrect" | "victory") => {
      if (!equippedVoicePack) return;
      const voiceItem = gachaPool.find((item) => item.id === equippedVoicePack);
      if (!voiceItem || !voiceItem.audioUrl) return;

      const audioPath = `${voiceItem.audioUrl}_${voiceType}.mp3`;
      const audio = new Audio(audioPath);
      audio.volume = 0.65;
      audio.play().catch((err) => console.warn("Failed to play companion voice:", err));
    },
    [equippedVoicePack, gachaPool]
  );

  /**
   * Kích hoạt hoạt ảnh cảm xúc của Mascot Shiba (idle sau 2 giây)
   */
  const playMascotAnim = useCallback((state: "success" | "fail" | "hint") => {
    setMascotState(state);
    if (mascotTimeoutRef.current) clearTimeout(mascotTimeoutRef.current);
    mascotTimeoutRef.current = setTimeout(() => setMascotState("idle"), 2000);
  }, []);

  /**
   * Reset chuỗi combo về 0
   */
  const resetCombo = useCallback(() => {
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    setComboCount(0);
  }, []);

  // Theo dõi chuỗi Combo để cập nhật nhiệm vụ ngày và kích hoạt confetti
  useEffect(() => {
    if (comboCount > 0 && appMode === "fun") {
      updateQuestProgress("q_combo", comboCount, true);

      // Kích hoạt pháo hoa tại các mốc combo ấn tượng
      if (comboCount === 3 || comboCount === 5 || comboCount % 5 === 0) {
        import("canvas-confetti").then((confetti) => {
          let particleCount = 100;
          let spread = 70;
          let colors = ["#FF7096", "#06D6A0", "#FFD166", "#5390D9", "#FF9F1C"];

          if (comboCount >= 15) {
            particleCount = 350;
            spread = 130;
            colors = ["#FFD166", "#FF9F1C", "#E63946", "#FFFFFF"];
          } else if (comboCount >= 10) {
            particleCount = 200;
            spread = 100;
            colors = ["#FF7096", "#FFB3C6", "#FFFFFF", "#FFD166"];
          } else if (comboCount >= 5) {
            particleCount = 150;
            spread = 85;
            colors = ["#06D6A0", "#118AB2", "#FFFFFF", "#FFD166"];
          }

          confetti.default({
            particleCount,
            spread,
            origin: { y: 0.6 },
            colors,
            zIndex: 2000,
          });
        });
      }
    }
  }, [comboCount, appMode, updateQuestProgress]);

  // Dọn dẹp bộ đếm khi thoát
  useEffect(() => {
    return () => {
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
      if (mascotTimeoutRef.current) clearTimeout(mascotTimeoutRef.current);
    };
  }, []);

  return {
    showMascot,
    setShowMascot,
    mascotState,
    setMascotState,
    playMascotAnim,
    comboCount,
    setComboCount,
    comboTimeoutRef,
    playCompanionVoice,
    resetCombo,
  };
}

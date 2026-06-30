"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Sparkles, Lock } from "lucide-react";

interface PrerequisiteDeckInfo {
  id: string;
  title: string;
  type: string;
  totalCards: number;
}

interface PrerequisiteGuardProps {
  prerequisiteDeck: PrerequisiteDeckInfo | null;
  children: React.ReactNode;
}

export function PrerequisiteGuard({
  prerequisiteDeck,
  children,
}: PrerequisiteGuardProps) {
  const router = useRouter();
  const loadProgress = useAppStore((state) => state.loadProgress);
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");

  useEffect(() => {
    if (!prerequisiteDeck) {
      setStatus("allowed");
      return;
    }

    let isSubscribed = true;

    const checkPrerequisite = async () => {
      try {
        // Tải tiến độ cho bài học tiền đề từ Local / Firebase
        await loadProgress(prerequisiteDeck.id);

        if (!isSubscribed) return;

        // Lấy dữ liệu tiến trình mới nhất của bài tiền đề từ Zustand store
        const isCompleted = useAppStore.getState().completedDecks[prerequisiteDeck.id] || false;

        if (isCompleted) {
          setStatus("allowed");
        } else {
          setStatus("allowed");
          // setStatus("blocked");
          // toast.error(
          //   `Bạn cần hoàn thành bài học "${prerequisiteDeck.title}" trước để mở khóa bài này!`,
          //   { id: "prereq-lock-toast", duration: 4000 }
          // );
          // router.replace("/");
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra bài học tiền đề:", err);
        if (isSubscribed) {
          setStatus("blocked");
          router.replace("/");
        }
      }
    };

    checkPrerequisite();

    return () => {
      isSubscribed = false;
    };
  }, [prerequisiteDeck, loadProgress, router]);

  if (status === "checking") {
    return (
      <div className="w-full max-w-md mx-auto h-[400px] flex flex-col items-center justify-center bg-white/80 border-4 border-[#FFE2D1] rounded-[3rem] shadow-[0_8px_0_0_#FFD6C0] py-16 px-6">
        {/* Shiba Mascot */}
        <img
          src="/images/mascot/shiba_master.gif"
          alt="Shiba đang kiểm tra"
          className="w-20 h-20 object-contain drop-shadow-md mb-4"
        />

        {/* Paw prints animation */}
        <div className="flex items-center gap-2 mb-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="animate-bounce select-none"
              style={{
                animationDelay: `${i * 0.25}s`,
                animationDuration: "0.8s",
              }}
            >
              <Sparkles size={14} className="text-[#FF9F1C] fill-[#FF9F1C]" />
            </span>
          ))}
        </div>

        <p className="font-black text-[#FF9F1C] text-lg text-center" style={{ fontFamily: "var(--font-cherry)" }}>
          Shiba đang kiểm tra xíu...
        </p>
      </div>
    );
  }

  if (status === "blocked") {
    return (
      <div className="w-full max-w-md mx-auto h-[400px] flex flex-col items-center justify-center bg-white/85 border-4 border-[#FFD166] rounded-[3rem] shadow-[0_8px_0_0_#FFE2B3] py-16 px-6 text-center">
        {/* Lock icon bounce */}
        <div className="mb-6 animate-bounce select-none">
          <Lock className="w-16 h-16 text-[#FFD166] fill-[#FFD166] mx-auto" />
        </div>

        <h3 className="text-2xl text-[#FF7096] mb-3 font-black" style={{ fontFamily: "var(--font-cherry)" }}>
          Bài học chưa được mở khóa!
        </h3>

        <p className="font-rounded font-bold text-zinc-500 flex items-center gap-1.5 justify-center">
          Đang đưa bạn về bản đồ
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                .
              </span>
            ))}
          </span>
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

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
        const prereqProgress = useAppStore.getState().progress[prerequisiteDeck.id] || [];
        const learnedCount = prereqProgress.length;
        const totalCount = prerequisiteDeck.totalCards || 0;

        // Cơ chế check đã hoàn thành tương tự useSystemRoadmap
        const isCompleted =
          prerequisiteDeck.type === "story" ||
            prerequisiteDeck.type === "chest" ||
            prerequisiteDeck.type === "minigame_matching" ||
            prerequisiteDeck.type === "minigame_kanji" ||
            prerequisiteDeck.type === "minigame_rush"
            ? learnedCount > 0
            : totalCount === 0 || learnedCount >= totalCount;

        if (isCompleted) {
          setStatus("allowed");
        } else {
          setStatus("blocked");
          toast.error(
            `Bạn cần hoàn thành bài học "${prerequisiteDeck.title}" trước để mở khóa bài này!`,
            { id: "prereq-lock-toast", duration: 4000 }
          );
          router.replace("/");
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
      <div className="w-full max-w-md mx-auto h-[400px] flex flex-col items-center justify-center bg-white/60 border-4 border-[#FFE2D1] rounded-[3rem] shadow-sm py-16">
        <div className="w-12 h-12 border-4 border-[#FFD166] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-rounded font-bold text-zinc-400">
          Đang kiểm tra điều kiện học...
        </p>
      </div>
    );
  }

  if (status === "blocked") {
    return (
      <div className="w-full max-w-md mx-auto h-[400px] flex flex-col items-center justify-center bg-white/60 border-4 border-dashed border-red-300 rounded-[3rem] shadow-sm py-16">
        <p className="font-rounded font-bold text-red-400">
          Bài học chưa được mở khóa! Đang chuyển hướng...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

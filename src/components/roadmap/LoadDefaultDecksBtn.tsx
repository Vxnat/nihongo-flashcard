"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

interface LoadDefaultDecksBtnProps {
  onLoaded: () => void;
}

export function LoadDefaultDecksBtn({ onLoaded }: LoadDefaultDecksBtnProps) {
  const [dialogInfo, setDialogInfo] = useState<{
    isOpen: boolean;
    type: "success" | "warning" | "error";
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  const [isLoading, setIsLoading] = useState(false);

  const user = useAppStore((state: any) => state.user);
  const customDecks = useAppStore((state: any) => state.customDecks);

  const closeDialog = () => {
    setDialogInfo((prev) => ({ ...prev, isOpen: false }));

    // Nếu là thông báo success (vừa thêm bài xong), đóng popup mới cho cha reload
    if (dialogInfo.type === "success") {
      window.dispatchEvent(new Event("deck_saved"));
      onLoaded();
    }
  };

  const handleLoad = async () => {
    setIsLoading(true);
    try {
      const sampleDecksToLoad = [
        {
          id: "custom_default_n5_core",
          title: "N5 Vocabulary Core",
          description: "Bộ từ vựng N5 thiết yếu để bạn bắt đầu hành trình ✨",
          level: "N5",
          dataPath: "/data/templates/default_decks.json",
        },
      ];

      let localUpdatedDecks = [...customDecks];
      const newDecks = [];

      for (const sample of sampleDecksToLoad) {
      // Đảm bảo ID độc nhất cho từng người dùng nếu lưu trên mây
      const targetId = user ? `${sample.id}_${user.uid}` : sample.id;
      const isAlreadyImported = customDecks.some((d: any) => d.id === targetId);

        if (!isAlreadyImported) {
          const res = await fetch(sample.dataPath);
          if (!res.ok) continue;
          const cards = await res.json();

        const newDeck = {
          id: targetId,
          title: sample.title,
          description: sample.description,
          level: sample.level,
          count: cards.length,
          cards: cards,
          isCustom: true,
          createdAt: new Date().toISOString(),
        };

        // Đẩy lên Firestore nếu đã đăng nhập
        if (user) {
          const deckRef = doc(db, "decks", targetId);
          await setDoc(deckRef, {
            ...newDeck,
            userId: user.uid,
            creatorName: "Hệ thống",
          });
        }

        localUpdatedDecks.push(newDeck);
        newDecks.push(newDeck);
        }
      }

      if (newDecks.length === 0) {
        setDialogInfo({
          isOpen: true,
          type: "warning",
          message: "Bạn đã 'triệu hồi' hết các bộ bài mẫu rồi mà! (ﾉ◕ヮ◕)ﾉ*",
        });
        setIsLoading(false);
        return;
      }

    // Nếu chưa đăng nhập thì lưu tạm vào Local
    if (!user) {
      localStorage.setItem("custom_decks", JSON.stringify(localUpdatedDecks));
    }
      setDialogInfo({
        isOpen: true,
        type: "success",
        message: `Phù phép thành công! Đã thêm ${newDecks.length} bộ bài mới vào kho của bạn. ✨`,
      });
    } catch (error) {
      setDialogInfo({
        isOpen: true,
        type: "error",
        message: "Ôi hỏng rồi, phép thuật bị lỗi! Thử lại sau nhé",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cấu hình giao diện theo trạng thái Dialog
  const dialogStyles = {
    success: {
      border: "#06D6A0",
      bgBtn: "#06D6A0",
      btnBorder: "#048c68",
      icon: "🎉",
      title: "Tuyệt vờiiii!",
    },
    warning: {
      border: "#FFD166",
      bgBtn: "#FF9F1C",
      btnBorder: "#d48111",
      icon: "🪄",
      title: "Phép thuật vô hiệu!",
    },
    error: {
      border: "#FF7096",
      bgBtn: "#FF7096",
      btnBorder: "#C7486B",
      icon: "😭",
      title: "Có lỗi xảy ra!",
    },
  };

  const currentStyle = dialogStyles[dialogInfo.type];

  return (
    <>
      {/* NÚT BẤM CHÍNH */}
      <button
        onClick={handleLoad}
        disabled={isLoading}
        className="h-12 px-6 rounded-full bg-[#B28DFF] hover:bg-[#9E6EE6] text-white font-rounded font-black text-base border-b-4 border-[#8A56D6] active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:active:border-b-4 disabled:active:translate-y-0 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>🪄</span>{" "}
        <span
          style={{
            fontFamily: "var(--font-cherry)",
          }}
        >
          {isLoading ? "Đang làm phép..." : "Triệu hồi bộ bài mẫu!"}
        </span>
      </button>

      {/* POPUP THÔNG BÁO CUTE */}
      <AnimatePresence>
        {dialogInfo.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={closeDialog}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{
                scale: 1,
                y: 0,
                transition: { type: "spring", stiffness: 300, damping: 25 },
              }}
              exit={{ scale: 0.8, y: -20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-[#FDFBF7] border-4 rounded-[2.5rem] p-6 max-w-[320px] w-full text-center shadow-2xl`}
              style={{
                borderColor: currentStyle.border,
                boxShadow: `0 12px 0 0 ${currentStyle.border}`,
              }}
            >
              <span className="text-6xl mb-4 block animate-bounce">
                {currentStyle.icon}
              </span>
              <h3
                className="text-2xl mb-2"
                style={{
                  fontFamily: "var(--font-cherry)",
                  color: currentStyle.bgBtn,
                }}
              >
                {currentStyle.title}
              </h3>
              <p className="font-rounded text-zinc-600 font-bold text-sm mb-6 leading-relaxed">
                {dialogInfo.message}
              </p>

              <button
                onClick={closeDialog}
                className="w-full h-12 text-white font-bold rounded-2xl transition-all border-b-4 active:border-b-0 active:translate-y-1"
                style={{
                  backgroundColor: currentStyle.bgBtn,
                  borderColor: currentStyle.btnBorder,
                }}
              >
                Đã hiểu ᕙ(`▽´)ᕗ
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

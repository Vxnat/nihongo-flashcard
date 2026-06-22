"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

interface ShibaLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

export function ShibaLoginModal({
  isOpen,
  onClose,
  title = "Căn Phòng Shiba",
  description = "Căn phòng Shiba đang đợi cậu trang trí! Đăng nhập ngay để nhận nuôi chú Shiba cưng, quay Gacha nội thất và thu hoạch xương vàng nhé! 🐾🏠",
  onSuccess,
}: ShibaLoginModalProps) {
  const loginWithGoogle = useAppStore((state: any) => state.loginWithGoogle);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {}
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="absolute inset-0" onClick={onClose} />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-[340px] bg-[#FAF6EE] border-4 border-[#8C6D58] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col p-6 items-center text-center select-none"
          >
            {/* Nút Đóng gỗ */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-[#FFE7C6] hover:bg-[#FFD9A8] text-[#C85A28] rounded-full border border-[#8C6D58]/40 shadow-sm cursor-pointer animate-none"
            >
              <X size={14} strokeWidth={3.5} />
            </button>

            {/* Mascot Shiba ôm tim cute */}
            <div className="relative mb-5 mt-2">
              <div className="absolute inset-0 bg-[#FFD166]/40 blur-xl rounded-full opacity-60 animate-pulse" />
              <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_6px_0_0_#FFE2D1] border-4 border-white overflow-hidden">
                <img
                  src="/images/mascot/shiba_heart.png"
                  alt="Shiba Heart"
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>

            <h3
              className="text-2xl text-[#8C6D58] mb-3 font-black"
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              {title}
            </h3>
            
            <p 
              className="font-rounded font-bold text-zinc-500 bg-white/90 border border-dashed border-[#FFE2D1] p-3.5 rounded-2xl shadow-inner text-xs leading-relaxed mb-5"
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              {description}
            </p>

            {/* Nút Đăng nhập gỗ 3D */}
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-[#06D6A0] hover:bg-[#05b889] text-white font-extrabold rounded-2xl border-b-4 border-[#048c68] active:border-b-0 active:translate-y-1 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              <span>🚀</span> Khám phá ngay
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface ShibaLoginCardProps {
  title: string;
  description: string;
  variant?: "roadmap" | "wood";
  mascotSrc?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  onHoverChange?: (isHovered: boolean) => void;
}

export function ShibaLoginCard({
  title,
  description,
  variant = "roadmap",
  mascotSrc = "/images/mascot/shiba_explorer_hi.png",
  onSuccess,
  onClose,
  onHoverChange,
}: ShibaLoginCardProps) {
  const loginWithGoogle = useAppStore((state: any) => state.loginWithGoogle);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  const isRoadmap = variant === "roadmap";

  return (
    <motion.div
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      initial={isRoadmap ? { opacity: 0, y: 30 } : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={
        isRoadmap
          ? { opacity: 0, y: 30 }
          : { opacity: 0, y: 15, scale: 0.95 }
      }
      transition={
        isRoadmap
          ? { type: "spring", stiffness: 200, damping: 20 }
          : { type: "spring", duration: 0.3 }
      }
      className={
        isRoadmap
          ? "bg-white/80 backdrop-blur-md border-4 border-[#FFE2D1] rounded-[2.5rem] shadow-xl p-6 sm:p-8 flex flex-col items-center text-center max-w-sm w-full relative z-20 mt-10 hover:shadow-2xl transition-shadow duration-300 pointer-events-auto"
          : "w-full max-w-sm bg-[#FAF6EE] border-4 border-[#8C6D58] rounded-[2.5rem] p-6 shadow-2xl flex flex-col items-center text-center relative z-10 select-none"
      }
    >
      {/* Dynamic Sheen / Shimmer Styles */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-effect {
          animation: shimmer 2s infinite;
        }

        @keyframes sheen {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(150%) skewX(-25deg); }
        }
        .btn-sheen::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: translateX(-150%) skewX(-25deg);
          animation: sheen 3s infinite;
        }
      `}</style>

      {/* Wood Close button (if provided & inside wood variant) */}
      {onClose && !isRoadmap && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-[#FFE7C6] hover:bg-[#FFD9A8] text-[#C85A28] rounded-full border border-[#8C6D58]/40 shadow-sm cursor-pointer animate-none z-30"
        >
          <X size={14} strokeWidth={3.5} />
        </button>
      )}

      {/* Shiba Mascot Image Frame */}
      <div className={isRoadmap ? "relative mb-6" : "relative mb-5 mt-2"}>
        <div className="absolute inset-0 bg-[#FFD166]/40 blur-xl rounded-full opacity-60 animate-pulse" />
        <div
          className={
            isRoadmap
              ? "relative w-28 h-28 bg-white/95 rounded-full flex items-center justify-center shadow-[0_8px_0_0_#FFE2D1] border-4 border-white overflow-hidden transition-transform duration-300 hover:scale-105"
              : "relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_6px_0_0_#FFE2D1] border-4 border-white overflow-hidden"
          }
        >
          <img
            src={mascotSrc}
            alt="Shiba Mascot"
            className={
              isRoadmap
                ? "w-24 h-24 object-contain mt-1"
                : "w-20 h-20 object-contain"
            }
          />
        </div>
      </div>

      {/* Card Title */}
      <h3
        className={
          isRoadmap
            ? "text-3xl text-[#FF7096] mb-3 drop-shadow-sm leading-tight"
            : "text-2xl text-[#8C6D58] mb-3 font-black"
        }
        style={{ fontFamily: "var(--font-cherry)" }}
      >
        {title}
      </h3>

      {/* Card Description */}
      <p
        className={
          isRoadmap
            ? "font-rounded font-bold text-zinc-500 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-[1.5rem] shadow-inner border border-dashed border-[#FFE2D1] leading-relaxed text-sm mb-6 max-w-[280px]"
            : "font-rounded font-bold text-zinc-500 bg-white/90 border border-dashed border-[#FFE2D1] p-3.5 rounded-2xl shadow-inner text-xs leading-relaxed mb-5"
        }
        style={{ fontFamily: "var(--font-cherry)" }}
      >
        {description}
      </p>

      {/* Login Button with Premium Sheen & Tap Effect */}
      {isRoadmap ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogin}
          className="relative group w-full py-4 px-6 bg-gradient-to-r from-[#FF7096] to-[#FF9F1C] hover:from-[#ff5882] hover:to-[#f08b00] rounded-2xl font-bold font-rounded text-white flex items-center justify-center gap-3 transition-colors shadow-[0_6px_0_0_#C7486B] hover:shadow-[0_4px_0_0_#C7486B] active:shadow-none active:translate-y-[6px] transition-transform duration-100 overflow-hidden border-2 border-white/20 cursor-pointer"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shimmer-effect" />
          <span
            style={{ fontFamily: "var(--font-cherry)" }}
            className="tracking-wide"
          >
            Khám phá ngay
          </span>
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
          className="w-full py-3 bg-[#06D6A0] hover:bg-[#05b889] text-white font-extrabold rounded-2xl border-b-4 border-[#048c68] active:border-b-0 active:translate-y-1 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm relative overflow-hidden group btn-sheen"
          style={{ fontFamily: "var(--font-cherry)" }}
        >
          Khám phá ngay
        </motion.button>
      )}
    </motion.div>
  );
}

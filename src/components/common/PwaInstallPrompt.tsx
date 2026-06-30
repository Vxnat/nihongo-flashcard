"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Share, PlusSquare, Apple } from "lucide-react";
import { usePwaInstall } from "@/hooks/common/usePwaInstall";

interface PwaInstallPromptProps {
  pwaState: ReturnType<typeof usePwaInstall>;
}

export function PwaInstallPrompt({ pwaState }: PwaInstallPromptProps) {
  const { showIOSModal, setShowIOSModal } =
    pwaState;

  return (
    <>
      {/* POPUP HƯỚNG DẪN CÀI ĐẶT CHO IPHONE (iOS) */}
      <AnimatePresence>
        {showIOSModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowIOSModal(false)}
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
              className="bg-[#FDFBF7] border-4 border-[#5390D9] rounded-[2.5rem] p-6 max-w-[320px] w-full shadow-[0_12px_0_0_#5390D9] relative"
            >
              <div className="text-center mb-6">
                <div className="mb-2 animate-bounce">
                  <Apple className="w-16 h-16 text-[#5390D9] mx-auto" />
                </div>
                <h3
                  className="text-2xl text-[#5390D9]"
                  style={{ fontFamily: "var(--font-cherry)" }}
                >
                  Cài app trên iPhone
                </h3>
              </div>
              <div className="space-y-4 font-rounded font-bold text-zinc-600 text-sm bg-white p-4 rounded-[1.5rem] border-2 border-[#5390D9]/20">
                <p className="flex items-center gap-3">
                  <span className="bg-[#5390D9] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    1
                  </span>
                  Bấm vào nút{" "}
                  <Share size={18} className="text-[#5390D9] shrink-0" /> (Chia
                  sẻ) ở dưới cùng.
                </p>
                <div className="w-full h-px bg-zinc-100" />
                <p className="flex items-center gap-3">
                  <span className="bg-[#5390D9] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    2
                  </span>
                  Kéo xuống & chọn <br />
                  <strong className="text-zinc-800">
                    "Thêm vào MH chính"
                  </strong>{" "}
                  <PlusSquare
                    size={18}
                    className="text-[#5390D9] inline shrink-0"
                  />
                </p>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full mt-6 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-bold rounded-2xl border-b-4 border-zinc-300 active:border-b-0 active:translate-y-1 transition-all"
              >
                Đã hiểu!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

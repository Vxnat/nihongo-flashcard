"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { CheckCircle2, Coins, X, Lock } from "lucide-react";
import confetti from "canvas-confetti";

interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyQuestsModal({ isOpen, onClose }: DailyQuestsModalProps) {
  const quests = useAppStore((state) => state.userStats.dailyQuests.quests);
  const claimQuestReward = useAppStore((state) => state.claimQuestReward);
  const user = useAppStore((state: any) => state.user);

  const handleClaim = async (questId: string) => {
    await claimQuestReward(questId);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
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
            className="bg-[#FDFBF7] border-4 border-[#FFD166] rounded-[2.5rem] p-6 max-w-md w-full shadow-[0_12px_0_0_#FFD166] relative"
          >
            {/* Nút Đóng */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-[#ff9d42] text-[#FFE2D1] hover:text-zinc-600 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer z-50 border-2 border-transparent hover:border-zinc-300"
            >
              <X size={20} strokeWidth={3} />
            </button>

            {/* Tiêu Đề */}
            <div className="text-center mb-6">
              <span className="text-5xl mb-2 block animate-bounce select-none">
                📜
              </span>
              <h3
                className="text-3xl text-[#FF9F1C] drop-shadow-sm"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Nhiệm Vụ Ngày
              </h3>
              <p className="font-rounded text-zinc-500 font-bold text-sm mt-2 px-4">
                Làm nhiệm vụ để lấy Xu quay đồ chơi nhé! ✨
              </p>
            </div>

            {/* Danh sách Nhiệm Vụ */}
            <div className="space-y-4">
              {!user ? (
                <div className="bg-white border-2 border-zinc-100 p-8 rounded-[1.5rem] flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4 border-4 border-zinc-200">
                    <Lock className="w-8 h-8 text-zinc-400" strokeWidth={2.5} />
                  </div>
                  <h4 className="font-bold text-zinc-700 font-rounded text-lg mb-2">
                    Nhiệm Vụ Bị Khóa
                  </h4>
                  <p className="text-zinc-500 text-sm font-bold font-rounded">
                    Đăng nhập ngay để mở khóa hệ thống nhiệm vụ và kiếm Xu quay
                    Gacha siêu cute nhé! ✨
                  </p>
                </div>
              ) : (
                quests.map((quest) => {
                  const progressPercent = Math.min(
                    (quest.progress / quest.target) * 100,
                    100,
                  );

                  return (
                    <div
                      key={quest.id}
                      className="bg-white border-2 border-zinc-100 p-4 rounded-[1.5rem] flex flex-col gap-3 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-zinc-700 font-rounded text-[15px]">
                          {quest.title}
                        </h4>
                        <span className="flex items-center gap-1 font-bold text-[#FF9F1C] bg-orange-50 px-2 py-1 rounded-xl text-xs">
                          +{quest.reward} <Coins size={14} />
                        </span>
                      </div>

                      {/* Thanh Progress */}
                      <div className="w-full h-5 bg-zinc-100 rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${quest.isCompleted ? "bg-[#06D6A0]" : "bg-[#5390D9]"}`}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-zinc-700 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                          {quest.progress} / {quest.target}
                        </span>
                      </div>

                      {/* Khu vực Nút bấm / Trạng thái */}
                      <div className="flex justify-end mt-1">
                        {quest.isClaimed ? (
                          <div className="flex items-center gap-1 text-zinc-400 font-bold text-sm bg-zinc-50 px-3 py-1.5 rounded-xl">
                            <CheckCircle2 size={16} /> Đã nhận
                          </div>
                        ) : quest.isCompleted ? (
                          <button
                            onClick={() => handleClaim(quest.id)}
                            className="animate-pulse bg-[#FFD166] hover:bg-[#FFC436] text-amber-900 font-bold px-4 py-1.5 rounded-xl border-b-4 border-[#E5B626] active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                          >
                            Nhận {quest.reward} Xu
                          </button>
                        ) : (
                          <div className="text-zinc-400 font-bold text-xs px-3 py-1.5 bg-zinc-50 rounded-xl">
                            Đang làm...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

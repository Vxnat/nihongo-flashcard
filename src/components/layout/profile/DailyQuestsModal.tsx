"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Bone, Lock } from "lucide-react";
import confetti from "canvas-confetti";

interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: any[];
  claimQuestReward: (id: string) => Promise<any> | void;
  user: any;
}

export function DailyQuestsModal({
  isOpen,
  onClose,
  quests,
  claimQuestReward,
  user,
}: DailyQuestsModalProps) {
  const handleClaim = async (questId: string) => {
    await claimQuestReward(questId);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Parchment Scroll Paper Card */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FCF6E5] border-y-8 border-[#A66E4E] rounded-[2.5rem] p-6 shadow-2xl text-left max-w-sm sm:max-w-md w-full relative z-10 overflow-hidden flex flex-col gap-4 max-h-[85vh]"
          >
            {/* Paper Roll decorative effects */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-[#8C5E43] opacity-20 rounded-l-md" />
            <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-[#8C5E43] opacity-20 rounded-r-md" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#8C5E43] hover:text-[#5C3A21] transition-colors p-1.5 bg-[#F0E4C9] rounded-full cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-2 mt-2">
              <img
                src="/images/ui/roadmap/treasure_map_icon.png"
                alt="Scroll"
                className="w-14 h-14 mx-auto mb-2 animate-bounce select-none"
                draggable={false}
              />
              <h3
                className="text-3xl text-[#5C3A21] font-black leading-none"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Bản Tin Shiba
              </h3>
              <p className="font-rounded text-[#8C5E43] font-bold text-xs mt-2 px-4 leading-relaxed">
                Nhận tin nhắn và hoàn thành yêu cầu từ Shiba để rinh về xương thưởng nhé!
              </p>
            </div>

            {/* Quests Container */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin max-h-[45vh]">
              {!user ? (
                <div className="bg-[#FAF0D7] border border-[#E3D7B5] p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-[#EFE5CC] rounded-full flex items-center justify-center mb-3 border border-[#D9CDB0]">
                    <Lock className="w-6 h-6 text-[#A39679]" strokeWidth={2.5} />
                  </div>
                  <h4 className="font-black text-[#5C3A21] font-rounded text-base mb-1">
                    Chưa đăng nhập
                  </h4>
                  <p className="text-[#8C5E43] text-xs font-bold font-rounded leading-relaxed">
                    Bạn hãy đăng nhập tài khoản Shiba để nhận các nhiệm vụ ngày thú vị nhé!
                  </p>
                </div>
              ) : quests.length === 0 ? (
                <div className="text-center py-8 text-[#8C5E43] font-rounded font-bold text-sm bg-[#FAF0D7] p-4 rounded-2xl border border-[#E3D7B5]">
                  Hôm nay không có nhiệm vụ nào! Thư thả dạo chơi Shiba Town nhé.
                </div>
              ) : (
                quests.map((quest) => {
                  const progressPercent = Math.min(
                    (quest.progress / quest.target) * 100,
                    100
                  );

                  return (
                    <div
                      key={quest.id}
                      className="bg-[#FAF0D7] border border-[#E3D7B5] p-4 rounded-2xl flex flex-col gap-3 shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-rounded font-black text-sm text-[#734A2E] leading-tight flex items-center gap-1">
                          <Bone size={12} className="rotate-45" /> {quest.title}
                        </h4>
                        <span className="flex items-center gap-1 font-rounded font-black text-[#B07E2A] bg-[#F0E4C9] border border-[#DCD0B4] px-2 py-0.5 rounded-lg text-[10px] shrink-0">
                          <Bone size={10} className="rotate-45" /> +{quest.reward || quest.rewards?.coins || 0}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-4.5 bg-[#EFE5CC] rounded-full border border-[#D9CDB0] overflow-hidden relative p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.6 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#DCA842] to-[#B07E2A]"
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-zinc-700">
                          {quest.progress} / {quest.target}
                        </span>
                      </div>

                      {/* Claim Reward Button */}
                      <div className="flex justify-end mt-1">
                        {quest.isClaimed ? (
                          <div className="flex items-center gap-1 text-[#A39679] bg-[#EBE0C4] px-3 py-1 rounded-xl text-xs border border-[#DFD3B5] font-black font-rounded">
                            <Check size={12} strokeWidth={3} /> Đã nhận quà
                          </div>
                        ) : quest.isCompleted ? (
                          <button
                            onClick={() => handleClaim(quest.id)}
                            className="bg-[#06D6A0] hover:bg-[#05B586] text-white font-black font-rounded text-[11px] px-3.5 py-1.5 rounded-xl border-b-2 border-[#048C68] active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer shadow-sm animate-pulse"
                          >
                            Nhận Xương!
                          </button>
                        ) : (
                          <div className="text-[#A39679] bg-[#EBE0C4] px-3 py-1 rounded-xl text-[10px] font-bold font-rounded">
                            Đang làm...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={onClose}
              className="mt-2 w-full py-3 bg-[#FF9F1C] hover:bg-[#E08A12] text-white font-black font-rounded text-sm rounded-2xl border-b-4 border-[#C77A0F] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-sm"
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              Đồng ý
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

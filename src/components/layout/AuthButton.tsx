"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { LogIn, LogOut, UserCircle, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { DailyQuestsModal } from "@/components/layout/DailyQuestsModal";
import { usePwaInstall } from "@/hooks/common/usePwaInstall";
import { PwaInstallPrompt } from "@/components/common/PwaInstallPrompt";

export function AuthButton() {
  const user = useAppStore((state: any) => state.user);
  const userStats = useAppStore((state: any) => state.userStats);
  const appMode = useAppStore((state: any) => state.appMode || "focus");
  const setAppMode = useAppStore((state: any) => state.setAppMode);
  const loadAppMode = useAppStore((state: any) => state.loadAppMode);

  const ADMIN_EMAILS = ["admin@example.com", "admin@shibatown.com"];
  const isDev = process.env.NODE_ENV === "development";
  const isAdmin = isDev || (user && user.email && ADMIN_EMAILS.includes(user.email)) || (userStats && userStats.role === "admin");

  const pwaState = usePwaInstall();
  const { isInstallable, isIOSInstallable, handleInstallClick } = pwaState;

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  // Đếm nhiệm vụ
  const quests = useAppStore((state) => state.userStats.dailyQuests.quests);
  const unclaimedCount = user
    ? quests.filter((q) => q.isCompleted && !q.isClaimed).length
    : 0;

  // Theo dõi thao tác cuộn để ẩn/hiện Smart Header
  const [isHidden, setIsHidden] = useState(false);
  const { scrollY } = useScroll();
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 50) {
      setIsHidden(true); // Cuộn xuống -> Ẩn
    } else {
      setIsHidden(false); // Cuộn lên -> Hiện
    }
  });

  // Tải cài đặt App Mode khi render
  useEffect(() => {
    if (loadAppMode) loadAppMode();
  }, [loadAppMode]);

  // Logic click ra ngoài để đóng menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Đăng nhập thành công! 🎉", { icon: "🚀" });
      setIsOpen(false);
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      toast.error("Đăng nhập thất bại. Bạn thử lại nhé! 💦", { icon: "🥺" });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsOpen(false);
    toast.success("Đã đăng xuất! Hẹn gặp lại nhé 👋", { icon: "👋" });
  };

  return (
    <>
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: isHidden ? -100 : 0, opacity: isHidden ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed top-4 right-4 z-[50] flex flex-col-reverse items-center gap-3"
      >
        {/* NÚT MỞ NHIỆM VỤ (Ra ngoài để luôn thấy chấm đỏ) */}
        <button
          onClick={() => setIsQuestModalOpen(true)}
          className="bg-white/90 backdrop-blur px-2.5 py-1.5 md:px-4 rounded-full border-2 border-[#FFE2D1] text-[#FF9F1C] font-bold shadow-[0_4px_0_0_#FFE2D1] hover:bg-orange-50 active:shadow-none active:translate-y-1 transition-all flex items-center gap-2 cursor-pointer relative"
        >
          <span className="text-lg">📜</span>
          <span
            className="hidden md:inline font-rounded"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            Nhiệm vụ
          </span>

          {unclaimedCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-bounce">
              {unclaimedCount}
            </span>
          )}
        </button>

        {/* KHU VỰC MENU AVATAR */}
        <div ref={menuRef} className="relative">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center bg-white/90 backdrop-blur-md p-1 rounded-full border-2 border-[#FFE2D1] shadow-[0_4px_0_0_#FFE2D1] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            {user ? (
              <img
                src={user.photoURL || ""}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-zinc-200 shadow-sm object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://ui-avatars.com/api/?name=${user.displayName || "U"}&background=FF7096&color=fff&rounded=true`;
                }}
              />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-50">
                <UserCircle
                  className="w-5 h-5 text-amber-900"
                  strokeWidth={2.5}
                />
              </div>
            )}
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-full mt-3 right-0 bg-white border-4 border-[#FFE2D1] rounded-[2rem] p-4 shadow-xl w-64 origin-top-right flex flex-col gap-4"
              >
                {user && (
                  <div className="text-center pb-3 border-b-2 border-dashed border-zinc-100 flex flex-col gap-2">
                    <p className="font-bold text-amber-900 text-sm">
                      {user.displayName}
                    </p>
                    {isAdmin && (
                      <a
                        href="/admin"
                        className="w-full flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold py-2 px-4 rounded-xl border border-amber-300 shadow-sm text-xs cursor-pointer transition-colors"
                      >
                        🛠️ Trang quản trị Admin
                      </a>
                    )}
                  </div>
                )}

                {/* CAPSULE TOGGLE: CHẾ ĐỘ HỌC */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold text-amber-700 ml-2">
                    Chế độ học:
                  </p>
                  <div className="relative flex w-full bg-zinc-100 rounded-full p-1 border-2 border-zinc-200">
                    {/* Thanh trượt */}
                    <div
                      className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-transform duration-300 ease-in-out shadow-sm ${appMode === "fun" ? "translate-x-full bg-[#FF7096]" : "translate-x-0 bg-[#FFD166]"}`}
                    />

                    <button
                      onClick={() => setAppMode("focus")}
                      className={`flex-1 relative z-10 text-xs font-bold py-2 text-center transition-colors ${appMode === "focus" ? "text-amber-900" : "text-zinc-400 hover:text-zinc-600"}`}
                    >
                      👔 Tập trung
                    </button>
                    <button
                      onClick={() => setAppMode("fun")}
                      className={`flex-1 relative z-10 text-xs font-bold py-2 text-center transition-colors ${appMode === "fun" ? "text-white" : "text-zinc-400 hover:text-zinc-600"}`}
                    >
                      🎈 Vui nhộn
                    </button>
                  </div>
                </div>

                {/* TẢI APP PWA */}
                {(isInstallable || isIOSInstallable) && (
                  <button
                    onClick={() => {
                      handleInstallClick();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 text-[#06D6A0] font-bold py-3 rounded-2xl transition-colors border-2 border-[#A0E8D5] shadow-[0_4px_0_0_#A0E8D5] active:translate-y-1 active:shadow-none mt-1"
                  >
                    <Download className="w-5 h-5" strokeWidth={2.5} /> Tải App
                  </button>
                )}

                {/* LOGIN / LOGOUT BOTTOM */}
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 font-bold py-3 rounded-2xl transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-2 bg-[#06D6A0] hover:bg-[#05b889] text-white font-bold py-3 rounded-2xl transition-colors shadow-[0_4px_0_0_#048c68] active:translate-y-1 active:shadow-none border-b-4 border-[#048c68] mt-1"
                  >
                    <LogIn className="w-4 h-4" /> Đăng nhập
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* MODAL NHIỆM VỤ */}
      <DailyQuestsModal
        isOpen={isQuestModalOpen}
        onClose={() => setIsQuestModalOpen(false)}
      />

      {/* MODAL HƯỚNG DẪN CÀI ĐẶT PWA CHO IOS */}
      <PwaInstallPrompt pwaState={pwaState} />
    </>
  );
}

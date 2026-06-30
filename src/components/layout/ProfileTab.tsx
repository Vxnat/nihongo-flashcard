"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Trophy,
  Bone,
  BookOpen,
  Zap,
  Package
} from "lucide-react";
import { ShibaLoginCard } from "@/components/common/ShibaLoginCard";
import { useSystemItems } from "@/hooks/shiba-room/useSystemItems";
import { CoinIcon } from "@/components/common/CoinIcon";

// Import modular modals from the profile folder
import { DailyQuestsModal } from "./profile/DailyQuestsModal";
import { AchievementsModal } from "./profile/AchievementsModal";
import { WeeklyLogModal } from "./profile/WeeklyLogModal";
import { InventoryModal } from "./profile/InventoryModal";

export function ProfileTab() {
  const user = useAppStore((state: any) => state.user);
  const userStats = useAppStore((state) => state.userStats);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const claimQuestReward = useAppStore((state) => state.claimQuestReward);
  const dailyLearningTimeRequired = useAppStore((state) => state.dailyLearningTimeRequired || 300);
  const systemAchievements = useAppStore((state) => state.systemAchievements || []);
  const isMetadataLoaded = useAppStore((state) => state.isMetadataLoaded);

  const { allItems } = useSystemItems();

  // State to manage active modal
  const [activeModal, setActiveModal] = useState<"quests" | "achievements" | "weekly" | "inventory" | null>(null);

  // Speech bubble states
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState("");
  const [speechTimeoutId, setSpeechTimeoutId] = useState<any>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (speechTimeoutId) clearTimeout(speechTimeoutId);
    };
  }, [speechTimeoutId]);

  const handleShibaClick = () => {
    const messages = [
      "Woof! Hôm nay cậu đã làm rất tốt!",
      "Ganbatte! Cố gắng học tập đều đặn nhé!",
      "Đừng quên làm nhiệm vụ hàng ngày để nhận xương nha!",
      "Hãy tích lũy đủ gacha để trang trí phòng nhé!",
      "Gâu! Học tiếng Nhật vui quá đi thôi!",
      "Cậu đã học được bao nhiêu phút rồi nhỉ? Giỏi quá!",
      "Hôm nay tớ thấy cậu rất chăm chỉ đấy!"
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setSpeechBubbleText(randomMsg);
    setShowSpeechBubble(true);

    if (speechTimeoutId) {
      clearTimeout(speechTimeoutId);
    }
    const timer = setTimeout(() => {
      setShowSpeechBubble(false);
    }, 4000);
    setSpeechTimeoutId(timer);
  };

  const handleShibaMouseEnter = () => {
    if (!showSpeechBubble) {
      handleShibaClick();
    }
  };

  // 1. Tính toán EXP & Level
  const maxExp = useMemo(() => {
    const level = userStats.level || 1;
    return Math.round(100 * Math.pow(level, 1.3));
  }, [userStats.level]);

  const expPercentage = useMemo(() => {
    return Math.min(100, ((userStats.exp || 0) / maxExp) * 100);
  }, [userStats.exp, maxExp]);

  // 2. Lấy Mascot Shiba theo Streak
  const mascotSrc = useMemo(() => {
    const streak = userStats.streak || 0;
    if (streak === 0) return "/images/mascot/mascot-sleep.png";
    if (streak <= 3) return "/images/mascot/mascot-hi.png";
    if (streak <= 7) return "/images/mascot/mascot-idle.png";
    return "/images/mascot/mascot-success.png";
  }, [userStats.streak]);

  // 3. Tính toán các ngày trong tuần (Thứ 2 đến Chủ nhật)
  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: Chủ nhật, 1: Thứ 2...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const dayNames = ["月", "火", "水", "木", "金", "土", "日"];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toLocaleDateString("en-CA"); // Định dạng YYYY-MM-DD
      const timeStudied = userStats.studyHistory?.[dateStr] || 0;
      const isCompleted = timeStudied >= dailyLearningTimeRequired;
      const isToday = dateStr === today.toLocaleDateString("en-CA");
      const isFuture = date.getTime() > today.getTime() && dateStr !== today.toLocaleDateString("en-CA");

      days.push({
        name: dayNames[i],
        dateStr,
        timeStudied,
        isCompleted,
        isToday,
        isFuture,
      });
    }
    return days;
  }, [userStats.studyHistory, dailyLearningTimeRequired]);

  // 4. Danh sách các Danh hiệu / Thành tích (Achievements)
  const achievements = useMemo(() => {
    return systemAchievements.map((ach) => {
      const field = ach.target?.field || "";
      const targetValue = ach.target?.value || 0;

      let userValue = 0;
      if (field === "inventory") {
        userValue = userStats.inventory?.length || 0;
      } else if (field === "level") {
        userValue = userStats.level || 1;
      } else {
        userValue = (userStats as any)[field] || 0;
      }

      const condition = userValue >= targetValue;

      let progressText = "";
      if (field === "level") {
        progressText = `Lv. ${userValue}/${targetValue}`;
      } else if (field === "learningTimeToday") {
        const userMin = Math.floor(userValue / 60);
        const targetMin = Math.floor(targetValue / 60);
        progressText = `${userMin}/${targetMin} ${ach.unit || "phút"}`;
      } else {
        progressText = `${userValue}/${targetValue} ${ach.unit || ""}`;
      }

      return {
        id: ach.id,
        title: ach.title || "Danh hiệu",
        desc: ach.desc || "",
        imageUrl: ach.imageUrl || "",
        condition,
        progressText,
        userValue,
        targetValue,
        field
      };
    });
  }, [systemAchievements, userStats]);

  // Chia danh hiệu thành các hàng của kệ sách gỗ (mỗi hàng 3 cái)
  const shelfRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < achievements.length; i += 3) {
      rows.push(achievements.slice(i, i + 3));
    }
    return rows;
  }, [achievements]);

  // 5. Danh sách vật phẩm của học viên từ shop/gacha
  const userInventoryItems = useMemo(() => {
    return (userStats.inventory || []).map((itemId: string) => {
      const item = allItems.find((i: any) => i.id === itemId);
      return item || { id: itemId, title: "Vật phẩm", imageUrl: "/images/ui/badges/default.png", desc: "Món quà từ Gacha" };
    });
  }, [userStats.inventory, allItems]);

  // 6. Tính toán tiến độ học hàng ngày cho vòng tròn tiến trình
  const studyPercentage = useMemo(() => {
    return Math.min(100, ((userStats.learningTimeToday || 0) / dailyLearningTimeRequired) * 100);
  }, [userStats.learningTimeToday, dailyLearningTimeRequired]);

  // Kiểm tra xem có bất kỳ nhiệm vụ nào đã xong nhưng chưa nhận thưởng không
  const hasUnclaimedQuest = useMemo(() => {
    const quests = userStats.dailyQuests?.quests || [];
    return quests.some((q: any) => q.isCompleted && !q.isClaimed);
  }, [userStats.dailyQuests?.quests]);

  // SVG Progress Ring config
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (studyPercentage / 100) * circumference;

  return (
    <div className="w-full flex flex-col items-center relative py-10 select-none"
      style={{ fontFamily: "var(--font-cherry)" }}
    >
      <div
        className={`w-full flex flex-col gap-8 max-w-xl px-4 transition-all duration-700 ${!user
          ? `blur-[7px] opacity-35 scale-[0.98] pointer-events-none select-none ${isCardHovered ? "blur-[4px] opacity-55 scale-[0.99]" : ""
          }`
          : ""
          }`}
      >
        {/* KHỐI 1: THẺ HỌC GIẢ (Scholar Passport Card) */}
        <div className="bg-[#FFFDF9] rounded-[2.5rem] p-5 border-4 border-[#FFE2D1] shadow-[0_8px_0_0_#FFE2D1] flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden w-full">
          {/* Họa tiết chìm */}
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-12 translate-y-12 select-none">
            <Trophy size={160} />
          </div>

          {/* Left section: Info */}
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-3 w-full">
            <div className="flex flex-col items-center sm:items-start gap-1">
              <span className="font-rounded font-black text-[9px] text-[#FF7096] uppercase tracking-wider bg-[#FFF2F5] border border-[#FFD9E2] px-3 py-0.5 rounded-full">
                Học Giả Shiba Town
              </span>
              <h2 className="text-2xl text-zinc-700 font-black leading-tight mt-1">
                {user?.displayName || "Bạn của Shiba"}
              </h2>
            </div>

            {/* Shiba Currencies (Coins & Golden Fur) */}
            <div className="flex items-center gap-3 bg-[#FFF9F2] border-2 border-[#FFE2D1] px-3 py-1 rounded-2xl shadow-inner">
              <div className="flex items-center gap-1.5" title="Xương (Dùng quay Gacha)">
                <Bone size={12} className="rotate-45 text-[#8C5E43] fill-[#8C5E43]" />
                <span className="font-rounded font-black text-[11px] text-[#8C5E43]">
                  {userStats.coins || 0}
                </span>
              </div>
              <div className="h-3 w-0.5 bg-[#FFE2D1]" />
              <div className="flex items-center gap-1" title="Lông Vàng (Đơn vị hiếm)">
                <CoinIcon size={16} />
                <span className="font-rounded font-black text-[11px] text-[#FF9F1C]">
                  {userStats.goldenFur || 0}
                </span>
              </div>
            </div>

            {/* Level & EXP Progress Bar */}
            <div className="w-full max-w-xs space-y-1">
              <div className="flex justify-between items-end font-rounded font-black">
                <span className="text-[#B28DFF] text-base">
                  Lv. {userStats.level || 1}
                </span>
                <span className="text-zinc-400 text-[10px]">
                  {userStats.exp || 0}/{maxExp} EXP
                </span>
              </div>
              <div className="h-3.5 w-full bg-zinc-100/80 rounded-full border-2 border-zinc-200 overflow-hidden relative p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${expPercentage}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  className="h-full bg-gradient-to-r from-[#B28DFF] via-[#FF7096] to-[#FFE2D1] rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Right section: Shiba Mascot Avatar + Overlay Streak */}
          <div className="shrink-0 relative flex flex-col items-center justify-center">
            
            {/* Speech Bubble */}
            <AnimatePresence>
              {showSpeechBubble && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 10, x: "-50%" }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, scale: 0.85, y: 10, x: "-50%" }}
                  className="absolute -top-16 left-1/2 bg-white border-2 border-amber-900 text-amber-900 px-3 py-1 rounded-2xl font-rounded font-black text-[9px] shadow-[0_4px_0_0_#FFE2D1] z-30 max-w-[150px] sm:max-w-[200px] whitespace-normal leading-tight text-center"
                >
                  {speechBubbleText}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r-2 border-b-2 border-amber-900 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Avatar container */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 2 }}
                onMouseEnter={handleShibaMouseEnter}
                className="w-24 h-24 bg-[#FFF9F2] rounded-full flex items-center justify-center border-4 border-[#FFE2D1] shadow-inner overflow-hidden cursor-pointer"
                onClick={handleShibaClick}
              >
                <img src={mascotSrc} alt="Shiba Mascot" className="w-20 h-20 object-contain mt-0.5" />
              </motion.div>

              {/* Overlaid Streak Badge */}
              <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 bg-gradient-to-r from-[#FF9F1C] to-[#FF7096] text-white px-2.5 py-0.5 rounded-full border-2 border-white shadow-md text-[9px] font-black animate-pulse whitespace-nowrap">
                <Flame className="w-3.5 h-3.5 fill-white text-white" />
                <span>{userStats.streak || 0} NGÀY</span>
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 2: VÒNG TRÒN TIẾN ĐỘ NGÀY (Daily Progress Dial) */}
        <div className="flex flex-col items-center w-full bg-[#FFFDF9] rounded-[2.5rem] p-6 border-4 border-[#FFE2D1] shadow-[0_8px_0_0_#FFE2D1] relative">
          <h3 className="text-xl text-zinc-700 mb-8">
            Bản Đồ Tiến Độ Hôm Nay
          </h3>

          {/* The dial container with Shiba ears */}
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center select-none mb-4">

            {/* CUTE SHIBA EARS */}
            {/* Left Ear */}
            <div className="absolute -top-2.5 sm:-top-3 left-[22px] sm:left-[30px] w-10 h-10 sm:w-12 sm:h-12 bg-[#FFB84D] border-4 border-amber-900 rounded-tr-[2.2rem] rounded-bl-[1.2rem] rotate-[-18deg] shadow-sm z-0">
              <div className="absolute top-0.5 sm:top-1 left-1.5 sm:left-2 w-5 h-5 sm:w-6 sm:h-6 bg-[#FFCCD5] rounded-tr-[1.8rem] rounded-bl-[0.6rem]" />
            </div>
            {/* Right Ear */}
            <div className="absolute -top-2.5 sm:-top-3 right-[22px] sm:right-[30px] w-10 h-10 sm:w-12 sm:h-12 bg-[#FFB84D] border-4 border-amber-900 rounded-tl-[2.2rem] rounded-br-[1.2rem] rotate-[18deg] shadow-sm z-0">
              <div className="absolute top-0.5 sm:top-1 right-1.5 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-[#FFCCD5] rounded-tl-[1.8rem] rounded-br-[0.6rem]" />
            </div>

            {/* SVG Progress Circle Container */}
            <div className="w-full h-full rounded-full border-4 border-amber-900 bg-white shadow-md relative z-10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-2">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  <defs>
                    <linearGradient id="dialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFA62B" />
                      <stop offset="60%" stopColor="#FF7096" />
                      <stop offset="100%" stopColor="#B28DFF" />
                    </linearGradient>
                  </defs>

                  {/* Outer circle line */}
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="#FFF2E6"
                    strokeWidth={strokeWidth + 2}
                  />

                  {/* Progress filler line */}
                  <motion.circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="url(#dialGrad)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Text inside Ring */}
              <div className="relative z-20 flex flex-col items-center text-center">
                <span className="font-rounded font-black text-[9px] text-zinc-400 uppercase tracking-widest">
                  THỜI GIAN HỌC
                </span>
                <span className="font-rounded font-black text-3xl sm:text-4xl text-amber-500 my-0.5">
                  {Math.round(studyPercentage)}%
                </span>
                <span className="font-rounded font-black text-[10px] sm:text-[11px] text-zinc-500 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full mt-1">
                  {Math.floor(userStats.learningTimeToday / 60)}/{Math.floor(dailyLearningTimeRequired / 60)} phút
                </span>
              </div>
            </div>

            {/* FLOATING CATEGORIES AROUND DIAL - CLICK OPENS THE CORRESPONDING MODAL */}
            {/* 1. Bản tin (Top-Left) - Opens Daily Quests */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -4, 0] }}
              transition={{
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0
                }
              }}
              onClick={() => setActiveModal("quests")}
              className="absolute -top-2 -left-8 sm:-left-[54px] flex flex-col items-center gap-1 cursor-pointer z-20 group"
            >
              <div className="relative w-12 h-12 bg-gradient-to-br from-[#FFF8F2] to-[#FFEAD4] border-2 border-[#5C3A21] rounded-full flex items-center justify-center shadow-[0_4px_0_0_#FF9F1C] group-hover:shadow-[0_2px_0_0_#FF9F1C] group-hover:translate-y-[2px] transition-all duration-200">
                <img src="/images/ui/icons/menu-quests.png" alt="Quest Scroll" className="w-8 h-8 object-contain" />

                {/* Red/Orange Notification Dot if quest is complete and ready to claim */}
                {hasUnclaimedQuest && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#FF7096] rounded-full z-30 border border-white shadow-sm animate-pulse" />
                )}
              </div>
              <span className="font-rounded font-black text-[9px] text-[#5C3A21] bg-[#FFF2E6] border border-orange-200 px-2 py-0.5 rounded-full shadow-sm group-hover:bg-orange-100 transition-colors">Bản tin</span>
            </motion.div>

            {/* 2. Kệ trưng bày (Top-Right) - Opens Achievements */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -4, 0] }}
              transition={{
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4
                }
              }}
              onClick={() => setActiveModal("achievements")}
              className="absolute -top-2 -right-8 sm:-right-[54px] flex flex-col items-center gap-1 cursor-pointer z-20 group"
            >
              <div className="relative w-12 h-12 bg-gradient-to-br from-[#FFFDF2] to-[#FFF3C4] border-2 border-[#5C3A21] rounded-full flex items-center justify-center shadow-[0_4px_0_0_#D4AF37] group-hover:shadow-[0_2px_0_0_#D4AF37] group-hover:translate-y-[2px] transition-all duration-200">
                <img src="/images/ui/icons/menu-achievements.png" alt="Achievements Trophy" className="w-8 h-8 object-contain" />
              </div>
              <span className="font-rounded font-black text-[9px] text-[#5C3A21] bg-[#FFF9F2] border border-amber-200 px-2 py-0.5 rounded-full shadow-sm group-hover:bg-amber-100 transition-colors">Kệ trưng bày</span>
            </motion.div>

            {/* 3. Nhật ký tuần (Bottom-Left) - Opens WeeklyLog */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -4, 0] }}
              transition={{
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8
                }
              }}
              onClick={() => setActiveModal("weekly")}
              className="absolute -bottom-2 -left-8 sm:-left-[54px] flex flex-col items-center gap-1 cursor-pointer z-20 group"
            >
              <div className="relative w-12 h-12 bg-gradient-to-br from-[#FFF2F5] to-[#FFE0E7] border-2 border-[#5C3A21] rounded-full flex items-center justify-center shadow-[0_4px_0_0_#FF7096] group-hover:shadow-[0_2px_0_0_#FF7096] group-hover:translate-y-[2px] transition-all duration-200">
                <img src="/images/ui/icons/menu-weekly.png" alt="Weekly Planner" className="w-8 h-8 object-contain" />
              </div>
              <span className="font-rounded font-black text-[9px] text-[#5C3A21] bg-[#FFF2F5] border border-pink-200 px-2 py-0.5 rounded-full shadow-sm group-hover:bg-pink-100 transition-colors">Nhật ký tuần</span>
            </motion.div>

            {/* 4. Hành trang (Bottom-Right) - Opens User Inventory */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -4, 0] }}
              transition={{
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.2
                }
              }}
              onClick={() => setActiveModal("inventory")}
              className="absolute -bottom-2 -right-8 sm:-right-[54px] flex flex-col items-center gap-1 cursor-pointer z-20 group"
            >
              <div className="relative w-12 h-12 bg-gradient-to-br from-[#F2F7FF] to-[#D4E6FF] border-2 border-[#5C3A21] rounded-full flex items-center justify-center shadow-[0_4px_0_0_#3B82F6] group-hover:shadow-[0_2px_0_0_#3B82F6] group-hover:translate-y-[2px] transition-all duration-200">
                <img src="/images/ui/icons/menu-inventory.png" alt="Inventory Backpack" className="w-8 h-8 object-contain" />
              </div>
              <span className="font-rounded font-black text-[9px] text-[#5C3A21] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shadow-sm group-hover:bg-blue-100 transition-colors">Hành trang</span>
            </motion.div>
          </div>
        </div>

        {/* KHỐI 3: BẢNG THỐNG KÊ HỌC TẬP (Stats Summary Grid) */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {/* Card 1: Tổng số thẻ đã học */}
          <div className="bg-[#FFFDF9] rounded-[1.8rem] p-3 border-4 border-[#FFE2D1] shadow-[0_6px_0_0_#FFE2D1] flex flex-col items-center justify-center text-center gap-1.5 transition-transform hover:scale-[1.03] duration-200">
            <BookOpen className="w-6 h-6 text-[#5390D9]" />
            <span className="font-rounded font-black text-[8px] sm:text-[9px] text-zinc-400 uppercase tracking-wider leading-none">ĐÃ HỌC</span>
            <span className="font-rounded font-black text-xs sm:text-sm text-zinc-700 mt-0.5">
              {userStats.totalLearned || 0} từ
            </span>
          </div>

          {/* Card 2: Số thẻ hôm nay */}
          <div className="bg-[#FFFDF9] rounded-[1.8rem] p-3 border-4 border-[#FFE2D1] shadow-[0_6px_0_0_#FFE2D1] flex flex-col items-center justify-center text-center gap-1.5 transition-transform hover:scale-[1.03] duration-200">
            <Zap className="w-6 h-6 text-[#FF9F1C] fill-[#FF9F1C]" />
            <span className="font-rounded font-black text-[8px] sm:text-[9px] text-zinc-400 uppercase tracking-wider leading-none">HÔM NAY</span>
            <span className="font-rounded font-black text-xs sm:text-sm text-zinc-700 mt-0.5">
              {userStats.cardsFlippedToday || 0} thẻ
            </span>
          </div>

          {/* Card 3: Hành trang */}
          <div
            className="bg-[#FFFDF9] rounded-[1.8rem] p-3 border-4 border-[#FFE2D1] shadow-[0_6px_0_0_#FFE2D1] flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-transform hover:scale-[1.03] active:scale-[0.98] duration-200"
            onClick={() => setActiveModal("inventory")}
          >
            <Package className="w-6 h-6 text-[#FF7096]" />
            <span className="font-rounded font-black text-[8px] sm:text-[9px] text-zinc-400 uppercase tracking-wider leading-none">HÀNH TRANG</span>
            <span className="font-rounded font-black text-xs sm:text-sm text-zinc-700 mt-0.5">
              {userStats.inventory?.length || 0} món
            </span>
          </div>
        </div>
      </div>

      {/* OVERLAY SƯƠNG MÙ KHI CHƯA ĐĂNG NHẬP */}
      {!user && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-start pt-16 px-4">
          <ShibaLoginCard
            title="Thẻ Học Giả"
            description="Đăng nhập cùng Shiba để theo dõi thời gian học, tích lũy huy hiệu vinh danh và lưu streak học tập mỗi ngày nhé!"
            variant="roadmap"
            onHoverChange={setIsCardHovered}
          />
        </div>
      )}

      {/* MODULAR MODALS */}
      {/* 1. Daily Quests Modal */}
      <DailyQuestsModal
        isOpen={activeModal === "quests"}
        onClose={() => setActiveModal(null)}
        quests={userStats.dailyQuests?.quests || []}
        claimQuestReward={claimQuestReward}
        user={user}
      />

      {/* 2. Achievements Shelf Cabinet Modal */}
      <AchievementsModal
        isOpen={activeModal === "achievements"}
        onClose={() => setActiveModal(null)}
        shelfRows={shelfRows}
        isMetadataLoaded={isMetadataLoaded}
      />

      {/* 3. Weekly Study Log Modal */}
      <WeeklyLogModal
        isOpen={activeModal === "weekly"}
        onClose={() => setActiveModal(null)}
        weekDays={weekDays}
      />

      {/* 4. User Inventory Modal */}
      <InventoryModal
        isOpen={activeModal === "inventory"}
        onClose={() => setActiveModal(null)}
        userInventoryItems={userInventoryItems}
        isMetadataLoaded={isMetadataLoaded}
      />
    </div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { motion } from "framer-motion";
import { Flame, Clock, Trophy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { ShibaLoginCard } from "@/components/common/ShibaLoginCard";

export function ProfileTab() {
  const user = useAppStore((state: any) => state.user);
  const userStats = useAppStore((state) => state.userStats);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const claimQuestReward = useAppStore((state) => state.claimQuestReward);
  const dailyLearningTimeRequired = useAppStore((state) => state.dailyLearningTimeRequired || 300);
  const systemAchievements = useAppStore((state) => state.systemAchievements || []);
  const isMetadataLoaded = useAppStore((state) => state.isMetadataLoaded);

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
    if (streak === 0) return "/images/mascot/mascot-sleep.gif";
    if (streak <= 3) return "/images/mascot/mascot-hi.gif";
    if (streak <= 7) return "/images/mascot/mascot-idle.gif";
    return "/images/mascot/mascot-success.gif";
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
      };
    });
  }, [systemAchievements, userStats]);

  // 5. Nhiệm vụ ngày hiện tại
  const activeQuest = userStats.dailyQuests?.quests?.[0] || null;

  return (
    <div className="w-full flex flex-col items-center relative py-6">
      <div
        className={`w-full flex flex-col gap-6 max-w-2xl px-4 transition-all duration-700 ${!user
          ? `blur-[7px] opacity-35 scale-[0.98] pointer-events-none select-none ${isCardHovered ? "blur-[4px] opacity-55 scale-[0.99]" : ""
          }`
          : ""
          }`}
      >

        {/* KHỐI 1: SCHOLAR PASSPORT CARD (Bento lớn) */}
        <div className="bg-white rounded-[2.5rem] p-6 border-4 border-[#FFE2D1] shadow-[0_8px_0_0_#FFE2D1] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Họa tiết chìm phía sau */}
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-12 translate-y-12 select-none">
            <Trophy size={200} />
          </div>

          {/* Thông tin học giả */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4 w-full">
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="font-rounded font-black text-xs text-[#FF7096] uppercase tracking-wider bg-pink-50 border border-pink-100 px-3 py-1 rounded-full"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Thẻ Học Giả
              </span>
              <h2 className="text-3xl text-zinc-700 mt-2 font-black" style={{ fontFamily: "var(--font-cherry)" }}>
                {useAppStore.getState().user?.displayName || "Bạn của Shiba"}
              </h2>
            </div>

            {/* Level & EXP Progress Bar */}
            <div className="w-full max-w-xs space-y-1.5">
              <div className="flex justify-between items-end font-rounded font-black">
                <span className="text-[#B28DFF] text-xl" style={{ fontFamily: "var(--font-cherry)" }}>
                  Lv. {userStats.level || 1}
                </span>
                <span className="text-zinc-400 text-xs"
                  style={{ fontFamily: "var(--font-cherry)" }}
                >
                  {userStats.exp || 0}/{maxExp} EXP
                </span>
              </div>
              <div className="h-4 w-full bg-zinc-100 rounded-full border-2 border-zinc-200 overflow-hidden relative p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${expPercentage}%` }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="h-full bg-gradient-to-r from-[#B28DFF] to-[#8A56D6] rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Mascot Shiba theo Streak */}
          <div className="flex flex-col items-center gap-2 shrink-0 select-none">
            <div className="w-28 h-28 bg-orange-50/50 rounded-full flex items-center justify-center border-4 border-[#FFE2D1] shadow-inner relative overflow-hidden">
              <img src={mascotSrc} alt="Shiba Mascot" className="w-24 h-24 object-contain mt-1" />
            </div>
            <div className="flex items-center gap-1 bg-[#FFF4E6] px-3 py-1.5 rounded-full border-2 border-[#FFD166]">
              <Flame className="w-4 h-4 text-[#FF9F1C] fill-[#FF9F1C]" />
              <span className="font-rounded font-black text-xs text-[#FF9F1C]"
                style={{ fontFamily: "var(--font-cherry)" }}
              >
                Chuỗi: {userStats.streak || 0} ngày
              </span>
            </div>
          </div>
        </div>

        {/* KHỐI 2: WEEKLY CALENDAR LINE (Thanh lịch tuần nằm ngang) */}
        <div className="bg-[#FFFDF9] rounded-[2.5rem] p-6 border-4 border-[#FFE2D1] shadow-[0_8px_0_0_#FFE2D1] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl text-zinc-700" style={{ fontFamily: "var(--font-cherry)" }}>
              Nhật Ký Học Tập
            </h3>
          </div>

          {/* Danh sách 7 ngày */}
          <div className="flex md:grid md:grid-cols-7 gap-2 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-3 px-2 w-full">
            {weekDays.map((day) => {
              let shibaGif = "/images/mascot/mascot-sleep.gif";
              let bgClass = "bg-zinc-50 border-zinc-200 text-zinc-400";

              if (day.isFuture) {
                shibaGif = "/images/mascot/mascot-sleep.gif";
                bgClass = "bg-zinc-50/40 border-zinc-100 text-zinc-300";
              } else if (day.isCompleted) {
                shibaGif = "/images/mascot/mascot-success.gif";
                bgClass = "bg-[#F0FAF5] border-[#A0E8D5] text-emerald-700 shadow-[0_4px_0_0_#A0E8D5]";
              } else {
                // Quá khứ bỏ lỡ hoặc Hôm nay chưa đạt mốc
                shibaGif = "/images/mascot/mascot-fail.gif";
                bgClass = day.isToday
                  ? "bg-zinc-100 border-[#FFE2D1] text-zinc-500 animate-pulse border-dashed border-4"
                  : "bg-zinc-100 border-zinc-300 text-zinc-400";
              }

              return (
                <div
                  key={day.dateStr}
                  className={`flex flex-col items-center py-2 px-1 rounded-2xl border-2 text-center transition-all ${bgClass} ${day.isToday ? "scale-105 relative z-10" : ""} flex-1 min-w-[58px] sm:min-w-[64px] md:min-w-0 snap-center`}
                >
                  <span className="font-rounded font-black text-[10px] sm:text-xs uppercase tracking-tight">
                    {day.name}
                  </span>

                  {/* Chibi Mascot */}
                  <div className="w-10 h-10 my-2 select-none pointer-events-none flex items-center justify-center">
                    <img src={shibaGif} alt="Shiba Status" className="w-full h-full object-contain" />
                  </div>

                  <span className="font-rounded font-bold text-[9px] sm:text-[10px] truncate max-w-full">
                    {day.isFuture ? "-" : `${Math.floor(day.timeStudied / 60)}m`}
                  </span>

                  {day.isToday && (
                    <span className="absolute -bottom-2 bg-[#FF7096] text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border border-white">
                      Nay
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* KHỐI 3: DAILY QUEST & STATS (Nhiệm vụ ngẫu nhiên & Đồng hồ học) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Thẻ Nhiệm vụ Shiba Hôm Nay */}
          <div className="bg-white rounded-[2.5rem] p-6 border-4 border-[#FFE2D1] shadow-[0_8px_0_0_#FFE2D1] flex flex-col justify-between gap-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="font-rounded font-black text-[10px] text-[#FF9F1C] uppercase tracking-wider bg-orange-50 border border-orange-100 px-2.5 py-0.5 rounded-full">
                  Nhiệm vụ
                </span>
                <h3 className="text-xl text-zinc-700 font-bold" style={{ fontFamily: "var(--font-cherry)" }}>
                  Yêu Cầu Từ Shiba
                </h3>
              </div>

              {/* Rương báu hiển thị trạng thái */}
              <div className="w-12 h-12 select-none pointer-events-none shrink-0">
                <img
                  src={activeQuest?.isClaimed
                    ? "/images/ui/roadmap/chest_opened.png"
                    : "/images/ui/roadmap/chest_closed.png"
                  }
                  alt="Chest"
                  className={`w-full h-full object-contain ${activeQuest?.isCompleted && !activeQuest?.isClaimed ? "animate-bounce" : ""}`}
                />
              </div>
            </div>

            {activeQuest ? (
              <div className="flex-1 flex flex-col justify-end gap-3">
                <p className="font-rounded font-black text-sm text-zinc-600">
                  {activeQuest.title}
                </p>

                {/* Progress Bar của Quest */}
                <div className="space-y-1">
                  <div className="flex justify-between font-rounded text-xs text-zinc-400 font-bold">
                    <span>Tiến độ</span>
                    <span>{activeQuest.progress}/{activeQuest.target}</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-100 rounded-full border border-zinc-200 overflow-hidden relative">
                    <div
                      className="h-full bg-[#FF9F1C] rounded-full"
                      style={{ width: `${Math.min(100, (activeQuest.progress / activeQuest.target) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Phần thưởng & Nút Nhận */}
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-zinc-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-rounded text-zinc-400 font-bold uppercase">Phần thưởng</span>
                    <div className="flex items-center gap-3 font-rounded font-black text-xs">
                      <span className="text-amber-700 flex items-center gap-1">
                        🪙 +{activeQuest.rewards?.coins ?? activeQuest.reward ?? 0} xu
                      </span>
                      <span className="text-purple-600 flex items-center gap-1 font-rounded">
                        ⭐ +{activeQuest.rewards?.exp ?? 50} EXP
                      </span>
                    </div>
                  </div>

                  {activeQuest.isClaimed ? (
                    <div className="h-10 px-4 flex items-center justify-center gap-1 bg-zinc-100 border border-zinc-200 text-zinc-400 font-bold rounded-2xl text-xs">
                      <Check size={14} strokeWidth={3} /> Đã nhận
                    </div>
                  ) : activeQuest.isCompleted ? (
                    <button
                      onClick={() => {
                        claimQuestReward(activeQuest.id);
                        toast.success("Đã mở khóa phần thưởng nhiệm vụ! 🎁", { icon: "🎉" });
                      }}
                      className="h-10 px-5 bg-[#06D6A0] hover:bg-[#05B586] text-white font-black font-rounded text-xs rounded-2xl border-b-4 border-[#048C68] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-sm"
                    >
                      Mở Rương!
                    </button>
                  ) : (
                    <div className="h-10 px-4 flex items-center justify-center bg-zinc-100 text-zinc-400 font-black font-rounded text-xs rounded-2xl border border-dashed border-zinc-200">
                      Chưa hoàn thành
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="font-rounded font-bold text-sm text-zinc-400 text-center py-6">
                Không có nhiệm vụ nào hôm nay!
              </p>
            )}
          </div>

          {/* Thẻ Thống kê Giờ học hôm nay */}
          <div className="bg-white rounded-[2.5rem] p-6 border-4 border-[#FFE2D1] shadow-[0_8px_0_0_#FFE2D1] flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <span className="font-rounded font-black text-[10px] text-[#06D6A0] uppercase tracking-wider bg-green-50 border border-green-100 px-2.5 py-0.5 rounded-full">
                Thống kê hôm nay
              </span>
              <h3 className="text-xl text-zinc-700 font-bold" style={{ fontFamily: "var(--font-cherry)" }}>
                Thời Gian Học
              </h3>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center py-4">
              <div className="flex items-center justify-center bg-[#F0FAF5] w-16 h-16 rounded-full border-4 border-[#A0E8D5] shadow-sm mb-3">
                <Clock className="w-8 h-8 text-[#06D6A0]" />
              </div>

              {/* Đồng hồ số giây học */}
              <span className="font-rounded font-black text-3xl text-zinc-700" style={{ fontFamily: "var(--font-cherry)" }}>
                {Math.floor((userStats.learningTimeToday || 0) / 60)} <span className="text-base text-zinc-400">phút</span> {(userStats.learningTimeToday || 0) % 60} <span className="text-base text-zinc-400">giây</span>
              </span>

              <p className="font-rounded font-bold text-xs text-zinc-400 text-center mt-2 leading-relaxed max-w-[200px]">
                {userStats.learningTimeToday >= dailyLearningTimeRequired
                  ? "Shiba Town tự hào về sự kiên trì của bạn hôm nay! 🐾"
                  : `Học thêm ${Math.ceil((dailyLearningTimeRequired - userStats.learningTimeToday) / 60)} phút nữa để giúp Shiba vui lên nhé!`
                }
              </p>
            </div>
          </div>
        </div>

        {/* KHỐI 4: ACHIEVEMENTS CARD (Bảng vàng thành tích - Kệ gỗ) */}
        <div className="bg-[#FAF6EF] rounded-[2.5rem] p-6 border-4 border-[#D97706]/40 shadow-[0_8px_0_0_rgba(217,119,6,0.2)] flex flex-col gap-4 relative">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl text-amber-900" style={{ fontFamily: "var(--font-cherry)" }}>
              Danh Hiệu
            </h3>
            <span className="font-rounded font-black text-xs text-amber-700/80 bg-amber-100/50 border border-amber-200 px-3 py-1 rounded-full">
              {!isMetadataLoaded ? "Đang tải..." : `Đã đạt: ${achievements.filter((a) => a.condition).length}/${achievements.length}`}
            </span>
          </div>

          {/* Danh sách danh hiệu xếp kệ gỗ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 pb-2 relative z-10">
            {!isMetadataLoaded ? (
              // Skeleton loader cho danh hiệu
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-between p-3 rounded-2xl bg-white border-2 border-zinc-100 shadow-sm animate-pulse"
                >
                  <div className="w-16 h-16 rounded-full bg-zinc-200 border-4 border-white shadow-md" />
                  <div className="h-4 w-20 bg-zinc-200 rounded mt-2.5" />
                  <div className="h-3 w-16 bg-zinc-200 rounded mt-1.5" />
                </div>
              ))
            ) : systemAchievements.length === 0 ? (
              <div className="col-span-full py-8 text-center text-zinc-400 font-rounded font-bold text-sm">
                Không có danh hiệu nào được cấu hình từ server!
              </div>
            ) : (
              achievements.map((ach) => (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    toast(
                      `${ach.title}: ${ach.desc}\nTiến độ: ${ach.progressText}`,
                      {
                        icon: ach.condition ? "🏆" : "🔒",
                        duration: 3000
                      }
                    );
                  }}
                  key={ach.id}
                  className={`flex flex-col items-center justify-between p-3 rounded-2xl bg-white border-2 border-[#FFE2D1]/60 shadow-sm cursor-pointer ${ach.condition
                    ? "shadow-amber-100"
                    : "grayscale opacity-50 contrast-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                    }`}
                >
                  {/* Badge image tròn */}
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-md border-4 border-white bg-zinc-50 relative overflow-hidden">
                    <img
                      src={ach.imageUrl || "/images/ui/badges/default.png"}
                      alt={ach.title}
                      className="w-full h-full object-cover"
                    />
                    {ach.condition && (
                      <span className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-0.5 border border-white z-10">
                        <Check size={10} strokeWidth={4} />
                      </span>
                    )}
                  </div>

                  <h4 className="font-rounded font-black text-xs text-zinc-700 text-center mt-2.5">
                    {ach.title}
                  </h4>
                  <span className="font-rounded font-bold text-[9px] text-zinc-400 mt-1 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-full">
                    {ach.progressText}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
      {!user && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-start pt-16 px-4">
          <ShibaLoginCard
            title="Thẻ Học Giả"
            description="Đăng nhập cùng Shiba để theo dõi thời gian học, lưu streak học tập và tích lũy huy hiệu vinh danh nhé! 🐾🏆"
            variant="roadmap"
            onHoverChange={setIsCardHovered}
          />
        </div>
      )}
    </div>
  );
}


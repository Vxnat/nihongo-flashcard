"use client";

import React from "react";
import { Folder, Coins, Calendar, Wrench, Settings } from "lucide-react";

interface AdminSidebarProps {
  activeTab: "decks" | "gacha_shop" | "quests" | "users" | "settings";
  setActiveTab: (tab: "decks" | "gacha_shop" | "quests" | "users" | "settings") => void;
  setSelectedDeck: (deck: any) => void;
  user: any;
  isDev: boolean;
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  setSelectedDeck,
  user,
  isDev
}: AdminSidebarProps) {
  return (
    <div className="w-64 bg-[#8C6D58] text-white flex flex-col p-4 shrink-0 shadow-lg select-none border-r-4 border-[#735642]" style={{ fontFamily: "var(--font-rounded)" }}>
      <div className="flex items-center gap-2 mb-8 mt-2 px-2">
        <span className="text-3xl">🏮</span>
        <div>
          <h1 className="text-base font-black tracking-wider" style={{ fontFamily: "var(--font-cherry)" }}>
            SHIBA ADMIN
          </h1>
          <p className="text-[9px] text-[#FAF6EE]/75 font-bold uppercase tracking-widest">Dashboard v1.0</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        <button
          onClick={() => { setActiveTab("decks"); setSelectedDeck(null); }}
          className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center gap-3 transition-all cursor-pointer ${activeTab === "decks" ? "bg-white text-[#8C6D58] shadow-md" : "hover:bg-white/10 text-white"
            }`}
        >
          <Folder size={16} />
          <span>QUẢN LÝ BỘ THẺ DỮ LIỆU</span>
        </button>
        <button
          onClick={() => setActiveTab("gacha_shop")}
          className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center gap-3 transition-all cursor-pointer ${activeTab === "gacha_shop" ? "bg-white text-[#8C6D58] shadow-md" : "hover:bg-white/10 text-white"
            }`}
        >
          <Coins size={16} />
          <span>GACHA POOL & SHOP</span>
        </button>
        <button
          onClick={() => setActiveTab("quests")}
          className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center gap-3 transition-all cursor-pointer ${activeTab === "quests" ? "bg-white text-[#8C6D58] shadow-md" : "hover:bg-white/10 text-white"
            }`}
        >
          <Calendar size={16} />
          <span>DAILY QUESTS (TĨNH)</span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center gap-3 transition-all cursor-pointer ${activeTab === "users" ? "bg-white text-[#8C6D58] shadow-md" : "hover:bg-white/10 text-white"
            }`}
        >
          <Wrench size={16} />
          <span>TESTING & CHEAT STATS</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center gap-3 transition-all cursor-pointer ${activeTab === "settings" ? "bg-white text-[#8C6D58] shadow-md" : "hover:bg-white/10 text-white"
            }`}
        >
          <Settings size={16} />
          <span>CÀI ĐẶT HỆ THỐNG</span>
        </button>
      </nav>

      <div className="pt-4 border-t border-white/20 text-center text-[10px] text-white/50 font-bold">
        {isDev ? (
          <span className="text-emerald-300 font-extrabold bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
            🛠️ Chế độ Development (Ghi file cục bộ)
          </span>
        ) : (
          <span className="text-amber-300 font-extrabold bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/20">
            🌐 Chế độ Production (Chỉ đọc)
          </span>
        )}
        <p className="mt-4">Đăng nhập: {user?.email}</p>
      </div>
    </div>
  );
}

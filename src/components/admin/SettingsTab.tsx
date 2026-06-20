"use client";

import React from "react";

interface SettingsTabProps {
  systemSettings: {
    maintenanceMode: boolean;
    announcementBanner: string;
  };
  setSystemSettings: (settings: any) => void;
  handleUpdateSystemSetting: (key: string, val: any) => void;
}

export function SettingsTab({
  systemSettings,
  setSystemSettings,
  handleUpdateSystemSetting
}: SettingsTabProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6 max-w-2xl mx-auto" style={{ fontFamily: "var(--font-rounded)" }}>
      <div>
        <h3 className="text-sm font-black text-[#8C6D58] uppercase">Cấu hình Hệ Thống & Bảo Trì</h3>
        <p className="text-xs text-zinc-400 font-bold">Các cấu hình này lưu trữ trên Cloud Firestore và áp dụng tức thì cho toàn bộ người dùng.</p>
      </div>

      <div className="space-y-6 divide-y divide-zinc-100">
        {/* Maintenance mode toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-zinc-700">Chế độ Bảo Trì (Maintenance Mode)</h4>
            <p className="text-[10px] text-zinc-400 font-bold">Khi được bật, người dùng thông thường sẽ thấy màn hình thông báo bảo trì và không thể thao tác trên app.</p>
          </div>
          <button
            onClick={() => handleUpdateSystemSetting("maintenanceMode", !systemSettings.maintenanceMode)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              systemSettings.maintenanceMode ? "bg-red-500" : "bg-zinc-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                systemSettings.maintenanceMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Announcement Banner text */}
        <div className="pt-6 space-y-2">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-zinc-700">Dòng chữ Chạy Thông Báo (Announcement Banner)</h4>
            <p className="text-[10px] text-zinc-405 font-bold">Dòng chữ chạy ngang ở đầu website thông báo tin tức quan trọng.</p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={systemSettings.announcementBanner}
              onChange={(e) => setSystemSettings({ ...systemSettings, announcementBanner: e.target.value })}
              className="flex-1 px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl text-xs font-bold"
            />
            <button
              onClick={() => handleUpdateSystemSetting("announcementBanner", systemSettings.announcementBanner)}
              className="px-4 py-2 bg-[#8C6D58] hover:bg-[#735642] text-white font-black text-xs rounded-xl cursor-pointer"
            >
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

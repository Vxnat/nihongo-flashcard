"use client";

import React from "react";
import { Search } from "lucide-react";
import Image from "next/image";
import { CoinIcon } from "../common/CoinIcon";

interface UsersTabProps {
  usersStatsList: any[];
  selectedUser: any;
  setSelectedUser: (user: any) => void;
  searchUserQuery: string;
  setSearchUserQuery: (query: string) => void;
  handleUpdateUserStat: (userId: string, key: string, val: any) => void;
}

export function UsersTab({
  usersStatsList,
  selectedUser,
  setSelectedUser,
  searchUserQuery,
  setSearchUserQuery,
  handleUpdateUserStat
}: UsersTabProps) {
  const filteredUsers = usersStatsList.filter(u =>
    u.id.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchUserQuery.toLowerCase())) ||
    (u.displayName && u.displayName.toLowerCase().includes(searchUserQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-rounded)" }}>
      <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="font-black text-zinc-700 text-sm">Testing & Hack/Cheat Stats Người dùng</h3>
          <p className="text-xs text-zinc-400 font-bold">Lấy dữ liệu người dùng thật từ bộ sưu tập user_stats trên Cloud Firestore.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Tìm theo UID, Email, Tên..."
            value={searchUserQuery}
            onChange={(e) => setSearchUserQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border-2 border-zinc-200 focus:border-[#8C6D58] rounded-xl text-xs w-full outline-none font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden h-[400px] flex flex-col">
          <div className="p-4 bg-zinc-50 border-b border-zinc-150 font-black text-zinc-500 text-xs uppercase tracking-wider">
            Danh Sách Tài Khoản Hệ Thống
          </div>
          <div className="flex-1 overflow-auto divide-y divide-zinc-100">
            {filteredUsers.map(u => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors ${selectedUser?.id === u.id ? "bg-amber-50/50 border-l-4 border-[#8C6D58]" : ""
                  }`}
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-zinc-700 truncate">{u.displayName || "Học viên ẩn danh"}</h4>
                  <p className="text-[10px] text-zinc-400 font-bold truncate">UID: {u.id} | Email: {u.email || "Không có"}</p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-xs font-black text-[#8C6D58] flex items-center justify-end gap-1">
                      <CoinIcon /> {u.goldenFur || 0}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400">Coins: {u.coins || 0}</p>
                  </div>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <p className="p-8 text-center text-zinc-400 italic text-xs">Không tìm thấy tài khoản nào trên Cloud Firestore.</p>
            )}
          </div>
        </div>

        {/* Cheat Panel */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 flex flex-col justify-between">
          {selectedUser ? (
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">Đang chọn</span>
                <h3 className="text-sm font-black text-zinc-800 mt-2">{selectedUser.displayName || "User"}</h3>
                <p className="text-[10px] text-zinc-400 font-bold truncate">UID: {selectedUser.id}</p>
              </div>

              <div className="pt-4 border-t border-zinc-100 space-y-3">
                {/* Golden Fur */}
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase">Shiba Coin (Golden Fur)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={selectedUser.goldenFur || 0}
                      onChange={(e) => handleUpdateUserStat(selectedUser.id, "goldenFur", parseInt(e.target.value) || 0)}
                      className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-black w-24 outline-none focus:border-[#8C6D58]"
                    />
                    <button
                      onClick={() => handleUpdateUserStat(selectedUser.id, "goldenFur", (selectedUser.goldenFur || 0) + 100)}
                      className="px-2.5 py-1.5 bg-amber-500 text-white font-black text-[10px] rounded-lg cursor-pointer"
                    >
                      +100
                    </button>
                    <button
                      onClick={() => handleUpdateUserStat(selectedUser.id, "goldenFur", 0)}
                      className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border rounded-lg cursor-pointer text-[10px]"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Coins */}
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase">Xương (Coins)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={selectedUser.coins || 0}
                      onChange={(e) => handleUpdateUserStat(selectedUser.id, "coins", parseInt(e.target.value) || 0)}
                      className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-black w-24 outline-none focus:border-[#8C6D58]"
                    />
                    <button
                      onClick={() => handleUpdateUserStat(selectedUser.id, "coins", (selectedUser.coins || 0) + 100)}
                      className="px-2.5 py-1.5 bg-orange-500 text-white font-black text-[10px] rounded-lg cursor-pointer"
                    >
                      +100
                    </button>
                  </div>
                </div>

                {/* Streak */}
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase">Học liên tục (Streak)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={selectedUser.streak || 0}
                      onChange={(e) => handleUpdateUserStat(selectedUser.id, "streak", parseInt(e.target.value) || 0)}
                      className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-black w-24 outline-none focus:border-[#8C6D58]"
                    />
                  </div>
                </div>

                {/* Pity Counter */}
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase">Pity Counter (Bảo hiểm gacha)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={selectedUser.pityCounter || 0}
                      onChange={(e) => handleUpdateUserStat(selectedUser.id, "pityCounter", parseInt(e.target.value) || 0)}
                      className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-black w-24 outline-none focus:border-[#8C6D58]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center py-12 text-zinc-400 italic text-xs">
              Chọn một tài khoản bên trái để sửa đổi chỉ số cheat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "@/utils/cloudinary";

interface ShopItemModalProps {
  selectedShopItem: any;
  setSelectedShopItem: (item: any) => void;
  shopExclusives: any[];
  shopConsumables: any[];
  setIsShopModalOpen: (open: boolean) => void;
  handleSaveShopItem: (item: any) => void;
  shopItemType: "exclusive" | "consumable";
}

export function ShopItemModal({
  selectedShopItem,
  setSelectedShopItem,
  shopExclusives,
  shopConsumables,
  setIsShopModalOpen,
  handleSaveShopItem,
  shopItemType
}: ShopItemModalProps) {
  const [form, setForm] = React.useState<any>({ ...selectedShopItem });

  React.useEffect(() => {
    setForm({ ...selectedShopItem });
  }, [selectedShopItem]);

  const listToSearch = shopItemType === "exclusive" ? shopExclusives : shopConsumables;
  const isEdit = listToSearch.some(i => i.id === selectedShopItem.id);

  const [isUploadingImg, setIsUploadingImg] = React.useState(false);

  const handleUpload = async (file: File) => {
    setIsUploadingImg(true);

    const secureUrl = await uploadToCloudinary(file, form.type, "icon");

    if (secureUrl) {
      setForm((prev: any) => ({ ...prev, imageUrl: secureUrl }));
      toast.success("Tải ảnh lên Cloudinary thành công!");
    }

    setIsUploadingImg(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" style={{ fontFamily: "var(--font-rounded)" }}>
      <div className="bg-white rounded-[2rem] border-4 border-[#8C6D58] w-full max-w-lg p-6 shadow-xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 border-zinc-150">
          <h3 className="font-black text-zinc-800 text-sm" style={{ fontFamily: "var(--font-cherry)" }}>
            {isEdit ? "SỬA VẬT PHẨM CỬA HÀNG" : "THÊM VẬT PHẨM CỬA HÀNG MỚI"}
          </h3>
          <button onClick={() => setIsShopModalOpen(false)} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs font-bold">
          <div>
            <label className="text-[10px] text-zinc-400 uppercase">Mã cửa hàng (ID)</label>
            <input
              type="text"
              value={form.id || ""}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 text-[#8C6D58] font-extrabold"
              placeholder="VD: fur_tatami_mat"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase">Tên vật phẩm</label>
            <input
              type="text"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              placeholder="VD: Thảm Tatami Nhật Bản"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Loại vật phẩm (Type)</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 bg-white"
              >
                <option value="furniture">Furniture (Nội thất)</option>
                <option value="outfit">Outfit (Trang phục)</option>
                <option value="voice">Voice Pack (Giọng nói)</option>
                <option value="consumable">Consumable (Bùa tiêu hao)</option>
                <option value="costume">Costume (Cải trang)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Giá mua (Shiba Coin)</label>
              <input
                type="number"
                value={form.cost || 50}
                onChange={(e) => setForm({ ...form, cost: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-zinc-400 uppercase">Đường dẫn hình ảnh (ImageUrl)</label>
              <label className="text-[10px] text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                  disabled={isUploadingImg}
                />
                <span>{isUploadingImg ? "Đang tải..." : "Tải ảnh"}</span>
              </label>
            </div>
            <input
              type="text"
              value={form.imageUrl || ""}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              placeholder="VD: /images/decorations/decoration_tatami.png"
            />
          </div>
          {/* Cấu hình Phân loại Hệ thống (Gacha & Shop) */}
          <div className="p-3 border border-[#8C6D58]/20 rounded-xl bg-orange-50/20 space-y-2 text-[10px]">
            <p className="text-[9px] font-black text-[#8C6D58] uppercase">Phân loại Hệ thống (Gacha / Cửa hàng)</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.isGacha}
                  onChange={(e) => setForm({ ...form, isGacha: e.target.checked })}
                  className="rounded border-zinc-300 text-[#8C6D58] focus:ring-[#8C6D58]"
                />
                <span>Có trong Gacha</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.isShop}
                  onChange={(e) => setForm({ ...form, isShop: e.target.checked })}
                  className="rounded border-zinc-300 text-[#8C6D58] focus:ring-[#8C6D58]"
                />
                <span>Bán trong Cửa hàng</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase">Mô tả ngắn</label>
            <input
              type="text"
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              placeholder="VD: Chiếu rơm trải sàn phong cách Nhật Bản truyền thống."
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase">Truyền thuyết / Lore</label>
            <textarea
              value={form.lore || ""}
              onChange={(e) => setForm({ ...form, lore: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1 min-h-[40px]"
              placeholder="Ghi cốt truyện cho vật phẩm thêm hấp dẫn..."
            />
          </div>

          {/* Specific fields for costume shop item */}
          {form.type === "costume" && (
            <div className="p-3 border border-orange-200 rounded-xl bg-orange-50/50 space-y-2 mt-2">
              <p className="text-[9px] font-black text-amber-800 uppercase">Cấu hình Cải trang (Costume)</p>
              <div className="space-y-2 text-[10px]">
                <div>
                  <label className="text-zinc-400 uppercase">Đường dẫn ảnh toàn thân (avatarUrl)</label>
                  <input
                    type="text"
                    value={form.avatarUrl || ""}
                    onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5 font-mono"
                    placeholder="VD: /images/mascot/skins/shiba_luffy.png"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 uppercase">Hiệu ứng học tập (booster)</label>
                  <select
                    value={form.booster || ""}
                    onChange={(e) => setForm({ ...form, booster: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5"
                  >
                    <option value="">Không có chỉ số (No Booster)</option>
                    <option value="coin_boost_10">Coin Boost +10% (Tăng Coin nhận bài học)</option>
                    <option value="xp_boost_15">XP Boost +15% (Tăng XP chơi Minigame)</option>
                    <option value="streak_shield">Streak Shield (Giảm giá bùa Streak)</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 uppercase">Hiệu ứng Hoạt ảnh</label>
                  <select
                    value={form.animation || "none"}
                    onChange={(e) => setForm({ ...form, animation: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5"
                  >
                    <option value="none">Không có (none)</option>
                    <option value="pulse">Mờ ảo nhấp nháy (pulse)</option>
                    <option value="float">Bay bồng bềnh (float)</option>
                    <option value="spin">Xoay tròn (spin)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {(form.type === "outfit" || form.type === "accessory") && (
            <div className="p-3 border border-orange-200 rounded-xl bg-orange-50/50 space-y-2 mt-2">
              <p className="text-[9px] font-black text-amber-800 uppercase">RPG Character Layer Config</p>
              <div className="text-[10px]">
                <label className="text-zinc-400">Vị trí slot trang bị (rpgSlot)</label>
                <select
                  value={form.rpgSlot || "head"}
                  onChange={(e) => setForm({ ...form, rpgSlot: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg bg-white mt-0.5"
                >
                  <option value="head">Mũ/Đầu (Head)</option>
                  <option value="armor">Trang phục/Giáp (Armor)</option>
                  <option value="earring">Trang sức tai (Earring)</option>
                  <option value="gloves">Bao tay/Vũ khí (Gloves)</option>
                  <option value="mount">Thú cưỡi/Đồng hành (Mount)</option>
                  <option value="aura">Hào quang/Khí tức (Aura)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={() => setIsShopModalOpen(false)}
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-black rounded-xl text-xs cursor-pointer border"
          >
            Hủy
          </button>
          <button
            onClick={() => handleSaveShopItem(form)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs cursor-pointer"
          >
            Xác nhận lưu
          </button>
        </div>
      </div>
    </div>
  );
}

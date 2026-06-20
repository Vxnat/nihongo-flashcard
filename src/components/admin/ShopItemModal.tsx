"use client";

import React from "react";
import { X } from "lucide-react";

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
            <label className="text-[10px] text-zinc-400 uppercase">Đường dẫn hình ảnh (ImageUrl)</label>
            <input
              type="text"
              value={form.imageUrl || ""}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              placeholder="VD: /images/decorations/decoration_tatami.png"
            />
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

          <div>
            <label className="text-[10px] text-zinc-400 uppercase">Hiệu ứng / Chỉ số cộng thêm (Effects)</label>
            <input
              type="text"
              value={form.effects || ""}
              onChange={(e) => setForm({ ...form, effects: e.target.value })}
              className="w-full px-3.5 py-2 border border-zinc-200 focus:border-[#8C6D58] outline-none rounded-xl mt-1"
              placeholder="VD: RPG Stats: +10 Phòng thủ"
            />
          </div>
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

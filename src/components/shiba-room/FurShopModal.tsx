"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { X, Sparkles, Clock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { RARITY_CONFIG, GachaRarity } from "@/constants/gachaPool";
import { useSystemItems } from "@/hooks/shiba-room/useSystemItems";
import { SHARD_PRICES } from "@/constants/shopItems";
import { playAudioUrl } from "@/utils/tts";
import toast from "react-hot-toast";
import Image from "next/image";
import { CoinIcon } from "../common/CoinIcon";

interface FurShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHIBA_DIALOGS = [
  "Irasshaimase! Đang có nhiều Shiba Coin lấp lánh chứ?",
  "Muốn đổi bùa may mắn hay mảnh ghép thần thoại đây nyan?",
  "Học hành chăm chỉ thì mới có Shiba Coin xịn để đổi nha!",
  "Đồ hiếm ở đây chất lượng lắm, không lo trúng gió đâu nhe!",
  "Bé Shiba thích Shiba Coin lắm, đem đổi quà xịn đi chủ nhân!"
];

export function FurShopModal({ isOpen, onClose }: FurShopModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { gachaPool, shopExclusives, shopConsumables } = useSystemItems();
  const { userStats, buyShopItem, user } = useAppStore((state: any) => state);
  const [activeTab, setActiveTab] = useState<"shard" | "exclusive" | "consumable">("shard");
  const [shibaBubble, setShibaBubble] = useState(SHIBA_DIALOGS[0]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<"shard" | "exclusive" | "consumable" | null>(null);

  // Time remaining for Double Bones buff
  const [doubleBonesTimeLeft, setDoubleBonesTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;

    // Choose a random dialog
    const rand = SHIBA_DIALOGS[Math.floor(Math.random() * SHIBA_DIALOGS.length)];
    setShibaBubble(rand);

    // Setup interval for buff time countdown
    const updateCountdown = () => {
      if (!userStats.buffDoubleBonesUntil) {
        setDoubleBonesTimeLeft("");
        return;
      }
      const limit = new Date(userStats.buffDoubleBonesUntil).getTime();
      const diff = limit - Date.now();
      if (diff <= 0) {
        setDoubleBonesTimeLeft("");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setDoubleBonesTimeLeft(`${hours}h ${mins}m ${secs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isOpen, userStats.buffDoubleBonesUntil]);

  if (!isOpen || !user || !mounted) return null;

  // Audio coin drop sound
  const playCoinSound = () => {
    playAudioUrl("https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav", 0.5);
  };

  // Filter Gacha items for the Shard tab
  const shardItems = gachaPool.filter(item =>
    ["epic", "legendary", "mythic", "divine"].includes(item.rarity)
  );

  // Helper check if item is owned
  const isItemOwned = (itemId: string) => {
    return userStats.inventory?.includes(itemId) || false;
  };

  const handleItemClick = (item: any, type: "shard" | "exclusive" | "consumable") => {
    setSelectedItem(item);
    setSelectedType(type);

    // Update shopkeeper dialogue based on item type
    if (type === "shard") {
      setShibaBubble(`Mảnh ghép của ${item.name} đó! Tích lũy đủ để mở khóa luôn mà không cần gacha nha!`);
    } else if (type === "exclusive") {
      setShibaBubble(`Vật phẩm giới hạn đặc biệt nè! Không kiếm được ở máy gacha thông thường đâu nyan!`);
    } else {
      setShibaBubble(`Bùa bổ trợ siêu xịn! Bùa đỏ nhân đôi thu hoạch, bùa vàng gia tăng vận may gacha!`);
    }
  };

  const handleBuy = async () => {
    if (!selectedItem || !selectedType) return;

    // Check if owned (for exclusive)
    if (selectedType === "exclusive" && isItemOwned(selectedItem.id)) {
      toast.error("Bạn đã sở hữu vật phẩm này rồi!");
      return;
    }

    let cost = 0;
    let targetId = undefined;

    if (selectedType === "shard") {
      cost = selectedItem.shardPrice !== undefined ? selectedItem.shardPrice : (SHARD_PRICES[selectedItem.rarity] || 0);
      targetId = selectedItem.id;
    } else {
      cost = selectedItem.cost;
    }

    if (userStats.goldenFur < cost) {
      toast.error("Không đủ Shiba Coin! Hãy quay gacha trùng để tích lũy nhé!");
      return;
    }

    const success = await buyShopItem(selectedItem.id, selectedType, targetId);
    if (success) {
      playCoinSound();
      toast.success(`Trao đổi thành công: ${selectedItem.name}!`);

      // Dynamic Confetti
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 100,
        });
      });

      setShibaBubble(`Cảm ơn chủ nhân đã ủng hộ! Shiba đã cất Shiba Coin đi rồi nyan!`);
      setSelectedItem(null);
      setSelectedType(null);
    } else {
      toast.error("Giao dịch không thành công. Hãy thử lại!");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      {/* Backdrop click closes modal */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container */}
      <div
        className="relative bg-[#FFFDF6] border-[6px] border-[#FFD2CC] rounded-[3.5rem] shadow-2xl w-full max-w-lg md:max-w-xl h-[85vh] flex flex-col overflow-hidden max-h-[700px] z-10"
        style={{ fontFamily: "var(--font-cherry)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#FFF0F2] to-[#FFF9E6] border-b-4 border-[#FFD2CC] rounded-t-[3rem]">
          <div className="flex items-center gap-2.5">
            <Sparkles size={20} className="text-[#FFD166] fill-[#FFD166] animate-bounce" />
            <div>
              <h2 className="text-sm md:text-base font-black text-[#E05375] tracking-wide" style={{ textShadow: "0 2px 0 #fff" }}>
                TIỆM KỲ TRÂN SHIBA
              </h2>
              <p className="text-[9px] text-[#FF8A5B] font-black uppercase tracking-wider">Thương nhân Shiba & Bảo vật</p>
            </div>
          </div>

          {/* Golden Fur Wallet */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-gradient-to-br from-[#FFFDF2] to-[#FFF9D0] border-2 border-[#FFD2CC] px-3.5 py-1.5 rounded-full text-xs font-black text-amber-700 shadow-sm">
              <CoinIcon />
              <span>{userStats.goldenFur || 0}</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#FF85A1] border-b-4 border-[#D84A70] hover:bg-[#FF9FB6] text-white flex items-center justify-center font-black active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-sm"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Shopkeeper Area */}
        <div className="flex items-center gap-4 bg-[#FFF0F2] border-2 border-[#FFD2CC] p-3 mx-5 mt-4 rounded-2xl relative shadow-sm">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 bg-[#FFE5EC] rounded-full border-2 border-[#FFD2CC] overflow-hidden relative">
              <Image
                src="/images/mascot/shiba_shop.gif"
                alt="Merchant Shiba"
                className="object-cover scale-120 translate-y-1.5"
                fill
              />
            </div>
            {/* Merchant Hat/Badge overlay */}
            <div className="absolute -top-1 -left-1 bg-[#FF85A1] text-[6px] px-1.5 py-0.5 text-white font-black rounded-lg border border-white z-10 shadow-sm uppercase">SHOP</div>
          </div>
          {/* Chat Bubble */}
          <div className="flex-1 bg-white border-2 border-[#FFD2CC] px-3.5 py-2.5 rounded-[1.5rem] text-[10px] md:text-xs font-bold text-[#E05375] relative shadow-xs">
            <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-white border-b-[6px] border-b-transparent z-10" />
            <div className="absolute left-[-2px] top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-r-[9px] border-r-[#FFD2CC] border-b-[7px] border-b-transparent" />
            <p className="leading-snug">{shibaBubble}</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#FFF0F2] p-1.5 rounded-2xl mx-5 mt-4 border-2 border-[#FFD2CC]">
          {(["shard", "exclusive", "consumable"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedItem(null);
                setSelectedType(null);
              }}
              className={`py-2 text-[10px] md:text-xs font-black rounded-xl transition-all cursor-pointer ${activeTab === tab
                ? "bg-[#FF85A1] text-white shadow-sm border-b-2 border-[#D84A70] scale-102"
                : "text-[#C7486B]/60 hover:text-[#C7486B] hover:bg-white/40"
                }`}
              style={{ fontFamily: "var(--font-cherry)" }}
            >
              {tab === "shard" ? "MẢNH GHÉP" : tab === "exclusive" ? "ĐỘC QUYỀN" : "BÙA CHÚ"}
            </button>
          ))}
        </div>

        {/* Shop Grid Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 content-start">

          {/* TAB 1: SHARDS */}
          {activeTab === "shard" && (
            <div className="grid grid-cols-3 gap-3">
              {shardItems.map((item) => {
                const price = item.shardPrice !== undefined ? item.shardPrice : (SHARD_PRICES[item.rarity as string] || 0);
                const ownedShards = userStats.shards?.[item.id] || 0;
                const rarityColor = RARITY_CONFIG[item.rarity as GachaRarity]?.color;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item, "shard")}
                    className={`bg-white border-2 p-2.5 rounded-2xl flex flex-col justify-between h-[110px] cursor-pointer transition-all active:scale-95 shadow-xs relative rare-glow-card ${selectedItem?.id === item.id ? "border-[#FF85A1] ring-4 ring-[#FF85A1]/20 scale-102 shadow-md" : "border-[#FFD2CC]/60 hover:border-[#FF85A1]"
                      }`}
                    style={{ '--glow-color': rarityColor } as React.CSSProperties}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 flex items-center justify-center bg-[#FFF9FA] rounded-xl overflow-hidden border border-[#FFD2CC]/30 relative">
                        <Image src={item.imageUrl} alt={item.name} className="object-contain" width={32} height={32} />
                      </div>
                      <h4 className="text-[9px] font-black text-zinc-700 text-center truncate w-full mt-1.5">
                        Mảnh {item.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-[#FFD2CC]/30">
                      <span className="text-[8px] font-black text-[#FF8A5B]">
                        Mảnh: {ownedShards}/{item.shardTarget}
                      </span>
                      <span className="text-[9px] font-black text-[#E05375] flex items-center gap-0.5 bg-[#FFF0F2] px-1.5 py-0.5 rounded-full border border-[#FFD2CC]/50">
                        <CoinIcon /> {price}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: EXCLUSIVES */}
          {activeTab === "exclusive" && (
            <div className="grid grid-cols-3 gap-3">
              {shopExclusives.map((item) => {
                const owned = isItemOwned(item.id);
                const rarityColor = RARITY_CONFIG[item.rarity as GachaRarity]?.color;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item, "exclusive")}
                    className={`bg-white border-2 p-2.5 rounded-2xl flex flex-col justify-between h-[110px] cursor-pointer transition-all active:scale-95 shadow-xs relative ${rarityColor ? "rare-glow-card" : ""
                      } ${owned ? "opacity-75" : ""} ${selectedItem?.id === item.id ? "border-[#FF85A1] ring-4 ring-[#FF85A1]/20 scale-102 shadow-md" : "border-[#FFD2CC]/60 hover:border-[#FF85A1]"}`}
                    style={rarityColor ? ({ '--glow-color': rarityColor } as React.CSSProperties) : undefined}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 flex items-center justify-center bg-[#FFF9FA] rounded-xl overflow-hidden border border-[#FFD2CC]/30">
                        <Image src={item.imageUrl} alt={item.name} className="object-contain" width={32} height={32} />
                      </div>
                      <h4 className="text-[9px] font-black text-zinc-700 text-center truncate w-full mt-1.5">
                        {item.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-center mt-1 pt-1.5 border-t border-[#FFD2CC]/30 w-full">
                      {owned ? (
                        <span className="text-[8px] font-black text-[#06D6A0] bg-[#06D6A0]/10 px-2 py-0.5 rounded-lg border border-[#06D6A0]/25">
                          ĐÃ SỞ HỮU
                        </span>
                      ) : (
                        <span className="text-[9px] font-black text-[#E05375] flex items-center gap-0.5 bg-[#FFF0F2] px-2 py-0.5 rounded-full border border-[#FFD2CC]/50">
                          <CoinIcon /> {item.cost}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: CONSUMABLES */}
          {activeTab === "consumable" && (
            <div className="grid grid-cols-2 gap-4">
              {shopConsumables.map((item) => {
                const isDoubleBones = item.id === "buff_double_bones";
                const isLuckyGacha = item.id === "buff_lucky_gacha";

                // Check active status
                const isDoubleActive = isDoubleBones && doubleBonesTimeLeft !== "";
                const isLuckyActive = isLuckyGacha && (userStats.buffLuckyGachaRolls || 0) > 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item, "consumable")}
                    className={`bg-white border-2 p-3.5 rounded-2xl flex flex-col justify-between h-[130px] cursor-pointer transition-all active:scale-95 shadow-xs relative ${selectedItem?.id === item.id ? "border-[#FF85A1] ring-4 ring-[#FF85A1]/20 scale-102 shadow-md" : "border-[#FFD2CC]/60 hover:border-[#FF85A1]"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 flex items-center justify-center bg-[#FFF2E6] rounded-2xl border border-[#FFD2CC]/30 flex-shrink-0 overflow-hidden p-1">
                        <Image src={item.imageUrl} alt={item.name} className="object-contain" width={40} height={40} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-zinc-700 truncate">{item.name}</h4>
                        <p className="text-[9px] text-zinc-400 font-black mt-1 leading-tight line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#FFD2CC]/30 pt-2 mt-1">
                      {/* Active Status Display */}
                      <div>
                        {isDoubleActive && (
                          <span className="text-[8px] font-black text-[#FF7096] bg-[#FF7096]/10 px-2 py-0.5 rounded-lg flex items-center gap-0.5 border border-[#FF7096]/20">
                            <Clock size={8} /> {doubleBonesTimeLeft}
                          </span>
                        )}
                        {isLuckyActive && (
                          <span className="text-[8px] font-black text-[#8A2BE2] bg-[#8A2BE2]/10 px-2 py-0.5 rounded-lg flex items-center gap-0.5 border border-[#8A2BE2]/20">
                            Còn {userStats.buffLuckyGachaRolls} lượt
                          </span>
                        )}
                        {!isDoubleActive && !isLuckyActive && (
                          <span className="text-[8px] font-black text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-lg border border-zinc-200/50">Chưa kích hoạt</span>
                        )}
                      </div>

                      <span className="text-xs font-black text-[#E05375] flex items-center gap-0.5 bg-[#FFF0F2] px-2 py-0.5 rounded-full border border-[#FFD2CC]/50">
                        <CoinIcon /> {item.cost}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Item Drawer Details Overlay */}
        <AnimatePresence>
          {selectedItem && (
            <div className="absolute inset-x-0 bottom-0 bg-[#FFFDF6] border-t-4 border-[#FFD2CC] p-5 flex flex-col gap-3.5 rounded-t-[2.5rem] shadow-[0_-10px_25px_rgba(255,210,204,0.35)] z-20">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 flex items-center justify-center bg-[#FFF9FA] border-2 border-[#FFD2CC] rounded-2xl overflow-hidden flex-shrink-0">
                  <Image src={selectedItem.imageUrl} alt={selectedItem.name} className="object-contain" width={48} height={48} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-zinc-700">
                      {selectedType === "shard" ? `Mảnh ghép: ${selectedItem.name}` : selectedItem.name}
                    </h3>
                    {selectedItem.rarity && (
                      <span
                        className="text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border shadow-xs"
                        style={{
                          backgroundColor: RARITY_CONFIG[selectedItem.rarity as GachaRarity].bgColor,
                          color: RARITY_CONFIG[selectedItem.rarity as GachaRarity].textColor,
                          borderColor: RARITY_CONFIG[selectedItem.rarity as GachaRarity].color + '40',
                        }}
                      >
                        {selectedItem.rarity}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-zinc-500 font-bold mt-1 leading-normal italic">
                    "{selectedItem.lore || "Bảo vật quý giá có nguồn gốc từ đền thờ thần khuyển."}"
                  </p>
                </div>
              </div>

              {/* Effects details */}
              <div className="bg-[#FFF5F7] border border-[#FFD2CC] p-2.5 rounded-xl text-[10px] md:text-xs font-bold text-[#E05375] flex items-center gap-2 shadow-inner">
                <Sparkles size={13} className="text-[#FFA8B6] flex-shrink-0 animate-pulse" />
                <span>{selectedType === "shard" ? `Nhận 1 mảnh ghép. Thu thập đủ ${selectedItem.shardTarget} mảnh để mở khóa vật phẩm này.` : "Cấp vĩnh viễn vật phẩm."}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setSelectedType(null);
                  }}
                  className="flex-1 py-2.5 text-zinc-500 bg-zinc-100 hover:bg-zinc-200 border-b-4 border-zinc-300 font-black rounded-xl text-xs active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-xs text-center"
                >
                  HUỶ
                </button>

                {selectedType === "exclusive" && isItemOwned(selectedItem.id) ? (
                  <div className="flex-[1.5] py-2.5 text-center text-xs font-black text-[#06D6A0] bg-[#06D6A0]/10 rounded-xl border-b-4 border-[#05b084] border">
                    ĐÃ SỞ HỮU VẬT PHẨM
                  </div>
                ) : (
                  <button
                    onClick={handleBuy}
                    className="flex-[1.5] py-2.5 bg-[#FF85A1] hover:bg-[#FF9FB6] border-b-4 border-[#D84A70] text-white font-black rounded-xl text-xs active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 hover:brightness-105"
                  >
                    <span className="flex items-center gap-1">
                      <CoinIcon /> {selectedType === "shard" ? (selectedItem.shardPrice !== undefined ? selectedItem.shardPrice : SHARD_PRICES[selectedItem.rarity]) : selectedItem.cost}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>,
    document.body
  );
}

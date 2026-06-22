"use client";

import { useSystemItems } from "@/hooks/shiba-room/useSystemItems";
import React from "react";

interface ShibaAvatarProps {
  /** Map of equipped items slots (e.g. { head: "out_straw_hat", armor: "out_luffy_shirt", costume: "costume_luffy" }) */
  equippedSlots?: Record<string, string>;
  /** Tailwind sizing class or CSS dimensions container */
  sizeClassName?: string;
  /** Global breathing animation toggle */
  animate?: boolean;
  /** Inline container styling overrides */
  style?: React.CSSProperties;
}

export function ShibaAvatar({
  equippedSlots = {},
  sizeClassName = "w-full h-full",
  animate = true,
  style,
}: ShibaAvatarProps) {
  const { allItems } = useSystemItems();
  const costumeId = equippedSlots.costume;
  const costumeItem = costumeId ? allItems.find((i) => i.id === costumeId) : null;

  // Determine active mascot image and metadata (either equipped costume or default base body)
  const activeMascot = React.useMemo(() => {
    if (costumeItem) {
      return {
        id: costumeItem.id,
        name: costumeItem.name,
        imageUrl: costumeItem.avatarUrl || "",
        animation: costumeItem.animation || "none",
        rarity: costumeItem.rarity,
        isCostume: true,
      };
    }
    return {
      id: "base_body",
      name: "Shiba Base Body",
      imageUrl: "/images/mascot/layers/base_body.png",
      animation: "none",
      rarity: "common",
      isCostume: false,
    };
  }, [costumeItem]);

  // Determine specific animation classes
  const animationClass = activeMascot.animation !== "none" ? `shiba-anim-${activeMascot.animation}` : "";

  // Determine specific aura effects based on rarity
  let auraClass = "";
  if (activeMascot.isCostume) {
    if (activeMascot.rarity === "legendary") {
      auraClass = "aura-legendary";
    } else if (activeMascot.rarity === "mythic") {
      auraClass = "aura-mythic";
    } else if (activeMascot.rarity === "divine") {
      auraClass = "aura-divine";
    }
  }

  return (
    <div
      className={`relative ${sizeClassName} select-none overflow-hidden`}
      style={{
        aspectRatio: "1/1",
        ...style,
      }}
    >
      {/* Shiba character mascot base container with breathing keyframes */}
      <div
        className="relative w-full h-full"
        style={
          animate
            ? {
              animation: "shibaBreathingAnimate 3.5s ease-in-out infinite",
            }
            : undefined
        }
      >
        <img
          src={activeMascot.imageUrl}
          alt={activeMascot.name}
          className={`absolute inset-0 w-full h-full object-contain pointer-events-none ${animationClass} ${auraClass}`}
          style={{ zIndex: 1 }}
          draggable={false}
        />
      </div>

      {/* Embedded CSS animations for Shiba breathing & accessories */}
      <style>{`
        @keyframes shibaBreathingAnimate {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.02) translateY(-2%); }
        }
        @keyframes shibaFloatAnimate {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes shibaPulseAnimate {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @keyframes shibaSpinAnimate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .shiba-anim-float {
          animation: shibaFloatAnimate 2.8s ease-in-out infinite;
        }
        .shiba-anim-pulse {
          animation: shibaPulseAnimate 2s ease-in-out infinite;
        }
        .shiba-anim-spin {
          animation: shibaSpinAnimate 6s linear infinite;
        }

        /* Aura effects for premium costumes */
        .aura-legendary {
          filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.8));
        }
        .aura-mythic {
          filter: drop-shadow(0 0 8px rgba(244, 63, 94, 0.85));
        }
        .aura-divine {
          filter: drop-shadow(0 0 12px rgba(236, 72, 153, 0.95));
        }
      `}</style>
    </div>
  );
}

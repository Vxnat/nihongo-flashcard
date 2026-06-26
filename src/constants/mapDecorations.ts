export interface DecorationConfig {
  src: string;
  opacity: string;
  sizeClass: string;
}

// Cấu trúc: MAP_DECORATIONS[ChapterNumber][NodeIndex]
export const MAP_DECORATIONS: Record<number, Record<number, DecorationConfig>> = {
  1: {
    0: { src: "/images/decorations/decoration_1.gif", opacity: "opacity-40", sizeClass: "w-16 h-16 sm:w-24 sm:h-24" },
    2: { src: "/images/decorations/decoration_2.gif", opacity: "opacity-30", sizeClass: "w-24 h-24 sm:w-28 sm:h-28" },
    5: { src: "/images/decorations/decoration_3.gif", opacity: "opacity-50", sizeClass: "w-16 h-16 sm:w-20 sm:h-20" },
    7: { src: "/images/decorations/decoration_4.gif", opacity: "opacity-20", sizeClass: "w-28 h-28 sm:w-32 sm:h-32" },
  },
  2: {
    0: { src: "/images/decorations/decoration_13.gif", opacity: "opacity-30", sizeClass: "w-20 h-20 sm:w-24 sm:h-24" },
    1: { src: "/images/decorations/decoration_5.gif", opacity: "opacity-30", sizeClass: "w-20 h-20 sm:w-24 sm:h-24" },
    3: { src: "/images/decorations/decoration_6.gif", opacity: "opacity-40", sizeClass: "w-24 h-24 sm:w-28 sm:h-28" },
    5: { src: "/images/decorations/decoration_7.gif", opacity: "opacity-30", sizeClass: "w-20 h-20 sm:w-24 sm:h-24" },
  },
  3: {
    0: { src: "/images/decorations/decoration_8.gif", opacity: "opacity-20", sizeClass: "w-15 h-15 sm:w-32 sm:h-32" },
    2: { src: "/images/decorations/decoration_9.gif", opacity: "opacity-30", sizeClass: "w-20 h-20 sm:w-24 sm:h-24" },
    5: { src: "/images/decorations/decoration_10.gif", opacity: "opacity-40", sizeClass: "w-24 h-24 sm:w-28 sm:h-28" },
  },
  4: {
    1: { src: "/images/decorations/decoration_11.gif", opacity: "opacity-30", sizeClass: "w-16 h-16 sm:w-20 sm:h-20" },
    3: { src: "/images/decorations/decoration_12.gif", opacity: "opacity-20", sizeClass: "w-20 h-20 sm:w-32 sm:h-32" },
    5: { src: "/images/decorations/decoration_13.gif", opacity: "opacity-30", sizeClass: "w-20 h-20 sm:w-24 sm:h-24" },
  },
  5: {
    0: { src: "/images/decorations/decoration_1.gif", opacity: "opacity-40", sizeClass: "w-16 h-16 sm:w-24 sm:h-24" },
    2: { src: "/images/decorations/decoration_2.gif", opacity: "opacity-30", sizeClass: "w-20 h-20 sm:w-24 sm:h-24" },
    4: { src: "/images/decorations/decoration_3.gif", opacity: "opacity-50", sizeClass: "w-16 h-16 sm:w-20 sm:h-20" },
    7: { src: "/images/decorations/decoration_4.gif", opacity: "opacity-20", sizeClass: "w-28 h-28 sm:w-32 sm:h-32" },
  }
};
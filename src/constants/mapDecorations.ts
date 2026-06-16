export interface DecorationConfig {
  src: string;
  opacity: string;
  sizeClass: string;
  isLeft: boolean;
  yOffset: string;
}

// Cấu trúc: MAP_DECORATIONS[ChapterNumber][NodeIndex]
export const MAP_DECORATIONS: Record<number, Record<number, DecorationConfig>> = {
  1: {
    0: { src: "/images/decorations/decoration_1.gif", opacity: "opacity-40", sizeClass: "w-16 h-16 sm:w-24 sm:h-24", isLeft: true, yOffset: "-translate-y-1/2" },
    2: { src: "/images/decorations/decoration_2.gif", opacity: "opacity-30", sizeClass: "w-24 h-24 sm:w-28 sm:h-28", isLeft: false, yOffset: "-translate-y-1/3" },
    5: { src: "/images/decorations/decoration_3.gif", opacity: "opacity-50", sizeClass: "w-16 h-16 sm:w-20 sm:h-20", isLeft: true, yOffset: "-translate-y-2/3" },
    7: { src: "/images/decorations/decoration_4.gif", opacity: "opacity-20", sizeClass: "w-28 h-28 sm:w-32 sm:h-32", isLeft: true, yOffset: "-translate-y-1/2" },
  },
  2: {
    0: { src: "/images/decorations/decoration_13.gif", opacity: "opacity-30", sizeClass: "w-20 h-20 sm:w-24 sm:h-24", isLeft: true, yOffset: "-translate-y-1/2" },
    1: { src: "/images/decorations/decoration_5.gif", opacity: "opacity-30", sizeClass: "w-20 h-20 sm:w-24 sm:h-24", isLeft: false, yOffset: "-translate-y-1/3" },
    3: { src: "/images/decorations/decoration_6.gif", opacity: "opacity-40", sizeClass: "w-24 h-24 sm:w-28 sm:h-28", isLeft: false, yOffset: "-translate-y-2/3" },
    5: { src: "/images/decorations/decoration_7.gif", opacity: "opacity-30", sizeClass: "w-20 h-20 sm:w-24 sm:h-24", isLeft: true, yOffset: "-translate-y-1/2" },
  },
  3: {
    0: { src: "/images/decorations/decoration_8.gif", opacity: "opacity-20", sizeClass: "w-15 h-15 sm:w-32 sm:h-32", isLeft: true, yOffset: "-translate-y-1/3" },
    2: { src: "/images/decorations/decoration_9.gif", opacity: "opacity-30", sizeClass: "w-20 h-20 sm:w-24 sm:h-24", isLeft: false, yOffset: "-translate-y-1/2" },
    5: { src: "/images/decorations/decoration_10.gif", opacity: "opacity-40", sizeClass: "w-24 h-24 sm:w-28 sm:h-28", isLeft: true, yOffset: "-translate-y-2/3" },
  },
  4: {
    1: { src: "/images/decorations/decoration_11.gif", opacity: "opacity-30", sizeClass: "w-16 h-16 sm:w-20 sm:h-20", isLeft: false, yOffset: "-translate-y-2/3" },
    3: { src: "/images/decorations/decoration_12.gif", opacity: "opacity-20", sizeClass: "w-20 h-20 sm:w-32 sm:h-32", isLeft: false, yOffset: "-translate-y-1/2" },
    5: { src: "/images/decorations/decoration_13.gif", opacity: "opacity-30", sizeClass: "w-20 h-20 sm:w-24 sm:h-24", isLeft: true, yOffset: "-translate-y-1/3" },
  },
  5: {
    0: { src: "/images/decorations/decoration_1.gif", opacity: "opacity-40", sizeClass: "w-16 h-16 sm:w-24 sm:h-24", isLeft: true, yOffset: "-translate-y-1/2" },
    2: { src: "/images/decorations/decoration_2.gif", opacity: "opacity-30", sizeClass: "w-20 h-20 sm:w-24 sm:h-24", isLeft: false, yOffset: "-translate-y-2/3" },
    4: { src: "/images/decorations/decoration_3.gif", opacity: "opacity-50", sizeClass: "w-16 h-16 sm:w-20 sm:h-20", isLeft: true, yOffset: "-translate-y-1/3" },
    7: { src: "/images/decorations/decoration_4.gif", opacity: "opacity-20", sizeClass: "w-28 h-28 sm:w-32 sm:h-32", isLeft: false, yOffset: "-translate-y-1/2" },
  }
};
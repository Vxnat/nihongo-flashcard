import React from "react";

interface EnemyWordProps {
  id: string;
  text: string;
  romaji: string;
  x: number;
  y: number;
}

export const EnemyWord = React.memo(({ id, text, romaji, x, y }: EnemyWordProps) => {
  return (
    <div
      id={`enemy-${id}`}
      className="absolute flex flex-col items-center justify-center z-10"
      style={{
        transform: `translate(calc(${x}vw - 50%), ${y}vh)`,
        left: 0,
        top: 0,
        willChange: "transform", // Báo cho trình duyệt bật GPU xử lý element này
      }}
    >
      {/* Ảnh quái vật ngồi trên viên kẹo */}
      <img 
        src="/images/shiba_carry.png" 
        alt="Shiba Inu Carry" 
        className="w-10 h-10 object-contain z-20 drop-shadow-md -mb-2 animate-bounce" 
        style={{ animationDuration: '1.5s' }}
      />
      
      {/* Viên kẹo dẻo mini */}
      <div className="flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm border-2 border-white/60 rounded-full shadow-sm px-4 py-1.5 z-10 min-w-[70px]">
        <span className="text-2xl font-bold text-zinc-800 leading-none" style={{ fontFamily: "var(--font-cherry)" }}>{text}</span>
        <span className="text-[10px] font-black text-[#FF7096] uppercase tracking-widest mt-0.5 leading-none">{romaji}</span>
      </div>
    </div>
  );
});

EnemyWord.displayName = "EnemyWord";
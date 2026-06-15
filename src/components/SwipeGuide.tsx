import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MousePointerClick,
} from "lucide-react";

interface SwipeGuideProps {
  onClose: () => void;
}

export function SwipeGuide({ onClose }: SwipeGuideProps) {
  const itemVariants : any = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2 + 0.3,
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4"
    >
      {/* Vùng hướng dẫn */}
      <div className="relative w-full max-w-md h-[400px] flex items-center justify-center">
        {/* Thẻ ma (ghost card) */}
        <div className="w-[85%] h-[90%] border-4 border-dashed border-white/30 rounded-[2rem] flex items-center justify-center" />

        {/* Hướng dẫn: Chạm để lật */}
        <motion.div
          custom={0}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="absolute top-[30%] flex flex-col items-center text-white"
        >
          <MousePointerClick className="w-8 h-8 mb-2" />
          <p
            className="font-bold text-lg"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            Chạm để lật
          </p>
        </motion.div>

        {/* Hướng dẫn: Vuốt trái */}
        <motion.div
          custom={1}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-red-400"
        >
          <ArrowLeft className="w-8 h-8" />
          <p
            className="font-bold text-lg"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            Quên
          </p>
        </motion.div>

        {/* Hướng dẫn: Vuốt phải */}
        <motion.div
          custom={2}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-green-400"
        >
          <p
            className="font-bold text-lg"
            style={{ fontFamily: "var(--font-cherry)" }}
          >
            Nhớ
          </p>
          <ArrowRight className="w-8 h-8" />
        </motion.div>
      </div>

      {/* Nút Đã hiểu */}
      <motion.button
        custom={3}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        onClick={onClose}
        className="mt-8 px-8 h-14 bg-[#FF7096] text-white rounded-2xl font-bold text-xl border-b-4 border-[#C7486B] active:border-b-0 active:translate-y-1 transition-all shadow-lg"
      >
        Đã hiểu!
      </motion.button>
    </motion.div>
  );
}
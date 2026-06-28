import { SplashScreen } from "@/components/common/SplashScreen";
import { MaintenanceBlocker } from "@/components/common/MaintenanceBlocker";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* ==========================================
          CUTE APP BACKGROUND: SỔ TAY CARO (GRID NOTE)
         ========================================== */}
      <div className="fixed inset-0 w-full h-full -z-50 app-bg" />

      {/* TRỤC NỀN TRUNG TÂM (CHE CARO TRÊN DESKTOP, TRÀN VIỀN TRÊN MOBILE) */}
      <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full bg-background border-x border-zinc-200/10 dark:border-zinc-800/10 shadow-[0_0_40px_rgba(0,0,0,0.03)] -z-40 pointer-events-none" />

      <main className="relative z-10 w-full min-h-screen max-w-6xl mx-auto bg-[#FFF5F7]">
        <MaintenanceBlocker />
        <SplashScreen />
        {children}
      </main>
    </>
  );
}

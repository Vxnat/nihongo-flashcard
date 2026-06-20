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

      <main className="relative z-10 w-full min-h-screen pt-12 px-4 max-w-6xl mx-auto">
        <MaintenanceBlocker />
        <SplashScreen />
        {children}
      </main>
    </>
  );
}

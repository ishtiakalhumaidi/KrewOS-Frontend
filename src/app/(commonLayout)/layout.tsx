import { Logo } from "@/components/shared/Logo";
import DarkVeil from "@/components/ui/DarkVeil";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh]  relative bg-black overflow-y-auto overflow-x-hidden flex flex-col">
      {/* 🌌 The WebGL Background (Locked to viewport using 'fixed') */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DarkVeil />
      </div>

      <div className="absolute top-6 left-4 sm:left-6 md:top-8 md:left-8 z-50">
        <Logo showBackArrow={true} />
      </div>

      <main className="relative  z-10 w-full flex-1 flex flex-col items-center justify-center ">
        {children}
      </main>
    </div>
  );
}

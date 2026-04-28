import { Logo } from "@/components/shared/Logo";
import DarkVeil from "@/components/ui/DarkVeil";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-black overflow-hidden">
      {/* 🌌 The WebGL Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <DarkVeil />
      </div>

      {/* 🌟 Shared KrewOS Logo */}
      <div className="fixed top-6 left-6 md:top-8 md:left-8 z-50">
        <Logo showBackArrow={true} />
      </div>

      {/* The Login / Register / Join Form */}
      <main className="relative z-10 w-full max-w-md px-4">{children}</main>
    </div>
  );
}

import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      
      {/* 🌟 Shared KrewOS Logo - Fixed to top left */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
        <Logo showBackArrow={true} />
      </div>

      {/* The Login / Register / Join Form */}
      <main className="relative z-10 w-full max-w-md px-4">
        {children}
      </main>

    </div>
  );
}
import { Footer } from "@/components/public/Footer";
import { Navbar } from "@/components/public/Navbar";
import { cookies } from "next/headers";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("accessToken");

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-x-hidden w-full max-w-[100vw]">
      
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

      <Navbar isLoggedIn={isLoggedIn} />
      
      <main className="flex-1 relative z-10 w-full flex flex-col">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
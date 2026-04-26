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
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
    
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
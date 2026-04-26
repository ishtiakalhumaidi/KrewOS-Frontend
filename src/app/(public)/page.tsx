import { Hero } from "@/components/public/Hero";
import { Features } from "@/components/public/Features";
import { Cta } from "@/components/public/Cta";
import { cookies } from "next/headers";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("accessToken");

  return (
    <div className="flex flex-col w-full">
      
      <Hero isLoggedIn={isLoggedIn} />
      <Features />
      <Cta isLoggedIn={isLoggedIn} />
    </div>
  );
}
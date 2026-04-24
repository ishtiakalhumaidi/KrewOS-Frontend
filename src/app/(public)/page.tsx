import { Hero } from "@/components/public/Hero";
import { Features } from "@/components/public/Features";
import { Cta } from "@/components/public/Cta";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <Features />
      <Cta />
    </div>
  );
}
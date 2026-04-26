import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import ShinyText from "@/components/ui/ShinyText"; // 👉 Import the new component

interface LogoProps {
  showBackArrow?: boolean;
  className?: string;
  href?: string;
}

export function Logo({ showBackArrow = false, className, href = "/" }: LogoProps) {
  return (
    <Link 
      href={href} 
      className={cn("flex items-center gap-2 group transition-opacity hover:opacity-90", className)}
    >
      {/* Optional Back Arrow for Auth Layouts */}
      {showBackArrow && (
        <ArrowLeft className="w-4 h-4 text-zinc-500 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
      )}
      
      {/* The Solid K Block */}
      <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
        <span className="text-white font-bold text-lg">K</span>
      </div>
      
      {/* 🌟 The Premium Shiny Text Logo */}
      <div className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        <ShinyText 
          text="KrewOS" 
          speed={4} 
          delay={2}
          color="currentColor" 
          shineColor="#3b82f6" // A sleek primary blue shine
          pauseOnHover={false}
        />
      </div>
    </Link>
  );
}
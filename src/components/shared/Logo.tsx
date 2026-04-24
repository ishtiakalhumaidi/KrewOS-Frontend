import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  showBackArrow?: boolean;
  className?: string;
  href?: string;
}

export function Logo({ showBackArrow = false, className, href = "/" }: LogoProps) {
  return (
    <Link 
      href={href} 
      className={cn("flex items-center gap-2 group transition-all hover:opacity-80", className)}
    >
      {/* Optional Back Arrow for Auth Layouts */}
      {showBackArrow && (
        <ArrowLeft className="w-4 h-4 text-zinc-500 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
      )}
      
      <div className="h-8 w-8 bg-zinc-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
        <span className="text-zinc-50 dark:text-zinc-900 font-bold text-lg">K</span>
      </div>
      
      <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        KrewOS
      </span>
    </Link>
  );
}
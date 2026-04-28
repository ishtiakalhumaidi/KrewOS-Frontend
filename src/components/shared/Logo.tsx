import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import ShinyText from "@/components/ui/ShinyText";

interface LogoProps {
  showBackArrow?: boolean;
  className?: string;
  href?: string;
}

export function Logo({ showBackArrow = false, className, href = "/" }: LogoProps) {
  return (
    <Link 
      href={href} 
      className={cn("flex items-center gap-2.5 group transition-opacity hover:opacity-90", className)}
    >
      {/* Optional Back Arrow for Auth Layouts */}
      {showBackArrow && (
        <ArrowLeft className="w-4 h-4 text-zinc-500 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
      )}
      
      {/* ─── HIGH-END ANIMATED "K" ICON ─── */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 210 210" 
        className="h-8 w-8 flex-shrink-0" 
        role="img" 
        aria-label="KrewOS Icon"
      >
        <defs>
          <linearGradient id="krewBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>

        {/* ─── ANIMATED TECH SLICE (The Blue OS Part) ─── */}
        {/* This arm slides in diagonally from the top right */}
        <g>
          <animateTransform 
            attributeName="transform" 
            type="translate" 
            values="10,-10; 0,0; 0,0; 10,-10" 
            keyTimes="0; 0.2; 0.8; 1"
            dur="4s" 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="opacity" 
            values="0; 1; 1; 0" 
            keyTimes="0; 0.2; 0.8; 1"
            dur="4s" 
            repeatCount="indefinite" 
          />
          
          {/* Solid Blue Base */}
          <polygon points="78,80 158,20 198,20 78,110" fill="url(#krewBlue)" />
          
          {/* Glowing Highlight Edge */}
          <polygon points="78,80 158,20 165,20 85,80" fill="#93c5fd">
             <animate 
               attributeName="opacity" 
               values="0.1; 0.8; 0.1" 
               dur="2s" 
               repeatCount="indefinite" 
             />
          </polygon>
        </g>

        {/* ─── STEEL FOUNDATION (Auto Light/Dark Mode) ─── */}
        <g className="text-zinc-900 dark:text-white transition-colors duration-300">
          
          {/* The Main Vertical Pillar pulses slightly */}
          <g fill="currentColor">
             <animate 
               attributeName="opacity" 
               values="0.7; 1; 0.7" 
               dur="4s" 
               repeatCount="indefinite" 
             />
            <rect x="25" y="20" width="60" height="8" rx="2" />
            <rect x="25" y="172" width="60" height="8" rx="2" />
            <rect x="32" y="28" width="8" height="144" />
            <rect x="70" y="28" width="8" height="144" />
          </g>

          {/* Internal X-Bracing */}
          <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none">
            <line x1="40" y1="28" x2="70" y2="64" />
            <line x1="70" y1="28" x2="40" y2="64" />
            <line x1="40" y1="64" x2="70" y2="100" />
            <line x1="70" y1="64" x2="40" y2="100" />
            <line x1="40" y1="100" x2="70" y2="136" />
            <line x1="70" y1="100" x2="40" y2="136" />
            <line x1="40" y1="136" x2="70" y2="172" />
            <line x1="70" y1="136" x2="40" y2="172" />
          </g>

          {/* Bottom Right Truss (Slides in from the right) */}
          <g>
            <animateTransform 
              attributeName="transform" 
              type="translate" 
              values="15,0; 0,0; 0,0; 15,0" 
              keyTimes="0; 0.3; 0.7; 1"
              dur="4s" 
              repeatCount="indefinite" 
            />
             <animate 
               attributeName="opacity" 
               values="0; 1; 1; 0" 
               keyTimes="0; 0.3; 0.7; 1"
               dur="4s" 
               repeatCount="indefinite" 
             />
             
            <g stroke="currentColor" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" fill="none">
              <line x1="78" y1="100" x2="166" y2="176" />
              <line x1="78" y1="144" x2="115" y2="176" />
              <line x1="115" y1="176" x2="166" y2="176" />
            </g>
            <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none">
              <line x1="96" y1="116" x2="96" y2="159" />
              <line x1="120" y1="136" x2="120" y2="176" />
              <line x1="144" y1="157" x2="144" y2="176" />
              <line x1="78" y1="144" x2="96" y2="116" />
              <line x1="96" y1="159" x2="120" y2="136" />
              <line x1="120" y1="176" x2="144" y2="157" />
            </g>
          </g>
        </g>
      </svg>
      
      {/* ─── THE PREMIUM SHINY TEXT ─── */}
      <div className="text-[22px] font-black tracking-tight text-zinc-900 dark:text-zinc-50 pt-0.5">
        <ShinyText 
          text="KrewOS" 
          speed={4} 
          delay={2}
          color="currentColor" 
          shineColor="#3b82f6" 
          pauseOnHover={false}
        />
      </div>
    </Link>
  );
}
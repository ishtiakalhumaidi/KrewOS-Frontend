import { Logo } from "@/components/shared/Logo";
import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
      
    
        <Logo/>
      
      
      {/* Spinner and Text */}
      <div className="flex items-center mt-4 text-zinc-500 dark:text-zinc-400">
        <Loader2 className="w-5 h-5 mr-3 animate-spin text-blue-600" />
        <span className="text-sm font-medium tracking-wide uppercase">Loading Workspace...</span>
      </div>
      
    </div>
  );
}
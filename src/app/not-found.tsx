import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HardHat, ArrowLeft, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 text-center">
      
      {/* 404 Graphic */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-600/10 dark:bg-blue-600/20 blur-2xl rounded-full" />
        <div className="relative h-24 w-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center shadow-sm">
          <HardHat className="h-12 w-12 text-zinc-400 dark:text-zinc-500" />
        </div>
      </div>

      <h1 className="text-5xl font-extrabold tracking-tight mb-3 text-zinc-900 dark:text-zinc-50">
        404
      </h1>
      <h2 className="text-2xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
        Off the map
      </h2>
      
      <p className="text-muted-foreground max-w-md mb-10 text-lg">
        We couldn't find the page you're looking for. It might have been moved, deleted, or you might be on the wrong job site.
      </p>

      {/* Recovery Actions */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full">
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Return to Dashboard
          </Button>
        </Link>
        <Link href="/" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full rounded-full border-zinc-300 dark:border-zinc-700 bg-transparent">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Homepage
          </Button>
        </Link>
      </div>

    </div>
  );
}
import { HardHat, Users, Target, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">Built for the modern site.</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          KrewOS was founded with a single mission: to eliminate the chaos of construction management and bring everything into one unified, digital workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
        <div>
          <h2 className="text-3xl font-bold mb-4">The Problem with Paper</h2>
          <p className="text-lg text-muted-foreground mb-6">
            For decades, construction teams have relied on scattered spreadsheets, paper timesheets, and disconnected communication apps. This leads to lost data, missed safety reports, and delayed payroll. 
          </p>
          <ul className="space-y-3">
            {["Lost safety reports", "Inaccurate payroll hours", "Mismanaged materials"].map((item, i) => (
              <li key={i} className="flex items-center text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="w-5 h-5 mr-3 text-red-500" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-12 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
           <HardHat className="w-32 h-32 text-zinc-300 dark:text-zinc-700" />
        </div>
      </div>

      <div className="text-center bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-12 border border-blue-100 dark:border-blue-900/30">
        <Target className="w-12 h-12 text-blue-600 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          We believe every Site Manager, Safety Officer, and Worker deserves software that is as reliable as the structures they build. KrewOS connects the office to the field in real-time.
        </p>
        <Link href="/register">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8">
            Join the Revolution
          </Button>
        </Link>
      </div>
    </div>
  );
}
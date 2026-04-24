import { ShieldAlert, FolderKanban, Clock } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-24 bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need on site.</h2>
          <p className="mt-4 text-lg text-muted-foreground">Replace spreadsheets and fragmented apps with one unified platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Project Management</h3>
            <p className="text-muted-foreground leading-relaxed">
              Organize all your construction sites in one place. Assign workers, track daily progress reports, and manage material requests instantly.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mb-6">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Safety & Incidents</h3>
            <p className="text-muted-foreground leading-relaxed">
              Keep your sites compliant. Workers can submit real-time safety incident reports with photo evidence directly from their phones.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Timesheets & Payroll</h3>
            <p className="text-muted-foreground leading-relaxed">
              Automate your timesheets. Track exact clock-in/out times for every worker and export aggregated payroll data with a single click.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
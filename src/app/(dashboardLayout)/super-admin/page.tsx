export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground">
          Global metrics across all companies and subscriptions.
        </p>
      </div>
      
      <div className="p-6 border rounded-xl bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        <h3 className="font-semibold text-sm text-zinc-500">Total Revenue</h3>
        <p className="text-3xl font-bold mt-2">$14,250</p>
      </div>
    </div>
  );
}
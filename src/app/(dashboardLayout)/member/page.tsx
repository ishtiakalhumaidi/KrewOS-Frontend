export default function MemberDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here are your assigned tasks and projects.
        </p>
      </div>
      
      <div className="p-6 border rounded-xl bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        <h3 className="font-semibold text-sm text-zinc-500">Tasks Due Today</h3>
        <p className="text-3xl font-bold mt-2">3</p>
      </div>
    </div>
  );
}
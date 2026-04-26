"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { LogOut, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/services/auth.services";
import { clearAuthCookies } from "@/app/actions/auth";

// 👉 1. Import the MobileSidebar you created
import MobileSidebar from "./MobileSidebar";
import { ModeToggle } from "@/components/ui/toggleTheme";

// 👉 2. Accept the role prop from layout.tsx
export default function DashboardNavbar({
  role = "MEMBER",
}: {
  role?: string;
}) {
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: AuthService.logout,
    onSettled: async () => {
      await clearAuthCookies();
      queryClient.clear();
      window.location.href = "/login";
    },
  });

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center">
        <MobileSidebar role={role} />
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* <Button variant="ghost" size="icon" className="text-zinc-500">
          <Bell className="h-5 w-5" />
        </Button> */}
        <ModeToggle />

        <Button
          variant="outline"
          size="sm"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}

          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

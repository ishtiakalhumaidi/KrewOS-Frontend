"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query"; 
import { LogOut, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeAccessToken } from "@/lib/cookieUtils";
import { AuthService } from "@/services/auth.services";

export default function DashboardNavbar() {
  const queryClient = useQueryClient();

  // 1. Create a mutation to hit your backend API
  const logoutMutation = useMutation({
    mutationFn: AuthService.logout,
    onSettled: () => {
      // 2. Whether the API succeeds or fails, we forcefully clear the client state
      removeAccessToken();
      queryClient.clear();
      
      // 3. Hard reload to login to wipe memory
      window.location.href = "/login";
    },
  });

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-end px-6 space-x-4">
      <Button variant="ghost" size="icon" className="text-zinc-500">
        <Bell className="h-5 w-5" />
      </Button>
      
      {/* 4. Attach the mutation to the button */}
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
        {logoutMutation.isPending ? "Logging out..." : "Log out"}
      </Button>
    </header>
  );
}
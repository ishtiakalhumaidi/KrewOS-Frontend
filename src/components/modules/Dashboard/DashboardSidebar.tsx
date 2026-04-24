"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItems } from "@/lib/navItems";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { MemberService } from "@/services/member.services";
import { Loader2, User, Building2, ShieldAlert } from "lucide-react";

export default function DashboardSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const navItems = getNavItems(role);

  // 👉 1. Check if the user is a Super Admin
  const isSuperAdmin = role === "SUPER_ADMIN";

  // 👉 2. Prevent fetching if they are a Super Admin
  const { data: response, isLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: MemberService.getCompanySettings,
    enabled: !isSuperAdmin, 
  });

  const company = response?.data;

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-h-screen">
      
      {/* 🌟 1. TOP HEADER (KrewOS Platform Branding) */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="h-8 w-8 bg-zinc-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center mr-3 shadow-sm">
          <span className="text-zinc-50 dark:text-zinc-900 font-bold text-lg">K</span>
        </div>
        <span className="text-lg font-bold tracking-tight">KrewOS</span>
      </div>

      {/* 🌟 2. MIDDLE NAVIGATION (Dynamic Links based on Role) */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          // 👉 THE FIX: If the link is a root dashboard page, it MUST be an exact match.
          // Otherwise, it can highlight sub-pages (e.g., /admin/incidents/report highlights Incidents)
          const isRootPath = ["/admin", "/member", "/super-admin"].includes(item.href);
          
          const isActive = isRootPath 
            ? pathname === item.href 
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"
              )}
            >
              <Icon className={cn("mr-3 h-5 w-5 flex-shrink-0", isActive ? "text-blue-700 dark:text-blue-400" : "")} />
              {item.title}
            </Link>
          );
        })}
      </div>

      {/* 🌟 3. BOTTOM SECTION (Company Workspace & Settings) */}
      <div className="mt-auto p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        
        {/* Workspace Identifier Card */}
        <div className="flex items-center p-2 mb-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
          {isSuperAdmin ? (
            // 👉 Super Admin Fallback UI (No Company)
            <>
              <div className="h-8 w-8 bg-amber-500 rounded-md flex items-center justify-center mr-2 shadow-inner flex-shrink-0">
                <ShieldAlert className="text-white h-4 w-4" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5">System</span>
                <span className="text-sm font-bold tracking-tight truncate">Master Admin</span>
              </div>
            </>
          ) : isLoading ? (
            <div className="flex items-center w-full px-2">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400 mr-2" />
              <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            </div>
          ) : (
            <>
              {company?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logoUrl} alt={company.name} className="h-8 w-8 rounded-md object-cover mr-2 border border-zinc-100 dark:border-zinc-700" />
              ) : (
                <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center mr-2 shadow-inner flex-shrink-0">
                  <span className="text-white font-bold text-sm">{company?.name ? company.name.charAt(0).toUpperCase() : "W"}</span>
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5">Workspace</span>
                <span className="text-sm font-bold tracking-tight truncate" title={company?.name || "Company"}>{company?.name || "Company"}</span>
              </div>
            </>
          )}
        </div>

        {/* Settings Links */}
        <div className="space-y-1">
          {/* Personal Profile (Available to EVERYONE) */}
          <Link
            href="/settings/profile"
            className={cn(
              "flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors",
              pathname.includes("/settings/profile")
                ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            )}
          >
            <User className="mr-2 h-4 w-4" /> Personal Profile
          </Link>

          {/* Company Settings (Available ONLY to Owners and Admins, HIDING IT FROM SUPER ADMIN) */}
          {(role === "OWNER" || role === "ADMIN") && (
            <Link
              href="/admin/settings/company"
              className={cn(
                "flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors",
                pathname.includes("/admin/settings/company")
                  ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              )}
            >
              <Building2 className="mr-2 h-4 w-4" /> Company Settings
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
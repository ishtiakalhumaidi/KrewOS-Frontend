"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItems } from "@/lib/navItems";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { MemberService } from "@/services/member.services";
import { Loader2, User, Building2, ShieldAlert, Menu } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function MobileSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const navItems = getNavItems(role);
  const isSuperAdmin = role === "SUPER_ADMIN";

  const { data: response, isLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: MemberService.getCompanySettings,
    enabled: !isSuperAdmin,
  });

  const company = response?.data;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden mr-4 h-12 w-12 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <Menu className="h-6 w-6 text-zinc-600 dark:text-zinc-300" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80 p-0 flex flex-col bg-white dark:bg-zinc-950 border-r-slate-200 dark:border-r-zinc-800">
        <VisuallyHidden><SheetTitle>Mobile Navigation</SheetTitle></VisuallyHidden>

        <div className="h-20 flex items-center px-8 border-b border-slate-200/60 dark:border-zinc-800/60">
          <Logo />
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isRootPath = ["/admin", "/member", "/super-admin"].includes(item.href);
            const isActive = isRootPath
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <SheetTrigger asChild key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]"
                      : "text-zinc-500 hover:bg-slate-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  <Icon className={cn("mr-3 h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400")} />
                  {item.title}
                </Link>
              </SheetTrigger>
            );
          })}
        </div>

        <div className="mt-auto p-6 border-t border-slate-200/60 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center p-3 mb-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
            {isSuperAdmin ? (
              <>
                <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center mr-3 shadow-inner flex-shrink-0">
                  <ShieldAlert className="text-white h-5 w-5" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-0.5">System</span>
                  <span className="text-sm font-bold tracking-tight truncate">Master Admin</span>
                </div>
              </>
            ) : isLoading ? (
              <div className="flex items-center w-full px-2"><Loader2 className="h-5 w-5 animate-spin text-zinc-400" /></div>
            ) : (
              <>
                {company?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoUrl} alt={company.name} className="h-10 w-10 rounded-xl object-cover mr-3 border border-slate-100 dark:border-zinc-800" />
                ) : (
                  <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-inner flex-shrink-0">
                    <span className="text-white font-extrabold text-base">{company?.name ? company.name.charAt(0).toUpperCase() : "W"}</span>
                  </div>
                )}
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-0.5">Workspace</span>
                  <span className="text-sm font-bold tracking-tight truncate">{company?.name || "Company"}</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <SheetTrigger asChild>
              <Link
                href="/settings/profile"
                className={cn(
                  "flex items-center px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200",
                  pathname.includes("/settings/profile") ? "bg-slate-200 text-zinc-900 dark:bg-zinc-800 dark:text-white" : "text-zinc-500 hover:bg-white hover:text-zinc-900 shadow-sm border border-transparent hover:border-slate-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900 dark:hover:border-zinc-800"
                )}
              >
                <User className="mr-2.5 h-4 w-4" /> Personal Profile
              </Link>
            </SheetTrigger>

            {(role === "OWNER" || role === "ADMIN") && (
              <SheetTrigger asChild>
                <Link
                  href="/admin/settings/company"
                  className={cn(
                    "flex items-center px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200",
                    pathname.includes("/admin/settings/company") ? "bg-slate-200 text-zinc-900 dark:bg-zinc-800 dark:text-white" : "text-zinc-500 hover:bg-white hover:text-zinc-900 shadow-sm border border-transparent hover:border-slate-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900 dark:hover:border-zinc-800"
                  )}
                >
                  <Building2 className="mr-2.5 h-4 w-4" /> Company Settings
                </Link>
              </SheetTrigger>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  HardHat, 
  FileText, 
  CreditCard, 
  ShieldAlert, 
  Settings,
  FolderKanban,
  Clock
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: any;
};

export const getNavItems = (role: string | undefined): NavItem[] => {
  switch (role) {
    case "SUPER_ADMIN":
      return [
        { title: "Platform Overview", href: "/super-admin", icon: LayoutDashboard },
        { title: "Companies", href: "/super-admin/companies", icon: Building2 },
        { title: "Subscriptions", href: "/super-admin/subscriptions", icon: CreditCard },
        { title: "Global Settings", href: "/super-admin/settings", icon: Settings },
      ];
    case "OWNER":
    case "ADMIN":
      return [
        { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { title: "Projects", href: "/admin/projects", icon: FolderKanban },
        { title: "Team & Employees", href: "/admin/team", icon: Users },
        { title: "Incidents", href: "/admin/incidents", icon: ShieldAlert },
        { title: "Billing & Plan", href: "/admin/billing", icon: CreditCard },
      ];
    case "MEMBER":
      return [
        { title: "My Dashboard", href: "/member", icon: LayoutDashboard },
        { title: "My Projects", href: "/member/projects", icon: HardHat },
        { title: "My Tasks", href: "/member/tasks", icon: FileText },
        { title: "Report Incident", href: "/member/report-incident", icon: ShieldAlert },
        { title: "Timesheet", href: "/member/timesheet", icon: Clock },
      ];
    default:
      return [];
  }
};
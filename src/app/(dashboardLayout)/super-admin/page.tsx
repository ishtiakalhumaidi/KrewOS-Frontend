/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard.services";
import { CompanyService } from "@/services/company.services";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  DollarSign,
  Building2,
  Users,
  FolderKanban,
  ShieldAlert,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminDashboardPage() {
  const queryClient = useQueryClient();

  // 1. Fetch Global Analytics
  const { data: statsResponse, isLoading: isStatsLoading } = useQuery({
    queryKey: ["super-admin-stats"],
    queryFn: DashboardService.getStats,
  });

  // 2. Fetch All Companies
  const { data: companiesResponse, isLoading: isCompaniesLoading } = useQuery({
    queryKey: ["all-companies"],
    queryFn: CompanyService.getAllCompanies,
  });

  // 3. The "Kill Switch" Mutation
  const toggleMutation = useMutation({
    mutationFn: CompanyService.toggleCompanyStatus,
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Company status updated");
      queryClient.invalidateQueries({ queryKey: ["all-companies"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] });
    },
    onError: () => toast.error("Failed to update company status"),
  });

  if (isStatsLoading || isCompaniesLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = statsResponse?.data;
  const companies = companiesResponse?.data || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Master Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Global platform analytics and workspace management.
        </p>
      </div>

      {/* 🌟 1. GLOBAL ANALYTICS CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-green-100 bg-green-50/30 dark:border-green-900/30 dark:bg-green-900/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {/* Convert cents to dollars */}
            <div className="text-2xl font-bold text-green-700 dark:text-green-500">
              ${((stats?.totalRevenueCents || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Workspaces
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.companyCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.userCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.projectCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* 🌟 2. COMPANY MANAGEMENT TABLE (The Kill Switch) */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workspace Directory</CardTitle>
              <CardDescription>
                Manage all registered construction companies on KrewOS.
              </CardDescription>
            </div>
            <div className="flex items-center text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              <ShieldAlert className="w-4 h-4 mr-2" /> God Mode Active
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Current Plan</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company: any) => {
                // 1. Safely extract the plan, defaulting to "FREE" if the subscription record is missing
                const planTier = company.subscription?.plan || "FREE";
                const subStatus = company.subscription?.status;

                return (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">
                      {company.name}
                    </TableCell>

                    {/* 🌟 2. DYNAMIC PLAN BADGE */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          planTier === "ENTERPRISE"
                            ? "border-indigo-500 text-indigo-600 bg-indigo-50/50"
                            : planTier === "PRO"
                              ? "border-blue-500 text-blue-600 bg-blue-50/50"
                              : "border-zinc-300 text-zinc-600 bg-zinc-50/50"
                        }
                      >
                        {planTier}
                      </Badge>
                      {/* Optional: Show suspended subscription status if you want! */}
                      {subStatus === "CANCELED" && (
                        <span className="text-[10px] text-red-500 ml-2 font-semibold tracking-wider">
                          CANCELED
                        </span>
                      )}
                    </TableCell>

                    {/* 3. The Counts from your optimized _count query */}
                    <TableCell>{company._count?.users || 0}</TableCell>
                    <TableCell>{company._count?.projects || 0}</TableCell>

                    <TableCell>
                      {company.isActive ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                          <Ban className="w-3 h-3 mr-1" /> Suspended
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant={company.isActive ? "destructive" : "default"}
                        size="sm"
                        disabled={toggleMutation.isPending}
                        onClick={() => {
                          toast.warning("Action required", {
                            description: `Do you want to ${company.isActive ? "suspend" : "reactivate"} ${company.name}?`,
                            action: {
                              label: "Yes",
                              onClick: () => toggleMutation.mutate(company.id),
                            },
                          });
                        }}
                        className={
                          !company.isActive
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : ""
                        }
                      >
                        {company.isActive ? "Suspend" : "Reactivate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/lib/axios/httpClient";
import { CompanyService } from "@/services/company.services"; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Loader2, Search, ChevronLeft, ChevronRight, CheckCircle2, Ban, 
  Building2, Users, FolderKanban, TrendingUp, Zap, Crown, MoreVertical, ListFilter, MinusCircle, FilterX
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PLAN_META: Record<string, { label: string; icon: React.ReactNode; bgClass: string; textClass: string }> = {
  FREE: { label: "Free Tier", icon: <Zap className="w-4 h-4" />, bgClass: "bg-slate-100 dark:bg-zinc-800", textClass: "text-slate-600 dark:text-zinc-400" },
  PRO: { label: "Pro", icon: <TrendingUp className="w-4 h-4" />, bgClass: "bg-blue-100 dark:bg-blue-900/40", textClass: "text-blue-600 dark:text-blue-400" },
  ENTERPRISE: { label: "Enterprise", icon: <Crown className="w-4 h-4" />, bgClass: "bg-violet-100 dark:bg-violet-900/40", textClass: "text-violet-600 dark:text-violet-400" },
};

export default function SuperAdminCompaniesPage() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: response, isLoading } = useQuery({
    queryKey: ["super-admin-companies", page, searchTerm, planFilter, statusFilter],
    queryFn: () => httpClient.get("/companies/all", {
      params: {
        page,
        limit,
        searchTerm: searchTerm || undefined,
        plan: planFilter !== "ALL" ? planFilter : undefined,
        isActive: statusFilter === "ACTIVE" ? "true" : statusFilter === "SUSPENDED" ? "false" : undefined,
      }
    }),
  });

  const statusMutation = useMutation({
    mutationFn: CompanyService.changeCompanyStatus,
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Workspace status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["super-admin-companies"] });
    },
    onError: () => toast.error("Failed to update workspace status."),
  });

  const handleStatusChangeRequest = (companyId: string, companyName: string, newStatus: string) => {
    toast(`Change status for ${companyName}?`, {
      description: `This will mark the workspace as ${newStatus}. Do you want to proceed?`,
      action: {
        label: "Yes, Confirm",
        onClick: () => statusMutation.mutate({ companyId, status: newStatus }),
      },
      cancel: { label: "Cancel", onClick: () => {} },
      duration: 6000,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPlanFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
  };

  const companies = response?.data?.data || [];
  const meta = response?.data?.meta;

  const isFilterActive = searchTerm || planFilter !== "ALL" || statusFilter !== "ALL";

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 pt-4">
      
      {/* ─── Header Section ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4 px-1">
        <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-bold tracking-wide text-blue-700 dark:text-blue-400 shadow-sm uppercase">
          <Building2 className="mr-2.5 h-4 w-4" /> Tenant Management
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Workspace Directory
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed font-medium">
          Manage all registered construction companies on KrewOS. Filter by subscription tier, adjust active statuses, and monitor platform usage.
        </p>
      </motion.div>

      {/* ─── Main Directory Card ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
          
          <CardHeader className="bg-slate-50/30 dark:bg-zinc-900/10 border-b border-slate-100 dark:border-zinc-800/50 p-8">
            <div className="flex flex-col gap-6">
              
              {/* 👉 NEW: Perfectly Proportioned CSS Grid Filter Panel */}
              <div className="bg-white/80 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/60 p-5 rounded-[2rem] shadow-sm backdrop-blur-md flex flex-col xl:flex-row gap-5 items-center">
                
                {/* Label */}
                <div className="flex justify-between items-center w-full xl:w-auto">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center shrink-0 px-2">
                    <ListFilter className="w-4 h-4 mr-2"/> Filters
                  </h3>
                </div>

                {/* The Grid: Forces equal width for all 3 inputs */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
  
  {/* Search */}
  <div className="relative w-full">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none z-10" />
    <Input 
      placeholder="Search company name or slug..." 
      value={searchTerm}
      onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
      className="pl-12 h-9 rounded-2xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm focus-visible:ring-blue-500 font-medium w-full text-sm transition-all"
    />
  </div>

  {/* Plan Select */}
  <Select  value={planFilter} onValueChange={(val) => { setPlanFilter(val); setPage(1); }}>
    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm font-medium w-full text-sm transition-all px-4 focus:ring-blue-500">
      <SelectValue placeholder="All Plans" />
    </SelectTrigger>
    <SelectContent className="rounded-2xl border-slate-200 dark:border-zinc-800">
      <SelectItem value="ALL" className="py-3 font-medium">All Plans</SelectItem>
      <SelectItem value="FREE" className="py-3 font-medium text-slate-600 dark:text-zinc-400">Free Tier</SelectItem>
      <SelectItem value="PRO" className="py-3 font-bold text-blue-600 dark:text-blue-400">Pro</SelectItem>
      <SelectItem value="ENTERPRISE" className="py-3 font-bold text-violet-600 dark:text-violet-400">Enterprise</SelectItem>
    </SelectContent>
  </Select>

  {/* Status Select */}
  <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm font-medium w-full text-sm transition-all px-4 focus:ring-blue-500">
      <SelectValue placeholder="All Statuses" />
    </SelectTrigger>
    <SelectContent className="rounded-2xl border-slate-200 dark:border-zinc-800">
      <SelectItem value="ALL" className="py-3 font-medium">All Statuses</SelectItem>
      <SelectItem value="ACTIVE" className="py-3 font-bold text-emerald-600 dark:text-emerald-400">Active</SelectItem>
      <SelectItem value="SUSPENDED" className="py-3 font-bold text-red-600 dark:text-red-400">Suspended</SelectItem>
    </SelectContent>
  </Select>
</div>

                {/* Clear Button (Stays on the right) */}
                {isFilterActive && (
                  <Button 
                    variant="ghost" 
                    onClick={clearFilters} 
                    className="h-14 px-5 rounded-2xl text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 font-bold whitespace-nowrap shrink-0 transition-all"
                  >
                    <FilterX className="w-4 h-4 mr-2" /> Clear
                  </Button>
                )}
              </div>

            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-zinc-950/50">
                  <TableRow className="border-b border-slate-100 dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Company Details</TableHead>
                    <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Subscription</TableHead>
                    <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-center">Usage</TableHead>
                    <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</TableHead>
                    <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-32 text-center">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
                      </TableCell>
                    </TableRow>
                  ) : companies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-24">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                            <Building2 className="w-8 h-8 text-zinc-400" />
                          </div>
                          <p className="text-xl font-bold text-zinc-900 dark:text-white">No Workspaces Found</p>
                          <p className="mt-1 text-zinc-500 font-medium">No companies match your current filters.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    companies.map((company: any) => {
                      const planTier = company.plan || company.subscription?.plan || "FREE";
                      const metaInfo = PLAN_META[planTier] || PLAN_META["FREE"];

                      return (
                        <TableRow key={company.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                          
                          <TableCell className="px-8 py-6">
                            <p className="font-bold text-lg text-zinc-900 dark:text-white">{company.name}</p>
                            <p className="text-sm font-medium text-zinc-500 mt-1">/{company.slug}</p>
                          </TableCell>

                          <TableCell className="px-8 py-6">
                            <Badge className={cn("px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0 inline-flex items-center", metaInfo.bgClass, metaInfo.textClass)}>
                              {metaInfo.icon} <span className="ml-2">{planTier}</span>
                            </Badge>
                          </TableCell>

                          <TableCell className="px-8 py-6">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <span className="flex items-center text-sm font-bold text-zinc-600 dark:text-zinc-300">
                                <Users className="w-4 h-4 mr-2 text-indigo-400" /> {company._count?.users || 0} Users
                              </span>
                              <span className="flex items-center text-sm font-bold text-zinc-600 dark:text-zinc-300">
                                <FolderKanban className="w-4 h-4 mr-2 text-amber-400" /> {company._count?.projects || 0} Projects
                              </span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="px-8 py-6">
                            {company.isActive ? (
                              <Badge className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 shadow-none border-0">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Active
                              </Badge>
                            ) : (
                              <Badge className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 shadow-none border-0">
                                <Ban className="w-3.5 h-3.5 mr-1.5" /> Suspended
                              </Badge>
                            )}
                          </TableCell>
                          
                          <TableCell className="px-8 py-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                                  {statusMutation.isPending && statusMutation.variables?.companyId === company.id ? <Loader2 className="h-5 w-5 animate-spin text-zinc-500" /> : <MoreVertical className="h-5 w-5 text-zinc-500" />}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl p-2 w-56 shadow-xl border-slate-200 dark:border-zinc-800">
                                <DropdownMenuLabel className="font-extrabold text-[10px] uppercase tracking-widest text-zinc-400">Set Workspace Status</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-800" />
                                
                                <DropdownMenuItem 
                                  disabled={company.isActive}
                                  onClick={() => handleStatusChangeRequest(company.id, company.name, "ACTIVE")}
                                  className="font-bold py-2.5 cursor-pointer text-emerald-600 focus:text-emerald-700 dark:text-emerald-400"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Active
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem 
                                  disabled={!company.isActive}
                                  onClick={() => handleStatusChangeRequest(company.id, company.name, "SUSPENDED")}
                                  className="font-bold py-2.5 cursor-pointer text-red-600 focus:text-red-700 dark:text-red-400"
                                >
                                  <Ban className="w-4 h-4 mr-2" /> Suspend Workspace
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>

                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30">
                <Button 
                  variant="outline" 
                  disabled={page === 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  className="rounded-xl h-12 px-6 font-bold border-slate-200 dark:border-zinc-700 active:scale-95 transition-transform"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <span className="text-sm font-bold text-zinc-500">
                  Page {meta.page} of {meta.totalPages} <span className="hidden sm:inline">({meta.total} Total)</span>
                </span>
                <Button 
                  variant="outline" 
                  disabled={page === meta.totalPages} 
                  onClick={() => setPage(p => p + 1)} 
                  className="rounded-xl h-12 px-6 font-bold border-slate-200 dark:border-zinc-700 active:scale-95 transition-transform"
                >
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
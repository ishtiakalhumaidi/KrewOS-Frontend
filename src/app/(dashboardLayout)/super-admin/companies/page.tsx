/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle,  } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, ChevronLeft, ChevronRight, CheckCircle2, Ban } from "lucide-react";
import { httpClient } from "@/lib/axios/httpClient";

export default function SuperAdminCompaniesPage() {

  // 👉 1. State for QueryBuilder Parameters
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  // 👉 2. Fetch Data with Filters
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

  const companies = response?.data?.data || [];
  const meta = response?.data?.meta;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workspaces Directory</h1>
        <p className="text-muted-foreground mt-1">Manage all registered construction companies on KrewOS.</p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* SEARCH */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search company name..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              />
            </div>

            <div className="flex w-full md:w-auto gap-4">
              {/* PLAN FILTER */}
              <Select value={planFilter} onValueChange={(val) => { setPlanFilter(val); setPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Plans</SelectItem>
                  <SelectItem value="FREE">Free Tier</SelectItem>
                  <SelectItem value="PRO">Pro Tier</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>

              {/* STATUS FILTER */}
              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 py-4">Company Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : companies.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No companies found matching your filters.</TableCell></TableRow>
              ) : (
                companies.map((company: any) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium pl-6">{company.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        company.plan === "ENTERPRISE" ? "border-indigo-500 text-indigo-600" :
                        company.plan === "PRO" ? "border-blue-500 text-blue-600" : "border-zinc-300 text-zinc-600"
                      }>
                        {company.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>{company._count?.users || 0}</TableCell>
                    <TableCell>{company._count?.projects || 0}</TableCell>
                    <TableCell>
                      {company.isActive ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 shadow-none"><Ban className="w-3 h-3 mr-1" /> Suspended</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6 text-sm text-muted-foreground">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* 👉 3. Pagination Controls via QueryBuilder Meta */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing page {meta.page} of {meta.totalPages} ({meta.total} total companies)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <Button variant="outline" size="sm" disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
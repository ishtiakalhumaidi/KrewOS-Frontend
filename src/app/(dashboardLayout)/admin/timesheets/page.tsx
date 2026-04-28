/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AttendanceService } from "@/services/attendance.services";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Download,
  Calculator,
  Clock,
  CalendarDays,
  FileSpreadsheet,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminTimesheetsPage() {
  const today = new Date();
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(today.getDate() - 14);

  const [startDate, setStartDate] = useState(
    twoWeeksAgo.toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);
  const [hourlyRate, setHourlyRate] = useState(25);

  const { data: response, isLoading } = useQuery({
    queryKey: ["timesheets", startDate, endDate],
    queryFn: () => AttendanceService.getTimesheets(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const timesheets = response?.data || [];

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Shifts", "Total Hours", "Estimated Pay"];
    const csvContent = [
      headers.join(","),
      ...timesheets.map(
        (t: any) =>
          `"${t.name}","${t.email}",${t.shifts},${t.totalHours},${(t.totalHours * hourlyRate).toFixed(2)}`,
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Payroll_${startDate}_to_${endDate}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 pt-4">
      
      {/* ─── Header Section ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4 px-1">
        <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-bold tracking-wide text-blue-700 dark:text-blue-400 shadow-sm uppercase">
          <FileSpreadsheet className="mr-2.5 h-4 w-4" /> Global Payroll
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Timesheets & Payroll
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed font-medium mt-4">
              Calculate worker hours across all sites and export accurate payroll payout estimations.
            </p>
          </div>
          <Button
            onClick={handleExportCSV}
            disabled={timesheets.length === 0}
            className="w-full md:w-auto h-14 px-8 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] transition-all active:scale-95 text-base shrink-0"
          >
            <Download className="w-5 h-5 mr-2" /> Export to CSV
          </Button>
        </div>
      </motion.div>

      {/* ─── Control Panel ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center bg-slate-50/30 dark:bg-zinc-950/30">
            <div className="flex-1 space-y-2">
              <Label className="flex items-center text-xs font-extrabold uppercase tracking-widest text-zinc-500 ml-1">
                <CalendarDays className="w-4 h-4 mr-2 text-blue-500" /> Start Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-14 px-4 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-sm focus-visible:ring-blue-500 font-medium text-base"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label className="flex items-center text-xs font-extrabold uppercase tracking-widest text-zinc-500 ml-1">
                <CalendarDays className="w-4 h-4 mr-2 text-blue-500" /> End Date
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-14 px-4 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-sm focus-visible:ring-blue-500 font-medium text-base"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label className="flex items-center text-xs font-extrabold uppercase tracking-widest text-zinc-500 ml-1">
                <Calculator className="w-4 h-4 mr-2 text-emerald-500" /> Global Hourly Rate
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-4 font-bold text-zinc-400">$</span>
                <Input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="h-14 pl-8 pr-4 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-sm focus-visible:ring-emerald-500 font-bold text-lg text-emerald-700 dark:text-emerald-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Payroll Table ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/10 border-b border-slate-100 dark:border-zinc-800/50 p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                <Clock className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" /> Aggregated Hours
              </CardTitle>
              <CardDescription className="text-base font-medium mt-2">
                Showing data from <strong className="text-zinc-900 dark:text-white">{formatDate(startDate)}</strong> to <strong className="text-zinc-900 dark:text-white">{formatDate(endDate)}</strong>.
              </CardDescription>
            </div>
            <Badge className="px-4 py-2 text-xs font-extrabold uppercase tracking-widest bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 shadow-none border-0">
              {timesheets.length} Workers Found
            </Badge>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-zinc-950/50">
                  <TableRow className="border-b border-slate-100 dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-zinc-500">Worker Name</TableHead>
                    <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-zinc-500">Projects Worked</TableHead>
                    <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-zinc-500 text-center">Total Shifts</TableHead>
                    <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-zinc-500 text-center">Total Hours</TableHead>
                    <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Estimated Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-32 text-center">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
                      </TableCell>
                    </TableRow>
                  ) : timesheets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-24">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-slate-200/50 dark:border-zinc-700/50">
                            <Clock className="h-10 w-10 text-zinc-400" />
                          </div>
                          <h3 className="font-extrabold text-2xl text-zinc-900 dark:text-white">No Records Found</h3>
                          <p className="text-zinc-500 dark:text-zinc-400 text-lg mt-2 font-medium max-w-md">
                            No attendance records exist for this date range.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    timesheets.map((t: any) => (
                      <TableRow key={t.userId} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-lg shadow-sm border border-blue-200/50 dark:border-blue-800/50 flex-shrink-0">
                              {t.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-bold text-base text-zinc-900 dark:text-white">{t.name}</p>
                              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">{t.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <div className="flex flex-wrap gap-2 max-w-[250px]">
                            {t.projects.map((p: string, i: number) => (
                              <Badge key={i} className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 shadow-none border-0">
                                {p}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center font-bold text-zinc-700 dark:text-zinc-300 text-base">
                          <Badge variant="outline" className="px-3 py-1 text-sm font-bold border-slate-200 dark:border-zinc-700">
                            {t.shifts}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center font-extrabold text-blue-600 dark:text-blue-400 text-2xl tracking-tight">
                          {t.totalHours}{" "}
                          <span className="text-xs font-bold text-zinc-400 tracking-normal uppercase ml-0.5">hrs</span>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-2xl tracking-tight">
                          ${(t.totalHours * hourlyRate).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
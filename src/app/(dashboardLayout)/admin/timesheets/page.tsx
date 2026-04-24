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
} from "lucide-react";

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
      month: "2-digit",
      day: "2-digit",
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Timesheets & Payroll
          </h1>
          <p className="text-muted-foreground mt-1">
            Calculate worker hours and estimate payroll payouts.
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          disabled={timesheets.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" /> Export to CSV
        </Button>
      </div>

      {/* Control Panel */}
      <Card className="bg-zinc-50 dark:bg-zinc-900/50">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="flex items-center">
              <CalendarDays className="w-4 h-4 mr-2 text-primary" /> Start Date
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center">
              <CalendarDays className="w-4 h-4 mr-2 text-primary" /> End Date
            </Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center">
              <Calculator className="w-4 h-4 mr-2 text-primary" /> Global Hourly
              Rate ($)
            </Label>
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Used for payout estimations below.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center text-lg">
            <Clock className="w-5 h-5 mr-2" /> Aggregated Hours
          </CardTitle>
          <CardDescription>
            Showing data from <strong>{formatDate(startDate)}</strong> to{" "}
            <strong>{formatDate(endDate)}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-6 py-4">Worker Name</TableHead>
                <TableHead>Projects Worked</TableHead>
                <TableHead className="text-center">Total Shifts</TableHead>
                <TableHead className="text-center font-bold">
                  Total Hours
                </TableHead>
                <TableHead className="text-right pr-6">Estimated Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : timesheets.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No attendance records found for this date range.
                  </TableCell>
                </TableRow>
              ) : (
                timesheets.map((t: any) => (
                  <TableRow key={t.userId}>
                    <TableCell className="pl-6 font-medium">
                      {t.name}
                      <div className="text-xs text-muted-foreground font-normal">
                        {t.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {t.projects.map((p: string, i: number) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{t.shifts}</TableCell>
                    <TableCell className="text-center font-bold text-blue-600 dark:text-blue-400 text-lg">
                      {t.totalHours}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        hrs
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6 text-green-600 dark:text-green-400 font-bold">
                      ${(t.totalHours * hourlyRate).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DailyReportService } from "@/services/dailyReport.services";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Plus,
  FileText,
  CloudRain,
  Sun,
  Cloud,
  Wind,
  Users,
  CalendarDays,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DailyReportsTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [summary, setSummary] = useState("");
  const [workersPresent, setWorkersPresent] = useState("");
  const [weatherCondition, setWeatherCondition] = useState("SUNNY");

  // Fetch Reports
  const { data: response, isLoading } = useQuery({
    queryKey: ["project-reports", projectId],
    queryFn: () => DailyReportService.getProjectReports(projectId),
    enabled: !!projectId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: DailyReportService.createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-reports", projectId],
      });
      setIsModalOpen(false);
      setSummary("");
      setWorkersPresent("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary || !workersPresent) return;

    createMutation.mutate({
      projectId,
      reportDate: new Date(reportDate).toISOString(),
      summary,
      workersPresent: Number(workersPresent),
      weatherCondition,
    });
  };

  const reports = response?.data || [];

  // Helper to render weather icons
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "SUNNY":
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case "RAINY":
        return <CloudRain className="h-5 w-5 text-blue-500" />;
      case "CLOUDY":
        return <Cloud className="h-5 w-5 text-gray-400" />;
      case "STORMY":
        return <Wind className="h-5 w-5 text-teal-500" />;
      case "SNOW":
        return <Cloud className="h-5 w-5 text-blue-300" />;
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center border rounded-xl">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Daily Site Reports
          </CardTitle>
          <CardDescription>
            Log daily progress, weather conditions, and site attendance.
          </CardDescription>
        </div>

        {/* REPORT MODAL */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Submit Daily Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Submit Daily Report</DialogTitle>
              <DialogDescription>
                Record the day's activities and site metrics.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Workers Present</Label>
                  {/* Zod expects min 0 */}
                  <Input
                    type="number"
                    min="0"
                    value={workersPresent}
                    onChange={(e) => setWorkersPresent(e.target.value)}
                    placeholder="e.g., 25"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Weather Condition</Label>
                <Select
                  value={weatherCondition}
                  onValueChange={setWeatherCondition}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select weather" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUNNY">Sunny / Clear</SelectItem>
                    <SelectItem value="CLOUDY">Cloudy / Overcast</SelectItem>
                    <SelectItem value="RAINY">Rainy</SelectItem>
                    <SelectItem value="STORMY">Stormy</SelectItem>
                    <SelectItem value="SNOW">Snow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Work Summary *</Label>
                {/* Zod expects min 5 chars */}
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Summarize the work completed today... (Min 5 characters)"
                  className="min-h-[120px]"
                  minLength={5}
                  required
                />
              </div>

              {createMutation.isError && (
                <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                  
                  {(createMutation.error as any)?.response?.data?.message || "Failed to submit the daily report."}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    summary.length < 5 ||
                    !workersPresent
                  }
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border-2 border-dashed">
            <FileText className="h-8 w-8 text-zinc-400 mb-2" />
            <h3 className="font-semibold text-lg">No daily reports yet</h3>
            <p className="text-muted-foreground text-sm">
              Submit the first site report to start tracking progress.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report: any) => (
              <div
                key={report.id}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20"
              >
                <div className="flex items-center justify-between mb-3 border-b pb-3 dark:border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4 text-zinc-500" />
                    <span className="font-semibold">
                      {new Date(report.reportDate).toLocaleDateString(
                        undefined,
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm font-medium">
                    <span className="flex items-center text-zinc-600 dark:text-zinc-300">
                      <Users className="h-4 w-4 mr-1 text-zinc-400" />{" "}
                      {report.workersPresent} Workers
                    </span>
                    <span className="flex items-center text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-1 rounded-md shadow-sm">
                      {getWeatherIcon(report.weatherCondition)}
                      <span className="ml-2 capitalize">
                        {report.weatherCondition.toLowerCase()}
                      </span>
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Daily Summary
                  </h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {report.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

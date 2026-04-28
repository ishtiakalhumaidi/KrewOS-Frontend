/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DailyReportService } from "@/services/dailyReport.services";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, FileText, CloudSun, Users, Calendar, ImagePlus, ImageIcon, Plus, Inbox, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function MemberReportsTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);
  
  // Form State
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [weatherCondition, setWeatherCondition] = useState("SUNNY");
  const [workersPresent, setWorkersPresent] = useState("");
  const [summary, setSummary] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);

  const { data: response, isLoading } = useQuery({
    queryKey: ["daily-reports", projectId],
    queryFn: () => DailyReportService.getProjectReports(projectId),
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: DailyReportService.createDailyReport,
    onSuccess: () => {
      toast.success("Daily report submitted successfully!");
      setIsModalOpen(false);
      setSummary("");
      setWorkersPresent("");
      setPhotos([]);
      queryClient.invalidateQueries({ queryKey: ["daily-reports", projectId] });
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) {
        errors.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error(error?.response?.data?.message || "Failed to submit report.");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary || !workersPresent) return toast.error("Please fill in all required fields.");

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("reportDate", reportDate);
    formData.append("weatherCondition", weatherCondition);
    formData.append("workersPresent", workersPresent);
    formData.append("summary", summary);

    photos.forEach(file => formData.append("photos", file));

    createMutation.mutate(formData);
  };

  const openPhotoViewer = (urls: string[]) => {
    setCurrentPhotos(urls);
    setIsPhotoModalOpen(true);
  };

  const reports = response?.data || [];

  if (isLoading) return <div className="flex py-20 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6 mt-4">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
        <div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center">
            <FileText className="w-6 h-6 mr-3 text-blue-600" /> Site Logs & Daily Reports
          </h3>
          <p className="text-sm font-medium text-zinc-500 mt-1">Official daily records of site progress, weather, and workforce.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-95 transition-all">
              <Plus className="mr-2 h-5 w-5" /> Log Today's Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Submit Daily Site Report</DialogTitle>
              <DialogDescription>Note: You can only submit one official report per day.</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">Report Date *</Label>
                  <Input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} required className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Weather Condition *</Label>
                  <Select value={weatherCondition} onValueChange={setWeatherCondition}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950">
                      <SelectValue placeholder="Select weather..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 dark:border-zinc-800 shadow-xl">
                      <SelectItem value="SUNNY">Sunny</SelectItem>
                      <SelectItem value="CLOUDY">Cloudy</SelectItem>
                      <SelectItem value="RAINY">Rainy</SelectItem>
                      <SelectItem value="STORMY">Stormy</SelectItem>
                      <SelectItem value="SNOW">Snow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Workers Present Today *</Label>
                <Input type="number" min="0" value={workersPresent} onChange={(e) => setWorkersPresent(e.target.value)} required placeholder="e.g., 15" className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" />
                <p className="text-xs font-bold text-zinc-400 mt-1">System calculates absentees based on total assigned workforce.</p>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Daily Summary / Progress *</Label>
                <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} required minLength={10} placeholder="What was accomplished today?" className="min-h-[100px] rounded-xl bg-slate-50 dark:bg-zinc-950 p-4" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center font-bold"><ImagePlus className="h-4 w-4 mr-2" /> Site Photos (Optional, Max 5)</Label>
                <Input type="file" accept="image/*" multiple onChange={(e) => { if (e.target.files) setPhotos(Array.from(e.target.files)); }} className="h-12 pt-3 rounded-xl bg-slate-50 dark:bg-zinc-950 cursor-pointer" />
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white mt-4" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : "Submit Report"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ─── Main Reports Feed ─── */}
      <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <CardContent className="p-0">
          {reports.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-24 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-slate-100 dark:border-zinc-700/50">
                <Inbox className="w-10 h-10 text-zinc-300 dark:text-zinc-500" />
              </div>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">No Daily Reports</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium max-w-sm">No official site logs have been submitted yet. Start by logging today's progress.</p>
              <Button variant="outline" className="mt-8 rounded-xl font-bold border-slate-200 dark:border-zinc-700" onClick={() => setIsModalOpen(true)}>
                Log First Report <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/50">
              {reports.map((report: any) => (
                <div key={report.id} className="p-8 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-6">
                  
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <Badge className="px-3 py-1 text-xs font-extrabold uppercase tracking-widest bg-blue-100 text-blue-700 dark:bg-blue-900/40 shadow-none border-0">
                        <Calendar className="w-3.5 h-3.5 mr-1.5"/> {new Date(report.reportDate).toLocaleDateString()}
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700">
                        <CloudSun className="w-3.5 h-3.5 mr-1.5" /> {report.weatherCondition}
                      </Badge>
                    </div>
                    
                    <p className="text-base text-zinc-700 dark:text-zinc-300 font-medium whitespace-pre-wrap leading-relaxed">
                      {report.summary}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 dark:border-zinc-800/50">
                      <span className="flex items-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        <Users className="w-4 h-4 mr-2 text-zinc-400"/> {report.workersPresent} / {report.totalWorkers} Workers On-Site
                      </span>
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        Logged by: {report.submitter?.name}
                      </span>
                    </div>
                  </div>

                  {report.photoUrls?.length > 0 && (
                    <div className="shrink-0 mt-4 md:mt-0">
                      <Button variant="outline" size="sm" className="h-10 rounded-xl font-bold border-slate-200 dark:border-zinc-700 hover:bg-slate-50 active:scale-95" onClick={() => openPhotoViewer(report.photoUrls)}>
                        <ImageIcon className="h-4 w-4 mr-2" /> View {report.photoUrls.length} Photos
                      </Button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── PHOTO VIEWER MODAL ─── */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-4xl p-8 rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Site Progress Photos</DialogTitle>
            <DialogDescription>Images captured and uploaded for this daily report.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-h-[70vh] overflow-y-auto pr-2">
            {currentPhotos.map((url, index) => (
              <div key={index} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm bg-slate-50 dark:bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Progress ${index + 1}`} className="object-cover w-full h-full" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
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
import { Loader2, FileText, CloudSun, Users, Calendar, ImagePlus, ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

export default function DailyReportsTab({ projectId }: { projectId: string }) {
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
    errors.forEach((err: any) => {
      toast.error(err.message);
    });
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

  if (isLoading) return <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
              <FileText className="h-5 w-5 mr-2" /> Site Logs & Daily Reports
            </CardTitle>
            <CardDescription>Official daily records of site progress, weather, and workforce.</CardDescription>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" /> Log Today's Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit Daily Site Report</DialogTitle>
                <DialogDescription>Note: You can only submit one official report per day.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Report Date *</Label>
                    <Input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Weather Condition *</Label>
                    <Select value={weatherCondition} onValueChange={setWeatherCondition}>
                      <SelectTrigger><SelectValue placeholder="Select weather..." /></SelectTrigger>
                      <SelectContent>
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
                  <Label>Workers Present Today *</Label>
                  <Input type="number" min="0" value={workersPresent} onChange={(e) => setWorkersPresent(e.target.value)} required placeholder="e.g., 15" />
                  <p className="text-xs text-muted-foreground">The system will automatically calculate absentees based on your total assigned workforce.</p>
                </div>

                <div className="space-y-2">
                  <Label>Daily Summary / Progress *</Label>
                  <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} required minLength={10} placeholder="What was accomplished today?" className="min-h-[100px]" />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center"><ImagePlus className="h-4 w-4 mr-2" /> Site Photos (Optional, Max 5)</Label>
                  <Input type="file" accept="image/*" multiple onChange={(e) => { if (e.target.files) setPhotos(Array.from(e.target.files)); }} />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Submit Report"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-dashed">
              <FileText className="h-10 w-10 text-zinc-300 mb-3" />
              <h3 className="font-semibold text-lg">No Daily Reports Found</h3>
              <p className="text-muted-foreground text-sm">Submit the first site log using the button above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report: any) => (
                <div key={report.id} className="p-4 border rounded-lg bg-white dark:bg-zinc-950 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Calendar className="w-3 h-3 mr-1"/> {new Date(report.reportDate).toLocaleDateString()}
                      </Badge>
                      <Badge variant="outline" className="text-zinc-600">
                        <CloudSun className="w-3 h-3 mr-1" /> {report.weatherCondition}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{report.summary}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                      <span className="flex items-center"><Users className="w-3 h-3 mr-1"/> {report.workersPresent} / {report.totalWorkers} Workers Present</span>
                      <span>Submitted by: {report.submitter?.name}</span>
                    </div>
                  </div>

                  {report.photoUrls?.length > 0 && (
                    <div className="flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => openPhotoViewer(report.photoUrls)}>
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

      {/* PHOTO VIEWER MODAL */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Daily Progress Photos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-[60vh] overflow-y-auto p-2">
            {currentPhotos.map((url, index) => (
              <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
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
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IncidentService } from "@/services/incident.services";
import { MemberPortalService } from "@/services/memberPortal.services"; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShieldAlert, AlertTriangle, Image as ImageIcon, Plus, CheckCircle2, AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function MyIncidentsPage() {
  const queryClient = useQueryClient();
  
  // Modals State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  
  // Data State
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({ 
    projectId: "", 
    title: "", 
    description: "", 
    severity: "LOW",
    dateOccurred: new Date().toISOString().slice(0, 16) 
  });

  const { data: incidentResponse, isLoading: isIncidentsLoading } = useQuery({
    queryKey: ["my-incidents"],
    queryFn: IncidentService.getMyIncidents,
  });

  const { data: projectsResponse } = useQuery({
    queryKey: ["my-projects"],
    queryFn: MemberPortalService.getMyProjects,
  });

  const reportMutation = useMutation({
    mutationFn: (data: FormData) => IncidentService.reportIncident(data),
    onSuccess: () => {
      toast.success("Incident reported successfully.");
      setIsReportModalOpen(false);
      setFormData({ projectId: "", title: "", description: "", severity: "LOW", dateOccurred: new Date().toISOString().slice(0, 16) });
      setFiles([]);
      queryClient.invalidateQueries({ queryKey: ["my-incidents"] });
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) errors.forEach((err: any) => toast.error(err.message));
      else toast.error(error?.response?.data?.message || "Failed to report incident.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId) return toast.error("Please select the project site.");

    const dataToSend = new FormData();
    dataToSend.append("projectId", formData.projectId);
    dataToSend.append("title", formData.title);
    dataToSend.append("description", formData.description);
    dataToSend.append("severity", formData.severity);
    dataToSend.append("dateOccurred", new Date(formData.dateOccurred).toISOString());

    files.forEach((file) => dataToSend.append("photos", file));
    reportMutation.mutate(dataToSend);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 5) return toast.error("You can only upload up to 5 photos.");
      setFiles(selectedFiles);
    }
  };

  const openPhotoViewer = (urls: string[]) => {
    setCurrentPhotos(urls);
    setIsPhotoModalOpen(true);
  };

  const incidents = incidentResponse?.data || [];
  const projects = projectsResponse?.data || [];

  const getSeverityBadge = (level: string) => {
    const base = "px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest border-0 shadow-none inline-flex items-center";
    switch (level) {
      case "CRITICAL": return <Badge className={cn(base, "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400")}><AlertOctagon className="w-3 h-3 mr-1.5"/> Critical</Badge>;
      case "HIGH": return <Badge className={cn(base, "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400")}>High</Badge>;
      case "MEDIUM": return <Badge className={cn(base, "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400")}>Medium</Badge>;
      default: return <Badge className={cn(base, "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400")}>Low</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 pt-4">
      
      {/* ─── Header Section ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4 px-1">
        <div className="inline-flex items-center rounded-full border border-orange-200/80 bg-orange-50 dark:border-orange-800/60 dark:bg-orange-900/30 px-4 py-1.5 text-sm font-bold tracking-wide text-orange-700 dark:text-orange-400 shadow-sm uppercase">
          <ShieldAlert className="mr-2.5 h-4 w-4" /> Safety Protocol
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Global Incident Log
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed font-medium mt-2">
              Report site hazards and track the resolution status of your submitted safety reports.
            </p>
          </div>
          
          <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 px-8 rounded-2xl font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-[0_8px_20px_-6px_rgba(234,88,12,0.5)] active:scale-95 transition-all text-base shrink-0">
                <Plus className="mr-2 h-5 w-5" /> Report Hazard
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center text-orange-600 dark:text-orange-500">
                  <AlertTriangle className="h-6 w-6 mr-3" /> Report an Incident
                </DialogTitle>
                <DialogDescription className="font-medium">
                  If this is a life-threatening emergency, please call local emergency services immediately.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label className="font-bold">Site / Project *</Label>
                  <Select value={formData.projectId} onValueChange={(val) => setFormData({ ...formData, projectId: val })}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 font-medium text-base shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)]">
                      <SelectValue placeholder="Select the affected site..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-xl">
                      {projects.map((proj: any) => (
                        <SelectItem key={proj.id} value={proj.id} className="py-3 font-medium">{proj.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Incident Title *</Label>
                    <Input placeholder="e.g., Exposed wiring" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 font-medium text-base shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Severity Level *</Label>
                    <Select value={formData.severity} onValueChange={(val) => setFormData({ ...formData, severity: val })}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 font-medium text-base shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)]">
                        <SelectValue placeholder="Select severity..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-xl">
                        <SelectItem value="LOW" className="py-3 font-medium text-blue-600">Low</SelectItem>
                        <SelectItem value="MEDIUM" className="py-3 font-medium text-amber-600">Medium</SelectItem>
                        <SelectItem value="HIGH" className="py-3 font-bold text-orange-600">High</SelectItem>
                        <SelectItem value="CRITICAL" className="py-3 font-bold text-red-600">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Date & Time of Incident *</Label>
                  <Input type="datetime-local" value={formData.dateOccurred} onChange={(e) => setFormData({ ...formData, dateOccurred: e.target.value })} required className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 font-medium text-base shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)]" />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Detailed Description *</Label>
                  <Textarea placeholder="Describe what happened or what you saw in detail..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required className="min-h-[120px] rounded-xl bg-slate-50 dark:bg-zinc-950 p-4 font-medium text-base shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)]" />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-zinc-700">Attach Evidence Photos (Max 5)</Label>
                  <Input type="file" accept="image/*" multiple onChange={handleFileChange} className="h-14 pt-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 cursor-pointer shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)]" />
                  {files.length > 0 && <p className="text-xs font-bold text-blue-600 mt-1">{files.length} photo(s) selected.</p>}
                </div>

                <Button type="submit" className="w-full h-14 rounded-2xl font-bold bg-orange-600 hover:bg-orange-700 text-white mt-4 shadow-sm" disabled={reportMutation.isPending}>
                  {reportMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Submit Official Report"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* ─── Incident Reports Table ─── */}
      {isIncidentsLoading ? (
        <div className="flex h-64 items-center justify-center border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
        </div>
      ) : (
        <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
          <CardHeader className="p-8 border-b bg-slate-50/50 dark:bg-zinc-900/10">
            <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center">
               My Submitted Reports
            </CardTitle>
            <CardDescription className="text-base font-medium mt-1">You have submitted {incidents.length} active or resolved safety records.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {incidents.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-slate-100 dark:border-zinc-700/50">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="font-extrabold text-2xl text-zinc-900 dark:text-white tracking-tight">Zero Incidents Reported</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2 max-w-sm">Thank you for keeping the project sites safe and hazard-free.</p>
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-zinc-950/50 text-zinc-500 border-b border-slate-100 dark:border-zinc-800">
                    <tr>
                      <th className="px-8 py-6 text-xs font-extrabold uppercase tracking-wider">Incident Details</th>
                      <th className="px-8 py-6 text-xs font-extrabold uppercase tracking-wider">Project Site</th>
                      <th className="px-8 py-6 text-xs font-extrabold uppercase tracking-wider">Severity</th>
                      <th className="px-8 py-6 text-xs font-extrabold uppercase tracking-wider">Status</th>
                      <th className="px-8 py-6 text-xs font-extrabold uppercase tracking-wider text-right">Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                    {incidents.map((incident: any) => (
                      <tr key={incident.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                        <td className="px-8 py-6 max-w-[300px]">
                          <p className="font-bold text-lg text-zinc-900 dark:text-white leading-tight mb-1">{incident.title}</p>
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed" title={incident.description}>{incident.description}</p>
                          <p className="text-[10px] font-extrabold text-zinc-400 mt-2 uppercase tracking-widest">Occurred: {new Date(incident.occurredAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-bold text-sm text-zinc-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm whitespace-nowrap">
                            {incident.project?.name}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          {getSeverityBadge(incident.severity)}
                        </td>
                        <td className="px-8 py-6">
                          <Badge className={cn("px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest shadow-none border", incident.isResolved ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40" : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/40")}>
                            {incident.isResolved ? "Resolved" : "Pending Action"}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                          {incident.photoUrls && incident.photoUrls.length > 0 ? (
                            <Button variant="outline" size="sm" onClick={() => openPhotoViewer(incident.photoUrls)} className="h-10 rounded-xl font-bold border-slate-200 dark:border-zinc-700 shadow-sm active:scale-95 transition-all whitespace-nowrap">
                              <ImageIcon className="h-4 w-4 mr-2" /> View {incident.photoUrls.length}
                            </Button>
                          ) : (
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">No photos</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── SHARED EVIDENCE VIEWER MODAL ─── */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-4xl p-8 rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Incident Evidence</DialogTitle>
            <DialogDescription>Photos submitted with this safety report.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-h-[70vh] overflow-y-auto pr-2">
            {currentPhotos.map((url, index) => (
              <div key={index} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm bg-slate-50 dark:bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Evidence ${index + 1}`} className="object-cover w-full h-full" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
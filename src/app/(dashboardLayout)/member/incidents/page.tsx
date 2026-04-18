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
import { Loader2, ShieldAlert, AlertTriangle, Image as ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

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

  // 1. Fetch worker's reported incidents
  const { data: incidentResponse, isLoading: isIncidentsLoading } = useQuery({
    queryKey: ["my-incidents"],
    queryFn: IncidentService.getMyIncidents,
  });

  // 2. Fetch worker's projects
  const { data: projectsResponse } = useQuery({
    queryKey: ["my-projects"],
    queryFn: MemberPortalService.getMyProjects,
  });

  // 3. Report Mutation
  const reportMutation = useMutation({
    mutationFn: (data: FormData) => IncidentService.reportIncident(data),
    onSuccess: () => {
      toast.success("Incident reported successfully.");
      setIsReportModalOpen(false);
      
      // Reset Form
      setFormData({ projectId: "", title: "", description: "", severity: "LOW", dateOccurred: new Date().toISOString().slice(0, 16) });
      setFiles([]);
      
      queryClient.invalidateQueries({ queryKey: ["my-incidents"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to report incident.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId) {
      toast.error("Please select the project site.");
      return;
    }

    // 👉 Prepare FormData for Multer (File Uploading)
    const dataToSend = new FormData();
    dataToSend.append("projectId", formData.projectId);
    dataToSend.append("title", formData.title);
    dataToSend.append("description", formData.description);
    dataToSend.append("severity", formData.severity);
    
    // Zod expects a Date string or Date object
    dataToSend.append("dateOccurred", new Date(formData.dateOccurred).toISOString());

    // Append up to 5 files matching the multer array name 'photos'
    files.forEach((file) => {
      dataToSend.append("photos", file);
    });

    reportMutation.mutate(dataToSend);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 5) {
        toast.error("You can only upload up to 5 photos.");
        return;
      }
      setFiles(selectedFiles);
    }
  };

  const openPhotoViewer = (urls: string[]) => {
    setCurrentPhotos(urls);
    setIsPhotoModalOpen(true);
  };

  const incidents = incidentResponse?.data || [];
  const projects = projectsResponse?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Safety & Incidents</h1>
          <p className="text-muted-foreground mt-1">Report site hazards and track your submitted safety reports.</p>
        </div>

        {/* REPORT INCIDENT MODAL */}
        <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Report Hazard
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-orange-600">
                <AlertTriangle className="h-5 w-5 mr-2" /> Report a Safety Incident
              </DialogTitle>
              <DialogDescription>
                If this is a life-threatening emergency, please call local emergency services immediately.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Site / Project *</Label>
                <Select value={formData.projectId} onValueChange={(val) => setFormData({ ...formData, projectId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the site..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((proj: any) => (
                      <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Incident Title *</Label>
                  <Input 
                    placeholder="e.g., Exposed wiring" 
                    value={formData.title} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Severity Level *</Label>
                  <Select value={formData.severity} onValueChange={(val) => setFormData({ ...formData, severity: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date & Time of Incident *</Label>
                <Input 
                  type="datetime-local" 
                  value={formData.dateOccurred} 
                  onChange={(e) => setFormData({ ...formData, dateOccurred: e.target.value })} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea 
                  placeholder="Describe what happened or what you saw in detail..." 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  required 
                  className="min-h-[100px]"
                />
              </div>

              {/* 👉 NEW IMAGE UPLOAD FIELD */}
              <div className="space-y-2">
                <Label>Attach Photos (Max 5)</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {files.length > 0 && (
                  <p className="text-xs text-muted-foreground">{files.length} photo(s) selected.</p>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t dark:border-zinc-800">
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 w-full md:w-auto" disabled={reportMutation.isPending}>
                  {reportMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Submit Report
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isIncidentsLoading ? (
        <div className="flex h-64 items-center justify-center border rounded-xl bg-white dark:bg-zinc-900">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>My Submitted Reports</CardTitle>
            <CardDescription>You have submitted {incidents.length} safety reports.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {incidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center bg-zinc-50 dark:bg-zinc-900/50">
                <ShieldAlert className="h-10 w-10 text-zinc-300 mb-4" />
                <h3 className="font-semibold text-lg">No incidents reported</h3>
                <p className="text-muted-foreground text-sm">Thank you for keeping the site safe.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium">Incident</th>
                      <th className="px-6 py-3 font-medium">Site</th>
                      <th className="px-6 py-3 font-medium">Severity</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Evidence</th>
                      <th className="px-6 py-3 font-medium text-right">Date Occurred</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {incidents.map((incident: any) => (
                      <tr key={incident.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold">{incident.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{incident.description}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-zinc-600 dark:text-zinc-300">
                          {incident.project?.name}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={
                            incident.severity === "CRITICAL" ? "bg-red-50 text-red-700 border-red-200" :
                            incident.severity === "HIGH" ? "bg-orange-50 text-orange-700 border-orange-200" :
                            incident.severity === "MEDIUM" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                            "bg-blue-50 text-blue-700 border-blue-200"
                          }>
                            {incident.severity}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {/* 👉 UPDATED: Uses the isResolved boolean properly! */}
                          <Badge 
                            variant={incident.isResolved ? "default" : "secondary"} 
                            className={incident.isResolved ? "bg-green-500 hover:bg-green-600 text-white" : "bg-zinc-100 text-zinc-700"}
                          >
                            {incident.isResolved ? "Resolved" : "Pending Action"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {/* 👉 NEW: Photo Viewer Button */}
                          {incident.photoUrls && incident.photoUrls.length > 0 ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openPhotoViewer(incident.photoUrls)}
                              className="text-xs"
                            >
                              <ImageIcon className="h-3 w-3 mr-2" /> View {incident.photoUrls.length}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">No photos</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground">
                          {new Date(incident.occurredAt).toLocaleDateString()}
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

      {/* 👉 NEW: PHOTO VIEWER MODAL */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Incident Evidence Photos</DialogTitle>
            <DialogDescription>Photos submitted with this safety report.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-[60vh] overflow-y-auto p-2">
            {currentPhotos.map((url, index) => (
              <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                {/* Fallback to img if Cloudinary/Next Image isn't configured, otherwise use next/image */}
                <img 
                  src={url} 
                  alt={`Incident photo ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setIsPhotoModalOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
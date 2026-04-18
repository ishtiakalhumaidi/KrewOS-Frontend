/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IncidentService } from "@/services/incident.services";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle, ShieldAlert, CheckCircle2, AlertOctagon, ImagePlus, Image as ImageIcon } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function IncidentsTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("MEDIUM");
  const [photos, setPhotos] = useState<File[]>([]); 
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]); // For Photo Viewer

  // Fetch Incidents
  const { data: response, isLoading } = useQuery({
    queryKey: ["project-incidents", projectId],
    queryFn: () => IncidentService.getProjectIncidents(projectId),
    enabled: !!projectId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: IncidentService.reportIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-incidents", projectId] });
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setSeverity("MEDIUM");
      setPhotos([]);
    },
  });

  // 👉 FIX: Updated Resolve Mutation to expect { incidentId, data: FormData }
  const resolveMutation = useMutation({
    mutationFn: ({ incidentId, data }: { incidentId: string, data: FormData }) => 
      IncidentService.resolveIncident(incidentId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-incidents", projectId] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("severity", severity);
    formData.append("dateOccurred", new Date().toISOString());

    photos.forEach((file) => {
      formData.append("photos", file);
    });

    createMutation.mutate(formData);
  };

  // 👉 NEW: Helper to safely toggle resolution via FormData
  const handleResolveToggle = (incidentId: string, resolveStatus: boolean) => {
    const formData = new FormData();
    formData.append("isResolved", String(resolveStatus));
    // If Admin wanted to upload proof of fix, we could append photos here too!
    resolveMutation.mutate({ incidentId, data: formData });
  };

  const openPhotoViewer = (urls: string[]) => {
    setCurrentPhotos(urls);
    setIsPhotoModalOpen(true);
  };

  const incidents = response?.data || [];

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case "CRITICAL": 
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900">
            <AlertOctagon className="w-3 h-3 mr-1"/> Critical
          </Badge>
        );
      case "HIGH": 
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900">
            High
          </Badge>
        );
      case "MEDIUM": 
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-900">
            Medium
          </Badge>
        );
      default: 
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900">
            Low
          </Badge>
        );
    }
  };

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center border rounded-xl"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-destructive/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-destructive flex items-center">
              <ShieldAlert className="h-5 w-5 mr-2" />
              Safety & Incident Reports
            </CardTitle>
            <CardDescription>Log and track safety hazards, accidents, and near-misses.</CardDescription>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <AlertTriangle className="h-4 w-4 mr-2" /> 
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-destructive flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Report a Safety Incident
                </DialogTitle>
                <DialogDescription>
                  Provide details about the hazard or accident. This will alert project managers.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Incident Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Unsecured scaffolding on Level 3" required minLength={5} />
                </div>
                
                <div className="space-y-2">
                  <Label>Severity Level</Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low (Minor hazard, no injury)</SelectItem>
                      <SelectItem value="MEDIUM">Medium (Requires attention soon)</SelectItem>
                      <SelectItem value="HIGH">High (Immediate risk of injury)</SelectItem>
                      <SelectItem value="CRITICAL">Critical (Accident occurred / Halt work)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Describe what happened... (Min 10 characters)" 
                    className="min-h-[100px]"
                    required 
                    minLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    <ImagePlus className="h-4 w-4 mr-2" /> Attach Photos (Optional)
                  </Label>
                  <Input 
                    type="file" accept="image/*" multiple 
                    onChange={(e) => { if (e.target.files) setPhotos(Array.from(e.target.files)); }} 
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" variant="destructive" disabled={createMutation.isPending || title.length < 5 || description.length < 10}>
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Submit Report"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="p-0">
          {incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center bg-zinc-50 dark:bg-zinc-900/50">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg">Zero Incidents Reported</h3>
              <p className="text-muted-foreground text-sm">This site currently has a perfect safety record.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 font-medium">Incident</th>
                    <th className="px-6 py-3 font-medium">Severity</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Evidence</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {incidents.map((incident: any) => (
                    <tr key={incident.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="px-6 py-4">
                        <p className="font-medium">{incident.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">{incident.description}</p>
                      </td>
                      <td className="px-6 py-4">{getSeverityBadge(incident.severity)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={incident.isResolved ? "outline" : "default"}>
                          {incident.isResolved ? "RESOLVED" : "OPEN"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {/* 👉 PHOTO VIEWER BUTTON */}
                        {incident.photoUrls?.length > 0 ? (
                          <Button variant="outline" size="sm" onClick={() => openPhotoViewer(incident.photoUrls)} className="h-8">
                            <ImageIcon className="h-3 w-3 mr-2" /> View
                          </Button>
                        ) : <span className="text-xs text-muted-foreground">None</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={resolveMutation.isPending}>
                              {resolveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!incident.isResolved ? (
                              <DropdownMenuItem onClick={() => handleResolveToggle(incident.id, true)}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Mark as Resolved
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleResolveToggle(incident.id, false)}>
                                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" /> Re-open Incident
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 👉 NEW: PHOTO VIEWER MODAL */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Incident Evidence</DialogTitle>
            <DialogDescription>Photos submitted for this report.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-[60vh] overflow-y-auto p-2">
            {currentPhotos.map((url, index) => (
              <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                <img src={url} alt={`Evidence ${index + 1}`} className="object-cover w-full h-full" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
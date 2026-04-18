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
import { Loader2, AlertTriangle, ShieldAlert, CheckCircle2, AlertOctagon, ImagePlus } from "lucide-react";
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
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("MEDIUM");
  const [photos, setPhotos] = useState<File[]>([]); // 👉 Added Photo State

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
      // Reset Form
      setTitle("");
      setDescription("");
      setSeverity("MEDIUM");
      setPhotos([]);
    },
    onError: (error: any) => {
      console.error("Failed to report incident:", error);
    }
  });

  const resolveMutation = useMutation({
    mutationFn: IncidentService.resolveIncident,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-incidents", projectId] }),
  });

  // 👉 The New FormData Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("severity", severity);
     formData.append("dateOccurred", new Date().toISOString());

    // Append all selected files to the "photos" key (matching multerUpload.array("photos"))
    photos.forEach((file) => {
      formData.append("photos", file);
    });

    createMutation.mutate(formData);
  };

  const incidents = response?.data || [];

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case "CRITICAL": return <Badge variant="destructive" className="bg-red-600"><AlertOctagon className="w-3 h-3 mr-1"/> Critical</Badge>;
      case "HIGH": return <Badge variant="destructive" className="bg-orange-500">High</Badge>;
      case "MEDIUM": return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">Medium</Badge>;
      default: return <Badge variant="outline">Low</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center border rounded-xl"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
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
                {/* REMINDER: Title must be 5+ characters for Zod! */}
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Unsecured scaffolding on Level 3" required minLength={5} />
              </div>
              
              <div className="space-y-2">
                <Label>Severity Level</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
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
                 {/* REMINDER: Description must be 10+ characters for Zod! */}
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe what happened... (Min 10 characters)" 
                  className="min-h-[100px]"
                  required 
                  minLength={10}
                />
              </div>

              {/* 👉 Added File Input for Photos */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Attach Photos (Optional)
                </Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={(e) => {
                    if (e.target.files) setPhotos(Array.from(e.target.files));
                  }} 
                  className="cursor-pointer"
                />
              </div>

              {createMutation.isError && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  Failed to report incident. Ensure title is 5+ chars and description is 10+ chars.
                </div>
              )}

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
                  <th className="px-6 py-3 font-medium">Date Reported</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {incidents.map((incident: any) => (
                  <tr key={incident.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">{incident.description}</p>
                      {/* 👉 Added a small indicator if photos exist */}
                      {incident.photoUrls?.length > 0 && (
                         <span className="inline-flex items-center text-xs text-blue-500 mt-1">
                           <ImagePlus className="h-3 w-3 mr-1" /> {incident.photoUrls.length} attached
                         </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getSeverityBadge(incident.severity)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={incident.isResolved ? "outline" : "default"}>
                        {incident.isResolved ? "RESOLVED" : "OPEN"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(incident.occurredAt || incident.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">Update</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!incident.isResolved ? (
                            <DropdownMenuItem onClick={() => resolveMutation.mutate({ incidentId: incident.id, isResolved: true })}>
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Mark as Resolved
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => resolveMutation.mutate({ incidentId: incident.id, isResolved: false })}>
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
  );
}
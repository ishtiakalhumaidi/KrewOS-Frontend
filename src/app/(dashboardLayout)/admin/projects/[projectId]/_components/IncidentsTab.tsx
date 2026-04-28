/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IncidentService } from "@/services/incident.services";
import { SafetyChecklistService } from "@/services/safetyChecklist.services";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { 
  Loader2, ShieldAlert, AlertTriangle, CheckCircle2, AlertCircle, AlertOctagon,
  ClipboardCheck, Calendar, User, CheckSquare, XSquare, FileText, Image as ImageIcon, Plus, ImagePlus
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminProjectSafetyTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  
  // --- Modals State ---
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);

  // --- Incident Form State ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("MEDIUM");
  const [photos, setPhotos] = useState<File[]>([]); 

  // --- QUERIES (Project Specific) ---
  const { data: incidentsResponse, isLoading: isIncidentsLoading } = useQuery({
    queryKey: ["project-incidents", projectId],
    queryFn: () => IncidentService.getProjectIncidents(projectId),
    enabled: !!projectId,
  });

  const { data: checklistsResponse, isLoading: isChecklistsLoading } = useQuery({
    queryKey: ["project-checklists", projectId],
    queryFn: () => SafetyChecklistService.getProjectChecklists(projectId),
    enabled: !!projectId,
  });

  // --- MUTATIONS ---
  const createIncidentMutation = useMutation({
    mutationFn: IncidentService.reportIncident,
    onSuccess: () => {
      toast.success("Incident reported successfully.");
      queryClient.invalidateQueries({ queryKey: ["project-incidents", projectId] });
      setIsIncidentModalOpen(false);
      setTitle(""); setDescription(""); setSeverity("MEDIUM"); setPhotos([]);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to report incident.")
  });

  const resolveIncidentMutation = useMutation({
    mutationFn: ({ incidentId, data }: { incidentId: string, data: FormData }) => 
      IncidentService.resolveIncident(incidentId, data),
    onSuccess: () => {
      toast.success("Incident marked as resolved!");
      queryClient.invalidateQueries({ queryKey: ["project-incidents", projectId] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to resolve incident.")
  });

  // --- HANDLERS ---
  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("severity", severity);
    formData.append("dateOccurred", new Date().toISOString());

    photos.forEach((file) => formData.append("photos", file));
    createIncidentMutation.mutate(formData);
  };

  const handleResolveToggle = (incidentId: string, resolveStatus: boolean) => {
    const formData = new FormData();
    formData.append("isResolved", String(resolveStatus));
    resolveIncidentMutation.mutate({ incidentId, data: formData });
  };

  const openChecklistDetails = (checklist: any) => {
    setSelectedChecklist(checklist);
    setIsDetailsModalOpen(true);
  };

  const openPhotoViewer = (urls: string[]) => {
    setCurrentPhotos(urls);
    setIsPhotoModalOpen(true);
  };

  if (isIncidentsLoading || isChecklistsLoading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
  }

  const incidents = incidentsResponse?.data?.data || incidentsResponse?.data || [];
  const checklists = checklistsResponse?.data?.data || checklistsResponse?.data || [];

  return (
    <div className="space-y-8 mt-4">
      
      {/* ─── Tabs Interface ─── */}
      <Tabs defaultValue="incidents" className="w-full">
        
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] h-14 rounded-2xl bg-slate-100 dark:bg-zinc-900 p-1 mb-8 shadow-inner border border-slate-200/50 dark:border-zinc-800">
          <TabsTrigger value="incidents" className="rounded-xl h-full font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400">
            <AlertTriangle className="w-4 h-4 mr-2"/> Active Incidents
          </TabsTrigger>
          <TabsTrigger value="checklists" className="rounded-xl h-full font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
            <ClipboardCheck className="w-4 h-4 mr-2"/> Daily Checklists
          </TabsTrigger>
        </TabsList>

        {/* =========================================
            TAB 1: INCIDENT LOG (PROJECT SPECIFIC)
        ========================================= */}
        <TabsContent value="incidents" className="outline-none space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="rounded-[2rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8 border-b border-red-100 dark:border-red-900/20 bg-red-50/50 dark:bg-red-900/10">
                <div>
                  <CardTitle className="flex items-center text-2xl font-bold text-red-700 dark:text-red-400 tracking-tight">
                    <ShieldAlert className="w-6 h-6 mr-3" /> Project Incident Log
                  </CardTitle>
                  <CardDescription className="text-red-600/70 dark:text-red-400/70 text-base mt-2 font-medium">
                    Review, resolve, and report safety hazards for this specific site.
                  </CardDescription>
                </div>

                <Dialog open={isIncidentModalOpen} onOpenChange={setIsIncidentModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-[0_8px_20px_-6px_rgba(220,38,38,0.5)] transition-all active:scale-95">
                      <Plus className="mr-2 h-5 w-5" /> Report Incident
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] p-8 rounded-[2.5rem]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-red-600 flex items-center">
                        <AlertTriangle className="h-6 w-6 mr-3" /> Report a Safety Incident
                      </DialogTitle>
                      <DialogDescription>Log a hazard or accident directly to this project&apos;s record.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleIncidentSubmit} className="space-y-5 pt-4">
                      <div className="space-y-2">
                        <Label className="font-bold">Incident Title *</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Unsecured scaffolding" required minLength={5} className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="font-bold">Severity Level</Label>
                        <Select value={severity} onValueChange={setSeverity}>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950"><SelectValue placeholder="Select severity" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">Low (Minor hazard, no injury)</SelectItem>
                            <SelectItem value="MEDIUM">Medium (Requires attention soon)</SelectItem>
                            <SelectItem value="HIGH">High (Immediate risk of injury)</SelectItem>
                            <SelectItem value="CRITICAL">Critical (Accident occurred / Halt work)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold">Description *</Label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what happened..." className="min-h-[120px] rounded-xl bg-slate-50 dark:bg-zinc-950 p-4" required minLength={10} />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center font-bold"><ImagePlus className="h-4 w-4 mr-2" /> Attach Photos (Optional)</Label>
                        <Input type="file" accept="image/*" multiple onChange={(e) => { if (e.target.files) setPhotos(Array.from(e.target.files)); }} className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950 pt-3 cursor-pointer" />
                      </div>

                      <Button type="submit" className="w-full h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white mt-4" disabled={createIncidentMutation.isPending || title.length < 5 || description.length < 10}>
                        {createIncidentMutation.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : "Submit Report"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-zinc-950/50">
                    <TableRow className="border-b border-slate-100 dark:border-zinc-800 hover:bg-transparent">
                      <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Date</TableHead>
                      <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Incident Details</TableHead>
                      <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Severity</TableHead>
                      <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</TableHead>
                      <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((incident: any) => (
                      <TableRow key={incident.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                        <TableCell className="px-8 py-5">
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">{new Date(incident.createdAt).toLocaleDateString()}</p>
                        </TableCell>
                        <TableCell className="px-8 py-5">
                          <p className="font-bold text-zinc-900 dark:text-white text-sm">{incident.title}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[250px] truncate mt-1">{incident.description}</p>
                        </TableCell>
                        <TableCell className="px-8 py-5">
                          <Badge className={cn(
                            "px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0",
                            incident.severity === "HIGH" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                            : incident.severity === "CRITICAL" ? "bg-red-200 text-red-800 dark:bg-red-950 dark:text-red-300"
                            : incident.severity === "MEDIUM" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                          )}>
                            {incident.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-5">
                          <div className={cn("inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest uppercase shadow-sm border",
                            incident.isResolved ? "bg-slate-50 border-slate-200 text-slate-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300" : "bg-red-500 border-red-600 text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)]"
                          )}>
                            {incident.isResolved ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Resolved</> : <><AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Action Required</>}
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            {incident.photoUrls?.length > 0 && (
                              <Button variant="outline" size="sm" className="h-9 rounded-lg font-bold border-slate-200" onClick={() => openPhotoViewer(incident.photoUrls)}>
                                <ImageIcon className="h-3.5 w-3.5 mr-2" /> Evidence
                              </Button>
                            )}
                            {!incident.isResolved && (
                              <Button variant="outline" size="sm" className="h-9 rounded-lg font-bold border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => handleResolveToggle(incident.id, true)} disabled={resolveIncidentMutation.isPending}>
                                {resolveIncidentMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Resolve</>}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {incidents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
                              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-xl font-bold text-zinc-900 dark:text-white">Project Clear</p>
                            <p className="mt-1 text-zinc-500 font-medium">No safety incidents reported for this site! 🎉</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* =========================================
            TAB 2: DAILY CHECKLISTS (PROJECT SPECIFIC)
        ========================================= */}
        <TabsContent value="checklists" className="outline-none space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="rounded-[2rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
              <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/20 p-8">
                <CardTitle className="flex items-center text-2xl font-bold text-blue-700 dark:text-blue-400 tracking-tight">
                  <ClipboardCheck className="w-6 h-6 mr-3" /> Project Safety Inspections
                </CardTitle>
                <CardDescription className="text-blue-600/70 dark:text-blue-400/70 text-base mt-2 font-medium">
                  Review daily safety compliance checklists submitted by managers on this site.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-zinc-950/50">
                    <TableRow className="border-b border-slate-100 dark:border-zinc-800 hover:bg-transparent">
                      <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Date</TableHead>
                      <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Submitted By</TableHead>
                      <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Inspection Result</TableHead>
                      <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checklists.map((check: any) => (
                      <TableRow key={check.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                        <TableCell className="px-8 py-5">
                          <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-2 text-zinc-400" />
                            {new Date(check.checkDate).toLocaleDateString()}
                          </p>
                        </TableCell>
                        <TableCell className="px-8 py-5">
                          <p className="font-bold text-zinc-900 dark:text-white text-sm">{check.submitter?.name || "Unknown"}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{check.submitter?.email}</p>
                        </TableCell>
                        <TableCell className="px-8 py-5">
                          <Badge className={cn(
                            "px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0",
                            check.allClear ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40" : "bg-red-100 text-red-700 dark:bg-red-900/40"
                          )}>
                            {check.allClear ? "All Clear (100%)" : "Issues Found"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-5 text-right">
                          <Button variant="outline" size="sm" className="h-9 rounded-lg font-bold border-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800" onClick={() => openChecklistDetails(check)}>
                            <FileText className="w-3.5 h-3.5 mr-2" /> View Report
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {checklists.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-20">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4">
                              <ClipboardCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-xl font-bold text-zinc-900 dark:text-white">No Inspections Logged</p>
                            <p className="mt-1 text-zinc-500 font-medium">Managers have not submitted any checklists for this project.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* =========================================
          MODALS
      ========================================= */}

      {/* CHECKLIST DETAILS MODAL */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8">
          {selectedChecklist && (
            <>
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center text-xl font-bold pr-4">
                  Safety Report
                  <Badge className={cn("px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0", selectedChecklist.allClear ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                    {selectedChecklist.allClear ? "All Clear" : "Issues Found"}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="flex items-center pt-2 font-medium">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" /> {new Date(selectedChecklist.checkDate).toLocaleDateString()}
                  <span className="mx-3 text-zinc-300">•</span>
                  <User className="w-3.5 h-3.5 mr-1.5" /> {selectedChecklist.submitter?.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                  <h4 className="bg-slate-50 dark:bg-zinc-900/50 p-4 text-sm font-bold border-b border-slate-200 dark:border-zinc-800 uppercase tracking-wider text-zinc-500">Verification Items</h4>
                  <div className="p-4 space-y-3">
                    {Object.entries(selectedChecklist.checklistData).map(([key, passed]: any) => (
                      <div key={key} className={`flex items-start text-sm ${passed ? "text-zinc-700 dark:text-zinc-300 font-medium" : "text-red-600 dark:text-red-400 font-bold"}`}>
                        {passed ? <CheckSquare className="w-4 h-4 mr-3 text-emerald-500 shrink-0 mt-0.5" /> : <XSquare className="w-4 h-4 mr-3 text-red-500 shrink-0 mt-0.5" />}
                        <span className="leading-tight">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedChecklist.notes && (
                  <div className="border border-amber-200 dark:border-amber-900/50 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 p-5 shadow-sm">
                    <h4 className="text-xs font-extrabold text-amber-800 dark:text-amber-500 mb-2 uppercase tracking-widest">Inspector Notes</h4>
                    <p className="text-sm text-amber-900 dark:text-amber-400 whitespace-pre-wrap font-medium leading-relaxed">
                      {selectedChecklist.notes}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* EVIDENCE VIEWER MODAL */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-4xl p-8 rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Incident Evidence</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-h-[70vh] overflow-y-auto pr-2">
            {currentPhotos.map((url, index) => (
              <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm">
                <img src={url} alt={`Evidence ${index + 1}`} className="object-cover w-full h-full" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
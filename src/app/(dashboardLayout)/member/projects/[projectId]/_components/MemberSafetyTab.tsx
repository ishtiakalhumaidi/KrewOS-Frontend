/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IncidentService } from "@/services/incident.services";
import { SafetyChecklistService } from "@/services/safetyChecklist.services"; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, ShieldAlert, CheckCircle2, AlertOctagon, Image as ImageIcon, 
  ClipboardCheck, Calendar, CheckSquare, XSquare, Plus, FileText, User, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function MemberSafetyTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();

  // --- UI STATES ---
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);

  // --- PRE-LOADED CHECKLIST STATES ---
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [checklistData, setChecklistData] = useState({
    "PPE Compliant (Hard hats, vests)": true,
    "Scaffolding & Ladders Secure": true,
    "Site Clean & Clear of Debris": true,
    "Equipment & Tools Checked": true,
    "First Aid Kit Stocked & Visible": true,
    "Fire Extinguishers Accessible": true,
  });

  // --- QUERIES ---
  const { data: incidentsResponse, isLoading: isIncidentsLoading } = useQuery({
    queryKey: ["incidents", projectId],
    queryFn: () => IncidentService.getProjectIncidents(projectId),
  });

  const { data: checklistsResponse, isLoading: isChecklistsLoading } = useQuery({
    queryKey: ["checklists", projectId],
    queryFn: () => SafetyChecklistService.getProjectChecklists(projectId),
  });

  // --- MUTATIONS ---
  const resolveIncidentMutation = useMutation({
    mutationFn: ({ incidentId, data }: { incidentId: string, data: FormData }) => 
      IncidentService.resolveIncident(incidentId, data),
    onSuccess: () => {
      toast.success("Incident marked as resolved!");
      queryClient.invalidateQueries({ queryKey: ["incidents", projectId] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to resolve incident.")
  });

  const createChecklistMutation = useMutation({
    mutationFn: SafetyChecklistService.createChecklist,
    onSuccess: () => {
      toast.success("Daily Safety Checklist submitted!");
      setIsChecklistModalOpen(false);
      setNotes("");
      setChecklistData({
        "PPE Compliant (Hard hats, vests)": true,
        "Scaffolding & Ladders Secure": true,
        "Site Clean & Clear of Debris": true,
        "Equipment & Tools Checked": true,
        "First Aid Kit Stocked & Visible": true,
        "Fire Extinguishers Accessible": true,
      });
      queryClient.invalidateQueries({ queryKey: ["checklists", projectId] });
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) errors.forEach((err: any) => toast.error(err.message));
      else toast.error(error?.response?.data?.message || "Failed to submit checklist.");
    }
  });

  // --- HANDLERS ---
  const handleResolveToggle = (incidentId: string) => {
    const formData = new FormData();
    formData.append("isResolved", "true");
    resolveIncidentMutation.mutate({ incidentId, data: formData });
  };

  const toggleChecklistItem = (key: string) => {
    setChecklistData(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleChecklistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allClear = Object.values(checklistData).every((val) => val === true);

    createChecklistMutation.mutate({
      projectId,
      checkDate: new Date(checkDate).toISOString(),
      checklistData,
      allClear,
      notes
    });
  };

  const openPhotoViewer = (urls: string[]) => {
    setCurrentPhotos(urls);
    setIsPhotoModalOpen(true);
  };

  const openChecklistDetails = (checklist: any) => {
    setSelectedChecklist(checklist);
    setIsDetailsModalOpen(true);
  };

  const isLoading = isIncidentsLoading || isChecklistsLoading;
  if (isLoading) return <div className="flex py-32 justify-center items-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>;

  const incidents = incidentsResponse?.data?.data || incidentsResponse?.data || [];
  const checklists = checklistsResponse?.data?.data || checklistsResponse?.data || [];

  const getSeverityBadge = (level: string) => {
    const baseClasses = "px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0 inline-flex items-center";
    switch (level) {
      case "CRITICAL": return <Badge className={cn(baseClasses, "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400")}><AlertOctagon className="w-3 h-3 mr-1.5"/> Critical</Badge>;
      case "HIGH": return <Badge className={cn(baseClasses, "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400")}>High</Badge>;
      case "MEDIUM": return <Badge className={cn(baseClasses, "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400")}>Medium</Badge>;
      default: return <Badge className={cn(baseClasses, "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400")}>Low</Badge>;
    }
  };

  return (
    <div className="space-y-8 mt-4">
      <Tabs defaultValue="checklists" className="w-full">
        <TabsList className="flex flex-wrap justify-start gap-2 h-auto p-1 mb-8 bg-slate-100/50 dark:bg-zinc-900/50 rounded-[1.5rem] border border-slate-200/50 dark:border-zinc-800/50 w-fit">
          <TabsTrigger value="checklists" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all">
            <ClipboardCheck className="w-4 h-4 mr-2"/> Daily Checklists
          </TabsTrigger>
          <TabsTrigger value="incidents" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all">
            <ShieldAlert className="w-4 h-4 mr-2"/> Incident Log
          </TabsTrigger>
        </TabsList>

        {/* =========================================
            TAB 1: DAILY SAFETY CHECKLISTS
        ========================================= */}
        <TabsContent value="checklists" className="outline-none">
          <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/10">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center">
                  <ClipboardCheck className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" /> Safety Inspections
                </CardTitle>
                <CardDescription className="text-base font-medium mt-1">Routine site safety checks and daily hazard verifications.</CardDescription>
              </div>
              
              <Dialog open={isChecklistModalOpen} onOpenChange={setIsChecklistModalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-95 transition-all">
                    <Plus className="mr-2 h-5 w-5" /> Submit Checklist
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Daily Safety Checklist</DialogTitle>
                    <DialogDescription>Verify standard general safety protocols on site today.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleChecklistSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <Label className="font-bold">Date of Inspection</Label>
                      <Input type="date" value={checkDate} onChange={(e) => setCheckDate(e.target.value)} required className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950 px-4" />
                    </div>
                    
                    <div className="space-y-4 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 bg-slate-50/50 dark:bg-zinc-900/50">
                      <h4 className="font-extrabold text-xs uppercase tracking-widest text-zinc-500 border-b border-slate-200 dark:border-zinc-800 pb-3">General Verification Items</h4>
                      <div className="space-y-3 pt-2">
                        {Object.entries(checklistData).map(([key, value]) => (
                          <Label 
                            key={key} 
                            className="flex items-center justify-between p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-colors shadow-sm"
                          >
                            <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium select-none">{key}</span>
                            <input 
                              type="checkbox" 
                              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer accent-blue-600"
                              checked={value} 
                              onChange={() => toggleChecklistItem(key)} 
                            />
                          </Label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold">Additional Notes or Findings</Label>
                      <Textarea placeholder="Report any minor issues found during the inspection..." value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[100px] rounded-xl bg-slate-50 dark:bg-zinc-950 p-4" />
                    </div>

                    <Button type="submit" className="w-full h-14 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white mt-4" disabled={createChecklistMutation.isPending}>
                      {createChecklistMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Submit Inspection"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="p-8">
              {checklists.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 bg-slate-50/50 dark:bg-zinc-950/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-zinc-800">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-blue-200/50">
                    <ClipboardCheck className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-extrabold text-2xl text-zinc-900 dark:text-white tracking-tight">No Safety Checklists</h3>
                  <p className="text-zinc-500 mt-2 font-medium">No routine inspections have been logged for this site yet.</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {checklists.map((check: any) => (
                    <motion.div key={check.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                      <Card className="shadow-sm border-slate-200 dark:border-zinc-800 rounded-[1.5rem] flex flex-col hover:shadow-md transition-shadow h-full">
                        <CardHeader className="p-6 pb-4">
                          <div className="flex justify-between items-start mb-2">
                            <Badge className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-blue-50 text-blue-700 dark:bg-blue-900/40 shadow-none border-0">
                              <Calendar className="w-3 h-3 mr-1.5" /> {new Date(check.checkDate).toLocaleDateString()}
                            </Badge>
                            <Badge className={cn("px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0", check.allClear ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40" : "bg-red-100 text-red-700 dark:bg-red-900/40")}>
                              {check.allClear ? "All Clear" : "Issues Found"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1 flex flex-col px-6 pb-6">
                          <div className="grid grid-cols-1 gap-2.5 text-sm font-medium">
                            {Object.entries(check.checklistData).slice(0, 3).map(([key, passed]: any) => (
                              <div key={key} className="flex items-start text-zinc-600 dark:text-zinc-400">
                                {passed ? <CheckSquare className="w-4 h-4 mr-2.5 text-emerald-500 shrink-0 mt-0.5" /> : <XSquare className="w-4 h-4 mr-2.5 text-red-500 shrink-0 mt-0.5" />}
                                <span className="truncate leading-tight">{key}</span>
                              </div>
                            ))}
                            {Object.keys(check.checklistData).length > 3 && (
                              <div className="text-zinc-400 italic mt-2 text-[10px] font-extrabold uppercase tracking-widest">
                                +{Object.keys(check.checklistData).length - 3} more items verified
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-auto pt-5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <p className="text-xs font-bold text-zinc-500 flex items-center">
                              <User className="w-3.5 h-3.5 mr-1.5" /> {check.submitter?.name}
                            </p>
                            <Button variant="outline" size="sm" className="h-9 rounded-lg font-bold border-slate-200 dark:border-zinc-700 hover:bg-slate-50 active:scale-95" onClick={() => openChecklistDetails(check)}>
                              <FileText className="w-3.5 h-3.5 mr-1.5" /> Full Report
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* =========================================
            TAB 2: INCIDENT LOG
        ========================================= */}
        <TabsContent value="incidents" className="outline-none">
          <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/10">
              <div>
                <CardTitle className="text-red-700 dark:text-red-400 flex items-center text-2xl font-bold tracking-tight">
                  <ShieldAlert className="h-6 w-6 mr-3" /> Incident Log
                </CardTitle>
                <CardDescription className="text-base font-medium mt-1">Reported hazards and accidents requiring resolution.</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {incidents.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 bg-slate-50/50 dark:bg-zinc-950/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-zinc-800">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-emerald-200/50">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-extrabold text-2xl text-zinc-900 dark:text-white tracking-tight">Zero Incidents</h3>
                  <p className="text-zinc-500 mt-2 font-medium">This site currently has a perfect safety record.</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {incidents.map((incident: any) => (
                    <motion.div key={incident.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                      <Card className="shadow-sm border-slate-200 dark:border-zinc-800 rounded-[1.5rem] hover:shadow-md transition-shadow h-full flex flex-col">
                        <CardHeader className="p-6 pb-3">
                          <div className="flex justify-between items-start mb-3">
                            {getSeverityBadge(incident.severity)}
                            <Badge className={cn("px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest shadow-none border", incident.isResolved ? "bg-slate-50 border-slate-200 text-slate-600 dark:bg-zinc-800 dark:border-zinc-700" : "bg-red-500 border-red-600 text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)]")}>
                              {incident.isResolved ? "RESOLVED" : "ACTIVE"}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-bold tracking-tight">{incident.title || "Safety Incident"}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-5 flex-1 flex flex-col">
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">{incident.description}</p>
                          
                          <div className="flex flex-wrap items-center justify-between pt-5 mt-auto border-t border-slate-100 dark:border-zinc-800 gap-3">
                            {incident.photoUrls?.length > 0 ? (
                              <Button variant="outline" size="sm" className="h-10 rounded-xl font-bold border-slate-200 dark:border-zinc-700 hover:bg-slate-50 active:scale-95" onClick={() => openPhotoViewer(incident.photoUrls)}>
                                <ImageIcon className="h-4 w-4 mr-2" /> View Evidence
                              </Button>
                            ) : <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">No photos attached</span>}

                            {!incident.isResolved && (
                              <Button 
                                variant="outline" size="sm" className="h-10 rounded-xl font-bold border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 active:scale-95"
                                onClick={() => handleResolveToggle(incident.id)}
                                disabled={resolveIncidentMutation.isPending}
                              >
                                {resolveIncidentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4 mr-2" /> Resolve</>}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* =========================================
          MODALS 
      ========================================= */}

      {/* CHECKLIST FULL DETAILS MODAL */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8">
          {selectedChecklist && (
            <>
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center text-xl font-bold pr-4">
                  Safety Report
                  <Badge className={cn("px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0", selectedChecklist.allClear ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40" : "bg-red-100 text-red-700 dark:bg-red-900/40")}>
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
                    <h4 className="text-xs font-extrabold text-amber-800 dark:text-amber-500 mb-2 uppercase tracking-widest flex items-center"><AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Inspector Notes</h4>
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

      {/* SHARED EVIDENCE VIEWER MODAL */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-4xl p-8 rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Incident Evidence</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-h-[70vh] overflow-y-auto pr-2">
            {currentPhotos.map((url, index) => (
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm bg-slate-50 dark:bg-zinc-900" key={index}>
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
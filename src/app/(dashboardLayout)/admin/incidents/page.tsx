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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Loader2, ShieldAlert, AlertTriangle, CheckCircle2, AlertCircle, 
  ClipboardCheck, Calendar, User, CheckSquare, XSquare, FileText, Image as ImageIcon,
  MoreVertical, Trash2, ChevronLeft, ChevronRight, Search, FilterX, ListFilter
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminSafetyPage() {
  const queryClient = useQueryClient();
  
  // --- Modals State ---
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);
  
  // 👉 NEW: Custom Delete Modal State instead of browser alert()
  const [incidentToDelete, setIncidentToDelete] = useState<{ id: string, title: string } | null>(null);

  // --- Filtering & Pagination State (Incidents) ---
  const [incidentPage, setIncidentPage] = useState(1);
  const [incidentSearch, setIncidentSearch] = useState("");
  const [incidentSeverity, setIncidentSeverity] = useState("ALL");
  const [incidentStatus, setIncidentStatus] = useState("ALL");
  const [incidentDate, setIncidentDate] = useState("");

  // --- Filtering & Pagination State (Checklists) ---
  const [checklistPage, setChecklistPage] = useState(1);
  const [checklistSearch, setChecklistSearch] = useState("");
  const [checklistStatus, setChecklistStatus] = useState("ALL");
  const [checklistDate, setChecklistDate] = useState("");

  // --- Build Query Params ---
  const buildIncidentParams = () => {
    const params: any = { page: incidentPage, limit: 10 };
    if (incidentSearch) params.searchTerm = incidentSearch;
    if (incidentSeverity !== "ALL") params.severity = incidentSeverity;
    if (incidentStatus === "RESOLVED") params.isResolved = 'true';
    if (incidentStatus === "OPEN") params.isResolved = 'false';
    if (incidentDate) {
      // Force exact UTC boundaries to avoid timezone shifting bugs
      params['createdAt[gte]'] = `${incidentDate}T00:00:00.000Z`;
      params['createdAt[lte]'] = `${incidentDate}T23:59:59.999Z`;
    }
    return params;
  };

  const buildChecklistParams = () => {
    const params: any = { page: checklistPage, limit: 10 };
    if (checklistSearch) params.searchTerm = checklistSearch;
    if (checklistStatus === "ALL_CLEAR") params.allClear = 'true';
    if (checklistStatus === "ISSUES") params.allClear = 'false';
    if (checklistDate) {
      // Force exact UTC boundaries to avoid timezone shifting bugs
      params['checkDate[gte]'] = `${checklistDate}T00:00:00.000Z`;
      params['checkDate[lte]'] = `${checklistDate}T23:59:59.999Z`;
    }
    return params;
  };

  // --- QUERIES ---
  const { data: incidentsResponse, isLoading: isIncidentsLoading } = useQuery({
    queryKey: ["company-incidents", incidentPage, incidentSearch, incidentSeverity, incidentStatus, incidentDate],
    queryFn: () => IncidentService.getCompanyIncidents(buildIncidentParams()),
  });

  const { data: checklistsResponse, isLoading: isChecklistsLoading } = useQuery({
    queryKey: ["company-checklists", checklistPage, checklistSearch, checklistStatus, checklistDate],
    queryFn: () => SafetyChecklistService.getCompanyChecklists(buildChecklistParams()).catch(() => ({ data: [] })), 
  });

  // --- MUTATIONS ---
  const resolveIncidentMutation = useMutation({
    mutationFn: ({ incidentId, data }: { incidentId: string, data: FormData }) => 
      IncidentService.resolveIncident(incidentId, data),
    onSuccess: () => {
      toast.success("Incident status updated!");
      queryClient.invalidateQueries({ queryKey: ["company-incidents"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to resolve incident.")
  });

  const deleteIncidentMutation = useMutation({
    mutationFn: (incidentId: string) => IncidentService.deleteIncident(incidentId),
    onSuccess: () => {
      toast.success("Incident permanently deleted.");
      setIncidentToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["company-incidents"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to delete incident.")
  });

  // --- HANDLERS ---
  const handleResolveToggle = (incidentId: string, resolveStatus: boolean) => {
    const formData = new FormData();
    formData.append("isResolved", String(resolveStatus));
    resolveIncidentMutation.mutate({ incidentId, data: formData });
  };

  const clearIncidentFilters = () => {
    setIncidentSearch("");
    setIncidentSeverity("ALL");
    setIncidentStatus("ALL");
    setIncidentDate("");
    setIncidentPage(1);
  };

  const clearChecklistFilters = () => {
    setChecklistSearch("");
    setChecklistStatus("ALL");
    setChecklistDate("");
    setChecklistPage(1);
  };

  const openChecklistDetails = (checklist: any) => {
    setSelectedChecklist(checklist);
    setIsDetailsModalOpen(true);
  };

  const openPhotoViewer = (urls: string[]) => {
    setCurrentPhotos(urls);
    setIsPhotoModalOpen(true);
  };

  // --- DATA EXTRACTION ---
  const incidents = incidentsResponse?.data?.data || incidentsResponse?.data || [];
  const incidentsMeta = incidentsResponse?.data?.meta || { page: 1, totalPages: 1 };
  
  const checklists = checklistsResponse?.data?.data || checklistsResponse?.data || [];
  const checklistsMeta = checklistsResponse?.data?.meta || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 pt-4">
      
      {/* ─── Header Section ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
        <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-bold tracking-wide text-blue-700 dark:text-blue-400 shadow-sm uppercase">
          <ShieldAlert className="mr-2.5 h-4 w-4" /> Global Safety Management
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Safety & Incident Reports
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed font-medium">
          Monitor, filter, and resolve safety inspections and active hazard reports across all projects.
        </p>
      </motion.div>

      {/* ─── Tabs Interface ─── */}
      <Tabs defaultValue="incidents" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 max-w-100 rounded-2xl bg-slate-100 dark:bg-zinc-900/80 p-0.75 mb-8 shadow-inner border border-slate-200/50 dark:border-zinc-800">

  <TabsTrigger
    value="incidents"
    className="flex items-center justify-center gap-2 rounded-xl font-bold
    data-[state=active]:bg-white 
    dark:data-[state=active]:bg-zinc-800 
    data-[state=active]:shadow-sm 
    transition-all 
    data-[state=active]:text-red-600 
    dark:data-[state=active]:text-red-400"
  >
    <AlertTriangle className="w-4 h-4" />
    Active Incidents
  </TabsTrigger>

  <TabsTrigger
    value="checklists"
    className="flex items-center justify-center gap-2 rounded-xl font-bold
    data-[state=active]:bg-white 
    dark:data-[state=active]:bg-zinc-800 
    data-[state=active]:shadow-sm 
    transition-all 
    data-[state=active]:text-blue-600 
    dark:data-[state=active]:text-blue-400"
  >
    <ClipboardCheck className="w-4 h-4" />
    Daily Checklists
  </TabsTrigger>

</TabsList>
        {/* =========================================
            TAB 1: INCIDENT LOG (WITH PREMIUM FILTERS)
        ========================================= */}
        <TabsContent value="incidents" className="outline-none">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
              
              <CardHeader className="bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20 p-8">
                <div className="flex flex-col gap-6">
                  <div>
                    <CardTitle className="flex items-center text-2xl font-bold text-red-700 dark:text-red-400 tracking-tight">
                      <ShieldAlert className="w-6 h-6 mr-3" /> Global Incident Log
                    </CardTitle>
                    <CardDescription className="text-red-600/70 dark:text-red-400/70 text-base mt-2 font-medium">
                      Review and resolve high-priority safety hazards from all sites.
                    </CardDescription>
                  </div>

                  <div className="bg-white/60 dark:bg-zinc-950/60 border border-red-200/60 dark:border-red-900/40 p-4 rounded-[1.5rem] shadow-sm backdrop-blur-sm flex flex-col lg:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold px-2 whitespace-nowrap">
                      <ListFilter className="w-4 h-4" /> Filters:
                    </div>

                    <div className="relative flex-1 w-full lg:w-auto">
                      <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-red-400" />
                      <Input 
                        placeholder="Search incident reports..." 
                        value={incidentSearch} 
                        onChange={(e) => setIncidentSearch(e.target.value)}
                        className="pl-11 h-12 rounded-xl bg-white dark:bg-zinc-950 border-red-200 dark:border-red-900/50 focus-visible:ring-red-500 shadow-sm w-full font-medium"
                      />
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full lg:w-auto">
                      <Select value={incidentSeverity} onValueChange={setIncidentSeverity}>
                        <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-zinc-950 border-red-200 dark:border-red-900/50 focus-visible:ring-red-500 font-medium w-full sm:w-[160px] shadow-sm">
                          <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="ALL" className="py-2.5 font-medium">All Severities</SelectItem>
                          <SelectItem value="CRITICAL" className="py-2.5 font-medium">Critical</SelectItem>
                          <SelectItem value="HIGH" className="py-2.5 font-medium">High</SelectItem>
                          <SelectItem value="MEDIUM" className="py-2.5 font-medium">Medium</SelectItem>
                          <SelectItem value="LOW" className="py-2.5 font-medium">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={incidentStatus} onValueChange={setIncidentStatus}>
                        <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-zinc-950 border-red-200 dark:border-red-900/50 focus-visible:ring-red-500 font-medium w-full sm:w-[160px] shadow-sm">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="ALL" className="py-2.5 font-medium">All Statuses</SelectItem>
                          <SelectItem value="OPEN" className="py-2.5 font-medium">Action Required</SelectItem>
                          <SelectItem value="RESOLVED" className="py-2.5 font-medium">Resolved</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input 
                        type="date" 
                        value={incidentDate} 
                        onChange={(e) => setIncidentDate(e.target.value)}
                        className="h-12 rounded-xl bg-white dark:bg-zinc-950 border-red-200 dark:border-red-900/50 focus-visible:ring-red-500 font-medium w-full sm:w-[160px] shadow-sm"
                      />

                      {(incidentSearch || incidentSeverity !== "ALL" || incidentStatus !== "ALL" || incidentDate) && (
                        <Button 
                          variant="ghost" 
                          onClick={clearIncidentFilters} 
                          className="h-12 px-4 rounded-xl text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/40 font-bold whitespace-nowrap"
                        >
                          <FilterX className="w-4 h-4 mr-2" /> Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {isIncidentsLoading ? (
                  <div className="flex items-center justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-red-600" /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-zinc-950/50">
                        <TableRow className="border-b border-slate-100 dark:border-zinc-800 hover:bg-transparent">
                          <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Date / Project</TableHead>
                          <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Incident Details</TableHead>
                          <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Severity</TableHead>
                          <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</TableHead>
                          <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incidents.map((incident: any) => (
                          <TableRow key={incident.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                            <TableCell className="px-8 py-6">
                              <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-zinc-400" />
                                {new Date(incident.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1.5 ml-6">{incident.project?.name || "Unknown Site"}</p>
                            </TableCell>
                            <TableCell className="px-8 py-6">
                              <p className="font-bold text-zinc-900 dark:text-white text-base">{incident.title}</p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-[300px] truncate mt-1 font-medium">{incident.description}</p>
                            </TableCell>
                            <TableCell className="px-8 py-6">
                              <Badge className={cn(
                                "px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0",
                                incident.severity === "CRITICAL" ? "bg-red-200 text-red-800 dark:bg-red-950 dark:text-red-300"
                                : incident.severity === "HIGH" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                                : incident.severity === "MEDIUM" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                              )}>
                                {incident.severity}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-8 py-6">
                              <div className={cn("inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest uppercase shadow-sm border",
                                incident.isResolved ? "bg-slate-50 border-slate-200 text-slate-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300" : "bg-red-500 border-red-600 text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)]"
                              )}>
                                {incident.isResolved ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Resolved</> : <><AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Action Required</>}
                              </div>
                            </TableCell>
                            <TableCell className="px-8 py-6 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                                    <MoreVertical className="h-5 w-5 text-zinc-500" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-2xl p-2 w-56 shadow-xl border-slate-200 dark:border-zinc-800">
                                  {incident.photoUrls?.length > 0 && (
                                    <DropdownMenuItem onClick={() => openPhotoViewer(incident.photoUrls)} className="font-bold py-2.5 cursor-pointer text-blue-600 dark:text-blue-400">
                                      <ImageIcon className="h-4 w-4 mr-3" /> View Evidence
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {!incident.isResolved ? (
                                    <DropdownMenuItem onClick={() => handleResolveToggle(incident.id, true)} className="font-bold py-2.5 cursor-pointer text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle2 className="h-4 w-4 mr-3" /> Mark as Resolved
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleResolveToggle(incident.id, false)} className="font-bold py-2.5 cursor-pointer text-amber-600 dark:text-amber-400">
                                      <AlertTriangle className="h-4 w-4 mr-3" /> Re-open Incident
                                    </DropdownMenuItem>
                                  )}
                                  
                                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-800" />
                                  <DropdownMenuItem 
                                    onClick={() => setIncidentToDelete({ id: incident.id, title: incident.title })} 
                                    className="font-bold py-2.5 cursor-pointer text-red-600 focus:text-red-700 dark:text-red-400"
                                  >
                                    <Trash2 className="h-4 w-4 mr-3 text-red-500" /> Delete Report
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                        {incidents.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-24">
                              <div className="flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
                                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="text-xl font-bold text-zinc-900 dark:text-white">No Results Found</p>
                                <p className="mt-1 text-zinc-500 font-medium">Try adjusting your filters or search query.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    {incidentsMeta.totalPages > 1 && (
                      <div className="flex items-center justify-between p-6 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30">
                        <Button 
                          variant="outline" 
                          disabled={incidentPage === 1} 
                          onClick={() => setIncidentPage(p => Math.max(1, p - 1))}
                          className="rounded-xl h-10 font-bold border-slate-200 dark:border-zinc-700 active:scale-95 transition-transform"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                        </Button>
                        <span className="text-sm font-bold text-zinc-500">
                          Page {incidentsMeta.page} of {incidentsMeta.totalPages}
                        </span>
                        <Button 
                          variant="outline" 
                          disabled={incidentPage >= incidentsMeta.totalPages} 
                          onClick={() => setIncidentPage(p => p + 1)}
                          className="rounded-xl h-10 font-bold border-slate-200 dark:border-zinc-700 active:scale-95 transition-transform"
                        >
                          Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* =========================================
            TAB 2: DAILY CHECKLISTS (WITH PREMIUM FILTERS)
        ========================================= */}
        <TabsContent value="checklists" className="outline-none">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
              
              <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/20 p-8">
                <div className="flex flex-col gap-6">
                  <div>
                    <CardTitle className="flex items-center text-2xl font-bold text-blue-700 dark:text-blue-400 tracking-tight">
                      <ClipboardCheck className="w-6 h-6 mr-3" /> Global Safety Inspections
                    </CardTitle>
                    <CardDescription className="text-blue-600/70 dark:text-blue-400/70 text-base mt-2 font-medium">
                      Review daily safety compliance checklists submitted by Site Managers.
                    </CardDescription>
                  </div>

                  <div className="bg-white/60 dark:bg-zinc-950/60 border border-blue-200/60 dark:border-blue-900/40 p-4 rounded-[1.5rem] shadow-sm backdrop-blur-sm flex flex-col lg:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold px-2 whitespace-nowrap">
                      <ListFilter className="w-4 h-4" /> Filters:
                    </div>

                    <div className="relative flex-1 w-full lg:w-auto">
                      <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-blue-400" />
                      <Input 
                        placeholder="Search by project or notes..." 
                        value={checklistSearch} 
                        onChange={(e) => setChecklistSearch(e.target.value)}
                        className="pl-11 h-12 rounded-xl bg-white dark:bg-zinc-950 border-blue-200 dark:border-blue-900/50 focus-visible:ring-blue-500 shadow-sm w-full font-medium"
                      />
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full lg:w-auto">
                      <Select value={checklistStatus} onValueChange={setChecklistStatus}>
                        <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-zinc-950 border-blue-200 dark:border-blue-900/50 focus-visible:ring-blue-500 font-medium w-full sm:w-[180px] shadow-sm">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="ALL" className="py-2.5 font-medium">All Results</SelectItem>
                          <SelectItem value="ALL_CLEAR" className="py-2.5 font-medium">All Clear (100%)</SelectItem>
                          <SelectItem value="ISSUES" className="py-2.5 font-medium">Issues Found</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input 
                        type="date" 
                        value={checklistDate} 
                        onChange={(e) => setChecklistDate(e.target.value)}
                        className="h-12 rounded-xl bg-white dark:bg-zinc-950 border-blue-200 dark:border-blue-900/50 focus-visible:ring-blue-500 font-medium w-full sm:w-[160px] shadow-sm"
                      />

                      {(checklistSearch || checklistStatus !== "ALL" || checklistDate) && (
                        <Button 
                          variant="ghost" 
                          onClick={clearChecklistFilters} 
                          className="h-12 px-4 rounded-xl text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/40 font-bold whitespace-nowrap"
                        >
                          <FilterX className="w-4 h-4 mr-2" /> Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {isChecklistsLoading ? (
                  <div className="flex items-center justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-zinc-950/50">
                        <TableRow className="border-b border-slate-100 dark:border-zinc-800 hover:bg-transparent">
                          <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Date / Project</TableHead>
                          <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Submitted By</TableHead>
                          <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Inspection Result</TableHead>
                          <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {checklists.map((check: any) => (
                          <TableRow key={check.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                            <TableCell className="px-8 py-6">
                              <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-zinc-400" />
                                {new Date(check.checkDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1.5 ml-6">{check.project?.name || "Unknown Site"}</p>
                            </TableCell>
                            <TableCell className="px-8 py-6">
                              <p className="font-bold text-zinc-900 dark:text-white text-base">{check.submitter?.name || "Unknown"}</p>
                              <p className="text-sm text-zinc-500 mt-0.5">{check.submitter?.email}</p>
                            </TableCell>
                            <TableCell className="px-8 py-6">
                              <Badge className={cn(
                                "px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0",
                                check.allClear ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40" : "bg-red-100 text-red-700 dark:bg-red-900/40"
                              )}>
                                {check.allClear ? "All Clear (100%)" : "Issues Found"}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-8 py-6 text-right">
                              <Button variant="outline" size="sm" className="h-10 rounded-xl font-bold border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 transition-transform" onClick={() => openChecklistDetails(check)}>
                                <FileText className="w-4 h-4 mr-2" /> View Report
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
                                <p className="text-xl font-bold text-zinc-900 dark:text-white">No Inspections Found</p>
                                <p className="mt-1 text-zinc-500 font-medium">Try adjusting your filters or search query.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    {checklistsMeta.totalPages > 1 && (
                      <div className="flex items-center justify-between p-6 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30">
                        <Button variant="outline" disabled={checklistPage === 1} onClick={() => setChecklistPage(p => Math.max(1, p - 1))} className="rounded-xl h-10 font-bold border-slate-200 dark:border-zinc-700 active:scale-95 transition-transform">
                          <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                        </Button>
                        <span className="text-sm font-bold text-zinc-500">Page {checklistsMeta.page} of {checklistsMeta.totalPages}</span>
                        <Button variant="outline" disabled={checklistPage >= checklistsMeta.totalPages} onClick={() => setChecklistPage(p => p + 1)} className="rounded-xl h-10 font-bold border-slate-200 dark:border-zinc-700 active:scale-95 transition-transform">
                          Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* =========================================
          MODALS
      ========================================= */}

      {/* 👉 NEW: Delete Confirmation Modal */}
      <Dialog open={!!incidentToDelete} onOpenChange={(open) => !open && setIncidentToDelete(null)}>
        <DialogContent className="sm:max-w-md p-8 rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center text-2xl font-bold">
              <AlertTriangle className="h-6 w-6 mr-3" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-base mt-2 font-medium">
              Are you sure you want to permanently delete the incident report for <strong>{incidentToDelete?.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" className="h-12 rounded-xl font-bold px-6 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800" onClick={() => setIncidentToDelete(null)}>
              Cancel
            </Button>
            <Button 
              className="h-12 rounded-xl font-bold px-6 bg-red-600 hover:bg-red-700 text-white shadow-[0_8px_20px_-6px_rgba(220,38,38,0.5)]" 
              disabled={deleteIncidentMutation.isPending}
              onClick={() => {
                if (incidentToDelete) deleteIncidentMutation.mutate(incidentToDelete.id);
              }}
            >
              {deleteIncidentMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete Report"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                    <p className="text-sm text-amber-900 dark:text-amber-400 whitespace-pre-wrap font-medium leading-relaxed">{selectedChecklist.notes}</p>
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
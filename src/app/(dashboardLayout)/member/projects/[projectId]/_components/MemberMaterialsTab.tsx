/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MaterialRequestService } from "@/services/materialRequest.services";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Loader2, Plus, Clock, CheckCircle2, XCircle, Truck, ImagePlus, Check, X,
  Image as ImageIcon, Package, Inbox, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function MemberMaterialsTab({
  projectId,
  myRole,
}: {
  projectId: string;
  myRole: string;
}) {
  const queryClient = useQueryClient();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    itemName: "",
    quantity: "",
    unit: "pieces",
    notes: "",
  });

  const isManager = myRole === "SITE_MANAGER" || myRole === "PROJECT_MANAGER";

  // 1. Managers fetch all requests for the project
  const { data: managerResponse, isLoading: isManagerLoading } = useQuery({
    queryKey: ["project-materials", projectId],
    queryFn: () => MaterialRequestService.getProjectMaterials(projectId),
    enabled: isManager,
  });

  // 2. Workers fetch ONLY their requests
  const { data: workerResponse, isLoading: isWorkerLoading } = useQuery({
    queryKey: ["my-materials"],
    queryFn: () => MaterialRequestService.getMyRequests(),
    enabled: !isManager,
  });

  const isLoading = isManager ? isManagerLoading : isWorkerLoading;

  let requests: any[] = [];
  if (isManager) {
    requests = managerResponse?.data?.data || managerResponse?.data || [];
  } else {
    const allMyRequests = workerResponse?.data?.data || workerResponse?.data || [];
    requests = allMyRequests.filter((req: any) => req.projectId === projectId);
  }

  // Mutations
  const requestMutation = useMutation({
    mutationFn: MaterialRequestService.createMaterialRequest,
    onSuccess: () => {
      toast.success("Material request submitted!");
      setIsRequestModalOpen(false);
      setFormData({ itemName: "", quantity: "", unit: "pieces", notes: "" });
      queryClient.invalidateQueries({ queryKey: ["project-materials", projectId] });
      queryClient.invalidateQueries({ queryKey: ["my-materials"] });
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) errors.forEach((err: any) => toast.error(err.message));
      else toast.error(error?.response?.data?.message || "Failed to submit request.");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: FormData }) =>
      MaterialRequestService.updateMaterialStatus({ requestId, data }),
    onSuccess: (_, variables) => {
      const statusPassed = variables.data.get("status");
      if (statusPassed === "DELIVERED") toast.success("Materials marked as delivered!");
      else if (statusPassed === "APPROVED") toast.success("Request approved!");
      else if (statusPassed === "REJECTED") toast.error("Request rejected.");

      setIsDeliveryModalOpen(false);
      setDeliveryFile(null);
      queryClient.invalidateQueries({ queryKey: ["project-materials", projectId] });
      queryClient.invalidateQueries({ queryKey: ["my-materials"] });
    },
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestMutation.mutate({
      projectId,
      ...formData,
      quantity: Number(formData.quantity),
    });
  };

  const handleStatusUpdate = (requestId: string, status: string) => {
    const fd = new FormData();
    fd.append("status", status);
    fd.append("projectId", projectId);
    statusMutation.mutate({ requestId, data: fd });
  };

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest border-0 shadow-none";
    switch (status) {
      case "APPROVED": return <Badge className={cn(base, "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400")}>Approved</Badge>;
      case "REJECTED": return <Badge className={cn(base, "bg-red-100 text-red-700")}>Rejected</Badge>;
      case "DELIVERED": return <Badge className={cn(base, "bg-emerald-100 text-emerald-700")}>Delivered</Badge>;
      default: return <Badge className={cn(base, "bg-amber-100 text-amber-700")}>Pending</Badge>;
    }
  };

  if (isLoading) return <div className="flex py-20 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6 mt-4">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
        <div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center">
            <Package className="w-6 h-6 mr-3 text-blue-600" /> Material Requests
          </h3>
          <p className="text-sm font-medium text-zinc-500 mt-1">Track and manage supply logistics for this site.</p>
        </div>

        {(myRole === "WORKER" || myRole === "SUBCONTRACTOR") && (
          <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-95 transition-all">
                <Plus className="mr-2 h-5 w-5" /> Request Supply
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Request Materials</DialogTitle>
                <DialogDescription>Submit a new supply request for approval.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRequestSubmit} className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label className="font-bold">Item Name</Label>
                  <Input value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} required className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Quantity</Label>
                    <Input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Unit</Label>
                    <Input value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} required className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Usage Notes</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="rounded-xl bg-slate-50 dark:bg-zinc-950 min-h-[80px]" />
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl font-bold bg-blue-600 text-white mt-4" disabled={requestMutation.isPending}>
                  {requestMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Submit Request"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* ─── Main Table Card ─── */}
      <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          {requests.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-24 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-slate-100 dark:border-zinc-700/50">
                  <Inbox className="w-10 h-10 text-zinc-300 dark:text-zinc-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">No Material Requests</h3>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium max-w-sm mx-auto">
                  There are currently no active supply requests for this project site.
                </p>
                {(myRole === "WORKER" || myRole === "SUBCONTRACTOR") && (
                  <Button variant="outline" className="mt-8 rounded-xl font-bold border-slate-200 dark:border-zinc-700" onClick={() => setIsRequestModalOpen(true)}>
                    Make First Request <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-zinc-950/50">
                <TableRow className="border-b border-slate-100 dark:border-zinc-800 hover:bg-transparent">
                  <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Item & Specification</TableHead>
                  {isManager && <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Requested By</TableHead>}
                  <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</TableHead>
                  <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req: any) => (
                  <TableRow key={req.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <TableCell className="px-8 py-6">
                      <p className="font-bold text-lg text-zinc-900 dark:text-white">{req.itemName}</p>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {req.quantity} {req.unit}
                      </p>
                      {req.notes && <p className="text-xs text-zinc-400 mt-1.5 italic leading-relaxed">&quot;{req.notes}&quot;</p>}
                    </TableCell>
                    
                    {isManager && (
                      <TableCell className="px-8 py-6 font-bold text-zinc-700 dark:text-zinc-300">
                        {req.requester?.name || "Worker"}
                      </TableCell>
                    )}

                    <TableCell className="px-8 py-6">{getStatusBadge(req.status)}</TableCell>
                    
                    <TableCell className="px-8 py-6 text-right space-x-2">
                      {isManager && req.status === "PENDING" && (
                        <>
                          <Button size="sm" variant="outline" className="h-10 w-10 p-0 border-emerald-500 text-emerald-600 hover:bg-emerald-50" onClick={() => handleStatusUpdate(req.id, "APPROVED")} disabled={statusMutation.isPending}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-10 w-10 p-0 border-red-500 text-red-600 hover:bg-red-50" onClick={() => handleStatusUpdate(req.id, "REJECTED")} disabled={statusMutation.isPending}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {!isManager && req.status === "APPROVED" && (
                        <Button variant="outline" size="sm" className="h-10 rounded-xl font-bold border-emerald-500 text-emerald-600 hover:bg-emerald-50" onClick={() => { setSelectedRequestId(req.id); setIsDeliveryModalOpen(true); }}>
                          <Truck className="h-4 w-4 mr-2" /> Log Delivery
                        </Button>
                      )}
                      {req.deliveryPhotoUrl && (
                        <Button variant="ghost" size="sm" className="h-10 rounded-xl font-bold text-blue-600" onClick={() => { setCurrentPhotoUrl(req.deliveryPhotoUrl); setIsPhotoModalOpen(true); }}>
                          <ImageIcon className="h-4 w-4 mr-2" /> Proof
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ─── Shared Modals (Delivery & Photo Viewer) ─── */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Delivery Proof</DialogTitle>
            <DialogDescription>Photo uploaded verified by site staff.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 rounded-3xl overflow-hidden border bg-slate-50 flex items-center justify-center min-h-[300px]">
            {currentPhotoUrl && <img src={currentPhotoUrl} alt="Delivery Proof" className="max-w-full max-h-[60vh] object-contain shadow-2xl" />}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MaterialRequestService } from "@/services/materialRequest.services";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, CheckCircle2, XCircle, Truck, Clock, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function MaterialsTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["project-materials", projectId],
    queryFn: () => MaterialRequestService.getProjectMaterials(projectId),
    enabled: !!projectId,
  });

  const updateMutation = useMutation({
    mutationFn: MaterialRequestService.updateMaterialStatus,
    onSuccess: () => {
      toast.success("Request status updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["project-materials", projectId] });
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) errors.forEach((err: any) => toast.error(err.message));
      else toast.error(error?.response?.data?.message || "Failed to update status.");
    }
  });

  const handleStatusUpdate = (requestId: string, status: string) => {
    const fd = new FormData();
    fd.append("status", status);
    updateMutation.mutate({ requestId, data: fd });
  };

  const openPhotoViewer = (url: string) => {
    setCurrentPhotoUrl(url);
    setIsPhotoModalOpen(true);
  };

  const requests = response?.data || [];

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0";
    switch (status) {
      case "APPROVED": return <Badge className={cn(base, "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 hover:bg-blue-100")}><CheckCircle2 className="w-3.5 h-3.5 mr-1.5"/> Approved</Badge>;
      case "REJECTED": return <Badge className={cn(base, "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 hover:bg-red-100")}><XCircle className="w-3.5 h-3.5 mr-1.5"/> Rejected</Badge>;
      case "DELIVERED": return <Badge className={cn(base, "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-100")}><Truck className="w-3.5 h-3.5 mr-1.5"/> Delivered</Badge>;
      default: return <Badge className={cn(base, "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 hover:bg-amber-100")}><Clock className="w-3.5 h-3.5 mr-1.5"/> Pending</Badge>;
    }
  };

  if (isLoading) return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-8">
      <Card className="rounded-[2rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <CardHeader className="p-8 border-b border-purple-100 dark:border-purple-900/20 bg-purple-50/50 dark:bg-purple-900/10">
          <CardTitle className="text-purple-700 dark:text-purple-400 flex items-center text-2xl font-bold tracking-tight">
            <Package className="h-6 w-6 mr-3" /> Material & Inventory Requests
          </CardTitle>
          <CardDescription className="text-base mt-2">Review, approve, and track supplies requested by the site workers.</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-zinc-950/50">
              <div className="h-16 w-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-xl text-zinc-900 dark:text-white">No Materials Requested</h3>
              <p className="text-zinc-500 mt-2 font-medium">Workers have not requested any supplies for this site.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Item Requested</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Requested By</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Delivery Proof</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                  {requests.map((req: any) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-bold text-base text-zinc-900 dark:text-white">{req.itemName}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Qty: <span className="text-zinc-700 dark:text-zinc-300 font-bold">{req.quantity} {req.unit}</span></p>
                        {req.notes && <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1 italic bg-slate-50 dark:bg-zinc-800 p-2 rounded-lg inline-block w-full">{req.notes}</p>}
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-bold text-zinc-900 dark:text-white text-base">{req.requester?.name || "Unknown Worker"}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-5">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-8 py-5">
                        {req.deliveryPhotoUrl ? (
                          <Button variant="outline" className="h-10 rounded-lg font-bold border-slate-200 dark:border-zinc-700 hover:bg-slate-50 active:scale-95" onClick={() => openPhotoViewer(req.deliveryPhotoUrl)}>
                            <ImageIcon className="h-4 w-4 mr-2" /> View Receipt
                          </Button>
                        ) : (
                          <span className="text-sm text-zinc-400 font-medium">Not delivered</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        {req.status === "PENDING" ? (
                          <div className="flex justify-end gap-3">
                            <Button 
                              variant="outline" 
                              className="h-10 rounded-lg font-bold border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30"
                              onClick={() => handleStatusUpdate(req.id, "APPROVED")}
                              disabled={updateMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              className="h-10 rounded-lg font-bold border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                              onClick={() => handleStatusUpdate(req.id, "REJECTED")}
                              disabled={updateMutation.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-zinc-400 font-medium">Action Completed</span>
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

      {/* PHOTO VIEWER MODAL */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-3xl p-8 rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Delivery Receipt / Proof</DialogTitle>
            <DialogDescription>Photo uploaded by the worker upon delivery.</DialogDescription>
          </DialogHeader>
          <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center min-h-[400px]">
            {currentPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentPhotoUrl} alt="Delivery Proof" className="max-w-full max-h-[70vh] object-contain rounded-2xl" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
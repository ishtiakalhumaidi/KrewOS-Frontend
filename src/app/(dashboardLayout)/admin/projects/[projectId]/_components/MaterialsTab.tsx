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
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function MaterialsTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);

  // 1. Fetch all material requests for this specific project
  const { data: response, isLoading } = useQuery({
    queryKey: ["project-materials", projectId],
    queryFn: () => MaterialRequestService.getProjectMaterials(projectId),
    enabled: !!projectId,
  });

  // 2. Status Update Mutation (Approve/Reject)
  const updateMutation = useMutation({
    mutationFn: MaterialRequestService.updateMaterialStatus,
    onSuccess: () => {
      toast.success("Request status updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["project-materials", projectId] });
    },
     onError: (error: any) => {
  const errors = error?.response?.data?.errorSources;

  if (errors?.length) {
    errors.forEach((err: any) => {
      toast.error(err.message);
    });
  } else {
    toast.error(error?.response?.data?.message || "Failed to update status.");
  }
}
  });

  // Helper to send FormData (since our service expects it for Multer)
  const handleStatusUpdate = (requestId: string, status: string) => {
    const fd = new FormData();
    fd.append("status", status);
    // Admins just approve/reject, they don't upload photos here
    updateMutation.mutate({ requestId, data: fd });
  };

  const openPhotoViewer = (url: string) => {
    setCurrentPhotoUrl(url);
    setIsPhotoModalOpen(true);
  };

  const requests = response?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return <Badge className="bg-blue-500 hover:bg-blue-600"><CheckCircle2 className="w-3 h-3 mr-1"/> Approved</Badge>;
      case "REJECTED": return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
      case "DELIVERED": return <Badge className="bg-green-600 hover:bg-green-700"><Truck className="w-3 h-3 mr-1"/> Delivered</Badge>;
      default: return <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 dark:bg-orange-950/30"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center border rounded-xl"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-purple-100 dark:border-purple-900/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-purple-700 dark:text-purple-400 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Material & Inventory Requests
            </CardTitle>
            <CardDescription>Review, approve, and track supplies requested by the site workers.</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center bg-zinc-50 dark:bg-zinc-900/50">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg">No Materials Requested</h3>
              <p className="text-muted-foreground text-sm">Workers have not requested any supplies for this site.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 font-medium">Item Requested</th>
                    <th className="px-6 py-3 font-medium">Requested By</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Delivery Proof</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {requests.map((req: any) => (
                    <tr key={req.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold">{req.itemName}</p>
                        <p className="text-xs text-muted-foreground">Qty: {req.quantity} {req.unit}</p>
                        {req.notes && <p className="text-xs text-zinc-500 mt-1 italic">{req.notes}</p>}
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-600 dark:text-zinc-300">
                        {req.requester?.name || "Unknown Worker"}
                        <p className="text-xs text-muted-foreground font-normal">{new Date(req.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-6 py-4">
                        {/* Show button if the worker uploaded a delivery photo */}
                        {req.deliveryPhotoUrl ? (
                          <Button variant="outline" size="sm" onClick={() => openPhotoViewer(req.deliveryPhotoUrl)}>
                            <ImageIcon className="h-3 w-3 mr-2" /> View Receipt
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not delivered</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* Only show Approve/Reject if it's PENDING */}
                        {req.status === "PENDING" ? (
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => handleStatusUpdate(req.id, "APPROVED")}
                              disabled={updateMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-red-500 text-red-600 hover:bg-red-50"
                              onClick={() => handleStatusUpdate(req.id, "REJECTED")}
                              disabled={updateMutation.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Action Completed</span>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Delivery Receipt / Proof</DialogTitle>
            <DialogDescription>Photo uploaded by the worker upon delivery.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 rounded-md overflow-hidden border bg-zinc-100 flex items-center justify-center min-h-[300px]">
            {currentPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentPhotoUrl} alt="Delivery Proof" className="max-w-full max-h-[60vh] object-contain" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
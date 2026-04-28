/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MaterialRequestService } from "@/services/materialRequest.services";
import { MemberPortalService } from "@/services/memberPortal.services"; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Package, Plus, Clock, CheckCircle2, XCircle, Truck, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function MyMaterialsPage() {
  const queryClient = useQueryClient();
  
  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({ 
    projectId: "", itemName: "", quantity: "", unit: "pieces", notes: "" 
  });

  // Fetch Requests & Projects
  const { data: requestResponse, isLoading } = useQuery({
    queryKey: ["my-materials"],
    queryFn: () => MaterialRequestService.getMyRequests(),
  });

  const { data: projectsResponse } = useQuery({
    queryKey: ["my-projects"],
    queryFn: MemberPortalService.getMyProjects,
  });

  // Create Request Mutation
  const requestMutation = useMutation({
    mutationFn: MaterialRequestService.createMaterialRequest,
    onSuccess: () => {
      toast.success("Material request submitted to management.");
      setIsRequestModalOpen(false);
      setFormData({ projectId: "", itemName: "", quantity: "", unit: "pieces", notes: "" });
      queryClient.invalidateQueries({ queryKey: ["my-materials"] });
    },
      onError: (error: any) => {
  const errors = error?.response?.data?.errorSources;

  if (errors?.length) {
    errors.forEach((err: any) => {
      toast.error(err.message);
    });
  } else {
    toast.error(error?.response?.data?.message || "Failed to submit request.");
  }
}
  });

  // Mark as Delivered Mutation
  const deliveryMutation = useMutation({
    mutationFn: MaterialRequestService.updateMaterialStatus,
    onSuccess: () => {
      toast.success("Materials marked as delivered!");
      setIsDeliveryModalOpen(false);
      setDeliveryFile(null);
      queryClient.invalidateQueries({ queryKey: ["my-materials"] });
    },
    onError: (error: any) => {
  const errors = error?.response?.data?.errorSources;

  if (errors?.length) {
    errors.forEach((err: any) => {
      toast.error(err.message);
    });
  } else {
    toast.error(error?.response?.data?.message || "Failed to log delivery.");
  }
}
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId) return toast.error("Select a site.");
    requestMutation.mutate({
      ...formData,
      quantity: Number(formData.quantity)
    });
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("status", "DELIVERED");
    if (deliveryFile) {
      fd.append("deliveryPhoto", deliveryFile); // Matches multerUpload.single("deliveryPhoto")
    }
    deliveryMutation.mutate({ requestId: selectedRequestId, data: fd });
  };

  const requests = requestResponse?.data || [];
  const projects = projectsResponse?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return <Badge className="bg-blue-500 hover:bg-blue-600"><CheckCircle2 className="w-3 h-3 mr-1"/> Approved</Badge>;
      case "REJECTED": return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
      case "DELIVERED": return <Badge className="bg-green-600 hover:bg-green-700"><Truck className="w-3 h-3 mr-1"/> Delivered</Badge>;
      default: return <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 dark:bg-orange-950/30"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Material Requests</h1>
          <p className="text-muted-foreground mt-1">Request supplies for your site and log deliveries.</p>
        </div>

        {/* REQUEST MODAL */}
        <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center text-purple-600">
                <Package className="h-5 w-5 mr-2" /> Request Materials
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRequestSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Site / Project *</Label>
                <Select value={formData.projectId} onValueChange={(val) => setFormData({ ...formData, projectId: val })}>
                  <SelectTrigger><SelectValue placeholder="Select site..." /></SelectTrigger>
                  <SelectContent>
                    {projects.map((proj: any) => (<SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Item Name *</Label>
                <Input placeholder="e.g., Cement bags" value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input placeholder="e.g., kg, bags, pieces" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea placeholder="Specific brands, sizes, or urgency..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={requestMutation.isPending}>
                {requestMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Submit Request"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center border rounded-xl"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>My Request History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center bg-zinc-50 dark:bg-zinc-900/50">
                <Package className="h-10 w-10 text-zinc-300 mb-4" />
                <h3 className="font-semibold text-lg">No materials requested</h3>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 font-medium">Item</th>
                    <th className="px-6 py-3 font-medium">Site</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {requests.map((req: any) => (
                    <tr key={req.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="px-6 py-4">
                        <p className="font-bold">{req.itemName}</p>
                        <p className="text-xs text-muted-foreground">{req.quantity} {req.unit}</p>
                      </td>
                      <td className="px-6 py-4">{req.project?.name}</td>
                      <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                      <td className="px-6 py-4 text-right">
                        {/* ONLY show "Log Delivery" if the Admin has approved it! */}
                        {req.status === "APPROVED" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-green-500 text-green-600 hover:bg-green-50"
                            onClick={() => { setSelectedRequestId(req.id); setIsDeliveryModalOpen(true); }}
                          >
                            <Truck className="h-4 w-4 mr-2"/> Log Delivery
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {/* DELIVERY MODAL (Worker logs the receipt) */}
      <Dialog open={isDeliveryModalOpen} onOpenChange={setIsDeliveryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Material Delivery</DialogTitle>
            <DialogDescription>Upload a photo of the delivery receipt or materials to verify arrival.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeliverySubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="flex items-center"><ImagePlus className="h-4 w-4 mr-2" /> Attach Receipt Photo</Label>
              <Input type="file" accept="image/*" onChange={(e) => setDeliveryFile(e.target.files?.[0] || null)} />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={deliveryMutation.isPending}>
              {deliveryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Mark as Delivered"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
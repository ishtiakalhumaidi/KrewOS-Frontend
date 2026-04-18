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
import { Loader2, Plus, PackageOpen, Package, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MaterialsTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");

  // Fetch Materials
  const { data: response, isLoading } = useQuery({
    queryKey: ["project-materials", projectId],
    queryFn: () => MaterialRequestService.getProjectMaterials(projectId),
    enabled: !!projectId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: MaterialRequestService.createMaterialRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-materials", projectId] });
      setIsModalOpen(false);
      setItemName("");
      setQuantity("");
    },
  });

  const statusMutation = useMutation({
    mutationFn: MaterialRequestService.updateMaterialStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-materials", projectId] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !quantity) return;
    createMutation.mutate({
      projectId,
      itemName,
      quantity: Number(quantity),
      unit,
    });
  };

  const materials = response?.data || [];

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center border rounded-xl"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Material Requests</CardTitle>
          <CardDescription>Track supplies requested and delivered for this site.</CardDescription>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Request Materials</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Material Request</DialogTitle>
              <DialogDescription>Submit a request for supplies needed on-site.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g., Portland Cement" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 50" required />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g., bags, tons, liters" required />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createMutation.isPending || !itemName || !quantity}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Submit Request"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="p-0">
        {materials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center bg-zinc-50 dark:bg-zinc-900/50">
            <PackageOpen className="h-8 w-8 text-zinc-400 mb-2" />
            <h3 className="font-semibold text-lg">No materials requested</h3>
            <p className="text-muted-foreground text-sm">Click the button above to request site supplies.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3 font-medium">Item</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date Requested</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {materials.map((item: any) => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-6 py-4 font-medium flex items-center">
                      <Package className="h-4 w-4 mr-2 text-zinc-400" />
                      {item.itemName}
                    </td>
                    <td className="px-6 py-4 font-semibold">{item.quantity} <span className="text-muted-foreground font-normal">{item.unit}</span></td>
                    <td className="px-6 py-4">
                      <Badge variant={item.status === "DELIVERED" ? "default" : item.status === "PENDING" ? "secondary" : "destructive"}>
                        {item.status || "PENDING"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">Update</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* 👉 Notice how we now pass projectId to satisfy Zod! */}
                          <DropdownMenuItem onClick={() => statusMutation.mutate({ requestId: item.id, projectId, status: "APPROVED" })}>
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Mark Approved
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => statusMutation.mutate({ requestId: item.id, projectId, status: "DELIVERED" })}>
                            <Package className="h-4 w-4 mr-2 text-blue-500" /> Mark Delivered
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => statusMutation.mutate({ requestId: item.id, projectId, status: "REJECTED" })}>
                            <XCircle className="h-4 w-4 mr-2" /> Reject Request
                          </DropdownMenuItem>
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
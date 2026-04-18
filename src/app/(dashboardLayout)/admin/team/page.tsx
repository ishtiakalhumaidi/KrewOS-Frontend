/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MemberService } from "@/services/member.services";
import { AuthService } from "@/services/auth.services";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Users, UserPlus, Mail, ShieldCheck, MoreVertical } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 👉 1. Import toast from sonner
import { toast } from "sonner"; 

export default function CompanyRosterPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ["company-roster"],
    queryFn: MemberService.getCompanyMembers, 
  });

  // 👉 2. The New Sonner Mutation Standard
  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) => AuthService.sendInvite(data), 
    onSuccess: () => {
      setIsModalOpen(false);
      setEmail("");
      // Replace alert() with toast.success
      toast.success("Invitation sent successfully!"); 
    },
    onError: (error: any) => {
      // Extract the backend message and fire a toast.error
      const errorMessage = error?.response?.data?.message || "Failed to send invitation. Check your plan limits.";
      toast.error(errorMessage);
    }
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address.");
      return;
    }
    // Optional: Fire a loading toast (Sonner will automatically dismiss it when success/error fires if you configure promises, but for simple use, standard triggers are fine!)
    inviteMutation.mutate({ email, role });
  };

  const members = response?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team & Employees</h1>
          <p className="text-muted-foreground">Manage your company's workforce and global permissions.</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-900 dark:bg-zinc-100">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Member</DialogTitle>
              <DialogDescription>
                Send an email invitation to a new employee. They will appear in the roster once they accept.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input 
                  type="email" 
                  placeholder="worker@company.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>System Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin (Can manage projects)</SelectItem>
                    <SelectItem value="MEMBER">Member (Standard worker)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* NOTE: We completely removed the inline red error box! */}

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Invitation"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center border rounded-xl bg-white dark:bg-zinc-900">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="p-4 text-sm font-medium text-destructive bg-destructive/10 rounded-md">
           {/* You can optionally convert this page-load error to a toast too, but inline is usually better for initial data fetching failures */}
          {(error as any)?.response?.data?.message || "Failed to load company roster."}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Global Roster</CardTitle>
            <CardDescription>Total Workforce: {members.length} Employees</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Users className="h-10 w-10 text-zinc-300 mb-4" />
                <p className="text-muted-foreground">No employees found in your company.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium">Employee</th>
                      <th className="px-6 py-3 font-medium">System Role</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {members.map((member: any) => (
                      <tr key={member.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400">
                              {member.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={member.role === "OWNER" || member.role === "ADMIN" ? "default" : "secondary"}>
                            {member.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant="outline" 
                            className={member.isActive 
                              ? "text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20" 
                              : "text-zinc-500 border-zinc-200 bg-zinc-50"
                            }
                          >
                            {member.isActive ? "Active" : "Suspended"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer">
                                <Mail className="mr-2 h-4 w-4" /> Message
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <ShieldCheck className="mr-2 h-4 w-4" /> Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={() => toast.error("Deactivation feature coming soon!")}
                              >
                                Deactivate
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
      )}
    </div>
  );
}
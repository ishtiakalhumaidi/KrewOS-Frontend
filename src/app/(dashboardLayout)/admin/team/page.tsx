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
import { Loader2, Users, UserPlus, Mail, ShieldCheck, MoreVertical, Building2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner"; 
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";

export default function CompanyRosterPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ["company-roster"],
    queryFn: MemberService.getCompanyMembers, 
  });

  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) => AuthService.sendInvite(data), 
    onSuccess: () => {
      setIsModalOpen(false);
      setEmail("");
      toast.success("Invitation sent successfully!"); 
      queryClient.invalidateQueries({ queryKey: ["company-roster"] });
    },
    onError: (error: any) => {
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
    inviteMutation.mutate({ email, role });
  };

  const members = response?.data || [];

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 max-w-7xl mx-auto pb-12 pt-4">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-bold tracking-wide text-blue-700 dark:text-blue-400 shadow-sm uppercase">
            <Building2 className="mr-2.5 h-4 w-4" /> Global Workforce
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Team & Employees
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed font-medium">
            Manage your company's workforce, invite new personnel, and set global permissions.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all active:scale-95 shrink-0">
              <UserPlus className="mr-2 h-5 w-5" />
              Invite Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-8 rounded-[2.5rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-zinc-900 dark:text-white">Invite New Member</DialogTitle>
              <DialogDescription className="text-base mt-2 font-medium">
                Send an email invitation to a new employee. They will appear in the roster once they accept.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="font-bold ml-1">Email Address</Label>
                <Input 
                  type="email" 
                  placeholder="worker@company.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="h-14 px-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:ring-blue-600 transition-all text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold ml-1">System Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-14 px-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:ring-blue-600 transition-all text-base">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="ADMIN" className="font-medium py-2.5">Admin (Can manage projects)</SelectItem>
                    <SelectItem value="MEMBER" className="font-medium py-2.5">Member (Standard worker)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={inviteMutation.isPending} className="w-full h-14 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] active:scale-95 transition-all">
                  {inviteMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Invitation"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isError ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-red-50/80 border border-red-100 text-red-800 font-medium text-center">
          {(error as any)?.response?.data?.message || "Failed to load company roster."}
        </motion.div>
      ) : (
        <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/10 border-b border-slate-100 dark:border-zinc-800/50 p-8 hidden md:block">
            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center">
              <Users className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" /> Global Roster
            </CardTitle>
            <CardDescription className="text-base mt-1">Total Workforce: <strong className="text-zinc-900 dark:text-white">{members.length}</strong> Employees</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-blue-200/50 dark:border-blue-800/50">
                  <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-extrabold text-2xl text-zinc-900 dark:text-white">No Employees Found</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg mt-2 font-medium max-w-sm">
                  You haven't added any employees to your company yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-zinc-950/50">
                    <TableRow className="border-b border-slate-100 dark:border-zinc-800 hover:bg-transparent">
                      <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Employee</TableHead>
                      <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">System Role</TableHead>
                      <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</TableHead>
                      <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</TableHead>
                    </TableRow>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                    {members.map((member: any) => (
                      <TableRow key={member.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-lg text-zinc-600 dark:text-zinc-400 shadow-sm border border-slate-200/50 dark:border-zinc-700/50">
                              {member.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-bold text-base text-zinc-900 dark:text-white">{member.name}</p>
                              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <Badge className={cn(
                            "px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0",
                            member.role === "OWNER" || member.role === "ADMIN" 
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400" 
                              : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"
                          )}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <Badge 
                            className={cn(
                              "px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0",
                              member.isActive 
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" 
                                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                            )}
                          >
                            {member.isActive ? "Active" : "Suspended"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800">
                                <MoreVertical className="h-5 w-5 text-zinc-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl p-2 w-48">
                              <DropdownMenuItem className="cursor-pointer font-medium py-2.5">
                                <Mail className="mr-3 h-4 w-4 text-zinc-400" /> Message
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer font-medium py-2.5">
                                <ShieldCheck className="mr-3 h-4 w-4 text-zinc-400" /> Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-700 cursor-pointer font-bold py-2.5 mt-1 border-t border-slate-100 dark:border-zinc-800"
                                onClick={() => toast.error("Deactivation feature coming soon!")}
                              >
                                Deactivate User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
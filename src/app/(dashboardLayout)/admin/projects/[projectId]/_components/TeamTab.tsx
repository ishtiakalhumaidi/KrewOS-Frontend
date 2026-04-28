/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectMemberService } from "@/services/projectMember.services";
import { MemberService } from "@/services/member.services"; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Users, UserPlus, HardHat, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TeamTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("WORKER");

  const { data: teamResponse, isLoading: isTeamLoading } = useQuery({
    queryKey: ["project-team", projectId],
    queryFn: () => ProjectMemberService.getProjectMembers(projectId),
    enabled: !!projectId,
  });

  const { data: companyResponse, isLoading: isCompanyLoading } = useQuery({
    queryKey: ["company-roster"],
    queryFn: MemberService.getCompanyMembers,
  });

  const assignMutation = useMutation({
    mutationFn: (data: any) => ProjectMemberService.addMember(data),
    onSuccess: () => {
      toast.success("Worker successfully assigned to the site!");
      setSelectedUserId(""); 
      queryClient.invalidateQueries({ queryKey: ["project-team", projectId] });
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) errors.forEach((err: any) => toast.error(err.message));
      else toast.error(error?.response?.data?.message || "Failed to assign worker.");
    }
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => ProjectMemberService.removeMember({projectId, userId}),
    onSuccess: () => {
      toast.success("Worker removed from the site.");
      queryClient.invalidateQueries({ queryKey: ["project-team", projectId] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to remove worker.")
  });

  const handleAssign = () => {
    if (!selectedUserId) return toast.error("Please select an employee to assign.");
    assignMutation.mutate({ projectId, userId: selectedUserId, role: selectedRole });
  };

  const teamMembers = teamResponse?.data || [];
  const allCompanyEmployees = companyResponse?.data || [];
  const availableEmployees = allCompanyEmployees.filter(
    (emp: any) => !teamMembers.some((teamMem: any) => teamMem.userId === emp.id)
  );

  if (isTeamLoading || isCompanyLoading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* ASSIGNMENT CARD */}
      <Card className="rounded-[2rem] border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-sm overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="w-full md:w-1/2 space-y-2">
              <Label className="font-bold text-indigo-900 dark:text-indigo-300 ml-1">Select Employee</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-zinc-950 border-indigo-100 dark:border-zinc-800">
                  <SelectValue placeholder="Choose someone from the company..." />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees.length === 0 ? (
                    <SelectItem value="none" disabled>All employees are already assigned!</SelectItem>
                  ) : (
                    availableEmployees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.email})</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-1/3 space-y-2">
              <Label className="font-bold text-indigo-900 dark:text-indigo-300 ml-1">Assign Site Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-zinc-950 border-indigo-100 dark:border-zinc-800">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                  <SelectItem value="SITE_MANAGER">Site Manager</SelectItem>
                  <SelectItem value="SAFETY_OFFICER">Safety Officer</SelectItem>
                  <SelectItem value="WORKER">Standard Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAssign} 
              disabled={assignMutation.isPending || !selectedUserId}
              className="w-full md:w-auto h-12 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] transition-all active:scale-95"
            >
              {assignMutation.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <UserPlus className="h-5 w-5 mr-2" />}
              Assign to Site
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ACTIVE TEAM ROSTER */}
      <Card className="rounded-[2rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/50">
          <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center tracking-tight">
            <Users className="h-6 w-6 mr-3 text-indigo-600 dark:text-indigo-400" /> Active Site Personnel
          </CardTitle>
          <CardDescription className="text-base mt-2">Total personnel assigned to this project: <span className="font-bold text-zinc-900 dark:text-white">{teamMembers.length}</span></CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {teamMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-zinc-950/50">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                <HardHat className="h-8 w-8 text-zinc-400" />
              </div>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">No personnel assigned</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Name</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Email</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Site Role</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                  {teamMembers.map((member: any) => (
                    <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-8 py-5 font-bold text-zinc-900 dark:text-white flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mr-4 text-sm shadow-sm text-zinc-600 dark:text-zinc-400">
                          {member.user?.name?.charAt(0) || "U"}
                        </div>
                        {member.user?.name || "Unknown"}
                      </td>
                      <td className="px-8 py-5 text-zinc-600 dark:text-zinc-300 font-medium">
                        {member.user?.email}
                      </td>
                      <td className="px-8 py-5">
                        <Badge className={cn("px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0", member.role === "PROJECT_MANAGER" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400" : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300")}>
                          {member.role.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Button 
                          variant="ghost" 
                          className="h-10 w-10 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => removeMutation.mutate(member.user.id)}
                          disabled={removeMutation.isPending}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
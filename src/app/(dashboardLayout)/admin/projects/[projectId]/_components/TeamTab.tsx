/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectMemberService } from "@/services/projectMember.services";
import { MemberService } from "@/services/member.services"; // Uses your global roster service!

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Users, UserPlus, HardHat, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function TeamTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("WORKER");

  // 1. Fetch the team currently assigned to this project
  const { data: teamResponse, isLoading: isTeamLoading } = useQuery({
    queryKey: ["project-team", projectId],
    queryFn: () => ProjectMemberService.getProjectMembers(projectId),
    enabled: !!projectId,
  });

  // 2. Fetch ALL company members so the Admin can assign them
  const { data: companyResponse, isLoading: isCompanyLoading } = useQuery({
    queryKey: ["company-roster"],
    queryFn: MemberService.getCompanyMembers,
  });

  // 3. Mutation to assign a member
  const assignMutation = useMutation({
    mutationFn: (data: any) => ProjectMemberService.addMember(data),
    onSuccess: () => {
      toast.success("Worker successfully assigned to the site!");
      setSelectedUserId(""); // Reset dropdown
      queryClient.invalidateQueries({ queryKey: ["project-team", projectId] });
    },
      onError: (error: any) => {
  const errors = error?.response?.data?.errorSources;

  if (errors?.length) {
    errors.forEach((err: any) => {
      toast.error(err.message);
    });
  } else {
    toast.error(error?.response?.data?.message || "Failed to assign worker.");
  }
}
  });

  // 4. Mutation to kick a member
  const removeMutation = useMutation({
    mutationFn: (userId: string) => ProjectMemberService.removeMember({projectId, userId}),
    onSuccess: () => {
      toast.success("Worker removed from the site.");
      queryClient.invalidateQueries({ queryKey: ["project-team", projectId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to remove worker.");
    }
  });

  const handleAssign = () => {
    if (!selectedUserId) {
      toast.error("Please select an employee to assign.");
      return;
    }
    assignMutation.mutate({ projectId, userId: selectedUserId, role: selectedRole });
  };

  const teamMembers = teamResponse?.data || [];
  const allCompanyEmployees = companyResponse?.data || [];

  // Filter out employees who are already on the team so we don't assign them twice
  const availableEmployees = allCompanyEmployees.filter(
    (emp: any) => !teamMembers.some((teamMem: any) => teamMem.userId === emp.id)
  );

  if (isTeamLoading || isCompanyLoading) {
    return <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* ASSIGNMENT CARD */}
      <Card className="shadow-sm border-blue-100 bg-blue-50/30 dark:border-blue-900/50 dark:bg-blue-950/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="w-full md:w-1/2 space-y-2">
              <Label>Select Employee</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="bg-white dark:bg-zinc-950">
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
              <Label>Assign Site Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="bg-white dark:bg-zinc-950">
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
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {assignMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Assign to Site
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ACTIVE TEAM ROSTER */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" /> Active Site Personnel
          </CardTitle>
          <CardDescription>Total personnel assigned to this project: {teamMembers.length}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {teamMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center bg-zinc-50 dark:bg-zinc-900/50">
              <HardHat className="h-8 w-8 text-zinc-400 mb-2" />
              <p className="text-muted-foreground">No personnel assigned to this site yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Site Role</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {teamMembers.map((member: any) => (
                    <tr key={member.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="px-6 py-4 font-medium flex items-center">
                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold mr-3 text-zinc-600 dark:text-zinc-400">
                          {member.user?.name?.charAt(0) || "U"}
                        </div>
                        {member.user?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {member.user?.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={member.role === "PROJECT_MANAGER" ? "default" : "secondary"}>
                          {member.role.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeMutation.mutate(member.user.id)}
                          disabled={removeMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
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
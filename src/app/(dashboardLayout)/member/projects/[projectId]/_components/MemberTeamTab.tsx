/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectMemberService } from "@/services/projectMember.services";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, UserMinus } from "lucide-react";
import { toast } from "sonner";

export default function MemberTeamTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();

  const { data: teamResponse, isLoading } = useQuery({
    queryKey: ["project-team", projectId],
    queryFn: () => ProjectMemberService.getProjectMembers(projectId),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => ProjectMemberService.removeMember({projectId, userId}),
    onSuccess: () => {
      toast.success("Team member removed from site.");
      queryClient.invalidateQueries({ queryKey: ["project-team", projectId] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to remove member.")
  });

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10 text-primary" />;

  const team = teamResponse?.data || [];

  return (
    <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 mt-4">
      <CardContent className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Site Member</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {team.map((member: any) => (
              <tr key={member.userId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="px-6 py-4 flex items-center space-x-3">
                  <Avatar className="h-8 w-8"><AvatarFallback>{member.user?.name?.charAt(0)}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-bold">{member.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="secondary">{member.role.replace("_", " ")}</Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  {/* Prevent managers from removing themselves! */}
                  {member.role !== "PROJECT_MANAGER" && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm("Remove this member from the site?")) removeMutation.mutate(member.userId);
                      }}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
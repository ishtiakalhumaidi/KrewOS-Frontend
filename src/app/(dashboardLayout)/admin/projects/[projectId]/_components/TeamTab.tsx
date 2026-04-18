/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { ProjectMemberService } from "@/services/projectMember.services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Users, ShieldAlert } from "lucide-react";

export default function TeamTab({ projectId }: { projectId: string }) {
  const { data: membersResponse, isLoading, isError } = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: () => ProjectMemberService.getProjectMembers(projectId),
    enabled: !!projectId,
  });
  console.log(membersResponse);

  const members = membersResponse?.data || [];

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center border rounded-xl bg-white dark:bg-zinc-900">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md flex items-center">
        <ShieldAlert className="h-4 w-4 mr-2" />
        Failed to load team members.
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Roster</CardTitle>
          <CardDescription>Managers and workers assigned to this site.</CardDescription>
        </div>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Assign Member
        </Button>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
            <Users className="h-8 w-8 text-zinc-400 mb-2" />
            <h3 className="font-semibold text-lg">No team members yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Assign workers and managers to this project so they can access the site data.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member: any) => (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* Avatar Placeholder */}
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {member.user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="font-medium">{member.user?.name || "Unknown User"}</p>
                    <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={member.projectRole === "PROJECT_MANAGER" ? "default" : "secondary"}>
                    {member.role.replace("_", " ")}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
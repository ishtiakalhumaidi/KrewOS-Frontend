/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldAlert } from "lucide-react";
import { httpClient } from "@/lib/axios/httpClient";

export default function AdminIncidentsPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["all-incidents"],
    queryFn: () => httpClient.get("/incidents"),
  });

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );

  const incidents = response?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-red-600">
          Safety Incidents
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and manage reported hazards and accidents across all projects.
        </p>
      </div>

      <Card className="border-red-100">
        <CardHeader className="bg-red-50/50">
          <CardTitle className="flex items-center text-red-700">
            <ShieldAlert className="w-5 h-5 mr-2" /> Incident Log
          </CardTitle>
          <CardDescription>
            Immediate attention required for high-severity reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Reported</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident: any) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {incident.project?.name || "N/A"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {incident.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        incident.severity === "HIGH"
                          ? "border-red-500 text-red-600 bg-red-50"
                          : incident.severity === "MEDIUM"
                            ? "border-amber-500 text-amber-600 bg-amber-50"
                            : "border-green-500 text-green-600 bg-green-50"
                      }
                    >
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="textce">
                    <Badge
                      variant={
                        incident.isResolved === true ? "default" : "secondary"
                      }
                    >
                      {incident.isResolved === true ? "Resolved" : "Unresolved"     }
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {incidents.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No safety incidents reported! 🎉
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

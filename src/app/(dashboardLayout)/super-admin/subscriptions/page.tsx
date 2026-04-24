/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/lib/axios/httpClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, ReceiptText } from "lucide-react";
import { BillingService } from "@/services/billing.services";

export default function SuperAdminBillingHistoryPage() {
  const [page, setPage] = useState(1);
  const limit = 15;

const { data: response, isLoading } = useQuery({
    queryKey: ["platform-payments", page],
    
    queryFn: () => BillingService.getPlatformHistory({ page, limit }),
  });

  const payments = response?.data?.data || [];
  const meta = response?.data?.meta;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Transaction Log</h1>
        <p className="text-muted-foreground mt-1">Monitor all Stripe payments and subscription renewals across KrewOS.</p>
      </div>

      <Card>
        <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b">
          <CardTitle className="flex items-center text-lg"><ReceiptText className="w-5 h-5 mr-2" /> Recent Transactions</CardTitle>
          <CardDescription>Real-time feed of all successful platform charges.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 py-4">Transaction ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Date Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : payments.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No transactions found.</TableCell></TableRow>
              ) : (
                payments.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground pl-6">{payment.stripePaymentId}</TableCell>
                    <TableCell className="font-medium">{payment.company?.name || "Unknown Company"}</TableCell>
                    <TableCell className="font-bold text-green-600 dark:text-green-500">
                      ${(payment.amountCents / 100).toFixed(2)} {payment.currency.toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 shadow-none hover:bg-green-100">Paid</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 text-sm text-muted-foreground">
                      {new Date(payment.paidAt || payment.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing page {meta.page} of {meta.totalPages} ({meta.total} total payments)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <Button variant="outline" size="sm" disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
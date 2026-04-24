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
import { Loader2, ReceiptText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { httpClient } from "@/lib/axios/httpClient";

export default function PaymentHistoryPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["payment-history"],
    queryFn: () => httpClient.get("/billing/history"),
  });

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );

  const payments = response?.data || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground mt-1">
          View your past subscription receipts and transactions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ReceiptText className="w-5 h-5 mr-2" /> Billing Invoices
          </CardTitle>
          <CardDescription>
            All payments made by your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment: any) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {new Date(
                      payment.paidAt || payment.createdAt,
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${(payment.amountCents / 100).toFixed(2)}{" "}
                    {payment.currency.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Paid
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {payment.stripePaymentId}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-2" /> PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No payment history found.
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

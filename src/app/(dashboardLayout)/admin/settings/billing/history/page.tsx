/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ReceiptText, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { httpClient } from "@/lib/axios/httpClient";
import { motion } from "framer-motion";

export default function PaymentHistoryPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["payment-history"],
    queryFn: () => httpClient.get("/billing/history"),
  });

  if (isLoading) return <div className="flex h-[60vh] justify-center items-center"><Loader2 className="animate-spin w-10 h-10 text-blue-600" /></div>;

  const payments = response?.data || [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-5xl mx-auto space-y-8 pb-12">
      
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Payment History</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium">View your past subscription receipts and secure transactions.</p>
      </div>

      <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/10">
          <CardTitle className="flex items-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            <ReceiptText className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" /> Billing Invoices
          </CardTitle>
          <CardDescription className="text-base mt-2">All payments successfully processed by your workspace.</CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-6">
                <ReceiptText className="h-10 w-10 text-zinc-400" />
              </div>
              <h3 className="font-extrabold text-2xl text-zinc-900 dark:text-white">No payment history found</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg mt-2 max-w-sm font-medium">You have not made any premium subscription payments yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-zinc-950/50">
                  <TableRow className="border-b border-slate-100 dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Date</TableHead>
                    <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Amount</TableHead>
                    <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</TableHead>
                    <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Transaction ID</TableHead>
                    <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: any) => (
                    <TableRow key={payment.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                      <TableCell className="px-8 py-5 text-sm font-bold text-zinc-900 dark:text-white">
                        {new Date(payment.paidAt || payment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-8 py-5 font-bold text-base text-zinc-900 dark:text-white">
                        ${(payment.amountCents / 100).toFixed(2)} <span className="text-sm text-zinc-500">{payment.currency.toUpperCase()}</span>
                      </TableCell>
                      <TableCell className="px-8 py-5">
                        <Badge className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 shadow-none border-0">
                          <CheckCircle2 className="w-3 h-3 mr-1.5" /> Paid
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 py-5 text-xs text-zinc-500 font-mono">
                        {payment.stripePaymentId}
                      </TableCell>
                      <TableCell className="px-8 py-5 text-right">
                        <Button variant="outline" className="h-10 rounded-xl font-bold border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 transition-all">
                          <Download className="w-4 h-4 mr-2" /> PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
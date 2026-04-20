import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight">Payment Successful!</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        Thank you for upgrading. Your workspace limits have been instantly increased, and a receipt has been emailed to you.
      </p>
      <Link href="/dashboard">
        <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
          Return to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
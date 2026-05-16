import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ApplicationSuccess() {
  return (
    <div className="flex flex-col items-center text-center py-6 space-y-4">
      <CheckCircle2 className="h-16 w-16 text-green-500" />
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-slate-800">
          Application Submitted!
        </h3>
        <p className="text-slate-500 text-sm max-w-xs">
          Your loan application has been submitted successfully. Our team will
          review it shortly.
        </p>
      </div>
      <Button asChild className="mt-2">
        <Link href="/loan">View Application Status</Link>
      </Button>
    </div>
  );
}
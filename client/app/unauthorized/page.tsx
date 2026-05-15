import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <ShieldX className="h-14 w-14 text-red-400 mb-4" />
      <h1 className="text-2xl font-semibold text-slate-800 mb-2">
        Access Denied
      </h1>
      <p className="text-slate-500 mb-6 max-w-sm">
        You do not have permission to view this page.
      </p>
      <Button asChild>
        <Link href="/login">Back to Login</Link>
      </Button>
    </main>
  );
}
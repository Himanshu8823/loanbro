import { ReactNode } from "react";
import { BorrowerNavbar } from "@/components/borrower/navbar/borrower-navbar";

export default function BorrowerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <BorrowerNavbar />
      <div className="flex-1">{children}</div>
    </div>
  );
}

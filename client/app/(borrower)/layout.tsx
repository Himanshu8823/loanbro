import { ReactNode } from "react";
import { BorrowerShell } from "@/components/borrower/shell/borrower-shell";

export default function BorrowerLayout({ children }: { children: ReactNode }) {
  return <BorrowerShell>{children}</BorrowerShell>;
}

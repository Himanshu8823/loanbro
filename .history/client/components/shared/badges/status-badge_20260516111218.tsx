import { Badge } from "@/components/ui/badge";
import { LoanStatus } from "@/types/loan.types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: LoanStatus;
}

const STATUS_CONFIG: Record<
  LoanStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-600 hover:bg-slate-100",
  },
  applied: {
    label: "Applied",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
  sanctioned: {
    label: "Sanctioned",
    className: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  disbursed: {
    label: "Disbursed",
    className: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  },
  closed: {
    label: "Closed",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge className={cn("font-medium text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}
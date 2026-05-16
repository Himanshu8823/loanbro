"use client";

import { useMemo } from "react";
import { formatDate } from "@/lib/utils";
import { SalesLead } from "@/types/loan.types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeadsTableProps {
  leads: SalesLead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  // Memoized sort — applied leads go to bottom
  const sorted = useMemo(
    () => [...leads].sort((a, b) => Number(a.hasApplied) - Number(b.hasApplied)),
    [leads]
  );

  if (leads.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        No leads found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Name</TableHead>
            <TableHead>User Code</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((lead) => (
            <TableRow key={lead._id} className="hover:bg-slate-50">
              <TableCell className="font-medium text-slate-800">
                {lead.fullName}
              </TableCell>
              <TableCell className="text-slate-500 text-xs">
                {lead.userCode}
              </TableCell>
              <TableCell className="text-slate-600">{lead.email}</TableCell>
              <TableCell className="text-slate-600">
                {lead.phoneNumber}
              </TableCell>
              <TableCell className="text-slate-500 text-sm">
                {formatDate(lead.createdAt)}
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    lead.hasApplied
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                  }
                >
                  {lead.hasApplied ? "Applied" : "Not Applied"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Banknote,
  CreditCard,
  FileText,
  X,
} from "lucide-react";
import { useAuthContext } from "@/context/auth-context";
import { ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Role } from "@/types/auth.types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: Role[];
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard/admin",
    icon: <LayoutDashboard className="h-4 w-4" />,
    roles: [ROLES.ADMIN],
    children: [
      { label: "All Loans", href: "/dashboard/admin/loans" },
      { label: "Sales Leads", href: "/dashboard/sales/leads" },
      { label: "Applications", href: "/dashboard/sanction/loans" },
      { label: "Disbursement", href: "/dashboard/disbursement/loans" },
      { label: "Collection", href: "/dashboard/collection/loans" },
    ],
  },
  {
    label: "Overview",
    href: "/dashboard/sales",
    icon: <Users className="h-4 w-4" />,
    roles: [ROLES.SALES],
    children: [{ label: "Leads", href: "/dashboard/sales/leads" }],
  },
  {
    label: "Overview",
    href: "/dashboard/sanction",
    icon: <CheckSquare className="h-4 w-4" />,
    roles: [ROLES.SANCTION],
    children: [{ label: "Applications", href: "/dashboard/sanction/loans" }],
  },
  {
    label: "Overview",
    href: "/dashboard/disbursement",
    icon: <Banknote className="h-4 w-4" />,
    roles: [ROLES.DISBURSEMENT],
    children: [{ label: "Loans", href: "/dashboard/disbursement/loans" }],
  },
  {
    label: "Overview",
    href: "/dashboard/collection",
    icon: <CreditCard className="h-4 w-4" />,
    roles: [ROLES.COLLECTION],
    children: [{ label: "Loans", href: "/dashboard/collection/loans" }],
  },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthContext();

  const visibleItems = NAV_ITEMS.filter(
    (item) => user?.role && item.roles.includes(user.role as Role)
  );

  const roleLabel: Record<string, string> = {
    [ROLES.ADMIN]: "Admin",
    [ROLES.SALES]: "Sales",
    [ROLES.SANCTION]: "Sanction",
    [ROLES.DISBURSEMENT]: "Disbursement",
    [ROLES.COLLECTION]: "Collection",
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 flex-shrink-0">
          <div>
            <p className="font-bold text-slate-800 text-base tracking-tight">LMS</p>
            <p className="text-xs text-slate-400 capitalize">
              {user?.role ? roleLabel[user.role] : ""} Portal
            </p>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isParentActive = pathname === item.href;

            return (
              <div key={item.href}>
                {/* Parent link */}
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isParentActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>

                {/* Children */}
                {item.children && (
                  <div className="mt-0.5 space-y-0.5 pl-0">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                            isChildActive
                              ? "bg-primary/10 text-primary"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-slate-200 flex-shrink-0">
          <p className="text-xs font-medium text-slate-700 truncate">
            {user?.fullName}
          </p>
          <p className="text-xs text-slate-400">{user?.userCode}</p>
        </div>
      </aside>

      <div className="hidden md:block w-64 flex-shrink-0" />
    </>
  );
}
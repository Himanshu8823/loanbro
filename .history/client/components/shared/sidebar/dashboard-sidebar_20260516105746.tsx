"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  CheckSquare,
  Banknote,
  CreditCard,
  LayoutDashboard,
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
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Admin",
    href: "/dashboard/admin",
    icon: <LayoutDashboard className="h-4 w-4" />,
    roles: [ROLES.ADMIN],
  },
  {
    label: "Sales",
    href: "/dashboard/sales",
    icon: <Users className="h-4 w-4" />,
    roles: [ROLES.SALES, ROLES.ADMIN],
  },
  {
    label: "Sanction",
    href: "/dashboard/sanction",
    icon: <CheckSquare className="h-4 w-4" />,
    roles: [ROLES.SANCTION, ROLES.ADMIN],
  },
  {
    label: "Disbursement",
    href: "/dashboard/disbursement",
    icon: <Banknote className="h-4 w-4" />,
    roles: [ROLES.DISBURSEMENT, ROLES.ADMIN],
  },
  {
    label: "Collection",
    href: "/dashboard/collection",
    icon: <CreditCard className="h-4 w-4" />,
    roles: [ROLES.COLLECTION, ROLES.ADMIN],
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

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out",
          "md:translate-x-0 md:static md:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
          <span className="font-semibold text-slate-800 text-lg tracking-tight">
            LMS
          </span>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded text-slate-400 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">Logged in as</p>
          <p className="text-sm font-medium text-slate-700 truncate">
            {user?.fullName}
          </p>
          <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
        </div>
      </aside>
    </>
  );
}
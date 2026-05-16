"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "@/context/auth-context";
import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/shared/modals/confirm-modal";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/home" },
  { label: "My Loans", href: "/loan" },
  { label: "New Application", href: "/application" },
  { label: "Profile", href: "/profile" },
];

interface BorrowerNavbarProps {
  onMenuClick?: () => void;
}

export function BorrowerNavbar({ onMenuClick }: BorrowerNavbarProps) {
  const pathname = usePathname();
  const { user } = useAuthContext();
  const { mutate: logout } = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 py-3 md:px-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="font-bold text-lg text-slate-800">
              LMS
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* User & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-800">{user?.fullName}</p>
                <p className="text-xs text-slate-500">Borrower</p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowLogoutConfirm(true)}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5 text-slate-600" />
                ) : (
                  <Menu className="h-5 w-5 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-slate-100 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Logout"
        description="Are you sure you want to logout from your account?"
        confirmLabel="Logout"
        variant="destructive"
      />
    </>
  );
}

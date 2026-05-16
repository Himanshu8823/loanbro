"use client";

import { useAuthContext } from "@/context/auth-context";
import { PageLoader } from "@/components/shared/loaders/page-loader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, FileText } from "lucide-react";
import { ROLES } from "@/lib/constants";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthContext();

  if (!isAuthenticated || !user) {
    return <PageLoader />;
  }

  const roleLabels: Record<string, string> = {
    [ROLES.BORROWER]: "Borrower",
    [ROLES.SALES]: "Sales Officer",
    [ROLES.SANCTION]: "Sanction Officer",
    [ROLES.DISBURSEMENT]: "Disbursement Officer",
    [ROLES.COLLECTION]: "Collection Officer",
    [ROLES.ADMIN]: "Administrator",
  };

  const roleColors: Record<string, string> = {
    [ROLES.BORROWER]: "bg-blue-100 text-blue-800",
    [ROLES.SALES]: "bg-purple-100 text-purple-800",
    [ROLES.SANCTION]: "bg-green-100 text-green-800",
    [ROLES.DISBURSEMENT]: "bg-orange-100 text-orange-800",
    [ROLES.COLLECTION]: "bg-red-100 text-red-800",
    [ROLES.ADMIN]: "bg-slate-100 text-slate-800",
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-500 mt-1">View your account information.</p>
        </div>

        {/* Profile Card */}
        <Card className="p-6 space-y-6 border-slate-200">
          {/* Basic Info */}
          <div className="flex items-start justify-between pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">{user.fullName}</h2>
              <p className="text-sm text-slate-500 mt-1">{user.userCode}</p>
            </div>
            <Badge className={`${roleColors[user.role]} border-0`}>
              {roleLabels[user.role]}
            </Badge>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Email Address</p>
                  <p className="text-slate-800 font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Phone Number</p>
                  <p className="text-slate-800 font-medium">
                    {user.phoneNumber || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Borrower-Specific Info */}
          {user.role === ROLES.BORROWER && (
            <>
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">PAN Number</p>
                      <p className="text-slate-800 font-medium">
                        {user.panNumber || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Address</p>
                      <p className="text-slate-800 font-medium">
                        {user.address?.street && (
                          <>
                            {user.address.street}, {user.address.city},{" "}
                            {user.address.state} {user.address.pincode}
                          </>
                        )}
                        {!user.address?.street && "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Account Status */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
              Account Status
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-slate-700">Active</p>
            </div>
          </div>
        </Card>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            For profile updates, please contact customer support or reach out to your loan officer.
          </p>
        </div>
      </div>
    </main>
  );
}

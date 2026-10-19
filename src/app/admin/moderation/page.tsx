"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { useCommunity } from "@/context/CommunityContext";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  UserX,
  XCircle,
  Laptop,
  Check,
} from "lucide-react";

export default function AdminModerationPage() {
  const { reports, adminReviewReport } = useCommunity();
  const { user, securityLogs } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState<"reports" | "security">("reports");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 py-12 text-center space-y-3">
          <Shield className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Administrator Access Required</h2>
          <p className="text-xs text-gray-500">
            Use the user switcher in the top navigation bar to select the &quot;Admin Elevance&quot; or &quot;Amar Choubey (Admin)&quot; account.
          </p>
        </main>
      </div>
    );
  }

  const pendingReports = reports.filter((r) => r.status === "pending");
  const resolvedReports = reports.filter((r) => r.status !== "pending");

  const handleResolve = (reportId: string, action: "resolve_delete" | "dismiss" | "suspend_user") => {
    adminReviewReport(reportId, action);
    if (action === "resolve_delete") {
      showToast("Post removed and -10 reputation points deducted from author.");
    } else if (action === "suspend_user") {
      showToast("User penalized (-50 points) and content removed.");
    } else {
      showToast("Report dismissed.");
    }
  };

  return (
    <div className="flex w-full">
      <Sidebar />

      <main className="flex-1 py-6 md:px-6 space-y-6 min-w-0">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-gray-700 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Platform Administration & Trust</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              Moderation & Security Center
            </h1>
            <p className="text-xs text-gray-500">
              Review flagged content, penalize repeat offenders, and inspect security audit records.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveAdminTab("reports")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeAdminTab === "reports"
                  ? "bg-white dark:bg-gray-900 text-red-600 shadow-xs"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Flagged Content ({pendingReports.length})
            </button>
            <button
              onClick={() => setActiveAdminTab("security")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeAdminTab === "security"
                  ? "bg-white dark:bg-gray-900 text-red-600 shadow-xs"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Audit Logs ({securityLogs.length})
            </button>
          </div>
        </div>

        {/* TAB 1: FLAGGED CONTENT */}
        {activeAdminTab === "reports" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center justify-between">
                <span>Pending Community Reports</span>
                <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 rounded-full">
                  {pendingReports.length} Needs Review
                </span>
              </h3>

              {pendingReports.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
                  <p className="font-semibold text-gray-700 dark:text-gray-200">The moderation queue is clean!</p>
                  <p>All reported posts have been resolved or dismissed.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/10 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-600 uppercase text-[10px] bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded-full">
                            Reason: {report.reason}
                          </span>
                          <span className="text-gray-400">
                            Reported by <strong>{report.reporterName}</strong> on {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500">
                          Author: <strong className="text-gray-900 dark:text-white">{report.postAuthorName}</strong>
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border text-xs text-gray-800 dark:text-gray-200 italic">
                        &quot;{report.postSnippet}...&quot;
                      </div>

                      {report.details && (
                        <p className="text-[11px] text-gray-500">
                          <strong>Reporter Note:</strong> {report.details}
                        </p>
                      )}

                      {/* Admin Actions */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => handleResolve(report.id, "dismiss")}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-semibold text-gray-700"
                        >
                          Dismiss Flag
                        </button>
                        <button
                          onClick={() => handleResolve(report.id, "resolve_delete")}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Content (-10 Rep Penalty)</span>
                        </button>
                        <button
                          onClick={() => handleResolve(report.id, "suspend_user")}
                          className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Suspend Repeat Offender (-50 Pts)</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resolved Reports History */}
            {resolvedReports.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Resolved Reports Archive</h4>
                <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {resolvedReports.map((r) => (
                    <div key={r.id} className="py-2.5 flex items-center justify-between text-gray-500">
                      <span>Report #{r.id} ({r.reason}) by {r.reporterName}</span>
                      <span className="capitalize font-bold text-gray-700 dark:text-gray-300">Status: {r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SECURITY MONITORING AUDIT LOGS */}
        {activeAdminTab === "security" && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-emerald-600" />
              <span>Full System Authentication & Security Audit Logs</span>
            </h3>
            <p className="text-xs text-gray-500">
              Captures all user authentication records, device information, IP geolocations, and password reset actions.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4 rounded-l-xl">Timestamp</th>
                    <th className="py-2.5 px-4">User</th>
                    <th className="py-2.5 px-4">Event</th>
                    <th className="py-2.5 px-4">Device & OS</th>
                    <th className="py-2.5 px-4">IP Address</th>
                    <th className="py-2.5 px-4 rounded-r-xl">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {securityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="py-3 px-4 font-mono text-gray-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                        {log.userName}
                      </td>
                      <td className="py-3 px-4 font-semibold capitalize text-primary">
                        {log.action.replace("_", " ")}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {log.browser} ({log.os})
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">
                        {log.ip}
                      </td>
                      <td className="py-3 px-4 text-gray-500 italic">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <RightSidebar />
    </div>
  );
}

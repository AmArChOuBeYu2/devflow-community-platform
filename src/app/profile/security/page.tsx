"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Laptop,
  Shield,
  Smartphone,
  Globe,
  Clock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Mail,
  KeyRound,
  ShieldCheck,
  Settings,
} from "lucide-react";

export default function SecurityPage() {
  const { user, sessions, securityLogs, revokeSession, revokeAllOtherSessions, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [expiryMinutes, setExpiryMinutes] = useState(user?.sessionExpiryMinutes || 60);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [simulatedAlert, setSimulatedAlert] = useState(false);

  if (!user) {
    return (
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 py-12 text-center space-y-3">
          <Shield className="w-12 h-12 text-gray-400 mx-auto" />
          <h2 className="text-xl font-bold">Please log in to manage security sessions</h2>
          <Link href="/login" className="text-primary hover:underline text-xs font-bold">
            Sign In
          </Link>
        </main>
      </div>
    );
  }

  const handleSaveExpiry = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ sessionExpiryMinutes: Number(expiryMinutes) });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSimulateNewDeviceAlert = () => {
    setSimulatedAlert(true);
    setTimeout(() => setSimulatedAlert(false), 5000);
  };

  return (
    <div className="flex w-full">
      <Sidebar />

      <main className="flex-1 py-6 md:px-6 space-y-6 min-w-0">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200 dark:border-gray-800 space-y-1">
          <div className="flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Task 6: Device Security & Session Management</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {t.security.title}
          </h1>
          <p className="text-xs text-gray-500">
            Monitor active device sessions, remote revocation, trusted device rules, and login security audit logs.
          </p>
        </div>

        {/* Simulated Email Notification Banner */}
        {simulatedAlert && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-100 flex items-start gap-3 shadow-md animate-in fade-in">
            <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Security Alert Email Sent</p>
              <p className="mt-0.5 text-blue-700 dark:text-blue-300">
                &quot;New login detected from Safari on iOS (Bengaluru, India). If this was not you, revoke the session immediately below.&quot;
              </p>
            </div>
          </div>
        )}

        {/* Active Sessions List */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Laptop className="w-5 h-5 text-primary" />
                <span>Active Device Sessions ({sessions.length})</span>
              </h3>
              <p className="text-xs text-gray-500">
                Devices currently authenticated into your DevFlow account.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateNewDeviceAlert}
                className="px-3 py-1.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-semibold"
              >
                Test New Device Email Alert
              </button>
              <button
                onClick={revokeAllOtherSessions}
                className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition"
              >
                Revoke All Others
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                  s.isCurrent
                    ? "border-green-300 bg-green-50/20 dark:bg-green-950/20 shadow-xs"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30"
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    {s.deviceType === "Mobile" ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{s.browser}</h4>
                      {s.isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
                          Current Session
                        </span>
                      )}
                      {s.isTrusted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                          Trusted Device
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>OS: <strong className="text-gray-700 dark:text-gray-300">{s.os}</strong></span>
                      <span>IP Address: <strong className="font-mono text-gray-700 dark:text-gray-300">{s.ip}</strong></span>
                      <span>Location: <strong className="text-gray-700 dark:text-gray-300">{s.location}</strong></span>
                    </div>

                    <span className="text-[11px] text-gray-400 block">
                      Session started: {new Date(s.createdAt).toLocaleDateString()} at {new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {!s.isCurrent && (
                  <button
                    onClick={() => revokeSession(s.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center gap-1.5 self-end sm:self-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Remotely</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Configurable Session Auto-Expiry */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Configurable Session Inactivity Expiry
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            Automatically revoke sessions after a configurable period of inactivity to prevent unauthorized session reuse.
          </p>

          <form onSubmit={handleSaveExpiry} className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(Number(e.target.value))}
              className="w-full sm:w-64 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={15}>15 Minutes of inactivity</option>
              <option value={30}>30 Minutes of inactivity</option>
              <option value={60}>1 Hour of inactivity</option>
              <option value={1440}>24 Hours of inactivity</option>
              <option value={10080}>7 Days of inactivity</option>
            </select>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-xs transition"
            >
              Save Duration
            </button>
            {saveSuccess && (
              <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </form>
        </div>

        {/* Security Audit Activity Logs */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>Security Audit Activity Log</span>
              </h3>
              <p className="text-xs text-gray-500">
                Permanent audit trail capturing browser, OS, device, IP, and event details.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4 rounded-l-xl">Timestamp</th>
                  <th className="py-2.5 px-4">Event Type</th>
                  <th className="py-2.5 px-4">Browser & OS</th>
                  <th className="py-2.5 px-4">IP & Location</th>
                  <th className="py-2.5 px-4 rounded-r-xl">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {securityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                    <td className="py-3 px-4 font-mono text-gray-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 px-4 font-bold capitalize text-primary">
                      {log.action.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {log.browser} ({log.os})
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">
                      {log.ip} • {log.location}
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
      </main>

      <RightSidebar />
    </div>
  );
}

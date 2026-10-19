"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  LogIn,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResetSuccess = searchParams.get("reset") === "success";

  const { login, users } = useAuth();
  const { t } = useLanguage();

  const [emailOrPhone, setEmailOrPhone] = useState("sc62970@gmail.com");
  const [password, setPassword] = useState("password");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(
    isResetSuccess ? "Password updated successfully! Please sign in." : ""
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const res = login(emailOrPhone, rememberDevice, password);
    if (res.success) {
      router.push("/");
    } else {
      setErrorMsg(res.message || "Invalid credentials.");
    }
  };

  const quickLoginAs = (email: string) => {
    login(email, true);
    router.push("/");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#da680f] to-primary text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
            <LogIn className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {t.auth.loginTitle}
          </h1>
          <p className="text-xs text-gray-500">
            Sign in to access your questions, community feed, and subscriptions.
          </p>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-green-50 text-green-800 border border-green-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-800 border border-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-xl space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                {t.auth.emailOrPhone}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="name@example.com or +91 98765..."
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  {t.auth.password}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  {t.auth.forgotPasswordLink}
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Remember this trusted device</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold bg-primary hover:bg-primary-dark text-white text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{t.auth.loginBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Evaluator 1-Click Login buttons */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block text-center">
              Evaluator 1-Click Test Accounts
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickLoginAs("sc62970@gmail.com")}
                className="p-2 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900 font-semibold text-[11px] transition text-left"
              >
                Amar (Bronze, 125 pts)
              </button>
              <button
                type="button"
                onClick={() => quickLoginAs("sarah.chen@techdev.io")}
                className="p-2 rounded-xl border border-yellow-200 bg-yellow-50/50 hover:bg-yellow-100/60 text-yellow-900 font-semibold text-[11px] transition text-left"
              >
                Sarah (Gold, 1480 pts)
              </button>
              <button
                type="button"
                onClick={() => quickLoginAs("alex.rivera@devpulse.org")}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-[11px] transition text-left"
              >
                Alex (Silver, 630 pts)
              </button>
              <button
                type="button"
                onClick={() => quickLoginAs("david.kim@learner.net")}
                className="p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-[11px] transition text-left"
              >
                David (Free, 40 pts)
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-400">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}


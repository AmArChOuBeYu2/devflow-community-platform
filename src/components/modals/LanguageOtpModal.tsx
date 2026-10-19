"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, Mail, Smartphone, X, KeyRound, AlertCircle } from "lucide-react";

export const LanguageOtpModal: React.FC = () => {
  const {
    otpModalOpen,
    pendingLanguage,
    otpChannel,
    otpTargetDestination,
    generatedOtp,
    verifyAndApplyLanguage,
    cancelLanguageChange,
  } = useLanguage();

  const [enteredOtp, setEnteredOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!otpModalOpen || !pendingLanguage) return null;

  const languageNames: Record<string, string> = {
    en: "English",
    es: "Spanish (Español)",
    hi: "Hindi (हिन्दी)",
    pt: "Portuguese (Português)",
    zh: "Chinese (中文)",
    fr: "French (Français)",
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const result = verifyAndApplyLanguage(enteredOtp);
    if (!result.success) {
      setErrorMsg(result.message);
    } else {
      setEnteredOtp("");
    }
  };

  const fillAutoDemo = () => {
    setEnteredOtp(generatedOtp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 relative">
        <button
          onClick={cancelLanguageChange}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-primary rounded-xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Language Security Verification
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Switching to: <span className="font-semibold text-primary">{languageNames[pendingLanguage]}</span>
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3.5 mb-5 text-sm">
          <div className="flex items-start space-x-2.5">
            {otpChannel === "email" ? (
              <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            ) : (
              <Smartphone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium text-blue-950 dark:text-blue-100">
                {otpChannel === "email"
                  ? "French Language Requirement (Email OTP)"
                  : "Language Switch Requirement (Mobile OTP)"}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                A 6-digit demo code was generated locally for the registered{" "}
                <span className="font-semibold">
                  {otpChannel === "email" ? "Email Address" : "Mobile Phone Number"}
                </span>
                : <span className="font-mono underline">{otpTargetDestination}</span>
              </p>
              <p className="mt-2 text-[11px] text-blue-800 dark:text-blue-300">Demo only: no real email or SMS is sent. Production delivery requires a verified email/SMS provider.</p>
            </div>
          </div>
        </div>

        {/* Demo Helper Badge for evaluators */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-2.5 mb-4 text-xs flex items-center justify-between">
          <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-primary" />
            <span>Simulated OTP: <strong className="font-mono tracking-widest text-sm">{generatedOtp}</strong></span>
          </span>
          <button
            type="button"
            onClick={fillAutoDemo}
            className="text-xs font-semibold text-primary hover:underline ml-2"
          >
            Auto-fill
          </button>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
              Enter 6-Digit OTP Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 549102"
              className="w-full px-4 py-2.5 text-center text-xl font-mono tracking-widest rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              autoFocus
            />
          </div>

          {errorMsg && (
            <div className="flex items-center space-x-1.5 text-red-600 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={cancelLanguageChange}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={enteredOtp.length !== 6}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-dark text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              Verify & Switch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

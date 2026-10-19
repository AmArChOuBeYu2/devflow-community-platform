"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  KeyRound,
  Mail,
  Smartphone,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Lock,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { requestForgotPassword, generateSecurePassword, resetPasswordWithOtp } = useAuth();
  const { t } = useLanguage();

  const [resetMethod, setResetMethod] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("sc62970@gmail.com");
  const [otpCode, setOtpCode] = useState("");
  const [generatedPass, setGeneratedPass] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState<1 | 2>(1); // Step 1: Request, Step 2: Set New Password
  const [warningMessage, setWarningMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Step 1: Request Password Reset with 1-request-per-day restriction
  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setWarningMessage("");
    setSuccessMessage("");

    if (!identifier.trim()) {
      setWarningMessage("Please enter your registered email address or mobile phone number.");
      return;
    }

    const res = requestForgotPassword(identifier.trim(), resetMethod === "email");
    if (!res.success) {
      // Displays the exact requirement: “You can use this option only one time per day.”
      setWarningMessage(res.message);
    } else {
      setSuccessMessage(res.message);
      setStep(2);
      // Auto generate a random password for user convenience
      const initialGen = generateSecurePassword(12);
      setGeneratedPass(initialGen);
    }
  };

  const handleGeneratePassword = () => {
    // Specification: MUST contain ONLY uppercase and lowercase letters, NO numbers, NO special chars
    const pass = generateSecurePassword(14);
    setGeneratedPass(pass);
    setCopied(false);
  };

  const handleUseGenerated = () => {
    if (generatedPass) {
      setNewPassword(generatedPass);
      setConfirmPassword(generatedPass);
      setSuccessMessage("Applied generated secure password to fields!");
    }
  };

  const handleCopyPassword = () => {
    if (generatedPass) {
      navigator.clipboard?.writeText(generatedPass);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Step 2: Finalize reset
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWarningMessage("");

    if (newPassword !== confirmPassword) {
      setWarningMessage("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    // Letters only verification check
    const lettersOnly = /^[A-Za-z]+$/;
    if (!lettersOnly.test(newPassword)) {
      setWarningMessage("Password must contain ONLY uppercase and lowercase letters (no numbers or special characters).");
      return;
    }

    const res = resetPasswordWithOtp(identifier, newPassword);
    if (!res.success) {
      setWarningMessage(res.message);
    } else {
      setSuccessMessage(res.message);
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2000);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-primary text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {t.auth.forgotPasswordTitle}
          </h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {t.auth.forgotPasswordSubtitle}
          </p>
        </div>

        {/* Warning Alert (Shows "You can use this option only one time per day.") */}
        {warningMessage && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Security Notice</p>
              <p className="mt-0.5 font-medium">{warningMessage}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-xs text-green-800 dark:text-green-200 flex items-start gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Success</p>
              <p className="mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-xl space-y-6">
          {step === 1 ? (
            /* STEP 1: Choose Reset Method & Request */
            <form onSubmit={handleRequestReset} className="space-y-5">
              {/* Reset Channel Tabs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Select Reset Channel
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setResetMethod("email");
                      setIdentifier("sc62970@gmail.com");
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                      resetMethod === "email"
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Registered Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResetMethod("phone");
                      setIdentifier("+91 9876543210");
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition ${
                      resetMethod === "phone"
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Registered Phone</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  {resetMethod === "email" ? "Registered Email Address" : "Registered Mobile Phone Number"}
                </label>
                <input
                  type={resetMethod === "email" ? "email" : "text"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={resetMethod === "email" ? "name@example.com" : "+91 9876543210"}
                  required
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[11px] text-gray-500">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Rate Limit Protection:</span> To prevent misuse, the forgot password option is strictly restricted to <strong>one request per day</strong> per account.
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold bg-primary hover:bg-primary-dark text-white text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <span>{t.auth.sendResetLink}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* STEP 2: Password Generator & Reset */
            <form onSubmit={handleResetSubmit} className="space-y-5">
              {/* Password Generator Feature (Letters Only Requirement) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>{t.auth.passwordGeneratorTitle}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-amber-200/70 dark:border-gray-700 flex items-center justify-between">
                  <span className="font-mono text-sm tracking-wider font-bold text-gray-900 dark:text-white">
                    {generatedPass}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-1.5 text-gray-500 hover:text-primary rounded-lg transition"
                      title="Copy to Clipboard"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleUseGenerated}
                      className="px-2.5 py-1 text-[11px] font-bold bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                    >
                      Use
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-snug">
                  * <strong>Strict Requirement:</strong> The generated password contains <strong>ONLY uppercase and lowercase letters</strong>, with zero numbers and zero special characters, ensuring clean yet secure credential updates.
                </p>
              </div>

              {/* Password Input Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    {t.auth.newPasswordLabel}
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter or paste generated letters-only password"
                    pattern="[A-Za-z]+"
                    title="Letters only: A-Z and a-z. No numbers or special characters."
                    required
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    {t.auth.confirmNewPassword}
                  </label>
                  <input
                    type="text"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm matching password"
                    pattern="[A-Za-z]+"
                    required
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold bg-primary hover:bg-primary-dark text-white text-xs shadow-md transition"
              >
                {t.auth.resetPasswordSubmit}
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/login"
              className="text-xs font-semibold text-primary hover:underline"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

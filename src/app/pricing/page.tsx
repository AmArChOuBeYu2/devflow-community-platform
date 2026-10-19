"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { useSubscription, SUBSCRIPTION_PLANS } from "@/context/SubscriptionContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { RazorpayModal } from "@/components/modals/RazorpayModal";
import { UserTier } from "@/types";
import {
  CreditCard,
  Check,
  Zap,
  Download,
  Calendar,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileText,
} from "lucide-react";

export default function PricingPage() {
  const { currentTier, currentPlan, invoices, downloadInvoicePdf } = useSubscription();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [selectedTierForModal, setSelectedTierForModal] = useState<UserTier | null>(null);

  const planKeys: UserTier[] = ["free", "bronze", "silver", "gold"];

  return (
    <div className="flex w-full">
      <Sidebar />

      <main className="flex-1 py-6 md:px-6 space-y-8 min-w-0">
        {/* Pricing Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            Flexible Membership Plans
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {t.subscription.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {t.subscription.subtitle}
          </p>
        </div>

        {/* Current Active Subscription Banner */}
        {user && (
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300 dark:border-amber-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-primary text-white rounded-2xl shadow-md">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Active Subscription Status
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{currentPlan.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentPlan.badgeColor}`}>
                    {currentPlan.badgeName}
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  Daily Question Limit: <strong>{currentPlan.dailyQuestionLimit === "unlimited" ? "Unlimited" : `${currentPlan.dailyQuestionLimit} questions/day`}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/profile#invoices"
                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-50 transition shadow-xs flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-primary" />
                <span>View Invoices & Billing</span>
              </Link>
            </div>
          </div>
        )}

        {/* 4 Tier Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {planKeys.map((tierKey) => {
            const plan = SUBSCRIPTION_PLANS[tierKey];
            const isCurrent = currentTier === tierKey;
            const isGold = tierKey === "gold";

            return (
              <div
                key={tierKey}
                className={`rounded-3xl p-6 bg-white dark:bg-gray-900 border transition flex flex-col justify-between relative shadow-xs ${
                  isCurrent
                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                    : isGold
                    ? "border-amber-400 dark:border-amber-700 bg-gradient-to-b from-amber-50/40 to-white dark:from-amber-950/10 dark:to-gray-900"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    Active Plan
                  </span>
                )}
                {isGold && !isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">{plan.name}</h3>
                  </div>

                  <div className="my-4">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">
                      ₹{plan.price}
                    </span>
                    <span className="text-xs text-gray-500">
                      {plan.price > 0 ? " / month" : " forever"}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                    Badge: <strong className="text-gray-900 dark:text-gray-200 font-semibold">{plan.badgeName}</strong>
                  </p>

                  <ul className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300 mb-6">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-default"
                    >
                      Current Plan
                    </button>
                  ) : plan.price === 0 ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-gray-200 text-gray-400"
                    >
                      Default Free
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedTierForModal(tierKey)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition shadow-md flex items-center justify-center gap-1.5 ${
                        isGold
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                          : "bg-primary hover:bg-primary-dark"
                      }`}
                    >
                      <span>Upgrade to {plan.name.split(" ")[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Invoices & Downloadable PDF Section (Task 3 Specification) */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Payment History & Downloadable Tax Invoices</span>
              </h3>
              <p className="text-xs text-gray-500">
                Official GST-compliant tax invoices automatically generated upon every successful Razorpay payment.
              </p>
            </div>
          </div>

          {invoices.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">
              No invoice records yet. Upgrade to Bronze, Silver, or Gold to generate an official tax invoice!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4 rounded-l-xl">Invoice ID</th>
                    <th className="py-2.5 px-4">Plan Tier</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 rounded-r-xl text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 capitalize font-semibold text-primary">
                        {inv.planTier} Plan
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(inv.billingDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                        ₹{inv.amount}.00
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => downloadInvoicePdf(inv)}
                          className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold flex items-center gap-1.5 ml-auto transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Razorpay Checkout Modal */}
        {selectedTierForModal && (
          <RazorpayModal
            isOpen={Boolean(selectedTierForModal)}
            onClose={() => setSelectedTierForModal(null)}
            tier={selectedTierForModal}
          />
        )}
      </main>

      <RightSidebar />
    </div>
  );
}

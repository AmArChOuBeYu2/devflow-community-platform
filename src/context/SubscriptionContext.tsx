"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserTier, SubscriptionInvoice } from "@/types";
import { Storage } from "@/lib/storage";
import { useAuth } from "./AuthContext";
import jsPDF from "jspdf";

export interface PlanDetails {
  tier: UserTier;
  name: string;
  price: number; // in INR
  billingPeriod: string;
  dailyQuestionLimit: number | "unlimited";
  badgeName: string;
  badgeColor: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<UserTier, PlanDetails> = {
  free: {
    tier: "free",
    name: "Free Plan",
    price: 0,
    billingPeriod: "forever",
    dailyQuestionLimit: 1,
    badgeName: "Community Member",
    badgeColor: "bg-gray-100 text-gray-800 border-gray-300",
    features: [
      "Post 1 question per day",
      "Basic text search functionality",
      "Community feed participation",
      "Standard answer voting",
    ],
  },
  bronze: {
    tier: "bronze",
    name: "Bronze Plan",
    price: 99,
    billingPeriod: "month",
    dailyQuestionLimit: 5,
    badgeName: "Bronze Supporter",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-400",
    features: [
      "Post 5 questions per day",
      "Bronze profile badge",
      "Access to advanced search filters (tags, user, votes)",
      "Ad-free reading experience",
    ],
  },
  silver: {
    tier: "silver",
    name: "Silver Plan",
    price: 299,
    billingPeriod: "month",
    dailyQuestionLimit: 15,
    badgeName: "Silver Champion",
    badgeColor: "bg-slate-200 text-slate-800 border-slate-400",
    features: [
      "Post 15 questions per day",
      "Silver profile badge",
      "Priority customer & technical support",
      "Enhanced profile visibility in developer directory",
      "Unlimited post & question bookmarks",
      "All Bronze tier benefits",
    ],
  },
  gold: {
    tier: "gold",
    name: "Gold Plan",
    price: 999,
    billingPeriod: "month",
    dailyQuestionLimit: "unlimited",
    badgeName: "Gold VIP Master",
    badgeColor: "bg-yellow-100 text-yellow-900 border-yellow-500",
    features: [
      "Unlimited question posting",
      "Gold profile badge",
      "Highest search & feed priority",
      "Featured profile visibility in top searches",
      "24/7 Priority VIP customer support",
      "Access to exclusive VIP community features",
      "All Silver tier benefits",
    ],
  },
};

interface SubscriptionContextType {
  currentTier: UserTier;
  currentPlan: PlanDetails;
  invoices: SubscriptionInvoice[];
  upgradePlan: (targetTier: UserTier, paymentMethod?: string, verifiedPaymentId?: string) => Promise<{ success: boolean; invoice: SubscriptionInvoice }>;
  downloadInvoicePdf: (invoice: SubscriptionInvoice) => void;
  canAskQuestionToday: () => { allowed: boolean; remaining: number | "unlimited"; limit: number | "unlimited"; message?: string };
  recordQuestionAsked: () => void;
  hasAdvancedSearch: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);

  useEffect(() => {
    setInvoices(Storage.getInvoices());
  }, []);

  const currentTier: UserTier = user?.tier || "free";
  const currentPlan = SUBSCRIPTION_PLANS[currentTier] || SUBSCRIPTION_PLANS.free;

  const canAskQuestionToday = (): { allowed: boolean; remaining: number | "unlimited"; limit: number | "unlimited"; message?: string } => {
    if (!user) return { allowed: false, remaining: 0, limit: 1, message: "Please log in." };

    const limit = currentPlan.dailyQuestionLimit;
    if (limit === "unlimited") {
      return { allowed: true, remaining: "unlimited", limit: "unlimited" };
    }

    const today = new Date().toISOString().split("T")[0];
    const todayCount = user.dailyQuestionsCount?.[today] || 0;
    const remaining = Math.max(0, limit - todayCount);

    if (remaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        limit,
        message: `Daily question limit reached (${limit}/${limit} questions posted today). Upgrade your plan to ask more!`,
      };
    }

    return { allowed: true, remaining, limit };
  };

  const recordQuestionAsked = () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const currCount = user.dailyQuestionsCount?.[today] || 0;
    const newDaily = { ...user.dailyQuestionsCount, [today]: currCount + 1 };
    updateProfile({ dailyQuestionsCount: newDaily });
  };

  const upgradePlan = async (
    targetTier: UserTier,
    paymentMethod = "Demo Checkout (no charge)",
    verifiedPaymentId?: string
  ): Promise<{ success: boolean; invoice: SubscriptionInvoice }> => {
    const targetPlan = SUBSCRIPTION_PLANS[targetTier];
    const now = new Date();
    const renewal = new Date();
    renewal.setDate(now.getDate() + 30);

    const invNum = `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoice: SubscriptionInvoice = {
      id: "inv-" + Date.now(),
      invoiceNumber: invNum,
      userId: user?.id || "user-amar",
      userName: user?.name || "Amar Choubey",
      userEmail: user?.email || "sc62970@gmail.com",
      planTier: targetTier,
      amount: targetPlan.price,
      status: verifiedPaymentId ? "paid" : "demo",
      paymentMethod,
      paymentId: verifiedPaymentId || "DEMO-NO-CHARGE",
      billingDate: now.toISOString(),
      renewalDate: renewal.toISOString(),
    };

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    Storage.saveInvoices(updatedInvoices);

    // Update user profile tier
    if (user) {
      updateProfile({ tier: targetTier });
    }

    // Add in-app confirmation notification
    const currentNotifs = Storage.getNotifications();
    Storage.saveNotifications([
      {
        id: "notif-sub-" + Date.now(),
        userId: user?.id || "user-amar",
        senderId: "system",
        senderName: "Billing System",
        senderAvatar: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&auto=format&fit=crop&q=80",
        type: "subscription",
        message: verifiedPaymentId ? `Payment verified. Invoice ${invNum}: your ${targetPlan.name} is active.` : `Demo checkout only (no charge). ${targetPlan.name} enabled in this browser for evaluation.`,
        link: "/profile",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...currentNotifs,
    ]);

    return { success: true, invoice: newInvoice };
  };

  const downloadInvoicePdf = (invoice: SubscriptionInvoice) => {
    const doc = new jsPDF();

    // Brand Header
    doc.setFillColor(244, 130, 37); // Primary orange
    doc.rect(0, 0, 210, 24, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("DevFlow Community - Subscription Receipt", 14, 16);

    // Invoice Metadata
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 14, 38);
    doc.text(`Billing Date: ${new Date(invoice.billingDate).toLocaleDateString()}`, 14, 45);
    doc.text(`Next Renewal: ${new Date(invoice.renewalDate).toLocaleDateString()}`, 14, 52);
    doc.text(`Payment Gateway: Razorpay`, 14, 59);
    doc.text(`Transaction ID: ${invoice.paymentId}`, 14, 66);
    doc.text(`Status: ${invoice.status === "paid" ? "PAID (verified)" : invoice.status === "demo" ? "DEMO ONLY - NO CHARGE" : "FAILED"}`, 14, 73);

    // Customer details
    doc.text("Billed To:", 130, 38);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.userName, 130, 45);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.userEmail, 130, 52);
    doc.text("India", 130, 59);

    // Line items table
    doc.setFillColor(240, 243, 246);
    doc.rect(14, 85, 182, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Plan Description", 18, 91);
    doc.text("Duration", 100, 91);
    doc.text("Rate", 140, 91);
    doc.text("Amount (INR)", 170, 91);

    doc.setFont("helvetica", "normal");
    doc.text(`DevFlow ${invoice.planTier.toUpperCase()} Membership`, 18, 104);
    doc.text("1 Month", 100, 104);
    doc.text(`Rs. ${invoice.amount}`, 140, 104);
    doc.text(`Rs. ${invoice.amount}.00`, 170, 104);

    // Total section
    doc.line(14, 115, 196, 115);
    doc.setFont("helvetica", "bold");
    doc.text("Grand Total:", 135, 125);
    doc.text(`Rs. ${invoice.amount}.00`, 170, 125);

    // Footer note
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120, 120, 120);
    doc.text(invoice.status === "paid" ? "Electronically generated subscription receipt. Payment was verified by the payment gateway." : "DEMO RECEIPT ONLY. No real payment was taken; this document is not a tax invoice.", 14, 150);
    doc.text("For billing support or queries, contact support@devflow.org or training@elevanceskills.com", 14, 156);

    doc.save(`DevFlow_Invoice_${invoice.invoiceNumber}.pdf`);
  };

  const hasAdvancedSearch = currentTier !== "free";

  return (
    <SubscriptionContext.Provider
      value={{
        currentTier,
        currentPlan,
        invoices: invoices.filter((i) => i.userId === user?.id),
        upgradePlan,
        downloadInvoicePdf,
        canAskQuestionToday,
        recordQuestionAsked,
        hasAdvancedSearch,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within a SubscriptionProvider");
  return context;
};

"use client";

import React, { useState } from "react";
import { UserTier, SubscriptionInvoice } from "@/types";
import { useSubscription, SUBSCRIPTION_PLANS } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import { X, CheckCircle2, ShieldCheck, ArrowRight, Loader2, Download, CreditCard, AlertCircle, FlaskConical } from "lucide-react";

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", callback: (response: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: UserTier;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({ isOpen, onClose, tier }) => {
  const { upgradePlan, downloadInvoicePdf } = useSubscription();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInvoice, setSuccessInvoice] = useState<SubscriptionInvoice | null>(null);

  if (!isOpen) return null;
  const plan = SUBSCRIPTION_PLANS[tier];

  const loadCheckout = () => new Promise<boolean>((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-devflow-razorpay="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.devflowRazorpay = "true";
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePay = async () => {
    setProcessing(true);
    setErrorMessage("");
    try {
      const orderResponse = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, userId: user?.id }),
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(order.error || "Could not start Razorpay checkout.");
      }

      const loaded = await loadCheckout();
      if (!loaded || !window.Razorpay) {
        throw new Error("Razorpay Checkout could not load. Check your network connection and try again.");
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "DevFlow Community",
        description: plan.name + " monthly subscription",
        order_id: order.orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#f48225" },
        handler: async (payment) => {
          setProcessing(true);
          setErrorMessage("");
          try {
            const verifyResponse = await fetch("/api/billing/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tier,
                orderId: payment.razorpay_order_id,
                paymentId: payment.razorpay_payment_id,
                signature: payment.razorpay_signature,
              }),
            });
            const verification = await verifyResponse.json();
            if (!verifyResponse.ok || !verification.verified) {
              throw new Error(verification.error || "Payment verification failed. Your plan has not been activated.");
            }
            const result = await upgradePlan(tier, "Razorpay (" + verification.paymentMethod + ")", verification.paymentId);
            setSuccessInvoice(result.invoice);
          } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Could not verify payment.");
          } finally {
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      checkout.on("payment.failed", (response) => {
        setErrorMessage(response.error?.description || "Payment did not complete. No subscription has been activated.");
        setProcessing(false);
      });
      setProcessing(false);
      checkout.open();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not start checkout.");
      setProcessing(false);
    }
  };

  const handleDemoCheckout = async () => {
    setProcessing(true);
    setErrorMessage("");
    try {
      const result = await upgradePlan(tier, "Demo checkout (no charge)");
      setSuccessInvoice(result.invoice);
    } catch {
      setErrorMessage("Demo checkout failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setSuccessInvoice(null);
    setProcessing(false);
    setErrorMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between bg-[#0c2340] p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0c83fe] text-lg font-black">R</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight">Razorpay Checkout</span>
                <span className="rounded border border-blue-400/30 bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-blue-200">Gateway</span>
              </div>
              <p className="text-xs text-gray-300">DevFlow Community membership</p>
            </div>
          </div>
          <button onClick={handleClose} aria-label="Close checkout" className="text-gray-300 transition hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        {successInvoice ? (
          <div className="space-y-4 p-7 text-center">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${successInvoice.status === "paid" ? "bg-green-100 text-green-600 dark:bg-green-950/50" : "bg-amber-100 text-amber-700 dark:bg-amber-950/50"}`}>
              {successInvoice.status === "paid" ? <CheckCircle2 className="h-10 w-10" /> : <FlaskConical className="h-9 w-9" />}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {successInvoice.status === "paid" ? "Payment verified" : "Demo checkout complete"}
            </h3>
            <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
              {successInvoice.status === "paid"
                ? <>Razorpay verified the payment. The <strong className="text-primary">{plan.name}</strong> is enabled in this browser.</>
                : <>No money was charged. The <strong className="text-primary">{plan.name}</strong> is enabled in this browser for evaluator walkthroughs only.</>}
            </p>
            <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-xs dark:border-gray-700 dark:bg-gray-800">
              <div className="flex justify-between gap-4"><span className="text-gray-500">Receipt</span><span className="font-mono font-bold text-gray-900 dark:text-white">{successInvoice.invoiceNumber}</span></div>
              <div className="flex justify-between gap-4"><span className="text-gray-500">Payment reference</span><span className="break-all text-right font-mono text-gray-900 dark:text-white">{successInvoice.paymentId}</span></div>
              <div className="flex justify-between gap-4"><span className="text-gray-500">Amount</span><span className={`font-bold ${successInvoice.status === "paid" ? "text-green-600" : "text-amber-700"}`}>{successInvoice.status === "paid" ? "₹" + successInvoice.amount + ".00 paid" : "₹" + successInvoice.amount + ".00 demo amount (not charged)"}</span></div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={() => downloadInvoicePdf(successInvoice)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"><Download className="h-4 w-4" /> Download receipt (PDF)</button>
              <button onClick={handleClose} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark">Done</button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 p-6">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-800/40 dark:bg-amber-950/20">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">Selected plan</span>
                <h4 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h4>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Monthly membership. Payment is handled by Razorpay when configured.</p>
              </div>
              <div className="shrink-0 text-right"><span className="text-2xl font-black text-gray-900 dark:text-white">₹{plan.price}</span><span className="block text-xs text-gray-500">/ month</span></div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
              <div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" /><div><p className="font-semibold">Secure gateway checkout</p><p className="mt-1 text-xs leading-5">Choose UPI, card, net banking, or another supported method inside Razorpay. DevFlow verifies the returned payment signature on the server before activation.</p></div></div>
            </div>

            {errorMessage && <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{errorMessage}</span></div>}

            <button onClick={handlePay} disabled={processing} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c83fe] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#0070e0] disabled:cursor-not-allowed disabled:opacity-60">
              {processing ? <><Loader2 className="h-5 w-5 animate-spin" /> Starting secure checkout...</> : <><CreditCard className="h-5 w-5" /> Pay ₹{plan.price} with Razorpay <ArrowRight className="h-4 w-4" /></>}
            </button>

            <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">Evaluation fallback only. Demo checkout takes no payment and must not be described as a real transaction.</p>
              <button onClick={handleDemoCheckout} disabled={processing} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                {processing ? "Please wait..." : "Continue with demo checkout (no charge)"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

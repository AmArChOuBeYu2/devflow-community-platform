"use client";

import React, { useState } from "react";
import { UserTier } from "@/types";
import { useSubscription, SUBSCRIPTION_PLANS } from "@/context/SubscriptionContext";
import { X, CheckCircle2, ShieldCheck, CreditCard, QrCode, Building, ArrowRight, Loader2, Download } from "lucide-react";

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: UserTier;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({ isOpen, onClose, tier }) => {
  const { upgradePlan, downloadInvoicePdf } = useSubscription();
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("amar@okaxis");
  const [processing, setProcessing] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<any | null>(null);

  if (!isOpen) return null;

  const plan = SUBSCRIPTION_PLANS[tier];

  const handlePay = async () => {
    setProcessing(true);
    // Simulate real Razorpay gateway response time
    setTimeout(async () => {
      const res = await upgradePlan(tier, `Razorpay - ${paymentMethod.toUpperCase()}`);
      setProcessing(false);
      if (res.success) {
        setSuccessInvoice(res.invoice);
      }
    }, 1200);
  };

  const handleClose = () => {
    setSuccessInvoice(null);
    setProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
        {/* Razorpay Branded Header */}
        <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#0c83fe] flex items-center justify-center font-black text-white text-lg">
              R
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-base">Razorpay</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-400/30 uppercase font-semibold">
                  Secure Checkout
                </span>
              </div>
              <p className="text-xs text-gray-300">DevFlow Community Technologies Pvt Ltd</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successInvoice ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payment Successful!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your subscription has been activated to the{" "}
              <strong className="text-primary font-semibold">{plan.name}</strong>. A confirmation email and tax invoice have been dispatched to your account.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left text-xs space-y-2 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice Number:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{successInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment ID:</span>
                <span className="font-mono text-gray-900 dark:text-white">{successInvoice.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-bold text-green-600">₹{successInvoice.amount}.00</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                onClick={() => downloadInvoicePdf(successInvoice)}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" /> Download Invoice (PDF)
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-dark text-white transition shadow-md"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Order summary banner */}
            <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-amber-900 dark:text-amber-200">
                  Upgrading to
                </span>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h4>
                <p className="text-xs text-gray-500">Billed monthly with auto-renewal cancelable anytime.</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-gray-900 dark:text-white">₹{plan.price}</span>
                <span className="text-xs text-gray-500 block">/ month</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition ${
                    paymentMethod === "upi"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition ${
                    paymentMethod === "netbanking"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Building className="w-5 h-5" />
                  NetBanking
                </button>
              </div>
            </div>

            {paymentMethod === "upi" && (
              <div className="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-2">
                <label className="font-semibold text-gray-700 dark:text-gray-200 block">Virtual Payment Address (VPA / UPI ID)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                <span className="text-[11px] text-gray-500 block">Supported: Google Pay, PhonePe, Paytm, BHIM UPI</span>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-2">
                <input
                  type="text"
                  defaultValue="4532 •••• •••• 8892"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 font-mono"
                  placeholder="Card Number"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 font-mono"
                    placeholder="MM/YY"
                  />
                  <input
                    type="password"
                    defaultValue="•••"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 font-mono"
                    placeholder="CVV"
                  />
                </div>
              </div>
            )}

            {paymentMethod === "netbanking" && (
              <div className="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                <select className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900">
                  <option>HDFC Bank</option>
                  <option>State Bank of India</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                </select>
              </div>
            )}

            <div className="flex items-center space-x-2 text-[11px] text-gray-500 justify-center">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>PCI-DSS Level 1 Compliant 256-bit Encrypted Transaction</span>
            </div>

            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full py-3 px-4 rounded-xl font-bold bg-[#0c83fe] hover:bg-[#0070e0] text-white flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 transition disabled:opacity-60"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Payment with Razorpay...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{plan.price} via Razorpay</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

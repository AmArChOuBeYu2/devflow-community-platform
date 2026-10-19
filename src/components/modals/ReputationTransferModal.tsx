"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useReputation } from "@/context/ReputationContext";
import { X, Award, AlertCircle, ArrowRightLeft, CheckCircle2 } from "lucide-react";

interface ReputationTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReputationTransferModal: React.FC<ReputationTransferModalProps> = ({ isOpen, onClose }) => {
  const { user, users } = useAuth();
  const { reputation, transferPoints } = useReputation();

  const [receiverId, setReceiverId] = useState("");
  const [amount, setAmount] = useState<number>(10);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  if (!isOpen || !user) return null;

  const eligibleRecipients = users.filter((u) => u.id !== user.id);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!receiverId) {
      setFeedback({ type: "error", message: "Please select a community member to receive your points." });
      return;
    }

    const res = transferPoints(receiverId, Number(amount), reason);
    if (res.success) {
      setFeedback({ type: "success", message: res.message });
      setTimeout(() => {
        setReason("");
        setAmount(10);
        setReceiverId("");
        setFeedback(null);
        onClose();
      }, 1500);
    } else {
      setFeedback({ type: "error", message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-600 rounded-xl">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Transfer Reputation Points
            </h3>
            <p className="text-xs text-gray-500">
              Your Current Balance: <strong className="text-primary font-bold">{reputation} points</strong>
            </p>
          </div>
        </div>

        {/* Requirements Box */}
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 mb-4 text-xs space-y-1 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Community Guidelines for Transfer:</span>
          </div>
          <p>• Sender must maintain <strong className="text-primary">&gt; 50 reputation points</strong></p>
          <p>• Transaction limit: <strong className="text-gray-900 dark:text-white">50 points max per transfer</strong></p>
          <p>• Daily transfer cap: <strong className="text-gray-900 dark:text-white">100 points max per day</strong></p>
        </div>

        {reputation <= 50 && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-4 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>You currently have {reputation} reputation points. You need more than 50 points to unlock reputation transfers.</span>
          </div>
        )}

        {feedback && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Select Recipient Member
            </label>
            <select
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              disabled={reputation <= 50}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">-- Choose recipient --</option>
              {eligibleRecipients.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.tier.toUpperCase()} • {u.reputation} pts)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Points to Transfer (1 - 50)
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              disabled={reputation <= 50}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Reason / Message for Transfer
            </label>
            <input
              type="text"
              placeholder="e.g. Exceptional explanation on React SSR question"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={reputation <= 50}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reputation <= 50}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-dark text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              Transfer Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

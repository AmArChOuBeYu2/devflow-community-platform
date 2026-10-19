"use client";

import React, { useState } from "react";
import { useCommunity } from "@/context/CommunityContext";
import { X, Flag, AlertCircle, CheckCircle2 } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, postId }) => {
  const { reportPost } = useCommunity();
  const [reason, setReason] = useState("Spam or Advertising");
  const [details, setDetails] = useState("");
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  if (!isOpen) return null;

  const reasons = [
    "Spam or Commercial Promotion",
    "Harassment or Abusive Behavior",
    "Inappropriate or Violating Media",
    "Misleading or Malicious Code Snippet",
    "Other Community Guideline Infraction",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = reportPost(postId, reason, details);
    if (res.success) {
      setFeedback({ type: "success", message: res.message });
      setTimeout(() => {
        setFeedback(null);
        setDetails("");
        onClose();
      }, 1200);
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
          <div className="p-3 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-xl">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Report Content
            </h3>
            <p className="text-xs text-gray-500">
              Flags are reviewed directly by community administrators.
            </p>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
              Select Reason for Reporting
            </label>
            <div className="space-y-2">
              {reasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    reason === r
                      ? "border-primary bg-primary/5 text-gray-900 dark:text-white font-medium"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="mr-2.5 text-primary focus:ring-primary"
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Additional Context (Optional)
            </label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any details to help admins verify this infraction..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-xl text-xs font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition shadow-md"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

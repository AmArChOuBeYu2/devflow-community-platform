"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { useQuestions } from "@/context/QuestionsContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import {
  HelpCircle,
  AlertCircle,
  Zap,
  Tag,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function AskQuestionPage() {
  const router = useRouter();
  const { addQuestion } = useQuestions();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { currentPlan, canAskQuestionToday } = useSubscription();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["react", "typescript"]);
  const [errorMsg, setErrorMsg] = useState("");

  const allowance = canAskQuestionToday();

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === "," || e.key === " ") && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      if (clean && !tags.includes(clean) && tags.length < 5) {
        setTags([...tags, clean]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!user) {
      setErrorMsg("Please sign in or select an active user profile to post a question.");
      return;
    }

    if (title.trim().length < 15) {
      setErrorMsg("Title must be at least 15 characters to describe the issue clearly.");
      return;
    }

    if (body.trim().length < 30) {
      setErrorMsg("Please provide more details in the question body (at least 30 characters).");
      return;
    }

    if (tags.length === 0) {
      setErrorMsg("Please provide at least one relevant technology tag.");
      return;
    }

    const res = addQuestion(title.trim(), body.trim(), tags);
    if (!res.success) {
      setErrorMsg(res.message || "Could not post question.");
    } else {
      router.push(`/questions/${res.questionId}`);
    }
  };

  return (
    <div className="flex w-full">
      <Sidebar />

      <main className="flex-1 py-6 md:px-6 space-y-6 min-w-0 max-w-4xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" />
            <span>{t.questions.askTitle}</span>
          </h1>
          <p className="text-xs text-gray-500">
            {t.questions.askSubtitle}
          </p>
        </div>

        {/* Plan Question Limit Check Notice */}
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white">
                {currentPlan.name} Allowance:{" "}
              </span>
              <span className="text-amber-800 dark:text-amber-300 font-semibold">
                {allowance.remaining === "unlimited"
                  ? "Unlimited questions per day"
                  : `${allowance.remaining} remaining for today (${currentPlan.dailyQuestionLimit} limit/day)`}
              </span>
            </div>
          </div>
          {currentPlan.tier !== "gold" && (
            <Link
              href="/pricing"
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition"
            >
              Upgrade Plan
            </Link>
          )}
        </div>

        {!allowance.allowed ? (
          <div className="p-8 rounded-3xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Daily Limit Reached
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Your {currentPlan.name} allows {currentPlan.dailyQuestionLimit} question per day. To ask more questions immediately, please upgrade your membership plan.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md hover:bg-primary-dark transition"
            >
              <span>View Upgrade Options (Bronze, Silver, Gold)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Title Box */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
              <label className="block text-sm font-bold text-gray-900 dark:text-white">
                {t.questions.questionTitle}
              </label>
              <p className="text-xs text-gray-500">
                Be specific and imagine you’re asking a question to another developer.
              </p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.questions.titlePlaceholder}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
              />
            </div>

            {/* Body Box */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
              <label className="block text-sm font-bold text-gray-900 dark:text-white">
                What are the details of your problem?
              </label>
              <p className="text-xs text-gray-500">
                Introduce the problem, share what you expected vs what actually happened, and include any relevant code snippets.
              </p>
              <textarea
                rows={9}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t.questions.bodyPlaceholder}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
              />
            </div>

            {/* Tags Box */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
              <label className="block text-sm font-bold text-gray-900 dark:text-white">
                Tags (Up to 5)
              </label>
              <p className="text-xs text-gray-500">
                Add up to 5 tags to describe what your question is about (press space, comma, or Enter).
              </p>

              <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="hover:text-red-500 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={tags.length === 0 ? t.questions.tagsPlaceholder : "Add more tags..."}
                    className="flex-1 min-w-[120px] bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center gap-2"
              >
                <span>{t.questions.postButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <span className="text-xs text-gray-400">
                Earn <strong className="text-primary">+2 points</strong> when question gets 10+ upvotes!
              </span>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

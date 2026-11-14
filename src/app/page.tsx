"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { useQuestions } from "@/context/QuestionsContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Award,
  Zap,
  Tag,
  ShieldCheck,
  KeyRound,
  Laptop,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const { questions } = useQuestions();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { currentPlan, canAskQuestionToday } = useSubscription();

  const [activeTab, setActiveTab] = useState<"newest" | "votes" | "unanswered">("newest");

  const allowance = canAskQuestionToday();

  const filteredQuestions = [...questions].sort((a, b) => {
    if (activeTab === "votes") return b.votes - a.votes;
    if (activeTab === "unanswered") return a.answersCount - b.answersCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="flex w-full">
      <Sidebar />

      <main className="flex-1 py-6 md:px-6 space-y-5 min-w-0">
        {/* Stack Overflow Primary Q&A Header */}
        <div className="pb-4 border-b border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Top Questions
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Public developer Q&A forum inspired by Stack Overflow, powered by DevFlow.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/questions/ask"
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{t.nav.askQuestion}</span>
              </Link>
            </div>
          </div>

          {/* Subheader: Count + Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <span className="text-xs font-semibold text-gray-500">
              <strong className="text-gray-900 dark:text-white font-bold">{questions.length}</strong> questions available
            </span>

            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("newest")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "newest"
                    ? "bg-white dark:bg-gray-900 text-primary shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setActiveTab("votes")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "votes"
                    ? "bg-white dark:bg-gray-900 text-primary shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Most Voted
              </button>
              <button
                onClick={() => setActiveTab("unanswered")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "unanswered"
                    ? "bg-white dark:bg-gray-900 text-primary shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Unanswered
              </button>
            </div>
          </div>
        </div>

        {/* Elevance Skills Internship Feature Strip (Compact & Accessible) */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Elevance Skills Internship Tasks Quick-Access</span>
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
              Training Project Foundation
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            <Link
              href="/community"
              className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition flex items-center gap-2 group"
            >
              <MessageSquare className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-[11px] truncate group-hover:text-primary">1. Feed</p>
                <p className="text-[10px] text-gray-400 truncate">Social & posts</p>
              </div>
            </Link>

            <Link
              href="/forgot-password"
              className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition flex items-center gap-2 group"
            >
              <KeyRound className="w-4 h-4 text-purple-500 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-[11px] truncate group-hover:text-primary">2. Password</p>
                <p className="text-[10px] text-gray-400 truncate">1/day limit</p>
              </div>
            </Link>

            <Link
              href="/pricing"
              className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition flex items-center gap-2 group"
            >
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-[11px] truncate group-hover:text-primary">3. Plans</p>
                <p className="text-[10px] text-gray-400 truncate">₹99 - ₹999</p>
              </div>
            </Link>

            <Link
              href="/profile"
              className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition flex items-center gap-2 group"
            >
              <Award className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-[11px] truncate group-hover:text-primary">4. Badges</p>
                <p className="text-[10px] text-gray-400 truncate">Rep & transfer</p>
              </div>
            </Link>

            <button
              onClick={() => {
                const el = document.getElementById("language-selector-btn");
                if (el) el.click();
              }}
              className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition flex items-center gap-2 text-left group"
            >
              <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-[11px] truncate group-hover:text-primary">5. Lang OTP</p>
                <p className="text-[10px] text-gray-400 truncate">Email / SMS</p>
              </div>
            </button>

            <Link
              href="/profile/security"
              className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition flex items-center gap-2 group"
            >
              <Laptop className="w-4 h-4 text-teal-500 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-[11px] truncate group-hover:text-primary">6. Security</p>
                <p className="text-[10px] text-gray-400 truncate">Sessions</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Questions List (Immediately Above Fold) */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden shadow-xs">
          {filteredQuestions.map((q) => {
            const hasAccepted = Boolean(q.acceptedAnswerId);
            return (
              <div
                key={q.id}
                className="p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition flex flex-col sm:flex-row items-start gap-4"
              >
                {/* Stats Column (Stack Overflow Style) */}
                <div className="flex sm:flex-col items-center gap-3 sm:gap-1 text-xs shrink-0 w-full sm:w-28 text-right">
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {q.votes} <span className="text-gray-400 font-normal">votes</span>
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1 ${
                      hasAccepted
                        ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-800"
                        : q.answersCount > 0
                        ? "border border-green-600 text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {hasAccepted && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                    <span>{q.answersCount} ans</span>
                  </span>
                  <span className="text-[11px] text-gray-400 font-normal">
                    {q.views} views
                  </span>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/questions/${q.id}`}
                      className="text-base font-bold text-blue-600 dark:text-blue-400 hover:text-primary transition leading-snug"
                    >
                      {q.title}
                    </Link>
                    {q.isClosed && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        [Closed]
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {q.body}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {q.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/questions?tag=${tag}`}
                          className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[11px] hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>

                    {/* Author Signature */}
                    <div className="flex items-center space-x-2 text-[11px] text-gray-500">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={q.authorAvatar} alt={q.authorName} className="w-5 h-5 rounded-full object-cover" />
                      <Link href={`/users/${q.authorId}`} className="font-medium text-gray-700 dark:text-gray-300 hover:text-primary">
                        {q.authorName}
                      </Link>
                      <span className="font-bold text-primary">{q.authorReputation}</span>
                      <span className="text-gray-400">• {new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <RightSidebar />
    </div>
  );
}

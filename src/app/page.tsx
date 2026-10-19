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
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Award,
  Zap,
  Tag,
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

      <main className="flex-1 py-6 md:px-6 space-y-6 min-w-0">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-[#f48225] to-orange-600 p-6 sm:p-8 text-white shadow-lg">
          <div className="relative z-10 max-w-xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              Elevance Skills Internship Platform
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Where Developers Learn, Share & Build Together
            </h1>
            <p className="text-sm text-orange-100 leading-relaxed">
              Explore public developer Q&A, interact on the real-time community feed, level up your reputation, and unlock premium membership tiers.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/questions/ask"
                className="px-4 py-2.5 rounded-xl bg-white text-orange-600 font-bold text-xs hover:bg-orange-50 transition shadow-md flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                {t.nav.askQuestion}
              </Link>
              <Link
                href="/community"
                className="px-4 py-2.5 rounded-xl bg-orange-700/60 hover:bg-orange-700 text-white font-bold text-xs transition border border-white/20 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Explore Community Feed
              </Link>
              <Link
                href="/pricing"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/20 flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                Subscription Plans
              </Link>
            </div>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute -right-8 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Link
            href="/community"
            className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary/50 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase text-primary tracking-wider">Task 1</span>
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition">
              Community Feed
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Share code snippets, project showcases, follow developers, and discover trending updates.
            </p>
          </Link>

          <Link
            href="/pricing"
            className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary/50 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">Task 3</span>
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition">
              Razorpay Subscriptions
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Bronze (₹99), Silver (₹299), Gold (₹999) tiers with downloadable PDF invoices.
            </p>
          </Link>

          <Link
            href="/profile/security"
            className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary/50 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Task 6</span>
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition">
              Device Security & Sessions
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Track active sessions, remote revocation, and secure multi-language OTP verification.
            </p>
          </Link>
        </div>

        {/* Questions Header & Filter Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Top Developer Questions</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {questions.length} total
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Browse answered questions or post your own programming inquiry.
              </p>
            </div>

            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab("newest")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "newest"
                    ? "bg-white dark:bg-gray-900 text-primary shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setActiveTab("votes")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "votes"
                    ? "bg-white dark:bg-gray-900 text-primary shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                Most Voted
              </button>
              <button
                onClick={() => setActiveTab("unanswered")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "unanswered"
                    ? "bg-white dark:bg-gray-900 text-primary shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                Unanswered
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden shadow-xs">
            {filteredQuestions.map((q) => {
              const hasAccepted = Boolean(q.acceptedAnswerId);
              return (
                <div
                  key={q.id}
                  className="p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition flex flex-col sm:flex-row items-start gap-4"
                >
                  {/* Stats Column */}
                  <div className="flex sm:flex-col items-center gap-3 sm:gap-1 text-xs shrink-0 w-full sm:w-24 text-right">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {q.votes} <span className="text-gray-400 font-normal">votes</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 ${
                        hasAccepted
                          ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-800"
                          : q.answersCount > 0
                          ? "border border-green-600 text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {hasAccepted && <CheckCircle2 className="w-3 h-3 shrink-0" />}
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
                            className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[11px] hover:bg-blue-100 transition"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>

                      {/* Author */}
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
        </div>
      </main>

      <RightSidebar />
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { useQuestions } from "@/context/QuestionsContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSubscription } from "@/context/SubscriptionContext";
import {
  HelpCircle,
  Search,
  Filter,
  Lock,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Zap,
} from "lucide-react";
import { Suspense } from "react";

function QuestionsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialTag = searchParams.get("tag") || "";

  const { questions } = useQuestions();
  const { t } = useLanguage();
  const { hasAdvancedSearch, currentPlan, canAskQuestionToday } = useSubscription();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [minVotes, setMinVotes] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<"all" | "answered" | "unanswered" | "closed">("all");
  const [sortBy, setSortBy] = useState<"newest" | "votes" | "views">("newest");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const allowance = canAskQuestionToday();

  // Filter & Search Logic
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Basic Search (available to all plans)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesBody = q.body.toLowerCase().includes(query);
        const matchesTag = q.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesBody && !matchesTag) return false;
      }

      // Advanced Filters (Bronze+ required)
      if (hasAdvancedSearch) {
        if (selectedTag && !q.tags.includes(selectedTag)) return false;
        if (minVotes > 0 && q.votes < minVotes) return false;
        if (statusFilter === "answered" && q.answersCount === 0) return false;
        if (statusFilter === "unanswered" && q.answersCount > 0) return false;
        if (statusFilter === "closed" && !q.isClosed) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "votes") return b.votes - a.votes;
      if (sortBy === "views") return b.views - a.views;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [questions, searchQuery, selectedTag, minVotes, statusFilter, sortBy, hasAdvancedSearch]);

  return (
    <div className="flex w-full">
      <Sidebar />

      <main className="flex-1 py-6 md:px-6 space-y-6 min-w-0">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {t.questions.allQuestions}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {filteredQuestions.length} questions matching your criteria
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/questions/ask"
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              {t.nav.askQuestion}
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions by keyword or topic..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
              />
            </div>

            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                advancedOpen || !hasAdvancedSearch
                  ? "border-primary text-primary bg-primary/5"
                  : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>{hasAdvancedSearch ? "Advanced Filters" : "Advanced Filters (Locked)"}</span>
              {!hasAdvancedSearch && <Lock className="w-3.5 h-3.5 text-amber-500" />}
            </button>
          </div>

          {/* Advanced Search Filter Drawer */}
          {advancedOpen && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 animate-in fade-in">
              {hasAdvancedSearch ? (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                      Filter by Tag
                    </label>
                    <input
                      type="text"
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value.toLowerCase())}
                      placeholder="e.g. react, typescript"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                      Minimum Votes
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={minVotes}
                      onChange={(e) => setMinVotes(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Questions</option>
                      <option value="answered">Answered Questions</option>
                      <option value="unanswered">Unanswered Questions</option>
                      <option value="closed">Closed Questions</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSelectedTag("");
                        setMinVotes(0);
                        setStatusFilter("all");
                        setSearchQuery("");
                      }}
                      className="w-full py-1.5 px-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-900 dark:text-amber-200">
                        Advanced Search is a Bronze+ Feature
                      </p>
                      <p className="text-amber-700 dark:text-amber-400 text-[11px]">
                        Free Plan includes basic keyword search. Upgrade to Bronze (₹99/mo) to filter by tags, votes, and status.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/pricing"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition shadow-sm"
                  >
                    Upgrade for ₹99/mo
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Quick Sort Tabs */}
          <div className="flex items-center space-x-1 pt-1 border-t border-gray-100 dark:border-gray-800 text-xs">
            <span className="text-[11px] font-bold text-gray-400 mr-2">Sort by:</span>
            <button
              onClick={() => setSortBy("newest")}
              className={`px-3 py-1 rounded-lg transition ${
                sortBy === "newest"
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy("votes")}
              className={`px-3 py-1 rounded-lg transition ${
                sortBy === "votes"
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              Votes
            </button>
            <button
              onClick={() => setSortBy("views")}
              className={`px-3 py-1 rounded-lg transition ${
                sortBy === "views"
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              Views
            </button>
          </div>
        </div>

        {/* Question Cards List */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden shadow-xs">
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                No matching questions found
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Try adjusting your search terms or filters, or be the first to ask!
              </p>
              <Link
                href="/questions/ask"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
              >
                Ask a Question
              </Link>
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const hasAccepted = Boolean(q.acceptedAnswerId);
              return (
                <div
                  key={q.id}
                  className="p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition flex flex-col sm:flex-row items-start gap-4"
                >
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
                          [Closed: {q.closedReason || "Community Vote"}]
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {q.body}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {q.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              setSelectedTag(tag);
                              setAdvancedOpen(true);
                            }}
                            className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[11px] hover:bg-blue-100 transition"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

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
            })
          )}
        </div>
      </main>

      <RightSidebar />
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-400">Loading questions...</div>}>
      <QuestionsContent />
    </Suspense>
  );
}


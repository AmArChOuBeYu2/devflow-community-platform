"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { useQuestions } from "@/context/QuestionsContext";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { Search, MessageSquare, CircleHelp, CheckCircle2, ArrowUp, Clock3, Tag, Users, ChevronRight, PencilLine } from "lucide-react";

type QuestionTab = "interesting" | "newest" | "unanswered" | "votes";

function timeAgo(value: string) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "recently";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function HomePage() {
  const { questions } = useQuestions();
  const { user, users } = useAuth();
  const { currentPlan, canAskQuestionToday } = useSubscription();
  const [tab, setTab] = useState<QuestionTab>("interesting");
  const [search, setSearch] = useState("");
  const allowance = canAskQuestionToday();

  const visibleQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = questions.filter((question) => {
      if (!term) return true;
      return [
        question.title,
        question.body,
        question.authorName,
        ...question.tags,
      ].some((value) => value.toLowerCase().includes(term));
    });

    return filtered.sort((a, b) => {
      if (tab === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (tab === "unanswered") {
        return Number(a.answersCount > 0) - Number(b.answersCount > 0) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (tab === "votes") return b.votes - a.votes;
      // A simple activity score keeps useful, active questions near the top.
      const scoreA = a.votes * 2 + a.answersCount * 3 + Math.min(a.views, 1000) / 100;
      const scoreB = b.votes * 2 + b.answersCount * 3 + Math.min(b.views, 1000) / 100;
      return scoreB - scoreA;
    });
  }, [questions, search, tab]);

  const tabs: { id: QuestionTab; label: string }[] = [
    { id: "interesting", label: "Interesting" },
    { id: "newest", label: "Newest" },
    { id: "unanswered", label: "Unanswered" },
    { id: "votes", label: "Most voted" },
  ];

  return (
    <div className="flex w-full items-start gap-0">
      <Sidebar />

      <main className="min-w-0 flex-1 px-0 py-5 md:px-6 md:py-7">
        <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 dark:border-gray-800 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <CircleHelp className="h-4 w-4 text-primary" />
              DEVFLOW Q&A
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
              {user ? `Hey ${user.name.split(" ")[0]}, what do you want to learn today?` : "Where developers find answers"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              Ask practical programming questions, share what you know, and learn from developer-tested answers.
            </p>
          </div>
          <Link
            href="/questions/ask"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <PencilLine className="h-4 w-4" />
            Ask Question
          </Link>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <label className="relative block min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search questions, answers, tags, or people..."
              aria-label="Search questions"
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-950"
            />
          </label>
          <Link href="/tags" className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
            <Tag className="h-4 w-4" /> Browse tags
          </Link>
        </div>

        <section aria-labelledby="questions-heading">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 id="questions-heading" className="text-xl font-bold text-gray-950 dark:text-white">All questions</h2>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">{visibleQuestions.length}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Find an answer or help someone solve a problem.</p>
            </div>
            <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800" role="tablist" aria-label="Sort questions">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={`rounded-md px-3 py-2 text-xs font-semibold transition sm:text-sm ${tab === item.id ? "bg-white text-primary shadow-sm dark:bg-gray-950" : "text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            {visibleQuestions.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <Search className="mx-auto h-8 w-8 text-gray-300" />
                <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">No matching questions</h3>
                <p className="mt-1 text-sm text-gray-500">Try a different search term or ask the first question.</p>
                <Link href="/questions/ask" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">Ask a question <ChevronRight className="h-4 w-4" /></Link>
              </div>
            ) : (
              visibleQuestions.map((question) => {
                const author = users.find((candidate) => candidate.id === question.authorId);
                return (
                  <article key={question.id} className="grid grid-cols-1 gap-3 border-b border-gray-200 px-4 py-4 last:border-b-0 dark:border-gray-800 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-5 sm:px-5">
                    <div className="flex items-center gap-3 text-xs text-gray-500 sm:flex-col sm:items-end sm:gap-2 sm:pt-1">
                      <span className="inline-flex items-center gap-1 sm:justify-end"><ArrowUp className="h-3.5 w-3.5" /> <strong className="font-semibold text-gray-700 dark:text-gray-200">{question.votes}</strong> votes</span>
                      <span className={`inline-flex items-center gap-1 rounded px-1.5 py-1 sm:justify-end ${question.answersCount > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-gray-500"}`}>
                        {question.acceptedAnswerId ? <CheckCircle2 className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                        <strong className="font-semibold">{question.answersCount}</strong> answers
                      </span>
                      <span className="hidden sm:inline">{question.views} views</span>
                    </div>

                    <div className="min-w-0">
                      <Link href={`/questions/${question.id}`} className="text-base font-semibold leading-6 text-blue-700 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                        {question.title}
                      </Link>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-gray-600 dark:text-gray-400">{question.body}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {question.tags.map((tag) => (
                          <Link key={tag} href={`/questions?tag=${encodeURIComponent(tag)}`} className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/60">
                            {tag}
                          </Link>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          <Link href={`/users/${question.authorId}`} className="font-medium text-blue-700 hover:underline dark:text-blue-400">{question.authorName}</Link>
                          <span>{author?.reputation ?? question.authorReputation} rep</span>
                        </span>
                        <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> asked {timeAgo(question.createdAt)}</span>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Your {currentPlan.name}</p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {allowance.remaining === "unlimited" ? "You can ask unlimited questions today." : `${allowance.remaining} of ${allowance.limit} questions remaining today.`}
            </p>
          </div>
          {currentPlan.tier !== "gold" && <Link href="/pricing" className="inline-flex items-center gap-1 self-start text-sm font-semibold text-primary hover:underline sm:self-auto">Compare plans <ChevronRight className="h-4 w-4" /></Link>}
        </div>
      </main>

      <RightSidebar />
    </div>
  );
}

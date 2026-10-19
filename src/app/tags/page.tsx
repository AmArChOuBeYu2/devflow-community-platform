"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { useQuestions } from "@/context/QuestionsContext";
import { Tag as TagIcon, Search, HelpCircle } from "lucide-react";

export default function TagsPage() {
  const { questions } = useQuestions();
  const [query, setQuery] = useState("");

  const tagData = [
    { name: "react", desc: "A JavaScript library for building user interfaces with declarative component structures." },
    { name: "typescript", desc: "A typed superset of JavaScript that compiles to plain JavaScript." },
    { name: "nextjs", desc: "The React framework for the Web with App Router, SSR, and Server Components." },
    { name: "elevanceskills", desc: "Official tags for Elevance Skills training and internship community projects." },
    { name: "razorpay", desc: "Payment gateway integration for subscriptions, UPI, cards, and automated billing." },
    { name: "security", desc: "Best practices, session management, multi-language OTP verification, and defense." },
    { name: "nodejs", desc: "JavaScript runtime built on Chrome's V8 JavaScript engine for backend microservices." },
    { name: "tailwind", desc: "A utility-first CSS framework packed with classes that can be composed directly in markup." },
  ];

  const filteredTags = tagData.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) || t.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex w-full">
      <Sidebar />

      <main className="flex-1 py-6 md:px-6 space-y-6 min-w-0">
        <div className="space-y-1 pb-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <TagIcon className="w-6 h-6 text-primary" />
            <span>Community Tags</span>
          </h1>
          <p className="text-xs text-gray-500">
            A tag is a keyword or label that categorizes your question with other, similar questions.
          </p>
        </div>

        <div className="max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by tag name..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTags.map((tag) => {
            const count = questions.filter((q) => q.tags.includes(tag.name)).length;
            return (
              <div
                key={tag.name}
                className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/questions?tag=${tag.name}`}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-100 transition"
                    >
                      {tag.name}
                    </Link>
                    <span className="text-[11px] text-gray-400">
                      {count} {count === 1 ? "question" : "questions"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                    {tag.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[11px] text-gray-400">
                  <Link href={`/community?tag=${tag.name}`} className="hover:text-primary">
                    View in Feed →
                  </Link>
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

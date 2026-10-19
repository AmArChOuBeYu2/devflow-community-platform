"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { useAuth } from "@/context/AuthContext";
import { useReputation } from "@/context/ReputationContext";
import { useSubscription, SUBSCRIPTION_PLANS } from "@/context/SubscriptionContext";
import { useQuestions } from "@/context/QuestionsContext";
import { useCommunity } from "@/context/CommunityContext";
import { ReputationTransferModal } from "@/components/modals/ReputationTransferModal";
import { ProfileCompletionModal } from "@/components/modals/ProfileCompletionModal";
import {
  User,
  Award,
  CreditCard,
  Laptop,
  ArrowRightLeft,
  Calendar,
  MapPin,
  Globe,
  Github,
  Download,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Lock,
} from "lucide-react";

export default function ProfilePage() {
  const { user, sessions, revokeSession, revokeAllOtherSessions } = useAuth();
  const { reputation, logs, transfers, canCommentWithoutRestrictions, canEditCommunityPosts, canVoteToCloseQuestions, canReportContent } = useReputation();
  const { currentPlan, invoices, downloadInvoicePdf } = useSubscription();
  const { questions, answers } = useQuestions();
  const { posts } = useCommunity();

  const [activeTab, setActiveTab] = useState<"overview" | "reputation" | "transfers" | "subscription" | "security">("overview");
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 py-12 text-center space-y-3">
          <User className="w-12 h-12 text-gray-400 mx-auto" />
          <h2 className="text-xl font-bold">Please sign in to view your profile</h2>
          <Link href="/login" className="text-primary hover:underline text-xs font-bold">
            Sign In Now
          </Link>
        </main>
      </div>
    );
  }

  const myQuestions = questions.filter((q) => q.authorId === user.id);
  const myAnswers = answers.filter((a) => a.authorId === user.id);
  const myPosts = posts.filter((p) => p.authorId === user.id);

  return (
    <div className="flex w-full">
      <Sidebar />

      <main className="flex-1 py-6 md:px-6 space-y-6 min-w-0">
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary/10 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                    {user.name}
                  </h1>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${currentPlan.badgeColor}`}>
                    {currentPlan.badgeName}
                  </span>
                  {user.role === "admin" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{user.title || "Full Stack Contributor"}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {user.location || "Earth"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!user.profileCompleted ? (
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Complete Profile (+10 Pts)</span>
                </button>
              ) : (
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold"
                >
                  Edit Profile Details
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-center">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl">
              <span className="text-2xl font-black text-primary">{reputation}</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Reputation</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl">
              <span className="text-2xl font-black text-gray-900 dark:text-white">{myQuestions.length}</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Questions</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl">
              <span className="text-2xl font-black text-gray-900 dark:text-white">{myAnswers.length}</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Answers</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl">
              <span className="text-2xl font-black text-gray-900 dark:text-white">{myPosts.length}</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Feed Posts</p>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center space-x-1 border-b border-gray-200 dark:border-gray-800 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("reputation")}
            className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "reputation"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Reputation History (Task 4)</span>
          </button>

          <button
            onClick={() => setActiveTab("transfers")}
            className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "transfers"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Rep Transfers (Task 4)</span>
          </button>

          <button
            onClick={() => setActiveTab("subscription")}
            className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "subscription"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Billing & Invoices (Task 3)</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "security"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Security Sessions (Task 6)</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* About Me */}
              <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">About Me</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {user.bio || "No bio added yet. Click 'Complete Profile' to add your bio and claim 10 bonus reputation points!"}
                </p>
                <div className="pt-2 flex flex-wrap gap-3 text-gray-500">
                  {user.github && (
                    <a href={`https://github.com/${user.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary">
                      <Github className="w-3.5 h-3.5" />
                      <span>{user.github}</span>
                    </a>
                  )}
                  {user.website && (
                    <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{user.website}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Privileges Unlocked */}
              <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Community Privileges</h3>
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Comment without restrictions (50 pts)</span>
                    {canCommentWithoutRestrictions ? (
                      <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Unlocked</span>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Locked</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Edit community posts (100 pts)</span>
                    {canEditCommunityPosts ? (
                      <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Unlocked</span>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Locked</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Vote to close questions (250 pts)</span>
                    {canVoteToCloseQuestions ? (
                      <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Unlocked</span>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Locked</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Report inappropriate content (500 pts)</span>
                    {canReportContent ? (
                      <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Unlocked</span>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Locked</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Asked */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">My Questions ({myQuestions.length})</h3>
              {myQuestions.length === 0 ? (
                <p className="text-xs text-gray-400">You haven't asked any questions yet.</p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {myQuestions.map((q) => (
                    <div key={q.id} className="py-2.5 flex items-center justify-between text-xs">
                      <Link href={`/questions/${q.id}`} className="font-semibold text-blue-600 hover:text-primary">
                        {q.title}
                      </Link>
                      <span className="text-gray-400">{q.votes} votes • {q.answersCount} answers</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REPUTATION & ACTIVITY HISTORY (TASK 4) */}
        {activeTab === "reputation" && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Reputation Activity History</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Real-time ledger recording every single reputation point gained or lost.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold">Total Balance:</span>
                <span className="text-lg font-black text-primary">{reputation} pts</span>
              </div>
            </div>

            {logs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No reputation logs recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4 rounded-l-xl">Date & Time</th>
                      <th className="py-2.5 px-4">Action & Reason</th>
                      <th className="py-2.5 px-4 rounded-r-xl text-right">Points Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {logs.map((log) => {
                      const isPositive = log.points > 0;
                      return (
                        <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                          <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
                            {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                            {log.reason}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-black font-mono px-2 py-0.5 rounded-full text-xs ${
                                isPositive
                                  ? "bg-green-100 dark:bg-green-950/40 text-green-700"
                                  : "bg-red-100 dark:bg-red-950/40 text-red-700"
                              }`}
                            >
                              {isPositive ? `+${log.points}` : log.points}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REPUTATION TRANSFERS (TASK 4) */}
        {activeTab === "transfers" && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-primary" />
                  <span>Reputation Transfer & Transactions</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Transfer points to recognize helpful community members (&gt; 50 points required).
                </p>
              </div>

              <button
                onClick={() => setTransferModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Transfer Points</span>
              </button>
            </div>

            {transfers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                No transfer transactions recorded yet. Click &quot;Transfer Points&quot; to send reputation to another user!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4 rounded-l-xl">Timestamp</th>
                      <th className="py-2.5 px-4">Sender</th>
                      <th className="py-2.5 px-4">Receiver</th>
                      <th className="py-2.5 px-4">Reason</th>
                      <th className="py-2.5 px-4 rounded-r-xl text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {transfers.map((tx) => {
                      const isSentByMe = tx.senderId === user.id;
                      return (
                        <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                          <td className="py-3 px-4 font-mono text-gray-400 text-[11px]">
                            {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">
                            {tx.senderName} {isSentByMe && "(You)"}
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">
                            {tx.receiverName} {!isSentByMe && "(You)"}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 italic">
                            &quot;{tx.reason}&quot;
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-mono font-bold px-2.5 py-0.5 rounded-full ${
                                isSentByMe
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {isSentByMe ? `-${tx.amount}` : `+${tx.amount}`} pts
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SUBSCRIPTION & INVOICES (TASK 3) */}
        {activeTab === "subscription" && (
          <div className="space-y-6" id="invoices">
            {/* Active Plan Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Current Membership</span>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{currentPlan.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentPlan.badgeColor}`}>
                      {currentPlan.badgeName}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Rate: <strong>₹{currentPlan.price} / month</strong> • Status: <strong className="text-green-600">Active</strong>
                  </p>
                </div>

                <Link
                  href="/pricing"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition"
                >
                  Change Plan
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Daily Question Limit</span>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {currentPlan.dailyQuestionLimit === "unlimited" ? "Unlimited Questions" : `${currentPlan.dailyQuestionLimit} questions/day`}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Search Filter Access</span>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {currentPlan.tier === "free" ? "Basic Search" : "Advanced Filters (Unlocked)"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Customer Support</span>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {currentPlan.tier === "gold" ? "24/7 VIP Priority" : currentPlan.tier === "silver" ? "Priority Support" : "Standard Support"}
                  </span>
                </div>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                <span>Downloadable Tax Invoices (PDF)</span>
              </h3>

              {invoices.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No invoices yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4 rounded-l-xl">Invoice ID</th>
                        <th className="py-2.5 px-4">Plan Tier</th>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Amount</th>
                        <th className="py-2.5 px-4 rounded-r-xl text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">{inv.invoiceNumber}</td>
                          <td className="py-3 px-4 capitalize font-semibold">{inv.planTier}</td>
                          <td className="py-3 px-4 text-gray-500">{new Date(inv.billingDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-bold">₹{inv.amount}.00</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => downloadInvoicePdf(inv)}
                              className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-1.5 ml-auto"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY SESSIONS (TASK 6) */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-primary" />
                  <span>Active Device Sessions & Remote Revocation</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Manage active browser logins. Remotely revoke unrecognized devices anytime.
                </p>
              </div>

              <button
                onClick={revokeAllOtherSessions}
                className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition"
              >
                Revoke All Other Sessions
              </button>
            </div>

            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    s.isCurrent
                      ? "border-green-300 bg-green-50/20 dark:bg-green-950/20"
                      : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40"
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border text-gray-600">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900 dark:text-white">{s.browser}</span>
                        {s.isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Current Device
                          </span>
                        )}
                        {s.isTrusted && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            Trusted
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {s.os} • IP: <span className="font-mono text-gray-600 dark:text-gray-300">{s.ip}</span> • Location: {s.location}
                      </p>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        Logged in: {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {!s.isCurrent && (
                    <button
                      onClick={() => revokeSession(s.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      Revoke Remotely
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        <ReputationTransferModal
          isOpen={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
        />
        <ProfileCompletionModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      </main>

      <RightSidebar />
    </div>
  );
}

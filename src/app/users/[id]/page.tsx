"use client";

import React, { use } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { useAuth } from "@/context/AuthContext";
import { useReputation } from "@/context/ReputationContext";
import { useQuestions } from "@/context/QuestionsContext";
import { useCommunity } from "@/context/CommunityContext";
import { SUBSCRIPTION_PLANS } from "@/context/SubscriptionContext";
import {
  User,
  Award,
  MapPin,
  Calendar,
  Github,
  Globe,
  UserPlus,
  UserCheck,
  HelpCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;

  const { users, user: currentUser } = useAuth();
  const { logs } = useReputation();
  const { questions, answers } = useQuestions();
  const { toggleFollowUser, isFollowing } = useCommunity();

  const profileUser = users.find((u) => u.id === userId);

  if (!profileUser) {
    return (
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 py-12 text-center space-y-3">
          <User className="w-12 h-12 text-gray-400 mx-auto" />
          <h2 className="text-xl font-bold">User Not Found</h2>
          <Link href="/users" className="text-primary hover:underline text-xs font-bold">
            Back to Users Directory
          </Link>
        </main>
      </div>
    );
  }

  const userQuestions = questions.filter((q) => q.authorId === profileUser.id);
  const userAnswers = answers.filter((a) => a.authorId === profileUser.id);
  const plan = SUBSCRIPTION_PLANS[profileUser.tier];
  const following = isFollowing(profileUser.id);
  const isMe = currentUser?.id === profileUser.id;

  // Task 4: User's public reputation activity history
  const userRepLogs = logs.filter((l) => l.userId === profileUser.id);

  return (
    <div className="flex w-full">
      <Sidebar />

      <main className="flex-1 py-6 md:px-6 space-y-6 min-w-0">
        {/* User Profile Banner */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary/10 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                    {profileUser.name}
                  </h1>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${plan.badgeColor}`}>
                    {plan.badgeName}
                  </span>
                  {profileUser.role === "admin" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{profileUser.title || "Community Member"}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {profileUser.location || "Global"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Joined {new Date(profileUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {!isMe && currentUser && (
              <button
                onClick={() => toggleFollowUser(profileUser.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  following
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    : "bg-primary text-white hover:bg-primary-dark shadow-xs"
                }`}
              >
                {following ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow Creator</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="pt-4 text-xs text-gray-600 dark:text-gray-300">
            <p>{profileUser.bio || "No biography provided."}</p>
          </div>
        </div>

        {/* Public Activity History (Task 4 Specification) */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Public Reputation Activity History</span>
              </h3>
              <p className="text-xs text-gray-500">
                Transparent community log showing how each reputation point was earned or lost.
              </p>
            </div>
            <span className="text-sm font-black text-primary">
              {profileUser.reputation} Reputation Points
            </span>
          </div>

          {userRepLogs.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No logged reputation activity yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4 rounded-l-xl">Timestamp</th>
                    <th className="py-2.5 px-4">Activity Reason</th>
                    <th className="py-2.5 px-4 rounded-r-xl text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {userRepLogs.map((log) => {
                    const isPositive = log.points > 0;
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                        <td className="py-3 px-4 font-mono text-gray-400 text-[11px]">
                          {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                          {log.reason}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded-full text-xs ${
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

        {/* User Questions & Answers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Questions Asked ({userQuestions.length})</h4>
            {userQuestions.length === 0 ? (
              <p className="text-xs text-gray-400">No questions asked yet.</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {userQuestions.map((q) => (
                  <Link key={q.id} href={`/questions/${q.id}`} className="py-2 block font-medium text-blue-600 hover:text-primary">
                    {q.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Answers Provided ({userAnswers.length})</h4>
            {userAnswers.length === 0 ? (
              <p className="text-xs text-gray-400">No answers posted yet.</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {userAnswers.map((a) => (
                  <Link key={a.id} href={`/questions/${a.questionId}`} className="py-2 block text-gray-700 dark:text-gray-300 hover:text-primary truncate">
                    &quot;{a.body.slice(0, 60)}...&quot;
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <RightSidebar />
    </div>
  );
}

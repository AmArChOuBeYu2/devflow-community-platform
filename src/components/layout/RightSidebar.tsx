"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCommunity } from "@/context/CommunityContext";
import { Sparkles, Award, TrendingUp, HelpCircle, ExternalLink, ShieldCheck } from "lucide-react";

export const RightSidebar: React.FC = () => {
  const { users } = useAuth();
  const { setFilterByTag } = useCommunity();

  const topTags = ["react", "typescript", "nextjs", "elevanceskills", "razorpay", "security", "node"];
  const leaderboardUsers = [...users].sort((a, b) => b.reputation - a.reputation).slice(0, 4);

  return (
    <aside className="w-72 shrink-0 hidden xl:block py-6 pl-6 space-y-6 text-xs">
      {/* Community Yellow Note */}
      <div className="bg-[#fdf7e2] dark:bg-amber-950/20 border border-[#f1e5bc] dark:border-amber-900/40 rounded-2xl p-4 text-gray-800 dark:text-gray-200 shadow-xs space-y-3">
        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-xs">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>The Overflow Blog & Meta</span>
        </h4>
        <ul className="space-y-2 text-[11px] text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <Link href="/community" className="hover:text-primary leading-tight">
              Announcing the Community Feed: Share code, showcases, and wins!
            </Link>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <Link href="/profile/security" className="hover:text-primary leading-tight">
              Enhanced Login Security: Active session tracking and OTP verification.
            </Link>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <Link href="/pricing" className="hover:text-primary leading-tight">
              Razorpay Subscription tiers now live in INR.
            </Link>
          </li>
        </ul>
      </div>

      {/* Trending Tags */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 bg-white dark:bg-gray-900 shadow-xs">
        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-xs mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span>Popular Community Tags</span>
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {topTags.map((tag) => (
            <Link
              key={tag}
              href={`/community?tag=${tag}`}
              onClick={() => setFilterByTag(tag)}
              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[11px] font-medium transition"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Top Contributors Leaderboard */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 bg-white dark:bg-gray-900 shadow-xs">
        <h4 className="font-bold text-gray-900 dark:text-white flex items-center justify-between text-xs mb-3">
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Top Contributors</span>
          </span>
          <Link href="/users" className="text-[10px] text-primary hover:underline font-semibold">
            View All
          </Link>
        </h4>
        <div className="space-y-2.5">
          {leaderboardUsers.map((u, idx) => (
            <div key={u.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-4 text-center font-bold text-gray-400 text-[11px]">
                  #{idx + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                <div>
                  <Link href={`/users/${u.id}`} className="font-medium hover:text-primary block text-[11px] text-gray-800 dark:text-gray-200">
                    {u.name}
                  </Link>
                  <span className="text-[10px] text-gray-400 capitalize">{u.tier} Tier</span>
                </div>
              </div>
              <span className="font-bold text-primary text-[11px]">{u.reputation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reputation Privileges Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-800 text-[11px] space-y-2 text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white text-xs">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>Privilege Thresholds</span>
        </div>
        <p className="flex justify-between"><span>Comment freely:</span> <strong className="text-gray-900 dark:text-white font-mono">50 pts</strong></p>
        <p className="flex justify-between"><span>Edit posts:</span> <strong className="text-gray-900 dark:text-white font-mono">100 pts</strong></p>
        <p className="flex justify-between"><span>Vote to close:</span> <strong className="text-gray-900 dark:text-white font-mono">250 pts</strong></p>
        <p className="flex justify-between"><span>Report content:</span> <strong className="text-gray-900 dark:text-white font-mono">500 pts</strong></p>
      </div>
    </aside>
  );
};

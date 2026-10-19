"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { useAuth } from "@/context/AuthContext";
import { useCommunity } from "@/context/CommunityContext";
import { Users as UsersIcon, Search, Award, MapPin, UserPlus, UserCheck } from "lucide-react";

export default function UsersPage() {
  const { users, user } = useAuth();
  const { toggleFollowUser, isFollowing } = useCommunity();
  const [query, setQuery] = useState("");

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.title?.toLowerCase().includes(query.toLowerCase()) ||
    u.location?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex w-full">
      <Sidebar />

      <main className="flex-1 py-6 md:px-6 space-y-6 min-w-0">
        <div className="space-y-1 pb-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-primary" />
            <span>Developer Community Members</span>
          </h1>
          <p className="text-xs text-gray-500">
            Connect with developers, check reputation points, and follow creators.
          </p>
        </div>

        <div className="max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search developers by name, title, or location..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u) => {
            const following = isFollowing(u.id);
            const isMe = user?.id === u.id;

            return (
              <div
                key={u.id}
                className="p-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start space-x-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-2xl object-cover shrink-0 shadow-xs" />
                  <div className="space-y-0.5 min-w-0">
                    <Link
                      href={`/users/${u.id}`}
                      className="font-bold text-sm text-gray-900 dark:text-white hover:text-primary transition block truncate"
                    >
                      {u.name}
                    </Link>
                    <p className="text-[11px] text-gray-400 truncate">{u.title || "Community Member"}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Award className="w-2.5 h-2.5" />
                        {u.reputation} pts
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        {u.tier}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {u.location?.split(",")[0] || "Global"}
                  </span>

                  {!isMe && user && (
                    <button
                      onClick={() => toggleFollowUser(u.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                        following
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                          : "bg-primary text-white hover:bg-primary-dark"
                      }`}
                    >
                      {following ? (
                        <>
                          <UserCheck className="w-3 h-3" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  )}
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

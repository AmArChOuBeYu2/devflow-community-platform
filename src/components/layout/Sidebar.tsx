"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSubscription } from "@/context/SubscriptionContext";
import {
  Home,
  HelpCircle,
  Tag,
  Users,
  Sparkles,
  CreditCard,
  Shield,
  Award,
  Zap,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { currentPlan, canAskQuestionToday } = useSubscription();

  const questionAllowance = canAskQuestionToday();

  const navItems = [
    { label: t.nav.home, href: "/", icon: Home },
    { label: t.nav.questions, href: "/questions", icon: HelpCircle },
    { label: t.nav.community, href: "/community", icon: Sparkles, badge: "NEW" },
    { label: t.nav.tags, href: "/tags", icon: Tag },
    { label: t.nav.users, href: "/users", icon: Users },
    { label: t.nav.pricing, href: "/pricing", icon: CreditCard },
  ];

  return (
    <aside className="w-56 shrink-0 hidden md:block py-6 pr-4 border-r border-gray-100 dark:border-gray-800 text-xs">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Main Feeds
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl font-medium transition ${
                    isActive
                      ? "bg-primary/10 text-primary font-bold shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-gray-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-black bg-primary text-white px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {user?.role === "admin" && (
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-red-500 mb-2">
              Moderation
            </p>
            <Link
              href="/admin/moderation"
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl font-medium transition ${
                pathname.startsWith("/admin")
                  ? "bg-red-50 dark:bg-red-950/40 text-red-600 font-bold"
                  : "text-red-600 hover:bg-red-50/50"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Moderation Dashboard</span>
            </Link>
          </div>
        )}

        {/* Plan Allowance Card */}
        <div className="p-3.5 bg-gradient-to-br from-gray-50 to-amber-50/40 dark:from-gray-800 dark:to-gray-800/60 rounded-2xl border border-amber-200/50 dark:border-gray-700 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Your Plan</span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${currentPlan.badgeColor}`}>
              {currentPlan.badgeName.split(" ")[0]}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Daily Questions
              </span>
              <span>
                {questionAllowance.remaining === "unlimited"
                  ? "Unlimited"
                  : `${questionAllowance.remaining}/${currentPlan.dailyQuestionLimit}`}
              </span>
            </div>
            {questionAllowance.remaining !== "unlimited" && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{
                    width: `${
                      ((Number(currentPlan.dailyQuestionLimit) - Number(questionAllowance.remaining)) /
                        Number(currentPlan.dailyQuestionLimit)) *
                      100
                    }%`,
                  }}
                />
              </div>
            )}
          </div>

          {currentPlan.tier !== "gold" && (
            <Link
              href="/pricing"
              className="block w-full py-1.5 px-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-center text-[10px] font-bold transition shadow-xs"
            >
              Upgrade for More Limit
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
};

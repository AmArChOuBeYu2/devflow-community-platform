"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useReputation } from "@/context/ReputationContext";
import { useSubscription, SUBSCRIPTION_PLANS } from "@/context/SubscriptionContext";
import { useCommunity } from "@/context/CommunityContext";
import { SupportedLanguage } from "@/types";
import {
  Globe,
  Bell,
  Search,
  Menu,
  X,
  Shield,
  Layers,
  Award,
  LogOut,
  User,
  CreditCard,
  Laptop,
  Check,
  ChevronDown,
  Sparkles,
  MessageSquare,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, users, switchUser, logout } = useAuth();
  const { language, t, initiateLanguageChange } = useLanguage();
  const { reputation } = useReputation();
  const { currentPlan } = useSubscription();
  const { notifications, markNotificationRead, clearAllNotifications } = useCommunity();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userSwitcherOpen, setUserSwitcherOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Close popups on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setUserSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/questions?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const languages: { code: SupportedLanguage; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
    { code: "pt", label: "Português", flag: "🇵🇹" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#da680f] to-[#f48225] flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              Dev<span className="text-primary">Flow</span>
            </span>
            <span className="text-[10px] block font-semibold text-gray-400 uppercase tracking-widest -mt-1">
              Community Platform
            </span>
          </div>
        </Link>

        {/* Global Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Link
            href="/questions"
            className="px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {t.nav.questions}
          </Link>
          <Link
            href="/community"
            className="px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-primary font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            {t.nav.community}
          </Link>
          <Link
            href="/tags"
            className="px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {t.nav.tags}
          </Link>
          <Link
            href="/users"
            className="px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {t.nav.users}
          </Link>
          <Link
            href="/pricing"
            className="px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-amber-600 dark:text-amber-400 font-semibold transition"
          >
            {t.nav.pricing}
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin/moderation"
              className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 font-semibold flex items-center gap-1 transition"
            >
              <Shield className="w-3.5 h-3.5" />
              {t.nav.admin}
            </Link>
          )}
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.nav.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
            />
          </div>
        </form>

        {/* Right side Actions */}
        <div className="flex items-center space-x-2">
          {/* Language Selector (Task 5: With OTP Verification) */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition"
              title="Change Language (OTP Protected)"
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">{currentLangObj.flag} {currentLangObj.code.toUpperCase()}</span>
              <span className="sm:hidden">{currentLangObj.flag}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Select Language (6 Supported)
                  </p>
                  <p className="text-[10px] text-primary mt-0.5">
                    • French: Email OTP
                    <br />
                    • Other 5: Mobile OTP
                  </p>
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLangDropdownOpen(false);
                      initiateLanguageChange(l.code);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                      language === l.code ? "font-bold text-primary bg-primary/5" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </span>
                    {language === l.code && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Evaluator / Mentor User Switcher */}
          <div className="relative hidden sm:block" ref={switcherRef}>
            <button
              onClick={() => setUserSwitcherOpen(!userSwitcherOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 hover:bg-amber-100 transition"
              title="Mentor evaluation quick user switcher"
            >
              <span>Switch User</span>
              <ChevronDown className="w-3 h-3 text-amber-600" />
            </button>

            {userSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 p-2 z-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">
                  Mentor Test Accounts (Tiers)
                </p>
                <div className="space-y-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setUserSwitcherOpen(false);
                      }}
                      className={`w-full p-2 text-left text-xs rounded-xl flex items-center justify-between transition ${
                        user?.id === u.id
                          ? "bg-primary/10 text-primary font-bold"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                        <div>
                          <p className="leading-tight">{u.name}</p>
                          <span className="text-[10px] font-semibold uppercase text-gray-400">
                            {u.tier} • {u.reputation} pts
                          </span>
                        </div>
                      </div>
                      {user?.id === u.id && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown (Task 1) */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifsOpen(!notifsOpen)}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {notifsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 py-3 z-50">
                <div className="px-4 pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Notifications ({notifications.length})
                  </h4>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 text-xs flex items-start space-x-3 cursor-pointer transition ${
                          n.isRead
                            ? "opacity-60 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            : "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={n.senderAvatar} alt={n.senderName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-gray-100 font-medium leading-snug">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth State */}
          {user ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                    {user.name.split(" ")[0]}
                  </span>
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                    <Award className="w-2.5 h-2.5" />
                    {reputation} pts
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 py-2 z-50 animate-in fade-in">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentPlan.badgeColor}`}>
                        {currentPlan.badgeName}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        {reputation} Rep
                      </span>
                    </div>
                  </div>

                  <div className="py-1 text-xs">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      {t.nav.myProfile}
                    </Link>
                    <Link
                      href="/profile/security"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <Laptop className="w-4 h-4 text-gray-400" />
                      {t.nav.sessions}
                    </Link>
                    <Link
                      href="/pricing"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      {t.subscription.activeSubscription}
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin/moderation"
                        onClick={() => setUserMenuOpen(false)}
                        className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-red-600 font-semibold"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Moderation Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.nav.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-semibold rounded-xl text-primary border border-primary/30 hover:bg-primary/5 transition"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark transition shadow-sm"
              >
                {t.nav.register}
              </Link>
            </div>
          )}

          {/* Ask Question CTA */}
          <Link
            href="/questions/ask"
            className="hidden sm:inline-flex items-center px-3.5 py-1.5 text-xs font-bold rounded-xl bg-primary hover:bg-primary-dark text-white shadow-sm transition"
          >
            {t.nav.askQuestion}
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.nav.searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              />
            </div>
          </form>

          <div className="flex flex-col space-y-1 text-sm font-medium">
            <Link
              href="/questions"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t.nav.questions}
            </Link>
            <Link
              href="/community"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-primary font-bold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              {t.nav.community}
            </Link>
            <Link
              href="/tags"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t.nav.tags}
            </Link>
            <Link
              href="/users"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t.nav.users}
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-amber-600 font-semibold"
            >
              {t.nav.pricing}
            </Link>
            <Link
              href="/questions/ask"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-primary text-white font-bold text-center"
            >
              {t.nav.askQuestion}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

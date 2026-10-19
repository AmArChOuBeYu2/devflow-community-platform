import {
  UserProfile,
  Question,
  Answer,
  CommunityPost,
  PostReport,
  NotificationItem,
  ReputationLog,
  ReputationTransfer,
  SubscriptionInvoice,
  SecurityAuditLog,
  UserSession,
} from "@/types";

const STORAGE_KEYS = {
  CURRENT_USER: "devflow_current_user",
  ALL_USERS: "devflow_all_users",
  QUESTIONS: "devflow_questions",
  ANSWERS: "devflow_answers",
  POSTS: "devflow_community_posts",
  REPORTS: "devflow_reports",
  NOTIFICATIONS: "devflow_notifications",
  REP_LOGS: "devflow_rep_logs",
  REP_TRANSFERS: "devflow_rep_transfers",
  INVOICES: "devflow_invoices",
  SESSIONS: "devflow_user_sessions",
  SECURITY_LOGS: "devflow_security_logs",
  OTP_STORE: "devflow_otp_store",
  LANGUAGE: "devflow_user_language",
};

// Seed Users
const SEED_USERS: UserProfile[] = [
  {
    id: "user-amar",
    name: "Amar Choubey",
    email: "sc62970@gmail.com",
    phone: "+91 9876543210",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "Full Stack Engineer & Community Contributor",
    bio: "Passionate web developer building modern applications with Next.js, React, and TypeScript. Intern at Elevance Skills.",
    location: "Jaipur, Rajasthan, India",
    website: "https://github.com/AmArChOuBeYu2",
    github: "AmArChOuBeYu2",
    tier: "bronze",
    reputation: 125,
    profileCompleted: true,
    role: "admin",
    createdAt: "2026-01-15T09:00:00Z",
    dailyQuestionsCount: {},
    dailyRepTransferCount: {},
    following: ["user-sarah", "user-alex"],
    bookmarks: ["post-1", "q-1"],
    trustedDevices: ["device-win-1"],
    sessionExpiryMinutes: 60,
  },
  {
    id: "user-sarah",
    name: "Sarah Chen",
    email: "sarah.chen@techdev.io",
    phone: "+1 4155552671",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    title: "Staff Frontend Architect",
    bio: "Frontend infrastructure, Web performance, React core fan. Love answering challenging concurrency questions.",
    location: "San Francisco, CA",
    tier: "gold",
    reputation: 1480,
    profileCompleted: true,
    role: "user",
    createdAt: "2025-05-10T08:00:00Z",
    dailyQuestionsCount: {},
    dailyRepTransferCount: {},
    following: ["user-amar"],
    bookmarks: [],
    trustedDevices: [],
    sessionExpiryMinutes: 60,
  },
  {
    id: "user-alex",
    name: "Alex Rivera",
    email: "alex.rivera@devpulse.org",
    phone: "+1 2125550199",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    title: "Backend & Distributed Systems Dev",
    bio: "Node.js, Go, Redis, Microservices architecture. Open source contributor.",
    location: "Austin, TX",
    tier: "silver",
    reputation: 630,
    profileCompleted: true,
    role: "user",
    createdAt: "2025-08-20T10:30:00Z",
    dailyQuestionsCount: {},
    dailyRepTransferCount: {},
    following: [],
    bookmarks: [],
    trustedDevices: [],
    sessionExpiryMinutes: 60,
  },
  {
    id: "user-priya",
    name: "Priya Sharma",
    email: "priya.sharma@cloudlab.in",
    phone: "+91 9123456780",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    title: "DevOps & Cloud Engineer",
    bio: "Kubernetes, Docker, CI/CD pipelines, and cloud automation.",
    location: "Bengaluru, India",
    tier: "bronze",
    reputation: 390,
    profileCompleted: true,
    role: "user",
    createdAt: "2025-11-12T14:15:00Z",
    dailyQuestionsCount: {},
    dailyRepTransferCount: {},
    following: ["user-amar"],
    bookmarks: [],
    trustedDevices: [],
    sessionExpiryMinutes: 60,
  },
  {
    id: "user-david",
    name: "David Kim",
    email: "david.kim@learner.net",
    phone: "+82 1012345678",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    title: "Junior Web Developer",
    bio: "Currently studying JavaScript and React fundamentals.",
    location: "Seoul, South Korea",
    tier: "free",
    reputation: 40,
    profileCompleted: false,
    role: "user",
    createdAt: "2026-02-01T11:00:00Z",
    dailyQuestionsCount: {},
    dailyRepTransferCount: {},
    following: [],
    bookmarks: [],
    trustedDevices: [],
    sessionExpiryMinutes: 60,
  },
];

// Seed Questions
const SEED_QUESTIONS: Question[] = [
  {
    id: "q-1",
    title: "How to properly debounce search inputs in React 19 without extra renders?",
    body: "I am implementing a live search input in React 19 with Next.js App Router. Whenever the user types rapidly, an excessive number of API calls are dispatched. I tried `useCallback` with `setTimeout`, but the timer resets on every re-render. What is the modern, cleanest approach to create a stable debounced input in React?",
    tags: ["react", "typescript", "debounce", "nextjs"],
    authorId: "user-amar",
    authorName: "Amar Choubey",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    authorTier: "bronze",
    authorReputation: 125,
    createdAt: "2026-10-18T10:15:00Z",
    votes: 14,
    votedUserIds: { "user-sarah": 1, "user-alex": 1, "user-priya": 1 },
    answersCount: 2,
    views: 342,
    acceptedAnswerId: "ans-1",
  },
  {
    id: "q-2",
    title: "Difference between server components and client components in Next.js 15",
    body: "In Next.js 15, when should I default to Server Components versus adding 'use client'? Is there any performance penalty if a parent Server Component imports a Client Component?",
    tags: ["nextjs", "react", "architecture", "performance"],
    authorId: "user-david",
    authorName: "David Kim",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    authorTier: "free",
    authorReputation: 40,
    createdAt: "2026-10-17T14:30:00Z",
    votes: 8,
    votedUserIds: { "user-sarah": 1, "user-amar": 1 },
    answersCount: 1,
    views: 189,
  },
  {
    id: "q-3",
    title: "How to configure Razorpay webhook signatures in Node.js serverless functions?",
    body: "When listening for `payment.captured` webhooks in Razorpay, how can we reliably verify the `X-Razorpay-Signature` using crypto HMAC SHA256 in a serverless environment like Vercel?",
    tags: ["razorpay", "nodejs", "security", "webhooks"],
    authorId: "user-alex",
    authorName: "Alex Rivera",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    authorTier: "silver",
    authorReputation: 630,
    createdAt: "2026-10-15T09:20:00Z",
    votes: 21,
    votedUserIds: { "user-amar": 1, "user-sarah": 1, "user-priya": 1 },
    answersCount: 1,
    views: 512,
    acceptedAnswerId: "ans-3",
  },
];

// Seed Answers
const SEED_ANSWERS: Answer[] = [
  {
    id: "ans-1",
    questionId: "q-1",
    body: `The cleanest and standard approach in React 19 is using a custom \`useDebounce\` hook with \`useEffect\` or \`useRef\`:

\`\`\`typescript
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
\`\`\`

Usage in your component:
\`\`\`typescript
const [query, setQuery] = useState("");
const debouncedQuery = useDebounce(query, 400);

useEffect(() => {
  if (debouncedQuery.trim()) {
    fetchResults(debouncedQuery);
  }
}, [debouncedQuery]);
\`\`\`
This prevents unnecessary state updates and guarantees no memory leaks upon unmount!`,
    authorId: "user-sarah",
    authorName: "Sarah Chen",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    authorTier: "gold",
    authorReputation: 1480,
    createdAt: "2026-10-18T11:05:00Z",
    votes: 18,
    votedUserIds: { "user-amar": 1, "user-alex": 1, "user-priya": 1 },
    isAccepted: true,
  },
  {
    id: "ans-2",
    questionId: "q-1",
    body: `Another performant alternative if you only want to throttle an action without synchronizing a separate state is wrapping the change handler in lodash.debounce or a native timer ref.`,
    authorId: "user-priya",
    authorName: "Priya Sharma",
    authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    authorTier: "bronze",
    authorReputation: 390,
    createdAt: "2026-10-18T12:40:00Z",
    votes: 3,
    votedUserIds: { "user-david": 1 },
    isAccepted: false,
  },
  {
    id: "ans-3",
    questionId: "q-3",
    body: `Use Node's native \`crypto\` module:
\`\`\`javascript
const crypto = require("crypto");

function verifyRazorpaySignature(body, signature, secret) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}
\`\`\`
Make sure you pass the raw request buffer or string body rather than parsed JSON!`,
    authorId: "user-amar",
    authorName: "Amar Choubey",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    authorTier: "bronze",
    authorReputation: 125,
    createdAt: "2026-10-15T10:00:00Z",
    votes: 9,
    votedUserIds: { "user-alex": 1, "user-sarah": 1 },
    isAccepted: true,
  },
];

// Seed Community Posts
const SEED_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    authorId: "user-amar",
    authorName: "Amar Choubey",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    authorTier: "bronze",
    authorReputation: 125,
    type: "achievement",
    content: "Excited to share that I have completed the comprehensive Full-Stack Web Development training and launched our new developer community platform! Built with Next.js 15, TypeScript, Tailwind CSS, and Razorpay.",
    achievement: {
      title: "Completed Elevance Skills Full-Stack Web Development Training",
      badgeName: "Full Stack Pioneer",
    },
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    tags: ["elevanceskills", "webdevelopment", "achievement", "nextjs"],
    createdAt: "2026-10-19T08:30:00Z",
    likes: ["user-sarah", "user-alex", "user-priya"],
    sharesCount: 5,
    comments: [
      {
        id: "c-1",
        authorId: "user-sarah",
        authorName: "Sarah Chen",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        content: "Huge congratulations Amar! The platform architecture looks exceptionally clean and fast.",
        createdAt: "2026-10-19T08:45:00Z",
        replies: [
          {
            id: "cr-1",
            authorId: "user-amar",
            authorName: "Amar Choubey",
            authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            content: "Thank you Sarah! Appreciate your mentorship throughout the training.",
            createdAt: "2026-10-19T09:00:00Z",
          },
        ],
      },
    ],
    status: "active",
  },
  {
    id: "post-2",
    authorId: "user-sarah",
    authorName: "Sarah Chen",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    authorTier: "gold",
    authorReputation: 1480,
    type: "snippet",
    content: "Here is a lightweight hook to detect and persist active session activity with idle auto-logout support. Great for security compliance!",
    codeSnippet: {
      language: "typescript",
      code: `function useIdleTimer(timeoutMs = 15 * 60 * 1000, onIdle) {
  useEffect(() => {
    let timer = setTimeout(onIdle, timeoutMs);
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(onIdle, timeoutMs);
    };
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
    };
  }, [timeoutMs, onIdle]);
}`,
    },
    tags: ["typescript", "security", "react", "hooks"],
    createdAt: "2026-10-18T16:20:00Z",
    likes: ["user-amar", "user-priya"],
    sharesCount: 3,
    comments: [],
    status: "active",
  },
  {
    id: "post-3",
    authorId: "user-alex",
    authorName: "Alex Rivera",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    authorTier: "silver",
    authorReputation: 630,
    type: "showcase",
    content: "Just deployed our serverless event telemetry worker. Handles 50k events/sec with sub-5ms p99 latency.",
    projectShowcase: {
      title: "PulseEvent: Serverless Telemetry Pipeline",
      liveUrl: "https://pulse-event-demo.vercel.app",
      githubUrl: "https://github.com/alexrivera/pulse-event",
    },
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    tags: ["showcase", "serverless", "performance", "go"],
    createdAt: "2026-10-17T12:00:00Z",
    likes: ["user-amar", "user-sarah", "user-david"],
    sharesCount: 8,
    comments: [],
    status: "active",
  },
];

// Seed Sessions
const SEED_SESSIONS: UserSession[] = [
  {
    id: "session-current",
    userId: "user-amar",
    browser: "Chrome 128.0 (Windows)",
    os: "Windows 11 x64",
    deviceType: "Desktop",
    ip: "103.87.58.12",
    location: "Jaipur, Rajasthan, India",
    createdAt: "2026-10-19T06:30:00Z",
    lastActiveAt: "2026-10-19T11:50:00Z",
    isCurrent: true,
    isTrusted: true,
  },
  {
    id: "session-mobile",
    userId: "user-amar",
    browser: "Safari Mobile 18.0 (iOS)",
    os: "iOS 18.1 (iPhone 15 Pro)",
    deviceType: "Mobile",
    ip: "157.34.192.45",
    location: "Bengaluru, Karnataka, India",
    createdAt: "2026-10-18T14:10:00Z",
    lastActiveAt: "2026-10-18T18:22:00Z",
    isCurrent: false,
    isTrusted: true,
  },
  {
    id: "session-laptop",
    userId: "user-amar",
    browser: "Firefox 130.0 (macOS)",
    os: "macOS Sonoma",
    deviceType: "Desktop",
    ip: "49.36.12.89",
    location: "New Delhi, India",
    createdAt: "2026-10-14T09:00:00Z",
    lastActiveAt: "2026-10-15T11:45:00Z",
    isCurrent: false,
    isTrusted: false,
  },
];

// Seed Invoices
const SEED_INVOICES: SubscriptionInvoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2026-0091",
    userId: "user-amar",
    userName: "Amar Choubey",
    userEmail: "sc62970@gmail.com",
    planTier: "bronze",
    amount: 99,
    status: "paid",
    paymentMethod: "Razorpay UPI (GooglePay)",
    paymentId: "pay_Rzp19A440Xz9",
    billingDate: "2026-10-01T10:00:00Z",
    renewalDate: "2026-11-01T10:00:00Z",
  },
];

// Seed Reputation Logs
const SEED_REP_LOGS: ReputationLog[] = [
  {
    id: "rep-1",
    userId: "user-amar",
    points: 10,
    reason: "Profile completion bonus (10 points awarded)",
    createdAt: "2026-01-15T09:30:00Z",
  },
  {
    id: "rep-2",
    userId: "user-amar",
    points: 5,
    reason: "Posted answer to question #q-3",
    createdAt: "2026-10-15T10:00:00Z",
    relatedEntityId: "ans-3",
  },
  {
    id: "rep-3",
    userId: "user-amar",
    points: 10,
    reason: "Answer marked as accepted on question #q-3",
    createdAt: "2026-10-15T12:00:00Z",
    relatedEntityId: "ans-3",
  },
  {
    id: "rep-4",
    userId: "user-amar",
    points: 5,
    reason: "Answer reached 5 upvotes milestone on question #q-3",
    createdAt: "2026-10-16T15:20:00Z",
    relatedEntityId: "ans-3",
  },
  {
    id: "rep-5",
    userId: "user-amar",
    points: 2,
    reason: "Question #q-1 received 10+ upvotes milestone",
    createdAt: "2026-10-18T18:00:00Z",
    relatedEntityId: "q-1",
  },
];

// Storage Helper functions
export const Storage = {
  isBrowser(): boolean {
    return typeof window !== "undefined";
  },

  get<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser()) return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error:", e);
    }
  },

  init(): void {
    if (!this.isBrowser()) return;

    if (!localStorage.getItem(STORAGE_KEYS.ALL_USERS)) {
      this.set(STORAGE_KEYS.ALL_USERS, SEED_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.set(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
      this.set(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ANSWERS)) {
      this.set(STORAGE_KEYS.ANSWERS, SEED_ANSWERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      this.set(STORAGE_KEYS.POSTS, SEED_POSTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
      this.set(STORAGE_KEYS.SESSIONS, SEED_SESSIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
      this.set(STORAGE_KEYS.INVOICES, SEED_INVOICES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REP_LOGS)) {
      this.set(STORAGE_KEYS.REP_LOGS, SEED_REP_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      this.set(STORAGE_KEYS.REPORTS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REP_TRANSFERS)) {
      this.set(STORAGE_KEYS.REP_TRANSFERS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.set(STORAGE_KEYS.NOTIFICATIONS, [
        {
          id: "notif-1",
          userId: "user-amar",
          senderId: "user-sarah",
          senderName: "Sarah Chen",
          senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
          type: "comment",
          message: "Sarah Chen commented on your community update",
          link: "/community",
          isRead: false,
          createdAt: "2026-10-19T08:45:00Z",
        },
      ]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SECURITY_LOGS)) {
      this.set(STORAGE_KEYS.SECURITY_LOGS, [
        {
          id: "sec-1",
          userId: "user-amar",
          userName: "Amar Choubey",
          action: "login_success",
          browser: "Chrome 128.0 (Windows)",
          os: "Windows 11",
          deviceType: "Desktop",
          ip: "103.87.58.12",
          location: "Jaipur, Rajasthan, India",
          timestamp: "2026-10-19T06:30:00Z",
          details: "Successful authenticated login from trusted device.",
        },
      ]);
    }
  },

  getCurrentUser(): UserProfile {
    return this.get<UserProfile>(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]);
  },

  setCurrentUser(user: UserProfile): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
    // Also sync to all users
    const allUsers = this.getAllUsers().map((u) => (u.id === user.id ? user : u));
    this.set(STORAGE_KEYS.ALL_USERS, allUsers);
  },

  getAllUsers(): UserProfile[] {
    return this.get<UserProfile[]>(STORAGE_KEYS.ALL_USERS, SEED_USERS);
  },

  getQuestions(): Question[] {
    return this.get<Question[]>(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
  },

  saveQuestions(questions: Question[]): void {
    this.set(STORAGE_KEYS.QUESTIONS, questions);
  },

  getAnswers(): Answer[] {
    return this.get<Answer[]>(STORAGE_KEYS.ANSWERS, SEED_ANSWERS);
  },

  saveAnswers(answers: Answer[]): void {
    this.set(STORAGE_KEYS.ANSWERS, answers);
  },

  getPosts(): CommunityPost[] {
    return this.get<CommunityPost[]>(STORAGE_KEYS.POSTS, SEED_POSTS);
  },

  savePosts(posts: CommunityPost[]): void {
    this.set(STORAGE_KEYS.POSTS, posts);
  },

  getReports(): PostReport[] {
    return this.get<PostReport[]>(STORAGE_KEYS.REPORTS, []);
  },

  saveReports(reports: PostReport[]): void {
    this.set(STORAGE_KEYS.REPORTS, reports);
  },

  getSessions(): UserSession[] {
    return this.get<UserSession[]>(STORAGE_KEYS.SESSIONS, SEED_SESSIONS);
  },

  saveSessions(sessions: UserSession[]): void {
    this.set(STORAGE_KEYS.SESSIONS, sessions);
  },

  getInvoices(): SubscriptionInvoice[] {
    return this.get<SubscriptionInvoice[]>(STORAGE_KEYS.INVOICES, SEED_INVOICES);
  },

  saveInvoices(invoices: SubscriptionInvoice[]): void {
    this.set(STORAGE_KEYS.INVOICES, invoices);
  },

  getReputationLogs(): ReputationLog[] {
    return this.get<ReputationLog[]>(STORAGE_KEYS.REP_LOGS, SEED_REP_LOGS);
  },

  saveReputationLogs(logs: ReputationLog[]): void {
    this.set(STORAGE_KEYS.REP_LOGS, logs);
  },

  getRepTransfers(): ReputationTransfer[] {
    return this.get<ReputationTransfer[]>(STORAGE_KEYS.REP_TRANSFERS, []);
  },

  saveRepTransfers(transfers: ReputationTransfer[]): void {
    this.set(STORAGE_KEYS.REP_TRANSFERS, transfers);
  },

  getNotifications(): NotificationItem[] {
    return this.get<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  },

  saveNotifications(notifs: NotificationItem[]): void {
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  getSecurityLogs(): SecurityAuditLog[] {
    return this.get<SecurityAuditLog[]>(STORAGE_KEYS.SECURITY_LOGS, []);
  },

  saveSecurityLogs(logs: SecurityAuditLog[]): void {
    this.set(STORAGE_KEYS.SECURITY_LOGS, logs);
  },
};

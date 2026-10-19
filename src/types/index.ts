export type UserTier = "free" | "bronze" | "silver" | "gold";

export type SupportedLanguage = "en" | "es" | "hi" | "pt" | "zh" | "fr";

export interface UserSession {
  id: string;
  userId: string;
  browser: string;
  os: string;
  deviceType: "Desktop" | "Mobile" | "Tablet";
  ip: string;
  location: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent?: boolean;
  isTrusted?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  title: string;
  bio: string;
  location: string;
  website?: string;
  github?: string;
  tier: UserTier;
  reputation: number;
  profileCompleted: boolean;
  role: "user" | "admin";
  createdAt: string;
  dailyQuestionsCount: { [dateKey: string]: number };
  dailyRepTransferCount: { [dateKey: string]: number };
  forgotPasswordLastRequestedAt?: string; // YYYY-MM-DD
  following: string[]; // user IDs
  bookmarks: string[]; // post/question IDs
  trustedDevices: string[]; // device IDs
  sessionExpiryMinutes: number; // default 60
}

export interface Question {
  id: string;
  title: string;
  body: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorTier: UserTier;
  authorReputation: number;
  createdAt: string;
  votes: number;
  votedUserIds: { [userId: string]: 1 | -1 };
  answersCount: number;
  views: number;
  acceptedAnswerId?: string;
  isClosed?: boolean;
  closedReason?: string;
  closeVotes?: string[]; // user IDs who voted to close
}

export interface Answer {
  id: string;
  questionId: string;
  body: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorTier: UserTier;
  authorReputation: number;
  createdAt: string;
  votes: number;
  votedUserIds: { [userId: string]: 1 | -1 };
  isAccepted: boolean;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorTier: UserTier;
  authorReputation: number;
  type: "update" | "snippet" | "showcase" | "achievement";
  content: string;
  imageUrl?: string;
  codeSnippet?: {
    code: string;
    language: string;
  };
  projectShowcase?: {
    title: string;
    liveUrl?: string;
    githubUrl?: string;
  };
  achievement?: {
    title: string;
    badgeName: string;
  };
  tags: string[];
  createdAt: string;
  likes: string[]; // user IDs
  sharesCount: number;
  comments: Comment[];
  isEdited?: boolean;
  editedAt?: string;
  reportsCount?: number;
  status?: "active" | "flagged" | "removed";
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  replies?: CommentReply[];
}

export interface CommentReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface PostReport {
  id: string;
  postId: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  details?: string;
  createdAt: string;
  status: "pending" | "resolved" | "dismissed";
  postSnippet: string;
  postAuthorId: string;
  postAuthorName: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: "like" | "comment" | "mention" | "follow" | "reputation" | "security" | "subscription";
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReputationLog {
  id: string;
  userId: string;
  points: number; // positive or negative
  reason: string;
  createdAt: string;
  relatedEntityId?: string;
}

export interface ReputationTransfer {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export interface SubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  planTier: UserTier;
  amount: number; // in INR
  status: "paid" | "failed" | "demo";
  paymentMethod: string;
  paymentId: string;
  billingDate: string;
  renewalDate: string;
  invoiceUrl?: string;
}

export interface SecurityAuditLog {
  id: string;
  userId: string;
  userName: string;
  action: "login_success" | "login_failed" | "otp_requested" | "otp_verified" | "session_revoked" | "new_device_detected" | "password_reset";
  browser: string;
  os: string;
  deviceType: string;
  ip: string;
  location: string;
  timestamp: string;
  details?: string;
}

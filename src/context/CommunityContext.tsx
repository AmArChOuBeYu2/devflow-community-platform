"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CommunityPost, Comment, PostReport, NotificationItem } from "@/types";
import { Storage } from "@/lib/storage";
import { useAuth } from "./AuthContext";
import { useReputation } from "./ReputationContext";

interface CommunityContextType {
  posts: CommunityPost[];
  reports: PostReport[];
  notifications: NotificationItem[];
  createPost: (data: Partial<CommunityPost>) => void;
  editPost: (postId: string, content: string) => { success: boolean; message: string };
  deletePost: (postId: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  addReply: (postId: string, commentId: string, content: string) => void;
  sharePost: (postId: string) => string;
  toggleBookmark: (postId: string) => { success: boolean; message: string };
  toggleFollowUser: (targetUserId: string) => void;
  isFollowing: (targetUserId: string) => boolean;
  reportPost: (postId: string, reason: string, details?: string) => { success: boolean; message: string };
  adminReviewReport: (reportId: string, action: "resolve_delete" | "dismiss" | "suspend_user") => void;
  markNotificationRead: (notifId: string) => void;
  clearAllNotifications: () => void;
  getTrendingPosts: () => CommunityPost[];
  filterByTag: string | null;
  setFilterByTag: (tag: string | null) => void;
  feedTab: "all" | "following";
  setFeedTab: (tab: "all" | "following") => void;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, users, updateProfile, suspendUser } = useAuth();
  const { deductPoints, canEditCommunityPosts, canReportContent } = useReputation();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [reports, setReports] = useState<PostReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterByTag, setFilterByTag] = useState<string | null>(null);
  const [feedTab, setFeedTab] = useState<"all" | "following">("all");

  useEffect(() => {
    setPosts(Storage.getPosts());
    setReports(Storage.getReports());
    setNotifications(Storage.getNotifications());
  }, []);

  const createPost = (data: Partial<CommunityPost>) => {
    if (!user) return;

    // Extract hashtags from content automatically
    const extractedTags = (data.content?.match(/#[a-z0-9_-]+/gi) || []).map((t) =>
      t.substring(1).toLowerCase()
    );
    const combinedTags = Array.from(new Set([...(data.tags || []), ...extractedTags]));

    const newPost: CommunityPost = {
      id: "post-" + Date.now(),
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorTier: user.tier,
      authorReputation: user.reputation,
      type: data.type || "update",
      content: data.content || "",
      imageUrl: data.imageUrl,
      codeSnippet: data.codeSnippet,
      projectShowcase: data.projectShowcase,
      achievement: data.achievement,
      tags: combinedTags,
      createdAt: new Date().toISOString(),
      likes: [],
      sharesCount: 0,
      comments: [],
      status: "active",
    };

    // Check for mentions (@username)
    const mentions = data.content?.match(/@[a-zA-Z0-9_]+/g) || [];
    mentions.forEach((mention) => {
      const targetName = mention.substring(1).toLowerCase();
      const mentionedUser = users.find((u) => u.name.toLowerCase().includes(targetName));
      if (mentionedUser && mentionedUser.id !== user.id) {
        addNotification(
          mentionedUser.id,
          "mention",
          `${user.name} mentioned you in a community post: "${data.content?.slice(0, 40)}..."`,
          "/community"
        );
      }
    });

    const updated = [newPost, ...posts];
    setPosts(updated);
    Storage.savePosts(updated);
  };

  const editPost = (postId: string, content: string): { success: boolean; message: string } => {
    const post = posts.find((p) => p.id === postId);
    if (!post || !user) return { success: false, message: "Post not found or unauthenticated." };

    // Author can edit, OR users with >= 100 reputation can edit community posts
    const isAuthor = post.authorId === user.id;
    if (!isAuthor && !canEditCommunityPosts) {
      return {
        success: false,
        message: "Editing community posts requires 100+ reputation points.",
      };
    }

    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          content,
          isEdited: true,
          editedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    setPosts(updated);
    Storage.savePosts(updated);
    return { success: true, message: "Post updated successfully." };
  };

  const deletePost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post || !user) return;

    if (post.authorId !== user.id && user.role !== "admin") return;

    const updated = posts.filter((p) => p.id !== postId);
    setPosts(updated);
    Storage.savePosts(updated);
  };

  const toggleLike = (postId: string) => {
    if (!user) return;

    const updated = posts.map((p) => {
      if (p.id !== postId) return p;

      const hasLiked = p.likes.includes(user.id);
      const newLikes = hasLiked ? p.likes.filter((id) => id !== user.id) : [...p.likes, user.id];

      if (!hasLiked && p.authorId !== user.id) {
        addNotification(p.authorId, "like", `${user.name} liked your post.`, "/community");
      }

      return { ...p, likes: newLikes };
    });

    setPosts(updated);
    Storage.savePosts(updated);
  };

  const addComment = (postId: string, content: string) => {
    if (!user) return;

    const newComment: Comment = {
      id: "c-" + Date.now(),
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      content,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    const updated = posts.map((p) => {
      if (p.id !== postId) return p;

      if (p.authorId !== user.id) {
        addNotification(
          p.authorId,
          "comment",
          `${user.name} commented on your post: "${content.slice(0, 30)}..."`,
          "/community"
        );
      }

      return {
        ...p,
        comments: [...p.comments, newComment],
      };
    });

    setPosts(updated);
    Storage.savePosts(updated);
  };

  const addReply = (postId: string, commentId: string, content: string) => {
    if (!user) return;

    const newReply = {
      id: "cr-" + Date.now(),
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      content,
      createdAt: new Date().toISOString(),
    };

    const updated = posts.map((p) => {
      if (p.id !== postId) return p;

      const newComments = p.comments.map((c) => {
        if (c.id !== commentId) return c;

        if (c.authorId !== user.id) {
          addNotification(
            c.authorId,
            "comment",
            `${user.name} replied to your comment: "${content.slice(0, 30)}..."`,
            "/community"
          );
        }

        return {
          ...c,
          replies: [...(c.replies || []), newReply],
        };
      });

      return { ...p, comments: newComments };
    });

    setPosts(updated);
    Storage.savePosts(updated);
  };

  const sharePost = (postId: string): string => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        return { ...p, sharesCount: p.sharesCount + 1 };
      }
      return p;
    });

    setPosts(updated);
    Storage.savePosts(updated);

    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/community#${postId}`;
      navigator.clipboard?.writeText(shareUrl);
      return shareUrl;
    }
    return "";
  };

  const toggleBookmark = (postId: string): { success: boolean; message: string } => {
    if (!user) return { success: false, message: "Please log in to bookmark posts." };

    const isBookmarked = user.bookmarks.includes(postId);
    const isSilverOrGold = user.tier === "silver" || user.tier === "gold";

    // Silver and Gold have unlimited bookmarks; free/bronze limited to 5
    if (!isBookmarked && !isSilverOrGold && user.bookmarks.length >= 5) {
      return {
        success: false,
        message: "Bookmark limit reached (5 max for Free/Bronze). Upgrade to Silver or Gold for unlimited bookmarks!",
      };
    }

    const newBookmarks = isBookmarked
      ? user.bookmarks.filter((id) => id !== postId)
      : [...user.bookmarks, postId];

    updateProfile({ bookmarks: newBookmarks });
    return {
      success: true,
      message: isBookmarked ? "Post removed from bookmarks." : "Post bookmarked successfully!",
    };
  };

  const toggleFollowUser = (targetUserId: string) => {
    if (!user || user.id === targetUserId) return;

    const isFollowingNow = user.following.includes(targetUserId);
    const newFollowing = isFollowingNow
      ? user.following.filter((id) => id !== targetUserId)
      : [...user.following, targetUserId];

    updateProfile({ following: newFollowing });

    if (!isFollowingNow) {
      addNotification(targetUserId, "follow", `${user.name} started following you!`, `/users/${user.id}`);
    }
  };

  const isFollowing = (targetUserId: string): boolean => {
    return user?.following.includes(targetUserId) || false;
  };

  const reportPost = (postId: string, reason: string, details?: string): { success: boolean; message: string } => {
    if (!user) return { success: false, message: "Please log in." };

    if (!canReportContent && user.role !== "admin") {
      return {
        success: false,
        message: "Reporting content requires 500+ reputation points.",
      };
    }

    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return { success: false, message: "Post not found." };

    const newReport: PostReport = {
      id: "rep-" + Date.now(),
      postId,
      reporterId: user.id,
      reporterName: user.name,
      reason,
      details,
      createdAt: new Date().toISOString(),
      status: "pending",
      postSnippet: targetPost.content.slice(0, 100),
      postAuthorId: targetPost.authorId,
      postAuthorName: targetPost.authorName,
    };

    const updated = [newReport, ...reports];
    setReports(updated);
    Storage.saveReports(updated);

    return {
      success: true,
      message: "Report submitted to administrators for review.",
    };
  };

  const adminReviewReport = (reportId: string, action: "resolve_delete" | "dismiss" | "suspend_user") => {
    const report = reports.find((r) => r.id === reportId);
    if (!report || report.status !== "pending" || user?.role !== "admin") return;

    if (action === "resolve_delete") {
      // Remove post
      deletePost(report.postId);
      // Deduct 10 points for guideline violation
      deductPoints(10, `Post removed by admin due to reported guideline violation (#${report.reason})`, report.postId, report.postAuthorId);
    } else if (action === "suspend_user") {
      // Remove the violating content, suspend the account, and apply the specified demo penalty.
      deletePost(report.postId);
      suspendUser(report.postAuthorId);
      deductPoints(50, `Account suspended for repeated guideline violations (report ${report.id})`, report.postId, report.postAuthorId);
    }

    const updatedReports = reports.map((r) =>
      r.id === reportId ? { ...r, status: (action === "dismiss" ? "dismissed" : "resolved") as "dismissed" | "resolved" } : r
    );
    setReports(updatedReports);
    Storage.saveReports(updatedReports);
  };

  const addNotification = (
    targetUserId: string,
    type: NotificationItem["type"],
    message: string,
    link?: string
  ) => {
    const newNotif: NotificationItem = {
      id: "notif-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      userId: targetUserId,
      senderId: user?.id || "system",
      senderName: user?.name || "DevFlow Community",
      senderAvatar: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      type,
      message,
      link,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    Storage.saveNotifications(updated);
  };

  const markNotificationRead = (notifId: string) => {
    const updated = notifications.map((n) => (n.id === notifId ? { ...n, isRead: true } : n));
    setNotifications(updated);
    Storage.saveNotifications(updated);
  };

  const clearAllNotifications = () => {
    const updated = notifications.filter((n) => n.userId !== user?.id);
    setNotifications(updated);
    Storage.saveNotifications(updated);
  };

  const getTrendingPosts = (): CommunityPost[] => {
    return [...posts]
      .filter((p) => p.status === "active")
      .sort((a, b) => {
        const scoreA = a.likes.length * 2 + a.comments.length * 3 + a.sharesCount * 4;
        const scoreB = b.likes.length * 2 + b.comments.length * 3 + b.sharesCount * 4;
        return scoreB - scoreA;
      })
      .slice(0, 5);
  };

  return (
    <CommunityContext.Provider
      value={{
        posts,
        reports,
        notifications: notifications.filter((n) => n.userId === user?.id),
        createPost,
        editPost,
        deletePost,
        toggleLike,
        addComment,
        addReply,
        sharePost,
        toggleBookmark,
        toggleFollowUser,
        isFollowing,
        reportPost,
        adminReviewReport,
        markNotificationRead,
        clearAllNotifications,
        getTrendingPosts,
        filterByTag,
        setFilterByTag,
        feedTab,
        setFeedTab,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) throw new Error("useCommunity must be used within a CommunityProvider");
  return context;
};

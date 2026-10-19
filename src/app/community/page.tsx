"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { useCommunity } from "@/context/CommunityContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useReputation } from "@/context/ReputationContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { ReportModal } from "@/components/modals/ReportModal";
import { CommunityPost } from "@/types";
import {
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Edit3,
  Trash2,
  Flag,
  UserPlus,
  UserCheck,
  Code2,
  Globe,
  Award,
  ExternalLink,
  Github,
  TrendingUp,
  Image as ImageIcon,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Send,
  Loader2,
} from "lucide-react";

export default function CommunityFeedPage() {
  const {
    posts,
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
    filterByTag,
    setFilterByTag,
    feedTab,
    setFeedTab,
    getTrendingPosts,
  } = useCommunity();

  const { user } = useAuth();
  const { t } = useLanguage();
  const { canEditCommunityPosts, canCommentWithoutRestrictions, canReportContent } = useReputation();
  const { currentTier } = useSubscription();

  // Post Creator State
  const [postType, setPostType] = useState<"update" | "snippet" | "showcase" | "achievement">("update");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [code, setCode] = useState("");
  const [codeLang, setCodeLang] = useState("typescript");
  const [showcaseTitle, setShowcaseTitle] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [achievementTitle, setAchievementTitle] = useState("");
  const [achievementBadge, setAchievementBadge] = useState("Full Stack Pioneer");

  // Interaction State
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [replyInputs, setReplyInputs] = useState<{ [commentId: string]: string }>({});
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContentText, setEditContentText] = useState("");
  const [reportModalPostId, setReportModalPostId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  // Pagination Simulation
  const [visibleCount, setVisibleCount] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please log in to share with the community.");
      return;
    }
    if (!content.trim()) {
      showToast("Please add some text description to your post.");
      return;
    }

    const newPostData: Partial<CommunityPost> = {
      type: postType,
      content,
      imageUrl: imageUrl.trim() || undefined,
    };

    if (postType === "snippet") {
      newPostData.codeSnippet = {
        code: code || "// Code sample\nconsole.log('Hello Community');",
        language: codeLang,
      };
    } else if (postType === "showcase") {
      newPostData.projectShowcase = {
        title: showcaseTitle || "My Showcase Project",
        liveUrl: liveUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
      };
    } else if (postType === "achievement") {
      newPostData.achievement = {
        title: achievementTitle || "Milestone Achieved",
        badgeName: achievementBadge,
      };
    }

    createPost(newPostData);
    setContent("");
    setImageUrl("");
    setCode("");
    setShowcaseTitle("");
    setLiveUrl("");
    setGithubUrl("");
    setAchievementTitle("");
    showToast("Post shared to community feed!");
  };

  const handleEditSubmit = (postId: string) => {
    const res = editPost(postId, editContentText);
    if (res.success) {
      setEditingPostId(null);
      showToast(res.message);
    } else {
      showToast(res.message);
    }
  };

  const handleBookmarkClick = (postId: string) => {
    const res = toggleBookmark(postId);
    showToast(res.message);
  };

  const handleShareClick = (postId: string) => {
    sharePost(postId);
    showToast("Share link copied to clipboard!");
  };

  // Filter & Feed logic
  const activePosts = useMemo(() => {
    return posts.filter((p) => {
      if (p.status === "removed") return false;
      if (feedTab === "following" && user) {
        if (!user.following.includes(p.authorId) && p.authorId !== user.id) return false;
      }
      if (filterByTag) {
        if (!p.tags.includes(filterByTag)) return false;
      }
      return true;
    });
  }, [posts, feedTab, user, filterByTag]);

  const displayedPosts = activePosts.slice(0, visibleCount);
  const trendingPosts = getTrendingPosts();

  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setIsLoadingMore(false);
    }, 600);
  };

  return (
    <div className="flex w-full">
      <Sidebar />

      <main className="flex-1 py-6 md:px-6 space-y-6 min-w-0">
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span>{t.community.feedTitle}</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Share technical updates, code snippets, project showcases, and learning achievements.
            </p>
          </div>

          {/* Feed Tabs: All vs Following */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFeedTab("all")}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                feedTab === "all"
                  ? "bg-white dark:bg-gray-900 text-primary shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              {t.community.allPosts}
            </button>
            <button
              onClick={() => setFeedTab("following")}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                feedTab === "following"
                  ? "bg-white dark:bg-gray-900 text-primary shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              {t.community.followingFeed} {user && `(${user.following.length})`}
            </button>
          </div>
        </div>

        {/* Post Creation Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-5 shadow-xs space-y-4">
          {/* Post Type Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPostType("update")}
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                postType === "update"
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.community.tabUpdate}</span>
            </button>
            <button
              type="button"
              onClick={() => setPostType("snippet")}
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                postType === "snippet"
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>{t.community.tabSnippet}</span>
            </button>
            <button
              type="button"
              onClick={() => setPostType("showcase")}
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                postType === "showcase"
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{t.community.tabShowcase}</span>
            </button>
            <button
              type="button"
              onClick={() => setPostType("achievement")}
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                postType === "achievement"
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{t.community.tabAchievement}</span>
            </button>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.community.sharePrompt}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
            />

            {/* Type Specific Additional Fields */}
            {postType === "snippet" && (
              <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Code Snippet:</span>
                  <select
                    value={codeLang}
                    onChange={(e) => setCodeLang(e.target.value)}
                    className="px-2 py-1 rounded bg-white dark:bg-gray-900 border text-xs"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                  </select>
                </div>
                <textarea
                  rows={4}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="// Paste your code snippet here..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {postType === "showcase" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                <input
                  type="text"
                  placeholder="Project Title"
                  value={showcaseTitle}
                  onChange={(e) => setShowcaseTitle(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-900"
                />
                <input
                  type="text"
                  placeholder="Live Demo URL (https://...)"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-900"
                />
                <input
                  type="text"
                  placeholder="GitHub Repo URL (https://...)"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-900"
                />
              </div>
            )}

            {postType === "achievement" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                <input
                  type="text"
                  placeholder="Achievement Title (e.g. Completed Elevance Skills Training)"
                  value={achievementTitle}
                  onChange={(e) => setAchievementTitle(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-900"
                />
                <input
                  type="text"
                  placeholder="Badge Name (e.g. Master Developer)"
                  value={achievementBadge}
                  onChange={(e) => setAchievementBadge(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-900"
                />
              </div>
            )}

            {/* Optional Image URL Input */}
            <div className="flex items-center space-x-2 text-xs">
              <ImageIcon className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Attach image URL (optional, e.g. https://images.unsplash.com/...)"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-gray-400">
                Tip: Add hashtags like <code className="text-primary font-bold">#nextjs</code> or mentions like <code className="text-blue-500 font-bold">@sarah</code>
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.community.postButton}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Hashtags Filter Bar */}
        {filterByTag && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
            <span>Filtering posts with tag: <strong className="font-bold text-blue-900 dark:text-blue-100">#{filterByTag}</strong></span>
            <button
              onClick={() => setFilterByTag(null)}
              className="text-xs font-semibold hover:underline"
            >
              Clear tag filter
            </button>
          </div>
        )}

        {/* Feed Posts */}
        <div className="space-y-4">
          {displayedPosts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-2">
              <Sparkles className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="font-bold text-gray-900 dark:text-white">No community posts found</h3>
              <p className="text-xs text-gray-500">
                {feedTab === "following"
                  ? "You are not following anyone with recent posts yet. Switch to Global Feed to discover creators!"
                  : "Be the first to share an update or code snippet!"}
              </p>
            </div>
          ) : (
            displayedPosts.map((post) => {
              const isLiked = user ? post.likes.includes(user.id) : false;
              const isBookmarked = user ? user.bookmarks.includes(post.id) : false;
              const isAuthor = user?.id === post.authorId;
              const followingUser = isFollowing(post.authorId);
              const commentsOpen = openCommentsPostId === post.id;

              return (
                <div
                  key={post.id}
                  id={post.id}
                  className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-5 shadow-xs space-y-3.5 transition"
                >
                  {/* Post Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Link href={`/users/${post.authorId}`} className="font-bold text-sm text-gray-900 dark:text-white hover:text-primary transition">
                            {post.authorName}
                          </Link>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 capitalize">
                            {post.authorTier}
                          </span>
                          <span className="text-[10px] font-semibold text-primary">
                            {post.authorReputation} pts
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 block">
                          {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {post.isEdited && <span className="ml-1 text-gray-400 italic">(edited)</span>}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Follow / Unfollow */}
                      {!isAuthor && user && (
                        <button
                          onClick={() => toggleFollowUser(post.authorId)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                            followingUser
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600"
                              : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                          }`}
                        >
                          {followingUser ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Post Options: Edit / Delete / Report */}
                      <div className="flex items-center space-x-1 text-gray-400">
                        {(isAuthor || canEditCommunityPosts) && (
                          <button
                            onClick={() => {
                              setEditingPostId(post.id);
                              setEditContentText(post.content);
                            }}
                            className="p-1.5 hover:text-primary rounded-lg transition"
                            title="Edit Post (Author or 100+ Rep)"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {(isAuthor || user?.role === "admin") && (
                          <button
                            onClick={() => deletePost(post.id)}
                            className="p-1.5 hover:text-red-500 rounded-lg transition"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setReportModalPostId(post.id)}
                          className="p-1.5 hover:text-red-600 rounded-lg transition"
                          title="Report Inappropriate Content (500+ Rep)"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  {editingPostId === post.id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={editContentText}
                        onChange={(e) => setEditContentText(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSubmit(post.id)}
                          className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-semibold"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingPostId(null)}
                          className="px-3 py-1 rounded-lg border text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  )}

                  {/* Code Snippet Box */}
                  {post.codeSnippet && (
                    <div className="rounded-2xl overflow-hidden border border-gray-800 bg-[#1e1e1e] text-gray-200 text-xs font-mono shadow-inner">
                      <div className="bg-[#2d2d2d] px-4 py-1.5 flex items-center justify-between text-[11px] text-gray-400">
                        <span className="font-semibold uppercase">{post.codeSnippet.language}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(post.codeSnippet?.code || "");
                            showToast("Code copied to clipboard!");
                          }}
                          className="hover:text-white flex items-center gap-1 text-[10px]"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <pre className="p-4 overflow-x-auto text-xs leading-relaxed text-emerald-400">
                        <code>{post.codeSnippet.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Project Showcase Box */}
                  {post.projectShowcase && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Project Showcase</span>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{post.projectShowcase.title}</h4>
                      <div className="flex flex-wrap gap-2 pt-1 text-xs">
                        {post.projectShowcase.liveUrl && (
                          <a
                            href={post.projectShowcase.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Live Demo</span>
                          </a>
                        )}
                        {post.projectShowcase.githubUrl && (
                          <a
                            href={post.projectShowcase.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold transition"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>GitHub Source</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Learning Achievement Box */}
                  {post.achievement && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 flex items-center space-x-3.5">
                      <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                        <Award className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Learning Achievement</span>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{post.achievement.title}</h4>
                        <span className="inline-block mt-1 text-[11px] font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                          Badge: {post.achievement.badgeName}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Media Image if present */}
                  {post.imageUrl && (
                    <div className="rounded-2xl overflow-hidden max-h-96 border border-gray-100 dark:border-gray-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.imageUrl} alt="Post Attachment" className="w-full object-cover max-h-96" />
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setFilterByTag(tag)}
                          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Interaction Buttons Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      {/* Like Button */}
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 font-semibold transition ${
                          isLiked ? "text-red-500" : "hover:text-red-500"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                        <span>{post.likes.length}</span>
                      </button>

                      {/* Comment Toggle */}
                      <button
                        onClick={() => setOpenCommentsPostId(commentsOpen ? null : post.id)}
                        className="flex items-center gap-1.5 font-semibold hover:text-blue-600 transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments.length}</span>
                      </button>

                      {/* Share */}
                      <button
                        onClick={() => handleShareClick(post.id)}
                        className="flex items-center gap-1.5 font-semibold hover:text-primary transition"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{post.sharesCount}</span>
                      </button>
                    </div>

                    {/* Bookmark (Task 3: Unlimited for Silver & Gold) */}
                    <button
                      onClick={() => handleBookmarkClick(post.id)}
                      className={`flex items-center gap-1 font-semibold transition ${
                        isBookmarked ? "text-primary" : "hover:text-primary"
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                      <span className="hidden sm:inline">
                        {isBookmarked ? t.common.bookmarked : t.common.bookmark}
                      </span>
                    </button>
                  </div>

                  {/* Comments Accordion */}
                  {commentsOpen && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                      {/* Write comment input */}
                      <div className="flex items-center space-x-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50"}
                          alt="You"
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <input
                          type="text"
                          placeholder={t.community.writeComment}
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && commentInputs[post.id]?.trim()) {
                              addComment(post.id, commentInputs[post.id].trim());
                              setCommentInputs({ ...commentInputs, [post.id]: "" });
                            }
                          }}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                        />
                        <button
                          onClick={() => {
                            if (commentInputs[post.id]?.trim()) {
                              addComment(post.id, commentInputs[post.id].trim());
                              setCommentInputs({ ...commentInputs, [post.id]: "" });
                            }
                          }}
                          className="p-2 rounded-xl bg-primary text-white text-xs hover:bg-primary-dark"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Comment Threads */}
                      <div className="space-y-2.5 pt-1">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="text-xs space-y-1.5 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={comment.authorAvatar} alt={comment.authorName} className="w-5 h-5 rounded-full object-cover" />
                                <span className="font-bold text-gray-800 dark:text-gray-200">{comment.authorName}</span>
                                <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                              <button
                                onClick={() => setActiveReplyBox(activeReplyBox === comment.id ? null : comment.id)}
                                className="text-[10px] text-primary hover:underline font-semibold"
                              >
                                Reply
                              </button>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 pl-7">{comment.content}</p>

                            {/* Nested Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="pl-7 space-y-1.5 pt-1">
                                {comment.replies.map((r) => (
                                  <div key={r.id} className="bg-gray-50 dark:bg-gray-800/60 p-2 rounded-xl text-xs space-y-0.5">
                                    <div className="flex items-center space-x-1.5">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={r.authorAvatar} alt={r.authorName} className="w-4 h-4 rounded-full object-cover" />
                                      <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px]">{r.authorName}</span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-[11px] pl-5">{r.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply Input Box */}
                            {activeReplyBox === comment.id && (
                              <div className="pl-7 flex items-center gap-2 pt-1">
                                <CornerDownRight className="w-3.5 h-3.5 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Write a reply..."
                                  value={replyInputs[comment.id] || ""}
                                  onChange={(e) => setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && replyInputs[comment.id]?.trim()) {
                                      addReply(post.id, comment.id, replyInputs[comment.id].trim());
                                      setReplyInputs({ ...replyInputs, [comment.id]: "" });
                                      setActiveReplyBox(null);
                                    }
                                  }}
                                  className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                />
                                <button
                                  onClick={() => {
                                    if (replyInputs[comment.id]?.trim()) {
                                      addReply(post.id, comment.id, replyInputs[comment.id].trim());
                                      setReplyInputs({ ...replyInputs, [comment.id]: "" });
                                      setActiveReplyBox(null);
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-primary text-white text-[11px] font-semibold"
                                >
                                  Reply
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Infinite Scroll / Server-Side Pagination Simulation */}
          {activePosts.length > visibleCount && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="px-6 py-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 hover:border-primary transition shadow-xs flex items-center gap-2 mx-auto"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Loading more community updates...</span>
                  </>
                ) : (
                  <span>Load More Community Posts</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Report Modal */}
        {reportModalPostId && (
          <ReportModal
            isOpen={Boolean(reportModalPostId)}
            onClose={() => setReportModalPostId(null)}
            postId={reportModalPostId}
          />
        )}
      </main>

      <RightSidebar />
    </div>
  );
}

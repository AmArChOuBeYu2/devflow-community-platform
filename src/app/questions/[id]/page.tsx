"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { useQuestions } from "@/context/QuestionsContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useReputation } from "@/context/ReputationContext";
import {
  ChevronUp,
  ChevronDown,
  Check,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  AlertCircle,
  HelpCircle,
  Share2,
  Award,
  Lock,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const questionId = resolvedParams.id;

  const {
    getQuestionById,
    getAnswersForQuestion,
    voteQuestion,
    voteToCloseQuestion,
    addAnswer,
    markAnswerAccepted,
    voteAnswer,
    deleteAnswer,
    adminRemoveContent,
  } = useQuestions();

  const { user } = useAuth();
  const { t } = useLanguage();
  const { canVoteToCloseQuestions, canCommentWithoutRestrictions } = useReputation();

  const [answerBody, setAnswerBody] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [closeReason, setCloseReason] = useState("Duplicate / Solved elsewhere");
  const [showCloseModal, setShowCloseModal] = useState(false);

  const question = getQuestionById(questionId);
  const answers = getAnswersForQuestion(questionId);

  if (!question) {
    return (
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 py-12 text-center space-y-3">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto" />
          <h2 className="text-xl font-bold">Question Not Found</h2>
          <Link href="/questions" className="text-primary hover:underline text-xs font-bold">
            Back to All Questions
          </Link>
        </main>
      </div>
    );
  }

  const isQuestionAuthor = user?.id === question.authorId;
  const userVote = user ? question.votedUserIds[user.id] || 0 : 0;

  const handlePostAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg("");

    if (!user) {
      setFeedbackMsg("Please log in to submit an answer.");
      return;
    }

    if (answerBody.trim().length < 20) {
      setFeedbackMsg("Please write a meaningful answer of at least 20 characters.");
      return;
    }

    const res = addAnswer(questionId, answerBody.trim());
    if (res.success) {
      setAnswerBody("");
      setFeedbackMsg("Answer posted successfully! Earned +5 reputation points.");
    } else {
      setFeedbackMsg(res.message);
    }
  };

  const handleVoteClose = () => {
    const res = voteToCloseQuestion(questionId, closeReason);
    setShowCloseModal(false);
    setFeedbackMsg(res.message);
  };

  return (
    <div className="flex w-full">
      <Sidebar />

      <main className="flex-1 py-6 md:px-6 space-y-6 min-w-0">
        {/* Closed Banner */}
        {question.isClosed && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200">
                This question has been closed by community vote
              </p>
              <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                Reason: {question.closedReason || "Community decision"}. No new answers can be accepted.
              </p>
            </div>
          </div>
        )}

        {feedbackMsg && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Question Header */}
        <div className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-snug">
              {question.title}
            </h1>
            <Link
              href="/questions/ask"
              className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shrink-0 self-start sm:self-auto transition shadow-xs"
            >
              Ask Question
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span>Asked <strong>{new Date(question.createdAt).toLocaleDateString()}</strong></span>
            <span>Viewed <strong>{question.views} times</strong></span>
            <span>Answers <strong>{question.answersCount}</strong></span>
          </div>
        </div>

        {/* Question Body + Voting */}
        <div className="flex items-start gap-4">
          {/* Vote Controls */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              onClick={() => voteQuestion(question.id, 1)}
              className={`p-2 rounded-xl border transition ${
                userVote === 1
                  ? "bg-primary text-white border-primary"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="This question is useful and clear"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <span className="text-base font-bold text-gray-900 dark:text-white my-1">
              {question.votes}
            </span>
            <button
              onClick={() => voteQuestion(question.id, -1)}
              className={`p-2 rounded-xl border transition ${
                userVote === -1
                  ? "bg-red-500 text-white border-red-500"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="This question lacks research or is unclear (-2 reputation penalty to author)"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Question Text */}
          <div className="flex-1 space-y-4 min-w-0">
            <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
              {question.body}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {question.tags.map((t) => (
                <Link
                  key={t}
                  href={`/questions?tag=${t}`}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 transition"
                >
                  {t}
                </Link>
              ))}
            </div>

            {/* Bottom Actions & Author */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
              <div className="flex items-center space-x-3 text-gray-500">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setFeedbackMsg("Question link copied to clipboard!");
                  }}
                  className="hover:text-primary flex items-center gap-1 font-medium"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>

                {/* Vote to close (Task 4: requires >= 250 reputation) */}
                {!question.isClosed && (
                  <button
                    onClick={() => {
                      if (!canVoteToCloseQuestions) {
                        setFeedbackMsg("Voting to close questions requires 250+ reputation points.");
                      } else {
                        setShowCloseModal(true);
                      }
                    }}
                    className={`flex items-center gap-1 font-medium ${
                      canVoteToCloseQuestions ? "text-amber-600 hover:underline" : "text-gray-400 opacity-60"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Close Question {!canVoteToCloseQuestions && "(250+ Rep)"}</span>
                  </button>
                )}

                {user?.role === "admin" && (
                  <button
                    onClick={() => adminRemoveContent("question", question.id, question.authorId)}
                    className="text-red-500 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Admin Remove (-10 pts)</span>
                  </button>
                )}
              </div>

              {/* Author Card */}
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-center space-x-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={question.authorAvatar} alt={question.authorName} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <span className="text-[10px] text-gray-400 block">asked {new Date(question.createdAt).toLocaleDateString()}</span>
                  <Link href={`/users/${question.authorId}`} className="font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    {question.authorName}
                  </Link>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <span className="font-bold text-primary">{question.authorReputation}</span>
                    <span className="capitalize">• {question.authorTier}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Question Modal */}
        {showCloseModal && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-3">
            <h4 className="font-bold text-amber-900">Vote to Close Question (250+ Rep Privilege)</h4>
            <p className="text-amber-800">Please choose a reason for closing this question:</p>
            <select
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white"
            >
              <option>Duplicate of an existing question</option>
              <option>Needs details or clarity</option>
              <option>Opinion-based / Not a technical issue</option>
              <option>Solved by author elsewhere</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleVoteClose}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold"
              >
                Submit Close Vote
              </button>
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Answers Section */}
        <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
          </h3>

          <div className="space-y-4">
            {answers.map((ans) => {
              const ansVote = user ? ans.votedUserIds[user.id] || 0 : 0;
              const isAccepted = ans.isAccepted;

              return (
                <div
                  key={ans.id}
                  className={`p-5 rounded-2xl border transition ${
                    isAccepted
                      ? "border-green-400 bg-green-50/20 dark:bg-green-950/10 shadow-sm"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  }`}
                >
                  {isAccepted && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 dark:text-green-300 mb-3 bg-green-100 dark:bg-green-950/50 px-3 py-1 rounded-full w-fit">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Accepted Solution (Author earned +10 Reputation)</span>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Vote & Accept Controls */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button
                        onClick={() => voteAnswer(ans.id, 1)}
                        className={`p-1.5 rounded-xl border transition ${
                          ansVote === 1
                            ? "bg-primary text-white border-primary"
                            : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        title="Helpful answer (+5 points at 5 upvotes)"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold text-gray-900 dark:text-white my-1">
                        {ans.votes}
                      </span>
                      <button
                        onClick={() => voteAnswer(ans.id, -1)}
                        className={`p-1.5 rounded-xl border transition ${
                          ansVote === -1
                            ? "bg-red-500 text-white border-red-500"
                            : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        title="Downvote (-2 points penalty to author)"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Accept Button (Only Question Author can mark) */}
                      {isQuestionAuthor && (
                        <button
                          onClick={() => markAnswerAccepted(question.id, ans.id)}
                          className={`mt-2 p-1.5 rounded-xl border transition ${
                            isAccepted
                              ? "bg-green-600 text-white border-green-600 shadow-sm"
                              : "border-gray-200 dark:border-gray-700 text-gray-400 hover:text-green-600 hover:border-green-400"
                          }`}
                          title="Mark as accepted answer (Awards +10 reputation to author)"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Answer Content */}
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
                        {ans.body}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
                        <div className="flex items-center space-x-2 text-gray-500">
                          {user?.id === ans.authorId && (
                            <button
                              onClick={() => deleteAnswer(ans.id)}
                              className="text-red-500 hover:underline flex items-center gap-1 font-medium"
                              title="Deleting answer causes -5 reputation penalty"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete My Answer (-5 pts)</span>
                            </button>
                          )}
                          {user?.role === "admin" && (
                            <button
                              onClick={() => adminRemoveContent("answer", ans.id, ans.authorId)}
                              className="text-red-600 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Admin Delete (-10 pts)</span>
                            </button>
                          )}
                        </div>

                        {/* Answer Author Card */}
                        <div className="flex items-center space-x-2 text-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ans.authorAvatar} alt={ans.authorName} className="w-6 h-6 rounded-full object-cover" />
                          <div>
                            <Link href={`/users/${ans.authorId}`} className="font-bold text-gray-900 dark:text-white hover:text-primary">
                              {ans.authorName}
                            </Link>
                            <span className="text-[10px] text-gray-400 ml-1.5">
                              {ans.authorReputation} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Post Answer Box (Task 4: Awards +5 reputation points) */}
        {!question.isClosed ? (
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center justify-between">
              <span>{t.questions.yourAnswer}</span>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                +5 Reputation Reward
              </span>
            </h3>

            <form onSubmit={handlePostAnswer} className="space-y-3">
              <textarea
                rows={6}
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                placeholder="Write your constructive answer or code snippet to resolve this question..."
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
              />

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition"
                >
                  {t.questions.postAnswer}
                </button>
                <span className="text-[11px] text-gray-400">
                  Earn +10 extra points if marked as accepted answer!
                </span>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl text-center text-xs">
            This question is closed and cannot receive additional answers.
          </div>
        )}
      </main>

      <RightSidebar />
    </div>
  );
}

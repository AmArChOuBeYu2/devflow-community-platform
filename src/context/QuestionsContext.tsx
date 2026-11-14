"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Question, Answer } from "@/types";
import { Storage } from "@/lib/storage";
import { useAuth } from "./AuthContext";
import { useReputation } from "./ReputationContext";
import { useSubscription } from "./SubscriptionContext";

interface QuestionsContextType {
  questions: Question[];
  answers: Answer[];
  addQuestion: (title: string, body: string, tags: string[]) => { success: boolean; questionId?: string; message?: string };
  voteQuestion: (questionId: string, direction: 1 | -1) => { success: boolean; message?: string };
  voteToCloseQuestion: (questionId: string, reason: string) => { success: boolean; message: string };
  addAnswer: (questionId: string, body: string) => { success: boolean; message: string };
  markAnswerAccepted: (questionId: string, answerId: string) => { success: boolean; message: string };
  voteAnswer: (answerId: string, direction: 1 | -1) => { success: boolean; message?: string };
  deleteAnswer: (answerId: string) => { success: boolean; message: string };
  adminRemoveContent: (entityType: "question" | "answer", id: string, authorId: string) => { success: boolean; message: string };
  getQuestionById: (id: string) => Question | undefined;
  getAnswersForQuestion: (questionId: string) => Answer[];
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

export const QuestionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addPoints, deductPoints, canVoteToCloseQuestions } = useReputation();
  const { canAskQuestionToday, recordQuestionAsked } = useSubscription();

  const [questions, setQuestions] = useState<Question[]>(() => {
    if (typeof window !== "undefined") {
      Storage.init();
      return Storage.getQuestions();
    }
    return [];
  });
  const [answers, setAnswers] = useState<Answer[]>(() => {
    if (typeof window !== "undefined") {
      Storage.init();
      return Storage.getAnswers();
    }
    return [];
  });

  useEffect(() => {
    setQuestions(Storage.getQuestions());
    setAnswers(Storage.getAnswers());
  }, []);

  const addQuestion = (
    title: string,
    body: string,
    tags: string[]
  ): { success: boolean; questionId?: string; message?: string } => {
    if (!user) return { success: false, message: "Please log in to ask a question." };

    if (user.isSuspended) {
      return { success: false, message: "Your account has been suspended by an administrator." };
    }

    // Check plan question limit (Free: 1, Bronze: 5, Silver: 15, Gold: unlimited)
    const check = canAskQuestionToday();
    if (!check.allowed) {
      return { success: false, message: check.message };
    }

    const newQ: Question = {
      id: "q-" + Date.now(),
      title,
      body,
      tags,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorTier: user.tier,
      authorReputation: user.reputation,
      createdAt: new Date().toISOString(),
      votes: 0,
      votedUserIds: {},
      answersCount: 0,
      views: 1,
      awardedMilestones: [],
    };

    const currentQuestions = Storage.getQuestions();
    const updated = [newQ, ...currentQuestions];
    setQuestions(updated);
    Storage.saveQuestions(updated);
    recordQuestionAsked();

    return { success: true, questionId: newQ.id };
  };

  const voteQuestion = (questionId: string, direction: 1 | -1): { success: boolean; message?: string } => {
    if (!user) return { success: false, message: "Please log in to vote." };

    if (user.isSuspended) {
      return { success: false, message: "Suspended accounts cannot vote." };
    }

    const currentQuestions = Storage.getQuestions();
    const target = currentQuestions.find((q) => q.id === questionId);
    if (!target) return { success: false, message: "Question not found." };

    // Prevent self-voting on questions
    if (target.authorId === user.id) {
      return { success: false, message: "You cannot vote on your own question." };
    }

    const currentVote: number = (target.votedUserIds[user.id] as number | undefined) ?? 0;
    let newScore = target.votes;
    const newVoted = { ...target.votedUserIds };
    let feedback = "";

    if (currentVote === direction) {
      // Toggle off
      delete newVoted[user.id];
      newScore -= direction;
      feedback = "Vote removed.";
      if (direction === -1) {
        addPoints(2, `Downvote removed on question "${target.title.slice(0, 30)}..."`, target.id, target.authorId);
      }
    } else {
      newVoted[user.id] = direction;
      newScore += currentVote === 0 ? direction : direction * 2;
      feedback = direction === 1 ? "Upvoted! (+1)" : "Downvoted (-1)";

      if (currentVote === -1) {
        addPoints(2, `Downvote removed on question "${target.title.slice(0, 30)}..."`, target.id, target.authorId);
      }
      if (direction === -1) {
        deductPoints(2, `Downvote received on question "${target.title.slice(0, 30)}..."`, target.id, target.authorId);
      }
    }

    const milestones = target.awardedMilestones || [];
    const newMilestones = [...milestones];

    // Check Task 4 rule: 2 points for asking a question that receives at least 10 upvotes
    // Awarded strictly once per question
    if (newScore >= 10 && !milestones.includes("10_votes")) {
      newMilestones.push("10_votes");
      addPoints(2, `Question "${target.title.slice(0, 30)}..." received 10+ upvotes`, target.id, target.authorId);
    }

    const updated = currentQuestions.map((q) => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        votes: newScore,
        votedUserIds: newVoted,
        awardedMilestones: newMilestones,
      };
    });

    setQuestions(updated);
    Storage.saveQuestions(updated);
    return { success: true, message: feedback };
  };

  const voteToCloseQuestion = (questionId: string, reason: string): { success: boolean; message: string } => {
    if (!user) return { success: false, message: "Please log in." };

    if (user.isSuspended) {
      return { success: false, message: "Suspended accounts cannot vote to close questions." };
    }

    if (!canVoteToCloseQuestions && user.role !== "admin") {
      return { success: false, message: "Voting to close questions requires 250+ reputation points." };
    }

    const updated = questions.map((q) => {
      if (q.id !== questionId) return q;
      const currentVotes = q.closeVotes || [];
      if (currentVotes.includes(user.id)) return q;

      const newVotes = [...currentVotes, user.id];
      // Close after 2 community votes or immediately on admin vote
      const shouldClose = newVotes.length >= 2 || user.role === "admin";
      return {
        ...q,
        closeVotes: newVotes,
        isClosed: shouldClose,
        closedReason: shouldClose ? reason : q.closedReason,
      };
    });

    setQuestions(updated);
    Storage.saveQuestions(updated);
    return { success: true, message: "Your vote to close this question has been recorded." };
  };

  const addAnswer = (questionId: string, body: string): { success: boolean; message: string } => {
    if (!user) return { success: false, message: "Please log in to post an answer." };

    if (user.isSuspended) {
      return { success: false, message: "Your account has been suspended by an administrator." };
    }

    const currentQuestions = Storage.getQuestions();
    const targetQ = currentQuestions.find((q) => q.id === questionId);
    if (!targetQ) return { success: false, message: "Question not found." };

    if (targetQ.isClosed) {
      return { success: false, message: "This question has been closed and is no longer accepting answers." };
    }

    const trimmed = body.trim();
    if (trimmed.length < 20) {
      return { success: false, message: "Answers must be at least 20 characters long to provide sufficient detail." };
    }

    const newAns: Answer = {
      id: "ans-" + Date.now(),
      questionId,
      body: trimmed,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorTier: user.tier,
      authorReputation: user.reputation,
      createdAt: new Date().toISOString(),
      votes: 0,
      votedUserIds: {},
      isAccepted: false,
      awardedMilestones: [],
    };

    const currentAnswers = Storage.getAnswers();
    const updatedAnswers = [...currentAnswers, newAns];
    setAnswers(updatedAnswers);
    Storage.saveAnswers(updatedAnswers);

    // Update question answer count
    const updatedQuestions = currentQuestions.map((q) => {
      if (q.id === questionId) {
        return { ...q, answersCount: (q.answersCount || 0) + 1 };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    Storage.saveQuestions(updatedQuestions);

    // Task 4 rule: 5 reputation points for posting an answer
    addPoints(5, "Posted an answer to question", questionId, user.id);

    return { success: true, message: "Answer posted successfully! Earned +5 reputation points." };
  };

  const markAnswerAccepted = (questionId: string, answerId: string): { success: boolean; message: string } => {
    const currentQuestions = Storage.getQuestions();
    const currentAnswers = Storage.getAnswers();
    const q = currentQuestions.find((item) => item.id === questionId);
    if (!q || !user) return { success: false, message: "Question not found or unauthenticated." };

    if (q.authorId !== user.id && user.role !== "admin") {
      return { success: false, message: "Only the question author or an administrator can accept an answer." };
    }

    const targetAnswer = currentAnswers.find((a) => a.id === answerId);
    if (!targetAnswer) return { success: false, message: "Target answer not found." };

    const isAlreadyAccepted = q.acceptedAnswerId === answerId;
    const targetAuthorId = targetAnswer.authorId;
    const isSelfAnswer = targetAuthorId === user.id;

    if (isAlreadyAccepted) {
      // Toggle off acceptance
      const updatedAnswers = currentAnswers.map((a) => {
        if (a.questionId === questionId) {
          return { ...a, isAccepted: false };
        }
        return a;
      });
      const updatedQuestions = currentQuestions.map((item) => {
        if (item.id === questionId) {
          return { ...item, acceptedAnswerId: undefined };
        }
        return item;
      });

      setAnswers(updatedAnswers);
      Storage.saveAnswers(updatedAnswers);
      setQuestions(updatedQuestions);
      Storage.saveQuestions(updatedQuestions);

      return {
        success: true,
        message: "Accepted status removed from answer.",
      };
    }

    const milestones = targetAnswer.awardedMilestones || [];
    let newMilestones = [...milestones];

    // Task 4 rule: 10 reputation points when answer is marked as the accepted answer
    // Only awarded if answer author is NOT the question author (prevents self-farming)
    // Awarded strictly once per answer
    if (!isSelfAnswer && !milestones.includes("accepted")) {
      newMilestones.push("accepted");
      addPoints(10, `Answer marked as accepted solution for question #${questionId}`, answerId, targetAuthorId);
    }

    const updatedAnswers = currentAnswers.map((a) => {
      if (a.questionId === questionId) {
        const isThis = a.id === answerId;
        return {
          ...a,
          isAccepted: isThis,
          awardedMilestones: isThis ? newMilestones : a.awardedMilestones,
        };
      }
      return a;
    });

    const updatedQuestions = currentQuestions.map((item) => {
      if (item.id === questionId) {
        return { ...item, acceptedAnswerId: answerId };
      }
      return item;
    });

    setAnswers(updatedAnswers);
    Storage.saveAnswers(updatedAnswers);
    setQuestions(updatedQuestions);
    Storage.saveQuestions(updatedQuestions);

    return {
      success: true,
      message: isSelfAnswer
        ? "Marked as accepted solution. (Accepting your own answer does not award reputation points.)"
        : "Answer marked as accepted solution! +10 reputation awarded to author.",
    };
  };

  const voteAnswer = (answerId: string, direction: 1 | -1): { success: boolean; message?: string } => {
    if (!user) return { success: false, message: "Please log in to vote." };

    if (user.isSuspended) {
      return { success: false, message: "Suspended accounts cannot vote." };
    }

    const currentAnswers = Storage.getAnswers();
    const target = currentAnswers.find((a) => a.id === answerId);
    if (!target) return { success: false, message: "Answer not found." };

    // Prevent self-voting on answers
    if (target.authorId === user.id) {
      return { success: false, message: "You cannot vote on your own answer." };
    }

    const currentVote: number = (target.votedUserIds[user.id] as number | undefined) ?? 0;
    let newScore = target.votes;
    const newVoted = { ...target.votedUserIds };
    let feedback = "";

    if (currentVote === direction) {
      delete newVoted[user.id];
      newScore -= direction;
      feedback = "Vote removed.";
      if (direction === -1) {
        addPoints(2, "Downvote removed on answer", target.id, target.authorId);
      }
    } else {
      newVoted[user.id] = direction;
      newScore += currentVote === 0 ? direction : direction * 2;
      feedback = direction === 1 ? "Upvoted! (+1)" : "Downvoted (-1)";

      if (currentVote === -1) {
        addPoints(2, "Downvote removed on answer", target.id, target.authorId);
      }
      if (direction === -1) {
        deductPoints(2, "Downvote received on answer", target.id, target.authorId);
      }
    }

    const milestones = target.awardedMilestones || [];
    const newMilestones = [...milestones];

    // Task 4 rule: 5 additional reputation points when an answer receives 5 upvotes
    // Awarded strictly once per answer
    if (newScore >= 5 && !milestones.includes("5_votes")) {
      newMilestones.push("5_votes");
      addPoints(5, "Answer reached 5 upvotes milestone", target.id, target.authorId);
    }

    const updated = currentAnswers.map((a) => {
      if (a.id !== answerId) return a;
      return {
        ...a,
        votes: newScore,
        votedUserIds: newVoted,
        awardedMilestones: newMilestones,
      };
    });

    setAnswers(updated);
    Storage.saveAnswers(updated);
    return { success: true, message: feedback };
  };

  const deleteAnswer = (answerId: string): { success: boolean; message: string } => {
    if (!user) return { success: false, message: "Please log in." };

    const ans = answers.find((a) => a.id === answerId);
    if (!ans) return { success: false, message: "Answer not found." };

    if (ans.authorId !== user.id && user.role !== "admin") {
      return { success: false, message: "You can only delete your own answers." };
    }

    const updatedAnswers = answers.filter((a) => a.id !== answerId);
    setAnswers(updatedAnswers);
    Storage.saveAnswers(updatedAnswers);

    // Update question answer count
    const updatedQuestions = questions.map((q) => {
      if (q.id === ans.questionId) {
        return {
          ...q,
          answersCount: Math.max(0, q.answersCount - 1),
          acceptedAnswerId: q.acceptedAnswerId === answerId ? undefined : q.acceptedAnswerId,
        };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    Storage.saveQuestions(updatedQuestions);

    // Task 4 rule: 5 points decrease if an answer is deleted by the user
    deductPoints(5, "Answer deleted by user", answerId, ans.authorId);

    return { success: true, message: "Answer deleted. 5 reputation points deducted from author." };
  };

  const adminRemoveContent = (
    entityType: "question" | "answer",
    id: string,
    authorId: string
  ): { success: boolean; message: string } => {
    if (!user || user.role !== "admin") {
      return { success: false, message: "Only administrators can perform this action." };
    }

    if (entityType === "answer") {
      setAnswers((prev) => prev.filter((a) => a.id !== id));
      Storage.saveAnswers(Storage.getAnswers().filter((a) => a.id !== id));
    } else {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      Storage.saveQuestions(Storage.getQuestions().filter((q) => q.id !== id));
    }

    // Task 4 rule: 10 points decrease if content is removed by an administrator due to guideline violations
    deductPoints(10, `Content removed by administrator for guideline violations (${entityType})`, id, authorId);

    return {
      success: true,
      message: `Content removed by administrator. 10 reputation points deducted from author.`,
    };
  };

  const getQuestionById = (id: string) => questions.find((q) => q.id === id);
  const getAnswersForQuestion = (questionId: string) =>
    answers
      .filter((a) => a.questionId === questionId)
      .sort((a, b) => (b.isAccepted ? 1 : 0) - (a.isAccepted ? 1 : 0) || b.votes - a.votes);

  return (
    <QuestionsContext.Provider
      value={{
        questions,
        answers,
        addQuestion,
        voteQuestion,
        voteToCloseQuestion,
        addAnswer,
        markAnswerAccepted,
        voteAnswer,
        deleteAnswer,
        adminRemoveContent,
        getQuestionById,
        getAnswersForQuestion,
      }}
    >
      {children}
    </QuestionsContext.Provider>
  );
};

export const useQuestions = () => {
  const context = useContext(QuestionsContext);
  if (!context) throw new Error("useQuestions must be used within a QuestionsProvider");
  return context;
};

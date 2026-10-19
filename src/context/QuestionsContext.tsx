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
  voteQuestion: (questionId: string, direction: 1 | -1) => void;
  voteToCloseQuestion: (questionId: string, reason: string) => { success: boolean; message: string };
  addAnswer: (questionId: string, body: string) => { success: boolean; message: string };
  markAnswerAccepted: (questionId: string, answerId: string) => void;
  voteAnswer: (answerId: string, direction: 1 | -1) => void;
  deleteAnswer: (answerId: string) => void;
  adminRemoveContent: (entityType: "question" | "answer", id: string, authorId: string) => void;
  getQuestionById: (id: string) => Question | undefined;
  getAnswersForQuestion: (questionId: string) => Answer[];
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

export const QuestionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addPoints, deductPoints, canVoteToCloseQuestions } = useReputation();
  const { canAskQuestionToday, recordQuestionAsked } = useSubscription();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    setQuestions(Storage.getQuestions());
    setAnswers(Storage.getAnswers());
  }, []);

  const addQuestion = (title: string, body: string, tags: string[]): { success: boolean; questionId?: string; message?: string } => {
    if (!user) return { success: false, message: "Please log in to ask a question." };

    // Check plan question limit
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
    };

    const updated = [newQ, ...questions];
    setQuestions(updated);
    Storage.saveQuestions(updated);
    recordQuestionAsked();

    return { success: true, questionId: newQ.id };
  };

  const voteQuestion = (questionId: string, direction: 1 | -1) => {
    if (!user) return;

    const updated = questions.map((q) => {
      if (q.id !== questionId) return q;

      const currentVote: number = (q.votedUserIds[user.id] as number | undefined) ?? 0;
      let newScore = q.votes;
      const newVoted = { ...q.votedUserIds };

      if (currentVote === direction) {
        // Toggle off
        delete newVoted[user.id];
        newScore -= direction;
      } else {
        newVoted[user.id] = direction;
        newScore += currentVote === 0 ? direction : direction * 2;
      }

      // Check Task 4 rule: 2 points for asking a question that receives at least 10 upvotes
      if (newScore >= 10 && q.votes < 10) {
        addPoints(2, `Question "${q.title.slice(0, 30)}..." received 10+ upvotes`, q.id, q.authorId);
      }

      // Downvote penalty: -2 points for every downvote received
      if (direction === -1 && currentVote !== -1) {
        deductPoints(2, `Downvote received on question "${q.title.slice(0, 30)}..." by voter ${user.id}`, q.id, q.authorId);
      }

      return {
        ...q,
        votes: newScore,
        votedUserIds: newVoted,
      };
    });

    setQuestions(updated);
    Storage.saveQuestions(updated);
  };

  const voteToCloseQuestion = (questionId: string, reason: string): { success: boolean; message: string } => {
    if (!user) return { success: false, message: "Please log in." };
    if (!canVoteToCloseQuestions) {
      return { success: false, message: "Voting to close questions requires 250+ reputation points." };
    }

    const updated = questions.map((q) => {
      if (q.id !== questionId) return q;
      const currentVotes = q.closeVotes || [];
      if (currentVotes.includes(user.id)) return q;

      const newVotes = [...currentVotes, user.id];
      // Close after 2 community votes or admin vote
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

    const newAns: Answer = {
      id: "ans-" + Date.now(),
      questionId,
      body,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorTier: user.tier,
      authorReputation: user.reputation,
      createdAt: new Date().toISOString(),
      votes: 0,
      votedUserIds: {},
      isAccepted: false,
    };

    const updatedAnswers = [...answers, newAns];
    setAnswers(updatedAnswers);
    Storage.saveAnswers(updatedAnswers);

    // Update question answer count
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return { ...q, answersCount: q.answersCount + 1 };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    Storage.saveQuestions(updatedQuestions);

    // Task 4 rule: 5 reputation points for posting an answer
    addPoints(5, "Posted an answer to question", newAns.id, user.id);

    return { success: true, message: "Answer posted successfully! Earned +5 reputation points." };
  };

  const markAnswerAccepted = (questionId: string, answerId: string) => {
    const q = questions.find((item) => item.id === questionId);
    if (!q || !user || q.authorId !== user.id) return;

    let targetAuthorId = "";
    const updatedAnswers = answers.map((a) => {
      if (a.questionId === questionId) {
        const isThis = a.id === answerId;
        if (isThis) targetAuthorId = a.authorId;
        return { ...a, isAccepted: isThis };
      }
      return a;
    });

    const updatedQuestions = questions.map((item) => {
      if (item.id === questionId) {
        return { ...item, acceptedAnswerId: answerId };
      }
      return item;
    });

    setAnswers(updatedAnswers);
    Storage.saveAnswers(updatedAnswers);
    setQuestions(updatedQuestions);
    Storage.saveQuestions(updatedQuestions);

    // Task 4 rule: 10 reputation points when answer is marked as the accepted answer
    if (targetAuthorId) {
      addPoints(10, `Answer marked as accepted solution for question #${questionId}`, answerId, targetAuthorId);
    }
  };

  const voteAnswer = (answerId: string, direction: 1 | -1) => {
    if (!user) return;

    const updated = answers.map((a) => {
      if (a.id !== answerId) return a;

      const currentVote: number = (a.votedUserIds[user.id] as number | undefined) ?? 0;
      let newScore = a.votes;
      const newVoted = { ...a.votedUserIds };

      if (currentVote === direction) {
        delete newVoted[user.id];
        newScore -= direction;
      } else {
        newVoted[user.id] = direction;
        newScore += currentVote === 0 ? direction : direction * 2;
      }

      // Task 4 rule: 5 additional reputation points when an answer receives 5 upvotes
      if (newScore >= 5 && a.votes < 5) {
        addPoints(5, "Answer reached 5 upvotes milestone", a.id, a.authorId);
      }

      // Task 4 rule: 2 points decrease for every downvote received
      if (direction === -1 && currentVote !== -1) {
        deductPoints(2, `Downvote received on answer by voter ${user.id}`, a.id, a.authorId);
      }

      return {
        ...a,
        votes: newScore,
        votedUserIds: newVoted,
      };
    });

    setAnswers(updated);
    Storage.saveAnswers(updated);
  };

  const deleteAnswer = (answerId: string) => {
    const ans = answers.find((a) => a.id === answerId);
    if (!ans) return;

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
  };

  const adminRemoveContent = (entityType: "question" | "answer", id: string, authorId: string) => {
    if (entityType === "answer") {
      setAnswers((prev) => prev.filter((a) => a.id !== id));
      Storage.saveAnswers(Storage.getAnswers().filter((a) => a.id !== id));
    } else {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      Storage.saveQuestions(Storage.getQuestions().filter((q) => q.id !== id));
    }

    // Task 4 rule: 10 points decrease if content is removed by an administrator due to guideline violations
    deductPoints(10, `Content removed by administrator for guideline violations (${entityType})`, id, authorId);
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

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ReputationLog, ReputationTransfer } from "@/types";
import { Storage } from "@/lib/storage";
import { useAuth } from "./AuthContext";

interface ReputationContextType {
  reputation: number;
  logs: ReputationLog[];
  transfers: ReputationTransfer[];
  addPoints: (points: number, reason: string, relatedEntityId?: string, targetUserId?: string) => void;
  deductPoints: (points: number, reason: string, relatedEntityId?: string, targetUserId?: string) => void;
  transferPoints: (receiverId: string, amount: number, reason: string) => { success: boolean; message: string };
  canCommentWithoutRestrictions: boolean;
  canEditCommunityPosts: boolean;
  canVoteToCloseQuestions: boolean;
  canReportContent: boolean;
}

const ReputationContext = createContext<ReputationContextType | undefined>(undefined);

export const ReputationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, users, updateProfile } = useAuth();
  const [logs, setLogs] = useState<ReputationLog[]>([]);
  const [transfers, setTransfers] = useState<ReputationTransfer[]>([]);

  useEffect(() => {
    setLogs(Storage.getReputationLogs());
    setTransfers(Storage.getRepTransfers());
  }, []);

  const reputation = user?.reputation || 0;

  const addPoints = (points: number, reason: string, relatedEntityId?: string, targetUserId?: string) => {
    const targetId = targetUserId || user?.id;
    if (!targetId) return;

    const newLog: ReputationLog = {
      id: "rep-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      userId: targetId,
      points: Math.abs(points),
      reason,
      createdAt: new Date().toISOString(),
      relatedEntityId,
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    Storage.saveReputationLogs(updated);

    if (targetId === user?.id && user) {
      updateProfile({ reputation: user.reputation + Math.abs(points) });
    } else {
      // update in all users
      const all = Storage.getAllUsers().map((u) => {
        if (u.id === targetId) {
          return { ...u, reputation: u.reputation + Math.abs(points) };
        }
        return u;
      });
      Storage.set("devflow_all_users", all);
    }
  };

  const deductPoints = (points: number, reason: string, relatedEntityId?: string, targetUserId?: string) => {
    const targetId = targetUserId || user?.id;
    if (!targetId) return;

    const deduction = -Math.abs(points);
    const newLog: ReputationLog = {
      id: "rep-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      userId: targetId,
      points: deduction,
      reason,
      createdAt: new Date().toISOString(),
      relatedEntityId,
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    Storage.saveReputationLogs(updated);

    if (targetId === user?.id && user) {
      updateProfile({ reputation: Math.max(0, user.reputation + deduction) });
    } else {
      const all = Storage.getAllUsers().map((u) => {
        if (u.id === targetId) {
          return { ...u, reputation: Math.max(0, u.reputation + deduction) };
        }
        return u;
      });
      Storage.set("devflow_all_users", all);
    }
  };

  const transferPoints = (receiverId: string, amount: number, reason: string): { success: boolean; message: string } => {
    if (!user) return { success: false, message: "Please log in to transfer points." };

    // Validation 1: User must have > 50 reputation points
    if (user.reputation <= 50) {
      return {
        success: false,
        message: "You must have more than 50 reputation points to transfer reputation.",
      };
    }

    // Validation 2: Maximum 50 points per transaction
    if (amount <= 0 || amount > 50) {
      return {
        success: false,
        message: "Maximum transfer limit is 50 points per transaction.",
      };
    }

    // Validation 3: Maximum 100 points per day
    const today = new Date().toISOString().split("T")[0];
    const todayTotal = transfers
      .filter((t) => t.senderId === user.id && t.timestamp.startsWith(today))
      .reduce((sum, t) => sum + t.amount, 0);

    if (todayTotal + amount > 100) {
      return {
        success: false,
        message: `Daily transfer limit exceeded. You have already transferred ${todayTotal}/100 points today.`,
      };
    }

    if (user.reputation - amount < 0) {
      return {
        success: false,
        message: "Insufficient reputation balance.",
      };
    }

    const receiver = users.find((u) => u.id === receiverId);
    if (!receiver) {
      return { success: false, message: "Recipient user not found." };
    }

    const newTransfer: ReputationTransfer = {
      id: "tx-" + Date.now(),
      senderId: user.id,
      senderName: user.name,
      receiverId: receiver.id,
      receiverName: receiver.name,
      amount,
      reason: reason || "Community recognition transfer",
      timestamp: new Date().toISOString(),
    };

    const updatedTransfers = [newTransfer, ...transfers];
    setTransfers(updatedTransfers);
    Storage.saveRepTransfers(updatedTransfers);

    // Deduct from sender
    deductPoints(amount, `Transferred ${amount} points to ${receiver.name} (Reason: ${reason})`, newTransfer.id, user.id);
    // Add to receiver
    addPoints(amount, `Received ${amount} points from ${user.name} (Reason: ${reason})`, newTransfer.id, receiver.id);

    return {
      success: true,
      message: `Successfully transferred ${amount} reputation points to ${receiver.name}!`,
    };
  };

  // Privileges
  const canCommentWithoutRestrictions = reputation >= 50;
  const canEditCommunityPosts = reputation >= 100;
  const canVoteToCloseQuestions = reputation >= 250;
  const canReportContent = reputation >= 500;

  return (
    <ReputationContext.Provider
      value={{
        reputation,
        logs: logs.filter((l) => l.userId === user?.id),
        transfers: transfers.filter((t) => t.senderId === user?.id || t.receiverId === user?.id),
        addPoints,
        deductPoints,
        transferPoints,
        canCommentWithoutRestrictions,
        canEditCommunityPosts,
        canVoteToCloseQuestions,
        canReportContent,
      }}
    >
      {children}
    </ReputationContext.Provider>
  );
};

export const useReputation = () => {
  const context = useContext(ReputationContext);
  if (!context) throw new Error("useReputation must be used within a ReputationProvider");
  return context;
};

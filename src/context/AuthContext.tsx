"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserSession, SecurityAuditLog } from "@/types";
import { Storage } from "@/lib/storage";

interface AuthContextType {
  user: UserProfile | null;
  users: UserProfile[];
  sessions: UserSession[];
  securityLogs: SecurityAuditLog[];
  login: (emailOrPhone: string, rememberDevice?: boolean, password?: string) => { success: boolean; requiresOtp?: boolean; message?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  completeProfileBonus: () => boolean;
  revokeSession: (sessionId: string) => void;
  revokeAllOtherSessions: () => void;
  requestForgotPassword: (identifier: string, isEmail: boolean) => { success: boolean; message: string; demoOtp?: string };
  generateSecurePassword: (length?: number) => string;
  resetPasswordWithOtp: (identifier: string, otp: string, newPass: string) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to detect device info
function detectDevice() {
  if (typeof window === "undefined") {
    return {
      browser: "Chrome",
      os: "Windows 11",
      deviceType: "Desktop" as const,
      ip: "103.87.58.12",
      location: "Jaipur, Rajasthan, India",
    };
  }

  const ua = navigator.userAgent;
  let browser = "Chrome";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Microsoft Edge";

  let os = "Windows";
  if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  let deviceType: "Desktop" | "Mobile" | "Tablet" = "Desktop";
  if (/Mobi|Android/i.test(ua)) deviceType = "Mobile";
  if (/iPad|Tablet/i.test(ua)) deviceType = "Tablet";

  return {
    browser: `${browser} (Latest)`,
    os,
    deviceType,
    ip: "103.87.58.12",
    location: "Jaipur, Rajasthan, India",
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLog[]>([]);

  useEffect(() => {
    Storage.init();
    const curr = Storage.getCurrentUser();
    setUser(curr);
    setUsers(Storage.getAllUsers());
    setSessions(Storage.getSessions());
    setSecurityLogs(Storage.getSecurityLogs());
  }, []);

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setUser(found);
      Storage.setCurrentUser(found);
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const newUser = { ...user, ...updated };
    setUser(newUser);
    Storage.setCurrentUser(newUser);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? newUser : u)));
  };

  const completeProfileBonus = (): boolean => {
    if (!user || user.profileCompleted) return false;
    updateProfile({
      profileCompleted: true,
      reputation: user.reputation + 10,
    });

    const newLog: SecurityAuditLog = {
      id: "sec-" + Date.now(),
      userId: user.id,
      userName: user.name,
      action: "login_success",
      ...detectDevice(),
      timestamp: new Date().toISOString(),
      details: "Profile completed: +10 bonus reputation awarded.",
    };
    const updatedLogs = [newLog, ...securityLogs];
    setSecurityLogs(updatedLogs);
    Storage.saveSecurityLogs(updatedLogs);
    return true;
  };

  const login = (emailOrPhone: string, rememberDevice = true, password = "password") => {
    const normalized = emailOrPhone.trim().toLowerCase();
    const matched = users.find(
      (u) =>
        u.email.toLowerCase() === normalized ||
        u.phone.replace(/\s+/g, "") === emailOrPhone.replace(/\s+/g, "")
    );
    if (!matched) return { success: false, message: "No account matches that email address or phone number." };

    // Demo accounts use the documented password unless the account has been reset in this browser.
    // This is a client-side training demo, not production authentication.
    const savedPasswords = Storage.get<Record<string, string>>("devflow_demo_passwords", {});
    if (!password || password !== (savedPasswords[matched.id] || "password")) {
      return { success: false, message: "Incorrect password. Demo accounts use the password \"password\" unless you reset it in this browser." };
    }

    const device = detectDevice();
    const sessionId = "session-" + Date.now();
    const newSession: UserSession = {
      id: sessionId,
      userId: matched.id,
      browser: device.browser,
      os: device.os,
      deviceType: device.deviceType,
      ip: device.ip,
      location: device.location,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isCurrent: true,
      isTrusted: rememberDevice,
    };

    const updatedSessions = [
      newSession,
      ...sessions.map((s) => ({ ...s, isCurrent: false })),
    ];
    setSessions(updatedSessions);
    Storage.saveSessions(updatedSessions);

    const audit: SecurityAuditLog = {
      id: "sec-" + Date.now(),
      userId: matched.id,
      userName: matched.name,
      action: "login_success",
      ...device,
      timestamp: new Date().toISOString(),
      details: `Successful login on ${device.browser} (${device.os}).`,
    };
    const updatedAudit = [audit, ...securityLogs];
    setSecurityLogs(updatedAudit);
    Storage.saveSecurityLogs(updatedAudit);

    setUser(matched);
    Storage.setCurrentUser(matched);
    return { success: true };
  };

  const logout = () => {
    if (user) {
      const updated = sessions.filter((s) => !s.isCurrent);
      setSessions(updated);
      Storage.saveSessions(updated);
    }
  };

  const revokeSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    Storage.saveSessions(updated);

    if (user) {
      const audit: SecurityAuditLog = {
        id: "sec-" + Date.now(),
        userId: user.id,
        userName: user.name,
        action: "session_revoked",
        ...detectDevice(),
        timestamp: new Date().toISOString(),
        details: `Revoked session ${sessionId}.`,
      };
      const updatedAudit = [audit, ...securityLogs];
      setSecurityLogs(updatedAudit);
      Storage.saveSecurityLogs(updatedAudit);
    }
  };

  const revokeAllOtherSessions = () => {
    const updated = sessions.filter((s) => s.isCurrent);
    setSessions(updated);
    Storage.saveSessions(updated);
  };

  // Task 2: Forgot Password with 1 request per day restriction
  const requestForgotPassword = (identifier: string, isEmail: boolean): { success: boolean; message: string; demoOtp?: string } => {
    const normalized = identifier.trim().toLowerCase();
    const matched = users.find((u) =>
      isEmail
        ? u.email.toLowerCase() === normalized
        : u.phone.replace(/\s+/g, "") === identifier.replace(/\s+/g, "")
    );
    if (!matched) return { success: false, message: "No account matches that registered email address or phone number." };
    const today = new Date().toLocaleDateString("en-CA");
    const lastRequested = Storage.get<string | null>("devflow_forgot_pass_last_date_" + normalized, null);

    if (lastRequested === today) {
      return {
        success: false,
        message: "You can use this option only one time per day.",
      };
    }

    Storage.set("devflow_forgot_pass_last_date_" + normalized, today);
    const otp = String(100000 + Math.floor(Math.random() * 900000));
    Storage.set("devflow_password_reset_otp_" + normalized, {
      otp,
      date: today,
      expiresAt: Date.now() + 10 * 60 * 1000,
      userId: matched.id,
    });

    // Audit log
    const audit: SecurityAuditLog = {
      id: "sec-" + Date.now(),
      userId: matched.id,
      userName: matched.name,
      action: "otp_requested",
      ...detectDevice(),
      timestamp: new Date().toISOString(),
      details: `Password reset OTP requested via ${isEmail ? "Email" : "Mobile Phone"}.`,
    };
    const updatedAudit = [audit, ...securityLogs];
    setSecurityLogs(updatedAudit);
    Storage.saveSecurityLogs(updatedAudit);

    return {
      success: true,
      message: `Demo verification code generated for the registered ${isEmail ? "email" : "mobile number"}. No email/SMS provider is configured, so this is a local demo flow, not a real message. The code expires in 10 minutes.`,
      demoOtp: otp,
    };
  };

  // Task 2: Password Generator (ONLY uppercase and lowercase letters, NO numbers, NO special chars)
  const generateSecurePassword = (length = 12): string => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const all = upper + lower;

    let pass = "";
    // Ensure at least one upper and one lower
    pass += upper[Math.floor(Math.random() * upper.length)];
    pass += lower[Math.floor(Math.random() * lower.length)];

    for (let i = 2; i < length; i++) {
      pass += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle characters
    return pass
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
  };

  const resetPasswordWithOtp = (identifier: string, otp: string, newPass: string): { success: boolean; message: string } => {
    // Validate only uppercase and lowercase letters
    const lettersOnlyRegex = /^[A-Za-z]+$/;
    if (!lettersOnlyRegex.test(newPass)) {
      return {
        success: false,
        message: "Password must contain ONLY uppercase and lowercase letters (no numbers or special characters).",
      };
    }

    const normalized = identifier.trim().toLowerCase();
    const reset = Storage.get<{ otp: string; date: string; expiresAt: number; userId: string } | null>("devflow_password_reset_otp_" + normalized, null);
    if (!reset || reset.otp !== otp.trim() || reset.expiresAt < Date.now() || reset.date !== new Date().toLocaleDateString("en-CA")) {
      return { success: false, message: "Invalid or expired verification code. Request a new code when the daily limit permits." };
    }
    const savedPasswords = Storage.get<Record<string, string>>("devflow_demo_passwords", {});
    savedPasswords[reset.userId] = newPass;
    Storage.set("devflow_demo_passwords", savedPasswords);
    Storage.set("devflow_password_reset_otp_" + normalized, null);

    const audit: SecurityAuditLog = {
      id: "sec-" + Date.now(),
      userId: reset.userId,
      userName: identifier,
      action: "password_reset",
      ...detectDevice(),
      timestamp: new Date().toISOString(),
      details: "Password successfully updated with generated/new alphabetical password.",
    };
    const updatedAudit = [audit, ...securityLogs];
    setSecurityLogs(updatedAudit);
    Storage.saveSecurityLogs(updatedAudit);

    return {
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        sessions,
        securityLogs,
        login,
        logout,
        switchUser,
        updateProfile,
        completeProfileBonus,
        revokeSession,
        revokeAllOtherSessions,
        requestForgotPassword,
        generateSecurePassword,
        resetPasswordWithOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

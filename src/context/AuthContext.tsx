"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserSession, SecurityAuditLog } from "@/types";
import { Storage } from "@/lib/storage";

interface AuthContextType {
  user: UserProfile | null;
  users: UserProfile[];
  sessions: UserSession[];
  securityLogs: SecurityAuditLog[];
  login: (emailOrPhone: string, password?: string, rememberDevice?: boolean) => { success: boolean; requiresOtp?: boolean; message?: string };
  register: (name: string, email: string, phone: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  completeProfileBonus: () => boolean;
  revokeSession: (sessionId: string) => void;
  revokeAllOtherSessions: () => void;
  requestForgotPassword: (identifier: string, isEmail: boolean) => { success: boolean; message: string; challengeOtp?: string };
  verifyResetOtp: (identifier: string, code: string) => { success: boolean; message: string };
  generateSecurePassword: (length?: number) => string;
  resetPasswordWithOtp: (identifier: string, otpCode: string, newPass: string) => { success: boolean; message: string };
  activeResetChallenge: { identifier: string; code: string; expiresAt: number; verified?: boolean } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to detect device info
function detectDevice() {
  if (typeof window === "undefined") {
    return {
      browser: "Chrome (Server)",
      os: "Windows",
      deviceType: "Desktop" as const,
      ip: "127.0.0.1 (Local Environment)",
      location: "Localhost",
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
    browser,
    os,
    deviceType,
    ip: "127.0.0.1 (Local Session)",
    location: "Client Environment",
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [allSessions, setAllSessions] = useState<UserSession[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLog[]>([]);
  const [activeResetChallenge, setActiveResetChallenge] = useState<{
    identifier: string;
    code: string;
    expiresAt: number;
    verified?: boolean;
  } | null>(null);

  useEffect(() => {
    Storage.init();
    const curr = Storage.getCurrentUser();
    const allUsers = Storage.getAllUsers();
    const storedSessions = Storage.getSessions();
    setUsers(allUsers);
    setSecurityLogs(Storage.getSecurityLogs());

    if (curr) {
      const expiryMinutes = curr.sessionExpiryMinutes || 60;
      const expiryMs = expiryMinutes * 60 * 1000;
      const userSessions = storedSessions.filter((s) => s.userId === curr.id);
      const currentSession = userSessions.find((s) => s.isCurrent) || userSessions[0];

      if (currentSession && Date.now() - new Date(currentSession.lastActiveAt).getTime() > expiryMs) {
        // Session expired due to inactivity
        Storage.clearCurrentUser();
        setUser(null);
        const expiredSessions = storedSessions.map((s) => (s.id === currentSession.id ? { ...s, isCurrent: false } : s));
        setAllSessions(expiredSessions);
        Storage.saveSessions(expiredSessions);
      } else {
        setUser(curr);
        const nowIso = new Date().toISOString();
        const refreshed = storedSessions.map((s) => {
          if (currentSession && s.id === currentSession.id) {
            return { ...s, isCurrent: true, lastActiveAt: nowIso };
          }
          return s;
        });
        setAllSessions(refreshed);
        Storage.saveSessions(refreshed);
      }
    } else {
      setUser(null);
      setAllSessions(storedSessions);
    }

    let lastActivityTime = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityTime > 60000) {
        lastActivityTime = now;
        const currentU = Storage.getCurrentUser();
        if (currentU) {
          const sessionsNow = Storage.getSessions();
          const updated = sessionsNow.map((s) => (s.userId === currentU.id && s.isCurrent ? { ...s, lastActiveAt: new Date().toISOString() } : s));
          Storage.saveSessions(updated);
          setAllSessions(updated);
        }
      }
    };

    window.addEventListener("click", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });

    return () => {
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, []);

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setUser(found);
      Storage.setCurrentUser(found);

      const sessionsFromStorage = Storage.getSessions();
      const userSessions = sessionsFromStorage.filter((s) => s.userId === userId);
      let updated: UserSession[];
      if (userSessions.length > 0) {
        updated = sessionsFromStorage.map((s) => {
          if (s.userId === userId) {
            return { ...s, isCurrent: s.id === userSessions[0].id, lastActiveAt: new Date().toISOString() };
          }
          return s;
        });
      } else {
        const device = detectDevice();
        const newSession: UserSession = {
          id: "session-" + Date.now(),
          userId: found.id,
          browser: device.browser,
          os: device.os,
          deviceType: device.deviceType,
          ip: device.ip,
          location: device.location,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          isCurrent: true,
          isTrusted: true,
        };
        updated = [newSession, ...sessionsFromStorage];
      }
      setAllSessions(updated);
      Storage.saveSessions(updated);
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const newUser = { ...user, ...updated };
    setUser(newUser);
    Storage.setCurrentUser(newUser);
    const updatedUsers = Storage.getAllUsers().map((u) => (u.id === user.id ? newUser : u));
    setUsers(updatedUsers);
    Storage.set("devflow_all_users", updatedUsers);
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

  const login = (emailOrPhone: string, password?: string, rememberDevice = true) => {
    const cleanId = emailOrPhone.trim().toLowerCase();
    const cleanPhone = emailOrPhone.replace(/\s+/g, "");

    const matched = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.phone.replace(/\s+/g, "") === cleanPhone
    );

    if (!matched) {
      return {
        success: false,
        message: "No registered account found with this email or phone number.",
      };
    }

    if (matched.isSuspended) {
      return {
        success: false,
        message: "This account has been suspended by an administrator for repeated guideline violations.",
      };
    }

    // Password validation (if password argument is supplied)
    if (password !== undefined) {
      const storedPass = matched.password || "DevFlow2026";
      if (password !== storedPass) {
        // Record failed login audit log
        const failedAudit: SecurityAuditLog = {
          id: "sec-" + Date.now(),
          userId: matched.id,
          userName: matched.name,
          action: "login_failed",
          ...detectDevice(),
          timestamp: new Date().toISOString(),
          details: `Failed login attempt: incorrect password entered for ${matched.email}.`,
        };
        const updatedAudit = [failedAudit, ...securityLogs];
        setSecurityLogs(updatedAudit);
        Storage.saveSecurityLogs(updatedAudit);

        return {
          success: false,
          message: "Incorrect password. Please verify and try again.",
        };
      }
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

    const currentSessions = Storage.getSessions();
    const updatedSessions = [
      newSession,
      ...currentSessions.map((s) => (s.userId === matched.id ? { ...s, isCurrent: false } : s)),
    ];
    setAllSessions(updatedSessions);
    Storage.saveSessions(updatedSessions);

    const audit: SecurityAuditLog = {
      id: "sec-" + Date.now(),
      userId: matched.id,
      userName: matched.name,
      action: "login_success",
      ...device,
      timestamp: new Date().toISOString(),
      details: `Successful authenticated login on ${device.browser} (${device.os}).`,
    };
    const updatedAudit = [audit, ...securityLogs];
    setSecurityLogs(updatedAudit);
    Storage.saveSecurityLogs(updatedAudit);

    setUser(matched);
    Storage.setCurrentUser(matched);
    return { success: true };
  };

  const register = (name: string, email: string, phone: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/\s+/g, "");

    // Check duplicate email
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        message: "An account with this email address already exists. Please sign in instead.",
      };
    }

    // Check duplicate phone
    if (users.some((u) => u.phone.replace(/\s+/g, "") === cleanPhone)) {
      return {
        success: false,
        message: "An account with this mobile phone number already exists.",
      };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        message: "Password must be at least 6 characters long.",
      };
    }

    const newUser: UserProfile = {
      id: "user-" + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      title: "Community Developer",
      bio: "Newly joined DevFlow developer sharing knowledge and asking questions.",
      location: "India",
      tier: "free",
      reputation: 0,
      profileCompleted: false,
      role: "user",
      isSuspended: false,
      createdAt: new Date().toISOString(),
      dailyQuestionsCount: {},
      dailyRepTransferCount: {},
      following: [],
      bookmarks: [],
      trustedDevices: [],
      sessionExpiryMinutes: 60,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    Storage.set("devflow_all_users", updatedUsers);

    // Auto login
    setUser(newUser);
    Storage.setCurrentUser(newUser);

    const device = detectDevice();
    const sessionId = "session-" + Date.now();
    const newSession: UserSession = {
      id: sessionId,
      userId: newUser.id,
      browser: device.browser,
      os: device.os,
      deviceType: device.deviceType,
      ip: device.ip,
      location: device.location,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isCurrent: true,
      isTrusted: true,
    };
    const currentSessions = Storage.getSessions();
    const updatedSessions = [
      newSession,
      ...currentSessions.map((s) => (s.userId === newUser.id ? { ...s, isCurrent: false } : s)),
    ];
    setAllSessions(updatedSessions);
    Storage.saveSessions(updatedSessions);

    return { success: true };
  };

  const logout = () => {
    if (user) {
      const currentSessions = Storage.getSessions();
      const updated = currentSessions.map((s) => (s.userId === user.id && s.isCurrent ? { ...s, isCurrent: false } : s));
      setAllSessions(updated);
      Storage.saveSessions(updated);
      setUser(null);
      Storage.clearCurrentUser();
    }
  };

  const revokeSession = (sessionId: string) => {
    if (!user) return;
    const currentSessions = Storage.getSessions();
    const target = currentSessions.find((s) => s.id === sessionId);
    if (!target || target.userId !== user.id) return;

    const updated = currentSessions.filter((s) => s.id !== sessionId);
    setAllSessions(updated);
    Storage.saveSessions(updated);

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
  };

  const revokeAllOtherSessions = () => {
    if (!user) return;
    const currentSessions = Storage.getSessions();
    const updated = currentSessions.filter((s) => s.userId !== user.id || s.isCurrent);
    setAllSessions(updated);
    Storage.saveSessions(updated);
  };

  // Task 2: Forgot Password with 1 request per day restriction
  const requestForgotPassword = (identifier: string, isEmail: boolean): { success: boolean; message: string; challengeOtp?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/\s+/g, "");

    const matched = users.find((u) =>
      isEmail
        ? u.email.toLowerCase() === cleanId
        : u.phone.replace(/\s+/g, "") === cleanPhone
    );

    if (!matched) {
      return {
        success: false,
        message: `No registered account found with this ${isEmail ? "email address" : "mobile phone number"}.`,
      };
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const lastRequestedKey = "devflow_forgot_pass_last_date_" + matched.id;
    const lastRequested = Storage.get<string | null>(lastRequestedKey, null) || matched.forgotPasswordLastRequestedAt;

    if (lastRequested === today) {
      return {
        success: false,
        message: "You can use this option only one time per day.",
      };
    }

    // Persist today's date both in user profile and storage key
    Storage.set(lastRequestedKey, today);
    const updatedUsers = users.map((u) =>
      u.id === matched.id ? { ...u, forgotPasswordLastRequestedAt: today } : u
    );
    setUsers(updatedUsers);
    Storage.set("devflow_all_users", updatedUsers);
    if (user?.id === matched.id) {
      setUser({ ...user, forgotPasswordLastRequestedAt: today });
      Storage.setCurrentUser({ ...user, forgotPasswordLastRequestedAt: today });
    }

    // Generate 6-digit challenge code
    const challengeCode = Math.floor(100000 + Math.random() * 900000).toString();
    const challenge = {
      identifier: matched.email,
      code: challengeCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      verified: false,
    };
    setActiveResetChallenge(challenge);

    // Audit log
    const audit: SecurityAuditLog = {
      id: "sec-" + Date.now(),
      userId: matched.id,
      userName: matched.name,
      action: "otp_requested",
      ...detectDevice(),
      timestamp: new Date().toISOString(),
      details: `Password reset verification challenge requested via ${isEmail ? "Email" : "Mobile Phone"}.`,
    };
    const updatedAudit = [audit, ...securityLogs];
    setSecurityLogs(updatedAudit);
    Storage.saveSecurityLogs(updatedAudit);

    return {
      success: true,
      message: `Reset verification challenge created for registered ${isEmail ? "email" : "mobile number"}: ${identifier}`,
      challengeOtp: challengeCode,
    };
  };

  const verifyResetOtp = (identifier: string, code: string): { success: boolean; message: string } => {
    if (!activeResetChallenge) {
      return {
        success: false,
        message: "No active password reset challenge found. Please request a new reset code.",
      };
    }

    if (Date.now() > activeResetChallenge.expiresAt) {
      return {
        success: false,
        message: "Verification code has expired. Please request a new reset challenge.",
      };
    }

    if (activeResetChallenge.code.trim() !== code.trim()) {
      return {
        success: false,
        message: "Invalid verification code. Please check your challenge code and try again.",
      };
    }

    setActiveResetChallenge({
      ...activeResetChallenge,
      verified: true,
    });

    return {
      success: true,
      message: "Verification successful! You may now set your new letters-only password.",
    };
  };

  // Task 2: Password Generator (ONLY uppercase and lowercase letters, NO numbers, NO special chars)
  const generateSecurePassword = (length = 12): string => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const all = upper + lower;

    let pass = "";
    // Ensure at least one uppercase and one lowercase letter
    pass += upper[Math.floor(Math.random() * upper.length)];
    pass += lower[Math.floor(Math.random() * lower.length)];

    // Use Web Crypto if available for cryptographic randomness
    if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
      const randomValues = new Uint32Array(length - 2);
      window.crypto.getRandomValues(randomValues);
      for (let i = 0; i < randomValues.length; i++) {
        pass += all[randomValues[i] % all.length];
      }
    } else {
      for (let i = 2; i < length; i++) {
        pass += all[Math.floor(Math.random() * all.length)];
      }
    }

    // Shuffle characters
    return pass
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
  };

  const resetPasswordWithOtp = (identifier: string, otpCode: string, newPass: string): { success: boolean; message: string } => {
    // Validate challenge exists
    if (!activeResetChallenge) {
      return {
        success: false,
        message: "No active reset challenge. Please initiate password recovery first.",
      };
    }

    // Validate OTP code
    if (activeResetChallenge.code.trim() !== otpCode.trim() && !activeResetChallenge.verified) {
      return {
        success: false,
        message: "Invalid verification code entered.",
      };
    }

    // Validate ONLY uppercase and lowercase letters
    const lettersOnlyRegex = /^[A-Za-z]+$/;
    if (!lettersOnlyRegex.test(newPass)) {
      return {
        success: false,
        message: "Password must contain ONLY uppercase and lowercase letters (no numbers or special characters).",
      };
    }

    if (newPass.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 letters long.",
      };
    }

    // Find user to update
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/\s+/g, "");
    const matched = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.phone.replace(/\s+/g, "") === cleanPhone
    );

    if (!matched) {
      return {
        success: false,
        message: "Could not find registered user to update password.",
      };
    }

    // Update password in all users
    const updatedUsers = users.map((u) =>
      u.id === matched.id ? { ...u, password: newPass } : u
    );
    setUsers(updatedUsers);
    Storage.set("devflow_all_users", updatedUsers);

    if (user?.id === matched.id) {
      const updatedUser = { ...user, password: newPass };
      setUser(updatedUser);
      Storage.setCurrentUser(updatedUser);
    }

    // Clear active challenge
    setActiveResetChallenge(null);

    const audit: SecurityAuditLog = {
      id: "sec-" + Date.now(),
      userId: matched.id,
      userName: matched.name,
      action: "password_reset",
      ...detectDevice(),
      timestamp: new Date().toISOString(),
      details: "Password successfully updated with generated/new alphabetical credentials.",
    };
    const updatedAudit = [audit, ...securityLogs];
    setSecurityLogs(updatedAudit);
    Storage.saveSecurityLogs(updatedAudit);

    return {
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    };
  };

  const userSessions = user ? allSessions.filter((s) => s.userId === user.id) : [];

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        sessions: userSessions,
        securityLogs,
        login,
        register,
        logout,
        switchUser,
        updateProfile,
        completeProfileBonus,
        revokeSession,
        revokeAllOtherSessions,
        requestForgotPassword,
        verifyResetOtp,
        generateSecurePassword,
        resetPasswordWithOtp,
        activeResetChallenge,
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

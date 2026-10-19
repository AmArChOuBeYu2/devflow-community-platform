"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SupportedLanguage } from "@/types";
import { translations, TranslationDictionary } from "@/lib/translations";
import { Storage } from "@/lib/storage";
import { useAuth } from "./AuthContext";

interface LanguageContextType {
  language: SupportedLanguage;
  t: TranslationDictionary;
  pendingLanguage: SupportedLanguage | null;
  otpModalOpen: boolean;
  otpChannel: "email" | "mobile";
  otpTargetDestination: string;
  generatedOtp: string;
  initiateLanguageChange: (targetLang: SupportedLanguage) => void;
  verifyAndApplyLanguage: (enteredOtp: string) => { success: boolean; message: string };
  cancelLanguageChange: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [pendingLanguage, setPendingLanguage] = useState<SupportedLanguage | null>(null);
  const [otpModalOpen, setOtpModalOpen] = useState<boolean>(false);
  const [otpChannel, setOtpChannel] = useState<"email" | "mobile">("mobile");
  const [otpTargetDestination, setOtpTargetDestination] = useState<string>("");
  const [generatedOtp, setGeneratedOtp] = useState<string>("");

  useEffect(() => {
    if (Storage.isBrowser()) {
      const saved = localStorage.getItem("devflow_user_language") as SupportedLanguage;
      if (saved && ["en", "es", "hi", "pt", "zh", "fr"].includes(saved)) {
        setLanguage(saved);
      }
    }
  }, []);

  const initiateLanguageChange = (targetLang: SupportedLanguage) => {
    if (targetLang === language) return;

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setPendingLanguage(targetLang);

    // Rule: French requires email OTP verification; all other 5 languages require mobile OTP verification!
    if (targetLang === "fr") {
      setOtpChannel("email");
      setOtpTargetDestination(user?.email || "sc62970@gmail.com");
    } else {
      setOtpChannel("mobile");
      setOtpTargetDestination(user?.phone || "+91 9876543210");
    }

    setOtpModalOpen(true);
  };

  const verifyAndApplyLanguage = (enteredOtp: string): { success: boolean; message: string } => {
    if (enteredOtp.trim() !== generatedOtp.trim()) {
      return {
        success: false,
        message: "Invalid OTP. Please check the code sent to your " + (otpChannel === "email" ? "registered email" : "registered mobile number"),
      };
    }

    if (pendingLanguage) {
      setLanguage(pendingLanguage);
      if (Storage.isBrowser()) {
        localStorage.setItem("devflow_user_language", pendingLanguage);
      }
    }

    setOtpModalOpen(false);
    setPendingLanguage(null);
    return {
      success: true,
      message: `Language successfully verified and switched in this demo. No real email or SMS was sent.`,
    };
  };

  const cancelLanguageChange = () => {
    setOtpModalOpen(false);
    setPendingLanguage(null);
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider
      value={{
        language,
        t,
        pendingLanguage,
        otpModalOpen,
        otpChannel,
        otpTargetDestination,
        generatedOtp,
        initiateLanguageChange,
        verifyAndApplyLanguage,
        cancelLanguageChange,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};

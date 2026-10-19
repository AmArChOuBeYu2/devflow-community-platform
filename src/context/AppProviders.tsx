"use client";

import React from "react";
import { AuthProvider } from "./AuthContext";
import { LanguageProvider } from "./LanguageContext";
import { ReputationProvider } from "./ReputationContext";
import { SubscriptionProvider } from "./SubscriptionContext";
import { QuestionsProvider } from "./QuestionsContext";
import { CommunityProvider } from "./CommunityContext";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ReputationProvider>
          <SubscriptionProvider>
            <QuestionsProvider>
              <CommunityProvider>{children}</CommunityProvider>
            </QuestionsProvider>
          </SubscriptionProvider>
        </ReputationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

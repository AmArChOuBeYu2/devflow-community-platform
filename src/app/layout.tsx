import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/context/AppProviders";
import { Navbar } from "@/components/layout/Navbar";
import { LanguageOtpModal } from "@/components/modals/LanguageOtpModal";

export const metadata: Metadata = {
  title: "DevFlow - Developer Community & Knowledge Platform | Elevance Skills",
  description: "Advanced Stack Overflow Community platform with technical feed, multi-language OTP verification, Razorpay subscriptions, reputation reward transfers, and device security management.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <AppProviders>
          <Navbar />
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
          <LanguageOtpModal />
        </AppProviders>
      </body>
    </html>
  );
}

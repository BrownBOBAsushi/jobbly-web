// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// --- START: Added lines ---
import { AppProvider } from '@/context/AppContext'; 
// --- END: Added lines ---

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwiftJob AI Matching Dashboard", // Adjusted title slightly
  description: "High-level matching for applicants powered by Groq AI.", // Adjusted description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* --- START: Added wrapper --- */}
        <AppProvider> 
          {children}
        </AppProvider>
        {/* --- END: Added wrapper --- */}
      </body>
    </html>
  );
}
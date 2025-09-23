import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import Providers from "@/components/Providers"; // Commented out for simplified client-side app
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeetCode Tracker",
  description: "Track your LeetCode progress by company",
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
        {children}
        {/* Commented out Providers wrapper for simplified client-side app */}
        {/*
        <Providers>
          {children}
        </Providers>
        */}
      </body>
    </html>
  );
}

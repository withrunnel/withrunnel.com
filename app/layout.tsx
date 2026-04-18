import { Agentation } from "agentation";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export const metadata: Metadata = {
  title: "Runnel — The Inference Platform",
  description:
    "Seamlessly integrate 70+ models all in one place. Runnel is your scalable choice for AI inference.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {TURNSTILE_SITE_KEY ? (
          <link rel="preconnect" href="https://challenges.cloudflare.com" />
        ) : null}
      </head>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}

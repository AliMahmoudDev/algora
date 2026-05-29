import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Algora — Master Algorithms. Code the Future.",
  description:
    "A bilingual (Arabic + English) algorithms & problem-solving education platform. Learn with AI-powered assistance, real code editors, and comprehensive algorithm coverage.",
  keywords: [
    "Algora",
    "algorithms",
    "competitive programming",
    "problem solving",
    "bilingual",
    "Arabic",
    "English",
    "AI",
    "code editor",
  ],
  authors: [{ name: "Algora Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Algora — Master Algorithms. Code the Future.",
    description:
      "A bilingual algorithms & problem-solving education platform with AI-powered learning.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${ibmPlexMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

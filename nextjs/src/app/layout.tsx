import { Sidebar } from "@/components/layout/Sidebar";
import { Providers } from "@/providers/Providers";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LexiFlow - AI Legal Suite",
    template: "%s | LexiFlow",
  },
  description:
    "Enterprise legal OS combining Case Management, Discovery, Legal Research, and Firm Operations",
  keywords: [
    "legal",
    "case management",
    "discovery",
    "legal research",
    "law firm",
    "AI legal",
  ],
  authors: [{ name: "LexiFlow" }],
  creator: "LexiFlow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lexiflow.ai",
    title: "LexiFlow - AI Legal Suite",
    description:
      "Enterprise legal OS combining Case Management, Discovery, Legal Research, and Firm Operations",
    siteName: "LexiFlow",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased h-screen overflow-hidden`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hire N Fire — Expert Home Services On Demand",
  description: "Book trusted electricians, plumbers, AC technicians and tech support professionals instantly. Verified providers, transparent pricing, real-time tracking.",
  keywords: ["home services", "electrician", "plumber", "AC repair", "tech support", "on-demand services", "Hire N Fire"],
  authors: [{ name: "Hire N Fire" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Hire N Fire — Expert Home Services On Demand",
    description: "Book trusted home service professionals instantly. Verified providers, transparent pricing.",
    url: "https://hirenfire.com",
    siteName: "Hire N Fire",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hire N Fire — Expert Home Services",
    description: "Book trusted home service professionals instantly.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

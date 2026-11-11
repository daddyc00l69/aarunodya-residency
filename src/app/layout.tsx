import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FloatingContactPill } from "@/components/common/FloatingContactPill";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Aarunodya Residency Bhakt Niwas | Pandharpur | Near Vitthal Mandir",
  description: "Stay at Aarunodya Residency Bhakt Niwas at Nath Chowk, Pandharpur. Deluxe A/C, Non-A/C rooms, and group hall walking distance to Shri Vitthal-Rukmini Mandir. Host: Yuvaraj Malave (8530000820 / 9172464746).",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-16 md:pb-0">
        {children}
        <FloatingContactPill />
        <MobileTabBar />
      </body>
    </html>
  );
}

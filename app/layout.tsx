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

export const metadata: Metadata = {
  title: {
    default: "Dragon's Den",
    template: "%s | Dragon's Den",
  },
  description: "KIS Jeju School Forum - Connect, Share, and Learn Together",
  icons: {
    icon: [
      { url: "/LOGO.png", sizes: "32x32" },
      { url: "/LOGO.png", sizes: "64x64" },
      { url: "/LOGO.png", sizes: "180x180" },
    ],
    shortcut: "/LOGO.png",
    apple: "/LOGO.png",
  },
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
      </body>
    </html>
  );
}

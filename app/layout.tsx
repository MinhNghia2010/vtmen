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
  title: "vtmen",
  description: "Viettel Delivery Network",
  icons: {
    icon: [
      { url: "/vtp_logo.png", sizes: "512x512", type: "image/png" },
      { url: "/vtp_logo.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [
      { url: "/vtp_logo.png", sizes: "180x180", type: "image/png" }
    ],
  },
};

import { AnimationProvider } from "@/contexts/animation-context";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnimationProvider>
          {children}
        </AnimationProvider>
        <Toaster />
      </body>
    </html>
  );
}

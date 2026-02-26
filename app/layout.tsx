"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}>
        <ToastProvider>
          {isLoginPage ? (
            <main className="min-h-screen">{children}</main>
          ) : (
            <div className="flex bg-background min-h-screen">
              <Sidebar />
              <div className="flex-1 flex flex-col pl-64">
                <Navbar />
                <main className="flex-1 pt-20 p-8">
                  {children}
                </main>
              </div>
            </div>
          )}
        </ToastProvider>
      </body>
    </html>
  );
}




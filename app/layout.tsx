import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { AppHeader } from "@/components/auth/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "POS & Merchandise",
  description: "Admin Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <AppHeader />

        <main className="px-6 py-6">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        <Toaster />
      </body>
    </html>
  );
}

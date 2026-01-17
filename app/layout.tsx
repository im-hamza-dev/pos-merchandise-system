import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
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
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">POS & Merchandise</h1>
                <p className="text-sm text-gray-500">Admin Platform</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">Staff Portal</p>
                  <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            </div>

            <nav className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/">Overview</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/checkout">Checkout</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/catalog">Catalog</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/banners">Banners</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/sales">Sales</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/settings">Settings</Link>
              </Button>
            </nav>
          </div>
        </header>

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

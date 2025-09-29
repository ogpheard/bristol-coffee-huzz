import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bristol Café Quest",
  description: "Track your journey through every café in Bristol",
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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-amber-900">
                  ☕ Bristol Café Quest
                </Link>
              </div>
            </div>
          </header>

          {/* Navigation */}
          <nav className="bg-white/60 backdrop-blur-sm border-b border-amber-100 sticky top-[73px] z-40">
            <div className="container mx-auto px-4">
              <div className="flex space-x-1 overflow-x-auto">
                <NavLink href="/add-visit">Add Visit</NavLink>
                <NavLink href="/map">Map</NavLink>
                <NavLink href="/visited">Visited</NavLink>
                <NavLink href="/to-visit">To Visit</NavLink>
                <NavLink href="/scoreboard">Scoreboard</NavLink>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-3 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-t-lg transition-colors whitespace-nowrap"
    >
      {children}
    </Link>
  );
}

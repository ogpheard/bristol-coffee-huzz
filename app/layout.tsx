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
  title: "Bristol Brew Baddies",
  description: "The ultimate café quest across Bristol - Track, rate, and conquer every coffee spot!",
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
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
          {/* Header */}
          <header className="bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-5">
              <div className="flex items-center justify-between">
                <Link href="/" className="group">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl transform group-hover:scale-110 transition-transform">☕</div>
                    <div>
                      <h1 className="text-2xl font-bold text-white tracking-tight">Bristol Brew Baddies</h1>
                      <p className="text-amber-100 text-xs">The Ultimate Café Quest</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </header>

          {/* Navigation */}
          <nav className="bg-white/90 backdrop-blur-md border-b border-amber-200 sticky top-[89px] z-40 shadow-sm">
            <div className="container mx-auto px-4">
              <div className="flex space-x-1 overflow-x-auto py-1">
                <NavLink href="/add-visit">➕ Add Visit</NavLink>
                <NavLink href="/map">🗺️ Map</NavLink>
                <NavLink href="/visited">✅ Visited</NavLink>
                <NavLink href="/to-visit">📍 To Visit</NavLink>
                <NavLink href="/scoreboard">🏆 Scoreboard</NavLink>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gradient-to-r from-amber-900 to-orange-900 text-white py-6 mt-12">
            <div className="container mx-auto px-4 text-center">
              <p className="text-amber-100">Made with ☕ and 💛 in Bristol</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-3 text-sm font-semibold text-amber-800 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-all transform hover:scale-105 whitespace-nowrap"
    >
      {children}
    </Link>
  );
}

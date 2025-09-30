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
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-black shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="group">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl transform group-hover:scale-110 transition-transform">☕</div>
                    <div>
                      <h1 className="text-xl font-bold text-white tracking-tight">Bristol Brew Baddies</h1>
                      <p className="text-gray-400 text-xs">The Ultimate Café Quest</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </header>

          {/* Navigation */}
          <nav className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
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
          <footer className="bg-black text-white py-6 mt-12">
            <div className="container mx-auto px-4 text-center">
              <p className="text-gray-400">Made with ☕ and 💛 in Bristol</p>
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
      className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all whitespace-nowrap"
    >
      {children}
    </Link>
  );
}

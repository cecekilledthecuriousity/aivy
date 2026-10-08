import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cloud HR Appraisal System | TDS Skill Matrix',
  description: 'Cloud-Based HR Performance Appraisal System with Individual Skill Matrix, GAP Analysis, and Gemini AI Narrative',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-indigo-700 transition">
                  HR
                </div>
                <div>
                  <span className="font-bold text-lg text-slate-900 tracking-tight block leading-tight">
                    AIVY Appraisal
                  </span>
                  <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider block">
                    TDS Skill Matrix Cloud
                  </span>
                </div>
              </Link>
            </div>

            <nav className="flex items-center space-x-1 sm:space-x-2">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 hover:text-[#FF9A8B] hover:bg-slate-50 rounded-xl transition flex items-center space-x-1"
              >
                <span className="w-2 h-2 rounded-full bg-[#FF9A8B] inline-block" />
                <span>AIVY Dashboard</span>
              </Link>
              <Link
                href="/portal/my-evaluation"
                className="px-2.5 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
              >
                Portal Karyawan
              </Link>
              <Link
                href="/admin/analytics/tna"
                className="px-2.5 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
              >
                Dasbor HR (TNA)
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            Cloud HR Appraisal System • Skala Kemahiran TDS (1–4) & Analisis GAP Otomatis
          </div>
        </footer>
      </body>
    </html>
  );
}

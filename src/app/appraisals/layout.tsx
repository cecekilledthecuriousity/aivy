import React from 'react';
import { ValuationSidebar } from '@/components/layout/valuation-sidebar';

export default function AppraisalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sunrise-glow text-slate-800 flex flex-col lg:flex-row antialiased">
      <ValuationSidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

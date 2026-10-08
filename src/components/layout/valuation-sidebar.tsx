'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileCheck2,
  Boxes,
  LineChart,
  Settings,
  HelpCircle,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function ValuationSidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard' || pathname === '/',
    },
    {
      label: 'Appraisals',
      href: '/appraisals/aivy-8841',
      icon: FileCheck2,
      active: pathname.startsWith('/appraisals'),
    },
    {
      label: 'HR Skill Matrix',
      href: '/portal/my-evaluation',
      icon: Boxes,
      active: pathname.startsWith('/portal') || pathname.startsWith('/manager') || pathname.startsWith('/admin'),
    },
    {
      label: 'Analytics & Models',
      href: '/admin/analytics/tna',
      icon: LineChart,
      active: false,
    },
    {
      label: 'Settings',
      href: '#',
      icon: Settings,
      active: false,
    },
  ];

  return (
    <>
      {/* Mobile Top Bar with Hamburger */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF9A8B] via-[#FFC3A0] to-[#A1E3FF] flex items-center justify-center shadow-sm">
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">A</span>
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-lg">AIVY</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
          aria-label="Toggle navigation"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/85 backdrop-blur-xl border-r border-slate-200/70 p-5 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } ${className}`}
      >
        <div className="space-y-6">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-2 pt-1">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF9A8B] via-[#FFC3A0] to-[#A1E3FF] flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
                <span className="font-black text-slate-900 text-lg tracking-tighter">AI</span>
              </div>
              <div>
                <div className="font-extrabold text-xl text-slate-900 tracking-tight leading-none">
                  AIVY
                </div>
                <div className="text-[10px] font-semibold tracking-wider text-[#FF9A8B] uppercase mt-1">
                  Cloud Valuation
                </div>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpenMobile(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all group ${
                    item.active
                      ? 'bg-gradient-to-r from-[#FF9A8B]/20 via-[#FFC3A0]/15 to-transparent text-slate-900 font-semibold border-l-4 border-[#FF9A8B]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        item.active ? 'text-[#FF9A8B]' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.active && <ChevronRight className="w-4 h-4 text-[#FF9A8B]" />}
                </Link>
              );
            })}
          </nav>

          {/* Quick Valuation System Badge */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF5F2] via-[#FFFDF9] to-[#F0FAFF] border border-[#FF9A8B]/30 shadow-xs">
            <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-[#FF9A8B]" />
              <span>IVSC & IFRS Compliant</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Standardized cloud asset valuation models & audit trails.
            </p>
          </div>
        </div>

        {/* User Profile Card & Sign Out */}
        <div className="pt-4 border-t border-slate-200/60 space-y-2">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 transition">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FECF6A] via-[#FFC3A0] to-[#FF9A8B] flex items-center justify-center font-bold text-xs text-slate-900 shadow-xs">
                AR
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">Alexandra Ross</div>
                <div className="text-[10px] text-slate-500">Senior Valuer</div>
              </div>
            </div>
            <Link
              href="/login"
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

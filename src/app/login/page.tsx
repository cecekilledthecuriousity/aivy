'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('alexandra.ross@aivy.cloud');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  const handleDemoSignIn = (roleEmail: string) => {
    setEmail(roleEmail);
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-sunrise-glow flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative Sunrise Ambient Glow Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#FF9A8B]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#A1E3FF]/25 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#FECF6A]/15 blur-3xl pointer-events-none" />

      {/* Centered Glassmorphism Card */}
      <div className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 relative z-10 space-y-7 border border-white/80 shadow-soft">
        {/* Header / Logo */}
        <div className="text-center space-y-3">
          <Link href="/dashboard" className="inline-flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF9A8B] via-[#FFC3A0] to-[#A1E3FF] flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
              <span className="font-black text-slate-900 text-xl tracking-tighter">AI</span>
            </div>
            <div className="text-left">
              <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                AIVY
              </div>
              <div className="text-[10px] font-bold tracking-widest text-[#FF9A8B] uppercase mt-1">
                Cloud Appraisal
              </div>
            </div>
          </Link>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-3">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sign in to your cloud valuation & asset intelligence console.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600"
            >
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-slate-200/90 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#FF9A8B] focus:border-[#FF9A8B] transition shadow-2xs"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600"
              >
                Password
              </label>
              <a
                href="#forgot"
                className="text-xs font-semibold text-[#FF9A8B] hover:text-[#e07f71] transition"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white/90 border border-slate-200/90 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#FF9A8B] focus:border-[#FF9A8B] transition shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Device Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              id="remember"
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded text-[#FF9A8B] border-slate-300 focus:ring-[#FF9A8B]"
            />
            <label htmlFor="remember" className="text-xs font-medium text-slate-600">
              Remember this workstation for 30 days
            </label>
          </div>

          {/* Primary Action Button (Coral #FF9A8B with high contrast dark navy text) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-[#FF9A8B] hover:bg-[#FFC3A0] text-slate-900 font-extrabold text-sm shadow-soft hover:shadow-md transition-all active:scale-98 flex items-center justify-center space-x-2 cursor-pointer mt-2 disabled:opacity-70"
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to AIVY'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4 text-slate-900" />}
          </button>
        </form>

        {/* Demo Fast Access Section */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            Or Instant Demo Role Access
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn('alexandra.ross@aivy.cloud')}
              className="p-2.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-[#A1E3FF]/20 hover:border-[#A1E3FF] text-left transition"
            >
              <div className="font-bold text-xs text-slate-900 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-sky-600" />
                <span>Lead Valuer</span>
              </div>
              <div className="text-[10px] text-slate-500">Alexandra Ross</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('marcus.vance@aivy.cloud')}
              className="p-2.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-[#FECF6A]/20 hover:border-[#FECF6A] text-left transition"
            >
              <div className="font-bold text-xs text-slate-900 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-amber-600" />
                <span>Fund Manager</span>
              </div>
              <div className="text-[10px] text-slate-500">Marcus Vance</div>
            </button>
          </div>
        </div>

        {/* Security Stamp Footer */}
        <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-Bit SSL Encrypted Enterprise Vault</span>
        </div>
      </div>

      {/* Bottom Legal / Help Link */}
      <div className="mt-6 text-center text-xs text-slate-500 z-10">
        <span>Need assistance? </span>
        <a href="#support" className="font-semibold text-slate-700 hover:text-[#FF9A8B] transition">
          Contact AIVY Valuation Support
        </a>
      </div>
    </div>
  );
}

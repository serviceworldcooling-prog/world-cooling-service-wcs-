'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, forgotPassword, verifyOtp, resetPassword } from '@/lib/api';
import {
  ShieldCheck, Mail, Lock, KeyRound, Loader2, ArrowLeft, CheckCircle2,
  AlertCircle, Eye, EyeOff, Sparkles, Wind, Wrench, BarChart3, ChevronRight, Copy, Check
} from 'lucide-react';

type Screen = 'login' | 'forgot' | 'reset';

export default function LoginPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('login');
  
  // Form values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Status feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  // Clear feedback when screen changes
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [screen]);

  // Already logged in? Redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      window.location.href = '/dashboard';
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      if (res?.success) {
        setSuccess('Login successful! Redirecting to dashboard…');
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your admin email address.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await forgotPassword(email);
      if (res?.success) {
        setSuccess('Reset OTP code sent to your email.');
        setTimeout(() => {
          setScreen('reset');
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const verifyRes = await verifyOtp(email, otp);
      if (!verifyRes?.success || !verifyRes?.resetToken) {
        throw new Error(verifyRes?.message || 'OTP verification failed.');
      }

      const resetRes = await resetPassword(newPassword, verifyRes.resetToken);
      if (resetRes?.success) {
        setSuccess('Password reset successfully! Redirecting to login…');
        setTimeout(() => {
          setScreen('login');
          setPassword('');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification or password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@acservice.com');
    setPassword('Admin@123456');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-4 lg:p-6 relative overflow-hidden font-sans">
      {/* Ambient glowing light orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-teal-200/30 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-200/30 blur-[120px] pointer-events-none" />

      {/* Main Container Card (Compact Light Mode) */}
      <div className="w-full max-w-4xl bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10">
        
        {/* Left Hero Brand Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 p-5 sm:p-6 lg:p-8 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-200/40 text-white">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-md backdrop-blur-md">
                <Wind className="w-5 h-5 text-teal-300 animate-pulse-subtle" />
              </div>
              <div>
                <h1 className="text-lg font-800 text-white tracking-tight leading-tight">AC Service</h1>
                <p className="text-[10px] font-700 text-teal-300 uppercase tracking-widest">Enterprise Panel</p>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-400/10 border border-teal-400/20 text-teal-200 text-[11px] font-600 mb-3">
                <Sparkles size={12} className="text-amber-300" /> Admin Command Center v2.4
              </span>
              <h2 className="text-xl lg:text-2xl font-800 text-white tracking-tight leading-snug">
                Manage Bookings, Engineers & Fleet
              </h2>
              <p className="mt-2 text-xs text-teal-100/80 leading-relaxed font-normal">
                Real-time tracking, automated dispatching, service warranty, and live customer complaint resolution.
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="my-4 sm:my-5 space-y-2">
            {[
              { icon: Wrench, label: 'Engineer Dispatching & GPS Tracking' },
              { icon: BarChart3, label: 'Real-time Financial & Warranty Reports' },
              { icon: ShieldCheck, label: 'Role-Based Enterprise Security' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-teal-400/20 flex items-center justify-center text-teal-200 shrink-0">
                  <item.icon size={14} />
                </div>
                <span className="text-xs font-600 text-white truncate">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Footer Quote */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-teal-200/80">
            <span>© 2026 World Cooling Service</span>
            <span className="flex items-center gap-1 text-teal-300 font-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" /> Live System
            </span>
          </div>
        </div>

        {/* Right Form Panel (Tight Compact Spacing) */}
        <div className="lg:col-span-7 p-5 sm:p-7 lg:p-8 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">

            {/* Form Header */}
            <div className="mb-4">
              <h3 className="text-xl sm:text-2xl font-800 text-slate-900 tracking-tight">
                {screen === 'login' && 'Sign in to Admin Panel'}
                {screen === 'forgot' && 'Reset Administrator Password'}
                {screen === 'reset' && 'Enter Verification OTP'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {screen === 'login' && 'Authorized personnel access only. Please sign in below.'}
                {screen === 'forgot' && 'We will send a security verification OTP to your email.'}
                {screen === 'reset' && 'Enter the code to update your key.'}
              </p>
            </div>

            {/* Default Admin Credentials Banner (Compact Light Mode) */}
            {screen === 'login' && (
              <div className="mb-4 p-3 rounded-xl bg-teal-50/80 border border-teal-200/80 text-slate-800 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-800 text-white flex items-center justify-center text-[10px] font-800 shrink-0">
                      ⚡
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-800 text-slate-900 truncate">Default Admin Credentials</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={fillDemoAdmin}
                    className="text-[10px] font-800 text-teal-800 bg-white border border-teal-200 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-all shadow-2xs flex items-center gap-1 shrink-0"
                  >
                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copied ? 'Auto Filled!' : 'Auto Fill ⚡'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-teal-200/60">
                  <div className="bg-white p-2 rounded-lg border border-teal-200/60 min-w-0">
                    <p className="text-[9px] font-700 text-slate-400 uppercase tracking-wider">Username</p>
                    <p className="font-800 text-teal-900 font-mono text-[11px] select-all truncate mt-0.5">admin@acservice.com</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-teal-200/60 min-w-0">
                    <p className="text-[9px] font-700 text-slate-400 uppercase tracking-wider">Password</p>
                    <p className="font-800 text-teal-900 font-mono text-[11px] select-all truncate mt-0.5">Admin@123456</p>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Banners */}
            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-slide-down shadow-2xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-slide-down shadow-2xs">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {screen === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-800 text-slate-500 uppercase tracking-wider mb-1">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="admin@acservice.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 text-xs transition-all font-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-800 text-slate-500 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setScreen('forgot')}
                      className="text-[10px] font-700 text-teal-700 hover:text-teal-800 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 text-xs transition-all font-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-2.5 px-4 rounded-xl text-xs font-800 text-white bg-teal-800 hover:bg-teal-900 shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <>
                      <span>Sign In to Admin Dashboard</span>
                      <ChevronRight size={15} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. FORGOT PASSWORD FORM */}
            {screen === 'forgot' && (
              <form onSubmit={handleForgot} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-800 text-slate-500 uppercase tracking-wider mb-1">
                    Admin Registered Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="admin@acservice.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 text-xs transition-all font-500"
                    />
                  </div>
                </div>

                <div className="pt-1 space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-800 text-white bg-teal-800 hover:bg-teal-900 shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Verification OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen('login')}
                    className="w-full py-2 px-3 rounded-xl text-xs font-700 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* 3. RESET PASSWORD FORM */}
            {screen === 'reset' && (
              <form onSubmit={handleReset} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-800 text-slate-500 uppercase tracking-wider mb-1">
                    4-Digit Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound size={15} />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      placeholder="0000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 text-sm font-mono tracking-[0.3em] text-center transition-all font-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-800 text-slate-500 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 text-xs transition-all font-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-800 text-slate-500 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 text-xs transition-all font-500"
                    />
                  </div>
                </div>

                <div className="pt-1 space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-800 text-white bg-teal-800 hover:bg-teal-900 shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm New Password'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen('login')}
                    className="w-full py-2 px-3 rounded-xl text-xs font-700 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Cancel
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

'use client';

import { Bell, Search, Settings, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement | null>(null);

  const handleNotifications = () => router.push('/notifications');
  const handleSettings = () => router.push('/settings');
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/login');
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
      <div className="flex items-center justify-between gap-4">

        {/* Page Title */}
        <div className="min-w-0">
          <h1 className="text-xl font-800 text-slate-900 leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Search Bar */}
          <div className={`relative hidden md:flex items-center transition-all duration-300 ${searchFocused ? 'w-72' : 'w-52'}`}>
            <Search
              size={15}
              className="absolute left-3.5 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search anything..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200"
            />
          </div>

          {/* Notification Bell */}
          <button
            onClick={handleNotifications}
            className="relative w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-primary-700 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 shadow-sm"
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-700 rounded-full flex items-center justify-center">
              4
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={handleSettings}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-primary-700 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 shadow-sm"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>

          {/* Admin Avatar */}
          <div ref={profileRef} className="relative">
            <div
              onClick={() => setProfileOpen(prev => !prev)}
              className="flex items-center gap-2 pl-1 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white text-xs font-700 ring-2 ring-primary-100">
                SA
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-700 text-slate-800 leading-tight">Super Admin</p>
                <p className="text-[10px] text-slate-400">Administrator</p>
              </div>
              <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors hidden lg:block" />
            </div>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm font-700 text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

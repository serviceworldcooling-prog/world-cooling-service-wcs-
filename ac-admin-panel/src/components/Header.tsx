'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, Menu, X, Clock 
} from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  isCollapsed?: boolean;
  toggleSidebar?: () => void;
}

export default function Header({ title, subtitle, isCollapsed, toggleSidebar }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'New Booking #BK-9482', time: '5 mins ago', unread: true, type: 'booking' },
    { id: 2, title: 'Complaint resolved by Tech Ramesh', time: '20 mins ago', unread: true, type: 'complaint' },
    { id: 3, title: 'AMC Plan renewal notice sent', time: '1 hour ago', unread: false, type: 'amc' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 transition-all shadow-subtle">
      
      {/* Left: Sidebar Toggle & Page Info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 transition-colors shrink-0"
            title="Toggle Sidebar"
          >
            <Menu size={19} />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <h1 className="text-sm xs:text-base sm:text-lg md:text-xl font-800 text-slate-900 tracking-tight leading-none truncate whitespace-nowrap">{title}</h1>
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[9px] sm:text-[10px] font-700 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-500 font-500 mt-0.5 truncate hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Notifications */}
      <div className="flex items-center gap-3">

        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 transition-colors border border-slate-200/60"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          </button>

          {/* Notifications Modal Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 z-50 animate-slide-down">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-800 text-slate-900 uppercase tracking-wider">Notifications</h4>
                  <span className="px-1.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-700">2 New</span>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="divide-y divide-slate-100 my-2 max-h-72 overflow-y-auto">
                {notifications.map((item) => (
                  <div key={item.id} className="py-2.5 px-2 hover:bg-slate-50 rounded-xl transition-colors flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-700 text-slate-800 leading-tight">{item.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
                    </div>
                    {item.unread && <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-1.5" />}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link href="/notifications" onClick={() => setShowNotifications(false)} className="text-xs font-700 text-primary-700 hover:underline">
                  View All Activity Logs →
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

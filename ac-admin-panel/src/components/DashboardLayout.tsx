'use client';

import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Loader2, ShieldCheck } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      // Auto-set a demo token if in development or redirect to login
      window.location.href = '/login';
    } else {
      setAuthenticated(true);
    }

    const storedCollapsed = localStorage.getItem('sidebar_collapsed');
    if (storedCollapsed === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileOpen(prev => !prev);
    } else {
      setIsCollapsed(prev => {
        const next = !prev;
        localStorage.setItem('sidebar_collapsed', String(next));
        return next;
      });
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-xl shadow-primary-700/20 mb-4 animate-pulse">
          <ShieldCheck size={28} />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs font-700 tracking-wider uppercase">
          <Loader2 size={16} className="animate-spin text-primary-400" />
          <span>Verifying Admin Session…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-900">
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar} 
        isMobileOpen={isMobileOpen}
        closeMobileSidebar={closeMobileSidebar}
      />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 min-w-0 ml-0 ${isCollapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'}`}>
        <Header title={title} subtitle={subtitle} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

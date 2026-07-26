'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarCheck, Users, Wrench,
  Settings, Bell, LogOut, Wind, ChevronRight, Zap, ShieldAlert
} from 'lucide-react';
import clsx from 'clsx';

// ─── Only flow-relevant nav items ────────────────────────────────────────────
// Flow: Customer requests → Admin assigns serviceman → Serviceman completes job → Reports to admin
const MAIN_NAV = [
  { label: 'Dashboard',    href: '/dashboard',    icon: LayoutDashboard },
  { label: 'Bookings',     href: '/bookings',     icon: CalendarCheck },
  { label: 'Customers',    href: '/customers',    icon: Users },
  { label: 'Technicians',  href: '/technicians',  icon: Wrench },
];

const MANAGE_NAV = [
  { label: 'Services',      href: '/services',      icon: Wind },
  { label: 'Complaints',    href: '/complaints',    icon: ShieldAlert },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings',      href: '/settings',      icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const renderNavItem = ({ label, href, icon: Icon }: { label: string; href: string; icon: any }) => {
    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    return (
      <Link key={href} href={href}>
        <span className={clsx(
          'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-600 transition-all duration-200 cursor-pointer group',
          active
            ? 'bg-primary-700 text-white shadow-md'
            : 'text-slate-500 hover:text-primary-700 hover:bg-primary-50'
        )}>
          <Icon size={17} className={active ? 'text-white' : 'text-slate-400 group-hover:text-primary-700'} />
          <span className="flex-1">{label}</span>
          {active && <ChevronRight size={14} className="text-white/60" />}
        </span>
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-slate-100 flex flex-col z-40 shadow-[1px_0_20px_rgba(15,23,42,0.04)]">

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center shadow-glow">
          <Zap size={18} className="text-white" fill="white" />
        </div>
        <div>
          <p className="text-sm font-800 text-slate-900 leading-tight">AC Service</p>
          <p className="text-[10px] font-500 text-slate-400 uppercase tracking-widest">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="text-[10px] font-700 uppercase tracking-widest text-slate-400 px-4 mb-3">Main Menu</p>
        {MAIN_NAV.map(renderNavItem)}

        <p className="text-[10px] font-700 uppercase tracking-widest text-slate-400 px-4 mt-5 mb-3">Management</p>
        {MANAGE_NAV.map(renderNavItem)}
      </nav>

      {/* Admin Profile Footer */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div 
          onClick={() => {
            if (confirm('Are you sure you want to log out?')) {
              localStorage.removeItem('admin_token');
              window.location.href = '/login';
            }
          }}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white text-xs font-700 shrink-0">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-700 text-slate-800 truncate">Super Admin</p>
            <p className="text-[11px] text-slate-400 truncate">admin@acservice.com</p>
          </div>
          <LogOut size={15} className="text-slate-400 group-hover:text-red-400 transition-colors shrink-0" />
        </div>
      </div>
    </aside>
  );
}

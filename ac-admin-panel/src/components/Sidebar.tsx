'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarCheck, Users, Wrench,
  Settings, Bell, LogOut, Wind, ChevronRight, ChevronLeft, Tag, ClipboardCheck, CheckSquare,
  ShieldCheck, FileText, Gift, Star, Award, Wallet, BadgeCheck, ShieldAlert, X
} from 'lucide-react';
import clsx from 'clsx';

const MAIN_NAV = [
  { label: 'Dashboard',    href: '/dashboard',    icon: LayoutDashboard },
  { label: 'Bookings',     href: '/bookings',     icon: CalendarCheck, badge: '24' },
  { label: 'Work Reports', href: '/work-reports', icon: ClipboardCheck },
  { label: 'Customers',    href: '/customers',    icon: Users },
  { label: 'Technicians',  href: '/technicians',  icon: Wrench, badge: 'Active' },
];

const OPERATIONS_NAV = [
  { label: 'Services',     href: '/services',     icon: Wind },
  { label: 'AMC Plans',    href: '/amc-plans',    icon: ShieldCheck },
  { label: 'Warranty',     href: '/warranty',     icon: BadgeCheck },
  { label: 'Work Checklist', href: '/work-checklist', icon: CheckSquare },
  { label: 'Complaints',   href: '/complaints',   icon: ShieldAlert, badge: '3', badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-200' },
];

const FINANCE_NAV = [
  { label: 'Wallet',       href: '/wallet',       icon: Wallet },
  { label: 'Offers',       href: '/offers',       icon: Tag },
  { label: 'Referrals',    href: '/referrals',    icon: Gift },
  { label: 'Reviews',      href: '/reviews',      icon: Star },
];

const SYSTEM_NAV = [
  { label: 'Notifications', href: '/notifications', icon: Bell, badge: '5' },
  { label: 'Settings',      href: '/settings',      icon: Settings },
];

interface SidebarProps {
  isCollapsed?: boolean;
  toggleSidebar?: () => void;
  isMobileOpen?: boolean;
  closeMobileSidebar?: () => void;
}

export default function Sidebar({ 
  isCollapsed = false, 
  toggleSidebar, 
  isMobileOpen = false, 
  closeMobileSidebar 
}: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showFullContent = !isCollapsed || isMobile;
  const isCompactDesktop = isCollapsed && !isMobile;

  const renderNavItem = (item: { label: string; href: string; icon: any; badge?: string; badgeColor?: string }) => {
    const Icon = item.icon;
    const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
    
    return (
      <Link 
        key={item.href} 
        href={item.href} 
        onClick={closeMobileSidebar}
        title={isCompactDesktop ? item.label : undefined}
      >
        <div className={clsx(
          'sidebar-link relative group',
          isCompactDesktop ? 'justify-center px-0 py-2.5 my-1' : 'my-0.5',
          active && 'active'
        )}>
          {/* Active Accent Bar indicator */}
          {active && !isCompactDesktop && (
            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-white shadow-sm" />
          )}

          <Icon 
            size={isCompactDesktop ? 20 : 17} 
            className={clsx(
              'shrink-0 transition-transform duration-200 group-hover:scale-110',
              active ? 'text-white' : 'text-slate-400 group-hover:text-primary-700'
            )} 
          />

          {showFullContent && (
            <>
              <span className="flex-1 truncate font-600 text-xs">{item.label}</span>

              {item.badge && (
                <span className={clsx(
                  'text-[10px] font-700 px-2 py-0.5 rounded-full border shrink-0',
                  active
                    ? 'bg-white/20 text-white border-white/30'
                    : item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                )}>
                  {item.badge}
                </span>
              )}

              {active && <ChevronRight size={13} className="text-white/60 shrink-0 ml-1" />}
            </>
          )}
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity animate-fade-in"
        />
      )}

      <aside className={clsx(
        "fixed left-0 top-0 h-screen bg-white border-r border-slate-200/80 flex flex-col z-50 transition-all duration-300 select-none shadow-2xl md:shadow-[4px_0_24px_rgba(15,23,42,0.03)]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isCompactDesktop ? "md:w-[72px]" : "md:w-[260px]",
        "w-[260px]"
      )}>

        {/* Header / Brand Logo */}
        <div className={clsx(
          "flex items-center border-b border-slate-100 shrink-0",
          isCompactDesktop ? "justify-center py-4 px-2" : "justify-between px-5 py-4"
        )}>
          <Link href="/dashboard" onClick={closeMobileSidebar} className="flex items-center gap-3 min-w-0 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary-700 via-primary-600 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-700/25 shrink-0 group-hover:scale-105 transition-transform">
              <Wind size={18} className="text-white" />
            </div>
            {showFullContent && (
              <div className="min-w-0">
                <p className="text-sm font-800 text-slate-900 leading-none truncate tracking-tight">AC Service</p>
                <p className="text-[10px] font-700 text-primary-600 uppercase tracking-widest mt-1 truncate">World Cooling WCS</p>
              </div>
            )}
          </Link>

          <div className="flex items-center gap-1">
            {/* Mobile Close Button */}
            {closeMobileSidebar && (
              <button
                onClick={closeMobileSidebar}
                className="md:hidden w-8 h-8 rounded-xl border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                title="Close Menu"
              >
                <X size={18} />
              </button>
            )}

            {/* Desktop Toggle Button */}
            {toggleSidebar && (
              <button
                onClick={toggleSidebar}
                className="hidden md:flex w-7 h-7 rounded-xl border border-slate-200/80 items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Body */}
        <nav className={clsx(
          "flex-1 overflow-y-auto space-y-4 scrollbar-thin",
          isCompactDesktop ? "px-2 py-4" : "px-3.5 py-4"
        )}>
          {/* Main Section */}
          <div>
            {showFullContent ? (
              <p className="text-[10px] font-800 uppercase tracking-wider text-slate-400 px-3 mb-1.5">Overview</p>
            ) : (
              <div className="my-1 border-t border-slate-100" />
            )}
            <div className="space-y-0.5">{MAIN_NAV.map(renderNavItem)}</div>
          </div>

          {/* Operations Section */}
          <div>
            {showFullContent ? (
              <p className="text-[10px] font-800 uppercase tracking-wider text-slate-400 px-3 mb-1.5">Operations</p>
            ) : (
              <div className="my-1 border-t border-slate-100" />
            )}
            <div className="space-y-0.5">{OPERATIONS_NAV.map(renderNavItem)}</div>
          </div>

          {/* Finance Section */}
          <div>
            {showFullContent ? (
              <p className="text-[10px] font-800 uppercase tracking-wider text-slate-400 px-3 mb-1.5">Finance & Loyalty</p>
            ) : (
              <div className="my-1 border-t border-slate-100" />
            )}
            <div className="space-y-0.5">{FINANCE_NAV.map(renderNavItem)}</div>
          </div>

          {/* System Section */}
          <div>
            {showFullContent ? (
              <p className="text-[10px] font-800 uppercase tracking-wider text-slate-400 px-3 mb-1.5">System Settings</p>
            ) : (
              <div className="my-1 border-t border-slate-100" />
            )}
            <div className="space-y-0.5">{SYSTEM_NAV.map(renderNavItem)}</div>
          </div>
        </nav>

        {/* Admin Profile & Logout Footer */}
        <div className={clsx("border-t border-slate-100 bg-slate-50/50", isCompactDesktop ? "p-2" : "p-3")}>
          <div 
            onClick={() => {
              if (confirm('Are you sure you want to log out of the Admin Panel?')) {
                localStorage.removeItem('admin_token');
                window.location.href = '/login';
              }
            }}
            title={isCompactDesktop ? "Super Admin (Click to Logout)" : undefined}
            className={clsx(
              "flex items-center rounded-2xl border border-slate-200/60 bg-white hover:bg-rose-50/50 hover:border-rose-200 transition-all cursor-pointer group shadow-subtle",
              isCompactDesktop ? "justify-center p-2" : "gap-3 p-2.5"
            )}
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-white text-xs font-800 shadow-sm">
                SA
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            {showFullContent && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-800 text-slate-900 truncate leading-tight group-hover:text-rose-600 transition-colors">Super Admin</p>
                  <p className="text-[10px] font-500 text-slate-400 truncate">admin@acservice.com</p>
                </div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-rose-600 group-hover:bg-rose-100/50 transition-colors">
                  <LogOut size={14} />
                </div>
              </>
            )}
          </div>
        </div>

      </aside>
    </>
  );
}

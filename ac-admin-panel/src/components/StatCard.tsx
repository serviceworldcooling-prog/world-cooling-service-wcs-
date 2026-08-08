'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  growth?: number;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  prefix?: string;
  suffix?: string;
}

export default function StatCard({
  title, value, subtitle, growth, icon, 
  iconBg = 'bg-primary-50 text-primary-700 border-primary-200/50',
  prefix = '', suffix = '',
}: StatCardProps) {
  const isPositive = (growth ?? 0) >= 0;

  return (
    <div className="stat-card group">
      {/* Background Subtle Gradient Radial Orb */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-transparent rounded-full blur-2xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-60" />

      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={clsx(
          'w-11 h-11 rounded-2xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-sm',
          iconBg
        )}>
          {icon}
        </div>

        {growth !== undefined && (
          <div className={clsx(
            'flex items-center gap-1 text-[11px] font-700 px-2.5 py-1 rounded-full border shadow-2xs',
            isPositive 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
              : 'bg-rose-50 text-rose-700 border-rose-200/60'
          )}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{isPositive ? '+' : ''}{growth}%</span>
          </div>
        )}
      </div>

      <div className="relative z-10 min-w-0">
        <p className="text-[10px] sm:text-xs font-700 text-slate-500 uppercase tracking-wider mb-1 truncate whitespace-nowrap">{title}</p>
        <div className="flex items-baseline gap-1 min-w-0 truncate">
          {prefix && <span className="text-base sm:text-lg font-700 text-slate-400 shrink-0">{prefix}</span>}
          <p className="text-xl sm:text-2xl lg:text-3xl font-800 text-slate-900 tracking-tight leading-none truncate whitespace-nowrap">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {suffix && <span className="text-xs font-600 text-slate-500 ml-0.5 shrink-0">{suffix}</span>}
        </div>
        {subtitle && (
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 font-500 truncate whitespace-nowrap">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

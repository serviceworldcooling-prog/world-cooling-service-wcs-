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
  trend?: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
}

export default function StatCard({
  title, value, subtitle, growth, icon, iconBg = 'bg-primary-50',
  prefix = '', suffix = '',
}: StatCardProps) {
  const isPositive = (growth ?? 0) >= 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110', iconBg)}>
          {icon}
        </div>
        {growth !== undefined && (
          <div className={clsx(
            'flex items-center gap-1 text-xs font-700 px-2 py-1 rounded-lg',
            isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          )}>
            {isPositive
              ? <TrendingUp size={11} />
              : <TrendingDown size={11} />
            }
            {Math.abs(growth)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-600 text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-800 text-slate-900 leading-none">
          {prefix}<span>{typeof value === 'number' ? value.toLocaleString() : value}</span>{suffix}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

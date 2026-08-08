import clsx from 'clsx';

type BadgeVariant =
  | 'upcoming' | 'completed' | 'cancelled' | 'inprogress'
  | 'active' | 'inactive' | 'pending' | 'expired'
  | 'available' | 'onjob' | 'offduty'
  | 'success' | 'warning' | 'error' | 'info'
  | 'sent' | 'scheduled' | 'draft'
  | 'credit' | 'debit' | 'refund';

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  upcoming:    'bg-teal-50 text-teal-700 border-teal-200/70',
  completed:   'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  cancelled:   'bg-rose-50 text-rose-700 border-rose-200/70',
  inprogress:  'bg-sky-50 text-sky-700 border-sky-200/70',
  active:      'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  inactive:    'bg-slate-100 text-slate-600 border-slate-200',
  pending:     'bg-amber-50 text-amber-700 border-amber-200/70',
  expired:     'bg-slate-100 text-slate-600 border-slate-200',
  available:   'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  onjob:       'bg-sky-50 text-sky-700 border-sky-200/70',
  offduty:     'bg-slate-100 text-slate-600 border-slate-200',
  success:     'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  warning:     'bg-amber-50 text-amber-700 border-amber-200/70',
  error:       'bg-rose-50 text-rose-700 border-rose-200/70',
  info:        'bg-sky-50 text-sky-700 border-sky-200/70',
  sent:        'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  scheduled:   'bg-amber-50 text-amber-700 border-amber-200/70',
  draft:       'bg-slate-100 text-slate-600 border-slate-200',
  credit:      'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  debit:       'bg-rose-50 text-rose-700 border-rose-200/70',
  refund:      'bg-sky-50 text-sky-700 border-sky-200/70',
};

const DOT_COLORS: Record<BadgeVariant, string> = {
  upcoming:   'bg-teal-500',
  completed:  'bg-emerald-500',
  cancelled:  'bg-rose-500',
  inprogress: 'bg-sky-500 animate-pulse',
  active:     'bg-emerald-500',
  inactive:   'bg-slate-400',
  pending:    'bg-amber-500',
  expired:    'bg-slate-400',
  available:  'bg-emerald-500',
  onjob:      'bg-sky-500 animate-pulse',
  offduty:    'bg-slate-400',
  success:    'bg-emerald-500',
  warning:    'bg-amber-500',
  error:      'bg-rose-500',
  info:       'bg-sky-500',
  sent:       'bg-emerald-500',
  scheduled:  'bg-amber-500',
  draft:      'bg-slate-400',
  credit:     'bg-emerald-500',
  debit:      'bg-rose-500',
  refund:     'bg-sky-500',
};

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  dot?: boolean;
  className?: string;
}

export default function Badge({ variant, label, dot = true, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-700 border shadow-2xs select-none',
      VARIANT_STYLES[variant] || VARIANT_STYLES.inactive,
      className
    )}>
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', DOT_COLORS[variant] || 'bg-slate-400')} />
      )}
      {label}
    </span>
  );
}

export function bookingStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'Upcoming':    return 'upcoming';
    case 'Completed':   return 'completed';
    case 'Cancelled':   return 'cancelled';
    case 'In Progress': return 'inprogress';
    default:            return 'pending';
  }
}

export function techStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'Available': return 'available';
    case 'On Job':    return 'onjob';
    case 'Off Duty':  return 'offduty';
    default:          return 'inactive';
  }
}

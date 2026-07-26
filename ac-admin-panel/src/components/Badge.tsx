import clsx from 'clsx';

type BadgeVariant =
  | 'upcoming' | 'completed' | 'cancelled' | 'inprogress'
  | 'active' | 'inactive' | 'pending' | 'expired'
  | 'available' | 'onjob' | 'offduty'
  | 'success' | 'warning' | 'error' | 'info'
  | 'sent' | 'scheduled' | 'draft'
  | 'credit' | 'debit' | 'refund';

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  upcoming:    'bg-teal-50   text-teal-700   border-teal-100',
  completed:   'bg-green-50  text-green-700  border-green-100',
  cancelled:   'bg-red-50    text-red-600    border-red-100',
  inprogress:  'bg-blue-50   text-blue-600   border-blue-100',
  active:      'bg-emerald-50 text-emerald-700 border-emerald-100',
  inactive:    'bg-slate-100 text-slate-500  border-slate-200',
  pending:     'bg-amber-50  text-amber-700  border-amber-100',
  expired:     'bg-slate-100 text-slate-500  border-slate-200',
  available:   'bg-emerald-50 text-emerald-700 border-emerald-100',
  onjob:       'bg-blue-50   text-blue-600   border-blue-100',
  offduty:     'bg-slate-100 text-slate-500  border-slate-200',
  success:     'bg-green-50  text-green-700  border-green-100',
  warning:     'bg-amber-50  text-amber-700  border-amber-100',
  error:       'bg-red-50    text-red-600    border-red-100',
  info:        'bg-blue-50   text-blue-600   border-blue-100',
  sent:        'bg-green-50  text-green-700  border-green-100',
  scheduled:   'bg-amber-50  text-amber-700  border-amber-100',
  draft:       'bg-slate-100 text-slate-500  border-slate-200',
  credit:      'bg-emerald-50 text-emerald-700 border-emerald-100',
  debit:       'bg-red-50    text-red-600    border-red-100',
  refund:      'bg-blue-50   text-blue-600   border-blue-100',
};

const DOT_COLORS: Record<BadgeVariant, string> = {
  upcoming:   'bg-teal-500',
  completed:  'bg-green-500',
  cancelled:  'bg-red-500',
  inprogress: 'bg-blue-500',
  active:     'bg-emerald-500',
  inactive:   'bg-slate-400',
  pending:    'bg-amber-500',
  expired:    'bg-slate-400',
  available:  'bg-emerald-500',
  onjob:      'bg-blue-500',
  offduty:    'bg-slate-400',
  success:    'bg-green-500',
  warning:    'bg-amber-500',
  error:      'bg-red-500',
  info:       'bg-blue-500',
  sent:       'bg-green-500',
  scheduled:  'bg-amber-500',
  draft:      'bg-slate-400',
  credit:     'bg-emerald-500',
  debit:      'bg-red-500',
  refund:     'bg-blue-500',
};

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  dot?: boolean;
  className?: string;
}

export default function Badge({ variant, label, dot = false, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-700 border',
      VARIANT_STYLES[variant],
      className
    )}>
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', DOT_COLORS[variant])} />
      )}
      {label}
    </span>
  );
}

// Helper to get booking status badge variant
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

'use client';

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ─── Revenue Area Chart ────────────────────────────────────────────────────
interface RevenueChartProps {
  data: { month: string; revenue: number; bookings: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#0F766E" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#F97316" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 20px rgba(15,23,42,0.08)' }}
          formatter={(value: number, name: string) => [
            name === 'revenue' ? `₹${value.toLocaleString()}` : value,
            name === 'revenue' ? 'Revenue' : 'Bookings'
          ]}
        />
        <Area type="monotone" dataKey="revenue" stroke="#0F766E" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} />
        <Area type="monotone" dataKey="bookings" stroke="#F97316" strokeWidth={2} fill="url(#bookingsGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Weekly Bookings Bar Chart ─────────────────────────────────────────────
interface WeeklyChartProps {
  data: { day: string; bookings: number }[];
}

export function WeeklyBookingsChart({ data }: WeeklyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '12px' }}
          cursor={{ fill: '#F8FAFC' }}
        />
        <Bar dataKey="bookings" fill="#0F766E" radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Service Distribution Donut Chart ─────────────────────────────────────
interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
}

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.06) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function ServiceDonutChart({ data }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={renderLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '12px' }}
          formatter={(value: number, name: string) => [`${value}%`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

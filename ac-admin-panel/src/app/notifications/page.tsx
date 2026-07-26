'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import { MOCK_NOTIFICATIONS, Notification } from '@/lib/mockData';
import {
  Bell, Plus, Send, Pencil, Trash2, Eye,
  Users, Wrench, Megaphone, AlertTriangle,
  CreditCard, CheckCircle2, Clock, FileText
} from 'lucide-react';

const TYPE_ICON: Record<string, React.ReactNode> = {
  booking:   <Bell size={16} className="text-blue-600" />,
  offer:     <Megaphone size={16} className="text-orange-500" />,
  payment:   <CreditCard size={16} className="text-emerald-600" />,
  system:    <AlertTriangle size={16} className="text-amber-600" />,
  emergency: <AlertTriangle size={16} className="text-red-500" />,
};

const TYPE_BG: Record<string, string> = {
  booking:   'bg-blue-50',
  offer:     'bg-orange-50',
  payment:   'bg-emerald-50',
  system:    'bg-amber-50',
  emergency: 'bg-red-50',
};

const AUDIENCE_OPTIONS = [
  { value: 'all',         label: 'All Users' },
  { value: 'customers',   label: 'Customers Only' },
  { value: 'technicians', label: 'Technicians Only' },
];

export default function NotificationsPage() {
  const [composeOpen, setComposeOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Notification | null>(null);

  const sent      = MOCK_NOTIFICATIONS.filter(n => n.status === 'sent').length;
  const scheduled = MOCK_NOTIFICATIONS.filter(n => n.status === 'scheduled').length;
  const drafts    = MOCK_NOTIFICATIONS.filter(n => n.status === 'draft').length;
  const totalSent = MOCK_NOTIFICATIONS.filter(n => n.status === 'sent').reduce((s, n) => s + n.sentCount, 0);

  return (
    <DashboardLayout title="Notifications" subtitle="Send and manage push notifications to users">

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Sent',  value: totalSent.toLocaleString(), color: 'text-primary-700', bg: 'bg-primary-50' },
          { label: 'Campaigns',   value: sent,                        color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Scheduled',   value: scheduled,                   color: 'text-amber-600',   bg: 'bg-amber-50' },
          { label: 'Drafts',      value: drafts,                      color: 'text-slate-500',   bg: 'bg-slate-100' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card">
            <p className="text-xs font-600 text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-800 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Compose Button ── */}
      <div className="flex justify-end mb-5">
        <button className="btn-primary" onClick={() => setComposeOpen(true)}>
          <Plus size={15} /> Compose Notification
        </button>
      </div>

      {/* ── Notification List ── */}
      <div className="space-y-3">
        {MOCK_NOTIFICATIONS.map((n) => {
          const readPct = n.sentCount > 0 ? Math.round((n.readCount / n.sentCount) * 100) : 0;
          return (
            <div key={n.id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-start gap-4">
                {/* Type Icon */}
                <div className={`w-10 h-10 rounded-xl ${TYPE_BG[n.type]} flex items-center justify-center shrink-0`}>
                  {TYPE_ICON[n.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-sm font-800 text-slate-900">{n.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={n.status === 'sent' ? 'sent' : n.status === 'scheduled' ? 'scheduled' : 'draft'}
                        label={n.status.charAt(0).toUpperCase() + n.status.slice(1)}
                        dot
                      />
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mb-3 leading-relaxed">{n.body}</p>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Users size={11} />
                      <span className="capitalize">{n.targetAudience}</span>
                    </div>
                    {n.sentAt && (
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>{n.sentAt}</span>
                      </div>
                    )}
                    {n.sentCount > 0 && (
                      <>
                        <span>{n.sentCount.toLocaleString()} sent</span>
                        <span>{n.readCount.toLocaleString()} read</span>
                      </>
                    )}
                  </div>

                  {/* Read rate bar */}
                  {n.sentCount > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Open Rate</span>
                        <span className="font-700 text-slate-600">{readPct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${readPct}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => { setSelected(n); setViewOpen(true); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-all"
                  >
                    <Eye size={14} />
                  </button>
                  {n.status === 'draft' && (
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                      <Send size={14} />
                    </button>
                  )}
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all">
                    <Pencil size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Compose Modal ── */}
      <Modal isOpen={composeOpen} onClose={() => setComposeOpen(false)} title="Compose Notification" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-700 text-slate-500 uppercase tracking-wider block mb-1.5">Title</label>
            <input type="text" placeholder="Notification title" className="input-field" />
          </div>
          <div>
            <label className="text-xs font-700 text-slate-500 uppercase tracking-wider block mb-1.5">Message Body</label>
            <textarea rows={4} placeholder="Write your message here…" className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-700 text-slate-500 uppercase tracking-wider block mb-1.5">Type</label>
              <select className="input-field">
                {['booking', 'offer', 'payment', 'system', 'emergency'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-700 text-slate-500 uppercase tracking-wider block mb-1.5">Audience</label>
              <select className="input-field">
                {AUDIENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-700 text-slate-500 uppercase tracking-wider block mb-1.5">Schedule (optional)</label>
            <input type="datetime-local" className="input-field" />
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1 justify-center">
              <Send size={14} /> Send Now
            </button>
            <button className="btn-secondary flex-1 justify-center">
              <Clock size={14} /> Schedule
            </button>
            <button className="btn-secondary justify-center px-4">
              <FileText size={14} /> Draft
            </button>
          </div>
        </div>
      </Modal>

      {/* ── View Modal ── */}
      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title="Notification Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className={`flex items-start gap-3 p-4 rounded-xl ${TYPE_BG[selected.type]}`}>
              <div>{TYPE_ICON[selected.type]}</div>
              <div>
                <p className="text-sm font-800 text-slate-900">{selected.title}</p>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{selected.body}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Status',    value: selected.status },
                { label: 'Audience',  value: selected.targetAudience },
                { label: 'Sent At',   value: selected.sentAt || '—' },
                { label: 'Sent Count', value: selected.sentCount.toLocaleString() },
                { label: 'Read Count', value: selected.readCount.toLocaleString() },
                { label: 'Open Rate',  value: selected.sentCount > 0 ? `${Math.round((selected.readCount / selected.sentCount) * 100)}%` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-700 text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-700 text-slate-800 mt-0.5 capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

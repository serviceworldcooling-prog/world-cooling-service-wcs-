'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { getWorkReports, approveWorkReport } from '@/lib/api';
import {
  ClipboardList, CheckCircle2, Clock, Eye, XCircle, RefreshCw,
  User, Phone, MapPin, Loader2, Calendar, ShieldCheck,
  PlayCircle, Image as ImageIcon
} from 'lucide-react';


const getAvatarUrl = (path: string | undefined | null) => {
  if (!path || typeof path !== 'string' || path.trim() === '') return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:image')) return path;
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
};

function ReportAvatar({
  name,
  avatar,
  type = 'customer',
  size = 'md',
  className = '',
}: {
  name?: string;
  avatar?: string | null;
  type?: 'customer' | 'technician';
  size?: 'md' | 'lg';
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const cleanName = name || (type === 'customer' ? 'Customer' : 'Technician');
  const initial = (cleanName.trim()?.[0] || (type === 'customer' ? 'C' : 'T')).toUpperCase();
  const avatarUrl = getAvatarUrl(avatar);

  const isDummyPic = !avatarUrl ||
    avatarUrl.includes('unsplash.com') ||
    avatarUrl.includes('placeholder') ||
    avatarUrl.includes('dummy');

  if (!isDummyPic && !imgError) {
    const sizeClasses = size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
    const ringClasses = type === 'customer' ? 'ring-2 ring-primary-500/40' : 'ring-2 ring-teal-500/40';
    return (
      <img
        src={avatarUrl!}
        alt={cleanName}
        onError={() => setImgError(true)}
        className={`${sizeClasses} rounded-full object-cover shrink-0 ${ringClasses} ${className}`}
      />
    );
  }

  if (size === 'lg') {
    const bgClasses = type === 'customer' ? 'bg-primary-100 text-primary-700' : 'bg-teal-100 text-teal-700';
    return (
      <div className={`w-12 h-12 rounded-full ${bgClasses} flex items-center justify-center font-800 text-lg shrink-0 ${className}`}>
        {initial}
      </div>
    );
  }

  const bgClasses = type === 'customer' ? 'bg-primary-100 text-primary-700' : 'bg-teal-100 text-teal-700';
  return (
    <div className={`w-9 h-9 rounded-full ${bgClasses} flex items-center justify-center font-800 text-xs shrink-0 ${className}`}>
      {initial}
    </div>
  );
}

const extractBookingId = (r: any) => {
  if (!r) return '—';
  const b = r.bookingId;
  if (b && typeof b === 'object' && b.bookingId) return b.bookingId;
  if (typeof b === 'string' && b.startsWith('BKG-')) return b;
  if (r.bookingNo) return r.bookingNo;
  if (r.bookingCode) return r.bookingCode;
  return (r._id || '').slice(-6).toUpperCase() || '—';
};

const PAGE_SIZE = 10;

const REVIEW_OPTIONS = [
  { value: '', label: 'All Reports' },
  { value: 'false', label: 'Pending Review' },
  { value: 'true', label: 'Reviewed & Approved' },
];

export default function WorkReportsPage() {
  const { success, error: toastError, info } = useToast();

  const [reports, setReports] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [reviewFilter, setReviewFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [selected, setSelected] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: PAGE_SIZE, _t: Date.now() };
      if (reviewFilter) {
        params.adminReviewed = reviewFilter;
      }
      const res: any = await getWorkReports(params);
      setReports(res?.reports ?? res?.data?.reports ?? []);
      setTotal(res?.total ?? res?.data?.total ?? 0);
    } catch (e: any) {
      setReports([]);
      toastError('Failed to load work reports', e?.message);
    } finally {
      setLoading(false);
    }
  }, [page, reviewFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
    info('Refreshed', 'Work reports list is up to date');
  };

  const handleApprove = async (reportId: string) => {
    setActionLoading(true);
    try {
      await approveWorkReport(reportId);
      success('Report Approved', 'Work report approved and booking marked completed.');
      setModalOpen(false);
      setSelected(null);
      loadReports();
    } catch (e: any) {
      toastError('Approval Failed', e?.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openView = (report: any) => {
    setSelected(report);
    setModalOpen(true);
  };

  const fmtDate = (d: any) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(d);
    }
  };

  return (
    <DashboardLayout
      title="Work Reports"
      subtitle="Review work reports submitted by technicians, inspect photos/videos, and approve them to complete bookings"
    >
      {/* ── Reports Overview Card (Touched Left & Right on Mobile) ────────────────── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden mb-6">
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-700 text-slate-800 flex items-center gap-2">
              Reports Overview
              <span className="text-xs font-600 text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{total}</span>
            </h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1.5 text-slate-400 hover:text-primary-700 rounded-lg hover:bg-slate-50 transition-colors"
              title="Refresh Reports"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={reviewFilter}
              onChange={(e) => { setReviewFilter(e.target.value); setPage(1); }}
              className="w-full sm:w-[220px] rounded-xl border border-slate-200 px-3 py-2 text-xs font-600 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-subtle"
            >
              {REVIEW_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Desktop Table (Hidden on Mobile) ──────────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Booking ID', 'Customer', 'Technician', 'Work Done', 'Submitted', 'Photos/Video', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] font-700 text-slate-500 uppercase tracking-wider text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto animate-spin text-slate-300" size={32} />
                    <p className="text-xs text-slate-400 mt-3">Loading reports…</p>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <ClipboardList size={36} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-sm font-700 text-slate-400">No work reports found</p>
                    <p className="text-xs text-slate-300 mt-1">Submit or verify OTPs to see reports here</p>
                  </td>
                </tr>
              ) : reports.map((r, i) => {
                const booking = (r.bookingId && typeof r.bookingId === 'object') ? r.bookingId : {};
                const customer = (r.customerId && typeof r.customerId === 'object') ? r.customerId : (booking?.customerId || {});
                const tech = (r.technicianId && typeof r.technicianId === 'object') ? r.technicianId : (booking?.technicianId || {});

                return (
                  <tr
                    key={r._id}
                    className={`hover:bg-slate-50/80 transition-colors ${i % 2 !== 0 ? 'bg-slate-50/30' : ''}`}
                  >
                    {/* Booking ID */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-800 text-primary-700 bg-primary-50 border border-primary-200 px-2.5 py-1 rounded-lg shadow-sm">
                        #{extractBookingId(r)}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ReportAvatar name={customer.name} avatar={customer.avatar || booking?.customerAvatar} type="customer" size="md" />
                        <div>
                          <p className="text-sm font-800 text-slate-800 leading-tight">{customer.name || '—'}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{customer.phone || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Technician */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ReportAvatar name={tech.name} avatar={tech.avatar || tech.techAvatar || booking?.techAvatar} type="technician" size="md" />
                        <div>
                          <p className="text-sm font-800 text-slate-800 leading-tight">{tech.name || '—'}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{tech.specialty || tech.phone || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Work Done */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-600 text-slate-700 max-w-[180px] truncate">{r.workDone}</p>
                    </td>

                    {/* Submitted At */}
                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-500 font-600">{fmtDate(r.submittedAt || r.createdAt)}</p>
                    </td>

                    {/* Media Badge */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {r.photos?.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-700 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                            <ImageIcon size={10} /> {r.photos.length}
                          </span>
                        )}
                        {r.video && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-700 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                            <PlayCircle size={10} /> Video
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {r.adminReviewed ? (
                        <Badge variant="success" label="Approved" dot />
                      ) : (
                        <Badge variant="warning" label="Pending Review" dot />
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openView(r)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-all"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card List (Visible on Mobile < md screens) ────────────────── */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="px-4 py-16 text-center">
              <Loader2 className="mx-auto animate-spin text-slate-300" size={28} />
              <p className="text-xs text-slate-400 mt-2">Loading reports…</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <ClipboardList size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-sm font-700 text-slate-400">No work reports found</p>
              <p className="text-xs text-slate-300 mt-1">Submit or verify OTPs to see reports here</p>
            </div>
          ) : (
            reports.map((r) => {
              const booking = (r.bookingId && typeof r.bookingId === 'object') ? r.bookingId : {};
              const customer = (r.customerId && typeof r.customerId === 'object') ? r.customerId : (booking?.customerId || {});
              const tech = (r.technicianId && typeof r.technicianId === 'object') ? r.technicianId : (booking?.technicianId || {});

              return (
                <div key={r._id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  {/* Header: Booking ID + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-800 text-primary-700 bg-primary-50 border border-primary-200 px-2.5 py-0.5 rounded-lg">
                      #{extractBookingId(r)}
                    </span>
                    {r.adminReviewed ? (
                      <Badge variant="success" label="Approved" dot />
                    ) : (
                      <Badge variant="warning" label="Pending Review" dot />
                    )}
                  </div>

                  {/* Customer & Tech Info Row */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <ReportAvatar name={customer.name} avatar={customer.avatar || booking?.customerAvatar} type="customer" size="md" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-700 text-slate-400 uppercase">Customer</p>
                        <p className="text-xs font-800 text-slate-800 truncate">{customer.name || '—'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <ReportAvatar name={tech.name} avatar={tech.avatar || tech.techAvatar || booking?.techAvatar} type="technician" size="md" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-700 text-slate-400 uppercase">Technician</p>
                        <p className="text-xs font-800 text-slate-800 truncate">{tech.name || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Work Done Preview */}
                  {r.workDone && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-700 text-slate-400 uppercase">Work Done</p>
                      <p className="text-xs text-slate-700 font-500 line-clamp-2 mt-0.5">{r.workDone}</p>
                    </div>
                  )}

                  {/* Footer: Date + Media Badges + Action Button */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-500">{fmtDate(r.submittedAt || r.createdAt)}</span>
                      {r.photos?.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-700 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          <ImageIcon size={10} /> {r.photos.length}
                        </span>
                      )}
                      {r.video && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-700 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                          <PlayCircle size={10} />
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => openView(r)}
                      className="btn-secondary text-xs py-1 px-3 gap-1 shrink-0"
                    >
                      <Eye size={13} /> View
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              Page <span className="font-700 text-slate-600">{page}</span> of <span className="font-700 text-slate-600">{Math.ceil(total / PAGE_SIZE)}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / PAGE_SIZE)}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Details Modal ───────────────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null); }}
        title={selected ? `Work Report — Booking #${extractBookingId(selected)}` : 'Details'}
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            {/* Header / Meta */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <p className="text-xs font-700 text-slate-400 uppercase tracking-wider">Service Type</p>
                <p className="text-sm font-800 text-slate-800 mt-0.5">{selected.bookingId?.serviceType || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-700 text-slate-400 uppercase tracking-wider">Submitted On</p>
                <p className="text-sm font-700 text-slate-600 mt-0.5">{fmtDate(selected.submittedAt || selected.createdAt)}</p>
              </div>
              <div className="flex items-center">
                {selected.adminReviewed ? (
                  <Badge variant="success" label="Reviewed & Approved" dot />
                ) : (
                  <Badge variant="warning" label="Pending Admin Approval" dot />
                )}
              </div>
            </div>

            {/* Cust / Tech detail Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer */}
              <div className="rounded-2xl border border-slate-100 p-4 space-y-2.5 bg-slate-50/50">
                <p className="text-[11px] font-800 text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={11} /> Customer Info
                </p>
                <div className="flex items-center gap-3">
                  <ReportAvatar name={selected.customerId?.name} avatar={selected.customerId?.avatar || selected.bookingId?.customerAvatar} type="customer" size="lg" />
                  <div>
                    <p className="text-sm font-800 text-slate-900">{selected.customerId?.name || '—'}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Phone size={10} /> {selected.customerId?.phone || '—'}
                    </p>
                    {selected.bookingId?.address && (
                      <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                        <MapPin size={10} className="mt-0.5 shrink-0" />
                        <span>{selected.bookingId.address}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Technician */}
              <div className="rounded-2xl border border-slate-100 p-4 space-y-2.5 bg-slate-50/50">
                <p className="text-[11px] font-800 text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={11} /> Technician Info
                </p>
                <div className="flex items-center gap-3">
                  <ReportAvatar name={selected.technicianId?.name} avatar={selected.technicianId?.avatar || selected.technicianId?.techAvatar || selected.bookingId?.techAvatar} type="technician" size="lg" />
                  <div>
                    <p className="text-sm font-800 text-slate-900">{selected.technicianId?.name || '—'}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Phone size={10} /> {selected.technicianId?.phone || '—'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Specialty: {selected.technicianId?.specialty || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Details */}
            <div className="space-y-4 rounded-2xl border border-slate-100 p-4">
              <div>
                <p className="text-xs font-700 text-slate-400 uppercase tracking-wider mb-1">Work Checklist Done</p>
                {selected.selectedWorks?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selected.selectedWorks.map((w: string, idx: number) => (
                      <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-600">{w}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No checklist options selected</p>
                )}
              </div>

              <div>
                <p className="text-xs font-700 text-slate-400 uppercase tracking-wider mb-1">Additional description</p>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{selected.workDone || '—'}</p>
              </div>

              {selected.techNote && (
                <div>
                  <p className="text-xs font-700 text-slate-400 uppercase tracking-wider mb-1">Technician Note</p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">{selected.techNote}</p>
                </div>
              )}
            </div>

            {/* Photos */}
            {selected.photos?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-700 text-slate-400 uppercase tracking-wider">Job Photos ({selected.photos.length})</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selected.photos.map((url: string, i: number) => (
                    <div 
                      key={i} 
                      onClick={() => setZoomImage({ url, title: `Job Photo #${i + 1}` })}
                      className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group cursor-pointer"
                    >
                      <img src={url} alt={`Job photo ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-700">
                        Zoom Photo
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {selected.video && (
              <div className="space-y-2">
                <p className="text-xs font-700 text-slate-400 uppercase tracking-wider">Job Video</p>
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video max-w-md">
                  <video src={selected.video} controls className="w-full h-full" />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => { setModalOpen(false); setSelected(null); }}
                className="btn-secondary text-xs"
              >
                Close Details
              </button>
              {!selected.adminReviewed && (
                <button
                  onClick={() => handleApprove(selected._id)}
                  disabled={actionLoading}
                  className="btn-primary text-xs flex items-center gap-1.5 bg-emerald-600 border-emerald-600 hover:bg-emerald-700"
                >
                  {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                  Approve & Complete Booking
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    
      {/* ── Image Zoom Lightbox Modal ── */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoomImage(null)}
        >
          <div 
            className="relative max-w-lg w-full bg-slate-900 border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-800 text-white tracking-tight">{zoomImage.title}</h3>
              <button
                onClick={() => setZoomImage(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/50 p-2">
              <img
                src={zoomImage.url}
                alt={zoomImage.title}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

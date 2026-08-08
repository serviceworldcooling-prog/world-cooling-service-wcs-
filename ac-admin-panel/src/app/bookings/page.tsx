'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Badge, { bookingStatusVariant } from '@/components/Badge';
import SearchFilter from '@/components/SearchFilter';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import {
  getBookings, getBookingById, assignTechnician,
  updateBookingStatus, deleteBooking, getTechnicians,
} from '@/lib/api';
import {
  CalendarCheck, CheckCircle2, Clock, XCircle, Loader2,
  UserCheck, Navigation, Trash2, Eye, RefreshCw,
  AlertTriangle, Phone, Mail, MapPin, CreditCard,
  ClipboardList, Wrench, Star, ChevronLeft, ChevronRight,
  Calendar, Timer, Tag, User, CheckSquare, Ban,
  ArrowUpRight, ExternalLink, CircleDot,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'Pending',     label: 'Pending' },
  { value: 'Upcoming',    label: 'Upcoming' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed',   label: 'Completed' },
  { value: 'Cancelled',   label: 'Cancelled' },
];

const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Safely extract customer name + phone from any booking shape the API returns.
 *
 *  Possible shapes from the backend:
 *  1. customerId = populated object  { _id, name, phone, email, avatar }  ← getBookingById (new bookings)
 *  2. customer   = populated object  { _id, name, phone, ... }            ← getAllBookings alias
 *  3. customer   = raw ObjectId string                                     ← legacy bookings (backend resolves in getBookingById)
 *  4. Flat fields: customerName, customerPhone                             ← admin-created bookings
 */
const extractCustomer = (b: any): { name: string; phone: string; email: string; avatar: string } => {
  // Helper: is this a real populated object with actual user data?
  const isPopulated = (v: any) =>
    v && typeof v === 'object' && !Array.isArray(v) && (v.name || v.phone || v.email);

  // Priority 1 — customerId populated object (getBookingById, new bookings)
  if (isPopulated(b?.customerId)) {
    return {
      name:   b.customerId.name   || '—',
      phone:  b.customerId.phone  || '—',
      email:  b.customerId.email  || '—',
      avatar: b.customerId.avatar || b.customerId.profilePic || b.customerId.photo || b.customerId.image || '',
    };
  }

  // Priority 2 — customer alias as populated object (getAllBookings)
  if (isPopulated(b?.customer)) {
    return {
      name:   b.customer.name   || '—',
      phone:  b.customer.phone  || '—',
      email:  b.customer.email  || '—',
      avatar: b.customer.avatar || b.customer.profilePic || b.customer.photo || b.customer.image || '',
    };
  }

  // Priority 3 — flat fields on the booking doc (admin-created)
  if (b?.customerName || b?.customerPhone) {
    return {
      name:   b.customerName  || '—',
      phone:  b.customerPhone || '—',
      email:  '—',
      avatar: b.customerAvatar || b.customerProfilePic || b.customerPhoto || '',
    };
  }

  // Nothing resolvable
  return { name: '—', phone: '—', email: '—', avatar: '' };
};

const extractTech = (b: any) => {
  const t = (b?.technicianId && typeof b.technicianId === 'object') ? b.technicianId : null;
  return t ? { name: t.name || '—', specialty: t.specialty || '', phone: t.phone || '', rating: t.rating ?? '—', avatar: t.avatar || t.profilePic || t.photo || t.image || '' } : null;
};

const fmt = (v: any) => (v !== undefined && v !== null && v !== '') ? String(v) : '—';
const fmtMoney = (v: any) => (v !== undefined && v !== null) ? `₹${Number(v).toLocaleString('en-IN')}` : '—';
const fmtDate  = (d: any) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return String(d); }
};

// ─── Avatar Component with Initial Fallback ──────────────────────────────────
function AvatarBadge({
  name,
  avatar,
  type = 'customer',
  size = 'sm',
  className = '',
}: {
  name?: string;
  avatar?: string | null;
  type?: 'customer' | 'technician';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const cleanName = name || (type === 'customer' ? 'Customer' : 'Technician');
  const initial = (cleanName.trim()?.[0] || (type === 'customer' ? 'C' : 'T')).toUpperCase();

  const isDummyPic = !avatar ||
    typeof avatar !== 'string' ||
    !avatar.trim() ||
    avatar.includes('unsplash.com') ||
    avatar.includes('placeholder') ||
    avatar.includes('dummy');

  if (!isDummyPic && !imgError) {
    const sizeClasses = size === 'lg'
      ? 'w-11 h-11'
      : size === 'sm'
      ? (type === 'customer' ? 'w-8 h-8' : 'w-7 h-7')
      : 'w-9 h-9';
    return (
      <img
        src={avatar!}
        alt={cleanName}
        onError={() => setImgError(true)}
        className={`${sizeClasses} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  if (size === 'lg') {
    return (
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-800 text-sm shrink-0 ${type === 'customer' ? 'bg-gradient-to-br from-primary-400 to-primary-700 text-white' : 'bg-slate-100 text-slate-700'} ${className}`}>
        {initial !== '—' && initial !== '?' ? initial : <User size={16} />}
      </div>
    );
  }

  const badgeClasses = size === 'sm'
    ? (type === 'customer'
        ? 'w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white text-xs font-800'
        : 'w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-xs font-800')
    : 'w-9 h-9 rounded-full bg-slate-100 text-slate-700 text-xs font-800';

  return (
    <div className={`${badgeClasses} flex items-center justify-center shrink-0 ${className}`}>
      {initial !== '—' && initial !== '?' ? initial : '?'}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const { success, error: toastError, warning, info } = useToast();

  // ── List state
  const [bookings, setBookings] = useState<any[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');         // raw input value — updates on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(''); // fires API only after 450ms pause
  const [statusFilter, setStatus] = useState('');
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Technicians for assign modal
  const [technicians, setTechs] = useState<any[]>([]);

  // ── Modal state
  const [viewOpen,   setViewOpen]   = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [selected,   setSelected]   = useState<any>(null);
  const [workReport, setWorkReport] = useState<any>(null);
  const [assignTechId, setAssignTechId] = useState('');
  const [assignPrice,  setAssignPrice]  = useState('');
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);

  // ── Action loading flags
  const [statusChanging, setStatusChanging] = useState(false);
  const [assigning,      setAssigning]      = useState(false);
  const [deleting,       setDeleting]       = useState(false);

  // ── Derived stats (from current page data — server total is authoritative)
  const stats = {
    total,
    pending:    bookings.filter(b => b.status === 'Pending').length,
    upcoming:   bookings.filter(b => b.status === 'Upcoming').length,
    inProgress: bookings.filter(b => b.status === 'In Progress').length,
    completed:  bookings.filter(b => b.status === 'Completed').length,
    cancelled:  bookings.filter(b => b.status === 'Cancelled').length,
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showPagination = total > PAGE_SIZE;

  // ── Load bookings — triggered only by debouncedSearch, statusFilter, page
  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await getBookings({ search: debouncedSearch, status: statusFilter, page, limit: PAGE_SIZE });
      const data  = res?.data ?? res?.bookings ?? [];
      const count = res?.total ?? res?.pagination?.total ?? data.length;
      setBookings(data);
      setTotal(count);
    } catch (e: any) {
      setBookings([]);
      toastError('Failed to load bookings', e?.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadBookings(); }, [loadBookings]);

  // ── Debounce: sync search input → debouncedSearch after 450ms of no typing
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 450);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  // ── Load technicians once
  useEffect(() => {
    getTechnicians('', '', 1, 100)
      .then((r: any) => setTechs(r?.data ?? r?.technicians ?? []))
      .catch(() => {});
  }, []);

  // ── Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
    info('Refreshed', 'Booking list is up to date');
  };

  // ── Open view modal — always fetch fresh full booking from API
  const openView = async (id: string) => {
    setSelected(null);
    setWorkReport(null);
    setViewOpen(true);
    try {
      const res: any = await getBookingById(id);
      // getBookingById returns { booking, workReport } after interceptor unwrap
      const bk = res?.booking ?? res;
      setSelected(bk);
      setWorkReport(res?.workReport ?? null);
    } catch (e: any) {
      // Fallback to list data so the modal doesn't show blank
      const fallback = bookings.find(b => b._id === id) ?? null;
      setSelected(fallback);
      toastError('Could not load full details', e?.message);
    }
  };

  // ── Open assign modal
  const openAssign = (b: any) => {
    setSelected(b);
    setAssignTechId('');
    setAssignPrice(String(b.finalPrice ?? b.price ?? ''));
    setAssignOpen(true);
  };

  // ── Assign technician
  const handleAssign = async () => {
    if (!selected || !assignTechId) return;
    setAssigning(true);
    try {
      await assignTechnician(selected._id, assignTechId, assignPrice ? Number(assignPrice) : undefined);
      setAssignOpen(false);
      success('Technician Assigned', 'The booking has been updated successfully.');
      loadBookings();
      // If view modal is open for same booking, refresh it
      if (viewOpen && selected._id) openView(selected._id);
    } catch (e: any) {
      toastError('Assignment Failed', e?.message);
    } finally {
      setAssigning(false);
    }
  };

  // ── Update status
  const handleStatusChange = async (id: string, status: string) => {
    setStatusChanging(true);
    try {
      await updateBookingStatus(id, status);
      success(`Status Updated`, `Booking marked as ${status}`);
      loadBookings();
      if (viewOpen && selected?._id === id) {
        // Refresh full booking in modal
        openView(id);
      }
    } catch (e: any) {
      toastError('Status Update Failed', e?.message);
    } finally {
      setStatusChanging(false);
    }
  };

  // ── Delete booking
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteBooking(deleteId);
      success('Booking Deleted', 'The booking has been removed.');
      setDeleteId(null);
      setViewOpen(false);
      loadBookings();
    } catch (e: any) {
      toastError('Delete Failed', e?.message);
    } finally {
      setDeleting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      title="Bookings & Requests"
      subtitle="Manage customer AC service requests — assign technicians and track completion"
    >

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Total',       value: total,              Icon: CalendarCheck,  color: 'text-primary-700',  bg: 'bg-primary-50',  border: 'border-primary-100' },
          { label: 'Pending',     value: stats.pending,      Icon: Clock,          color: 'text-amber-600',    bg: 'bg-amber-50',    border: 'border-amber-100' },
          { label: 'Upcoming',    value: stats.upcoming,     Icon: ArrowUpRight,   color: 'text-teal-600',     bg: 'bg-teal-50',     border: 'border-teal-100' },
          { label: 'In Progress', value: stats.inProgress,   Icon: CircleDot,      color: 'text-blue-600',     bg: 'bg-blue-50',     border: 'border-blue-100' },
          { label: 'Completed',   value: stats.completed,    Icon: CheckCircle2,   color: 'text-emerald-600',  bg: 'bg-emerald-50',  border: 'border-emerald-100' },
          { label: 'Cancelled',   value: stats.cancelled,    Icon: XCircle,        color: 'text-red-500',      bg: 'bg-red-50',      border: 'border-red-100' },
        ].map(({ label, value, Icon, color, bg, border }) => (
          <div key={label} className={`bg-white rounded-2xl p-3 sm:p-4 border ${border} shadow-sm hover:shadow-md transition-shadow flex items-center gap-2.5 sm:gap-3 min-w-0`}>
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={`${color} shrink-0`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-600 text-slate-400 uppercase tracking-wide truncate">{label}</p>
              <p className="text-lg sm:text-2xl font-800 text-slate-900 leading-tight truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Card (Touched Left & Right on Mobile) ────────────────────── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden">

        {/* Toolbar */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-700 text-slate-800 flex items-center gap-2">
              All Bookings
              <span className="text-xs font-600 text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{total}</span>
            </h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary py-1.5 px-3 text-xs gap-1.5 shrink-0"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
          <SearchFilter
            searchValue={search}
            onSearch={v => setSearch(v)}
            placeholder="Search customer, technician, booking ID, service…"
            filterOptions={STATUS_OPTIONS}
            filterValue={statusFilter}
            onFilter={v => { setStatus(v); setPage(1); }}
            filterLabel="Status"
          />
        </div>

        {/* Desktop Table (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Booking ID', 'Customer', 'Service', 'Scheduled', 'Technician', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] font-700 text-slate-500 uppercase tracking-wider text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-20 text-center">
                    <Loader2 className="mx-auto animate-spin text-slate-300" size={32} />
                    <p className="text-xs text-slate-400 mt-3">Loading bookings…</p>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-20 text-center">
                    <CalendarCheck size={36} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-sm font-700 text-slate-400">No bookings found</p>
                    <p className="text-xs text-slate-300 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : bookings.map((b, i) => {
                const cust = extractCustomer(b);
                const tech = extractTech(b);
                return (
                  <tr
                    key={b._id}
                    className={`hover:bg-slate-50/80 transition-colors ${i % 2 !== 0 ? 'bg-slate-50/30' : ''}`}
                  >
                    {/* Booking ID */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="text-xs font-700 text-primary-700 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-lg">
                          {b.bookingId ?? '—'}
                        </span>
                        {b.isEmergency && (
                          <span className="text-[9px] font-900 text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 uppercase tracking-wider animate-pulse">
                            🚨 Emergency
                          </span>
                        )}
                      </div>
                    </td>
                      {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <AvatarBadge name={cust.name} avatar={cust.avatar} type="customer" size="sm" />
                        <div>
                          <p className="text-sm font-700 text-slate-800 leading-tight">{cust.name}</p>
                          <p className="text-xs text-slate-400">{cust.phone}</p>
                          {b.isLiveLocation && (
                            <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-700 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              <Navigation size={8} /> Live
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-600 text-slate-700 max-w-[140px] truncate">{b.serviceType ?? b.service ?? '—'}</p>
                    </td>

                    {/* Scheduled */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-600 text-slate-700">{b.preferredDate ?? b.date ?? '—'}</p>
                      <p className="text-xs text-slate-400">{b.preferredTime ?? b.time ?? ''}</p>
                    </td>

                    {/* Technician */}
                    <td className="px-5 py-4">
                      {tech ? (
                        <div className="flex items-center gap-2">
                          <AvatarBadge name={tech.name} avatar={tech.avatar} type="technician" size="sm" />
                          <div>
                            <p className="text-sm font-600 text-slate-700 leading-tight">{tech.name}</p>
                            {(b.otpStatus?.toLowerCase?.().includes('verified') || b.startOtpVerified || b.endOtpVerified || b.otpVerified) && (
                              <span className="text-[10px] font-700 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full">
                                OTP ✓
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openAssign(b)}
                          className="flex items-center gap-1.5 text-xs font-700 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          <UserCheck size={11} /> Assign
                        </button>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <p className="text-xs font-700 text-slate-600">
                          Booking: <span className="font-800 text-slate-900">{fmtMoney(b.price || b.estimatedPrice || 0)}</span>
                        </p>
                        <p className="text-xs font-700 text-teal-700">
                          Assigned: <span className="font-800 text-teal-800">{(b.finalPrice || b.assignedPrice) ? fmtMoney(b.finalPrice ?? b.assignedPrice) : 'Pending'}</span>
                        </p>
                        {b.paymentStatus && (
                          <p className={`text-[10px] font-700 ${b.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {b.paymentStatus}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <Badge variant={bookingStatusVariant(b.status)} label={b.status} dot />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openView(b._id)}
                          title="View Details"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-all"
                        >
                          <Eye size={15} />
                        </button>
                        {!tech && (
                          <button
                            onClick={() => openAssign(b)}
                            title="Assign Technician"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                          >
                            <UserCheck size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteId(b._id)}
                          title="Delete"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Booking List Cards (Visible on Mobile < md screens) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="px-4 py-16 text-center">
              <Loader2 className="mx-auto animate-spin text-slate-300" size={28} />
              <p className="text-xs text-slate-400 mt-2">Loading bookings…</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <CalendarCheck size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-sm font-700 text-slate-400">No bookings found</p>
              <p className="text-xs text-slate-300 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            bookings.map((b) => {
              const cust = extractCustomer(b);
              const tech = extractTech(b);
              return (
                <div key={b._id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  {/* Header: Booking ID + Emergency Tag + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-700 text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-lg">
                        {b.bookingId ?? '—'}
                      </span>
                      {b.isEmergency && (
                        <span className="text-[9px] font-900 text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                          🚨 Emergency
                        </span>
                      )}
                    </div>
                    <Badge variant={bookingStatusVariant(b.status)} label={b.status} dot />
                  </div>

                  {/* Customer Info & Service */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AvatarBadge name={cust.name} avatar={cust.avatar} type="customer" size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-800 text-slate-900 truncate">{cust.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{cust.phone}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-700 text-slate-800 max-w-[120px] truncate">{b.serviceType ?? b.service ?? '—'}</p>
                      <p className="text-[11px] text-slate-400">{b.preferredDate ?? b.date ?? '—'}</p>
                    </div>
                  </div>

                  {/* Technician & Amount Row */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="min-w-0">
                      {tech ? (
                        <div className="flex items-center gap-1.5">
                          <AvatarBadge name={tech.name} avatar={tech.avatar} type="technician" size="sm" />
                          <span className="font-600 text-slate-700 truncate">{tech.name}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => openAssign(b)}
                          className="inline-flex items-center gap-1 text-[11px] font-700 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg"
                        >
                          <UserCheck size={11} /> Assign Tech
                        </button>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-700 text-slate-700">{fmtMoney(b.price || b.estimatedPrice || 0)}</p>
                      <p className="text-[10px] font-600 text-teal-700">Assigned: {(b.finalPrice || b.assignedPrice) ? fmtMoney(b.finalPrice ?? b.assignedPrice) : 'Pending'}</p>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => openView(b._id)}
                      className="btn-secondary text-xs py-1 px-2.5 gap-1"
                    >
                      <Eye size={13} /> View
                    </button>
                    {!tech && (
                      <button
                        onClick={() => openAssign(b)}
                        className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 text-xs font-700 py-1 px-2.5 rounded-xl transition-all flex items-center gap-1"
                      >
                        <UserCheck size={13} /> Assign
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(b._id)}
                      className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-xs font-700 py-1 px-2 rounded-xl transition-all flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination — only when total > PAGE_SIZE */}
        {showPagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              Showing <span className="font-700 text-slate-600">{Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)}</span> of <span className="font-700 text-slate-600">{total}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-700 transition-all ${
                      p === page
                        ? 'bg-primary-700 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          VIEW DETAIL MODAL
      ════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={viewOpen}
        onClose={() => { setViewOpen(false); setSelected(null); setWorkReport(null); }}
        title={selected ? `Booking — ${selected.bookingId ?? '…'}` : 'Loading…'}
        size="xl"
      >
        {!selected ? (
          <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={30} />
            <p className="text-sm">Fetching booking details…</p>
          </div>
        ) : (() => {
          const cust = extractCustomer(selected);
          const tech = extractTech(selected);
          return (
            <div className="space-y-5">

              {/* ── Hero strip */}
              <div className={`flex items-start justify-between gap-4 p-4 rounded-2xl text-white ${selected.isEmergency ? 'bg-gradient-to-r from-red-700 to-red-500' : 'bg-gradient-to-r from-primary-700 to-primary-600'}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-600 text-primary-200 uppercase tracking-wider">Service</p>
                    {selected.isEmergency && (
                      <span className="text-[9px] font-900 bg-white text-red-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                        🚨 Emergency
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-800 leading-tight">{fmt(selected.serviceType ?? selected.service)}</p>
                  <p className="text-xs text-primary-200 mt-1 flex items-center gap-1.5">
                    <Calendar size={11} /> {fmt(selected.preferredDate ?? selected.date)}
                    <span className="mx-1">·</span>
                    <Timer size={11} /> {fmt(selected.preferredTime ?? selected.time)}
                  </p>
                </div>
                <Badge variant={bookingStatusVariant(selected.status)} label={selected.status} dot />
              </div>

              {/* ── Customer + Technician row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Customer card */}
                <div className="rounded-2xl border border-slate-100 p-4 space-y-3">
                  <p className="text-[11px] font-700 text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={11} /> Customer
                  </p>
                  <div className="flex items-center gap-3">
                    <AvatarBadge name={cust.name} avatar={cust.avatar} type="customer" size="lg" />
                    <div>
                      <p className="text-sm font-800 text-slate-900">{cust.name}</p>
                      {cust.phone !== '—'
                        ? <p className="text-xs text-slate-400">{cust.phone}</p>
                        : <p className="text-xs text-amber-500 font-600">Contact unavailable</p>
                      }
                      {cust.email !== '—' && <p className="text-xs text-slate-400">{cust.email}</p>}
                    </div>
                  </div>
                  <div className="pt-1 border-t border-slate-50 space-y-1.5">
                    {cust.phone !== '—' && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone size={11} className="text-slate-400" />
                        <span>{cust.phone}</span>
                      </div>
                    )}
                    {cust.email !== '—' && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail size={11} className="text-slate-400" />
                        <span>{cust.email}</span>
                      </div>
                    )}
                    {selected.address && (
                      <div className="flex items-start justify-between gap-2 text-xs text-slate-600">
                        <div className="flex items-start gap-2 min-w-0">
                          <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                          <span className="truncate">{selected.address}</span>
                        </div>
                        {(!selected.isLiveLocation && !selected.lat) && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-700 text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md hover:bg-teal-100 transition-colors shrink-0"
                          >
                            <MapPin size={10} /> View Map
                          </a>
                        )}
                      </div>
                    )}
                    {(selected.isLiveLocation || (selected.lat && selected.lng)) && (
                      <div className="flex items-center justify-between gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/80 p-2 rounded-xl mt-1.5 shadow-2xs">
                        <div className="flex items-center gap-2 font-600 min-w-0 truncate">
                          <Navigation size={13} className="text-emerald-600 animate-pulse shrink-0" />
                          <span className="truncate">Live: {selected.lat?.toFixed?.(5) ?? selected.lat}, {selected.lng?.toFixed?.(5) ?? selected.lng}</span>
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${selected.lat},${selected.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-800 text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-3 py-1.5 rounded-lg shadow-xs transition-all shrink-0"
                        >
                          <MapPin size={12} /> View Map
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technician card */}
                <div className="rounded-2xl border border-slate-100 p-4 space-y-3">
                  <p className="text-[11px] font-700 text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench size={11} /> Technician
                  </p>
                  {tech ? (
                    <>
                      <div className="flex items-center gap-3">
                        <AvatarBadge name={tech.name} avatar={tech.avatar} type="technician" size="lg" />
                        <div>
                          <p className="text-sm font-800 text-slate-900">{tech.name}</p>
                          <p className="text-xs text-slate-400">{tech.specialty || '—'}</p>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-slate-50 space-y-1.5">
                        {tech.phone && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Phone size={11} className="text-slate-400" />
                            <span>{tech.phone}</span>
                          </div>
                        )}
                        {tech.rating !== '—' && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Star size={11} className="text-amber-400" />
                            <span>{tech.rating} Rating</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <ClipboardList size={11} className="text-slate-400" />
                          OTP Status:{' '}
                          <span className={`font-700 ${
                            (selected.otpStatus?.toLowerCase?.().includes('verified') || selected.startOtpVerified || selected.endOtpVerified || selected.otpVerified)
                              ? 'text-emerald-700'
                              : 'text-amber-600'
                          }`}>
                            {(selected.otpStatus?.toLowerCase?.().includes('verified') || selected.startOtpVerified || selected.endOtpVerified || selected.otpVerified)
                              ? `${selected.otpStatus || 'Verified'} ✓`
                              : (selected.otpStatus || 'Pending Verification')}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <UserCheck size={18} className="text-amber-500" />
                      </div>
                      <p className="text-xs text-slate-400">No technician assigned yet</p>
                      <button
                        onClick={() => { setViewOpen(false); openAssign(selected); }}
                        className="btn-primary text-xs py-1.5 px-4"
                      >
                        <UserCheck size={12} /> Assign Now
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Booking details row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Tag,        label: 'Booking ID',       value: fmt(selected.bookingId) },
                  { icon: CreditCard, label: 'Cust Booking Amt', value: fmtMoney(selected.price || selected.estimatedPrice || 0) },
                  { icon: CreditCard, label: 'Admin Assigned Amt',value: (selected.finalPrice || selected.assignedPrice) ? fmtMoney(selected.finalPrice ?? selected.assignedPrice) : 'Pending' },
                  { icon: CreditCard, label: 'Pay Status',       value: fmt(selected.paymentStatus) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border border-slate-100 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon size={11} className="text-slate-400" />
                      <p className="text-[10px] font-700 text-slate-400 uppercase tracking-wider">{label}</p>
                    </div>
                    <p className="text-sm font-700 text-slate-800">{value}</p>
                  </div>
                ))}
              </div>

              {/* ── Problem description */}
              {selected.problemDescription && (
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-[11px] font-700 text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ClipboardList size={11} /> Customer Issue
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">{selected.problemDescription}</p>
                </div>
              )}

              {/* ── Admin note */}
              {selected.adminNote && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-[11px] font-700 text-amber-600 uppercase tracking-wider mb-2">Admin Note</p>
                  <p className="text-sm text-slate-700">{selected.adminNote}</p>
                </div>
              )}

              {/* ── Cancellation reason */}
              {selected.status === 'Cancelled' && selected.cancellationReason && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                  <p className="text-[11px] font-700 text-red-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Ban size={11} /> Cancellation Reason
                  </p>
                  <p className="text-sm text-slate-700">{selected.cancellationReason}</p>
                  {selected.cancelledAt && <p className="text-xs text-slate-400 mt-1">{fmtDate(selected.cancelledAt)}</p>}
                </div>
              )}

              {/* ── Completion info */}
              {selected.status === 'Completed' && selected.completedAt && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-[11px] font-700 text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 size={11} /> Completed
                  </p>
                  <p className="text-sm text-slate-700">{fmtDate(selected.completedAt)}</p>
                </div>
              )}

              {/* ── Work Report */}
              {workReport && (
                <div className="rounded-2xl border border-slate-100 p-4 space-y-4">
                  <p className="text-[11px] font-700 text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardList size={11} /> Work Report
                  </p>
                  {workReport.workDone && (
                    <div>
                      <p className="text-xs font-700 text-slate-500 mb-1">Work Done</p>
                      <p className="text-sm text-slate-700">{workReport.workDone}</p>
                    </div>
                  )}
                  {workReport.selectedWorks?.length > 0 && (
                    <div>
                      <p className="text-xs font-700 text-slate-500 mb-1">Selected Works</p>
                      <div className="flex flex-wrap gap-2">
                        {workReport.selectedWorks.map((p: string, i: number) => (
                          <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-600">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {workReport.techNote && (
                    <div>
                      <p className="text-xs font-700 text-slate-500 mb-1">Technician Note</p>
                      <p className="text-sm text-slate-700">{workReport.techNote}</p>
                    </div>
                  )}

                  {/* Photos Grid */}
                  {workReport.photos && workReport.photos.length > 0 && (
                    <div>
                      <p className="text-xs font-700 text-slate-500 mb-2">Job Photos ({workReport.photos.length})</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {workReport.photos.map((url: string, i: number) => (
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

                  {/* Video Player */}
                  {workReport.video && (
                    <div>
                      <p className="text-xs font-700 text-slate-500 mb-2">Job Video</p>
                      <div className="rounded-xl overflow-hidden border border-slate-150 bg-slate-50 aspect-video max-w-sm">
                        <video src={workReport.video} controls className="w-full h-full" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Status Actions */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[11px] font-700 text-slate-400 uppercase tracking-wider mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { s: 'Upcoming',    label: 'Mark Upcoming',    cls: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',    Icon: ArrowUpRight },
                    { s: 'In Progress', label: 'Mark In Progress', cls: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',    Icon: CircleDot },
                    { s: 'Completed',   label: 'Mark Completed',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', Icon: CheckSquare },
                    { s: 'Cancelled',   label: 'Cancel',           cls: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',         Icon: Ban },
                  ].map(({ s, label, cls, Icon: SIcon }) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selected._id, s)}
                      disabled={selected.status === s || statusChanging}
                      className={`inline-flex items-center gap-1.5 text-xs font-700 px-3 py-2 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}
                    >
                      {statusChanging && selected.status !== s ? <Loader2 size={11} className="animate-spin" /> : <SIcon size={11} />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Danger zone */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <p className="text-xs text-slate-400">Booking ID: <span className="font-700 text-slate-600">{selected.bookingId}</span></p>
                <button
                  onClick={() => setDeleteId(selected._id)}
                  className="inline-flex items-center gap-1.5 text-xs font-700 text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 px-3 py-2 rounded-xl transition-all"
                >
                  <Trash2 size={11} /> Delete Booking
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ════════════════════════════════════════════════════════════════
          ASSIGN TECHNICIAN MODAL
      ════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign Technician"
        size="md"
      >
        {selected && (
          <div className="space-y-5">

            {/* Booking summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-sm font-800 text-slate-900">{fmt(selected.serviceType ?? selected.service)}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <User size={10} /> {extractCustomer(selected).name}
              </p>
              {selected.address && (
                <p className="text-xs text-slate-500 flex items-start gap-1.5">
                  <MapPin size={10} className="shrink-0 mt-0.5" /> {selected.address}
                </p>
              )}
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Calendar size={10} /> {fmt(selected.preferredDate)} · {fmt(selected.preferredTime)}
              </p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-700 text-slate-600 mb-1.5">Service Price (₹)</label>
              <input
                type="number"
                className="input-field"
                value={assignPrice}
                onChange={e => setAssignPrice(e.target.value)}
                placeholder="Enter service price"
                min={0}
              />
            </div>

            {/* Technician picker */}
            <div>
              <label className="block text-xs font-700 text-slate-600 mb-2">Select Technician</label>
              {technicians.filter((t: any) => t.technicianStatus !== 'Off Duty').length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No available technicians</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {technicians.filter((t: any) => t.technicianStatus !== 'Off Duty').map((t: any) => (
                    <label
                      key={t._id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        assignTechId === t._id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tech"
                        value={t._id}
                        checked={assignTechId === t._id}
                        onChange={() => setAssignTechId(t._id)}
                        className="accent-primary-700 shrink-0"
                      />
                      <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center font-800 text-primary-700 text-sm shrink-0">
                        {t.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-700 text-slate-800 truncate">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.specialty} · ⭐ {t.rating ?? '—'}</p>
                      </div>
                      <span className={`text-[10px] font-700 px-2 py-0.5 rounded-full shrink-0 ${
                        t.technicianStatus === 'Available'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {t.technicianStatus}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleAssign}
                disabled={!assignTechId || assigning}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >
                {assigning ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                {assigning ? 'Assigning…' : 'Assign Technician'}
              </button>
              <button className="btn-secondary px-5" onClick={() => setAssignOpen(false)}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ════════════════════════════════════════════════════════════════
          DELETE CONFIRM MODAL
      ════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Booking"
        size="sm"
      >
        <div className="text-center space-y-4 py-2">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-800 text-slate-900">Are you sure?</p>
            <p className="text-xs text-slate-400 mt-1">This will permanently delete the booking. This action cannot be undone.</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              className="btn-danger flex-1 justify-center disabled:opacity-60"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {deleting ? 'Deleting…' : 'Yes, Delete'}
            </button>
            <button
              className="btn-secondary flex-1 justify-center"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        </div>
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

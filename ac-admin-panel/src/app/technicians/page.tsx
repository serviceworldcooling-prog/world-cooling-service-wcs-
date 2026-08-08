'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Badge, { techStatusVariant } from '@/components/Badge';
import SearchFilter from '@/components/SearchFilter';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import {
  getTechnicians, createTechnician, updateTechnician,
  deleteTechnician, uploadTechnicianAvatar,
} from '@/lib/api';
import {
  Wrench, UserCheck, Briefcase, CheckCircle2, IndianRupee,
  Plus, Eye, Pencil, Trash2, Mail, Phone, MapPin,
  Award, CalendarDays, Star, AlertTriangle, RefreshCw, Loader2,
  Camera, Upload, X as XIcon, User,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'Available', label: 'Available' },
  { value: 'On Job',    label: 'On Job' },
  { value: 'Off Duty',  label: 'Off Duty' },
];

const emptyForm = () => ({
  name: '', email: '', phone: '', password: '',
  specialty: 'AC Technician', city: '', certifications: [] as string[],
  technicianStatus: 'Available',
});

function TechAvatar({ technician, size = 'md', className = '' }: { technician: any; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const [imgError, setImgError] = useState(false);
  const name = technician?.name || technician?.technicianName || 'Technician';
  const initial = (name.trim()?.[0] || 'T').toUpperCase();
  const pic = technician?.avatar || technician?.profilePic || technician?.photo || technician?.image || technician?.techAvatar;

  const isDummyPic = !pic ||
    typeof pic !== 'string' ||
    !pic.trim() ||
    pic.includes('unsplash.com') ||
    pic.includes('placeholder') ||
    pic.includes('dummy');

  if (!isDummyPic && !imgError) {
    return (
      <img
        src={pic}
        alt={name}
        onError={() => setImgError(true)}
        className={
          size === 'lg'
            ? `w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-lg shrink-0 ${className}`
            : size === 'sm'
            ? `w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0 ${className}`
            : `w-11 h-11 rounded-2xl object-cover border border-slate-200 shrink-0 ${className}`
        }
      />
    );
  }

  if (size === 'lg') {
    return (
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-900 text-2xl shadow-lg shrink-0 ${className}`}>
        {initial}
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-700 to-primary-500 flex items-center justify-center text-white font-800 text-xs shrink-0 ${className}`}>
        {initial}
      </div>
    );
  }

  return (
    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white font-800 text-sm shrink-0 ${className}`}>
      {initial}
    </div>
  );
}

export default function TechniciansPage() {
  const { success, error: toastError } = useToast();

  const [technicians, setTechnicians] = useState<any[]>([]);
  const [total, setTotal]             = useState(0);
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);

  const [viewOpen, setViewOpen]   = useState(false);
  const [addOpen, setAddOpen]     = useState(false);
  const [editOpen, setEditOpen]   = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [selected, setSelected]   = useState<any>(null);
  const [form, setForm]           = useState<any>(emptyForm());
  const [certInput, setCertInput] = useState('');

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await getTechnicians(filter, search, 1, 50);
      const list = res?.data ?? res?.technicians ?? [];
      setTechnicians(list);
      setTotal(res?.total ?? list.length);
    } catch { setTechnicians([]); }
    finally { setLoading(false); }
  }, [search, filter]);

  useEffect(() => { load(); }, [load]);

  const available = technicians.filter(t => t.technicianStatus === 'Available').length;
  const onJob     = technicians.filter(t => t.technicianStatus === 'On Job').length;
  const totalJobs = technicians.reduce((s, t) => s + (t.completedJobs ?? 0), 0);

  const addCert    = () => { if (!certInput.trim()) return; setForm((p: any) => ({ ...p, certifications: [...(p.certifications || []), certInput.trim()] })); setCertInput(''); };
  const removeCert = (i: number) => setForm((p: any) => ({ ...p, certifications: p.certifications.filter((_: any, j: number) => j !== i) }));

  // ── Avatar file picker → base64 ──────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toastError('Invalid file', 'Please select an image file (JPG, PNG, WEBP).'); return; }
    if (file.size > 5 * 1024 * 1024) { toastError('File too large', 'Please select an image under 5 MB.'); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setAvatarPreview(base64);
      setForm((p: any) => ({ ...p, avatar: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      toastError('Missing fields', 'Name, email, phone and password are required.');
      return;
    }
    setSaving(true);
    try {
      await createTechnician(form);
      setAddOpen(false);
      setAvatarPreview('');
      success('Technician Created', `${form.name} has been added.`);
      load();
    } catch (e: any) { toastError('Create Failed', e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateTechnician(selected._id, form);
      setEditOpen(false);
      setAvatarPreview('');
      success('Changes Saved', `${form.name} has been updated.`);
      load();
    } catch (e: any) { toastError('Update Failed', e.message); }
    finally { setSaving(false); }
  };

  // ── Upload avatar for existing technician from View modal ────────────────
  const handleAvatarUploadDirect = async (id: string, base64: string) => {
    setAvatarUploading(true);
    try {
      const res: any = await uploadTechnicianAvatar(id, base64);
      const updated = res?.data?.technician ?? res?.technician;
      if (updated) setSelected((p: any) => ({ ...p, avatar: updated.avatar }));
      success('Photo Updated', 'Profile photo uploaded successfully.');
      load();
    } catch (e: any) { toastError('Upload Failed', e.message); }
    finally { setAvatarUploading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTechnician(deleteId);
      setDeleteId(null);
      setViewOpen(false);
      success('Deleted', 'Technician account removed.');
      load();
    } catch (e: any) { toastError('Delete Failed', e.message); }
  };

  return (
    <DashboardLayout title="Technicians" subtitle="Manage field engineers, availability and job assignments">
      
      {/* ── Top Telemetry Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
        {[
          { label: 'Total Techs', value: technicians.length, icon: Wrench,        color: 'text-primary-700', bg: 'bg-primary-50' },
          { label: 'Available',  value: available,          icon: UserCheck,      color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'On Job',     value: onJob,              icon: Briefcase,      color: 'text-blue-600',    bg: 'bg-blue-50' },
          { label: 'Jobs Done',  value: totalJobs,          icon: CheckCircle2,   color: 'text-violet-600',  bg: 'bg-violet-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/70 shadow-card flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-600 text-slate-500 truncate">{label}</p>
              <p className="text-lg sm:text-xl font-800 text-slate-900 leading-tight truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Container: Touched Left and Right on Mobile ── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden">
        
        {/* Search & Actions Toolbar */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50">
          <SearchFilter 
            searchValue={search} 
            onSearch={setSearch} 
            placeholder="Search name, specialty, city…"
            filterOptions={STATUS_OPTIONS} 
            filterValue={filter} 
            onFilter={setFilter} 
            filterLabel="Status"
            rightSlot={
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button 
                  className="btn-secondary py-2 px-3 text-xs gap-1.5 shrink-0 rounded-xl" 
                  onClick={load} 
                  title="Refresh Roster"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
                <button 
                  className="btn-primary py-2 px-3.5 text-xs font-700 rounded-xl whitespace-nowrap flex-1 sm:flex-initial justify-center shadow-sm" 
                  onClick={() => { setForm(emptyForm()); setCertInput(''); setAddOpen(true); }}
                >
                  <Plus size={15} /> Add Technician
                </button>
              </div>
            }
          />
        </div>

        {/* ── Desktop Table View (Hidden on Mobile) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {['Technician', 'Contact Details', 'City', 'Rating', 'Jobs Done', 'Earnings', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-[11px] font-800 text-slate-500 uppercase tracking-wider text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={32} />
                    <p className="text-xs text-slate-400">Loading technician telemetry…</p>
                  </td>
                </tr>
              ) : technicians.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-slate-400 text-sm">
                    No technicians found
                  </td>
                </tr>
              ) : technicians.map(t => (
                <tr key={t._id} className="hover:bg-slate-50/80 transition-colors group">
                  
                  {/* Technician info */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <TechAvatar technician={t} size="sm" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          t.technicianStatus === 'Available' ? 'bg-emerald-500' :
                          t.technicianStatus === 'On Job'    ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-800 text-slate-900 group-hover:text-teal-700 transition-colors truncate">{t.name}</p>
                        <p className="text-[11px] text-slate-400 font-500 truncate">{t.specialty || 'Senior AC Tech'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-600 text-slate-700 flex items-center gap-1.5 truncate">
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{t.email}</span>
                      </p>
                      <p className="text-[11px] font-500 text-slate-400 flex items-center gap-1.5">
                        <Phone size={11} className="text-slate-400 shrink-0" />
                        <span>{t.phone}</span>
                      </p>
                    </div>
                  </td>

                  {/* City */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-600 text-slate-600 bg-slate-100/80 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                      <MapPin size={11} className="text-slate-400 shrink-0" />
                      {t.city || 'Delhi NCR'}
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-xs font-800 text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-lg w-fit">
                      <Star size={12} fill="#F59E0B" className="text-amber-500" />
                      <span>{t.rating ?? 4.9}</span>
                    </div>
                  </td>

                  {/* Jobs Done */}
                  <td className="px-5 py-4">
                    <span className="text-xs font-800 text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {(t.completedJobs ?? 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Earnings */}
                  <td className="px-5 py-4">
                    <p className="text-xs font-800 text-slate-900">
                      ₹{(t.earnings ?? 0).toLocaleString()}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <Badge variant={techStatusVariant(t.technicianStatus ?? 'Available')} label={t.technicianStatus ?? 'Available'} dot />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => { setSelected(t); setViewOpen(true); }}
                        title="View Profile"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-all"
                      >
                        <Eye size={15} />
                      </button>
                      <button 
                        onClick={() => { setSelected(t); setForm({ ...t }); setCertInput(''); setEditOpen(true); }}
                        title="Edit Profile"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                      >
                        <Pencil size={15} />
                      </button>
                      <button 
                        onClick={() => setDeleteId(t._id)}
                        title="Delete"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card View (< md screens, Touched Edge-to-Edge) ── */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="px-4 py-16 text-center">
              <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
              <p className="text-xs text-slate-400">Loading technicians…</p>
            </div>
          ) : technicians.length === 0 ? (
            <div className="px-4 py-16 text-center text-slate-400 text-sm">No technicians found</div>
          ) : (
            technicians.map(t => (
              <div key={t._id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                
                {/* Header: Avatar, Name, Specialty & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <TechAvatar technician={t} size="md" />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        t.technicianStatus === 'Available' ? 'bg-emerald-500' :
                        t.technicianStatus === 'On Job'    ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-800 text-slate-900 truncate">{t.name}</p>
                      <p className="text-xs text-slate-400 truncate">{t.specialty || 'Senior AC Tech'}</p>
                    </div>
                  </div>
                  <Badge variant={techStatusVariant(t.technicianStatus ?? 'Available')} label={t.technicianStatus ?? 'Available'} dot />
                </div>

                {/* Performance & Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-center">
                  <div>
                    <p className="text-[9px] font-700 text-slate-400 uppercase">Rating</p>
                    <p className="text-xs font-800 text-amber-600 flex items-center justify-center gap-0.5 mt-0.5">
                      <Star size={11} fill="#F59E0B" className="text-amber-500" /> {t.rating ?? 4.9}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-700 text-slate-400 uppercase">Jobs Done</p>
                    <p className="text-xs font-800 text-slate-900 mt-0.5">{(t.completedJobs ?? 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-700 text-slate-400 uppercase">Earned</p>
                    <p className="text-xs font-800 text-emerald-600 mt-0.5">₹{(t.earnings ?? 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Contact & Location Info */}
                <div className="flex items-center justify-between gap-2 text-xs text-slate-600 pt-0.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone size={12} className="text-slate-400 shrink-0" />
                    <span>{t.phone}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-600 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                    <MapPin size={9} /> {t.city || 'Delhi NCR'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => { setSelected(t); setViewOpen(true); }}
                    className="btn-secondary text-xs py-1 px-3 gap-1"
                  >
                    <Eye size={13} /> View
                  </button>
                  <button 
                    onClick={() => { setSelected(t); setForm({ ...t }); setCertInput(''); setEditOpen(true); }}
                    className="btn-primary text-xs py-1 px-3 gap-1"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button 
                    onClick={() => setDeleteId(t._id)}
                    className="bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-xs font-700 py-1 px-2.5 rounded-xl transition-all flex items-center gap-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Hidden file input for avatar picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />

      {/* Add Modal */}
      <Modal isOpen={addOpen} onClose={() => { setAddOpen(false); setAvatarPreview(''); }} title="Add Technician" size="md">
        <TechForm
          form={form}
          setForm={setForm}
          certInput={certInput}
          setCertInput={setCertInput}
          addCert={addCert}
          removeCert={removeCert}
          avatarPreview={avatarPreview}
          onPickAvatar={() => fileInputRef.current?.click()}
          onRemoveAvatar={() => { setAvatarPreview(''); setForm((p: any) => ({ ...p, avatar: '' })); }}
        />
        <div className="flex gap-3 mt-5">
          <button className="btn-primary flex-1 justify-center" onClick={handleAdd} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create Account
          </button>
          <button className="btn-secondary px-5" onClick={() => { setAddOpen(false); setAvatarPreview(''); }}>Cancel</button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => { setEditOpen(false); setAvatarPreview(''); }} title={`Edit — ${selected?.name}`} size="md">
        <TechForm
          form={form}
          setForm={setForm}
          certInput={certInput}
          setCertInput={setCertInput}
          addCert={addCert}
          removeCert={removeCert}
          isEdit
          avatarPreview={avatarPreview || form.avatar || ''}
          onPickAvatar={() => fileInputRef.current?.click()}
          onRemoveAvatar={() => { setAvatarPreview(''); setForm((p: any) => ({ ...p, avatar: '' })); }}
        />
        <div className="flex gap-3 mt-5">
          <button className="btn-primary flex-1 justify-center" onClick={handleEdit} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save Changes
          </button>
          <button className="btn-secondary px-5" onClick={() => { setEditOpen(false); setAvatarPreview(''); }}>Cancel</button>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title="Technician Profile" size="md">
        {selected && (
          <div className="space-y-4">
            {/* Hero with avatar upload */}
            <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary-700 to-primary-500 text-white">
              <div className="relative group shrink-0">
                <TechAvatar technician={selected} size="lg" />
                {/* Upload overlay */}
                <label className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {avatarUploading
                    ? <Loader2 size={18} className="text-white animate-spin" />
                    : <Camera size={18} className="text-white" />
                  }
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={avatarUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith('image/')) { toastError('Invalid file', 'Please select an image.'); return; }
                      if (file.size > 5 * 1024 * 1024) { toastError('Too large', 'Max 5 MB.'); return; }
                      const reader = new FileReader();
                      reader.onload = async (ev) => {
                        const base64 = ev.target?.result as string;
                        await handleAvatarUploadDirect(selected._id, base64);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm pointer-events-none">
                  <Camera size={12} className="text-primary-700" />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base sm:text-xl font-800 truncate">{selected.name}</p>
                <p className="text-xs sm:text-sm text-primary-200 truncate">{selected.specialty}</p>
                <p className="text-[10px] text-primary-300 mt-1">Hover photo to change</p>
              </div>
              <Badge variant={techStatusVariant(selected.technicianStatus ?? 'Available')} label={selected.technicianStatus ?? 'Available'} dot />
            </div>

            {[
              { icon: Mail, label: 'Email',  value: selected.email },
              { icon: Phone, label: 'Phone', value: selected.phone },
              { icon: MapPin, label: 'City', value: selected.city || '—' },
              { icon: CalendarDays, label: 'Joined', value: new Date(selected.createdAt ?? Date.now()).toLocaleDateString() },
              { icon: CheckCircle2, label: 'Jobs Done', value: selected.completedJobs ?? 0 },
              { icon: IndianRupee, label: 'Earnings', value: `₹${(selected.earnings ?? 0).toLocaleString()}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 border border-slate-100">
                <Icon size={14} className="text-primary-600 shrink-0" />
                <span className="text-xs font-700 text-slate-400 w-20 shrink-0">{label}</span>
                <span className="text-xs sm:text-sm font-600 text-slate-700 truncate flex-1 min-w-0">{String(value)}</span>
              </div>
            ))}
            <div className="flex gap-3 pt-1">
              <button className="btn-primary flex-1 justify-center" onClick={() => {
                setViewOpen(false);
                setAvatarPreview(selected.avatar || '');
                setForm({ ...selected });
                setEditOpen(true);
              }}>
                <Pencil size={14} /> Edit Profile
              </button>
              <button className="btn-danger px-4" onClick={() => setDeleteId(selected._id)}><Trash2 size={14} /></button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Technician" size="sm">
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto"><AlertTriangle size={26} className="text-red-500" /></div>
          <div>
            <p className="text-sm font-800 text-slate-900">Delete account?</p>
            <p className="text-xs text-slate-400 mt-1">This will permanently remove the technician profile.</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-danger flex-1 justify-center" onClick={handleDelete}>Delete</button>
            <button className="btn-secondary flex-1 justify-center" onClick={() => setDeleteId(null)}>Cancel</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

interface TechFormProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  certInput: string;
  setCertInput: React.Dispatch<React.SetStateAction<string>>;
  addCert: () => void;
  removeCert: (i: number) => void;
  isEdit?: boolean;
  avatarPreview?: string;
  onPickAvatar?: () => void;
  onRemoveAvatar?: () => void;
}

function TechForm({ form, setForm, certInput, setCertInput, addCert, removeCert, isEdit = false, avatarPreview, onPickAvatar, onRemoveAvatar }: TechFormProps) {
  return (
    <div className="space-y-4">

      {/* ── Avatar Upload ── */}
      <div>
        <label className="form-label">Profile Photo</label>
        <div className="flex items-center gap-4 mt-1">
          {/* Preview */}
          <div className="relative shrink-0">
            {avatarPreview
              ? (
                <div className="relative">
                  <img src={avatarPreview} alt="avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-primary-200 shadow-sm" />
                  <button
                    type="button"
                    onClick={onRemoveAvatar}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <XIcon size={11} />
                  </button>
                </div>
              )
              : (
                <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-400">
                  <User size={22} />
                  <span className="text-[9px] font-600">No photo</span>
                </div>
              )
            }
          </div>

          {/* Upload button */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onPickAvatar}
              className="inline-flex items-center gap-2 text-sm font-600 text-primary-700 bg-primary-50 border border-primary-200 px-4 py-2.5 rounded-xl hover:bg-primary-100 transition-colors"
            >
              <Upload size={14} /> {avatarPreview ? 'Change Photo' : 'Upload Photo'}
            </button>
            <p className="text-xs text-slate-400">JPG, PNG or WEBP · Max 5 MB</p>
          </div>
        </div>
      </div>

      <div><label className="form-label">Full Name</label>
        <input className="input-field" value={form.name || ''} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} placeholder="John Doe" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className="form-label">Email</label>
          <input type="email" className="input-field" value={form.email || ''} onChange={e => setForm((p: any) => ({ ...p, email: e.target.value }))} placeholder="john@service.com" /></div>
        <div><label className="form-label">Phone</label>
          <input className="input-field" value={form.phone || ''} onChange={e => setForm((p: any) => ({ ...p, phone: e.target.value }))} placeholder="+1 555-0100" /></div>
      </div>
      {!isEdit && (
        <div><label className="form-label">Password</label>
          <input type="password" className="input-field" value={form.password || ''} onChange={e => setForm((p: any) => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" /></div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className="form-label">Specialty</label>
          <input className="input-field" value={form.specialty || ''} onChange={e => setForm((p: any) => ({ ...p, specialty: e.target.value }))} /></div>
        <div><label className="form-label">City</label>
          <input className="input-field" value={form.city || ''} onChange={e => setForm((p: any) => ({ ...p, city: e.target.value }))} /></div>
      </div>
      <div><label className="form-label">Status</label>
        <select className="input-field" value={form.technicianStatus || 'Available'} onChange={e => setForm((p: any) => ({ ...p, technicianStatus: e.target.value }))}>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select></div>
      <div><label className="form-label">Certifications</label>
        <div className="flex gap-2 mb-2">
          <input className="input-field" value={certInput} onChange={e => setCertInput(e.target.value)} placeholder="e.g. EPA 608"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCert())} />
          <button type="button" className="btn-primary shrink-0" onClick={addCert}>Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(form.certifications ?? []).map((c: string, i: number) => (
            <span key={i} className="text-xs font-700 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              {c} <button type="button" className="text-red-500 font-bold" onClick={() => removeCert(i)}>×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

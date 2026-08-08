'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import SearchFilter from '@/components/SearchFilter';
import Modal from '@/components/Modal';
import { Service } from '@/lib/mockData';
import { getServices, createService, updateService, deleteService, apiClient } from '@/lib/api';
import {
  Wind, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Wrench, Settings, PlusCircle, MinusCircle, Gauge,
  Droplets, Cpu, Activity, Eye, AlertTriangle, IndianRupee, Loader2
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Wrench:      <Wrench size={22} />,
  Settings:    <Settings size={22} />,
  PlusCircle:  <PlusCircle size={22} />,
  MinusCircle: <MinusCircle size={22} />,
  Gauge:       <Gauge size={22} />,
  Wind:        <Wind size={22} />,
  Cpu:         <Cpu size={22} />,
  Droplets:    <Droplets size={22} />,
  Activity:    <Activity size={22} />,
};

const CATEGORY_OPTIONS = [
  { value: 'AC Service / Cleaning',   label: 'AC Service / Cleaning' },
  { value: 'AC Repair',               label: 'AC Repair' },
  { value: 'Gas Charging',            label: 'Gas Charging' },
  { value: 'AC Installation',         label: 'AC Installation' },
  { value: 'Water Leakage Fix',       label: 'Water Leakage Fix' },
  { value: 'Compressor Repair',       label: 'Compressor Repair' },
  { value: 'PCB / Electrical Fault',  label: 'PCB / Electrical Fault' },
  { value: 'Emergency Breakdown',     label: 'Emergency Breakdown' },
];

const CATEGORY_COLORS: Record<string, string> = {
  'AC Service / Cleaning':  'bg-teal-50 text-teal-700 border-teal-200/60',
  'AC Repair':              'bg-orange-50 text-orange-700 border-orange-200/60',
  'Gas Charging':           'bg-sky-50 text-sky-700 border-sky-200/60',
  'AC Installation':        'bg-violet-50 text-violet-700 border-violet-200/60',
  'Water Leakage Fix':      'bg-cyan-50 text-cyan-700 border-cyan-200/60',
  'Compressor Repair':      'bg-amber-50 text-amber-700 border-amber-200/60',
  'PCB / Electrical Fault': 'bg-slate-50 text-slate-700 border-slate-200/60',
  'Emergency Breakdown':    'bg-rose-50 text-rose-700 border-rose-200/60',
};

const emptyService = (): Partial<Service> => ({
  title: '',
  icon: 'Wrench',
  description: '',
  basePrice: 0,
  duration: '1-2 hrs',
  category: 'AC Service / Cleaning',
  isActive: true,
  bookingsCount: 0,
  image: '',
});

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      setError(null);

      try {
        const res: any = await getServices();
        const fetchedServices: Service[] = (res?.services ?? []).map((service: any) => ({
          id: service._id,
          title: service.title,
          icon: service.icon || 'Wrench',
          description: service.description || '',
          basePrice: service.basePrice ?? 0,
          duration: service.estimatedTime || '1-2 hrs',
          category: service.category || 'Maintenance',
          bookingsCount: 0,
          isActive: service.isActive ?? true,
          image: service.image || '',
        }));

        setServices(fetchedServices);
      } catch (err: any) {
        setError(err.message || 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Modal states
  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [form, setForm] = useState<Partial<Service>>(emptyService());

  const filtered = services.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch = s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    const matchesCat    = !filter || s.category === filter;
    return matchesSearch && matchesCat;
  });

  const activeCount = services.filter(s => s.isActive).length;
  const totalBookings = services.reduce((sum, s) => sum + s.bookingsCount, 0);

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const res: any = await apiClient.get('/auth/cloudinary-signature');
      const { signature, timestamp, apiKey, cloudName, uploadPreset } = res;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('upload_preset', uploadPreset);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const data = await uploadRes.json();
      setForm(prev => ({ ...prev, image: data.secure_url }));
    } catch (err: any) {
      setError(err?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handlers
  const handleToggleActive = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const handleOpenAdd = () => {
    setForm(emptyService());
    setAddOpen(true);
  };

  const handleOpenEdit = (s: Service) => {
    setSelected(s);
    setForm({ ...s });
    setEditOpen(true);
  };

  const handleAdd = async () => {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        icon: form.icon,
        basePrice: form.basePrice,
        category: form.category,
        estimatedTime: form.duration,
        inclusions: [],
        isActive: form.isActive,
        isFeatured: false,
        image: form.image || '',
      };

      const res: any = await createService(payload);
      const service = res?.service;

      if (service) {
        setServices(prev => [
          ...prev,
          {
            id: service._id,
            title: service.title,
            icon: service.icon || 'Wrench',
            description: service.description || '',
            basePrice: service.basePrice ?? 0,
            duration: service.estimatedTime || '1-2 hrs',
            category: service.category || 'Maintenance',
            bookingsCount: 0,
            isActive: service.isActive ?? true,
            image: service.image || '',
          },
        ]);
      }

      setAddOpen(false);
    } catch (err: any) {
      setError(err.message || 'Unable to create service');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        icon: form.icon,
        basePrice: form.basePrice,
        category: form.category,
        estimatedTime: form.duration,
        inclusions: [],
        isActive: form.isActive,
        image: form.image || '',
      };

      const res: any = await updateService(selected.id, payload);
      const service = res?.service;

      if (service) {
        setServices(prev => prev.map(s => s.id === selected.id ? {
          ...s,
          title: service.title,
          icon: service.icon || 'Wrench',
          description: service.description || '',
          basePrice: service.basePrice ?? 0,
          duration: service.estimatedTime || '1-2 hrs',
          category: service.category || 'Maintenance',
          isActive: service.isActive ?? true,
          image: service.image || '',
        } : s));
      }

      setEditOpen(false);
    } catch (err: any) {
      setError(err.message || 'Unable to update service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError(null);

    try {
      await deleteService(deleteId);
      setServices(prev => prev.filter(s => s.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      setError(err.message || 'Unable to delete service');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout title="Service Catalog" subtitle="Manage AC repair, cleaning, gas charging and maintenance catalog">

      {/* ── KPI Telemetry Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
        {[
          { label: 'Total Services',  value: services.length, color: 'text-primary-700', bg: 'bg-primary-50' },
          { label: 'Active',          value: activeCount,          color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inactive',        value: services.length - activeCount, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Total Bookings',  value: totalBookings,        color: 'text-violet-600',  bg: 'bg-violet-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/70 shadow-card min-w-0">
            <p className="text-[10px] sm:text-xs font-600 text-slate-500 truncate mb-0.5 sm:mb-1">{label}</p>
            <p className={`text-lg sm:text-2xl font-800 leading-tight ${color} truncate`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Main Service Container (Touched Left and Right on Mobile) ── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden">
        
        {/* Search Toolbar */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50">
          <SearchFilter
            searchValue={search}
            onSearch={setSearch}
            placeholder="Search services by title or description…"
            filterOptions={CATEGORY_OPTIONS}
            filterValue={filter}
            onFilter={setFilter}
            filterLabel="Category"
            rightSlot={
              <button 
                className="btn-primary py-2 px-3.5 text-xs font-700 rounded-xl whitespace-nowrap w-full sm:w-auto justify-center shadow-sm" 
                onClick={handleOpenAdd}
              >
                <Plus size={15} /> Add Service
              </button>
            }
          />
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 p-3.5 sm:p-5">
          {loading ? (
            <div className="col-span-full rounded-2xl border border-slate-100 bg-slate-50 p-12 text-center text-slate-400">
              <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={32} />
              <p className="text-xs font-600">Loading service catalog database…</p>
            </div>
          ) : error ? (
            <div className="col-span-full rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600 text-xs font-600">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-100 bg-slate-50 p-12 text-center text-slate-400 text-sm">
              No services match your search criteria.
            </div>
          ) : filtered.map((s) => (
            <div key={s.id} className={`rounded-2xl border p-4 sm:p-5 transition-all duration-300 hover:shadow-card-hover relative overflow-hidden group flex flex-col justify-between
              ${s.isActive ? 'border-slate-200/80 bg-white' : 'border-slate-200/50 bg-slate-50/70 opacity-80'}`}>

              <div>
                {/* Top right active toggle */}
                <button
                  onClick={() => handleToggleActive(s.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-primary-700 transition-colors"
                  title={s.isActive ? 'Deactivate Service' : 'Activate Service'}
                >
                  {s.isActive
                    ? <ToggleRight size={28} className="text-primary-700" />
                    : <ToggleLeft size={28} />
                  }
                </button>

                {/* Icon + Title */}
                <div className="flex items-start gap-3 mb-3 pr-8">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                    {ICON_MAP[s.icon] ?? <Wind size={22} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-800 text-slate-900 leading-snug truncate">{s.title}</p>
                    <span className={`inline-block text-[10px] font-700 px-2 py-0.5 rounded-md border mt-1 truncate ${CATEGORY_COLORS[s.category] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {s.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{s.description}</p>
              </div>

              <div>
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs sm:text-sm font-800 text-primary-700 truncate">₹{s.basePrice}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Base Price</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs sm:text-sm font-800 text-slate-800 truncate">{s.duration}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Duration</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs sm:text-sm font-800 text-slate-800 truncate">{s.bookingsCount}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Bookings</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setSelected(s); setViewOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-slate-200 text-xs font-700 text-slate-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-all"
                  >
                    <Eye size={13} /> Details
                  </button>
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-primary-50 text-xs font-700 text-primary-700 hover:bg-primary-100 transition-all"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(s.id)}
                    className="w-9 h-8 flex items-center justify-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-all shrink-0"
                    title="Delete Service"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ── Service Detail View Modal ── */}
      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title={selected?.title ?? 'Service Details'} size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-r from-primary-700 to-primary-500 text-white">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                {ICON_MAP[selected.icon] ?? <Wind size={24} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base sm:text-lg font-800 truncate">{selected.title}</p>
                <p className="text-xs text-primary-200 truncate">{selected.category} · {selected.duration}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-600 uppercase">Base Price</p>
                <p className="text-sm sm:text-base font-800 text-slate-900 mt-0.5">₹{selected.basePrice}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-600 uppercase">Duration</p>
                <p className="text-sm sm:text-base font-800 text-slate-900 mt-0.5">{selected.duration}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-600 uppercase">Total Bookings</p>
                <p className="text-sm sm:text-base font-800 text-slate-900 mt-0.5">{selected.bookingsCount}</p>
              </div>
            </div>

            {selected.image && (
              <div>
                <p className="text-xs font-700 text-slate-500 uppercase tracking-wider mb-1.5">Service Cover Image</p>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-700 text-slate-500 uppercase tracking-wider mb-1">Description</p>
              <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">{selected.description}</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                className="btn-primary flex-1 justify-center"
                onClick={() => { setViewOpen(false); handleOpenEdit(selected); }}
              >
                Edit Service
              </button>
              <button className="btn-secondary justify-center px-5" onClick={() => setViewOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Add Service Modal ── */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Service" size="md">
        <div className="space-y-4">
          <div>
            <label className="form-label">Service Title</label>
            <input
              type="text"
              placeholder="e.g. Premium Filter Cleaning"
              className="input-field"
              value={form.title || ''}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Base Price (₹)</label>
              <input
                type="number"
                placeholder="499"
                className="input-field"
                value={form.basePrice || ''}
                onChange={e => setForm(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="form-label">Duration</label>
              <input
                type="text"
                placeholder="1-2 hrs"
                className="input-field"
                value={form.duration || ''}
                onChange={e => setForm(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Category</label>
              <select
                className="input-field"
                value={form.category || 'AC Service / Cleaning'}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
              >
                {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Icon</label>
              <select
                className="input-field"
                value={form.icon || 'Wrench'}
                onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))}
              >
                {Object.keys(ICON_MAP).map(key => <option key={key} value={key}>{key}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Service Cover Image</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="service-image-add"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              <label
                htmlFor="service-image-add"
                className="btn-secondary cursor-pointer py-2 px-3 text-xs flex items-center gap-1.5"
              >
                {uploadingImage ? 'Uploading...' : 'Choose Image'}
              </label>
              {form.image && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                  <img src={form.image} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                    className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[10px]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              placeholder="Service description..."
              className="input-field resize-none"
              value={form.description || ''}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1 justify-center" onClick={handleAdd} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : 'Create Service'}
            </button>
            <button className="btn-secondary justify-center px-5" onClick={() => setAddOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* ── Edit Service Modal ── */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title={`Edit Service — ${selected?.title}`} size="md">
        <div className="space-y-4">
          <div>
            <label className="form-label">Service Title</label>
            <input
              type="text"
              className="input-field"
              value={form.title || ''}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Base Price (₹)</label>
              <input
                type="number"
                className="input-field"
                value={form.basePrice || ''}
                onChange={e => setForm(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="form-label">Duration</label>
              <input
                type="text"
                className="input-field"
                value={form.duration || ''}
                onChange={e => setForm(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Category</label>
              <select
                className="input-field"
                value={form.category || 'AC Service / Cleaning'}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
              >
                {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Icon</label>
              <select
                className="input-field"
                value={form.icon || 'Wrench'}
                onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))}
              >
                {Object.keys(ICON_MAP).map(key => <option key={key} value={key}>{key}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Service Cover Image</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="service-image-edit"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              <label
                htmlFor="service-image-edit"
                className="btn-secondary cursor-pointer py-2 px-3 text-xs flex items-center gap-1.5"
              >
                {uploadingImage ? 'Uploading...' : 'Choose Image'}
              </label>
              {form.image && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                  <img src={form.image} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                    className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[10px]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              className="input-field resize-none"
              value={form.description || ''}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1 justify-center" onClick={handleEdit} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
            </button>
            <button className="btn-secondary justify-center px-5" onClick={() => setEditOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Service" size="sm">
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
            <AlertTriangle size={26} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-800 text-slate-900">Are you sure you want to delete this service?</p>
            <p className="text-xs text-slate-400 mt-1">This service catalog item will be permanently removed.</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-danger flex-1 justify-center" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Delete'}
            </button>
            <button className="btn-secondary flex-1 justify-center" onClick={() => setDeleteId(null)}>Cancel</button>
          </div>
        </div>
      </Modal>

    </DashboardLayout>
  );
}

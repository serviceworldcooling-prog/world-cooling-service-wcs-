'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import SearchFilter from '@/components/SearchFilter';
import Modal from '@/components/Modal';
import { getOffers, createOffer, updateOffer, deleteOffer } from '@/lib/api';
import {
  Tag, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Calendar, Percent, IndianRupee, Image as ImageIcon, Eye, AlertTriangle, Loader2
} from 'lucide-react';

interface Offer {
  id: string;
  _id: string;
  title: string;
  code: string;
  discount: number;
  discountType: 'percent' | 'flat';
  description: string;
  expiry: string;
  usageCount: number;
  maxUsage: number;
  isActive: boolean;
  minOrderValue: number;
  imageUrl?: string;
}

const emptyOffer = (): Partial<Offer> => ({
  title: '',
  code: '',
  discount: 0,
  discountType: 'percent',
  description: '',
  expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
  maxUsage: 1000,
  isActive: true,
  minOrderValue: 0,
  imageUrl: '',
});

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [form, setForm] = useState<Partial<Offer>>(emptyOffer());

  const loadOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await getOffers();
      const fetchedOffers: Offer[] = (res?.data?.offers ?? []).map((o: any) => ({
        ...o,
        id: o._id,
      }));
      setOffers(fetchedOffers);
    } catch (err: any) {
      setError(err.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleToggleActive = async (offer: Offer) => {
    try {
      const updatedStatus = !offer.isActive;
      // Optimistic update
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, isActive: updatedStatus } : o));
      await updateOffer(offer.id, { isActive: updatedStatus });
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
      // Revert
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, isActive: offer.isActive } : o));
    }
  };

  const handleOpenAdd = () => {
    setForm(emptyOffer());
    setAddOpen(true);
  };

  const handleOpenEdit = (o: Offer) => {
    setSelected(o);
    // Format expiry date string for input type="date"
    const formattedExpiry = o.expiry ? new Date(o.expiry).toISOString().split('T')[0] : '';
    setForm({
      ...o,
      expiry: formattedExpiry,
    });
    setEditOpen(true);
  };

  // Convert uploaded image to base64 Data URL
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = async () => {
    if (!form.title || !form.code || form.discount === undefined) {
      alert('Please fill out all required fields.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createOffer(form);
      await loadOffers();
      setAddOpen(false);
    } catch (err: any) {
      setError(err.message || 'Unable to create offer');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    if (!form.title || !form.code || form.discount === undefined) {
      alert('Please fill out all required fields.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateOffer(selected.id, form);
      await loadOffers();
      setEditOpen(false);
    } catch (err: any) {
      setError(err.message || 'Unable to update offer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteOffer(deleteId);
      setOffers(prev => prev.filter(o => o.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      setError(err.message || 'Unable to delete offer');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = offers.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch = o.title.toLowerCase().includes(q) || o.code.toLowerCase().includes(q) || o.description.toLowerCase().includes(q);
    const matchesType = !filter || o.discountType === filter;
    return matchesSearch && matchesType;
  });

  const activeCount = offers.filter(o => o.isActive && new Date(o.expiry) >= new Date()).length;

  return (
    <DashboardLayout title="Offers & Promo Codes" subtitle="Manage dynamic campaigns, seasonal promo codes, and customer discount banners">
      
      {/* ── Summary Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
        {[
          { label: 'Total Campaigns', value: offers.length, color: 'text-teal-700', bg: 'bg-teal-50' },
          { label: 'Active Codes', value: activeCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inactive / Expired', value: offers.length - activeCount, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Avg Discount', value: offers.length ? `${Math.round(offers.reduce((acc, o) => acc + o.discount, 0) / offers.length)}${offers[0]?.discountType === 'percent' ? '%' : ''}` : 'N/A', color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/70 shadow-card min-w-0">
            <p className="text-[10px] sm:text-xs font-600 text-slate-500 truncate mb-0.5 sm:mb-1">{label}</p>
            <p className={`text-lg sm:text-2xl font-800 leading-tight ${color} truncate`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Main Card Container (Touched Left & Right on Mobile) ── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden">
        
        {/* Toolbar Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50">
          <SearchFilter
            searchValue={search}
            onSearch={setSearch}
            placeholder="Search campaigns by title or coupon code…"
            filterOptions={[
              { value: 'percent', label: 'Percentage Off' },
              { value: 'flat', label: 'Flat Amount Off' }
            ]}
            filterValue={filter}
            onFilter={setFilter}
            filterLabel="Discount Type"
            rightSlot={
              <button onClick={handleOpenAdd} className="btn-primary py-2 px-3.5 text-xs gap-1.5 font-700 rounded-xl whitespace-nowrap shadow-sm">
                <Plus size={15} /> Add Offer
              </button>
            }
          />
        </div>

        {/* Offers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-5 p-3.5 sm:p-5">
          {loading ? (
            <div className="col-span-full rounded-2xl border border-slate-100 bg-slate-50 p-12 text-center text-slate-400">
              <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
              <p className="text-xs font-600">Loading promotional campaigns from database...</p>
            </div>
          ) : error ? (
            <div className="col-span-full rounded-2xl border border-rose-100 bg-rose-50 p-8 text-center text-rose-600 text-xs font-700">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-100 bg-slate-50 p-12 text-center text-slate-400 text-xs font-600">
              No promotional campaigns found. Click "+ Add Offer" to create one.
            </div>
          ) : filtered.map((o) => {
            const isExpired = new Date(o.expiry) < new Date();
            const displayDiscount = o.discountType === 'percent' ? `${o.discount}%` : `₹${o.discount}`;
            
            return (
              <div key={o.id} className={`rounded-2xl border p-0 overflow-hidden transition-all duration-300 hover:shadow-card-hover relative group flex flex-col justify-between
                ${o.isActive && !isExpired ? 'border-slate-200/80 bg-white' : 'border-slate-200/80 bg-slate-50/90 opacity-80'}`}>
                
                {/* Banner Image */}
                <div className="w-full h-32 sm:h-36 bg-slate-100 relative">
                  {o.imageUrl ? (
                    <img src={o.imageUrl} alt={o.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white font-800 text-base sm:text-lg uppercase tracking-wider">
                      {o.code}
                    </div>
                  )}

                  {/* Active Toggle Overlay */}
                  <button
                    onClick={() => handleToggleActive(o)}
                    className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur shadow-sm p-1 rounded-xl text-slate-700 hover:text-teal-700 transition-colors"
                    title={o.isActive ? 'Disable Offer' : 'Enable Offer'}
                  >
                    {o.isActive
                      ? <ToggleRight size={26} className="text-teal-700" />
                      : <ToggleLeft size={26} className="text-slate-400" />
                    }
                  </button>

                  <span className="absolute bottom-2.5 left-2.5 bg-teal-800 text-white font-800 text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    {displayDiscount} OFF
                  </span>
                </div>

                {/* Offer details */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-800 text-[10px] sm:text-xs text-slate-700 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                        {o.code}
                      </span>
                      {isExpired && (
                        <span className="font-800 text-[10px] text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          EXPIRED
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-800 text-slate-900 mb-1 leading-snug">{o.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{o.description || 'No description provided.'}</p>
                  </div>

                  <div>
                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-left">
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-700">Min Spend</p>
                        <p className="text-xs font-800 text-slate-800">₹{o.minOrderValue}</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-700">Expires</p>
                        <p className="text-xs font-800 text-slate-800">{new Date(o.expiry).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelected(o); setViewOpen(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border border-slate-200 text-xs font-700 text-slate-600 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50 transition-all"
                      >
                        <Eye size={13} /> Details
                      </button>
                      <button
                        onClick={() => handleOpenEdit(o)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-teal-50 text-xs font-700 text-teal-700 border border-teal-200/60 hover:bg-teal-100 transition-all"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(o.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-rose-200/80 text-rose-500 hover:bg-rose-50 transition-all shrink-0"
                        title="Delete Offer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Offer Details Modal ── */}
      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title={selected?.title ?? 'Campaign Details'} size="md">
        {selected && (
          <div className="space-y-4 pt-1">
            <div className="w-full h-36 sm:h-44 rounded-2xl bg-slate-100 overflow-hidden relative">
              {selected.imageUrl ? (
                <img src={selected.imageUrl} alt={selected.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-700 to-slate-900 text-white font-800 text-xl uppercase tracking-wider">
                  {selected.code}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-700">Coupon Code</p>
                <p className="text-xs sm:text-sm font-800 text-slate-800 uppercase font-mono">{selected.code}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-700">Discount</p>
                <p className="text-xs sm:text-sm font-800 text-teal-700">{selected.discountType === 'percent' ? `${selected.discount}%` : `₹${selected.discount}`}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-700">Min Order</p>
                <p className="text-xs sm:text-sm font-800 text-slate-800">₹{selected.minOrderValue}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-700">Redemptions</p>
                <p className="text-xs sm:text-sm font-800 text-slate-800">{selected.usageCount} / {selected.maxUsage}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-800 text-slate-400 uppercase tracking-wider mb-1">Description & Terms</p>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">{selected.description || 'No description provided.'}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-100">
              <button
                className="btn-primary flex-1 justify-center py-2.5 text-xs rounded-xl"
                onClick={() => { setViewOpen(false); handleOpenEdit(selected); }}
              >
                Edit Campaign
              </button>
              <button className="btn-secondary justify-center py-2.5 px-6 text-xs rounded-xl" onClick={() => setViewOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Add Offer Modal ── */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Campaign" size="md">
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Campaign Title *</label>
              <input
                type="text"
                placeholder="e.g. Summer Special"
                className="input-field text-xs"
                value={form.title || ''}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Coupon Code *</label>
              <input
                type="text"
                placeholder="e.g. SUMMER15"
                className="input-field uppercase text-xs font-mono"
                value={form.code || ''}
                onChange={e => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="form-label">Discount Value *</label>
              <input
                type="number"
                placeholder="15"
                className="input-field text-xs"
                value={form.discount || ''}
                onChange={e => setForm(prev => ({ ...prev, discount: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="form-label">Discount Type *</label>
              <select
                className="input-field text-xs"
                value={form.discountType || 'percent'}
                onChange={e => setForm(prev => ({ ...prev, discountType: e.target.value as any }))}
              >
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Min Spend (₹)</label>
              <input
                type="number"
                placeholder="0"
                className="input-field text-xs"
                value={form.minOrderValue || ''}
                onChange={e => setForm(prev => ({ ...prev, minOrderValue: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Expiry Date *</label>
              <input
                type="date"
                className="input-field text-xs"
                value={form.expiry || ''}
                onChange={e => setForm(prev => ({ ...prev, expiry: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Usage Limit (Max)</label>
              <input
                type="number"
                placeholder="1000"
                className="input-field text-xs"
                value={form.maxUsage || ''}
                onChange={e => setForm(prev => ({ ...prev, maxUsage: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Upload Banner Image</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="add-banner-file"
                onChange={handleImageChange}
              />
              <label
                htmlFor="add-banner-file"
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-700 text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <ImageIcon size={14} /> Choose File
              </label>
              {form.imageUrl && (
                <div className="w-12 h-12 rounded-lg border border-slate-100 overflow-hidden relative">
                  <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              rows={2}
              placeholder="Campaign rules, terms and conditions..."
              className="input-field text-xs resize-none"
              value={form.description || ''}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button className="btn-primary flex-1 justify-center py-2.5 text-xs rounded-xl" onClick={handleAdd} disabled={saving}>
              {saving ? 'Creating...' : 'Create Campaign'}
            </button>
            <button className="btn-secondary justify-center py-2.5 px-5 text-xs rounded-xl" onClick={() => setAddOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* ── Edit Offer Modal ── */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title={`Edit Campaign — ${selected?.title}`} size="md">
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Campaign Title *</label>
              <input
                type="text"
                className="input-field text-xs"
                value={form.title || ''}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Coupon Code *</label>
              <input
                type="text"
                className="input-field uppercase text-xs font-mono"
                value={form.code || ''}
                onChange={e => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="form-label">Discount Value *</label>
              <input
                type="number"
                className="input-field text-xs"
                value={form.discount || ''}
                onChange={e => setForm(prev => ({ ...prev, discount: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="form-label">Discount Type *</label>
              <select
                className="input-field text-xs"
                value={form.discountType || 'percent'}
                onChange={e => setForm(prev => ({ ...prev, discountType: e.target.value as any }))}
              >
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Min Spend (₹)</label>
              <input
                type="number"
                className="input-field text-xs"
                value={form.minOrderValue || ''}
                onChange={e => setForm(prev => ({ ...prev, minOrderValue: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Expiry Date *</label>
              <input
                type="date"
                className="input-field text-xs"
                value={form.expiry || ''}
                onChange={e => setForm(prev => ({ ...prev, expiry: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Usage Limit (Max)</label>
              <input
                type="number"
                className="input-field text-xs"
                value={form.maxUsage || ''}
                onChange={e => setForm(prev => ({ ...prev, maxUsage: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Upload Banner Image</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="edit-banner-file"
                onChange={handleImageChange}
              />
              <label
                htmlFor="edit-banner-file"
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-700 text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <ImageIcon size={14} /> Choose File
              </label>
              {form.imageUrl && (
                <div className="w-12 h-12 rounded-lg border border-slate-100 overflow-hidden relative">
                  <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              rows={2}
              className="input-field text-xs resize-none"
              value={form.description || ''}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button className="btn-primary flex-1 justify-center py-2.5 text-xs rounded-xl" onClick={handleEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="btn-secondary justify-center py-2.5 px-5 text-xs rounded-xl" onClick={() => setEditOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Campaign" size="sm">
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-500">
            <AlertTriangle size={26} />
          </div>
          <div>
            <p className="text-sm font-800 text-slate-900">Are you sure you want to delete this campaign?</p>
            <p className="text-xs text-slate-400 mt-1">This campaign code and banner will be permanently removed.</p>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button className="btn-danger flex-1 justify-center py-2.5 text-xs" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Campaign'}
            </button>
            <button className="btn-secondary flex-1 justify-center py-2.5 text-xs" onClick={() => setDeleteId(null)}>Cancel</button>
          </div>
        </div>
      </Modal>

    </DashboardLayout>
  );
}

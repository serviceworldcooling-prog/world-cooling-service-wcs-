'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Badge from '@/components/Badge';
import SearchFilter from '@/components/SearchFilter';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import {
  getWorkChecklistAdmin,
  createWorkChecklistAdmin,
  updateWorkChecklistAdmin,
  deleteWorkChecklistAdmin,
} from '@/lib/api';
import {
  CheckSquare, Plus, Edit3, Trash2, Loader2, RefreshCw,
  SlidersHorizontal, ToggleLeft, ToggleRight, Sparkles, AlertTriangle, Layers
} from 'lucide-react';

const CATEGORIES = ['Servicing', 'Repair', 'Installation', 'Replacement', 'Electrical', 'General'];

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));

export default function WorkChecklistPage() {
  const { success, error: toastError, info } = useToast();

  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Servicing');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await getWorkChecklistAdmin(search, categoryFilter);
      const data = res?.data ?? [];
      setItems(data);
    } catch (e: any) {
      toastError('Failed to load checklist options', e?.message);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    info('Refreshed', 'Checklist items are up to date');
  };

  const openAddModal = () => {
    setTitle('');
    setCategory('Servicing');
    setDisplayOrder(String(items.length + 1));
    setIsActive(true);
    setAddModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setTitle(item.title);
    setCategory(item.category || 'Servicing');
    setDisplayOrder(String(item.displayOrder ?? 0));
    setIsActive(Boolean(item.isActive));
    setEditModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toastError('Validation Error', 'Title is required');
      return;
    }

    setSaving(true);
    try {
      await createWorkChecklistAdmin({
        title: title.trim(),
        category,
        isActive,
        displayOrder: Number(displayOrder) || 0,
      });
      success('Work Option Added', `"${title}" has been added to the technician checklist.`);
      setAddModalOpen(false);
      loadData();
    } catch (e: any) {
      toastError('Create Failed', e?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !title.trim()) return;

    setSaving(true);
    try {
      await updateWorkChecklistAdmin(selectedItem._id, {
        title: title.trim(),
        category,
        isActive,
        displayOrder: Number(displayOrder) || 0,
      });
      success('Work Option Updated', `"${title}" has been updated.`);
      setEditModalOpen(false);
      setSelectedItem(null);
      loadData();
    } catch (e: any) {
      toastError('Update Failed', e?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: any) => {
    try {
      const nextState = !item.isActive;
      await updateWorkChecklistAdmin(item._id, { isActive: nextState });
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, isActive: nextState } : i))
      );
      success(
        nextState ? 'Option Enabled' : 'Option Disabled',
        `"${item.title}" is now ${nextState ? 'active' : 'inactive'} in engineer app.`
      );
    } catch (e: any) {
      toastError('Status Toggle Failed', e?.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await deleteWorkChecklistAdmin(deleteId);
      success('Option Deleted', 'Work checklist item removed successfully.');
      setDeleteId(null);
      loadData();
    } catch (e: any) {
      toastError('Delete Failed', e?.message);
    } finally {
      setSaving(false);
    }
  };

  // Stats
  const activeCount = items.filter((i) => i.isActive).length;
  const categoriesCount = new Set(items.map((i) => i.category)).size;

  return (
    <DashboardLayout
      title="Work Report Checklist"
      subtitle="Manage dynamic checklist items for serviceman work reports (Select all that apply)"
    >
      {/* ── KPI Stat Overview ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/70 shadow-card flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center shrink-0">
            <CheckSquare size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-[11px] font-700 text-slate-400 uppercase tracking-wider truncate">Total Options</p>
            <p className="text-lg sm:text-2xl font-800 text-slate-900 leading-tight truncate">{items.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/70 shadow-card flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-[11px] font-700 text-slate-400 uppercase tracking-wider truncate">Active in App</p>
            <p className="text-lg sm:text-2xl font-800 text-slate-900 leading-tight truncate">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/70 shadow-card flex items-center gap-2.5 sm:gap-3.5 min-w-0 col-span-2 sm:col-span-1">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200/60 flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-[11px] font-700 text-slate-400 uppercase tracking-wider truncate">Categories</p>
            <p className="text-lg sm:text-2xl font-800 text-slate-900 leading-tight truncate">{categoriesCount}</p>
          </div>
        </div>
      </div>

      {/* ── Main Data Card Container (Touched Left & Right on Mobile) ── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden">
        {/* Toolbar Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-800 text-slate-900 tracking-tight">Checklist Options Roster</h2>
              <span className="text-[11px] font-700 text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                {items.length} items
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-secondary py-2 px-3 text-xs gap-1.5 shrink-0 rounded-xl"
                title="Refresh Checklist"
              >
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button 
                onClick={openAddModal} 
                className="btn-primary py-2 px-3.5 text-xs gap-1.5 font-700 rounded-xl whitespace-nowrap shadow-sm flex-1 sm:flex-initial justify-center"
              >
                <Plus size={15} /> Add Work Option
              </button>
            </div>
          </div>

          <SearchFilter
            searchValue={search}
            onSearch={(v) => setSearch(v)}
            placeholder="Search work title, e.g. Gas Charging, PCB Repair..."
            filterOptions={CATEGORY_OPTIONS}
            filterValue={categoryFilter}
            onFilter={(v) => setCategoryFilter(v)}
            filterLabel="Category"
          />
        </div>

        {/* ── Desktop Table View (Hidden on Mobile) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80">
                <th className="px-5 py-3.5 text-[11px] font-800 text-slate-500 uppercase tracking-wider w-16">Order</th>
                <th className="px-5 py-3.5 text-[11px] font-800 text-slate-500 uppercase tracking-wider">Work Title</th>
                <th className="px-5 py-3.5 text-[11px] font-800 text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3.5 text-[11px] font-800 text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-5 py-3.5 text-[11px] font-800 text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
                    <p className="text-xs text-slate-400 font-500">Loading checklist options…</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <CheckSquare size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-700 text-slate-700">No work options found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click "+ Add Work Option" to create one</p>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors duration-150">
                    <td className="px-5 py-3.5">
                      <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 text-xs font-800 flex items-center justify-center border border-slate-200/60">
                        {item.displayOrder ?? idx + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white font-800 text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {item.title[0]}
                        </div>
                        <p className="text-xs font-800 text-slate-900">{item.title}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-700 bg-sky-50 text-sky-700 border border-sky-200/60">
                        {item.category || 'Servicing'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className="inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                        title={item.isActive ? 'Click to Disable' : 'Click to Enable'}
                      >
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-700 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active in App
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-700 text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Disabled
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                          title="Edit Option"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item._id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Option"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card View (< md screens, Touched Edge-to-Edge) ── */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
              <p className="text-xs text-slate-400 font-500">Loading checklist options…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No work options found</div>
          ) : (
            items.map((item, idx) => (
              <div key={item._id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                
                {/* Header: Order, Title & Category */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 text-xs font-800 flex items-center justify-center border border-slate-200/60 shrink-0 mt-0.5">
                      {item.displayOrder ?? idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-800 text-slate-900 leading-snug break-words">{item.title}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-700 bg-sky-50 text-sky-700 border border-sky-200/60">
                        {item.category || 'Servicing'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer: Toggle Active Status + Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className="inline-flex items-center gap-1 cursor-pointer"
                  >
                    {item.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-700 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active in App
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-700 text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Disabled
                      </span>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="btn-secondary text-xs py-1 px-3 gap-1"
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(item._id)}
                      className="bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-xs font-700 py-1 px-2.5 rounded-xl transition-all flex items-center justify-center"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ADD WORK OPTION MODAL
      ════════════════════════════════════════════════════════════════ */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Work Checklist Option" size="md">
        <form onSubmit={handleCreate} className="space-y-4 pt-1">
          <div>
            <label className="block text-[11px] font-700 text-slate-500 uppercase tracking-wider mb-1.5">
              Work Title / Action Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jet Pump Outdoor Cleaning, Capacitor Replace"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-700 text-slate-500 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-700 text-slate-500 uppercase tracking-wider mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <p className="text-xs font-800 text-slate-900">Active in Serviceman App</p>
              <p className="text-[11px] text-slate-400">If enabled, engineers will see this item in Work Report</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className="text-slate-600 hover:text-slate-900"
            >
              {isActive ? <ToggleRight size={32} className="text-teal-600" /> : <ToggleLeft size={32} className="text-slate-300" />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" className="btn-secondary py-2.5 text-xs justify-center" onClick={() => setAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary py-2.5 text-xs justify-center">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={15} />}
              {saving ? 'Creating…' : 'Create Option'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ════════════════════════════════════════════════════════════════
          EDIT WORK OPTION MODAL
      ════════════════════════════════════════════════════════════════ */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Work Option" size="md">
        <form onSubmit={handleUpdate} className="space-y-4 pt-1">
          <div>
            <label className="block text-[11px] font-700 text-slate-500 uppercase tracking-wider mb-1.5">
              Work Title / Action Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-700 text-slate-500 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-700 text-slate-500 uppercase tracking-wider mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <p className="text-xs font-800 text-slate-900">Active in Serviceman App</p>
              <p className="text-[11px] text-slate-400">If enabled, engineers will see this item in Work Report</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className="text-slate-600 hover:text-slate-900"
            >
              {isActive ? <ToggleRight size={32} className="text-teal-600" /> : <ToggleLeft size={32} className="text-slate-300" />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" className="btn-secondary py-2.5 text-xs justify-center" onClick={() => setEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary py-2.5 text-xs justify-center">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Edit3 size={15} />}
              {saving ? 'Updating…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ════════════════════════════════════════════════════════════════
          DELETE CONFIRM MODAL
      ════════════════════════════════════════════════════════════════ */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Work Option" size="sm">
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-500">
            <AlertTriangle size={26} />
          </div>
          <div>
            <p className="text-sm font-800 text-slate-900">Delete this checklist option?</p>
            <p className="text-xs text-slate-400 mt-1">Servicemen will no longer see this option when submitting new work reports.</p>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button className="btn-secondary flex-1 justify-center py-2.5 text-xs" onClick={() => setDeleteId(null)}>
              Cancel
            </button>
            <button className="btn-danger flex-1 justify-center py-2.5 text-xs" onClick={handleDelete} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {saving ? 'Deleting…' : 'Delete Option'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

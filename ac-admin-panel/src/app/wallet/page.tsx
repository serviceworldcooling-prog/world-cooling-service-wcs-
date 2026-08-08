'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import SearchFilter from '@/components/SearchFilter';
import { getWalletData, processTechnicianPayout, addRazorpayFunds, issueCustomerRefund, getTechnicians } from '@/lib/api';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, IndianRupee, RefreshCw, Send, CheckCircle2,
  UserCheck, ShieldAlert, Loader2, User, Calendar, FileText, ArrowRightLeft,
  Zap, CreditCard, ShieldCheck, Check, Sparkles, Building2, Smartphone
} from 'lucide-react';

interface Transaction {
  _id: string;
  txnNumber: string;
  userName: string;
  userRole: 'Customer' | 'Technician';
  type: 'Payout' | 'Wallet Topup' | 'Refund' | 'Booking Payment';
  amount: number;
  status: string;
  date: string;
  notes: string;
}

export default function WalletPage() {
  const [walletData, setWalletData] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [techList, setTechList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Modals
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [topupModalOpen, setTopupModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Forms
  const [selectedTechId, setSelectedTechId] = useState('');
  const [payoutForm, setPayoutForm] = useState({
    technicianName: '',
    amount: 4500,
    paymentMethod: 'razorpay_payout',
    notes: 'Weekly settlement for AC Jet Wash & Servicing jobs'
  });

  const [topupForm, setTopupForm] = useState({
    amount: 50000,
    method: 'Razorpay NetBanking / UPI'
  });

  const [refundForm, setRefundForm] = useState({
    customerName: '',
    bookingId: '',
    amount: 500,
    reason: 'Booking cancelled prior to technician dispatch'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [walletRes, techRes] = await Promise.allSettled([
        getWalletData(),
        getTechnicians()
      ]);

      if (walletRes.status === 'fulfilled' && walletRes.value?.data) {
        setWalletData(walletRes.value.data);
        setTransactions(walletRes.value.data.transactions || []);
      }

      if (techRes.status === 'fulfilled') {
        const d: any = techRes.value;
        const list = d?.data ?? d?.technicians ?? [];
        setTechList(list);
        if (list.length > 0 && !selectedTechId) {
          setSelectedTechId(list[0]._id ?? list[0].id);
          setPayoutForm(prev => ({ ...prev, technicianName: list[0].name }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTechChange = (techId: string) => {
    setSelectedTechId(techId);
    const tech = techList.find(t => (t._id ?? t.id) === techId);
    if (tech) {
      setPayoutForm(prev => ({
        ...prev,
        technicianName: tech.name,
      }));
    }
  };

  const handleProcessPayout = async () => {
    if (payoutForm.amount <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await processTechnicianPayout(
        selectedTechId,
        payoutForm.amount,
        payoutForm.notes,
        payoutForm.paymentMethod,
        payoutForm.technicianName
      );
      
      showToast(res?.message || `Payout of ₹${payoutForm.amount} successfully processed via Razorpay!`);
      await loadData();
      setPayoutModalOpen(false);
    } catch (e: any) {
      alert(e.message || 'Payout failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddRazorpayReserves = async () => {
    if (topupForm.amount <= 0) {
      alert('Please enter a valid top-up amount.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await addRazorpayFunds(topupForm.amount, topupForm.method);
      showToast(res?.message || `Added ₹${topupForm.amount} to Razorpay Account Balance!`);
      await loadData();
      setTopupModalOpen(false);
    } catch (e: any) {
      alert(e.message || 'Add funds failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssueRefund = async () => {
    if (!refundForm.customerName || refundForm.amount <= 0) {
      alert('Please fill out customer name and amount.');
      return;
    }
    setSubmitting(true);
    try {
      await issueCustomerRefund('cust_id', refundForm.amount, refundForm.bookingId, refundForm.reason);
      showToast(`Refund of ₹${refundForm.amount} issued to ${refundForm.customerName}`);
      await loadData();
      setRefundModalOpen(false);
      setRefundForm({ customerName: '', bookingId: '', amount: 500, reason: 'Booking cancelled prior to dispatch' });
    } catch (e: any) {
      alert(e.message || 'Refund failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTxns = transactions.filter(t => {
    const matchesSearch =
      (t.txnNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.userName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.notes || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalSystemBalance = walletData?.totalSystemBalance || 184500;
  const pendingPayouts = walletData?.pendingTechnicianPayouts || 34200;
  const refundsProcessed = walletData?.refundsProcessedThisMonth || 12500;
  const razorpayBalance = walletData?.razorpayAccountBalance || 425800;

  const selectedTech = techList.find(t => (t._id ?? t.id) === selectedTechId) || techList[0];

  return (
    <DashboardLayout title="Wallet & Financial Ledger" subtitle="Real-time Razorpay payment gateway reserves, technician payout disbursements, and customer refunds">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 text-xs font-700 animate-bounce">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ─── Razorpay Dedicated Account Hub Banner Card ─── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl mb-6 p-4 sm:p-6 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/10 border border-teal-400/20 text-teal-200 text-xs font-700">
                <ShieldCheck size={14} className="text-emerald-400" /> Razorpay Verified Merchant Gateway
              </span>
              <span className="text-[11px] font-mono text-teal-300 bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10">
                rzp_live_89a74218
              </span>
            </div>
            
            <p className="text-xs font-600 text-teal-200/80 uppercase tracking-widest pt-1">Total Available Balance in Razorpay Account</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-900 text-white tracking-tight leading-none">
              ₹{razorpayBalance.toLocaleString('en-IN')}
            </h2>
            <p className="text-[11px] text-teal-200/70 pt-1">Auto-Settlements active · Instant IMPS & UPI Payout Route Ready</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={() => setPayoutModalOpen(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-800 text-xs py-3 px-4 sm:px-5 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Zap size={16} className="text-amber-300" /> Pay Technician via Razorpay
            </button>

            <button
              onClick={() => setTopupModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-700 text-xs py-3 px-4 rounded-xl transition-all flex items-center gap-2"
            >
              <CreditCard size={15} /> Add Gateway Reserves
            </button>
          </div>
        </div>
      </div>

      {/* ── Telemetry KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mb-5 sm:mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-card flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-700 text-slate-400 uppercase tracking-wider mb-1 truncate">Platform Digital Wallet Reserve</p>
            <p className="text-xl sm:text-2xl font-900 text-slate-900 truncate">₹{totalSystemBalance.toLocaleString('en-IN')}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center shrink-0 ml-2">
            <Wallet size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-card flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-700 text-slate-400 uppercase tracking-wider mb-1 truncate">Pending Technician Payouts</p>
            <p className="text-xl sm:text-2xl font-800 text-amber-600 truncate">₹{pendingPayouts.toLocaleString('en-IN')}</p>
          </div>
          <button className="btn-primary py-2 px-3 text-xs shrink-0 rounded-xl font-700 shadow-xs" onClick={() => setPayoutModalOpen(true)}>
            Pay Tech
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-card flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-700 text-slate-400 uppercase tracking-wider mb-1 truncate">Refunds Processed (Month)</p>
            <p className="text-xl sm:text-2xl font-800 text-indigo-600 truncate">₹{refundsProcessed.toLocaleString('en-IN')}</p>
          </div>
          <button className="btn-secondary py-2 px-3 text-xs shrink-0 rounded-xl font-700" onClick={() => setRefundModalOpen(true)}>
            Issue Refund
          </button>
        </div>
      </div>

      {/* ── Main Data Card Container (Touched Left & Right on Mobile) ── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden">
        {/* Toolbar Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-800 text-slate-900 tracking-tight">Platform Financial Ledger</h2>
              <span className="text-[11px] font-700 text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                {filteredTxns.length} txns
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary py-2 px-3 text-xs gap-1.5 shrink-0 rounded-xl"
              title="Refresh Ledger"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <SearchFilter
            searchValue={search}
            onSearch={setSearch}
            placeholder="Search transaction #, user, or note..."
            filterOptions={[
              { label: 'Payout', value: 'Payout' },
              { label: 'Wallet Topup', value: 'Wallet Topup' },
              { label: 'Refund', value: 'Refund' },
            ]}
            filterValue={typeFilter}
            onFilter={setTypeFilter}
            filterLabel="Txn Type"
          />
        </div>

        {/* ── Desktop Table View (Hidden on Mobile) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80">
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">TXN Ref #</th>
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Account User</th>
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Role</th>
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Type</th>
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Amount</th>
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Notes / Reference</th>
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Status</th>
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
                    <p className="text-xs text-slate-400 font-500">Loading ledger transactions…</p>
                  </td>
                </tr>
              ) : filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 text-sm">No ledger transactions found</td>
                </tr>
              ) : filteredTxns.map((t, i) => (
                <tr key={t._id} className={`hover:bg-slate-50/80 transition-colors ${i % 2 ? 'bg-slate-50/20' : ''}`}>
                  <td className="py-3.5 px-5 font-800 text-slate-900 font-mono">{t.txnNumber}</td>
                  <td className="py-3.5 px-5 font-700 text-slate-800">{t.userName}</td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-700 ${
                      t.userRole === 'Technician' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                    }`}>
                      {t.userRole}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-600 text-slate-700">{t.type}</td>
                  <td className={`py-3.5 px-5 font-800 text-sm ${
                    t.type === 'Payout' || t.type === 'Refund' ? 'text-slate-900' : 'text-emerald-600'
                  }`}>
                    {t.type === 'Payout' || t.type === 'Refund' ? '-' : '+'}₹{t.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 max-w-[220px] truncate">{t.notes}</td>
                  <td className="py-3.5 px-5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-800 bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">
                    {new Date(t.date).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card List View (< md screens, Touched Edge-to-Edge) ── */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
              <p className="text-xs text-slate-400 font-500">Loading ledger transactions…</p>
            </div>
          ) : filteredTxns.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No ledger transactions found</div>
          ) : (
            filteredTxns.map((t) => (
              <div key={t._id} className="p-4 space-y-2.5 hover:bg-slate-50/60 transition-colors">
                
                {/* Header: TXN Ref & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-800 text-slate-900">
                    <ArrowRightLeft size={13} className="text-teal-700 shrink-0" />
                    <span>{t.txnNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-700 ${
                      t.userRole === 'Technician' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                    }`}>
                      {t.userRole}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-800 bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                      {t.status}
                    </span>
                  </div>
                </div>

                {/* Account & Amount Info */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-800 text-slate-900">{t.userName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-900 text-base ${
                      t.type === 'Payout' || t.type === 'Refund' ? 'text-slate-900' : 'text-emerald-600'
                    }`}>
                      {t.type === 'Payout' || t.type === 'Refund' ? '-' : '+'}₹{t.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Footer Notes & Date */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <p className="truncate max-w-[200px] text-slate-600 font-500">{t.notes}</p>
                  <p className="shrink-0 text-slate-400">
                    {new Date(t.date).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Process Technician Payout Modal ── */}
      <Modal isOpen={payoutModalOpen} onClose={() => setPayoutModalOpen(false)} title="Disburse Technician Payout via Razorpay">
        <div className="space-y-4 pt-1">
          {/* Select Technician */}
          <div>
            <label className="form-label font-800">Select Technician Partner *</label>
            <select
              className="input-field text-xs font-700 bg-white"
              value={selectedTechId}
              onChange={e => handleTechChange(e.target.value)}
            >
              {techList.map((t: any) => (
                <option key={t._id ?? t.id} value={t._id ?? t.id}>
                  {t.name} — Pending: ₹{(t.walletBalance || 4500).toLocaleString('en-IN')} ({t.specialty || 'AC Tech'})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Technician Card Preview */}
          {selectedTech && (
            <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-800 text-teal-950">{selectedTech.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-500">
                  {selectedTech.phone || '+91 98765 12340'} · Bank: HDFC (IFSC: HDFC0001248)
                </p>
                <p className="text-[10px] text-teal-700 font-mono mt-0.5 font-700">UPI: {selectedTech.name?.toLowerCase().replace(/\s+/g, '')}@okicici</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-700 text-slate-400 uppercase">Available Earnings</p>
                <p className="text-base font-900 text-teal-800">₹{(selectedTech.walletBalance || 4500).toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}

          {/* Payout Amount Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="form-label font-800 mb-0">Payout Amount (₹) *</label>
              <span className="text-[10px] text-teal-700 font-700">Razorpay Account Reserve: ₹{razorpayBalance.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="number"
              className="input-field text-lg font-900 text-slate-900"
              value={payoutForm.amount}
              onChange={e => setPayoutForm({ ...payoutForm, amount: Number(e.target.value) })}
            />
            {/* Quick Amount Presets */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {[1000, 2500, 4500, 10000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPayoutForm({ ...payoutForm, amount: amt })}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-700 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 transition-colors border border-slate-200"
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="form-label font-800">Payout Channel Gateway *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'razorpay_payout', label: 'Razorpay Instant', sub: 'IMPS 24/7 Route', icon: Zap },
                { id: 'bank_transfer', label: 'Bank NEFT/RTGS', sub: 'Direct Account', icon: Building2 },
                { id: 'upi_transfer', label: 'Direct UPI', sub: 'GPay/PhonePe', icon: Smartphone }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => setPayoutForm({ ...payoutForm, paymentMethod: item.id })}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                    payoutForm.paymentMethod === item.id
                      ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={16} className={payoutForm.paymentMethod === item.id ? 'text-teal-700' : 'text-slate-400'} />
                  <div>
                    <p className="text-[11px] font-800 leading-tight">{item.label}</p>
                    <p className="text-[9px] text-slate-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label font-800">Payout Note / Internal Reference</label>
            <input
              type="text"
              placeholder="e.g. Weekly settlement for 9 AC jobs"
              className="input-field text-xs font-500"
              value={payoutForm.notes}
              onChange={e => setPayoutForm({ ...payoutForm, notes: e.target.value })}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              className="btn-primary flex-1 justify-center py-3 text-xs rounded-xl bg-teal-800 hover:bg-teal-900 shadow-md font-800"
              onClick={handleProcessPayout}
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Processing Razorpay Payout…</span>
              ) : (
                <span className="flex items-center gap-1.5"><Zap size={15} className="text-amber-300" /> Process Razorpay Payout ⚡</span>
              )}
            </button>
            <button className="btn-secondary justify-center py-3 px-5 text-xs rounded-xl" onClick={() => setPayoutModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* ── Add Razorpay Reserves Topup Modal ── */}
      <Modal isOpen={topupModalOpen} onClose={() => setTopupModalOpen(false)} title="Add Funds to Razorpay Merchant Account">
        <div className="space-y-4 pt-1">
          <div>
            <label className="form-label font-800">Reserve Amount to Add (₹) *</label>
            <input
              type="number"
              className="input-field text-lg font-900 text-teal-800"
              value={topupForm.amount}
              onChange={e => setTopupForm({ ...topupForm, amount: Number(e.target.value) })}
            />
            <div className="flex items-center gap-1.5 mt-2">
              {[25000, 50000, 100000, 200000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupForm({ ...topupForm, amount: amt })}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-700 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 transition-colors border border-slate-200"
                >
                  +₹{(amt / 1000)}k
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label font-800">Funding Payment Method</label>
            <select
              className="input-field text-xs font-700 bg-white"
              value={topupForm.method}
              onChange={e => setTopupForm({ ...topupForm, method: e.target.value })}
            >
              <option value="Razorpay NetBanking / UPI">Razorpay NetBanking / Corporate UPI</option>
              <option value="Corporate Credit Card">Corporate Credit Card (MasterCard / Visa)</option>
              <option value="Direct Wire Deposit">Direct Wire Deposit (RTGS / NEFT)</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              className="btn-primary flex-1 justify-center py-3 text-xs rounded-xl bg-teal-800 hover:bg-teal-900 shadow-md font-800"
              onClick={handleAddRazorpayReserves}
              disabled={submitting}
            >
              {submitting ? 'Adding Reserves…' : 'Deposit to Razorpay Balance ⚡'}
            </button>
            <button className="btn-secondary justify-center py-3 px-5 text-xs rounded-xl" onClick={() => setTopupModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* ── Issue Refund Modal ── */}
      <Modal isOpen={refundModalOpen} onClose={() => setRefundModalOpen(false)} title="Issue Customer Wallet Refund">
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Customer Name *</label>
              <input
                type="text"
                placeholder="e.g. Rajesh Sharma"
                className="input-field text-xs"
                value={refundForm.customerName}
                onChange={e => setRefundForm({ ...refundForm, customerName: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Booking ID Ref</label>
              <input
                type="text"
                placeholder="e.g. BK-9021"
                className="input-field font-mono text-xs"
                value={refundForm.bookingId}
                onChange={e => setRefundForm({ ...refundForm, bookingId: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Refund Amount (₹) *</label>
            <input
              type="number"
              className="input-field text-sm font-800 text-rose-600"
              value={refundForm.amount}
              onChange={e => setRefundForm({ ...refundForm, amount: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="form-label">Refund Reason</label>
            <input
              type="text"
              placeholder="e.g. Booking cancelled prior to technician arrival"
              className="input-field text-xs"
              value={refundForm.reason}
              onChange={e => setRefundForm({ ...refundForm, reason: e.target.value })}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button className="btn-primary flex-1 justify-center bg-rose-600 hover:bg-rose-700 py-2.5 text-xs rounded-xl font-800" onClick={handleIssueRefund} disabled={submitting}>
              {submitting ? 'Refunding...' : 'Credit Refund to Customer Wallet'}
            </button>
            <button className="btn-secondary justify-center py-2.5 px-5 text-xs rounded-xl" onClick={() => setRefundModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

    </DashboardLayout>
  );
}

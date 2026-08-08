'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import SearchFilter from '@/components/SearchFilter';
import { getWarrantyData, updateWarrantyClaimStatus } from '@/lib/api';
import {
  BadgeCheck, ShieldAlert, Clock, CheckCircle2, Eye, Wrench, Calendar, Sparkles, FileCheck, XCircle,
  Award, ShieldCheck, Printer, Download, QrCode, CheckCircle, Zap, UserCheck, MapPin, Phone, Loader2, FileText, Stamp, Edit3, Upload, Trash2, Image as ImageIcon, Maximize2
} from 'lucide-react';

interface WarrantyCard {
  _id: string;
  warrantyNo: string;
  customerName: string;
  customerPhone?: string;
  address?: string;
  technicianName?: string;
  bookingNo?: string;
  acBrandModel: string;
  serialNo: string;
  acNo?: string;
  modelNo?: string;
  warrantyReason?: string;
  startDate: string;
  endDate: string;
  coverageType: string;
  serviceProvided?: string;
  status: string;
  verificationToken?: string;
  digitalSignature?: string;
  digitalStamp?: string;
}

interface WarrantyClaim {
  _id: string;
  claimNo: string;
  customerName: string;
  warrantyNo: string;
  acBrandModel: string;
  issueDescription: string;
  claimDate: string;
  status: string;
  assignedTechnician: string;
}

const DEFAULT_SIGNATURE_IMG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="280" height="90" viewBox="0 0 280 90"><path d="M 12 55 Q 35 15 60 45 T 105 25 T 150 55 T 195 35 T 240 55 C 250 60 260 40 270 45" stroke="%231E3A8A" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="12" y="80" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="%231E3A8A">Suresh Kumar (Authorized Signatory)</text></svg>`;

const DEFAULT_STAMP_IMG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="64" fill="none" stroke="%23047857" stroke-width="5" stroke-dasharray="5,2"/><circle cx="70" cy="70" r="54" fill="none" stroke="%23047857" stroke-width="2.5"/><path id="stampTextPath" d="M 22,70 A 48,48 0 1,1 118,70 A 48,48 0 1,1 22,70" fill="none"/><text fill="%23047857" font-size="9.5" font-weight="bold" letter-spacing="1.2"><textPath href="%23stampTextPath">AC SERVICE WORLD • OFFICIAL QUALITY SEAL •</textPath></text><polygon points="70,40 77,55 93,55 80,64 85,80 70,70 55,80 60,64 47,55 63,55" fill="%23047857"/><text x="70" y="98" text-anchor="middle" fill="%23047857" font-size="9" font-weight="900">100% VERIFIED</text></svg>`;

export default function WarrantyPage() {
  const [cards, setCards] = useState<WarrantyCard[]>([]);
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'cards' | 'claims'>('cards');
  
  // Selected claim modal
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
  const [claimNotes, setClaimNotes] = useState('');

  // Selected Certificate Modal
  const [certificateCard, setCertificateCard] = useState<WarrantyCard | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Zoom Image Modal State
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);

  // Admin Top Controls: Digital Signature & Digital Stamp (Text + Uploaded Images saved permanently)
  const [adminSignature, setAdminSignatureState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('warranty_admin_signature') || 'Suresh Kumar (Authorized Field Specialist)';
    }
    return 'Suresh Kumar (Authorized Field Specialist)';
  });
  const [signatureImg, setSignatureImgState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('warranty_signature_img') || DEFAULT_SIGNATURE_IMG;
    }
    return DEFAULT_SIGNATURE_IMG;
  });

  const [adminStamp, setAdminStampState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('warranty_admin_stamp') || 'AC SERVICE WORLD VERIFIED QUALITY SEAL';
    }
    return 'AC SERVICE WORLD VERIFIED QUALITY SEAL';
  });
  const [stampImg, setStampImgState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('warranty_stamp_img') || DEFAULT_STAMP_IMG;
    }
    return DEFAULT_STAMP_IMG;
  });

  const setAdminSignature = (val: string) => {
    setAdminSignatureState(val);
    if (typeof window !== 'undefined') localStorage.setItem('warranty_admin_signature', val);
  };

  const setSignatureImg = (val: string | null) => {
    setSignatureImgState(val);
    if (typeof window !== 'undefined') {
      if (val) localStorage.setItem('warranty_signature_img', val);
      else localStorage.removeItem('warranty_signature_img');
    }
  };

  const setAdminStamp = (val: string) => {
    setAdminStampState(val);
    if (typeof window !== 'undefined') localStorage.setItem('warranty_admin_stamp', val);
  };

  const setStampImg = (val: string | null) => {
    setStampImgState(val);
    if (typeof window !== 'undefined') {
      if (val) localStorage.setItem('warranty_stamp_img', val);
      else localStorage.removeItem('warranty_stamp_img');
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setSignatureImg(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setStampImg(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getWarrantyData();
      if (res?.data) {
        setCards(res.data.warrantyCards || []);
        setClaims(res.data.claims || []);
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

  const handleClaimStatus = async (id: string, newStatus: string) => {
    try {
      await updateWarrantyClaimStatus(id, newStatus, claimNotes);
      setClaims(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
      setSelectedClaim(null);
      setClaimNotes('');
    } catch (e: any) {
      alert(e.message || 'Failed to update claim status');
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateCard) return;
    const element = document.getElementById('warranty-certificate-card');
    if (!element) return;

    setDownloadingPdf(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 3, // Ultra-sharp DPI
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: 1280,
        windowHeight: 960,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('warranty-certificate-card');
          if (clonedElement) {
            clonedElement.style.width = '820px';
            clonedElement.style.maxWidth = '820px';
            clonedElement.style.margin = '0 auto';
            clonedElement.style.boxShadow = 'none';
            clonedElement.style.padding = '32px';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;

      const printableWidth = pdfWidth - margin * 2;
      const printableHeight = pdfHeight - margin * 2;

      // Mathematical aspect ratio calculation (ZERO STRETCHING)
      const canvasRatio = canvas.height / canvas.width;

      let renderWidth = printableWidth;
      let renderHeight = renderWidth * canvasRatio;

      if (renderHeight > printableHeight) {
        renderHeight = printableHeight;
        renderWidth = renderHeight / canvasRatio;
      }

      const xPos = (pdfWidth - renderWidth) / 2;
      const yPos = (pdfHeight - renderHeight) / 2;

      pdf.addImage(imgData, 'PNG', xPos, yPos, renderWidth, renderHeight);
      pdf.save(`${certificateCard.warrantyNo}_Official_Warranty_Certificate.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Generating fallback print view...');
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const filteredCards = cards.filter(c =>
    c.warrantyNo.toLowerCase().includes(search.toLowerCase()) ||
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.acBrandModel.toLowerCase().includes(search.toLowerCase()) ||
    c.serialNo.toLowerCase().includes(search.toLowerCase())
  );

  const filteredClaims = claims.filter(c =>
    c.claimNo.toLowerCase().includes(search.toLowerCase()) ||
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.warrantyNo.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = cards.filter(c => c.status === 'Active').length;
  const pendingClaimsCount = claims.filter(c => c.status !== 'Approved' && c.status !== 'Rejected').length;

  return (
    <DashboardLayout title="Warranty Cards & Certificates" subtitle="Track digital service warranty guarantees, component coverage, and official service certificates issued by technicians">
      
      {/* ── Admin Top Control Banner: Digital Signature & Digital Stamp Settings ── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white p-4 sm:p-5 mb-5 sm:mb-6 shadow-card border-y sm:border border-slate-200/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Stamp size={18} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-800 tracking-tight text-slate-900">Certificate Authorization & Image Upload Controls</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Upload official Digital Signature and Digital Stamp images to embed on customer certificates</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] sm:text-[11px] font-700 border border-emerald-200 inline-flex items-center gap-1 shrink-0">
            <CheckCircle2 size={12} /> Live Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-3 border-t border-slate-100">
          
          {/* Digital Signature Box */}
          <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-800 uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <Edit3 size={13} /> Admin Digital Signature
              </label>
              {signatureImg && (
                <button
                  onClick={() => setSignatureImg(null)}
                  className="text-[10px] text-rose-600 hover:text-rose-700 font-700 flex items-center gap-1"
                >
                  <Trash2 size={11} /> Clear Image
                </button>
              )}
            </div>

            <input
              type="text"
              className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs font-600 focus:outline-none focus:border-amber-500 shadow-2xs"
              value={adminSignature}
              onChange={e => setAdminSignature(e.target.value)}
              placeholder="Signatory Name (e.g. Suresh Kumar)"
            />

            {/* Signature Image Upload Field & Preview */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <label className="cursor-pointer px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-700 flex items-center gap-1.5 transition-colors shadow-sm">
                  <Upload size={14} /> {signatureImg ? 'Change Image' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                </label>
                <span className="text-[10px] font-700 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ Active on PDF
                </span>
              </div>

              {signatureImg && (
                <div className="bg-white p-2.5 sm:p-3 rounded-xl border-2 border-amber-300 shadow-sm flex items-center justify-between gap-3 min-h-[64px]">
                  <div className="flex-1 flex flex-col items-center justify-center min-w-0">
                    <p className="text-[9px] font-800 text-slate-400 uppercase tracking-widest mb-1">Active Signature Image</p>
                    <img src={signatureImg} alt="Signature Preview" className="h-10 sm:h-12 max-w-full object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setZoomImage({ url: signatureImg, title: 'Admin Digital Signature Image' })}
                    className="btn-secondary py-1 px-2.5 text-xs gap-1 font-700 text-slate-700 border-slate-200 hover:bg-slate-50 shrink-0 shadow-2xs"
                    title="Zoom / Full View Image"
                  >
                    <Maximize2 size={13} /> View
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Digital Stamp Seal Box */}
          <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-800 uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <Stamp size={13} /> Admin Digital Stamp Seal
              </label>
              {stampImg && (
                <button
                  onClick={() => setStampImg(null)}
                  className="text-[10px] text-rose-600 hover:text-rose-700 font-700 flex items-center gap-1"
                >
                  <Trash2 size={11} /> Clear Image
                </button>
              )}
            </div>

            <input
              type="text"
              className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs font-600 focus:outline-none focus:border-emerald-500 shadow-2xs"
              value={adminStamp}
              onChange={e => setAdminStamp(e.target.value)}
              placeholder="Stamp Title (e.g. AC SERVICE WORLD QUALITY SEAL)"
            />

            {/* Stamp Image Upload Field & Preview */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <label className="cursor-pointer px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-700 flex items-center gap-1.5 transition-colors shadow-sm">
                  <Upload size={14} /> {stampImg ? 'Change Stamp Image' : 'Upload Stamp Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleStampUpload} />
                </label>
                <span className="text-[10px] font-700 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ Active on PDF
                </span>
              </div>

              {stampImg && (
                <div className="bg-white p-2.5 sm:p-3 rounded-xl border-2 border-emerald-300 shadow-sm flex items-center justify-between gap-3 min-h-[64px]">
                  <div className="flex-1 flex flex-col items-center justify-center min-w-0">
                    <p className="text-[9px] font-800 text-slate-400 uppercase tracking-widest mb-1">Active Stamp Seal Image</p>
                    <img src={stampImg} alt="Stamp Preview" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setZoomImage({ url: stampImg, title: 'Admin Digital Stamp Seal Image' })}
                    className="btn-secondary py-1 px-2.5 text-xs gap-1 font-700 text-slate-700 border-slate-200 hover:bg-slate-50 shrink-0 shadow-2xs"
                    title="Zoom / Full View Image"
                  >
                    <Maximize2 size={13} /> View
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
        {[
          { label: 'Active Warranties', value: activeCount, color: 'text-primary-700', bg: 'bg-primary-50', icon: BadgeCheck },
          { label: 'Claims Pending', value: pendingClaimsCount, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
          { label: 'Approved Claims', value: claims.filter(c => c.status === 'Approved').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: 'Certificates Issued', value: cards.length, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: FileCheck },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/70 shadow-card flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-600 text-slate-500 truncate mb-0.5 sm:mb-1">{label}</p>
              <p className={`text-lg sm:text-2xl font-800 leading-tight ${color} truncate`}>{value}</p>
            </div>
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-fit mb-5 sm:mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('cards')}
          className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 rounded-xl text-xs font-700 transition-all whitespace-nowrap ${
            activeTab === 'cards' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Warranty Certificates ({cards.length})
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 rounded-xl text-xs font-700 transition-all whitespace-nowrap ${
            activeTab === 'claims' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Warranty Claims Queue ({claims.length})
        </button>
      </div>

      {/* ── Tab 1: Warranty Cards Container (Touched Left & Right on Mobile) ── */}
      {activeTab === 'cards' && (
        <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/50">
            <SearchFilter
              searchValue={search}
              onSearch={setSearch}
              placeholder="Search warranty #, customer, brand, or serial..."
            />
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-800 uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3.5 px-5">Warranty Card #</th>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">AC Unit & Serial</th>
                  <th className="py-3.5 px-5">Coverage Scope</th>
                  <th className="py-3.5 px-5">Valid Until</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
                      <p className="text-xs text-slate-400 font-600">Loading warranty cards…</p>
                    </td>
                  </tr>
                ) : filteredCards.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">No warranty cards found</td>
                  </tr>
                ) : filteredCards.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-800 text-slate-900 font-mono">{c.warrantyNo}</td>
                    <td className="py-3.5 px-5">
                      <p className="font-700 text-slate-800">{c.customerName}</p>
                      <p className="text-[11px] text-slate-400">{c.customerPhone || '+91 98765 43210'}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-700 text-slate-800">{c.acBrandModel}</p>
                      <p className="text-[11px] text-slate-400 font-mono">AC No: {c.serialNo}</p>
                    </td>
                    <td className="py-3.5 px-5 text-primary-700 font-600">{c.coverageType}</td>
                    <td className="py-3.5 px-5 text-slate-600">{c.endDate}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-800 ${
                        c.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setCertificateCard(c)}
                        className="btn-primary py-1.5 px-3 text-[11px] inline-flex items-center gap-1.5 shadow-sm rounded-xl"
                      >
                        <Award size={13} /> View Certificate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (< md screens, Touched Edge-to-Edge) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
                <p className="text-xs text-slate-400">Loading warranty cards…</p>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No warranty cards found</div>
            ) : (
              filteredCards.map((c) => (
                <div key={c._id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  
                  {/* Top Row: Warranty No & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-primary-700 shrink-0" />
                      <span className="font-800 text-slate-900 font-mono text-xs">{c.warrantyNo}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-800 ${
                      c.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  {/* Customer & Appliance Details Container */}
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-700 text-slate-900">{c.customerName}</span>
                      <span className="text-[11px] text-slate-500">{c.customerPhone || '+91 98765 43210'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                      <span>AC Model: <strong className="text-slate-800">{c.acBrandModel}</strong></span>
                      <span className="font-mono text-[10px] text-slate-500">SN: {c.serialNo}</span>
                    </div>
                  </div>

                  {/* Scope & Date Footer */}
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <div>
                      <p className="text-[10px] text-slate-400 font-700 uppercase">Coverage Scope</p>
                      <p className="font-700 text-primary-700">{c.coverageType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-700 uppercase">Valid Until</p>
                      <p className="font-600 text-slate-800">{c.endDate}</p>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setCertificateCard(c)}
                      className="btn-primary py-1.5 px-3.5 text-xs gap-1.5 w-full justify-center rounded-xl shadow-2xs"
                    >
                      <Award size={14} /> View Certificate
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Tab 2: Warranty Claims Container (Touched Left & Right on Mobile) ── */}
      {activeTab === 'claims' && (
        <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/50">
            <SearchFilter
              searchValue={search}
              onSearch={setSearch}
              placeholder="Search claim #, customer, or warranty ref..."
            />
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-800 uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3.5 px-5">Claim Ref #</th>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Warranty Card</th>
                  <th className="py-3.5 px-5">Issue Description</th>
                  <th className="py-3.5 px-5">Assigned Tech</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
                      <p className="text-xs text-slate-400 font-600">Loading warranty claims…</p>
                    </td>
                  </tr>
                ) : filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">No warranty claims found</td>
                  </tr>
                ) : filteredClaims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-800 text-slate-900 font-mono">{claim.claimNo}</td>
                    <td className="py-3.5 px-5 font-700 text-slate-800">{claim.customerName}</td>
                    <td className="py-3.5 px-5 font-mono text-primary-700 font-700">{claim.warrantyNo}</td>
                    <td className="py-3.5 px-5 text-slate-600 max-w-[250px] truncate">{claim.issueDescription}</td>
                    <td className="py-3.5 px-5 font-600 text-slate-700">{claim.assignedTechnician}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-800 ${
                        claim.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        claim.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedClaim(claim)}
                        className="btn-secondary py-1.5 px-3 text-xs font-700 inline-flex items-center gap-1.5 rounded-xl"
                      >
                        <Eye size={13} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (< md screens, Touched Edge-to-Edge) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
                <p className="text-xs text-slate-400">Loading warranty claims…</p>
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No warranty claims found</div>
            ) : (
              filteredClaims.map((claim) => (
                <div key={claim._id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  
                  {/* Top Row: Claim Ref & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-800 text-slate-900">
                      <Clock size={14} className="text-amber-600 shrink-0" />
                      <span>{claim.claimNo}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-800 ${
                      claim.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      claim.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {claim.status}
                    </span>
                  </div>

                  {/* Info Box */}
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-500">Customer:</span>
                      <span className="font-700 text-slate-900">{claim.customerName}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500 font-sans">Warranty Card:</span>
                      <span className="font-700 text-primary-700">{claim.warrantyNo}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Tech:</span>
                      <span className="font-600 text-slate-700">{claim.assignedTechnician}</span>
                    </div>
                  </div>

                  {/* Issue Box */}
                  <div className="text-xs text-slate-600 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/80 line-clamp-2">
                    "{claim.issueDescription}"
                  </div>

                  {/* Action */}
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setSelectedClaim(claim)}
                      className="btn-secondary text-xs py-1.5 px-3.5 gap-1.5 w-full justify-center rounded-xl"
                    >
                      <Eye size={14} /> Review Claim
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Official Service Warranty Certificate Modal ── */}
      <Modal
        isOpen={!!certificateCard}
        onClose={() => setCertificateCard(null)}
        title="Official Service Warranty Certificate"
        size="lg"
      >
        {certificateCard && (
          <div className="space-y-5">
            
            {/* Certificate Canvas / Card View */}
            <div
              id="warranty-certificate-card"
              className="relative border-2 sm:border-4 border-slate-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-white text-slate-900 shadow-2xl overflow-hidden print:border-0 print:shadow-none"
              style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
            >
              {/* Gold Corner Ornaments */}
              <div className="absolute top-3 left-3 w-4 h-4 sm:w-5 sm:h-5 border-t-2 border-l-2 border-amber-500 pointer-events-none" />
              <div className="absolute top-3 right-3 w-4 h-4 sm:w-5 sm:h-5 border-t-2 border-r-2 border-amber-500 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-4 h-4 sm:w-5 sm:h-5 border-b-2 border-l-2 border-amber-500 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-4 h-4 sm:w-5 sm:h-5 border-b-2 border-r-2 border-amber-500 pointer-events-none" />
              
              {/* Background Watermark Icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                <Zap size={380} className="text-slate-900" />
              </div>

              {/* Top Ribbon Line */}
              <div className="h-2 bg-gradient-to-r from-teal-700 via-emerald-600 to-amber-500 rounded-full mb-4 sm:mb-6" />

              {/* Certificate Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 sm:pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center text-white shadow-md shrink-0">
                    <Zap size={22} className="fill-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-900 tracking-wider text-slate-900 uppercase">AC SERVICE WORLD</h2>
                    <p className="text-[10px] sm:text-[11px] font-700 tracking-widest uppercase text-teal-700">Official Service Guarantee Certificate</p>
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-800 mb-1 shadow-sm">
                    <ShieldCheck size={14} className="text-emerald-600" /> VERIFIED GUARANTEE
                  </div>
                  <p className="text-xs font-mono text-slate-500">Ref: <span className="font-800 text-slate-900">{certificateCard.warrantyNo}</span></p>
                </div>
              </div>

              {/* Certificate Body Intro */}
              <div className="my-4 sm:my-6 text-center">
                <p className="text-[10px] sm:text-[11px] font-800 tracking-widest text-slate-400 uppercase">Certificate of Warranty</p>
                <h3 className="text-lg sm:text-2xl font-900 text-slate-900 mt-1">100% Genuine AC Protection Guarantee</h3>
                <p className="text-xs text-slate-600 max-w-xl mx-auto mt-1.5 sm:mt-2 leading-relaxed">
                  This official certificate verifies that the AC unit specified below has been inspected, serviced, and certified by an authorized technician and carries full active coverage under company policy terms.
                </p>
              </div>

              {/* Customer & Technician Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 border border-slate-200 p-3.5 sm:p-4 rounded-2xl mb-4 sm:mb-6">
                <div>
                  <p className="text-[10px] font-800 text-slate-400 uppercase tracking-wider mb-1">Customer / Owner</p>
                  <p className="text-xs sm:text-sm font-800 text-slate-900">{certificateCard.customerName}</p>
                  <p className="text-xs text-slate-600 font-500">{certificateCard.customerPhone || '+91 98765 43210'}</p>
                  <p className="text-xs text-slate-500 mt-1 font-500 leading-normal">{certificateCard.address || 'Verified Customer Premises'}</p>
                </div>

                <div>
                  <p className="text-[10px] font-800 text-slate-400 uppercase tracking-wider mb-1">Issuing Serviceman</p>
                  <p className="text-xs sm:text-sm font-800 text-teal-700">{certificateCard.technicianName || 'Suresh Kumar (Tech ID #402)'}</p>
                  <p className="text-xs text-slate-600 font-mono">Service Job ID: {certificateCard.bookingNo || 'BK-9021'}</p>
                  <p className="text-xs text-slate-500 mt-1">Certified Field AC Master Specialist</p>
                </div>
              </div>

              {/* Appliance, AC No, Model No & Reason Specifications */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 sm:p-4 rounded-2xl space-y-2.5 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-600">Model No / Brand:</span>
                  <span className="font-800 text-slate-900 text-xs sm:text-sm">{certificateCard.modelNo || certificateCard.acBrandModel}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-2">
                  <span className="text-slate-500 font-600">AC No (Unit Serial):</span>
                  <span className="font-mono font-800 text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{certificateCard.acNo || certificateCard.serialNo}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-2">
                  <span className="text-slate-500 font-600">Reason of Warranty:</span>
                  <span className="font-800 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{certificateCard.warrantyReason || certificateCard.coverageType}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-2">
                  <span className="text-slate-500 font-600">Service Work Performed:</span>
                  <span className="font-700 text-slate-700">{certificateCard.serviceProvided || 'Full Jet Maintenance & Component Guarantee'}</span>
                </div>
              </div>

              {/* Dates & Verification Footer */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-slate-200">
                <div>
                  <p className="text-[10px] font-800 text-slate-400 uppercase">Coverage Validity Period</p>
                  <p className="text-xs font-800 text-slate-800 mt-0.5">{certificateCard.startDate} &nbsp;➞&nbsp; <span className="text-emerald-700 font-900">{certificateCard.endDate}</span></p>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <QrCode size={26} className="text-slate-700 shrink-0" />
                  <div className="text-[10px]">
                    <p className="font-800 text-slate-800">SCAN TO VERIFY</p>
                    <p className="font-mono text-slate-500">{certificateCard.verificationToken || 'CERT-AC-2026-9041-A'}</p>
                  </div>
                </div>
              </div>

              {/* Digital Signature Image & Digital Stamp Image */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 bg-amber-50/40 p-3 sm:p-4 rounded-xl border border-amber-100">
                <div>
                  {signatureImg ? (
                    <img src={signatureImg} alt="Admin Signature" className="h-14 sm:h-20 max-h-24 object-contain my-1" />
                  ) : (
                    <p className="italic text-slate-900 font-serif font-700 text-xs sm:text-sm mb-0.5">{adminSignature || certificateCard.digitalSignature || 'Suresh Kumar (Authorized Signatory)'}</p>
                  )}
                  <p className="text-[10px] text-slate-500 font-600">{adminSignature || 'Certified Field Signatory'}</p>
                </div>

                <div className="text-right">
                  {stampImg ? (
                    <img src={stampImg} alt="Admin Stamp Seal" className="h-16 w-16 sm:h-24 sm:w-24 max-h-28 object-contain ml-auto my-1" />
                  ) : (
                    <p className="font-800 text-emerald-800 text-[11px] sm:text-xs mb-0.5">{adminStamp || certificateCard.digitalStamp || 'AC SERVICE WORLD QUALITY SEAL'}</p>
                  )}
                  <p className="text-[10px] text-slate-500 font-600">{adminStamp || 'Official Quality Seal Verified'}</p>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button
                className="btn-primary flex-1 justify-center gap-2 py-2.5 text-xs rounded-xl shadow-sm"
                onClick={handleDownloadPDF}
                disabled={downloadingPdf}
              >
                {downloadingPdf ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Generating PDF…
                  </>
                ) : (
                  <>
                    <Download size={16} /> Download PDF Certificate
                  </>
                )}
              </button>

              <button
                className="px-4 py-2.5 border border-slate-200 text-slate-700 font-700 rounded-xl text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                onClick={() => window.print()}
              >
                <Printer size={16} /> Print
              </button>

              <button className="btn-secondary justify-center px-6 py-2.5 text-xs rounded-xl" onClick={() => setCertificateCard(null)}>
                Close
              </button>
            </div>

          </div>
        )}
      </Modal>

      {/* ── Review Claim Modal ── */}
      <Modal isOpen={!!selectedClaim} onClose={() => setSelectedClaim(null)} title={`Warranty Claim — ${selectedClaim?.claimNo}`}>
        {selectedClaim && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-700 text-slate-800">{selectedClaim.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Warranty Ref:</span>
                <span className="font-700 text-primary-700 font-mono">{selectedClaim.warrantyNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AC Unit:</span>
                <span className="font-700 text-slate-800">{selectedClaim.acBrandModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Inspecting Technician:</span>
                <span className="font-700 text-slate-800">{selectedClaim.assignedTechnician}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-700 text-slate-500 mb-1">Claimed Defect / Issue:</p>
              <p className="text-xs text-slate-700 bg-amber-50/50 p-3 rounded-xl border border-amber-100 leading-relaxed">
                "{selectedClaim.issueDescription}"
              </p>
            </div>

            <div>
              <label className="form-label">Approval / Inspection Notes</label>
              <input
                type="text"
                placeholder="e.g. Free replacement approved under warranty terms"
                className="input-field"
                value={claimNotes}
                onChange={e => setClaimNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
              <button
                className="btn-primary flex-1 justify-center bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs rounded-xl"
                onClick={() => handleClaimStatus(selectedClaim._id, 'Approved')}
              >
                Approve & Dispatch Parts
              </button>
              <button
                className="px-4 py-2.5 bg-rose-50 text-rose-600 font-700 rounded-xl text-xs hover:bg-rose-100 transition-colors"
                onClick={() => handleClaimStatus(selectedClaim._id, 'Rejected')}
              >
                Reject Claim
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Image Zoom Popup Modal ── */}
      <Modal
        isOpen={!!zoomImage}
        onClose={() => setZoomImage(null)}
        title={zoomImage?.title || 'Full Image Zoom View'}
        size="md"
      >
        {zoomImage && (
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 space-y-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-full bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-center min-h-[180px] sm:min-h-[220px]">
              <img
                src={zoomImage.url}
                alt={zoomImage.title}
                className="max-h-[300px] sm:max-h-[380px] max-w-full object-contain drop-shadow-md transition-transform hover:scale-105"
              />
            </div>
            <div className="text-center">
              <span className="text-[10px] sm:text-[11px] font-700 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                ✓ High-Resolution Active Image
              </span>
              <p className="text-xs text-slate-500 font-600 mt-2">This image is embedded directly on official digital warranty certificates and PDF downloads.</p>
            </div>
            <button
              onClick={() => setZoomImage(null)}
              className="btn-secondary px-8 py-2 text-xs font-700 rounded-xl"
            >
              Close Zoom View
            </button>
          </div>
        )}
      </Modal>

    </DashboardLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import SearchFilter from '@/components/SearchFilter';
import { getReviews, toggleReviewFeatured, flagReview, replyToReview } from '@/lib/api';
import {
  Star, MessageSquare, Flag, Sparkles, ThumbsUp, CheckCircle, AlertTriangle, ShieldCheck, UserCheck, RefreshCw, Loader2, User
} from 'lucide-react';

interface Review {
  _id: string;
  customerName: string;
  technicianName: string;
  rating: number;
  comment: string;
  serviceTitle: string;
  bookingNumber: string;
  date: string;
  isFeatured: boolean;
  isFlagged: boolean;
  adminReply?: string;
}

export default function ReviewsPage() {
  const [reviewsData, setReviewsData] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  
  // Reply modal
  const [replyModalReview, setReplyModalReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [savingReply, setSavingReply] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getReviews();
      if (res?.data) {
        setReviewsData(res.data);
        setReviews(res.data.reviews || []);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleFeature = async (review: Review) => {
    try {
      const updated = !review.isFeatured;
      setReviews(prev => prev.map(r => r._id === review._id ? { ...r, isFeatured: updated } : r));
      await toggleReviewFeatured(review._id, updated);
    } catch (e: any) {
      alert(e.message || 'Failed to update feature status');
    }
  };

  const handleToggleFlag = async (review: Review) => {
    try {
      const updated = !review.isFlagged;
      setReviews(prev => prev.map(r => r._id === review._id ? { ...r, isFlagged: updated } : r));
      await flagReview(review._id, updated);
    } catch (e: any) {
      alert(e.message || 'Failed to update flag status');
    }
  };

  const handleSendReply = async () => {
    if (!replyModalReview || !replyText.trim()) return;
    setSavingReply(true);
    try {
      await replyToReview(replyModalReview._id, replyText);
      setReviews(prev => prev.map(r => r._id === replyModalReview._id ? { ...r, adminReply: replyText } : r));
      setReplyModalReview(null);
      setReplyText('');
    } catch (e: any) {
      alert(e.message || 'Failed to send reply');
    } finally {
      setSavingReply(false);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.technicianName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase());
    const matchesRating = !ratingFilter || r.rating === Number(ratingFilter);
    return matchesSearch && matchesRating;
  });

  const avgRating = reviewsData?.averageRating || 4.8;
  const totalReviews = reviewsData?.totalReviews || reviews.length;
  const breakdown = reviewsData?.breakdown || { 5: 380, 4: 72, 3: 20, 2: 9, 1: 5 };

  return (
    <DashboardLayout title="Customer Reviews & Ratings" subtitle="Monitor technician feedback, service quality scores, and publish featured reviews">
      
      {/* ── Summary & Breakdown Banner (Touched Left & Right on Mobile) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 mb-5 sm:mb-6">
        
        {/* Overall Rating Box */}
        <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 p-4 sm:p-6 shadow-card flex flex-col justify-center items-center text-center">
          <p className="text-[10px] sm:text-xs font-800 text-slate-400 uppercase tracking-widest mb-1">Average Quality Score</p>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl sm:text-4xl font-900 text-slate-900">{avgRating}</span>
            <span className="text-xs sm:text-sm text-slate-400 font-600">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 my-1.5 sm:my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={16} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-xs text-slate-500 font-600">Based on {totalReviews} verified service ratings</p>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 p-4 sm:p-5 shadow-card md:col-span-2 flex flex-col justify-between">
          <p className="text-xs font-800 text-slate-800 uppercase tracking-wider mb-2.5 sm:mb-3">Rating Breakdown</p>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = breakdown[stars] || 0;
              const percent = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-2.5 sm:gap-3 text-xs">
                  <span className="w-8 font-700 text-slate-600 flex items-center gap-1 shrink-0">{stars} <Star size={11} className="fill-amber-400 text-amber-400" /></span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-14 text-right text-slate-500 font-600 text-[11px] shrink-0">{count} ({percent}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Reviews Controls & Roster (Touched Left & Right on Mobile) ── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden">
        {/* Toolbar Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-800 text-slate-900 tracking-tight">Verified Feedback Roster</h2>
              <span className="text-[11px] font-700 text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                {filteredReviews.length} reviews
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary py-2 px-3 text-xs gap-1.5 shrink-0 rounded-xl"
              title="Refresh Feedback"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <SearchFilter
            searchValue={search}
            onSearch={setSearch}
            placeholder="Search customer, technician, or comment..."
            filterOptions={[
              { label: '5 Stars ★', value: '5' },
              { label: '4 Stars ★', value: '4' },
              { label: '3 Stars ★', value: '3' },
              { label: '2 Stars ★', value: '2' },
              { label: '1 Star ★', value: '1' },
            ]}
            filterValue={ratingFilter}
            onFilter={setRatingFilter}
            filterLabel="Filter Rating"
          />
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
              <p className="text-xs font-500">Loading customer reviews…</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No reviews found.</div>
          ) : filteredReviews.map((rev) => (
            <div key={rev._id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-2">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="font-800 text-slate-900 text-xs sm:text-sm">{rev.customerName}</span>
                    <span className="text-[11px] text-slate-400">reviewed</span>
                    <span className="font-700 text-teal-700 text-xs">{rev.technicianName}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-700 px-2 py-0.5 rounded-full">{rev.bookingNumber}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{rev.serviceTitle} • {rev.date}</p>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80 shrink-0">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs font-800 text-amber-800">{rev.rating}.0</span>
                </div>
              </div>

              {/* Comment text */}
              <p className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-100 my-2.5 leading-relaxed font-500">
                "{rev.comment}"
              </p>

              {/* Admin Reply preview */}
              {rev.adminReply && (
                <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-100/80 mb-2.5 text-xs text-slate-700">
                  <p className="font-800 text-teal-800 mb-0.5">Official Admin Response:</p>
                  <p className="font-500 text-slate-700">{rev.adminReply}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => handleToggleFeature(rev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-700 flex items-center gap-1.5 transition-all ${
                    rev.isFeatured ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles size={13} /> {rev.isFeatured ? 'Featured on App' : 'Feature'}
                </button>

                <button
                  onClick={() => { setReplyModalReview(rev); setReplyText(rev.adminReply || ''); }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-700 flex items-center gap-1.5 transition-all"
                >
                  <MessageSquare size={13} /> Reply
                </button>

                <button
                  onClick={() => handleToggleFlag(rev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-700 flex items-center gap-1.5 transition-all ${
                    rev.isFlagged ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'text-slate-400 hover:text-rose-600'
                  }`}
                >
                  <Flag size={13} /> {rev.isFlagged ? 'Flagged' : 'Flag'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reply Modal ── */}
      <Modal isOpen={!!replyModalReview} onClose={() => setReplyModalReview(null)} title="Respond to Customer Review">
        {replyModalReview && (
          <div className="space-y-4 pt-1">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
              <p className="font-800 text-slate-900">{replyModalReview.customerName} ({replyModalReview.rating}★)</p>
              <p className="text-slate-600 italic mt-0.5">"{replyModalReview.comment}"</p>
            </div>

            <div>
              <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Official Admin Response *</label>
              <textarea
                rows={4}
                placeholder="Write a polite response to thank the customer or address concerns..."
                className="input-field text-xs resize-none"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button className="btn-primary flex-1 justify-center py-2.5 text-xs rounded-xl" onClick={handleSendReply} disabled={savingReply}>
                {savingReply ? 'Sending...' : 'Post Official Response'}
              </button>
              <button className="btn-secondary justify-center py-2.5 px-5 text-xs rounded-xl" onClick={() => setReplyModalReview(null)}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>

    </DashboardLayout>
  );
}

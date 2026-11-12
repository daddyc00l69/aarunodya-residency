'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Users,
  Percent,
  Coins,
  Trash2,
  Edit,
  TrendingUp,
  Ticket
} from 'lucide-react';
import { Coupon } from '@/lib/types';
import { formatPaise } from '@/lib/utils/currency';

export default function CouponManagementPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [maxDiscountInput, setMaxDiscountInput] = useState('');
  const [minBookingInput, setMinBookingInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [maxPerCustomer, setMaxPerCustomer] = useState('1');
  const [eligibleCustomerType, setEligibleCustomerType] = useState<'all' | 'first_time' | 'returning'>('all');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.coupons) {
        setCoupons(data.coupons);
      }
      if (data.analytics) {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('10');
    setMaxDiscountInput('500');
    setMinBookingInput('1000');
    setStartDate(new Date().toISOString().split('T')[0]);
    const exp = new Date();
    exp.setDate(exp.getDate() + 90);
    setExpiryDate(exp.toISOString().split('T')[0]);
    setMaxRedemptions('100');
    setMaxPerCustomer('1');
    setEligibleCustomerType('all');
    setAdminNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDescription(coupon.description || '');
    setDiscountType(coupon.discountType === 'fixed' ? 'fixed_amount' : 'percentage');
    setDiscountValue(coupon.discountType === 'percentage' ? coupon.discountValue.toString() : (coupon.discountValue / 100).toString());
    setMaxDiscountInput(coupon.maxDiscountAmountPaise ? (coupon.maxDiscountAmountPaise / 100).toString() : '');
    setMinBookingInput(coupon.minBookingAmountPaise ? (coupon.minBookingAmountPaise / 100).toString() : '');
    setStartDate(coupon.startDate ? coupon.startDate.split('T')[0] : '');
    setExpiryDate(coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '');
    setMaxRedemptions(coupon.maxRedemptions ? coupon.maxRedemptions.toString() : '');
    setMaxPerCustomer(coupon.maxRedemptionsPerCustomer ? coupon.maxRedemptionsPerCustomer.toString() : '1');
    setEligibleCustomerType((coupon.eligibleCustomerType as any) || 'all');
    setAdminNotes(coupon.adminNotes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive })
      });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const parsedVal = parseFloat(discountValue);
      if (isNaN(parsedVal) || parsedVal <= 0) {
        throw new Error('Please enter a valid discount value.');
      }

      const val = discountType === 'percentage' ? parsedVal : Math.round(parsedVal * 100);

      const payload = {
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: val,
        maxDiscountAmountPaise: maxDiscountInput ? Math.round(parseFloat(maxDiscountInput) * 100) : undefined,
        minBookingAmountPaise: minBookingInput ? Math.round(parseFloat(minBookingInput) * 100) : undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : undefined,
        maxRedemptionsPerCustomer: maxPerCustomer ? parseInt(maxPerCustomer) : 1,
        eligibleCustomerType,
        adminNotes: adminNotes.trim() || undefined,
        isActive: editingCoupon ? editingCoupon.isActive : true
      };

      const url = editingCoupon ? `/api/admin/coupons/${editingCoupon.id}` : '/api/admin/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save coupon');
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && c.isActive) ||
      (statusFilter === 'inactive' && !c.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Tag className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-800">
              Marketing & Revenue Engine
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
            Coupon Management
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            Configure promotional promo codes, returning devotee discounts, and stay-duration rewards
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#0071e3] text-white hover:bg-[#0077ed] font-medium text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-black/[0.06] rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#86868b]">
            <span className="font-semibold uppercase tracking-wider">Active Campaigns</span>
            <Ticket className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
            {analytics?.activeCouponsCount ?? coupons.filter((c) => c.isActive).length}
          </p>
          <p className="text-[11px] text-[#86868b]">
            {coupons.length} total coupons configured
          </p>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#86868b]">
            <span className="font-semibold uppercase tracking-wider">Total Redemptions</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-emerald-700">
            {analytics?.totalRedemptionsCount ?? 0}
          </p>
          <p className="text-[11px] text-[#86868b]">
            Successful reservations booked with discounts
          </p>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#86868b]">
            <span className="font-semibold uppercase tracking-wider">Discounts Distributed</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
            {formatPaise(analytics?.totalDiscountDistributedPaise ?? 0)}
          </p>
          <p className="text-[11px] text-[#86868b]">
            Calculated strictly on server-side ledger
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search coupon code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl pl-10 pr-4 text-xs text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#f5f5f7] rounded-2xl text-xs shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              statusFilter === 'all' ? 'bg-white shadow text-[#1d1d1f]' : 'text-[#86868b]'
            }`}
          >
            All ({coupons.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              statusFilter === 'active' ? 'bg-white shadow text-[#1d1d1f]' : 'text-[#86868b]'
            }`}
          >
            Active ({coupons.filter(c => c.isActive).length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              statusFilter === 'inactive' ? 'bg-white shadow text-[#1d1d1f]' : 'text-[#86868b]'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.map((coupon) => {
          const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
          const usedCount = coupon.redemptionCount || coupon.currentRedemptionsCount || 0;
          const maxRedemptions = coupon.maxRedemptions || coupon.maxTotalRedemptions;
          const percentUsed = maxRedemptions
            ? Math.min(100, Math.round((usedCount / maxRedemptions) * 100))
            : 0;

          return (
            <div
              key={coupon.id}
              className={`bg-white border rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
                coupon.isActive && !isExpired ? 'border-black/[0.08]' : 'border-stone-200 opacity-70 bg-stone-50/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="font-mono font-bold text-sm bg-indigo-50 border border-indigo-200 text-indigo-900 px-3 py-1 rounded-xl">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors ${
                      coupon.isActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    {coupon.isActive ? 'Active' : 'Paused'}
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-bold tracking-tight text-[#1d1d1f]">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% OFF`
                      : `${formatPaise(coupon.discountValue)} OFF`}
                  </h3>
                  <p className="text-xs text-[#86868b] mt-0.5 line-clamp-2">
                    {coupon.description || 'Promotional lodge discount'}
                  </p>
                </div>

                <div className="space-y-1.5 text-[11px] text-[#86868b] pt-2 border-t border-black/[0.04]">
                  {coupon.minBookingAmountPaise && (
                    <div className="flex justify-between">
                      <span>Min Booking:</span>
                      <span className="font-medium text-[#1d1d1f]">{formatPaise(coupon.minBookingAmountPaise)}</span>
                    </div>
                  )}
                  {coupon.maxDiscountAmountPaise && coupon.discountType === 'percentage' && (
                    <div className="flex justify-between">
                      <span>Max Cap:</span>
                      <span className="font-medium text-[#1d1d1f]">{formatPaise(coupon.maxDiscountAmountPaise)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Eligibility:</span>
                    <span className="font-medium text-[#1d1d1f] capitalize">{coupon.eligibleCustomerType || 'All Devotees'}</span>
                  </div>
                  {coupon.expiryDate && (
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className={`font-medium ${isExpired ? 'text-rose-600 font-bold' : 'text-[#1d1d1f]'}`}>
                        {new Date(coupon.expiryDate).toLocaleDateString()} {isExpired && '(Expired)'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Redemption Progress */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-medium text-[#86868b]">
                    <span>Redeemed: {usedCount} times</span>
                    <span>{maxRedemptions ? `Limit: ${maxRedemptions}` : 'Unlimited'}</span>
                  </div>
                  {maxRedemptions && (
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-black/[0.04] text-xs">
                <button
                  onClick={() => openEditModal(coupon)}
                  className="flex items-center space-x-1 text-[#0071e3] hover:underline font-medium"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-black/[0.08] animate-in zoom-in-95 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-[#1d1d1f]">
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotion Coupon'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DARSHAN200"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 font-mono uppercase text-xs font-bold text-[#1d1d1f] focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-indigo-600"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Description / Marketing Note *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special 10% discount for Pandharpur pilgrimage devotees"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    {discountType === 'percentage' ? 'Percentage (%) *' : 'Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs font-bold text-[#1d1d1f] focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    Max Discount (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="No cap"
                    value={maxDiscountInput}
                    onChange={(e) => setMaxDiscountInput(e.target.value)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    Min Spend (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="No minimum"
                    value={minBookingInput}
                    onChange={(e) => setMinBookingInput(e.target.value)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    Valid From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    Total Redemption Cap
                  </label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={maxRedemptions}
                    onChange={(e) => setMaxRedemptions(e.target.value)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    Per Customer Cap
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxPerCustomer}
                    onChange={(e) => setMaxPerCustomer(e.target.value)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    Customer Eligibility
                  </label>
                  <select
                    value={eligibleCustomerType}
                    onChange={(e) => setEligibleCustomerType(e.target.value as any)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-indigo-600"
                  >
                    <option value="all">All Devotees</option>
                    <option value="first_time">First-time Only</option>
                    <option value="returning">Returning Devotees</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Internal Staff Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Authorized by lodge owner for Kartiki Ekadashi festival"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-[#f5f5f7] border border-black/[0.06] rounded-xl p-2.5 text-xs text-[#1d1d1f] focus:outline-none focus:border-indigo-600 resize-none"
                />
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-black/[0.08] hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create & Publish Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

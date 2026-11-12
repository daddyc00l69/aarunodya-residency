'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Search,
  Calendar,
  BedDouble,
  Coins,
  CheckCircle2,
  Printer,
  AlertCircle,
  Tag,
  Plus,
  Trash2,
  Users,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatPaise } from '@/lib/utils/currency';

interface AvailableRoomType {
  roomType: {
    id: string;
    name: string;
    slug: string;
    category: string;
    floor: string;
    basePricePaise: number;
    maxGuests: number;
    roomNumbers: string[];
    isHall?: boolean;
  };
  availableCount: number;
}

interface CustomerResult {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  vipStatus?: boolean;
  notes?: string;
}

export default function ReceptionWalkinPage() {
  // Dates default: check-in today, check-out tomorrow
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [guestCount, setGuestCount] = useState(2);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  
  // Available data from API
  const [roomTypes, setRoomTypes] = useState<AvailableRoomType[]>([]);
  const [occupiedRooms, setOccupiedRooms] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Customer search & data
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CustomerResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [guestState, setGuestState] = useState('');
  const [idType, setIdType] = useState('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Additional guests
  const [additionalGuests, setAdditionalGuests] = useState<Array<{ fullName: string; age?: number; gender?: string }>>([]);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Payment
  const [paymentOption, setPaymentOption] = useState<'full' | 'partial' | 'unpaid'>('full');
  const [cashCollectedInput, setCashCollectedInput] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Submission & Result state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Fetch availability when dates change
  useEffect(() => {
    async function loadAvailability() {
      setIsLoadingAvailability(true);
      try {
        const res = await fetch(`/api/availability?checkIn=${checkIn}&checkOut=${checkOut}`);
        const data = await res.json();
        if (data.roomTypes) {
          setRoomTypes(data.roomTypes);
          if (data.roomTypes.length > 0 && !selectedRoomTypeId) {
            setSelectedRoomTypeId(data.roomTypes[0].roomType.id);
          }
        }

        // Fetch currently occupied rooms for these dates
        const calRes = await fetch('/api/admin/bookings');
        const calData = await calRes.json();
        if (calData.bookings) {
          const overlapping = calData.bookings
            .filter((b: any) => 
              b.status !== 'cancelled' && 
              b.assignedRoomNumber &&
              !(b.checkOutDate <= checkIn || b.checkInDate >= checkOut)
            )
            .map((b: any) => b.assignedRoomNumber);
          setOccupiedRooms(overlapping);
        }
      } catch (err) {
        console.error('Failed to load availability:', err);
      } finally {
        setIsLoadingAvailability(false);
      }
    }
    loadAvailability();
  }, [checkIn, checkOut]);

  // Selected room type details
  const activeRoomTypeObj = roomTypes.find((r) => r.roomType.id === selectedRoomTypeId);
  
  // Available room numbers for selected room type
  const availableRoomNumbers = activeRoomTypeObj 
    ? activeRoomTypeObj.roomType.roomNumbers.filter((rm) => !occupiedRooms.includes(rm))
    : [];

  // Default first room number if not set or invalid
  useEffect(() => {
    if (availableRoomNumbers.length > 0 && (!selectedRoomNumber || !availableRoomNumbers.includes(selectedRoomNumber))) {
      setSelectedRoomNumber(availableRoomNumbers[0]);
    } else if (availableRoomNumbers.length === 0) {
      setSelectedRoomNumber('');
    }
  }, [selectedRoomTypeId, occupiedRooms]);

  // Handle Customer Search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/admin/customers?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data.customers) {
          setSearchResults(data.customers);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectExistingCustomer = (c: CustomerResult) => {
    setSelectedCustomerId(c.id);
    setGuestName(c.fullName);
    setGuestPhone(c.phone);
    setGuestEmail(c.email || '');
    setSearchResults([]);
    setSearchQuery('');
  };

  // Pricing calculation
  const nights = Math.max(
    1,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const basePricePaise = (activeRoomTypeObj?.roomType.basePricePaise || 0) * nights;
  
  // Extra guest surcharge if guests exceed 2 in non-hall
  let extraGuestPaise = 0;
  if (!activeRoomTypeObj?.roomType.isHall && guestCount > 2) {
    extraGuestPaise = (guestCount - 2) * 30000 * nights; // ₹300 per extra guest per night
  }

  const subtotalPaise = basePricePaise + extraGuestPaise;
  const discountPaise = appliedCoupon ? appliedCoupon.discountPaise : 0;
  const taxablePaise = Math.max(0, subtotalPaise - discountPaise);
  // GST 12% if daily rate >= 100000 paise (₹1000)
  const gstPaise = taxablePaise > 0 && (taxablePaise / nights >= 100000) ? Math.round(taxablePaise * 0.12) : 0;
  const totalPayablePaise = taxablePaise + gstPaise;

  // Auto-fill cash collected based on payment option
  useEffect(() => {
    if (paymentOption === 'full') {
      setCashCollectedInput((totalPayablePaise / 100).toString());
    } else if (paymentOption === 'unpaid') {
      setCashCollectedInput('0');
    }
  }, [paymentOption, totalPayablePaise]);

  const cashCollectedPaise = Math.round((parseFloat(cashCollectedInput) || 0) * 100);
  const remainingBalancePaise = Math.max(0, totalPayablePaise - cashCollectedPaise);

  // Validate coupon handler
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          bookingAmountPaise: subtotalPaise,
          roomTypeId: selectedRoomTypeId,
          customerPhone: guestPhone.trim() || undefined,
          stayNights: nights
        })
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.error || 'Coupon is invalid or not applicable');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
      }
    } catch (err: any) {
      setCouponError('Network error validating coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Add / remove additional guest
  const addGuestRow = () => {
    setAdditionalGuests([...additionalGuests, { fullName: '', age: undefined, gender: 'male' }]);
  };

  const removeGuestRow = (index: number) => {
    setAdditionalGuests(additionalGuests.filter((_, i) => i !== index));
  };

  const updateGuestRow = (index: number, field: string, val: any) => {
    const updated = [...additionalGuests];
    updated[index] = { ...updated[index], [field]: val };
    setAdditionalGuests(updated);
  };

  // Submit Booking
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!guestName.trim()) {
      setSubmitError('Please enter primary guest name.');
      return;
    }
    if (!guestPhone.trim() || guestPhone.replace(/\D/g, '').length < 10) {
      setSubmitError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!selectedRoomNumber) {
      setSubmitError('Please assign a physical room number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        guest: {
          fullName: guestName.trim(),
          phone: guestPhone.trim(),
          email: guestEmail.trim() || undefined,
          city: guestCity.trim() || undefined,
          state: guestState.trim() || undefined,
          idType: idType || undefined,
          idNumber: idNumber.trim() || undefined
        },
        customerId: selectedCustomerId || undefined,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        roomTypeId: selectedRoomTypeId,
        roomNumber: selectedRoomNumber,
        guestCount,
        additionalGuests: additionalGuests.filter(g => g.fullName.trim().length > 0),
        couponCode: appliedCoupon ? appliedCoupon.coupon.code : undefined,
        cashPaidPaise: cashCollectedPaise,
        paymentNotes: paymentNotes.trim() || undefined,
        specialRequests: specialRequests.trim() || undefined
      };

      const res = await fetch('/api/admin/reception/walkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete reception booking.');
      }

      setConfirmedBooking(data);
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred during booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setConfirmedBooking(null);
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setGuestCity('');
    setGuestState('');
    setIdNumber('');
    setSelectedCustomerId(null);
    setAdditionalGuests([]);
    setAppliedCoupon(null);
    setCouponCode('');
    setPaymentNotes('');
    setCashCollectedInput('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <UserPlus className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-800">
              Front Desk Operations
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
            Reception Walk-in Booking
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            Real-time physical room allocation & cash ledger transaction recorder
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/reception/cash-register"
            className="flex items-center space-x-1.5 text-xs font-medium px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-[#1d1d1f] hover:bg-black/[0.02] shadow-sm transition-all"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>Open Cash Register</span>
          </Link>
          <Link
            href="/admin/reservations"
            className="text-xs font-medium text-[#0071e3] hover:underline"
          >
            View All Reservations
          </Link>
        </div>
      </div>

      {/* Confirmed Booking Modal / View */}
      {confirmedBooking && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 sm:p-8 animate-in fade-in slide-in-from-top-4 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Walk-in Reservation Confirmed
                </span>
                <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
                  Room {confirmedBooking.booking.assignedRoomNumber} — {confirmedBooking.booking.guest.fullName}
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Ref: <span className="font-mono font-bold text-[#1d1d1f]">{confirmedBooking.booking.bookingReference}</span> • Created at {new Date(confirmedBooking.booking.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              confirmedBooking.booking.paymentStatus === 'paid'
                ? 'bg-emerald-200 text-emerald-900'
                : confirmedBooking.booking.paymentStatus === 'partially_paid'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-rose-100 text-rose-900'
            }`}>
              {confirmedBooking.booking.paymentStatus.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white border border-emerald-100 text-xs">
            <div>
              <p className="text-[#86868b] font-medium">Check-In / Check-Out</p>
              <p className="font-semibold text-[#1d1d1f] mt-0.5">
                {confirmedBooking.booking.checkInDate} to {confirmedBooking.booking.checkOutDate}
              </p>
            </div>
            <div>
              <p className="text-[#86868b] font-medium">Total Bill</p>
              <p className="font-bold text-[#1d1d1f] mt-0.5">
                {formatPaise(confirmedBooking.booking.totalPricePaise)}
              </p>
            </div>
            <div>
              <p className="text-[#86868b] font-medium">Cash Collected</p>
              <p className="font-bold text-emerald-700 mt-0.5">
                {formatPaise(confirmedBooking.booking.amountPaidPaise)}
              </p>
            </div>
            <div>
              <p className="text-[#86868b] font-medium">Balance Due</p>
              <p className={`font-bold mt-0.5 ${confirmedBooking.booking.balanceDuePaise > 0 ? 'text-amber-700' : 'text-stone-500'}`}>
                {formatPaise(confirmedBooking.booking.balanceDuePaise)}
              </p>
            </div>
          </div>

          {confirmedBooking.cashTransaction && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/80 border border-emerald-200 text-xs">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>
                  Official Receipt Issued: <strong className="font-mono">{confirmedBooking.cashTransaction.receiptNumber}</strong>
                </span>
              </div>
              <span className="text-[#86868b]">Cashier: {confirmedBooking.cashTransaction.cashierName}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/booking/invoice/${confirmedBooking.booking.bookingReference}`}
              target="_blank"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#1d1d1f] text-white hover:bg-black font-medium text-xs shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Receipt</span>
            </Link>
            <button
              onClick={handleResetForm}
              className="px-5 py-2.5 rounded-xl bg-white border border-black/[0.1] text-[#1d1d1f] hover:bg-stone-50 font-medium text-xs shadow-sm transition-all"
            >
              Start Another Walk-in
            </button>
            <Link
              href="/admin/reservations"
              className="px-5 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 font-medium text-xs transition-all ml-auto"
            >
              Go to Reservations Desk →
            </Link>
          </div>
        </div>
      )}

      {/* Main Walk-in Form */}
      <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Guest Info & Stay Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Customer Profile & Search */}
          <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#0071e3]" />
                <h2 className="text-base font-semibold text-[#1d1d1f]">
                  Guest Identification
                </h2>
              </div>
              {selectedCustomerId && (
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Linked Existing Profile
                </span>
              )}
            </div>

            {/* Live Search Existing Customer */}
            <div className="relative">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1.5">
                Search Returning Guest (Name / Phone / ID)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Type guest mobile number or name to search database..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl pl-10 pr-4 text-xs text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] focus:bg-white transition-all"
                />
              </div>

              {/* Search dropdown results */}
              {searchResults.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-black/[0.08] rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                  {searchResults.map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => selectExistingCustomer(cust)}
                      className="w-full text-left p-3 hover:bg-stone-50 border-b border-black/[0.04] last:border-none flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#1d1d1f]">{cust.fullName}</p>
                        <p className="text-[11px] text-[#86868b] font-mono">{cust.phone} • {cust.email || 'No email'}</p>
                      </div>
                      <span className="text-[10px] text-[#0071e3] font-semibold bg-blue-50 px-2 py-0.5 rounded">
                        Select Guest
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Primary Guest Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh V. Kulkarni"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Email Address (For e-invoice & return gift)
                </label>
                <input
                  type="email"
                  placeholder="ramesh@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Origin City / District
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pune, Solapur, Mumbai"
                  value={guestCity}
                  onChange={(e) => setGuestCity(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Govt ID Type
                </label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
                >
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="voter_id">Voter ID (EPIC)</option>
                  <option value="driving_license">Driving License</option>
                  <option value="passport">Passport</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Govt ID Number (Last 4 or Full)
                </label>
                <input
                  type="text"
                  placeholder="e.g. XXXX-XXXX-4567"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
                />
              </div>
            </div>

            {/* Additional Guests Accordion */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#1d1d1f]">
                  Additional Staying Guests ({additionalGuests.length})
                </span>
                <button
                  type="button"
                  onClick={addGuestRow}
                  className="text-xs text-[#0071e3] hover:underline flex items-center space-x-1 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Guest</span>
                </button>
              </div>

              {additionalGuests.map((guest, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2 p-2 rounded-xl bg-stone-50 border border-black/[0.04]">
                  <input
                    type="text"
                    placeholder="Guest Full Name"
                    value={guest.fullName}
                    onChange={(e) => updateGuestRow(idx, 'fullName', e.target.value)}
                    className="flex-1 h-8 bg-white border border-black/[0.06] rounded-lg px-2.5 text-xs text-[#1d1d1f]"
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={guest.age || ''}
                    onChange={(e) => updateGuestRow(idx, 'age', parseInt(e.target.value) || undefined)}
                    className="w-16 h-8 bg-white border border-black/[0.06] rounded-lg px-2 text-xs text-[#1d1d1f]"
                  />
                  <select
                    value={guest.gender || 'male'}
                    onChange={(e) => updateGuestRow(idx, 'gender', e.target.value)}
                    className="w-24 h-8 bg-white border border-black/[0.06] rounded-lg px-2 text-xs text-[#1d1d1f]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeGuestRow(idx)}
                    className="p-1.5 text-stone-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Room Selection & Physical Allocation */}
          <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 pb-3 border-b border-black/[0.04]">
              <BedDouble className="w-4 h-4 text-[#0071e3]" />
              <h2 className="text-base font-semibold text-[#1d1d1f]">
                Room & Stay Parameters
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Check-in Date
                </label>
                <input
                  type="date"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Check-out Date
                </label>
                <input
                  type="date"
                  required
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Number of Guests
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
                />
              </div>
            </div>

            {/* Room Type Selector */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-2">
                Select Room Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roomTypes.map(({ roomType, availableCount }) => {
                  const isSelected = selectedRoomTypeId === roomType.id;
                  const isAvailable = availableCount > 0;

                  return (
                    <button
                      key={roomType.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedRoomTypeId(roomType.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#0071e3] bg-blue-50/50 shadow-sm'
                          : isAvailable
                          ? 'border-black/[0.06] bg-white hover:border-black/[0.15]'
                          : 'border-black/[0.04] bg-stone-100/60 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#1d1d1f]">{roomType.name}</p>
                          <p className="text-[11px] text-[#86868b]">{roomType.floor} • Max {roomType.maxGuests} guests</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {availableCount} Left
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-black/[0.04]">
                        <span className="text-[#86868b]">Per night</span>
                        <span className="font-bold text-[#1d1d1f]">{formatPaise(roomType.basePricePaise)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Physical Room Assignment */}
            <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f]">
                    Assign Specific Physical Room Unit *
                  </label>
                  <p className="text-[11px] text-[#86868b]">
                    Only vacant, unreserved physical rooms are available for key handover
                  </p>
                </div>
                <span className="text-xs font-bold text-[#0071e3]">
                  {availableRoomNumbers.length} Rooms Ready
                </span>
              </div>

              {availableRoomNumbers.length === 0 ? (
                <p className="text-xs text-rose-600 font-medium">
                  No physical rooms are vacant in this category for the chosen dates.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {availableRoomNumbers.map((rm) => {
                    const isSelected = selectedRoomNumber === rm;
                    return (
                      <button
                        key={rm}
                        type="button"
                        onClick={() => setSelectedRoomNumber(rm)}
                        className={`h-11 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-md'
                            : 'bg-white text-[#1d1d1f] border-black/[0.08] hover:bg-stone-50'
                        }`}
                      >
                        <span>Room {rm}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                Front Desk Remarks / Darshan Timings / Extra Mat Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. VIP devotee, arriving late from Solapur station, requested ground floor room."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full bg-[#f5f5f7] border border-black/[0.06] rounded-xl p-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Column: Price Breakdown & Cash Collection */}
        <div className="space-y-6">
          <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-6 sticky top-6">
            <div className="flex items-center space-x-2 pb-3 border-b border-black/[0.04]">
              <Coins className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-semibold text-[#1d1d1f]">
                Billing & Cash Ledger
              </h2>
            </div>

            {/* Stay Summary */}
            <div className="text-xs space-y-2 pb-4 border-b border-black/[0.04]">
              <div className="flex justify-between text-[#86868b]">
                <span>Duration</span>
                <span className="font-medium text-[#1d1d1f]">{nights} Night{nights > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-[#86868b]">
                <span>Room Assigned</span>
                <span className="font-bold text-[#1d1d1f]">{selectedRoomNumber ? `Room ${selectedRoomNumber}` : 'Not assigned'}</span>
              </div>
              <div className="flex justify-between text-[#86868b]">
                <span>Base Tariff</span>
                <span className="font-medium text-[#1d1d1f]">{formatPaise(basePricePaise)}</span>
              </div>
              {extraGuestPaise > 0 && (
                <div className="flex justify-between text-[#86868b]">
                  <span>Extra Guests ({guestCount - 2})</span>
                  <span className="font-medium text-[#1d1d1f]">{formatPaise(extraGuestPaise)}</span>
                </div>
              )}
            </div>

            {/* Coupon Code Section */}
            <div className="space-y-2 pb-4 border-b border-black/[0.04]">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                Apply Front Desk Coupon
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="font-bold font-mono">{appliedCoupon.coupon.code}</span>
                    <span className="text-[11px]">(-{formatPaise(appliedCoupon.discountPaise)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-stone-400 hover:text-rose-600 text-xs font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. VITTHAL10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 h-9 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs font-mono uppercase text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCode.trim()}
                    className="px-3 h-9 rounded-xl bg-[#1d1d1f] text-white text-xs font-medium hover:bg-black disabled:opacity-50 transition-all"
                  >
                    {isValidatingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{couponError}</span>
                </p>
              )}
            </div>

            {/* Final Price Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#86868b]">
                <span>Gross Subtotal</span>
                <span>{formatPaise(subtotalPaise)}</span>
              </div>
              {discountPaise > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatPaise(discountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#86868b]">
                <span>Applicable GST</span>
                <span>{gstPaise > 0 ? formatPaise(gstPaise) : '₹0 (Exempt)'}</span>
              </div>

              <div className="pt-2 border-t border-black/[0.06] flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#1d1d1f]">Total Payable</span>
                <span className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
                  {formatPaise(totalPayablePaise)}
                </span>
              </div>
            </div>

            {/* Cash Payment Method */}
            <div className="pt-3 border-t border-black/[0.06] space-y-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                Payment Collection Mode
              </label>

              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#f5f5f7] rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentOption('full')}
                  className={`py-1.5 rounded-lg font-medium transition-all ${
                    paymentOption === 'full' ? 'bg-white shadow text-[#1d1d1f]' : 'text-[#86868b]'
                  }`}
                >
                  Full Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentOption('partial')}
                  className={`py-1.5 rounded-lg font-medium transition-all ${
                    paymentOption === 'partial' ? 'bg-white shadow text-[#1d1d1f]' : 'text-[#86868b]'
                  }`}
                >
                  Partial Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentOption('unpaid')}
                  className={`py-1.5 rounded-lg font-medium transition-all ${
                    paymentOption === 'unpaid' ? 'bg-white shadow text-[#1d1d1f]' : 'text-[#86868b]'
                  }`}
                >
                  Pay Later
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#86868b] mb-1">
                  Cash Amount Collected Now (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-semibold text-[#86868b]">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={paymentOption === 'unpaid'}
                    value={cashCollectedInput}
                    onChange={(e) => setCashCollectedInput(e.target.value)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl pl-8 pr-3 text-xs font-bold text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Remaining Balance Notification */}
              <div className="p-3 rounded-xl bg-stone-50 border border-black/[0.04] flex items-center justify-between text-xs">
                <span className="text-[#86868b]">Remaining Balance:</span>
                <span className={`font-bold ${remainingBalancePaise > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {formatPaise(remainingBalancePaise)}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#86868b] mb-1">
                  Cashier Remarks / Shift Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received ₹2000 in notes of 500"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full h-9 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
                />
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Confirm & Print Receipt Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedRoomNumber}
              className="w-full py-3.5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs tracking-wide shadow-md active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span>Recording in Ledger & Reserving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Walk-in & Issue Receipt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

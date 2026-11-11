'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getOffsetDateString } from '@/lib/utils/dates';

interface WalkInModalProps {
  roomTypes: { id: string; name: string; basePricePaise: number }[];
}

export function WalkInModal({ roomTypes }: WalkInModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id || '');
  const [checkInDate, setCheckInDate] = useState(getOffsetDateString(0));
  const [checkOutDate, setCheckOutDate] = useState(getOffsetDateString(1));
  const [numAdults, setNumAdults] = useState(2);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card_pos'>('cash');
  const [isPrePaid, setIsPrePaid] = useState(true);
  const [specialRequests, setSpecialRequests] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/bookings/walkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId,
          checkInDate,
          checkOutDate,
          numAdults: Number(numAdults),
          guestName,
          guestPhone,
          guestEmail: guestEmail || undefined,
          paymentMethod,
          isPrePaid,
          specialRequests
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create walk-in booking');
      }

      setIsOpen(false);
      // Reset form
      setGuestName('');
      setGuestPhone('');
      setGuestEmail('');
      setSpecialRequests('');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating booking';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center space-x-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium px-4 py-2 rounded-full transition-all shadow-sm active:scale-[0.98]"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>+ Walk-In / Phone Booking</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-black/[0.08] space-y-5 max-h-[90vh] overflow-y-auto text-[#1d1d1f]">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">New Front-Desk Booking</h3>
                <p className="text-xs text-[#86868b]">Register walk-in devotee or direct phone call</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#86868b] hover:text-[#1d1d1f] rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Category */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#86868b] font-semibold mb-1">
                  Room Tier / Hall *
                </label>
                <select
                  value={roomTypeId}
                  onChange={(e) => setRoomTypeId(e.target.value)}
                  className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3.5 py-2.5 text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                >
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name} (₹{rt.basePricePaise / 100}/night)
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#86868b] font-semibold mb-1">
                    Check-In Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#86868b] font-semibold mb-1">
                    Check-Out Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    min={checkInDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              {/* Guest Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#86868b] font-semibold mb-1">
                    Devotee Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Deshmukh"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3.5 py-2 text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#86868b] font-semibold mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="98220XXXXX"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3.5 py-2 text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#86868b] font-semibold mb-1">
                    Guest Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="ramesh@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3.5 py-2 text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#86868b] font-semibold mb-1">
                    Devotees Count
                  </label>
                  <select
                    value={numAdults}
                    onChange={(e) => setNumAdults(Number(e.target.value))}
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3.5 py-2 text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  >
                    <option value={1}>1 Person</option>
                    <option value={2}>2 Persons</option>
                    <option value={3}>3 Persons</option>
                    <option value={4}>4 Persons</option>
                    <option value={6}>6 Persons (Family)</option>
                    <option value={12}>12 Persons (Hall 402)</option>
                    <option value={20}>20 Persons (Hall 402)</option>
                  </select>
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-3.5 rounded-2xl bg-[#f5f5f7] space-y-2.5">
                <label className="block text-[11px] uppercase tracking-wider text-[#86868b] font-semibold">
                  Counter Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'Cash at Desk' },
                    { id: 'upi', label: 'UPI / QR Code' },
                    { id: 'card_pos', label: 'Card Swipe / POS' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2 rounded-xl text-center text-xs font-medium transition-all ${
                        paymentMethod === m.id
                          ? 'bg-[#1d1d1f] text-white shadow-sm'
                          : 'bg-white text-[#1d1d1f] border border-black/[0.08] hover:bg-stone-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <label className="flex items-center space-x-2 text-xs text-[#1d1d1f] pt-1">
                  <input
                    type="checkbox"
                    checked={isPrePaid}
                    onChange={(e) => setIsPrePaid(e.target.checked)}
                    className="rounded text-[#0071e3] focus:ring-0"
                  />
                  <span>Mark as Paid &amp; Settled Immediately</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#86868b] font-semibold mb-1">
                  Staff Notes / Special Requests
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ground floor preferred, Darshan pass inquiry..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3.5 py-2 text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-full text-xs text-[#86868b] hover:text-[#1d1d1f]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium flex items-center space-x-1.5 shadow-sm disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Reservation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


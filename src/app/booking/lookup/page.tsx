'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { formatPaise } from '@/lib/utils/currency';
import { formatDisplayDate } from '@/lib/utils/dates';

export default function BookingLookupPage() {
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<any | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLookupResult(null);

    if (!reference.trim()) {
      setError('Please provide a booking reference code.');
      return;
    }

    setIsLoading(true);

    try {
      const url = `/api/bookings/lookup?reference=${encodeURIComponent(reference.trim())}${email ? `&email=${encodeURIComponent(email.trim())}` : ''
        }`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No matching booking record found.');
      }

      setLookupResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lookup failed.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-20 w-full space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-wider font-semibold text-[#86868b]">
            Guest Portal
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
            Find your reservation.
          </h1>
          <p className="text-sm text-[#86868b] max-w-md mx-auto">
            Access your itinerary, room assignment, tax receipts, or check-in instructions.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-[#f5f5f7] border border-black/[0.04] rounded-3xl p-6 sm:p-8 space-y-4">
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#86868b] mb-1 font-semibold">
                  Booking Reference *
                </label>
                <input
                  type="text"
                  required
                  autoCapitalize="characters"
                  autoCorrect="off"
                  placeholder="e.g. ARN-2026-8942"
                  value={reference}
                  onChange={(e) => setReference(e.target.value.toUpperCase())}
                  className="w-full h-12 bg-white border border-black/[0.12] rounded-2xl px-4 text-base sm:text-sm font-mono text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#86868b] mb-1 font-semibold">
                  Guest Email (Optional)
                </label>
                <input
                  type="email"
                  inputMode="email"
                  placeholder="e.g. rameshwar@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-white border border-black/[0.12] rounded-2xl px-4 text-base sm:text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-xs font-semibold tracking-tight transition-all flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 disabled:opacity-60"
            >
              <span>{isLoading ? 'Searching…' : 'Find Reservation'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Lookup Result View */}
        {lookupResult && (
          <div className="bg-[#f5f5f7] border border-black/[0.04] rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.08]">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#86868b] font-semibold block">
                  Reference
                </span>
                <span className="font-mono text-xl font-semibold text-[#0071e3]">
                  {lookupResult.booking.bookingReference}
                </span>
              </div>

              <Link
                href={`/booking/confirmation/${lookupResult.booking.bookingReference}`}
                className="text-xs text-[#0071e3] hover:underline font-medium flex items-center space-x-1"
              >
                <span>Full voucher &gt;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-black/[0.04] space-y-1">
                <span className="text-[#86868b] block">Suite</span>
                <span className="font-semibold text-[#1d1d1f] block">
                  {lookupResult.roomType?.name}
                </span>
                {lookupResult.booking.assignedRoomNumber && (
                  <span className="text-[#0071e3] font-mono">
                    Room #{lookupResult.booking.assignedRoomNumber}
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white border border-black/[0.04] space-y-1">
                <span className="text-[#86868b] block">Dates</span>
                <span className="font-semibold text-[#1d1d1f] block">
                  {formatDisplayDate(lookupResult.booking.checkInDate)}
                </span>
                <span className="text-[#86868b]">{lookupResult.booking.numNights} Nights</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-black/[0.04] space-y-1">
                <span className="text-[#86868b] block">Status</span>
                <span className="font-semibold text-emerald-600 uppercase tracking-wider block">
                  {lookupResult.booking.status.replace('_', ' ')}
                </span>
                <span className="text-[#86868b]">{formatPaise(lookupResult.booking.paidAmountPaise)}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

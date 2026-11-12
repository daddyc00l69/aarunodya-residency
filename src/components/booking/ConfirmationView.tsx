'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Building2, 
  FileText, 
  ArrowLeft,
  Search,
  PhoneCall,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { formatPaise } from '@/lib/utils/currency';
import { formatDisplayDate } from '@/lib/utils/dates';
import { PrintButton } from '@/components/booking/PrintButton';
import { WhatsAppShareButton } from '@/components/booking/WhatsAppShareButton';
import { BookingQrCode } from '@/components/booking/BookingQrCode';
import { Booking, RoomType, Guest, Payment } from '@/lib/types';

interface BookingResult {
  booking: Booking;
  roomType?: RoomType;
  guest?: Guest;
  payments: Payment[];
}

interface ConfirmationViewProps {
  reference: string;
  initialData: BookingResult | null;
}

export function ConfirmationView({ reference, initialData }: ConfirmationViewProps) {
  const [data, setData] = useState<BookingResult | null>(initialData);
  const [isRecovering, setIsRecovering] = useState<boolean>(!initialData);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  // Manual lookup fields if needed
  const [lookupEmailOrPhone, setLookupEmailOrPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setIsRecovering(false);
      return;
    }

    let isMounted = true;

    async function recoverReservation() {
      setIsRecovering(true);
      setRecoveryError(null);

      try {
        // Step 1: Check client-side localStorage
        if (typeof window !== 'undefined') {
          const storedToken =
            localStorage.getItem(`arn_token_${reference}`) ||
            localStorage.getItem('arn_latest_token');

          const storedBookingRaw =
            localStorage.getItem(`arn_booking_${reference}`) ||
            localStorage.getItem('arn_latest_booking');

          if (storedToken || storedBookingRaw) {
            // Attempt server-side background sync
            try {
              const syncRes = await fetch('/api/bookings/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  reference,
                  token: storedToken,
                  data: storedBookingRaw ? { booking: JSON.parse(storedBookingRaw) } : undefined
                })
              });

              if (syncRes.ok) {
                const syncData = await syncRes.json();
                if (isMounted && syncData.booking) {
                  setData({
                    booking: syncData.booking,
                    roomType: syncData.roomType,
                    guest: syncData.guest,
                    payments: syncData.payments || []
                  });
                  setIsRecovering(false);
                  return;
                }
              }
            } catch (err) {
              console.warn('Sync attempt notice:', err);
            }

            // If sync fetch fails, hydrate directly from local storage
            if (storedBookingRaw) {
              const parsedBooking = JSON.parse(storedBookingRaw);
              if (
                isMounted &&
                parsedBooking.bookingReference &&
                parsedBooking.bookingReference.toUpperCase() === reference.toUpperCase()
              ) {
                setData({
                  booking: parsedBooking,
                  roomType: parsedBooking.roomType,
                  guest: parsedBooking.guest,
                  payments: []
                });
                setIsRecovering(false);
                return;
              }
            }
          }
        }

        // Step 2: Try standard API lookup
        const lookupRes = await fetch(`/api/bookings/lookup?reference=${encodeURIComponent(reference)}`);
        if (lookupRes.ok) {
          const lookupData = await lookupRes.json();
          if (isMounted && lookupData.booking) {
            setData(lookupData);
            setIsRecovering(false);
            return;
          }
        }

        if (isMounted) {
          setIsRecovering(false);
          setRecoveryError('Reservation record is being finalized or reference needs verification.');
        }
      } catch (err: unknown) {
        if (isMounted) {
          setIsRecovering(false);
          setRecoveryError('Unable to connect to reservation service. Please verify your reference.');
        }
      }
    }

    recoverReservation();

    return () => {
      isMounted = false;
    };
  }, [reference, initialData]);

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupEmailOrPhone.trim()) return;

    setIsSearching(true);
    setRecoveryError(null);

    try {
      const url = `/api/bookings/lookup?reference=${encodeURIComponent(reference)}&email=${encodeURIComponent(
        lookupEmailOrPhone.trim()
      )}`;
      const res = await fetch(url);
      const resData = await res.json();

      if (!res.ok || !resData.booking) {
        throw new Error(resData.error || 'No matching reservation found for this reference and contact.');
      }

      setData(resData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reservation lookup failed.';
      setRecoveryError(msg);
    } finally {
      setIsSearching(false);
    }
  };

  // State 1: Loading / Recovering State
  if (isRecovering) {
    return (
      <div className="min-h-screen bg-white text-[#1d1d1f] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-lg mx-auto px-4 pt-36 pb-20 w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0071e3] mx-auto animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">
            Retrieving Booking Voucher
          </h2>
          <p className="text-xs text-[#86868b] max-w-sm mx-auto">
            Locating confirmed reservation details for reference <strong className="font-mono text-[#0071e3]">{reference}</strong>...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  // State 2: Not found after recovery attempt -> Friendly Devotee Lookup Card (NO RAW 404!)
  if (!data || !data.booking) {
    return (
      <div className="min-h-screen bg-white text-[#1d1d1f] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-[#86868b]">
              Reservation Assistance
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
              Locate Your Booking
            </h1>
            <p className="text-xs sm:text-sm text-[#86868b] max-w-md mx-auto">
              We received reference <strong className="font-mono text-[#0071e3]">{reference}</strong>. If your payment was just completed, your booking is safe and being indexed.
            </p>
          </div>

          <div className="bg-[#f5f5f7] border border-black/[0.08] rounded-3xl p-6 sm:p-8 space-y-5">
            {recoveryError && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{recoveryError}</span>
              </div>
            )}

            <form onSubmit={handleManualSearch} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#86868b] mb-1 font-semibold">
                  Verify with Guest Email or Phone
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. devotee@example.com or 9876543210"
                  value={lookupEmailOrPhone}
                  onChange={(e) => setLookupEmailOrPhone(e.target.value)}
                  className="w-full h-12 bg-white border border-black/[0.12] rounded-2xl px-4 text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-xs font-medium tracking-tight transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching reservation...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Find Booking Voucher</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs text-[#86868b] gap-3">
              <span>Need immediate assistance?</span>
              <a
                href="tel:8530000820"
                className="inline-flex items-center space-x-1.5 text-[#0071e3] font-medium hover:underline"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Host Yuvaraj: 8530000820</span>
              </a>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-[#86868b] hover:text-[#1d1d1f]">
              ← Return to homepage
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // State 3: Confirmed Voucher View
  const { booking, roomType, guest, payments } = data;

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] flex flex-col font-sans print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20 w-full print:pt-4 print:pb-4">
        {/* Success Header */}
        <div className="text-center space-y-3 mb-10 print:hidden">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-[#86868b]">
            Booking Confirmed
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            You're all set, {guest?.fullName?.split(' ')[0] || 'Guest'}.
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] max-w-md mx-auto">
            Your reservation details and official tax receipt have been confirmed for <strong>{guest?.email}</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <PrintButton />
            <WhatsAppShareButton booking={booking} guest={guest} roomType={roomType} />
            <Link
              href={`/booking/invoice/${booking.bookingReference}`}
              className="text-xs text-[#0071e3] bg-blue-50/60 hover:bg-blue-100/60 px-4 py-2 border border-blue-200 rounded-full transition-colors font-medium flex items-center space-x-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>GST Tax Invoice</span>
            </Link>
            <Link
              href="/booking/lookup"
              className="text-xs text-[#86868b] hover:text-[#1d1d1f] px-4 py-2 border border-black/[0.08] rounded-full transition-colors"
            >
              Lookup Reservation
            </Link>
          </div>
        </div>

        {/* Voucher & Tax Invoice Card */}
        <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-3xl p-5 sm:p-10 space-y-6 sm:space-y-8 print:bg-white print:border-black print:text-black print:p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-black/[0.08] gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] flex items-center justify-center text-white print:hidden shadow-sm shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block font-semibold text-base sm:text-lg text-[#1d1d1f] print:text-black">
                  Aarunodya Residency Bhakt Niwas
                </span>
                <span className="block text-[11px] text-[#86868b] print:text-stone-700">
                  1563 Ghongade Galli, Nath Chowk, Pandharpur • Near Vitthal Mandir
                </span>
                <span className="block text-[11px] text-[#0071e3] print:text-black font-medium">
                  Host: Yuvaraj Malave (8530000820 / 9172464746)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end space-x-4 bg-white sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-black/[0.06]">
              <div className="sm:text-right">
                <span className="text-[10px] sm:text-[11px] text-[#86868b] block font-semibold uppercase tracking-wider">
                  Booking Reference
                </span>
                <span className="font-mono text-lg sm:text-2xl font-semibold text-[#0071e3] print:text-black">
                  {booking.bookingReference}
                </span>
              </div>
              <div className="shrink-0">
                <BookingQrCode reference={booking.bookingReference} size={84} />
              </div>
            </div>
          </div>

          {/* Stay & Room Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-white border border-black/[0.04] text-xs">
            <div className="space-y-1">
              <span className="text-[#86868b] block">Accommodation</span>
              <span className="font-semibold text-sm text-[#1d1d1f] block">{roomType?.name || 'Deluxe Accommodation'}</span>
              <span className="text-[#86868b] block">{roomType?.viewType || 'Temple Town View'}</span>
              {booking.assignedRoomNumber && (
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[11px] font-mono font-medium">
                  Allocated Room #{booking.assignedRoomNumber}
                </span>
              )}
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[#86868b] block">Devotee / Guest Details</span>
              <span className="font-semibold text-[#1d1d1f] text-sm block">{guest?.fullName}</span>
              <span className="text-[#86868b] block">{guest?.phone} • {guest?.email}</span>
              <span className="text-[#86868b] block">{booking.numAdults} Devotee{booking.numAdults > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Check-In / Check-Out */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-black/[0.04] space-y-1">
              <span className="text-[#86868b] block">Check-In</span>
              <span className="font-semibold text-[#1d1d1f] block">{formatDisplayDate(booking.checkInDate)}</span>
              <span className="text-[#0071e3] text-[11px] font-medium">From 12:00 PM</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-black/[0.04] space-y-1">
              <span className="text-[#86868b] block">Check-Out</span>
              <span className="font-semibold text-[#1d1d1f] block">{formatDisplayDate(booking.checkOutDate)}</span>
              <span className="text-[#0071e3] text-[11px] font-medium">By 11:00 AM</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-black/[0.04] space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[#86868b] block">Duration & Inclusions</span>
              <span className="font-semibold text-[#1d1d1f] block">{booking.numNights} Night{booking.numNights > 1 ? 's' : ''}</span>
              <span className="text-emerald-600 text-[11px] font-medium">24/7 Hot Water & Wi-Fi</span>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#1d1d1f]">Tariff & Payment Breakdown</h3>

            <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden text-xs">
              <table className="w-full text-left">
                <tbody className="divide-y divide-black/[0.06]">
                  <tr>
                    <td className="py-2.5 px-4 text-[#86868b]">
                      {roomType?.name || 'Deluxe Room'} ({booking.numNights} night{booking.numNights > 1 ? 's' : ''})
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-[#1d1d1f]">
                      {formatPaise(booking.subtotalPaise)}
                    </td>
                  </tr>
                  {booking.resortFeePaise > 0 && (
                    <tr>
                      <td className="py-2.5 px-4 text-[#86868b]">Facility Fee</td>
                      <td className="py-2.5 px-4 text-right font-medium text-[#1d1d1f]">
                        {formatPaise(booking.resortFeePaise)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2.5 px-4 text-[#86868b]">GST (12% Accommodation)</td>
                    <td className="py-2.5 px-4 text-right font-medium text-[#1d1d1f]">
                      {formatPaise(booking.taxPaise)}
                    </td>
                  </tr>
                  <tr className="bg-[#f5f5f7] font-semibold text-[#1d1d1f]">
                    <td className="py-3 px-4">Total Amount Paid</td>
                    <td className="py-3 px-4 text-right text-sm text-[#0071e3]">
                      {formatPaise(booking.totalAmountPaise)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {payments.length > 0 && (
              <p className="text-[11px] text-[#86868b]">
                Payment Ref: <span className="font-mono text-[#1d1d1f]">{payments[0]?.transactionReference}</span> • Gateway: {payments[0]?.razorpayPaymentId || 'Verified & Settled'}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center print:hidden">
          <Link
            href="/"
            className="text-xs text-[#0071e3] hover:underline"
          >
            ← Return to home
          </Link>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}


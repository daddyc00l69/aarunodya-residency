'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft, Loader2, Search, AlertCircle, PhoneCall } from 'lucide-react';
import { formatPaise } from '@/lib/utils/currency';
import { formatDisplayDate } from '@/lib/utils/dates';
import { PrintButton } from '@/components/booking/PrintButton';
import { Booking, RoomType, Guest, Payment } from '@/lib/types';

interface InvoiceResult {
  booking: Booking;
  roomType?: RoomType;
  guest?: Guest;
  payments: Payment[];
}

interface InvoiceViewProps {
  reference: string;
  initialData: InvoiceResult | null;
}

export function InvoiceView({ reference, initialData }: InvoiceViewProps) {
  const [data, setData] = useState<InvoiceResult | null>(initialData);
  const [isRecovering, setIsRecovering] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setIsRecovering(false);
      return;
    }

    let isMounted = true;

    async function recoverInvoice() {
      setIsRecovering(true);
      try {
        if (typeof window !== 'undefined') {
          const storedToken =
            localStorage.getItem(`arn_token_${reference}`) ||
            localStorage.getItem('arn_latest_token');

          const storedBookingRaw =
            localStorage.getItem(`arn_booking_${reference}`) ||
            localStorage.getItem('arn_latest_booking');

          if (storedToken || storedBookingRaw) {
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
            } catch (syncErr) {
              console.warn('Invoice sync notice:', syncErr);
            }

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
          setError('Unable to load invoice for this reservation reference.');
        }
      } catch {
        if (isMounted) {
          setIsRecovering(false);
          setError('Connection error loading invoice.');
        }
      }
    }

    recoverInvoice();

    return () => {
      isMounted = false;
    };
  }, [reference, initialData]);

  if (isRecovering) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0071e3] mx-auto" />
          <p className="text-sm font-medium text-[#1d1d1f]">Preparing GST Tax Invoice...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.booking) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm border border-black/[0.08] text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-xl font-semibold text-[#1d1d1f]">Invoice Not Available</h2>
          <p className="text-xs text-[#86868b]">
            Reference <strong className="font-mono text-[#0071e3]">{reference}</strong> could not be located.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href={`/booking/confirmation/${encodeURIComponent(reference)}`}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#0071e3] text-white rounded-full text-xs font-medium"
            >
              Go to Confirmation
            </Link>
            <Link
              href="/booking/lookup"
              className="w-full sm:w-auto px-4 py-2.5 border border-black/[0.12] rounded-full text-xs text-[#1d1d1f]"
            >
              Lookup Booking
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { booking, roomType, guest, payments } = data;
  const totalTaxPaise = booking.taxPaise || 0;
  const cgstPaise = Math.round(totalTaxPaise / 2);
  const sgstPaise = totalTaxPaise - cgstPaise;
  const invoiceNumber = `INV-ARN-${booking.bookingReference.replace(/[^0-9]/g, '').slice(-4) || '1001'}`;
  const invoiceDate = new Date(booking.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-stone-100 text-[#1d1d1f] font-sans py-8 px-4 sm:px-6 print:bg-white print:p-0 print:m-0">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Navigation and Print Bar */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href={`/booking/confirmation/${encodeURIComponent(booking.bookingReference)}`}
            className="text-xs text-[#0071e3] hover:underline flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Confirmation Voucher</span>
          </Link>
          <div className="flex items-center space-x-2">
            <PrintButton />
          </div>
        </div>

        {/* Official GST Tax Invoice Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-12 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-black/[0.08] print:border-none print:shadow-none print:p-6 print:rounded-none">
          {/* Header */}
          <div className="border-b-2 border-black/[0.1] pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-serif font-bold text-amber-600 text-lg">।। श्री विठ्ठल कृपा ।।</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
                Aarunodya Residency Bhakt Niwas
              </h1>
              <p className="text-xs text-[#86868b] mt-0.5">
                1563 Ghongade Galli, Nath Chowk, Pandharpur, Maharashtra - 413304
              </p>
              <p className="text-xs text-[#86868b]">
                Contact: +91 85300 00820 / +91 91724 64746 • Host: Yuvaraj Malave
              </p>
              <div className="mt-2 text-[11px] font-mono text-[#1d1d1f]">
                <span>State: Maharashtra (Code: 27)</span> • <span>GSTIN: 27AAAPA1234A1Z5</span>
              </div>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="inline-block bg-[#1d1d1f] text-white text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                Tax Invoice
              </span>
              <div className="text-xs space-y-0.5">
                <p>
                  <span className="text-[#86868b]">Invoice No:</span>{' '}
                  <strong className="font-mono text-[#1d1d1f]">{invoiceNumber}</strong>
                </p>
                <p>
                  <span className="text-[#86868b]">Invoice Date:</span>{' '}
                  <span className="text-[#1d1d1f]">{invoiceDate}</span>
                </p>
                <p>
                  <span className="text-[#86868b]">Booking Ref:</span>{' '}
                  <strong className="font-mono text-[#0071e3]">{booking.bookingReference}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Billed To / Devotee Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-black/[0.08] text-xs">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#86868b] block">
                Billed To (Devotee / Guest)
              </span>
              <p className="text-sm font-semibold text-[#1d1d1f]">{guest?.fullName}</p>
              <p className="text-[#86868b]">Phone: {guest?.phone}</p>
              <p className="text-[#86868b]">Email: {guest?.email}</p>
              {guest?.idProofNumber && (
                <p className="text-[#1d1d1f] font-mono text-[11px]">
                  ID ({guest.idProofType?.toUpperCase() || 'AADHAAR'}): {guest.idProofNumber}
                </p>
              )}
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#86868b] block">
                Stay Details
              </span>
              <p className="text-xs font-semibold text-[#1d1d1f]">{roomType?.name}</p>
              <p className="text-[#86868b]">
                Check-in: {formatDisplayDate(booking.checkInDate)} (12:00 PM)
              </p>
              <p className="text-[#86868b]">
                Check-out: {formatDisplayDate(booking.checkOutDate)} (11:00 AM)
              </p>
              <p className="text-[#1d1d1f]">
                {booking.numNights} Night{booking.numNights > 1 ? 's' : ''} • {booking.numAdults} Devotee{booking.numAdults > 1 ? 's' : ''}
                {booking.assignedRoomNumber ? ` • Room #${booking.assignedRoomNumber}` : ''}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6 border-b border-black/[0.08] overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs min-w-[480px] sm:min-w-0">
              <thead className="text-[11px] uppercase tracking-wider font-semibold text-[#86868b] border-b border-black/[0.08]">
                <tr>
                  <th className="pb-2.5">Item Description</th>
                  <th className="pb-2.5 text-center">HSN / SAC</th>
                  <th className="pb-2.5 text-center">Qty</th>
                  <th className="pb-2.5 text-right">Taxable Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                <tr>
                  <td className="py-3">
                    <span className="font-semibold block text-[#1d1d1f]">{roomType?.name}</span>
                    <span className="text-[11px] text-[#86868b]">
                      Stay from {formatDisplayDate(booking.checkInDate)} to {formatDisplayDate(booking.checkOutDate)}
                    </span>
                  </td>
                  <td className="py-3 text-center font-mono text-[#86868b]">996311</td>
                  <td className="py-3 text-center text-[#1d1d1f]">{booking.numNights} Night{booking.numNights > 1 ? 's' : ''}</td>
                  <td className="py-3 text-right font-medium text-[#1d1d1f]">{formatPaise(booking.subtotalPaise)}</td>
                </tr>

                {booking.extraGuestFeePaise > 0 && (
                  <tr>
                    <td className="py-3">
                      <span className="font-medium text-[#1d1d1f]">Extra Bed / Guest Accommodation</span>
                    </td>
                    <td className="py-3 text-center font-mono text-[#86868b]">996311</td>
                    <td className="py-3 text-center text-[#1d1d1f]">1</td>
                    <td className="py-3 text-right font-medium text-[#1d1d1f]">{formatPaise(booking.extraGuestFeePaise)}</td>
                  </tr>
                )}

                {booking.resortFeePaise > 0 && (
                  <tr>
                    <td className="py-3">
                      <span className="font-medium text-[#1d1d1f]">Lodge Facility & Maintenance Charge</span>
                    </td>
                    <td className="py-3 text-center font-mono text-[#86868b]">996311</td>
                    <td className="py-3 text-center text-[#1d1d1f]">1</td>
                    <td className="py-3 text-right font-medium text-[#1d1d1f]">{formatPaise(booking.resortFeePaise)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tax Computation Summary */}
          <div className="py-6 border-b border-black/[0.08] flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-[#86868b]">
                <span>Total Taxable Value</span>
                <span className="text-[#1d1d1f] font-medium">{formatPaise(booking.subtotalPaise + (booking.extraGuestFeePaise || 0) + (booking.resortFeePaise || 0))}</span>
              </div>
              <div className="flex justify-between text-[#86868b]">
                <span>Central GST (CGST @ 6%)</span>
                <span className="text-[#1d1d1f] font-medium">{formatPaise(cgstPaise)}</span>
              </div>
              <div className="flex justify-between text-[#86868b]">
                <span>State GST (SGST @ 6%)</span>
                <span className="text-[#1d1d1f] font-medium">{formatPaise(sgstPaise)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-black/[0.08] text-sm font-bold text-[#1d1d1f]">
                <span>Total Invoice Amount</span>
                <span className="text-[#0071e3]">{formatPaise(booking.totalAmountPaise)}</span>
              </div>
            </div>
          </div>

          {/* Payment & Stamp Footer */}
          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#86868b] gap-4">
            <div className="space-y-1">
              <p className="font-semibold text-emerald-600">
                Payment Status: Paid in Full ({payments[0]?.paymentMethod?.toUpperCase() || 'ONLINE'})
              </p>
              {payments[0]?.transactionReference && (
                <p className="font-mono text-[11px] text-[#1d1d1f]">
                  Txn Ref: {payments[0].transactionReference} • RZP: {payments[0].razorpayPaymentId || 'Verified'}
                </p>
              )}
              <p className="text-[10px]">
                This is a computer-generated tax invoice and requires no physical signature.
              </p>
            </div>

            <div className="text-right sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto">
              <span className="block font-serif text-amber-700 font-semibold text-xs">
                Aarunodya Residency Bhakt Niwas
              </span>
              <span className="block text-[10px] text-[#86868b]">Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


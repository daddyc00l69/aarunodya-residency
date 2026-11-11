import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Building2, 
  FileText, 
  ArrowLeft,
  Sparkles,
  MapPin,
  PhoneCall
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getDb } from '@/lib/db';
import { formatPaise } from '@/lib/utils/currency';
import { formatDisplayDate } from '@/lib/utils/dates';
import { PrintButton } from '@/components/booking/PrintButton';
import { WhatsAppShareButton } from '@/components/booking/WhatsAppShareButton';
import { BookingQrCode } from '@/components/booking/BookingQrCode';

interface ConfirmationPageProps {
  params: Promise<{
    reference: string;
  }>;
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { reference } = await params;
  const db = getDb();
  const result = await db.getBookingByReference(reference);

  if (!result || !result.booking) {
    notFound();
  }

  const { booking, roomType, guest, payments } = result;

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
            You're all set, {guest?.fullName?.split(' ')[0]}.
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] max-w-md mx-auto">
            Your reservation details and official tax receipt have been sent to <strong>{guest?.email}</strong>.
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
              <span className="font-semibold text-sm text-[#1d1d1f] block">{roomType?.name}</span>
              <span className="text-[#86868b] block">{roomType?.viewType}</span>
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
                    <td className="py-2.5 px-4 text-[#86868b]">{roomType?.name} ({booking.numNights} night{booking.numNights > 1 ? 's' : ''})</td>
                    <td className="py-2.5 px-4 text-right font-medium text-[#1d1d1f]">{formatPaise(booking.subtotalPaise)}</td>
                  </tr>
                  {booking.resortFeePaise > 0 && (
                    <tr>
                      <td className="py-2.5 px-4 text-[#86868b]">Facility Fee</td>
                      <td className="py-2.5 px-4 text-right font-medium text-[#1d1d1f]">{formatPaise(booking.resortFeePaise)}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2.5 px-4 text-[#86868b]">GST (12% Accommodation)</td>
                    <td className="py-2.5 px-4 text-right font-medium text-[#1d1d1f]">{formatPaise(booking.taxPaise)}</td>
                  </tr>
                  <tr className="bg-[#f5f5f7] font-semibold text-[#1d1d1f]">
                    <td className="py-3 px-4">Total Amount Paid</td>
                    <td className="py-3 px-4 text-right text-sm text-[#0071e3]">{formatPaise(booking.totalAmountPaise)}</td>
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

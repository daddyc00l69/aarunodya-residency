import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Building2, Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getDb } from '@/lib/db';
import { formatPaise } from '@/lib/utils/currency';
import { formatDisplayDate } from '@/lib/utils/dates';
import { PrintButton } from '@/components/booking/PrintButton';

interface InvoicePageProps {
  params: Promise<{
    reference: string;
  }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { reference } = await params;
  const db = getDb();
  const result = await db.getBookingByReference(reference);

  if (!result || !result.booking) {
    notFound();
  }

  const { booking, roomType, guest, payments } = result;

  // Financial breakdown calculation
  // GST 12% is split into 6% CGST + 6% SGST
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
            href={`/booking/confirmation/${booking.bookingReference}`}
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
              </tbody>
            </table>
          </div>

          {/* Tax Calculation & Totals */}
          <div className="py-6 flex flex-col sm:flex-row justify-between gap-6 border-b border-black/[0.08] text-xs">
            <div className="space-y-2 max-w-sm">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#86868b] block">
                Payment &amp; Settlement
              </span>
              <div className="bg-[#f5f5f7] rounded-2xl p-3 space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Payment Status: Paid &amp; Confirmed</span>
                </div>
                {payments.length > 0 && (
                  <p className="text-[11px] text-[#86868b] font-mono">
                    Gateway Ref: {payments[0]?.razorpayPaymentId || payments[0]?.transactionReference}
                  </p>
                )}
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between py-1 text-[#86868b]">
                <span>Taxable Subtotal:</span>
                <span className="font-medium text-[#1d1d1f]">{formatPaise(booking.subtotalPaise + (booking.extraGuestFeePaise || 0))}</span>
              </div>
              <div className="flex justify-between py-1 text-[#86868b]">
                <span>CGST (6.0%):</span>
                <span className="font-medium text-[#1d1d1f]">{formatPaise(cgstPaise)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#86868b]">
                <span>SGST (6.0%):</span>
                <span className="font-medium text-[#1d1d1f]">{formatPaise(sgstPaise)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-black/[0.1] font-bold text-sm text-[#1d1d1f]">
                <span>Total Amount:</span>
                <span className="text-[#0071e3]">{formatPaise(booking.totalAmountPaise)}</span>
              </div>
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="pt-6 flex flex-col sm:flex-row items-end justify-between gap-6 text-xs text-[#86868b]">
            <div className="space-y-1">
              <p className="font-semibold text-[#1d1d1f]">Terms &amp; Declarations:</p>
              <p>1. Check-in time: 12:00 PM | Check-out time: 11:00 AM.</p>
              <p>2. This is a computer-generated tax invoice under GST Rules.</p>
              <p>3. Pandharpur Jurisdiction only.</p>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="h-12 flex items-end justify-end">
                <span className="font-serif italic text-stone-700 font-bold border-b border-black text-sm px-4 pb-0.5">
                  Yuvaraj Malave
                </span>
              </div>
              <p className="font-semibold text-[#1d1d1f] text-[11px]">Authorized Signatory</p>
              <p className="text-[10px]">Aarunodya Residency Bhakt Niwas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


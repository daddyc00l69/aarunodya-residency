'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  X, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';
import { Booking } from '@/lib/types';
import { formatPaise } from '@/lib/utils/currency';
import { formatDisplayDate } from '@/lib/utils/dates';

interface GuestFolioModalProps {
  booking: Booking;
}

export function GuestFolioModal({ booking }: GuestFolioModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [idType, setIdType] = useState<string>(booking.guest?.idProofType || 'aadhaar');
  const [idNumber, setIdNumber] = useState<string>(booking.guest?.idProofNumber || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveId = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          status: booking.status,
          guestUpdates: {
            idProofType: idType,
            idProofNumber: idNumber
          }
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update guest ID proof');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-[11px] text-[#86868b] hover:text-[#1d1d1f] hover:underline block"
      >
        Folio &amp; ID Details
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-black/[0.08] space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 text-left">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-black/[0.06]">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#86868b] block">
                  Guest Folio &amp; Police Verification
                </span>
                <h3 className="text-xl font-semibold text-[#1d1d1f]">
                  {booking.bookingReference}
                </h3>
                <span className="text-xs text-[#0071e3] font-medium">
                  {booking.roomType?.name} {booking.assignedRoomNumber ? `(Room #${booking.assignedRoomNumber})` : ''}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guest Contact Details */}
            <div className="bg-[#f5f5f7] rounded-2xl p-4 space-y-2 text-xs">
              <span className="font-semibold text-[#1d1d1f] block text-[11px] uppercase tracking-wider text-[#86868b]">
                Contact Info
              </span>
              <div className="flex items-center space-x-2 text-[#1d1d1f]">
                <User className="w-3.5 h-3.5 text-[#86868b]" />
                <span className="font-medium text-sm">{booking.guest?.fullName}</span>
              </div>
              <div className="flex items-center space-x-2 text-[#86868b]">
                <Phone className="w-3.5 h-3.5" />
                <span>{booking.guest?.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-[#86868b]">
                <Mail className="w-3.5 h-3.5" />
                <span>{booking.guest?.email}</span>
              </div>
            </div>

            {/* Stay Dates */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-2xl border border-black/[0.06] space-y-1">
                <span className="text-[#86868b] block text-[10px] uppercase font-semibold">Check-In</span>
                <span className="font-semibold text-[#1d1d1f] block">{formatDisplayDate(booking.checkInDate)}</span>
                <span className="text-[11px] text-[#0071e3]">12:00 PM</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-black/[0.06] space-y-1">
                <span className="text-[#86868b] block text-[10px] uppercase font-semibold">Check-Out</span>
                <span className="font-semibold text-[#1d1d1f] block">{formatDisplayDate(booking.checkOutDate)}</span>
                <span className="text-[11px] text-[#0071e3]">11:00 AM</span>
              </div>
            </div>

            {/* Government ID Proof Recording (Mandatory for Indian Hotel Register) */}
            <form onSubmit={handleSaveId} className="bg-white p-4 rounded-2xl border border-black/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1d1d1f] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Devotee ID Verification (Lodge Register)</span>
                </span>
                {saveSuccess && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#86868b] mb-1">
                    ID Document Type
                  </label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0071e3]"
                  >
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="voter_id">Voter ID Card</option>
                    <option value="driving_license">Driving License</option>
                    <option value="passport">Passport</option>
                    <option value="other">Other Govt Photo ID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#86868b] mb-1">
                    ID Proof Number
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="e.g. 5849 2014 9382"
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#1d1d1f] text-white hover:bg-black transition-colors flex items-center space-x-1.5"
                >
                  {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Save ID Record</span>
                </button>
              </div>
            </form>

            {/* Financial Ledger & Invoice Links */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1d1d1f]">Financial Summary</span>
                <span className="text-xs font-bold text-[#0071e3]">
                  Total: {formatPaise(booking.totalAmountPaise)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/[0.06]">
                <Link
                  href={`/booking/invoice/${booking.bookingReference}`}
                  target="_blank"
                  className="px-4 py-2 bg-[#0071e3] text-white rounded-full text-xs font-medium hover:bg-[#0077ed] transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Print GST Tax Invoice</span>
                </Link>
                <Link
                  href={`/booking/confirmation/${booking.bookingReference}`}
                  target="_blank"
                  className="px-4 py-2 bg-[#f5f5f7] text-[#1d1d1f] rounded-full text-xs font-medium hover:bg-stone-200 transition-colors"
                >
                  View Guest Voucher
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


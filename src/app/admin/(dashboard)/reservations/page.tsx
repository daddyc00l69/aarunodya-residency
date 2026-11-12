'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ChevronRight, 
  Loader2,
  Phone,
  ArrowUpRight
} from 'lucide-react';
import { Booking } from '@/lib/types';
import { formatPaise } from '@/lib/utils/currency';
import { formatDisplayDate } from '@/lib/utils/dates';
import { ReservationStatusButtons } from '@/components/admin/ReservationStatusButtons';
import { WalkInModal } from '@/components/admin/WalkInModal';
import { GuestFolioModal } from '@/components/admin/GuestFolioModal';

export default function ReservationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const [resB, resAvail] = await Promise.all([
        fetch('/api/admin/bookings'),
        fetch('/api/availability')
      ]);
      const dataB = await resB.json();
      const dataAvail = await resAvail.json();
      if (dataB.bookings) {
        setBookings(dataB.bookings);
      }
      if (dataAvail.roomTypes) {
        setRoomTypes(dataAvail.roomTypes.map((i: any) => i.roomType));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      b.bookingReference.toLowerCase().includes(query) ||
      (b.guest?.fullName && b.guest.fullName.toLowerCase().includes(query)) ||
      (b.guest?.email && b.guest.email.toLowerCase().includes(query)) ||
      (b.assignedRoomNumber && b.assignedRoomNumber.includes(query));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase font-semibold tracking-wider text-[#86868b]">
            Front Desk
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-0.5">
            Reservations
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <WalkInModal roomTypes={roomTypes} />
          <button
            onClick={fetchBookings}
            className="text-xs text-[#0071e3] hover:underline font-medium"
          >
            Refresh records
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-4 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search Guest Name, Reference, Room #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl pl-10 pr-4 text-base sm:text-xs text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            {['all', 'confirmed', 'checked_in', 'checked_out', 'hold', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full text-xs capitalize whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-[#1d1d1f] text-white font-medium'
                    : 'bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-[#86868b] flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#0071e3]" />
            <span>Loading reservations…</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#86868b]">
            No reservations matching the search criteria.
          </div>
        ) : (
          <>
            {/* Mobile Cards Layout (< 768px, zero horizontal scrolling) */}
            <div className="md:hidden p-3.5 space-y-3">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-[#1d1d1f]">{b.guest?.fullName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-800">
                          Room #{b.assignedRoomNumber || '—'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="font-mono text-xs font-semibold text-[#0071e3]">
                          {b.bookingReference}
                        </span>
                        <span className="text-[10px] text-[#86868b]">• {b.roomType?.name}</span>
                      </div>
                    </div>

                    {b.guest?.phone && (
                      <a
                        href={`tel:${b.guest.phone}`}
                        className="w-8 h-8 rounded-full bg-white border border-black/[0.08] flex items-center justify-center text-emerald-700 shadow-sm active:scale-95"
                        title="Call Devotee"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-xl bg-white border border-black/[0.04]">
                    <div>
                      <span className="text-[10px] text-[#86868b] block">Stay Duration</span>
                      <span className="font-semibold text-[#1d1d1f]">
                        {formatDisplayDate(b.checkInDate)} → {formatDisplayDate(b.checkOutDate)} ({b.numNights}N)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#86868b] block">Total Tariff</span>
                      <span className="font-bold text-sm text-[#1d1d1f]">
                        {formatPaise(b.totalAmountPaise)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'checked_in'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'checked_out'
                          ? 'bg-stone-200 text-stone-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </span>

                    <ReservationStatusButtons
                      bookingId={b.id}
                      currentStatus={b.status}
                      guestName={b.guest?.fullName || ''}
                      assignedRoomId={b.assignedRoomId}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] text-xs">
                    <GuestFolioModal booking={b} />
                    <Link
                      href={`/booking/invoice/${b.bookingReference}`}
                      target="_blank"
                      className="text-xs text-[#0071e3] font-semibold hover:underline inline-flex items-center space-x-1"
                    >
                      <span>GST Invoice</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="text-[#86868b] uppercase tracking-wider font-semibold border-b border-black/[0.06]">
                  <tr>
                    <th className="py-3 px-4">Ref</th>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Suite / Room</th>
                    <th className="py-3 px-4">Stay Dates</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4 text-right">Desk Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] text-[#1d1d1f]">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#f5f5f7] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[#0071e3] font-semibold block">
                          {b.bookingReference}
                        </span>
                        <span className="text-[10px] text-[#86868b]">
                          {new Date(b.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <strong className="text-[#1d1d1f] block font-semibold">{b.guest?.fullName}</strong>
                        <span className="text-[11px] text-[#86868b] block">{b.guest?.email}</span>
                        <span className="text-[11px] text-[#86868b] block">{b.guest?.phone}</span>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <span className="text-[#1d1d1f] block font-medium">{b.roomType?.name}</span>
                        <span className="text-[#86868b] text-[11px] block">
                          {b.assignedRoomNumber ? `Room #${b.assignedRoomNumber}` : 'Unassigned'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <span className="block font-medium text-[#1d1d1f]">
                          {formatDisplayDate(b.checkInDate)}
                        </span>
                        <span className="text-[#86868b] block">
                          to {formatDisplayDate(b.checkOutDate)} ({b.numNights}N)
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : b.status === 'checked_in'
                              ? 'bg-blue-50 text-[#0071e3]'
                              : b.status === 'checked_out'
                              ? 'bg-stone-100 text-stone-600'
                              : b.status === 'hold'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5 font-medium">
                        <span className="block font-semibold">
                          {formatPaise(b.totalAmountPaise)}
                        </span>
                        <span className="text-[10px] text-[#86868b] block">
                          Paid: {formatPaise(b.paidAmountPaise)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-y-1">
                        <ReservationStatusButtons
                          bookingId={b.id}
                          currentStatus={b.status}
                          guestName={b.guest?.fullName || ''}
                          assignedRoomId={b.assignedRoomId}
                        />
                        <div className="flex items-center justify-end space-x-2 pt-1 text-[11px]">
                          <GuestFolioModal booking={b} />
                          <span className="text-stone-300">•</span>
                          <Link
                            href={`/booking/invoice/${b.bookingReference}`}
                            target="_blank"
                            className="text-[#0071e3] hover:underline"
                          >
                            GST Invoice &gt;
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

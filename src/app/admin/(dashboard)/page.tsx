import React from 'react';
import Link from 'next/link';
import { 
  BedDouble, 
  CalendarCheck, 
  TrendingUp, 
  Clock, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { getDb } from '@/lib/db';
import { formatPaise } from '@/lib/utils/currency';
import { formatDisplayDate } from '@/lib/utils/dates';
import { ReservationStatusButtons } from '@/components/admin/ReservationStatusButtons';

export default async function AdminDashboardPage() {
  const db = getDb();
  const kpis = await db.getDashboardKpis();
  const allBookings = await db.getAllBookings();
  const today = new Date().toISOString().split('T')[0];

  const todaysArrivals = allBookings.filter(b => b.checkInDate === today && ['confirmed', 'hold'].includes(b.status));
  const todaysDepartures = allBookings.filter(b => b.checkOutDate === today && b.status === 'checked_in');
  const recentBookings = [...allBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase font-semibold tracking-wider text-[#86868b]">
            Overview
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-0.5">
            Operations Deck
          </h1>
        </div>

        <Link
          href="/admin/reservations"
          className="inline-flex items-center space-x-1 text-xs text-[#0071e3] hover:underline font-medium"
        >
          <span>All Reservations Desk</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards Grid - Apple Clean Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#86868b] text-xs font-medium">
            <span>Occupancy</span>
            <BedDouble className="w-4 h-4 text-[#86868b]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">{kpis.occupancyPercent}%</span>
            <span className="text-xs text-[#86868b]">
              ({kpis.occupiedRooms}/{kpis.totalRooms})
            </span>
          </div>
          <div className="w-full bg-[#f5f5f7] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-[#0071e3] h-full rounded-full transition-all"
              style={{ width: `${kpis.occupancyPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#86868b] text-xs font-medium">
            <span>Captured Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#86868b]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
              {formatPaise(kpis.totalRevenuePaise)}
            </span>
          </div>
          <span className="text-[11px] text-[#86868b] block">
            Online & Desk Settlements
          </span>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#86868b] text-xs font-medium">
            <span>Today's Arrivals</span>
            <CalendarCheck className="w-4 h-4 text-[#86868b]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">{kpis.todaysArrivals}</span>
            <span className="text-xs text-[#86868b]">Guests</span>
          </div>
          <span className="text-[11px] text-[#0071e3] block">
            {todaysArrivals.length} Pending check-in
          </span>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#86868b] text-xs font-medium">
            <span>Room Cleaning</span>
            <Sparkles className="w-4 h-4 text-[#86868b]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">{kpis.dirtyRoomsCount}</span>
            <span className="text-xs text-[#86868b]">Need service</span>
          </div>
          <Link
            href="/admin/rooms"
            className="text-[11px] text-[#0071e3] hover:underline block"
          >
            Turnover Queue &gt;
          </Link>
        </div>
      </div>

      {/* Front Desk Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arrivals Queue */}
        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#1d1d1f]">Today's Arrivals</h3>
            <span className="text-xs bg-[#f5f5f7] text-[#86868b] px-2.5 py-0.5 rounded-full font-medium">
              {todaysArrivals.length} Scheduled
            </span>
          </div>

          {todaysArrivals.length === 0 ? (
            <p className="text-xs text-[#86868b] py-6 text-center">
              No pending check-ins for today.
            </p>
          ) : (
            <div className="space-y-2.5">
              {todaysArrivals.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-2xl bg-[#f5f5f7] flex items-center justify-between text-xs gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <strong className="text-[#1d1d1f] font-semibold">{b.guest?.fullName}</strong>
                      <span className="font-mono text-[#0071e3]">{b.bookingReference}</span>
                    </div>
                    <div className="text-[#86868b]">
                      {b.roomType?.name} • Room #{b.assignedRoomNumber || 'Unassigned'} • {b.numNights} Nights
                    </div>
                  </div>

                  <ReservationStatusButtons
                    bookingId={b.id}
                    currentStatus={b.status}
                    guestName={b.guest?.fullName || ''}
                    assignedRoomId={b.assignedRoomId}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Departures Queue */}
        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#1d1d1f]">Today's Departures</h3>
            <span className="text-xs bg-[#f5f5f7] text-[#86868b] px-2.5 py-0.5 rounded-full font-medium">
              {todaysDepartures.length} Scheduled
            </span>
          </div>

          {todaysDepartures.length === 0 ? (
            <p className="text-xs text-[#86868b] py-6 text-center">
              No pending departures for today.
            </p>
          ) : (
            <div className="space-y-2.5">
              {todaysDepartures.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-2xl bg-[#f5f5f7] flex items-center justify-between text-xs gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <strong className="text-[#1d1d1f] font-semibold">{b.guest?.fullName}</strong>
                      <span className="text-[#86868b]">Room #{b.assignedRoomNumber}</span>
                    </div>
                    <div className="text-[#86868b]">
                      {b.roomType?.name} • Settlement: {formatPaise(b.paidAmountPaise)}
                    </div>
                  </div>

                  <ReservationStatusButtons
                    bookingId={b.id}
                    currentStatus={b.status}
                    guestName={b.guest?.fullName || ''}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#1d1d1f]">Recent Activity</h3>
          <Link
            href="/admin/reservations"
            className="text-xs text-[#0071e3] hover:underline font-medium"
          >
            View all ({allBookings.length}) &gt;
          </Link>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="text-[#86868b] uppercase tracking-wider font-semibold border-b border-black/[0.06]">
              <tr>
                <th className="py-2.5 px-3">Ref</th>
                <th className="py-2.5 px-3">Guest</th>
                <th className="py-2.5 px-3">Suite</th>
                <th className="py-2.5 px-3">Dates</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] text-[#1d1d1f]">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#f5f5f7] transition-colors">
                  <td className="py-3 px-3 font-mono text-[#0071e3] font-semibold">
                    {b.bookingReference}
                  </td>
                  <td className="py-3 px-3 font-medium">
                    {b.guest?.fullName}
                  </td>
                  <td className="py-3 px-3 text-[#86868b]">
                    {b.roomType?.name} {b.assignedRoomNumber ? `(#${b.assignedRoomNumber})` : ''}
                  </td>
                  <td className="py-3 px-3 text-[#86868b]">
                    {formatDisplayDate(b.checkInDate)} → {formatDisplayDate(b.checkOutDate)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : b.status === 'checked_in'
                          ? 'bg-blue-50 text-[#0071e3]'
                          : b.status === 'checked_out'
                          ? 'bg-stone-100 text-stone-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    {formatPaise(b.totalAmountPaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

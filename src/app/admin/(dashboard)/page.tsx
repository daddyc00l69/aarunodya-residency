import React from 'react';
import Link from 'next/link';
import { 
  BedDouble, 
  CalendarCheck, 
  TrendingUp, 
  Clock, 
  Sparkles,
  ChevronRight,
  UserPlus,
  Coins,
  Users,
  CheckCircle2,
  AlertCircle,
  Tag,
  Phone,
  ArrowUpRight,
  ShieldCheck,
  DoorOpen,
  Calendar
} from 'lucide-react';
import { getDb } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { formatPaise } from '@/lib/utils/currency';
import { formatDisplayDate } from '@/lib/utils/dates';
import { ReservationStatusButtons } from '@/components/admin/ReservationStatusButtons';

export default async function AdminDashboardPage() {
  const session = await getCurrentAdminSession();
  const db = getDb();
  const kpis = await db.getDashboardKpis();
  const allBookings = await db.getAllBookings();
  const today = new Date().toISOString().split('T')[0];

  const todaysArrivals = allBookings.filter(b => b.checkInDate === today && ['confirmed', 'hold'].includes(b.status));
  const todaysDepartures = allBookings.filter(b => b.checkOutDate === today && b.status === 'checked_in');
  const recentBookings = [...allBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  const isManagement = ['super_admin', 'manager'].includes(session?.role || '');

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {/* Mobile-First Header Greeting & Shift Banner */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#86868b]">
              Front Desk Operations • Live
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 font-semibold uppercase text-stone-700">
              {session?.role.replace('_', ' ') || 'Staff'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Namaste, {session?.fullName?.split(' ')[0] || 'Staff'} 🙏
          </h1>
          <p className="text-xs text-[#86868b]">
            Aarunodya Residency Bhakt Niwas • 18 Physical Units • Pandharpur
          </p>
        </div>

        {/* Quick Date & Public Site Link */}
        <div className="flex items-center gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/[0.04]">
          <Link
            href="/admin/reception/walkin"
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-[#0071e3] text-white hover:bg-[#0077ed] font-semibold text-xs shadow-sm active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Walk-in</span>
          </Link>
          <Link
            href="/admin/reception/cash-register"
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-[#f5f5f7] hover:bg-stone-200/80 text-[#1d1d1f] font-semibold text-xs active:scale-95 transition-all"
          >
            <Coins className="w-4 h-4 text-amber-600" />
            <span>Cash Register</span>
          </Link>
        </div>
      </div>

      {/* Thumb-Zone Quick Action Bar (Mobile-Optimized Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <Link
          href="/admin/reception/walkin"
          className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 flex items-center space-x-3 active:scale-[0.98] transition-all hover:border-blue-200 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0071e3] text-white flex items-center justify-center shrink-0 shadow-sm">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#1d1d1f] truncate">Walk-in Desk</p>
            <p className="text-[11px] text-[#0071e3] truncate">Cash booking</p>
          </div>
        </Link>

        <Link
          href="/admin/rooms"
          className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 flex items-center space-x-3 active:scale-[0.98] transition-all hover:border-emerald-200 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <BedDouble className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#1d1d1f] truncate">Rooms Status</p>
            <p className="text-[11px] text-emerald-800 truncate">{kpis.cleanRoomsCount} Clean / {kpis.dirtyRoomsCount} Dirty</p>
          </div>
        </Link>

        <Link
          href="/admin/customers"
          className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/50 border border-purple-100 flex items-center space-x-3 active:scale-[0.98] transition-all hover:border-purple-200 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#1d1d1f] truncate">Guest CRM</p>
            <p className="text-[11px] text-purple-800 truncate">ID Vault & History</p>
          </div>
        </Link>

        <Link
          href="/admin/reservations"
          className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100 flex items-center space-x-3 active:scale-[0.98] transition-all hover:border-amber-200 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#1d1d1f] truncate">Desk Queue</p>
            <p className="text-[11px] text-amber-800 truncate">{todaysArrivals.length} In • {todaysDepartures.length} Out</p>
          </div>
        </Link>
      </div>

      {/* KPI Cards Grid - Apple Clean Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Occupancy Card */}
        <div className="bg-white border border-black/[0.06] rounded-3xl p-4 sm:p-5 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#86868b] text-xs font-medium">
            <span>Occupancy</span>
            <BedDouble className="w-4 h-4 text-[#86868b]" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
              {kpis.occupancyPercent}%
            </span>
            <span className="text-[11px] text-[#86868b]">
              ({kpis.occupiedRooms}/{kpis.totalRooms})
            </span>
          </div>
          <div className="w-full bg-[#f5f5f7] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#0071e3] h-full rounded-full transition-all"
              style={{ width: `${kpis.occupancyPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#86868b] pt-1">
            <span className="text-emerald-700 font-semibold">{kpis.availableRooms} Available</span>
            <span>{kpis.occupiedRooms} Checked In</span>
          </div>
        </div>

        {/* Today's Movement */}
        <div className="bg-white border border-black/[0.06] rounded-3xl p-4 sm:p-5 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#86868b] text-xs font-medium">
            <span>Today's Movements</span>
            <Clock className="w-4 h-4 text-[#86868b]" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div>
              <span className="text-2xl font-bold text-[#1d1d1f] block leading-none">{kpis.todaysArrivals}</span>
              <span className="text-[10px] text-[#0071e3] font-medium">Arrivals</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-[#1d1d1f] block leading-none">{kpis.todaysDepartures}</span>
              <span className="text-[10px] text-stone-600 font-medium">Departures</span>
            </div>
          </div>
          <Link
            href="/admin/reservations"
            className="text-[10px] text-[#0071e3] font-semibold hover:underline block pt-1"
          >
            Open Front Desk Queue &gt;
          </Link>
        </div>

        {/* Collections Today / Monthly */}
        <div className="bg-white border border-black/[0.06] rounded-3xl p-4 sm:p-5 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#86868b] text-xs font-medium">
            <span>{isManagement ? "Today's Collection" : "Desk Settlements"}</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-700 block">
              {formatPaise(kpis.todayCollectionPaise || kpis.totalRevenuePaise)}
            </span>
            <span className="text-[10px] text-[#86868b] block mt-0.5">
              {isManagement ? `Month: ${formatPaise(kpis.monthlyRevenuePaise)}` : 'Cash & Online Settled'}
            </span>
          </div>
          {kpis.pendingBalancePaise > 0 ? (
            <div className="text-[10px] text-amber-700 font-medium pt-1 border-t border-black/[0.04]">
              Due: {formatPaise(kpis.pendingBalancePaise)}
            </div>
          ) : (
            <div className="text-[10px] text-emerald-700 font-medium pt-1 border-t border-black/[0.04]">
              All stays fully settled
            </div>
          )}
        </div>

        {/* Room Cleanliness Queue */}
        <div className="bg-white border border-black/[0.06] rounded-3xl p-4 sm:p-5 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#86868b] text-xs font-medium">
            <span>Housekeeping</span>
            <Sparkles className="w-4 h-4 text-[#86868b]" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-red-600">
              {kpis.dirtyRoomsCount}
            </span>
            <span className="text-[11px] text-[#86868b]">Dirty Units</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#86868b] pt-1">
            <span className="text-emerald-700 font-medium">{kpis.cleanRoomsCount} Ready</span>
            <Link href="/admin/rooms" className="text-[#0071e3] font-semibold hover:underline">
              Turnover Queue &gt;
            </Link>
          </div>
        </div>
      </div>

      {/* Front Desk Queues: Arrivals & Departures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Arrivals Queue */}
        <div className="bg-white border border-black/[0.06] rounded-3xl p-5 space-y-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
            <div className="flex items-center space-x-2">
              <CalendarCheck className="w-4 h-4 text-[#0071e3]" />
              <h3 className="text-sm sm:text-base font-bold text-[#1d1d1f]">Today's Pending Arrivals</h3>
            </div>
            <span className="text-xs bg-blue-50 text-[#0071e3] font-bold px-2.5 py-0.5 rounded-full">
              {todaysArrivals.length}
            </span>
          </div>

          {todaysArrivals.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#86868b]">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5 opacity-80" />
              <span>All scheduled guests for today have checked in!</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaysArrivals.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <strong className="text-xs font-bold text-[#1d1d1f]">{b.guest?.fullName}</strong>
                        <span className="font-mono text-[11px] font-semibold text-[#0071e3]">{b.bookingReference}</span>
                      </div>
                      <p className="text-[11px] text-[#86868b] mt-0.5">
                        {b.roomType?.name} • Room #{b.assignedRoomNumber || 'Auto-assign'} • {b.numNights}N
                      </p>
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

                  <div className="flex items-center justify-between pt-1 border-t border-black/[0.04]">
                    <span className="text-[11px] font-semibold text-[#1d1d1f]">
                      {formatPaise(b.totalAmountPaise)}
                    </span>
                    <ReservationStatusButtons
                      bookingId={b.id}
                      currentStatus={b.status}
                      guestName={b.guest?.fullName || ''}
                      assignedRoomId={b.assignedRoomId}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Departures Queue */}
        <div className="bg-white border border-black/[0.06] rounded-3xl p-5 space-y-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
            <div className="flex items-center space-x-2">
              <DoorOpen className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm sm:text-base font-bold text-[#1d1d1f]">Today's Check-outs</h3>
            </div>
            <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
              {todaysDepartures.length}
            </span>
          </div>

          {todaysDepartures.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#86868b]">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5 opacity-80" />
              <span>No pending departures remaining for today.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaysDepartures.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <strong className="text-xs font-bold text-[#1d1d1f]">{b.guest?.fullName}</strong>
                        <span className="text-xs font-bold text-[#1d1d1f] bg-stone-200/70 px-2 py-0.5 rounded-md">
                          Room #{b.assignedRoomNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#86868b] mt-0.5">
                        {b.roomType?.name} • Paid: {formatPaise(b.paidAmountPaise)}
                      </p>
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

                  <div className="flex items-center justify-between pt-1 border-t border-black/[0.04]">
                    <span className="text-[11px] font-semibold text-[#1d1d1f]">
                      {(b.balanceDuePaise ?? b.remainingBalancePaise ?? (b.totalAmountPaise - (b.paidAmountPaise || 0))) > 0 ? (
                        <span className="text-amber-700">Due: {formatPaise(b.balanceDuePaise ?? b.remainingBalancePaise ?? (b.totalAmountPaise - (b.paidAmountPaise || 0)))}</span>
                      ) : (
                        <span className="text-emerald-700">Cleared</span>
                      )}
                    </span>
                    <ReservationStatusButtons
                      bookingId={b.id}
                      currentStatus={b.status}
                      guestName={b.guest?.fullName || ''}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity: Mobile Cards (< 768px) and Desktop Table (>= 768px) */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1d1d1f]">Recent Front Desk Activity</h3>
            <p className="text-[11px] text-[#86868b]">Latest bookings, walk-ins & payment settlements</p>
          </div>
          <Link
            href="/admin/reservations"
            className="text-xs text-[#0071e3] hover:underline font-semibold flex items-center space-x-1"
          >
            <span>View All ({allBookings.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile View: Clean Card Layout (Zero Horizontal Scroll!) */}
        <div className="md:hidden space-y-2.5">
          {recentBookings.map((b) => (
            <div
              key={b.id}
              className="p-3.5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1d1d1f] block">{b.guest?.fullName}</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-mono text-[10px] font-semibold text-[#0071e3]">{b.bookingReference}</span>
                    <span className="text-[10px] text-[#86868b]">
                      Room #{b.assignedRoomNumber || '—'}
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
              </div>

              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-black/[0.04]">
                <span className="text-[11px] text-[#86868b]">
                  {formatDisplayDate(b.checkInDate)} → {formatDisplayDate(b.checkOutDate)}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#1d1d1f]">{formatPaise(b.totalAmountPaise)}</span>
                  <Link
                    href={`/booking/invoice/${b.bookingReference}`}
                    target="_blank"
                    className="p-1 rounded-md text-[#0071e3] hover:bg-white"
                    title="View Receipt"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden md:block overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="text-[#86868b] uppercase tracking-wider font-semibold border-b border-black/[0.06]">
              <tr>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3">Devotee Guest</th>
                <th className="py-2.5 px-3">Suite / Room</th>
                <th className="py-2.5 px-3">Stay Dates</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Tariff</th>
                <th className="py-2.5 px-3 text-right">Receipt</th>
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
                  <td className="py-3 px-3 text-right font-semibold">
                    {formatPaise(b.totalAmountPaise)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/booking/invoice/${b.bookingReference}`}
                      target="_blank"
                      className="text-[#0071e3] hover:underline font-medium inline-flex items-center space-x-1"
                    >
                      <span>Receipt</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
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

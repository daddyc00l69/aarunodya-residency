import React from 'react';
import { getDb } from '@/lib/db';
import { formatDisplayDate, getOffsetDateString, doIntervalsOverlap } from '@/lib/utils/dates';

export default async function RoomCalendarPage() {
  const db = getDb();
  const rooms = await db.getRooms();
  const roomTypes = await db.getRoomTypes();
  const bookings = await db.getAllBookings();

  // Generate 14-day date window starting today
  const days: string[] = [];
  for (let i = 0; i < 14; i++) {
    days.push(getOffsetDateString(i));
  }

  const activeBookings = bookings.filter(b => ['confirmed', 'checked_in', 'hold'].includes(b.status));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <p className="text-xs uppercase font-semibold tracking-wider text-[#86868b]">
          Inventory Matrix
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-0.5">
          14-Day Room Calendar
        </h1>
        <p className="text-xs text-[#86868b] mt-1">
          Visual stay timeline across all operational physical suites. Check-in is inclusive; check-out is exclusive.
        </p>
      </div>

      {/* Calendar Matrix Card */}
      <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-3 text-left bg-white border border-black/[0.06] text-[#86868b] font-medium sticky left-0 z-20 min-w-[130px]">
                  Suite
                </th>
                {days.map((dateStr) => {
                  const d = new Date(dateStr);
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = d.getDate();
                  const isToday = dateStr === getOffsetDateString(0);

                  return (
                    <th
                      key={dateStr}
                      className={`p-2.5 text-center border border-black/[0.06] min-w-[70px] ${
                        isToday ? 'bg-blue-50 text-[#0071e3] font-semibold' : 'bg-white text-[#86868b]'
                      }`}
                    >
                      <span className="block text-[10px] uppercase">{dayName}</span>
                      <span className="block text-sm">{dayNum}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const rt = roomTypes.find(t => t.id === room.roomTypeId);

                return (
                  <tr key={room.id} className="hover:bg-[#f5f5f7] transition-colors">
                    {/* Room Header Column */}
                    <td className="p-3 border border-black/[0.06] bg-white sticky left-0 z-10 font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-[#1d1d1f] text-sm">#{room.roomNumber}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            room.housekeepingStatus === 'clean'
                              ? 'bg-emerald-500'
                              : room.housekeepingStatus === 'dirty'
                              ? 'bg-red-500'
                              : 'bg-amber-500'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-[#86868b] block truncate max-w-[110px]">
                        {rt?.name}
                      </span>
                    </td>

                    {/* 14 Day Cells */}
                    {days.map((dateStr) => {
                      const nextDay = new Date(dateStr);
                      nextDay.setDate(nextDay.getDate() + 1);
                      const nextDayStr = nextDay.toISOString().split('T')[0];

                      const booking = activeBookings.find(b => 
                        b.assignedRoomId === room.id &&
                        doIntervalsOverlap(b.checkInDate, b.checkOutDate, dateStr, nextDayStr)
                      );

                      if (booking) {
                        return (
                          <td
                            key={dateStr}
                            className="p-1 border border-black/[0.06] text-center"
                            title={`Booked: ${booking.guest?.fullName}`}
                          >
                            <div className="bg-blue-50 text-[#0071e3] border border-blue-200 rounded-lg p-1 text-[10px] truncate">
                              <span className="font-semibold block truncate">
                                {booking.guest?.fullName?.split(' ')[0] || 'Guest'}
                              </span>
                              <span className="text-[9px] opacity-80">
                                {booking.bookingReference.slice(-4)}
                              </span>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={dateStr}
                          className="p-1 border border-black/[0.06] text-center text-stone-300"
                        >
                          <span className="text-[10px] opacity-40">·</span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#86868b]">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-100 border border-[#0071e3]" />
              <span>Reserved</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Clean</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Dirty</span>
            </div>
          </div>
          <span>Total: {rooms.length} Suites</span>
        </div>
      </div>
    </div>
  );
}

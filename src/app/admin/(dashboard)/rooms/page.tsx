import React from 'react';
import { getDb } from '@/lib/db';
import { RoomsConsoleClient } from '@/components/admin/RoomsConsoleClient';

export default async function RoomsAdminPage() {
  const db = getDb();
  const rooms = await db.getRooms();
  const roomTypes = await db.getRoomTypes();
  const bookings = await db.getAllBookings();

  // Active bookings (currently checked_in)
  const activeBookings = bookings.filter(b => b.status === 'checked_in');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <p className="text-xs uppercase font-semibold tracking-wider text-[#86868b]">
          Aarunodya Residency • Pandharpur
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] mt-0.5">
          18 Physical Rooms &amp; Halls Inventory
        </h1>
        <p className="text-xs text-[#86868b] mt-1">
          Touch-friendly room control: Ground Floor (4 units), 1st Floor (6 units), 2nd Floor (6 units), and 3rd Floor (Room 401 &amp; Hall 402).
        </p>
      </div>

      <RoomsConsoleClient
        initialRooms={rooms}
        roomTypes={roomTypes}
        activeBookings={activeBookings}
      />
    </div>
  );
}

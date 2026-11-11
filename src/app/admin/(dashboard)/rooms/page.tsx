import React from 'react';
import { getDb } from '@/lib/db';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { RoomStatusSelector } from '@/components/admin/RoomStatusSelector';
import { RoomNotesModal } from '@/components/admin/RoomNotesModal';

export default async function RoomsAdminPage() {
  const db = getDb();
  const rooms = await db.getRooms();
  const roomTypes = await db.getRoomTypes();

  const cleanCount = rooms.filter(r => r.housekeepingStatus === 'clean').length;
  const dirtyCount = rooms.filter(r => r.housekeepingStatus === 'dirty').length;
  const inspectingCount = rooms.filter(r => r.housekeepingStatus === 'inspecting').length;

  const floors = [
    { name: 'Ground Floor (Rooms 101 – 104)', floorNum: 0 },
    { name: '1st Floor (Rooms 201 – 206)', floorNum: 1 },
    { name: '2nd Floor (Rooms 301 – 306)', floorNum: 2 },
    { name: '3rd Floor (Room 401 & 1 Large Hall 402)', floorNum: 3 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <p className="text-xs uppercase font-semibold tracking-wider text-[#86868b]">
          Aarunodya Residency • Pandharpur
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-0.5">
          18 Physical Rooms &amp; Halls Inventory
        </h1>
        <p className="text-xs text-[#86868b] mt-1">
          Ground Floor (4 rooms), 1st Floor (6 rooms), 2nd Floor (6 rooms), and 3rd Floor (1 room + 1 large hall).
        </p>
      </div>

      {/* Housekeeping Quick Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="space-y-1">
            <span className="text-xs text-[#86868b] font-medium">Clean &amp; Ready</span>
            <span className="text-3xl font-semibold tracking-tight text-emerald-600 block">{cleanCount}</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500/50" />
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="space-y-1">
            <span className="text-xs text-[#86868b] font-medium">Requires Cleaning</span>
            <span className="text-3xl font-semibold tracking-tight text-red-600 block">{dirtyCount}</span>
          </div>
          <AlertCircle className="w-6 h-6 text-red-500/50" />
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="space-y-1">
            <span className="text-xs text-[#86868b] font-medium">Total Capacity</span>
            <span className="text-3xl font-semibold tracking-tight text-[#0071e3] block">{rooms.length} Units</span>
          </div>
          <Sparkles className="w-6 h-6 text-blue-500/50" />
        </div>
      </div>

      {/* Floor by floor grouped tables */}
      <div className="space-y-6">
        {floors.map(({ name, floorNum }) => {
          const floorRooms = rooms.filter(r => r.floor === floorNum);

          return (
            <div key={floorNum} className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="p-4 px-5 bg-[#f5f5f7] border-b border-black/[0.06] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1d1d1f]">{name}</h3>
                <span className="text-xs font-medium text-[#86868b]">{floorRooms.length} Units</span>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="text-[#86868b] uppercase tracking-wider font-semibold border-b border-black/[0.06]">
                    <tr>
                      <th className="py-2.5 px-4">Unit #</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Specs / Notes</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Housekeeping Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] text-[#1d1d1f]">
                    {floorRooms.map((room) => {
                      const rt = roomTypes.find(t => t.id === room.roomTypeId);

                      return (
                        <tr key={room.id} className="hover:bg-[#f5f5f7] transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-sm text-[#1d1d1f]">
                            #{room.roomNumber}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {rt?.name}
                          </td>
                          <td className="py-3 px-4">
                            <RoomNotesModal
                              roomId={room.id}
                              roomNumber={room.roomNumber}
                              initialNotes={room.notes}
                              housekeepingStatus={room.housekeepingStatus}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                room.housekeepingStatus === 'clean'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : room.housekeepingStatus === 'dirty'
                                  ? 'bg-red-50 text-red-700'
                                  : room.housekeepingStatus === 'inspecting'
                                  ? 'bg-blue-50 text-[#0071e3]'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {room.housekeepingStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end">
                              <RoomStatusSelector
                                roomId={room.id}
                                initialStatus={room.housekeepingStatus}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

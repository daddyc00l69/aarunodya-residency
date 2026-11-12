'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  BedDouble, 
  Filter, 
  Edit3, 
  User, 
  Clock, 
  Check, 
  Loader2,
  Layers
} from 'lucide-react';
import { Room, RoomType, Booking, HousekeepingStatus } from '@/lib/types';
import { RoomNotesModal } from './RoomNotesModal';

interface RoomsConsoleClientProps {
  initialRooms: Room[];
  roomTypes: RoomType[];
  activeBookings: Booking[];
}

export function RoomsConsoleClient({
  initialRooms,
  roomTypes,
  activeBookings
}: RoomsConsoleClientProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingRoomId, setUpdatingRoomId] = useState<string | null>(null);

  const cleanCount = rooms.filter(r => r.housekeepingStatus === 'clean').length;
  const dirtyCount = rooms.filter(r => r.housekeepingStatus === 'dirty').length;
  const inspectingCount = rooms.filter(r => r.housekeepingStatus === 'inspecting').length;

  // Find currently checked-in occupant for a given room
  const getRoomOccupant = (roomNumber: string) => {
    return activeBookings.find(
      b => b.assignedRoomNumber === roomNumber && b.status === 'checked_in'
    );
  };

  const handleUpdateStatus = async (roomId: string, newStatus: HousekeepingStatus) => {
    setUpdatingRoomId(roomId);
    
    // Optimistic UI update
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, housekeepingStatus: newStatus } : r));

    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          housekeepingStatus: newStatus
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      // Revert if error
      setRooms(initialRooms);
    } finally {
      setUpdatingRoomId(null);
    }
  };

  const floors = [
    { label: 'All Units (18)', value: 'all' as const },
    { label: 'Ground (101–104)', value: 0 },
    { label: '1st Fl (201–206)', value: 1 },
    { label: '2nd Fl (301–306)', value: 2 },
    { label: '3rd Fl (401 & 402)', value: 3 },
  ];

  const filteredRooms = rooms.filter(r => {
    const matchesFloor = selectedFloor === 'all' || r.floor === selectedFloor;
    const matchesStatus = statusFilter === 'all' || r.housekeepingStatus === statusFilter;
    return matchesFloor && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Housekeeping Quick Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'clean' ? 'all' : 'clean')}
          className={`p-4 rounded-3xl border text-left transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${
            statusFilter === 'clean' ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20' : 'bg-white border-black/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between text-[#86868b] text-xs font-medium">
            <span>Clean & Ready</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-700 block mt-1">
            {cleanCount}
          </span>
          <span className="text-[10px] text-[#86868b] block mt-0.5">Vacant / Occupied</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'dirty' ? 'all' : 'dirty')}
          className={`p-4 rounded-3xl border text-left transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${
            statusFilter === 'dirty' ? 'border-red-500 bg-rose-50/70 ring-2 ring-rose-500/20' : 'bg-white border-black/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between text-[#86868b] text-xs font-medium">
            <span>Needs Cleaning</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-red-600 block mt-1">
            {dirtyCount}
          </span>
          <span className="text-[10px] text-[#86868b] block mt-0.5">Turnover Queue</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'inspecting' ? 'all' : 'inspecting')}
          className={`p-4 rounded-3xl border text-left transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${
            statusFilter === 'inspecting' ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20' : 'bg-white border-black/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between text-[#86868b] text-xs font-medium">
            <span>Inspecting</span>
            <Sparkles className="w-4 h-4 text-[#0071e3]" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0071e3] block mt-1">
            {inspectingCount}
          </span>
          <span className="text-[10px] text-[#86868b] block mt-0.5">Supervisor check</span>
        </button>

        <div className="p-4 rounded-3xl bg-white border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-[#86868b] text-xs font-medium">
            <span>Total Capacity</span>
            <Layers className="w-4 h-4 text-[#1d1d1f]" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] block mt-1">
            {rooms.length} Units
          </span>
          <span className="text-[10px] text-[#86868b] block mt-0.5">4 Physical Floors</span>
        </div>
      </div>

      {/* Mobile-Friendly Floor Navigation Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
        {floors.map((f) => (
          <button
            key={String(f.value)}
            type="button"
            onClick={() => setSelectedFloor(f.value)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all ${
              selectedFloor === f.value
                ? 'bg-[#1d1d1f] text-white shadow-sm'
                : 'bg-white text-[#86868b] border border-black/[0.06] hover:bg-stone-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Room Grid / Cards (Mobile-First Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredRooms.map((room) => {
          const rt = roomTypes.find(t => t.id === room.roomTypeId);
          const occupant = getRoomOccupant(room.roomNumber);
          const isUpdating = updatingRoomId === room.id;

          return (
            <div
              key={room.id}
              className={`bg-white border rounded-3xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5 transition-all ${
                room.housekeepingStatus === 'dirty'
                  ? 'border-red-200/80 bg-gradient-to-b from-rose-50/20 to-white'
                  : room.housekeepingStatus === 'clean'
                  ? 'border-emerald-200/80 bg-gradient-to-b from-emerald-50/20 to-white'
                  : 'border-black/[0.06]'
              }`}
            >
              {/* Card Header: Unit Number & Status Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold font-mono text-[#1d1d1f]">
                      Room #{room.roomNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded-full">
                      Floor {room.floor === 0 ? 'Ground' : room.floor}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#1d1d1f] mt-0.5">
                    {rt?.name || 'Standard Room'}
                  </p>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      room.housekeepingStatus === 'clean'
                        ? 'bg-emerald-100 text-emerald-800'
                        : room.housekeepingStatus === 'dirty'
                        ? 'bg-rose-100 text-rose-800'
                        : room.housekeepingStatus === 'inspecting'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {room.housekeepingStatus}
                  </span>
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0071e3]" />}
                </div>
              </div>

              {/* Occupant / Guest Status */}
              <div className="p-2.5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] text-xs">
                {occupant ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0071e3] flex items-center justify-center font-bold text-[10px]">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong className="text-[#1d1d1f] font-bold block">{occupant.guest?.fullName}</strong>
                        <span className="text-[10px] text-[#86868b]">Until {occupant.checkOutDate}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0071e3]">
                      Checked In
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[#86868b]">
                    <span>Vacant / Ready for check-in</span>
                    <span className="text-[10px] font-semibold text-emerald-700">Available</span>
                  </div>
                )}
              </div>

              {/* Maintenance Notes if any */}
              {room.notes && (
                <p className="text-[11px] text-[#86868b] italic bg-amber-50/60 p-2 rounded-xl border border-amber-100">
                  Note: {room.notes}
                </p>
              )}

              {/* One-Tap Housekeeping Status Action Bar */}
              <div className="pt-2 border-t border-black/[0.06] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] block">
                  Quick Housekeeping Tap:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    disabled={isUpdating || room.housekeepingStatus === 'clean'}
                    onClick={() => handleUpdateStatus(room.id, 'clean')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center space-x-1 ${
                      room.housekeepingStatus === 'clean'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Clean</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating || room.housekeepingStatus === 'dirty'}
                    onClick={() => handleUpdateStatus(room.id, 'dirty')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center space-x-1 ${
                      room.housekeepingStatus === 'dirty'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Dirty</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating || room.housekeepingStatus === 'inspecting'}
                    onClick={() => handleUpdateStatus(room.id, 'inspecting')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center space-x-1 ${
                      room.housekeepingStatus === 'inspecting'
                        ? 'bg-[#0071e3] text-white shadow-sm'
                        : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>

                <div className="flex justify-end pt-1">
                  <RoomNotesModal
                    roomId={room.id}
                    roomNumber={room.roomNumber}
                    initialNotes={room.notes}
                    housekeepingStatus={room.housekeepingStatus}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


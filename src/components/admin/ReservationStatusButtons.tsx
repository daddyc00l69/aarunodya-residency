'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, LogOut, Loader2 } from 'lucide-react';
import { BookingStatus } from '@/lib/types';

interface ReservationStatusButtonsProps {
  bookingId: string;
  currentStatus: BookingStatus;
  guestName: string;
  assignedRoomId?: string;
}

export function ReservationStatusButtons({
  bookingId,
  currentStatus,
  guestName
}: ReservationStatusButtonsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (newStatus: BookingStatus) => {
    const confirmMsg =
      newStatus === 'checked_in'
        ? `Confirm check-in for ${guestName}?`
        : newStatus === 'checked_out'
        ? `Confirm check-out for ${guestName}? Room will be flagged for housekeeping.`
        : `Update reservation status to ${newStatus}?`;

    if (!window.confirm(confirmMsg)) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          status: newStatus
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update reservation');
      }

      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating status';
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-1.5 text-xs text-[#86868b]">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0071e3]" />
        <span>Updating…</span>
      </div>
    );
  }

  if (currentStatus === 'confirmed') {
    return (
      <button
        onClick={() => handleUpdate('checked_in')}
        className="inline-flex items-center space-x-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium px-3.5 py-1.5 rounded-full transition-all active:scale-[0.98]"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Check In</span>
      </button>
    );
  }

  if (currentStatus === 'checked_in') {
    return (
      <button
        onClick={() => handleUpdate('checked_out')}
        className="inline-flex items-center space-x-1.5 bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-medium px-3.5 py-1.5 rounded-full transition-all active:scale-[0.98]"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Check Out</span>
      </button>
    );
  }

  return (
    <span className="text-[11px] text-[#86868b] uppercase tracking-wider font-medium">
      {currentStatus}
    </span>
  );
}

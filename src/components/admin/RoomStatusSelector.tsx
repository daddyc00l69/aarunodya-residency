'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HousekeepingStatus } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface RoomStatusSelectorProps {
  roomId: string;
  initialStatus: HousekeepingStatus;
}

export function RoomStatusSelector({ roomId, initialStatus }: RoomStatusSelectorProps) {
  const router = useRouter();
  const [status, setStatus] = useState<HousekeepingStatus>(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (newStatus: HousekeepingStatus) => {
    setStatus(newStatus);
    setIsUpdating(true);

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
        throw new Error('Failed to update room housekeeping status');
      }

      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      alert(msg);
      setStatus(initialStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={status}
        disabled={isUpdating}
        onChange={(e) => handleChange(e.target.value as HousekeepingStatus)}
        className={`text-xs font-medium rounded-full px-3 py-1 border focus:outline-none cursor-pointer transition-colors ${
          status === 'clean'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : status === 'dirty'
            ? 'bg-red-50 text-red-700 border-red-200'
            : status === 'inspecting'
            ? 'bg-blue-50 text-[#0071e3] border-blue-200'
            : 'bg-stone-100 text-stone-600 border-stone-200'
        }`}
      >
        <option value="clean">Clean & Ready</option>
        <option value="dirty">Dirty / Needs Cleaning</option>
        <option value="inspecting">Inspecting</option>
        <option value="maintenance">Under Maintenance</option>
      </select>

      {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0071e3]" />}
    </div>
  );
}

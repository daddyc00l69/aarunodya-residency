'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit3, Check, X, Loader2 } from 'lucide-react';
import { HousekeepingStatus } from '@/lib/types';

interface RoomNotesModalProps {
  roomId: string;
  roomNumber: string;
  initialNotes?: string;
  housekeepingStatus: HousekeepingStatus;
}

export function RoomNotesModal({
  roomId,
  roomNumber,
  initialNotes = '',
  housekeepingStatus
}: RoomNotesModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          housekeepingStatus,
          notes
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update maintenance notes');
      }

      setIsOpen(false);
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
        className="inline-flex items-center space-x-1 text-[11px] text-[#86868b] hover:text-[#0071e3] transition-colors p-1 rounded-lg hover:bg-black/[0.04]"
        title="Edit Room Notes & Maintenance"
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span className="max-w-[140px] truncate">{notes || 'Add note'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-black/[0.08] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div>
                <h3 className="text-base font-semibold text-[#1d1d1f]">
                  Unit #{roomNumber} Maintenance Notes
                </h3>
                <p className="text-xs text-[#86868b]">
                  Log housekeeping, geyser, bedding or repair notes.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">
                  Internal Staff Note
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Geyser serviced, extra 2 pillows supplied, AC remote tested."
                  className="w-full text-xs rounded-2xl border border-black/[0.12] p-3 focus:outline-none focus:border-[#0071e3] resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[#86868b] hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-full text-xs font-medium bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight } from 'lucide-react';
import { getOffsetDateString } from '@/lib/utils/dates';

interface AvailabilityBarProps {
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  compact?: boolean;
}

export function AvailabilityBar({
  initialCheckIn,
  initialCheckOut,
  initialAdults = 2,
  compact = false
}: AvailabilityBarProps) {
  const router = useRouter();

  const [checkIn, setCheckIn] = useState(initialCheckIn || getOffsetDateString(0));
  const [checkOut, setCheckOut] = useState(initialCheckOut || getOffsetDateString(2));
  const [adults, setAdults] = useState(initialAdults);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkIn >= checkOut) {
      alert('Check-out date must be after check-in date.');
      return;
    }

    setIsSearching(true);
    router.push(`/rooms?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&adults=${adults}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`w-full bg-white/95 backdrop-blur-xl border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-3xl p-3 sm:p-2 text-[#1d1d1f] ${
        compact ? 'max-w-3xl' : 'max-w-4xl'
      } mx-auto transition-all`}
    >
      <div className="grid grid-cols-2 sm:flex sm:flex-row items-center divide-y-0 sm:divide-x divide-black/[0.06] gap-2 sm:gap-0">
        {/* Check In */}
        <div className="col-span-1 sm:flex-1 px-3 sm:px-4 py-2 sm:py-1 bg-[#f5f5f7] sm:bg-transparent rounded-2xl sm:rounded-none">
          <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#86868b] mb-0.5">
            Check-In
          </label>
          <input
            type="date"
            value={checkIn}
            min={getOffsetDateString(0)}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (e.target.value >= checkOut) {
                const d = new Date(e.target.value);
                d.setDate(d.getDate() + 1);
                setCheckOut(d.toISOString().split('T')[0]);
              }
            }}
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-[#1d1d1f] focus:outline-none cursor-pointer"
            required
          />
        </div>

        {/* Check Out */}
        <div className="col-span-1 sm:flex-1 px-3 sm:px-4 py-2 sm:py-1 bg-[#f5f5f7] sm:bg-transparent rounded-2xl sm:rounded-none">
          <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#86868b] mb-0.5">
            Check-Out
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-[#1d1d1f] focus:outline-none cursor-pointer"
            required
          />
        </div>

        {/* Guests */}
        <div className="col-span-2 sm:col-span-1 sm:w-44 px-3 sm:px-4 py-2 sm:py-1 bg-[#f5f5f7] sm:bg-transparent rounded-2xl sm:rounded-none">
          <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#86868b] mb-0.5">
            Devotees / Guests
          </label>
          <select
            value={adults}
            onChange={(e) => setAdults(parseInt(e.target.value, 10))}
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-[#1d1d1f] focus:outline-none cursor-pointer"
          >
            <option value={1}>1 Devotee</option>
            <option value={2}>2 Devotees (Couple)</option>
            <option value={3}>3 Devotees</option>
            <option value={4}>4 Devotees (Family Suite)</option>
            <option value={5}>5 Devotees</option>
            <option value={10}>10–20 Devotees (Hall 402)</option>
          </select>
        </div>

        {/* Action Button */}
        <div className="col-span-2 sm:col-span-1 sm:w-auto p-1 sm:p-1.5">
          <button
            type="submit"
            disabled={isSearching}
            className="w-full sm:w-auto h-12 sm:h-11 px-6 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-xs font-medium tracking-tight flex items-center justify-center space-x-1.5 transition-all shadow-sm hover:shadow-[0_4px_12px_rgba(0,113,227,0.3)] active:scale-[0.98] disabled:opacity-60"
          >
            <span>{isSearching ? 'Checking…' : 'Check Real-Time Rates'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </form>
  );
}

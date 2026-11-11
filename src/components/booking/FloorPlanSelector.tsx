'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Wind, Users, Bed } from 'lucide-react';

interface FloorPlanSelectorProps {
  checkIn: string;
  checkOut: string;
  adults: number;
}

export function FloorPlanSelector({ checkIn, checkOut, adults }: FloorPlanSelectorProps) {
  const [activeFloor, setActiveFloor] = useState<number>(0);

  const floorData = [
    {
      floorNum: 0,
      title: 'Ground Floor',
      desc: 'Rooms 101 – 104 • Zero stairs, best for senior pilgrims & easy access',
      rooms: [
        { num: '101', type: 'Deluxe A/C Room', slug: 'deluxe-ac-room', price: '₹1,800', isAc: true, tag: 'Split AC' },
        { num: '102', type: 'Deluxe A/C Room', slug: 'deluxe-ac-room', price: '₹1,800', isAc: true, tag: 'Split AC' },
        { num: '103', type: 'Comfort Non-A/C', slug: 'comfort-non-ac-room', price: '₹1,200', isAc: false, tag: 'Non-AC' },
        { num: '104', type: 'Comfort Non-A/C', slug: 'comfort-non-ac-room', price: '₹1,200', isAc: false, tag: 'Non-AC' },
      ]
    },
    {
      floorNum: 1,
      title: '1st Floor',
      desc: 'Rooms 201 – 206 • Lift access, Deluxe AC, Non-AC & Family Suite',
      rooms: [
        { num: '201', type: 'Deluxe A/C Room', slug: 'deluxe-ac-room', price: '₹1,800', isAc: true, tag: 'Split AC' },
        { num: '202', type: 'Deluxe A/C Room', slug: 'deluxe-ac-room', price: '₹1,800', isAc: true, tag: 'Split AC' },
        { num: '203', type: 'Deluxe A/C Room', slug: 'deluxe-ac-room', price: '₹1,800', isAc: true, tag: 'Split AC' },
        { num: '204', type: 'Comfort Non-A/C', slug: 'comfort-non-ac-room', price: '₹1,200', isAc: false, tag: 'Non-AC' },
        { num: '205', type: 'Comfort Non-A/C', slug: 'comfort-non-ac-room', price: '₹1,200', isAc: false, tag: 'Non-AC' },
        { num: '206', type: 'Family 4-Bed Suite', slug: 'family-4-bed-ac-suite', price: '₹2,800', isAc: true, tag: '2 Double Beds' },
      ]
    },
    {
      floorNum: 2,
      title: '2nd Floor',
      desc: 'Rooms 301 – 306 • Quiet upper level with elevator access & geyser hot water',
      rooms: [
        { num: '301', type: 'Deluxe A/C Room', slug: 'deluxe-ac-room', price: '₹1,800', isAc: true, tag: 'Split AC' },
        { num: '302', type: 'Deluxe A/C Room', slug: 'deluxe-ac-room', price: '₹1,800', isAc: true, tag: 'Split AC' },
        { num: '303', type: 'Deluxe A/C Room', slug: 'deluxe-ac-room', price: '₹1,800', isAc: true, tag: 'Split AC' },
        { num: '304', type: 'Comfort Non-A/C', slug: 'comfort-non-ac-room', price: '₹1,200', isAc: false, tag: 'Non-AC' },
        { num: '305', type: 'Comfort Non-A/C', slug: 'comfort-non-ac-room', price: '₹1,200', isAc: false, tag: 'Non-AC' },
        { num: '306', type: 'Family 4-Bed Suite', slug: 'family-4-bed-ac-suite', price: '₹2,800', isAc: true, tag: '2 Double Beds' },
      ]
    },
    {
      floorNum: 3,
      title: '3rd Floor & Group Hall',
      desc: 'Room 401 & 1 Large Hall (402) • Accommodates up to 20 pilgrims & bhajan mandals',
      rooms: [
        { num: '401', type: 'Deluxe Room', slug: 'deluxe-ac-room', price: '₹1,800', isAc: true, tag: 'Split AC' },
        { num: '402 (Hall)', type: '3rd Floor Bhakt Niwas Hall', slug: 'bhakt-niwas-hall-room-402', price: '₹5,500', isAc: true, tag: '10–20 Devotees' },
      ]
    }
  ];

  const currentFloor = floorData.find(f => f.floorNum === activeFloor) || floorData[0];

  return (
    <div className="bg-[#f5f5f7] rounded-3xl p-6 sm:p-8 border border-black/[0.04] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
            Interactive Floor Directory
          </h3>
          <p className="text-xs text-[#86868b] mt-0.5">
            Explore and select specific rooms across our 4 floors
          </p>
        </div>

        {/* Floor Tab Selector */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar p-1.5 bg-white rounded-full border border-black/[0.06] shadow-sm max-w-full">
          {floorData.map((f) => (
            <button
              key={f.floorNum}
              onClick={() => setActiveFloor(f.floorNum)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap active:scale-95 ${
                activeFloor === f.floorNum
                  ? 'bg-[#1d1d1f] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              {f.title}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-[#86868b] bg-white p-3 rounded-2xl border border-black/[0.04]">
        {currentFloor.desc}
      </div>

      {/* Grid of Room Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {currentFloor.rooms.map((r) => {
          const checkoutUrl = `/checkout?roomType=${r.slug}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`;

          return (
            <div
              key={r.num}
              className="bg-white p-4 rounded-2xl border border-black/[0.06] flex items-center justify-between shadow-sm hover:shadow-md transition-shadow gap-3 active:scale-[0.99]"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sm text-[#1d1d1f]">
                    #{r.num}
                  </span>
                  <span className="text-[10px] bg-[#f5f5f7] text-[#1d1d1f] px-2 py-0.5 rounded font-medium">
                    {r.tag}
                  </span>
                </div>
                <div className="text-xs text-[#86868b]">
                  {r.type}
                </div>
                <div className="text-xs font-semibold text-[#1d1d1f] pt-0.5">
                  {r.price} <span className="text-[10px] text-[#86868b] font-normal">/ night</span>
                </div>
              </div>

              <Link
                href={checkoutUrl}
                className="shrink-0 bg-[#0071e3] hover:bg-[#0077ed] text-white px-4 py-2 rounded-full text-xs font-medium transition-all shadow-sm active:scale-95"
              >
                Book
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}


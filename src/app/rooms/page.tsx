import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Maximize2, 
  Bed, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  ChevronRight 
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AvailabilityBar } from '@/components/booking/AvailabilityBar';
import { FloorPlanSelector } from '@/components/booking/FloorPlanSelector';
import { getDb } from '@/lib/db';
import { getOffsetDateString, formatDisplayDate } from '@/lib/utils/dates';
import { formatPaise } from '@/lib/utils/currency';

interface RoomsPageProps {
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    adults?: string;
  }>;
}

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const params = await searchParams;
  const checkIn = params.checkIn || getOffsetDateString(0);
  const checkOut = params.checkOut || getOffsetDateString(2);
  const adults = parseInt(params.adults || '2', 10);

  const db = getDb();
  const availability = await db.checkAvailability(checkIn, checkOut, adults);

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] flex flex-col font-sans">
      <Navbar />

      {/* Header Banner - Apple Clean */}
      <section className="pt-28 sm:pt-36 pb-10 px-4 sm:px-6 bg-[#f5f5f7] border-b border-black/[0.06]">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
            Aarunodya Residency Bhakt Niwas • Pandharpur
          </p>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-[#1d1d1f]">
            Rooms, Suites & Group Halls.
          </h1>
          <p className="text-sm sm:text-base text-[#86868b] max-w-xl mx-auto">
            18 clean, peaceful units across Ground, 1st, 2nd, and 3rd floors — walking distance to Shri Vitthal-Rukmini Mandir.
          </p>

          <div className="pt-4 max-w-3xl mx-auto">
            <AvailabilityBar
              initialCheckIn={checkIn}
              initialCheckOut={checkOut}
              initialAdults={adults}
              compact
            />
          </div>
        </div>
      </section>

      {/* Stay Date Pill Bar */}
      <div className="bg-white border-b border-black/[0.06] py-3 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between text-xs text-[#86868b] gap-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#0071e3]" />
            <span>
              Rates for: <strong className="text-[#1d1d1f]">{formatDisplayDate(checkIn)}</strong> to <strong className="text-[#1d1d1f]">{formatDisplayDate(checkOut)}</strong> ({availability[0]?.pricing.numNights || 1} Night{availability[0]?.pricing.numNights > 1 ? 's' : ''})
            </span>
          </div>
          <div>
            Occupancy: <span className="text-[#1d1d1f] font-medium">{adults} Adult{adults > 1 ? 's' : ''}</span> • Currency: INR (₹)
          </div>
        </div>
      </div>

      {/* Room Listing Grid */}
      <main className="flex-1 py-14 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="space-y-10">
          {availability.map(({ roomType, availableRoomsCount, isAvailable, pricing }) => {
            const checkoutUrl = `/checkout?roomType=${roomType.slug}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`;

            return (
              <div
                key={roomType.id}
                className="bg-[#f5f5f7] rounded-3xl overflow-hidden border border-black/[0.06] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] transition-all grid grid-cols-1 lg:grid-cols-12 gap-0"
              >
                {/* Images Showcase */}
                <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full">
                  <img
                    src={roomType.images[0]?.url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'}
                    alt={roomType.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    {isAvailable ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-medium bg-white/95 text-[#1d1d1f] shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{availableRoomsCount} Available</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-medium bg-white/95 text-red-600 shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Sold Out</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content & Booking Actions */}
                <div className="lg:col-span-7 p-7 sm:p-9 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                          {roomType.name}
                        </h2>
                        <span className="text-xs text-[#86868b] font-medium">
                          {roomType.viewType}
                        </span>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-[11px] text-[#86868b] block">Total for {pricing.numNights} night{pricing.numNights > 1 ? 's' : ''} (incl. taxes)</span>
                        <span className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] block tracking-tight">
                          {formatPaise(pricing.totalAmountPaise)}
                        </span>
                        <span className="text-[11px] text-[#86868b]">
                          {formatPaise(pricing.basePricePerNightPaise)} / night avg
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed">
                      {roomType.fullDescription}
                    </p>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-black/[0.06] text-xs text-[#1d1d1f]">
                      <div className="flex items-center space-x-1.5">
                        <Maximize2 className="w-3.5 h-3.5 text-[#86868b]" />
                        <span>{roomType.roomSizeSqFt} sq. ft.</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-[#86868b]" />
                        <span>Max {roomType.maxOccupancy} Guests</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Bed className="w-3.5 h-3.5 text-[#86868b]" />
                        <span className="truncate">{roomType.bedConfig}</span>
                      </div>
                    </div>

                    {/* Amenities pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {roomType.amenities.map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-white text-[#1d1d1f] text-[11px] px-2.5 py-1 rounded-full border border-black/[0.06]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                    <Link
                      href={`/rooms/${roomType.slug}`}
                      className="text-xs text-[#0071e3] hover:underline font-medium flex items-center space-x-1"
                    >
                      <span>View details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {isAvailable ? (
                      <Link
                        href={checkoutUrl}
                        className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-6 py-2.5 rounded-full text-xs font-medium tracking-tight transition-all shadow-sm hover:shadow-[0_4px_12px_rgba(0,113,227,0.3)] active:scale-[0.98]"
                      >
                        Reserve
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="bg-stone-200 text-stone-500 px-6 py-2.5 rounded-full text-xs font-medium cursor-not-allowed"
                      >
                        Sold Out
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floor-by-Floor Interactive Directory */}
        <div className="mt-16 pt-12 border-t border-black/[0.06]">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
              Floor-by-Floor Directory
            </h2>
            <p className="text-xs sm:text-sm text-[#86868b] mt-2">
              Browse all 18 physical units across 4 floors. Ideal for family groups and senior devotees seeking ground-floor access or 3rd-floor group hall.
            </p>
          </div>
          <FloorPlanSelector checkIn={checkIn} checkOut={checkOut} adults={adults} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

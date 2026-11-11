import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Maximize2, 
  Bed, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  ArrowLeft,
  Coffee,
  Flame,
  Sparkles
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getDb } from '@/lib/db';
import { formatPaise } from '@/lib/utils/currency';
import { getOffsetDateString } from '@/lib/utils/dates';

interface RoomDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { slug } = await params;
  const db = getDb();
  const room = await db.getRoomTypeBySlug(slug);

  if (!room) {
    notFound();
  }

  const defaultCheckIn = getOffsetDateString(0);
  const defaultCheckOut = getOffsetDateString(2);

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] flex flex-col font-sans">
      <Navbar />

      {/* Breadcrumb Navigation */}
      <div className="pt-24 pb-4 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <Link
          href="/rooms"
          className="inline-flex items-center space-x-1.5 text-xs text-[#86868b] hover:text-[#0071e3] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Rooms &amp; Halls (18 Units)</span>
        </Link>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 pb-20 w-full space-y-12">
        {/* Gallery Grid - Apple Clean */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4 rounded-3xl overflow-hidden">
          <div className="md:col-span-8 h-[360px] md:h-[480px] relative rounded-2xl overflow-hidden shadow-sm">
            <img
              src={room.images[0]?.url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'}
              alt={room.images[0]?.alt || room.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4 h-[240px] md:h-[480px]">
            {room.images.slice(1, 3).map((img, i) => (
              <div key={i} className="relative h-full overflow-hidden rounded-2xl shadow-sm">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Content & Booking Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Room Story & Features (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-2 pb-6 border-b border-black/[0.08]">
              <span className="text-xs uppercase tracking-wider text-[#86868b] font-semibold">
                {room.viewType}
              </span>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
                {room.name}
              </h1>
              <p className="text-base sm:text-lg text-[#86868b] leading-relaxed pt-2">
                {room.fullDescription}
              </p>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
              <div className="space-y-1">
                <span className="text-xs text-[#86868b] block">Suite Area</span>
                <span className="font-semibold text-[#1d1d1f] text-sm block">{room.roomSizeSqFt} sq. ft.</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-[#86868b] block">Max Guests</span>
                <span className="font-semibold text-[#1d1d1f] text-sm block">{room.maxOccupancy} Persons</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-[#86868b] block">Bedding</span>
                <span className="font-semibold text-[#1d1d1f] text-sm block">{room.bedConfig}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-[#86868b] block">Climate &amp; Water</span>
                <span className="font-semibold text-[#1d1d1f] text-sm block">A/C &amp; 24h Geyser</span>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">In-Suite Inclusions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.amenities.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-[#f5f5f7] text-xs font-medium text-[#1d1d1f]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#0071e3] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lodge Policies */}
            <div className="space-y-4 pt-6 border-t border-black/[0.08]">
              <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">Lodge Policies &amp; Devotee Guidelines</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#86868b]">
                <div className="p-4 rounded-2xl bg-[#f5f5f7] space-y-1">
                  <span className="font-semibold text-[#1d1d1f] block">Check-in / Check-out</span>
                  <p>Check-in from 12:00 PM. Check-out by 11:00 AM. 24/7 reception desk for late arrivals.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#f5f5f7] space-y-1">
                  <span className="font-semibold text-[#1d1d1f] block">Cancellation Guarantee</span>
                  <p>Complimentary cancellation up to 24 hours prior to check-in with 100% refund.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Booking Card (Desktop Right 4 Cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-[#f5f5f7] rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-sm space-y-6">
              <div className="flex items-baseline justify-between pb-4 border-b border-black/[0.08]">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#86868b] block font-semibold">Nightly Tariff</span>
                  <span className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">
                    {formatPaise(room.basePricePaise)}
                  </span>
                </div>
                <span className="text-xs text-[#0071e3] font-medium">Direct Rate</span>
              </div>

              <div className="space-y-3 text-xs text-[#86868b]">
                <div className="flex items-center justify-between">
                  <span>24/7 Hot Water (Geyser &amp; Solar)</span>
                  <span className="text-emerald-600 font-medium">Included</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Elevator / Lift Access</span>
                  <span className="text-[#1d1d1f] font-medium">Included</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>High-Speed Wi-Fi</span>
                  <span className="text-[#1d1d1f] font-medium">Included</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pure RO Water on Floor</span>
                  <span className="text-[#1d1d1f] font-medium">Included</span>
                </div>
              </div>

              <Link
                href={`/checkout?roomType=${room.slug}&checkIn=${defaultCheckIn}&checkOut=${defaultCheckOut}`}
                className="w-full h-12 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-xs font-medium tracking-tight flex items-center justify-center space-x-1.5 transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Reserve Room</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              <p className="text-[11px] text-center text-[#86868b]">
                Instant reservation • 15-minute checkout hold
              </p>
            </div>
          </div>
        </div>

        {/* NATIVE MOBILE STICKY BOTTOM BAR */}
        <div className="lg:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-black/[0.08] px-4 py-3 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#86868b] uppercase tracking-wider block font-semibold">
              Per Night
            </span>
            <span className="text-xl font-bold text-[#1d1d1f] tracking-tight">
              {formatPaise(room.basePricePaise)}
            </span>
          </div>

          <Link
            href={`/checkout?roomType=${room.slug}&checkIn=${defaultCheckIn}&checkOut=${defaultCheckOut}`}
            className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-6 py-2.5 rounded-full text-xs font-semibold tracking-tight shadow-md active:scale-95 flex items-center space-x-1"
          >
            <span>Reserve Now</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

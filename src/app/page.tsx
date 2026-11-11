import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Wind, 
  Waves, 
  Users, 
  Sparkles, 
  Building2 
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AvailabilityBar } from '@/components/booking/AvailabilityBar';
import { DarshanGuide } from '@/components/pilgrimage/DarshanGuide';
import { DevoteeReviews } from '@/components/common/DevoteeReviews';
import { getDb } from '@/lib/db';
import { formatPaise } from '@/lib/utils/currency';

export default async function HomePage() {
  const db = getDb();
  const roomTypes = await db.getRoomTypes();
  const property = await db.getProperty();

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] flex flex-col font-sans selection:bg-[#0071e3] selection:text-white">
      <Navbar />

      {/* HERO SECTION - APPLE CLEAN */}
      <section className="relative pt-24 sm:pt-40 pb-12 sm:pb-16 px-4 sm:px-6 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#f5f5f7] border border-black/[0.06] text-xs font-semibold text-[#1d1d1f]">
            <span>🙏 जय हरी विठ्ठल</span>
            <span className="text-[#86868b]">• Nath Chowk, Pandharpur</span>
          </div>

          <h1 className="text-4xl sm:text-7xl lg:text-8xl font-semibold tracking-tight text-[#1d1d1f] leading-[1.08]">
            Aarunodya Residency.
          </h1>

          <p className="text-base sm:text-2xl text-[#86868b] font-normal max-w-2xl mx-auto leading-relaxed">
            Bhakt Niwas in Pandharpur. Deluxe A/C &amp; Non-A/C rooms, and a spacious 3rd-floor group hall.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-sm">
            <Link
              href="/rooms"
              className="inline-flex items-center space-x-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-sm active:scale-95"
            >
              <span>Book Your Room</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="tel:8530000820"
              className="inline-flex items-center space-x-2 text-[#1d1d1f] bg-[#f5f5f7] hover:bg-stone-200 px-5 py-2.5 rounded-full font-medium transition-colors active:scale-95"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call: 8530000820</span>
            </a>
          </div>

          <p className="text-xs text-[#86868b] pt-1">
            Managed by: <strong>Yuvaraj Malave</strong> • 8530000820 / 9172464746 / 8801242005
          </p>
        </div>

        {/* Hero Image Container */}
        <div className="max-w-5xl mx-auto mt-8 sm:mt-10 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-black/[0.06] relative h-[260px] sm:h-[480px]">
          <img
            src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80"
            alt="Aarunodya Residency Bhakt Niwas Rooms"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white text-left">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold opacity-90">1563 Ghongade Galli, Nath Chowk</span>
              <span className="block text-xl font-semibold">Walking distance to Shri Vitthal-Rukmini Mandir</span>
            </div>
            <div className="text-xs opacity-90 hidden sm:block font-medium">
              18 Total Units • Lift Access
            </div>
          </div>
        </div>

        {/* Floating Minimal Search Bar */}
        <div className="relative -mt-8 max-w-4xl mx-auto z-20 px-2">
          <AvailabilityBar />
        </div>
      </section>

      {/* FLOOR-BY-FLOOR REAL INVENTORY BREAKDOWN (APPLE BENTO) */}
      <section id="floors" className="py-20 bg-[#f5f5f7] border-y border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
              Building Layout
            </p>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
              18 Rooms &amp; Halls across 4 Floors.
            </h2>
            <p className="text-sm text-[#86868b]">
              Ground floor convenience for senior devotees to the expansive 3rd-floor group hall.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Ground Floor */}
            <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">Ground Floor</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold">4 Rooms</span>
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f]">Rooms 101 – 104</h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Rooms 101, 102, 103, 104. Ideal for senior citizens and easy ramp access without climbing.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] text-[#1d1d1f]">
                <span className="bg-[#f5f5f7] px-2 py-0.5 rounded-md font-mono">101 AC</span>
                <span className="bg-[#f5f5f7] px-2 py-0.5 rounded-md font-mono">102 AC</span>
                <span className="bg-[#f5f5f7] px-2 py-0.5 rounded-md font-mono">103 Non-AC</span>
                <span className="bg-[#f5f5f7] px-2 py-0.5 rounded-md font-mono">104 Non-AC</span>
              </div>
            </div>

            {/* 1st Floor */}
            <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">1st Floor</span>
                <span className="text-xs bg-blue-50 text-[#0071e3] px-2.5 py-0.5 rounded-full font-semibold">6 Rooms</span>
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f]">Rooms 201 – 206</h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Rooms 201, 202, 203, 204, 205, 206. Deluxe A/C, Non-A/C, and large family suites.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] text-[#1d1d1f]">
                <span className="bg-[#f5f5f7] px-2 py-0.5 rounded-md font-mono">201-203 AC</span>
                <span className="bg-[#f5f5f7] px-2 py-0.5 rounded-md font-mono">204-205 Non-AC</span>
                <span className="bg-[#f5f5f7] px-2 py-0.5 rounded-md font-mono">206 Family</span>
              </div>
            </div>

            {/* 2nd Floor */}
            <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">2nd Floor</span>
                <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-semibold">6 Rooms</span>
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f]">Rooms 301 – 306</h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Rooms 301, 302, 303, 304, 305, 306. Quiet upper-level rooms with lift access.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] text-[#1d1d1f]">
                <span className="bg-[#f5f5f7] px-2 py-0.5 rounded-md font-mono">301-303 AC</span>
                <span className="bg-[#f5f5f7] px-2 py-0.5 rounded-md font-mono">304-305 Non-AC</span>
                <span className="bg-[#f5f5f7] px-2 py-0.5 rounded-md font-mono">306 Family</span>
              </div>
            </div>

            {/* 3rd Floor */}
            <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">3rd Floor</span>
                <span className="text-xs bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-semibold">1 Room + 1 Hall</span>
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f]">Room 401 &amp; Hall 402</h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Room 401 plus Room 402: 1 massive group hall for up to 15-20 devotees with multiple baths.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] text-[#1d1d1f]">
                <span className="bg-[#f5f5f7] px-2 py-0.5 rounded-md font-mono">401 Suite</span>
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-mono font-semibold">402 Large Hall</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROOM CATEGORIES & RATES */}
      <section id="suites" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
              Accommodations
            </p>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
              Comfortable devotee stays.
            </h2>
            <p className="text-base text-[#86868b]">
              Every room features clean western attached bathrooms, 24-hour hot water, and lift service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {roomTypes.map((room) => (
              <div
                key={room.id}
                className="group bg-[#f5f5f7] rounded-3xl overflow-hidden border border-black/[0.04] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between"
              >
                <div className="relative h-72 sm:h-80 overflow-hidden">
                  <img
                    src={room.images[0]?.url}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-[#1d1d1f] shadow-sm">
                    {room.features[0] || `${room.roomSizeSqFt} sq. ft.`}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-[#1d1d1f] shadow-sm">
                    Up to {room.maxOccupancy} Devotees
                  </div>
                </div>

                <div className="p-7 sm:p-9 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
                        {room.name}
                      </h3>
                      <div className="text-right">
                        <span className="text-xl font-semibold text-[#1d1d1f] block">
                          {formatPaise(room.basePricePaise)}
                        </span>
                        <span className="text-[11px] text-[#86868b]">/ night</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed">
                      {room.shortDescription}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {room.amenities.slice(0, 4).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="bg-white text-[#1d1d1f] text-[11px] px-2.5 py-1 rounded-full border border-black/[0.06]"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                    <Link
                      href={`/rooms/${room.slug}`}
                      className="text-xs text-[#0071e3] hover:underline font-medium flex items-center space-x-1"
                    >
                      <span>View details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href={`/checkout?roomType=${room.slug}`}
                      className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 py-2 rounded-full text-xs font-medium tracking-tight transition-all active:scale-[0.98]"
                    >
                      Reserve Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEVOTEE AMENITIES */}
      <section id="amenities" className="py-20 bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
              Devotee Facilities
            </h2>
            <p className="text-sm text-[#86868b]">
              Everything you need for a restful, devotional pilgrimage in Pandharpur.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { title: '24/7 Hot Water', desc: 'Solar & instant geyser water in all rooms' },
              { title: 'Elevator / Lift', desc: 'Easy access to 1st, 2nd, and 3rd floors' },
              { title: 'Pure RO Water', desc: 'Hygienic chilled & normal drinking water' },
              { title: 'Near Temple', desc: '5-minute walking distance to Vitthal Mandir' }
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-black/[0.06] space-y-1">
                <span className="block font-semibold text-sm text-[#1d1d1f]">{f.title}</span>
                <span className="text-xs text-[#86868b]">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PANDHARPUR PILGRIMAGE & DARSHAN GUIDE */}
      <DarshanGuide />

      {/* DEVOTEE REVIEWS & TESTIMONIALS */}
      <DevoteeReviews />

      {/* CONTACT & LOCATION CARD */}
      <section className="py-20 bg-white border-t border-black/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            Direct Bookings &amp; Inquiries
          </h2>
          <p className="text-sm text-[#86868b] leading-relaxed">
            For group bookings, dindi mandals, or direct room confirmation, call host <strong>Yuvaraj Malave</strong> directly.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="tel:8530000820"
              className="bg-[#1d1d1f] hover:bg-[#333336] text-white px-6 py-3 rounded-full text-xs font-medium tracking-tight flex items-center space-x-2 transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call 8530000820</span>
            </a>
            <a
              href="tel:9172464746"
              className="bg-[#f5f5f7] hover:bg-stone-200 text-[#1d1d1f] px-6 py-3 rounded-full text-xs font-medium tracking-tight flex items-center space-x-2 transition-all border border-black/[0.06]"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call 9172464746</span>
            </a>
          </div>

          <p className="text-xs text-[#86868b] pt-4">
            📍 1563 Ghongade Galli, Nath Chowk, Pandharpur, Maharashtra - 413304
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { 
  Clock, 
  MapPin, 
  Sparkles, 
  PhoneCall, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Sun,
  Moon,
  Droplets,
  Calendar
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Pandharpur Darshan Guide & Aarti Timings | Aarunodya Residency',
  description: 'Complete pilgrim guide for Shri Vitthal-Rukmini Mandir Pandharpur, daily aarti schedule, Chandrabhaga snan, queue token advice, and transit from railway station.'
};

export default function DarshanGuidePage() {
  const schedule = [
    {
      time: '04:00 AM – 04:30 AM',
      name: 'Kakad Aarti (काकड आरती)',
      desc: 'Divine morning waking prayers. Melodious bhupali sung in sanctum sanctorum.',
      icon: Sun,
      highlight: true
    },
    {
      time: '04:30 AM – 06:00 AM',
      name: 'Panchamrut Pooja (पंचामृत पूजा)',
      desc: 'Holy ablution with milk, curd, honey, ghee, and sugar for Lord Vitthal & Rukmini Mata.',
      icon: Droplets,
      highlight: false
    },
    {
      time: '06:00 AM – 11:00 AM',
      name: 'Morning General Darshan (सकाळ दर्शन)',
      desc: 'Padsparsh Darshan (lotus feet) and Mukh Darshan open for general devotee queues.',
      icon: Sparkles,
      highlight: false
    },
    {
      time: '11:00 AM – 11:30 AM',
      name: 'Maha Naivedya (महानैवेद्य भोग)',
      desc: 'Daily offering of sacred bhog. Curtains drawn temporarily for 20 minutes.',
      icon: Clock,
      highlight: false
    },
    {
      time: '11:30 AM – 04:30 PM',
      name: 'Afternoon Darshan (दुपार दर्शन)',
      desc: 'Continuous darshan line. Best time for family groups with less crowd.',
      icon: Compass,
      highlight: false
    },
    {
      time: '04:30 PM – 05:00 PM',
      name: 'Poshak & Shringar (पोशाख व अलंकार)',
      desc: 'Changing of sacred silk attire and jewelry ornaments.',
      icon: Sparkles,
      highlight: false
    },
    {
      time: '05:00 PM – 06:30 PM',
      name: 'Dhoop Aarti (धुपारती)',
      desc: 'Evening camphor and incense adoration with temple bells resonance.',
      icon: Sun,
      highlight: true
    },
    {
      time: '06:30 PM – 11:00 PM',
      name: 'Evening & Night Darshan',
      desc: 'Peaceful temple ambiance under nighttime illumination.',
      icon: Moon,
      highlight: false
    },
    {
      time: '11:00 PM – 11:30 PM',
      name: 'Shej Aarti (शेज आरती)',
      desc: 'Night lullaby prayer putting the deities to slumber. Temple gates close.',
      icon: Moon,
      highlight: true
    }
  ];

  const shrines = [
    {
      name: 'Shri Vitthal-Rukmini Mandir',
      dist: 'Walking distance (500m)',
      desc: 'The supreme shrine of Varkari tradition where Sant Dnyaneshwar, Tukaram, and Namdev sang abhangs.',
      action: '5 min walk from Aarunodya'
    },
    {
      name: 'Chandrabhaga River Ghat & Pundalik Temple',
      dist: '400m from Nath Chowk',
      desc: 'The holy crescent-shaped Bhima river. Take snan and visit Bhakta Pundalik shrine situated in the riverbed.',
      action: '4 min walk'
    },
    {
      name: 'Gopalpur Mandir (गोपाळपूर)',
      dist: '3.2 km south',
      desc: 'Lord Krishna cowherd retreat where devotees eat puffed rice (Lahya) and churn curd.',
      action: '10 min auto rickshaw'
    },
    {
      name: 'Vishnupad Mandir (विष्णुपद)',
      dist: '2.5 km',
      desc: 'Ancient stone temple featuring natural footprint imprints of Lord Vishnu and sacred cows.',
      action: '8 min auto rickshaw'
    },
    {
      name: 'Kaikadi Maharaj Math',
      dist: '1.4 km',
      desc: 'Famous multi-level labyrinth museum depicting episodes from Ramayana, Mahabharata, and saint biographies.',
      action: '5 min auto rickshaw'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] flex flex-col font-sans">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-28 sm:pt-36 pb-12 px-4 sm:px-6 bg-[#f5f5f7] border-b border-black/[0.06]">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white text-xs font-medium text-[#1d1d1f] border border-black/[0.06] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>श्री विठ्ठल रुक्मिणी दर्शन मार्गदर्शिका</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-[#1d1d1f]">
            Pandharpur Pilgrimage &amp; Darshan Guide.
          </h1>
          <p className="text-sm sm:text-base text-[#86868b] max-w-2xl mx-auto">
            Everything you need for a divine, peaceful Yatra: Mandir aarti timings, holy Chandrabhaga snan rules, transit distances, and local tips from Aarunodya Residency.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              href="/rooms"
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-6 py-2.5 rounded-full text-xs font-medium shadow-sm transition-all"
            >
              Book Stay Near Mandir
            </Link>
            <a
              href="tel:+918530000820"
              className="bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] border border-black/[0.12] px-6 py-2.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>Call Yuvaraj Malave (Host)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-16 w-full">
        {/* Darshan Comparison Cards */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
              Two Types of Darshan
            </h2>
            <p className="text-xs sm:text-sm text-[#86868b] mt-1">
              Choose the darshan line that best matches your family's schedule and physical comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Padsparsh */}
            <div className="bg-[#f5f5f7] rounded-3xl p-7 border border-black/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Most Sacred
                </span>
                <Clock className="w-4 h-4 text-[#86868b]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f]">
                Padsparsh Darshan (पादस्पर्श दर्शन)
              </h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Allows devotees to walk up to the divine altar and touch their forehead to the sacred lotus feet of Lord Vitthal.
              </p>
              <ul className="space-y-2 text-xs text-[#1d1d1f] pt-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Queue tokens issued at Tukaram Bhavan &amp; Temple Token Counters.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Average queue time: 2 to 4 hours (longer during Ekadashi).</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Free traditional clothing guidelines recommended.</span>
                </li>
              </ul>
            </div>

            {/* Mukh Darshan */}
            <div className="bg-[#f5f5f7] rounded-3xl p-7 border border-black/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Faster Queue
                </span>
                <Sparkles className="w-4 h-4 text-[#86868b]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f]">
                Mukh Darshan (मुख दर्शन)
              </h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Direct view of the deity from the Sabhamandap hall without touching the feet. Recommended for senior citizens and young children.
              </p>
              <ul className="space-y-2 text-xs text-[#1d1d1f] pt-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Continuous fast-moving queue line.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Average queue time: 30 to 60 minutes on non-festival days.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Leaves ample time to also take Chandrabhaga snan and visit Rukmini Mata.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Daily Aarti Schedule */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                Daily Temple Schedule &amp; Aarti
              </h2>
              <p className="text-xs sm:text-sm text-[#86868b] mt-1">
                Official daily ritual timings at Shri Vitthal-Rukmini Mandir.
              </p>
            </div>
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Temple closes during Naivedya (11:00 AM) &amp; Shringar (4:30 PM)
            </span>
          </div>

          <div className="bg-[#f5f5f7] rounded-3xl border border-black/[0.06] overflow-hidden divide-y divide-black/[0.06]">
            {schedule.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.highlight ? 'bg-amber-50/50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-2xl bg-[#f5f5f7] border border-black/[0.06] flex items-center justify-center text-[#1d1d1f] shrink-0">
                      <Icon className="w-4 h-4 text-[#0071e3]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1d1d1f]">{item.name}</h4>
                      <p className="text-xs text-[#86868b]">{item.desc}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-semibold text-[#0071e3] sm:text-right shrink-0 bg-blue-50/60 px-3 py-1 rounded-full border border-blue-100 self-start sm:self-auto">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Other Holy Shrines in Vicinity */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
              Sacred Shrines Around Nath Chowk
            </h2>
            <p className="text-xs sm:text-sm text-[#86868b] mt-1">
              Popular places of worship within short distance from Aarunodya Residency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shrines.map((s, idx) => (
              <div
                key={idx}
                className="bg-[#f5f5f7] rounded-3xl p-6 border border-black/[0.06] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#0071e3] font-semibold mb-1">
                    <span>{s.dist}</span>
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-base font-semibold text-[#1d1d1f]">{s.name}</h4>
                  <p className="text-xs text-[#86868b] mt-1.5 leading-relaxed">{s.desc}</p>
                </div>

                <div className="pt-2 border-t border-black/[0.06] text-[11px] font-medium text-[#1d1d1f]">
                  ⚡ {s.action}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to Reach & Transit Info */}
        <section className="bg-[#f5f5f7] rounded-3xl p-8 border border-black/[0.06] space-y-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#86868b] font-semibold">
              Travel Directions
            </span>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mt-1">
              How to Reach Aarunodya Residency
            </h2>
            <p className="text-xs text-[#86868b] mt-1">
              Address: 1563 Ghongade Galli, Nath Chowk, Pandharpur, Maharashtra - 413304
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-5 rounded-2xl border border-black/[0.06] space-y-2">
              <span className="font-semibold text-sm text-[#1d1d1f] block">
                🚆 From Pandharpur Railway Station (PVR)
              </span>
              <p className="text-[#86868b]">
                Distance: 2.2 km (~8 mins by vehicle). Share or private auto-rickshaws available 24/7 right outside station exit. Fare: approx. ₹50 – ₹70 to Nath Chowk.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-black/[0.06] space-y-2">
              <span className="font-semibold text-sm text-[#1d1d1f] block">
                🚌 From Pandharpur ST Bus Stand
              </span>
              <p className="text-[#86868b]">
                Distance: 1.8 km (~6 mins by vehicle). Local rickshaws drop directly at Ghongade Galli entrance at Nath Chowk. Fare: approx. ₹40 – ₹60.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-black/[0.06]">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#1d1d1f] block">Need Assistance or Directions?</span>
              <span className="text-xs text-[#86868b] block">Host Yuvaraj Malave is just a phone call away</span>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href="tel:8530000820"
                className="px-4 py-2 bg-[#0071e3] text-white rounded-full text-xs font-medium hover:bg-[#0077ed] transition-colors"
              >
                Call: 8530000820
              </a>
              <a
                href="https://wa.me/918530000820?text=Namaskar%20Yuvaraj%20ji,%20I%20am%20coming%20to%20Pandharpur%20and%20need%20room%20information."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-medium hover:bg-emerald-700 transition-colors"
              >
                WhatsApp Host
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


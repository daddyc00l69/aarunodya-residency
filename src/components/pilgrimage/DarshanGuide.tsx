import React from 'react';
import { Clock, MapPin, Sparkles, Navigation, HeartHandshake } from 'lucide-react';

export function DarshanGuide() {
  const schedule = [
    { title: 'Kakad Aarti', time: '4:00 AM – 4:30 AM', note: 'Early morning holy awakening of Lord Vitthal' },
    { title: 'Morning Darshan & Nitya Pooja', time: '5:00 AM – 11:00 AM', note: 'Mukh & Charansparsh Darshan queue' },
    { title: 'Maha Naivedya', time: '11:00 AM – 11:30 AM', note: 'Offering of sacred lunch' },
    { title: 'Afternoon & Evening Darshan', time: '11:30 AM – 6:30 PM', note: 'Continuous devotee flow' },
    { title: 'Dhoop Aarti', time: '6:30 PM – 7:00 PM', note: 'Evening incense aarti ceremony' },
    { title: 'Shej Aarti', time: '11:00 PM – 11:30 PM', note: 'Night sleep ritual of Lord Vitthal & Rukmini Mata' },
  ];

  const travelTips = [
    { title: 'Shri Vitthal Mandir', dist: '5 Mins Walk', desc: 'Direct pathway from Nath Chowk via Ghongade Galli' },
    { title: 'Chandrabhaga River Ghat', dist: '500 Meters', desc: 'Holy river for holy snan and Pundalik Mandir' },
    { title: 'Pandharpur ST Bus Stand', dist: '1.2 km', desc: '5 mins by autorickshaw or 12 mins easy walk' },
    { title: 'Pandharpur Railway Station', dist: '2.0 km', desc: 'Auto available 24/7 directly to Nath Chowk' },
  ];

  return (
    <section className="py-20 bg-white border-t border-black/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
            Pilgrim Guide &amp; Mandir Schedule
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
            Shri Vitthal Darshan Timings.
          </h2>
          <p className="text-sm text-[#86868b]">
            Plan your holy pilgrimage from Aarunodya Residency Bhakt Niwas with our daily Aarti schedule and landmark distances.
          </p>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedule.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-[#f5f5f7] border border-black/[0.04] space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1d1d1f]">{item.title}</span>
                <span className="font-mono text-[#0071e3] font-medium">{item.time}</span>
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">{item.note}</p>
            </div>
          ))}
        </div>

        {/* Landmark Distances */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {travelTips.map((tip, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-white border border-black/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1d1d1f]">{tip.title}</span>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                  {tip.dist}
                </span>
              </div>
              <p className="text-xs text-[#86868b]">{tip.desc}</p>
            </div>
          ))}
        </div>

        {/* Local Tips Banner */}
        <div className="p-6 rounded-3xl bg-[#f5f5f7] border border-black/[0.06] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#1d1d1f]">
          <div className="space-y-1">
            <span className="font-semibold text-sm block">Pandharpur Pilgrimage Tip from Host Yuvaraj:</span>
            <p className="text-[#86868b]">
              For Charansparsh Darshan (touching lotus feet), morning hours between 5:30 AM and 7:00 AM usually have shorter waiting queues. Mobile phones and luggage can be safely stored at our reception before leaving for the temple.
            </p>
          </div>
          <a
            href="tel:8530000820"
            className="shrink-0 bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 py-2.5 rounded-full text-xs font-medium transition-all"
          >
            Inquire Darshan Passes
          </a>
        </div>
      </div>
    </section>
  );
}


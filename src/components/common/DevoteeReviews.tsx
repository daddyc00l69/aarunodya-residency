import React from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';

export function DevoteeReviews() {
  const reviews = [
    {
      name: 'Pandurang Shinde',
      city: 'Pune',
      stay: 'Deluxe A/C Room #102',
      date: 'Visited last week',
      rating: 5,
      review:
        'Booking ground floor room 102 was a blessing for my 74-year-old mother. Zero steps, spotless clean bathroom with instant hot water, and we reached the temple for 4:30 AM Kakad Aarti in just 5 minutes walk.'
    },
    {
      name: 'Ganesh Kulkarni',
      city: 'Nashik',
      stay: '3rd Floor Bhakt Niwas Hall #402',
      date: 'Kartiki Ekadashi stay',
      rating: 5,
      review:
        'We booked the 3rd floor Hall 402 for our 16-member bhajan mandal. Ample space, clean mattresses, two separate attached western bathrooms with geyser, and Yuvaraj ji personally helped our bus park safely.'
    },
    {
      name: 'Sunita & Deepak Deshmukh',
      city: 'Thane, Mumbai',
      stay: 'Deluxe A/C Room #201',
      date: 'Family Pilgrimage',
      rating: 5,
      review:
        'Very clean and modern room, much better than traditional lodges in Pandharpur. The online Razorpay booking was smooth and the instant WhatsApp confirmation voucher made check-in effortless.'
    },
    {
      name: 'Rameshwar Patil',
      city: 'Kolhapur',
      stay: 'Comfort Non-A/C Room #103',
      date: 'Monthly Varkari Darshan',
      rating: 5,
      review:
        'Very affordable, pure RO drinking water on every floor, and reliable 24/7 solar hot water. Nath Chowk location is close to Chandrabhaga Ghat as well as Vitthal Mandir.'
    }
  ];

  return (
    <section className="py-20 bg-white border-t border-black/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span>4.9 / 5.0 Pilgrim Rating</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
            Loved by Devotees &amp; Families.
          </h2>
          <p className="text-sm text-[#86868b]">
            Real feedback from pilgrims visiting Lord Vitthal from across Maharashtra and beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="bg-[#f5f5f7] rounded-3xl p-7 border border-black/[0.06] flex flex-col justify-between space-y-4 hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#86868b] font-medium">{r.stay}</span>
                </div>

                <p className="text-xs sm:text-sm text-[#1d1d1f] leading-relaxed italic">
                  "{r.review}"
                </p>
              </div>

              <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#1d1d1f] flex items-center space-x-1">
                    <span>{r.name}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </h4>
                  <span className="text-[11px] text-[#86868b]">{r.city} • {r.date}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Verified Stay
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


import React from 'react';
import Link from 'next/link';
import { Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#f5f5f7] text-[#86868b] border-t border-black/[0.08] text-[12px] pt-12 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Footnote / Shrine Info */}
        <div className="pb-6 border-b border-black/[0.08] space-y-2 text-[11px] leading-relaxed">
          <p>
            Shri Vitthal-Rukmini Darshan Pilgrims Stay • Aarunodya Residency Bhakt Niwas provides 18 dedicated units including Ground Floor (101-104), 1st Floor (201-206), 2nd Floor (301-306), and 3rd Floor (401 room + 402 large group hall).
          </p>
          <p>
            Conveniently located at Nath Chowk, Pandharpur. Free 24-hour hot water, split A/C, pure RO drinking water, and elevator lift access.
          </p>
        </div>

        {/* Directory Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-[12px] font-semibold text-[#1d1d1f] mb-3">Room Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/rooms" className="hover:text-[#1d1d1f] transition-colors">
                  Deluxe A/C Rooms (₹1,800)
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="hover:text-[#1d1d1f] transition-colors">
                  Comfort Non-A/C Rooms (₹1,200)
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="hover:text-[#1d1d1f] transition-colors">
                  Family 4-Bed A/C Suite (₹2,800)
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="hover:text-[#1d1d1f] transition-colors">
                  3rd Floor Group Hall #402 (₹5,500)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-semibold text-[#1d1d1f] mb-3">Floor Layout (18 Units)</h4>
            <ul className="space-y-2 text-[#86868b]">
              <li>Ground Floor: Rooms 101, 102, 103, 104</li>
              <li>1st Floor: Rooms 201, 202, 203, 204, 205, 206</li>
              <li>2nd Floor: Rooms 301, 302, 303, 304, 305, 306</li>
              <li>3rd Floor: Room 401 &amp; Large Hall 402</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-semibold text-[#1d1d1f] mb-3">Devotee Services</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/darshan" className="hover:text-[#1d1d1f] transition-colors">
                  Mandir Aarti &amp; Darshan Guide
                </Link>
              </li>
              <li>
                <Link href="/booking/lookup" className="hover:text-[#1d1d1f] transition-colors">
                  Find &amp; Print Booking Voucher
                </Link>
              </li>
              <li>
                <span className="text-[#1d1d1f]">Check-in: 12:00 PM</span>
              </li>
              <li>
                <span className="text-[#1d1d1f]">Check-out: 11:00 AM</span>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[#0071e3] transition-colors">
                  Staff PMS Portal &gt;
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-semibold text-[#1d1d1f] mb-3">Direct Contact &amp; Address</h4>
            <p className="leading-relaxed text-[#1d1d1f]">
              <strong>Yuvaraj Malave</strong>
            </p>
            <p className="mt-1">
              1563 Ghongade Galli, Nath Chowk, Pandharpur, Maharashtra - 413304
            </p>
            <div className="mt-2 space-y-1 text-[#1d1d1f] font-mono text-xs">
              <p>📞 8530000820</p>
              <p>📞 9172464746</p>
              <p>📞 8801242005</p>
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-6 border-t border-black/[0.08] flex flex-col md:flex-row items-center justify-between text-[11px] text-[#86868b] gap-3">
          <p>
            © 2026 Aarunodya Residency Bhakt Niwas, Pandharpur. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <span>Lord Vitthal Devotee Stay</span>
            <span>Razorpay Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

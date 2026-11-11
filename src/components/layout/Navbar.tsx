'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, ChevronRight, Phone } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-black/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.02)] py-3'
          : 'bg-white/75 backdrop-blur-md border-b border-black/[0.04] py-3.5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-9">
          {/* Brand Logo - Apple Clean */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#1d1d1f] flex items-center justify-center text-amber-300 font-serif font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              आ
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-[#1d1d1f] block leading-none">
                Aarunodya Residency
              </span>
              <span className="text-[10px] text-[#86868b] tracking-wide uppercase font-medium">
                Bhakt Niwas • Pandharpur
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-[13px] text-[#1d1d1f]/80">
            <Link
              href="/rooms"
              className={`hover:text-[#0071e3] transition-colors ${
                pathname === '/rooms' ? 'text-[#0071e3] font-medium' : ''
              }`}
            >
              Rooms &amp; Hall
            </Link>
            <Link
              href="/darshan"
              className={`hover:text-[#0071e3] transition-colors ${
                pathname === '/darshan' ? 'text-[#0071e3] font-medium' : ''
              }`}
            >
              Mandir Guide
            </Link>
            <Link
              href="/#floors"
              className="hover:text-[#0071e3] transition-colors"
            >
              Floor Layout (18 Units)
            </Link>
            <Link
              href="/#amenities"
              className="hover:text-[#0071e3] transition-colors"
            >
              Devotee Facilities
            </Link>
            <Link
              href="/booking/lookup"
              className="hover:text-[#0071e3] transition-colors flex items-center space-x-1"
            >
              <span>My Booking</span>
            </Link>
          </nav>

          {/* Right Action & Phone */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href="tel:8530000820"
              className="text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors flex items-center space-x-1"
            >
              <Phone className="w-3 h-3 text-emerald-600" />
              <span>8530000820</span>
            </a>
            <Link
              href="/admin/login"
              className="text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors px-2 py-1"
            >
              Staff
            </Link>
            <Link
              href="/rooms"
              className="inline-flex items-center space-x-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white px-4 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all shadow-sm active:scale-[0.98]"
            >
              <span>Book Stay</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <a
              href="tel:8530000820"
              className="p-1.5 text-emerald-600"
              title="Call Reception"
            >
              <Phone className="w-4 h-4" />
            </a>
            <Link
              href="/booking/lookup"
              className="p-1.5 text-[#1d1d1f]"
              title="Lookup"
            >
              <Search className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#1d1d1f]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-black/[0.08] px-6 py-6 space-y-4">
          <Link
            href="/rooms"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#1d1d1f] hover:text-[#0071e3]"
          >
            Rooms &amp; Hall
          </Link>
          <Link
            href="/darshan"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#1d1d1f] hover:text-[#0071e3]"
          >
            Mandir Darshan Guide
          </Link>
          <Link
            href="/#floors"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#1d1d1f] hover:text-[#0071e3]"
          >
            Floor Layout (18 Units)
          </Link>
          <Link
            href="/#amenities"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#1d1d1f] hover:text-[#0071e3]"
          >
            Devotee Facilities
          </Link>
          <Link
            href="/booking/lookup"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#1d1d1f] hover:text-[#0071e3]"
          >
            Find My Reservation
          </Link>
          <div className="pt-4 border-t border-black/[0.08] flex flex-col space-y-2.5">
            <Link
              href="/rooms"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-[#0071e3] text-white py-2.5 rounded-full text-xs font-medium"
            >
              Check Availability & Rates
            </Link>
            <a
              href="tel:8530000820"
              className="w-full text-center text-xs text-emerald-700 bg-emerald-50 py-2 rounded-full font-medium"
            >
              Direct Call: 8530000820
            </a>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-xs text-[#86868b] hover:text-[#1d1d1f] py-1.5"
            >
              Staff PMS Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, MapPin, X } from 'lucide-react';

export function FloatingContactPill() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after scrolling 150px
    const handleScroll = () => {
      setIsVisible(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end space-y-2 print:hidden">
      {isOpen && (
        <div className="bg-white/95 backdrop-blur-xl border border-black/[0.08] p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-72 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
            <div>
              <span className="text-xs font-semibold text-[#1d1d1f] block">
                Aarunodya Reception
              </span>
              <span className="text-[10px] text-[#86868b] block">
                Yuvaraj Malave (Host)
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <a
              href="https://wa.me/918530000820?text=Namaskar%20Yuvaraj%20ji,%20I%20am%20inquiring%20about%20room%20availability%20at%20Aarunodya%20Residency."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2.5 p-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors font-medium"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <span className="block font-semibold">WhatsApp Enquiry</span>
                <span className="text-[10px] text-emerald-700">Quick room inquiry &amp; photos</span>
              </div>
            </a>

            <a
              href="tel:8530000820"
              className="flex items-center space-x-2.5 p-2 rounded-2xl bg-[#f5f5f7] hover:bg-stone-200 text-[#1d1d1f] transition-colors font-medium"
            >
              <div className="w-7 h-7 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1">
                <span className="block font-semibold">Call Yuvaraj Malave</span>
                <span className="text-[10px] text-[#86868b] font-mono">8530000820 / 9172464746</span>
              </div>
            </a>

            <a
              href="https://maps.google.com/?q=Nath+Chowk+Pandharpur+Maharashtra"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2.5 p-2 rounded-2xl bg-blue-50 hover:bg-blue-100 text-[#0071e3] transition-colors font-medium"
            >
              <div className="w-7 h-7 rounded-full bg-[#0071e3] text-white flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <span className="block font-semibold">Open in Google Maps</span>
                <span className="text-[10px] text-blue-600">1563 Ghongade Galli, Nath Chowk</span>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Main trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group bg-[#1d1d1f] hover:bg-black text-white px-4 py-2.5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.25)] flex items-center space-x-2 transition-all active:scale-95 border border-white/10"
        aria-label="Direct Assistance"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-medium tracking-tight">
          {isOpen ? 'Close' : 'Quick Enquiry & Call'}
        </span>
        <Phone className="w-3.5 h-3.5 text-white/70 group-hover:text-white" />
      </button>
    </div>
  );
}


'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center space-x-1.5 bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-medium px-4 py-2 rounded-full transition-all active:scale-[0.98]"
    >
      <Printer className="w-3.5 h-3.5" />
      <span>Print / PDF</span>
    </button>
  );
}

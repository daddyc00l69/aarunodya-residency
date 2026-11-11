'use client';

import React from 'react';
import { Download } from 'lucide-react';

interface CsvExportButtonProps {
  bookings: any[];
}

export function CsvExportButton({ bookings }: CsvExportButtonProps) {
  const exportToCSV = () => {
    const headers = [
      'Booking Reference',
      'Guest Name',
      'Guest Email',
      'Guest Phone',
      'Suite Type',
      'Room Number',
      'Check In',
      'Check Out',
      'Nights',
      'Status',
      'Tariff (INR)',
      'Resort Fee (INR)',
      'GST Tax (INR)',
      'Total Amount (INR)',
      'Paid Amount (INR)',
      'Created Date'
    ];

    const rows = bookings.map(b => [
      `"${b.bookingReference}"`,
      `"${b.guest?.fullName || ''}"`,
      `"${b.guest?.email || ''}"`,
      `"${b.guest?.phone || ''}"`,
      `"${b.roomType?.name || ''}"`,
      `"${b.assignedRoomNumber || ''}"`,
      `"${b.checkInDate}"`,
      `"${b.checkOutDate}"`,
      b.numNights,
      `"${b.status}"`,
      (b.subtotalPaise / 100).toFixed(2),
      (b.resortFeePaise / 100).toFixed(2),
      (b.taxPaise / 100).toFixed(2),
      (b.totalAmountPaise / 100).toFixed(2),
      (b.paidAmountPaise / 100).toFixed(2),
      `"${b.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aarunodya_Residency_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportToCSV}
      className="inline-flex items-center space-x-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium px-4 py-2 rounded-full transition-all active:scale-[0.98] shadow-sm"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Export CSV Ledger</span>
    </button>
  );
}

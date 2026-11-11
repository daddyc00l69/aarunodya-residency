'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Booking, Guest, RoomType } from '@/lib/types';
import { formatDisplayDate } from '@/lib/utils/dates';
import { formatPaise } from '@/lib/utils/currency';

interface WhatsAppShareButtonProps {
  booking: Booking;
  guest?: Guest;
  roomType?: RoomType;
}

export function WhatsAppShareButton({ booking, guest, roomType }: WhatsAppShareButtonProps) {
  const shareOnWhatsApp = () => {
    const text = 
`🙏 *Aarunodya Residency Bhakt Niwas, Pandharpur*
*Booking Confirmation Voucher*

• *Booking Ref:* ${booking.bookingReference}
• *Guest Name:* ${guest?.fullName || 'Devotee'}
• *Accommodation:* ${roomType?.name || 'Deluxe Room'} ${booking.assignedRoomNumber ? `(Room #${booking.assignedRoomNumber})` : ''}
• *Check-In:* ${formatDisplayDate(booking.checkInDate)} (12:00 PM)
• *Check-Out:* ${formatDisplayDate(booking.checkOutDate)} (11:00 AM)
• *Nights:* ${booking.numNights} Night(s) for ${booking.numAdults} Devotee(s)
• *Total Paid:* ${formatPaise(booking.totalAmountPaise)} (Paid in Full)

📍 *Address:* 1563 Ghongade Galli, Nath Chowk, Pandharpur, Maharashtra - 413304 (Near Vitthal Mandir)
📞 *Host Yuvaraj Malave:* 8530000820 / 9172464746 / 8801242005

_जय हरी विठ्ठल! Have a blessed Darshan._`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <button
      onClick={shareOnWhatsApp}
      className="inline-flex items-center space-x-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-medium px-4 py-2 rounded-full transition-all active:scale-[0.98] shadow-sm"
    >
      <MessageSquare className="w-3.5 h-3.5" />
      <span>Share to WhatsApp</span>
    </button>
  );
}


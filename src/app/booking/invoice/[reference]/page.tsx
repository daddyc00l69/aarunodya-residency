import React from 'react';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { verifyPayload } from '@/lib/utils/tokens';
import { InvoiceView } from '@/components/booking/InvoiceView';

interface InvoicePageProps {
  params: Promise<{
    reference: string;
  }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { reference } = await params;
  const cleanRef = decodeURIComponent(reference || '').trim().toUpperCase();
  const db = getDb();
  
  let result = await db.getBookingByReference(cleanRef);

  // If not found in current serverless lambda memory, check signed cookies
  if (!result || !result.booking) {
    try {
      const cookieStore = await cookies();
      const rawCookie =
        cookieStore.get(`arn_confirmed_${cleanRef}`)?.value ||
        cookieStore.get(`arn_booking_${cleanRef}`)?.value ||
        cookieStore.get('arn_latest_booking')?.value;

      if (rawCookie) {
        const verified = verifyPayload<{
          booking: any;
          guest?: any;
          roomType?: any;
          payments?: any[];
        }>(rawCookie);

        if (verified && verified.booking && verified.booking.bookingReference.toUpperCase() === cleanRef) {
          await db.syncBookingRecord(verified);
          result = await db.getBookingByReference(cleanRef);
        }
      }
    } catch (cookieErr) {
      console.warn('Cookie recovery notice:', cookieErr);
    }
  }

  return (
    <InvoiceView
      reference={cleanRef}
      initialData={result}
    />
  );
}

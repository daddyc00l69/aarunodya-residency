import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { razorpayService } from '@/lib/services/razorpay';
import { resendService } from '@/lib/services/resend';

const VerifySchema = z.object({
  bookingReference: z.string().min(1, 'Booking reference is required'),
  razorpayOrderId: z.string().min(1, 'Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Payment ID is required'),
  razorpaySignature: z.string().min(1, 'Payment signature is required')
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = VerifySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid verification payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { bookingReference, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    // Verify cryptographic signature on the server using Razorpay secret
    const isValidSignature = razorpayService.verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature
    });

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Payment signature verification failed. Transaction was not captured.' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Idempotently confirm booking and record payment
    const confirmedBooking = await db.confirmBookingPayment({
      bookingReference,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod: 'razorpay'
    });

    // Asynchronously dispatch Resend booking confirmation email
    try {
      const fullDetails = await db.getBookingByReference(bookingReference);
      if (fullDetails && fullDetails.guest) {
        await resendService.sendBookingConfirmationEmail({
          booking: fullDetails.booking,
          guest: fullDetails.guest,
          roomType: fullDetails.roomType,
          payments: fullDetails.payments
        });
      }
    } catch (emailErr) {
      console.warn('Post-payment email notice:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and booking confirmed successfully',
      booking: confirmedBooking
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment confirmation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

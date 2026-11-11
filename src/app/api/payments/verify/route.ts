import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { razorpayService } from '@/lib/services/razorpay';
import { resendService } from '@/lib/services/resend';
import { signPayload, verifyPayload } from '@/lib/utils/tokens';

const VerifySchema = z.object({
  bookingReference: z.string().min(1, 'Booking reference is required'),
  razorpayOrderId: z.string().min(1, 'Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Payment ID is required'),
  razorpaySignature: z.string().min(1, 'Payment signature is required'),
  bookingToken: z.string().optional()
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

    // Check if fallback booking data is supplied via request body token or cookies
    const rawToken =
      parsed.data.bookingToken ||
      req.cookies.get(`arn_booking_${bookingReference}`)?.value ||
      req.cookies.get('arn_latest_booking')?.value;

    let fallbackBooking: any = undefined;
    let fallbackGuest: any = undefined;

    if (rawToken) {
      const verified = verifyPayload<{
        booking: any;
        guest?: any;
        roomType?: any;
      }>(rawToken);
      if (verified && verified.booking) {
        fallbackBooking = verified.booking;
        fallbackGuest = verified.guest;
      }
    }
    
    // Idempotently confirm booking and record payment
    const confirmedBooking = await db.confirmBookingPayment({
      bookingReference,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod: 'razorpay',
      fallbackBooking,
      fallbackGuest
    });

    const fullDetails = await db.getBookingByReference(bookingReference);

    // Cryptographically sign the confirmed booking state for multi-lambda continuity
    const confirmedToken = signPayload({
      booking: confirmedBooking,
      guest: fullDetails?.guest,
      roomType: fullDetails?.roomType,
      payments: fullDetails?.payments
    });

    // Asynchronously dispatch Resend booking confirmation email
    try {
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

    const res = NextResponse.json({
      success: true,
      message: 'Payment verified and booking confirmed successfully',
      booking: confirmedBooking,
      bookingToken: confirmedToken
    });

    // Set signed confirmed booking cookies
    res.cookies.set(`arn_confirmed_${bookingReference}`, confirmedToken, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60
    });

    res.cookies.set('arn_latest_booking', confirmedToken, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60
    });

    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment confirmation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

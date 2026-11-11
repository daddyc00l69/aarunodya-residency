import { NextRequest, NextResponse } from 'next/server';
import { razorpayService } from '@/lib/services/razorpay';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // Only strictly verify signature if webhook secret is configured
    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      if (!signature) {
        return NextResponse.json({ error: 'Missing Razorpay signature' }, { status: 400 });
      }

      const isValid = razorpayService.verifyWebhookSignature({
        bodyString: rawBody,
        signature
      });

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const db = getDb();

    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const bookingRef = paymentEntity?.notes?.bookingReference;

      if (bookingRef) {
        await db.confirmBookingPayment({
          bookingReference: bookingRef,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature || 'webhook_captured',
          gatewayResponse: paymentEntity
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

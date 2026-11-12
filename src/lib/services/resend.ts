import { Booking, Guest, RoomType, Payment } from '../types';
import { formatPaise } from '../utils/currency';
import { formatDisplayDate } from '../utils/dates';

export class ResendEmailService {
  private apiKey: string | undefined;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    // Resend free tier sends from onboarding@resend.dev until devtushar.uk domain DNS is verified
    this.fromEmail = process.env.EMAIL_FROM || 'Aarunodya Residency <onboarding@resend.dev>';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.startsWith('re_'));
  }

  /**
   * Dispatches an official booking confirmation email with tax invoice & stay instructions
   */
  async sendBookingConfirmationEmail({
    booking,
    guest,
    roomType,
    payments = []
  }: {
    booking: Booking;
    guest: Guest;
    roomType?: RoomType;
    payments?: Payment[];
  }): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!this.isConfigured() || !guest?.email) {
      console.warn('Resend API key not configured or guest email missing.');
      return { success: false, error: 'Resend API key not configured' };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f7; color: #1d1d1f; margin: 0; padding: 20px; }
            .card { background-color: #ffffff; border-radius: 20px; max-width: 580px; margin: 0 auto; padding: 32px; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
            .header { text-align: center; border-bottom: 1px solid #f0f0f2; padding-bottom: 20px; }
            .badge { display: inline-block; background-color: #e8f5e9; color: #2e7d32; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; }
            .ref { font-family: monospace; font-size: 22px; font-weight: 700; color: #0071e3; margin-top: 8px; }
            .details { margin: 24px 0; background-color: #f5f5f7; border-radius: 14px; padding: 18px; font-size: 13px; line-height: 1.6; }
            .table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 20px 0; }
            .table td { padding: 8px 0; border-bottom: 1px solid #f0f0f2; }
            .total { font-weight: 700; font-size: 16px; color: #1d1d1f; }
            .footer { text-align: center; font-size: 11px; color: #86868b; margin-top: 24px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <span class="badge">Booking Confirmed • जय हरी विठ्ठल</span>
              <h1 style="font-size: 24px; margin: 12px 0 4px; font-weight: 600;">Aarunodya Residency</h1>
              <p style="margin: 0; font-size: 12px; color: #86868b;">Bhakt Niwas, Pandharpur</p>
              <div class="ref">${booking.bookingReference}</div>
            </div>

            <p style="font-size: 14px; margin-top: 24px;">
              Namaste <strong>${guest.fullName}</strong>,<br>
              Your stay at <strong>Aarunodya Residency Bhakt Niwas</strong> has been confirmed. We look forward to welcoming you to the holy city of Pandharpur.
            </p>

            <div class="details">
              <strong>Stay Details:</strong><br>
              • <strong>Accommodation:</strong> ${roomType?.name || 'Deluxe Room'}<br>
              • <strong>Assigned Unit:</strong> Room #${booking.assignedRoomNumber || 'Allocated at check-in'}<br>
              • <strong>Check-In:</strong> ${formatDisplayDate(booking.checkInDate)} (From 12:00 PM)<br>
              • <strong>Check-Out:</strong> ${formatDisplayDate(booking.checkOutDate)} (By 11:00 AM)<br>
              • <strong>Duration:</strong> ${booking.numNights} Night(s) for ${booking.numAdults} Devotee(s)
            </div>

            <table class="table">
              <tr>
                <td>Tariff Subtotal:</td>
                <td style="text-align: right;">${formatPaise(booking.subtotalPaise)}</td>
              </tr>
              <tr>
                <td>GST (Hospitality Tax):</td>
                <td style="text-align: right;">${formatPaise(booking.taxPaise)}</td>
              </tr>
              <tr class="total">
                <td style="padding-top: 12px;">Total Paid:</td>
                <td style="text-align: right; color: #0071e3; padding-top: 12px;">${formatPaise(booking.totalAmountPaise)}</td>
              </tr>
            </table>

            <div style="background-color: #fff8e1; border: 1px solid #ffe082; border-radius: 12px; padding: 14px; font-size: 12px; color: #5d4037;">
              <strong>📍 Address & Arrival Directions:</strong><br>
              1563 Ghongade Galli, Nath Chowk, Pandharpur, Maharashtra - 413304.<br>
              Walking distance from Shri Vitthal-Rukmini Mandir.<br>
              📞 <strong>Host Yuvaraj Malave:</strong> 8530000820 / 9172464746 / 8801242005
            </div>

            <div class="footer">
              <p>Government-issued photo identification is required for all guests at check-in.</p>
              <p>© 2026 Aarunodya Residency Bhakt Niwas. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [guest.email],
          subject: `Booking Confirmed: ${booking.bookingReference} - Aarunodya Residency Bhakt Niwas`,
          html: htmlContent
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        console.warn('Resend API notice:', resData);
        return { success: false, error: resData?.message || 'Email delivery notice' };
      }

      console.log(`Email dispatched successfully via Resend. ID: ${resData.id}`);
      return { success: true, id: resData.id };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Resend error';
      console.error('Resend email error:', msg);
      return { success: false, error: msg };
    }
  }

  /**
   * Dispatches automated post-checkout thank-you email with exclusive return discount coupon
   */
  async sendPostCheckoutThankYouEmail({
    customerName,
    customerEmail,
    couponCode,
    discountDisplay,
    expiryDate,
    subject,
    promotionalMessage
  }: {
    customerName: string;
    customerEmail: string;
    couponCode: string;
    discountDisplay: string;
    expiryDate: string;
    subject: string;
    promotionalMessage?: string;
  }): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!customerEmail) {
      return { success: false, error: 'Recipient email missing' };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f7; color: #1d1d1f; margin: 0; padding: 24px; }
            .card { background-color: #ffffff; border-radius: 24px; max-width: 580px; margin: 0 auto; padding: 36px; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
            .header { text-align: center; border-bottom: 1px solid #f0f0f2; padding-bottom: 24px; }
            .badge { display: inline-block; background-color: #fff8e1; color: #b78103; font-size: 11px; font-weight: 600; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; border: 1px solid #ffe082; }
            .coupon-box { margin: 28px 0; background: linear-gradient(135deg, #f5f5f7 0%, #ebebef 100%); border: 2px dashed #0071e3; border-radius: 18px; padding: 24px; text-align: center; }
            .coupon-code { font-family: -apple-system-ui-monospace, monospace; font-size: 26px; font-weight: 800; color: #0071e3; letter-spacing: 2px; margin: 8px 0; }
            .discount-tag { font-size: 14px; font-weight: 600; color: #1d1d1f; }
            .validity { font-size: 12px; color: #86868b; margin-top: 6px; }
            .btn { display: inline-block; background-color: #0071e3; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 28px; border-radius: 30px; margin-top: 20px; }
            .footer { text-align: center; font-size: 11px; color: #86868b; margin-top: 28px; line-height: 1.5; border-top: 1px solid #f0f0f2; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <span class="badge">।। श्री विठ्ठल कृपा ।। Special Devotee Gift 🎁</span>
              <h1 style="font-size: 24px; margin: 14px 0 4px; font-weight: 600; color: #1d1d1f;">Thank You for Staying With Us</h1>
              <p style="margin: 0; font-size: 12px; color: #86868b;">Aarunodya Residency Bhakt Niwas • Pandharpur</p>
            </div>

            <p style="font-size: 14px; line-height: 1.6; margin-top: 24px;">
              Namaste <strong>${customerName}</strong>,<br>
              Thank you for choosing <strong>Aarunodya Residency Bhakt Niwas</strong> for your pilgrimage to Pandharpur. We hope you had a blessed Darshan and a comfortable stay.
            </p>

            ${promotionalMessage ? `<p style="font-size: 13px; color: #515154; line-height: 1.5;">${promotionalMessage}</p>` : ''}

            <div class="coupon-box">
              <div class="discount-tag">Special Return Invitation Discount</div>
              <div class="coupon-code">${couponCode}</div>
              <div style="font-size: 15px; font-weight: 700; color: #1d1d1f;">Your Privilege: ${discountDisplay} OFF</div>
              <div class="validity">Valid for your next visit until <strong>${expiryDate}</strong></div>
              <a href="https://aarunodya-residency.vercel.app/rooms" class="btn">Book Your Next Darshan Stay</a>
            </div>

            <p style="font-size: 12px; color: #86868b; line-height: 1.5;">
              Simply enter coupon code <strong>${couponCode}</strong> during online checkout or present it at our front desk reception desk upon your arrival.
            </p>

            <div class="footer">
              <p style="margin: 0 0 4px;"><strong>Aarunodya Residency Bhakt Niwas</strong></p>
              <p style="margin: 0 0 8px;">1563 Ghongade Galli, Nath Chowk, Pandharpur • Near Vitthal Mandir</p>
              <p style="margin: 0;">Host Yuvaraj Malave: +91 85300 00820 / +91 91724 64746</p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!this.isConfigured()) {
      console.log(`[Mock Resend Service] Post-checkout coupon email dispatched to ${customerEmail}: Code ${couponCode}`);
      return { success: true, id: `mock-resend-${Date.now()}` };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [customerEmail],
          subject: subject || 'Thank You for Staying With Us! Here is a Special Gift 🎁',
          html: htmlContent
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        console.warn('Resend post-checkout API notice:', resData);
        return { success: false, error: resData?.message || 'Email delivery notice' };
      }

      console.log(`Post-checkout email sent via Resend. ID: ${resData.id}`);
      return { success: true, id: resData.id };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Resend error';
      console.error('Post-checkout email delivery error:', msg);
      return { success: false, error: msg };
    }
  }
}

export const resendService = new ResendEmailService();


'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Users, 
  CreditCard, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { formatPaise } from '@/lib/utils/currency';
import { calculateNights, formatDisplayDate, getOffsetDateString } from '@/lib/utils/dates';
import { RoomType, PriceBreakdown } from '@/lib/types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomSlug = searchParams.get('roomType') || 'deluxe-ac-room';
  const initialCheckIn = searchParams.get('checkIn') || getOffsetDateString(0);
  const initialCheckOut = searchParams.get('checkOut') || getOffsetDateString(2);
  const initialAdults = parseInt(searchParams.get('adults') || '2', 10);

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [adults, setAdults] = useState(initialAdults);
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    description: string;
    discountPaise: number;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Process states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [holdBookingRef, setHoldBookingRef] = useState<string | null>(null);
  const [holdSecondsLeft, setHoldSecondsLeft] = useState<number | null>(null);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState<any>(null);

  // Load room details & check availability
  useEffect(() => {
    async function loadData() {
      setIsLoadingAvailability(true);
      try {
        const res = await fetch(`/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`);
        const data = await res.json();
        if (data.roomTypes) {
          const match = data.roomTypes.find((item: any) => item.roomType.slug === roomSlug) || data.roomTypes[0];
          if (match) {
            setRoomType(match.roomType);
            setPricing(match.pricing);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingAvailability(false);
      }
    }
    loadData();
  }, [roomSlug, checkIn, checkOut, adults]);

  // Hold Timer countdown
  useEffect(() => {
    if (holdSecondsLeft === null || holdSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setHoldSecondsLeft(prev => (prev && prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [holdSecondsLeft]);

  // Handle Apply Coupon
  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponCodeInput.trim() || !pricing || !roomType) return;
    setIsValidatingCoupon(true);
    setCouponMessage(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCodeInput.trim(),
          roomTypeId: roomType.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          subtotalPaise: pricing.subtotalPaise,
          customerEmail: email || undefined,
          customerPhone: phone || undefined
        })
      });

      const data = await res.json();
      if (!data.isValid) {
        setAppliedCoupon(null);
        setCouponMessage({ type: 'error', text: data.reason || 'Invalid coupon code.' });
      } else {
        setAppliedCoupon({
          code: data.coupon.code,
          description: data.coupon.description,
          discountPaise: data.discountPaise
        });
        setCouponMessage({
          type: 'success',
          text: `Coupon ${data.coupon.code} applied! Saved ${formatPaise(data.discountPaise)}.`
        });
      }
    } catch {
      setCouponMessage({ type: 'error', text: 'Unable to validate coupon.' });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponMessage(null);
  };

  // Handle Initiate Checkout Hold & Razorpay Order
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!roomType) {
      setErrorMessage('Please select a valid room type.');
      return;
    }

    if (!fullName || !email || !phone) {
      setErrorMessage('Please provide your full name, email, and phone number.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('Please agree to the lodge stay terms.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/bookings/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId: roomType.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numAdults: adults,
          numChildren: 0,
          guestName: fullName,
          guestEmail: email,
          guestPhone: phone,
          specialRequests,
          couponCode: appliedCoupon?.code
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reserve booking hold.');
      }

      setHoldBookingRef(data.bookingReference);
      setHoldSecondsLeft(15 * 60);
      setCurrentOrderData(data);

      // Cache booking hold in client storage for multi-lambda continuity
      try {
        if (typeof window !== 'undefined') {
          if (data.bookingToken) {
            localStorage.setItem(`arn_token_${data.bookingReference}`, data.bookingToken);
          }
          if (data.booking) {
            localStorage.setItem(`arn_booking_${data.bookingReference}`, JSON.stringify(data.booking));
            localStorage.setItem('arn_latest_ref', data.bookingReference);
          }
        }
      } catch (storageErr) {
        console.warn('Local storage notice:', storageErr);
      }

      if (typeof window !== 'undefined' && window.Razorpay && !data.order.isMock) {
        const options = {
          key: data.keyId,
          amount: data.order.amount,
          currency: data.order.currency,
          name: 'Aarunodya Residency Bhakt Niwas',
          description: `Stay: ${roomType.name} (${data.booking.numNights} Nights)`,
          image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=128&q=80',
          order_id: data.order.id,
          prefill: {
            name: fullName,
            email: email,
            contact: phone
          },
          theme: {
            color: '#0071e3'
          },
          handler: async function (response: any) {
            await handleVerifyPayment({
              bookingReference: data.bookingReference,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setShowSandboxModal(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout encountered an error';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  const handleVerifyPayment = async ({
    bookingReference,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  }: {
    bookingReference: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    try {
      // Retrieve cryptographic token from state or localStorage
      let bookingToken = currentOrderData?.bookingToken;
      if (!bookingToken && typeof window !== 'undefined') {
        bookingToken = localStorage.getItem(`arn_token_${bookingReference}`) || undefined;
      }

      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingReference,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          bookingToken
        })
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Payment signature verification failed.');
      }

      // Persist confirmed booking state in client storage for offline/multi-lambda resiliency
      if (typeof window !== 'undefined') {
        try {
          if (verifyData.booking) {
            localStorage.setItem(`arn_booking_${bookingReference}`, JSON.stringify(verifyData.booking));
            localStorage.setItem('arn_latest_booking', JSON.stringify(verifyData.booking));
          }
          if (verifyData.bookingToken) {
            localStorage.setItem(`arn_token_${bookingReference}`, verifyData.bookingToken);
            localStorage.setItem('arn_latest_token', verifyData.bookingToken);
          }
          localStorage.setItem('arn_latest_ref', bookingReference);
        } catch (storageErr) {
          console.warn('Storage persist notice:', storageErr);
        }
      }

      router.push(`/booking/confirmation/${encodeURIComponent(bookingReference)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setErrorMessage(msg);
      setIsSubmitting(false);
      setShowSandboxModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] flex flex-col font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />

      <div className="pt-24 pb-4 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <Link
          href="/rooms"
          className="inline-flex items-center space-x-1.5 text-xs text-[#86868b] hover:text-[#0071e3] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to suites</span>
        </Link>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 pb-20 w-full">
        {/* Hold Timer Alert if active */}
        {holdBookingRef && holdSecondsLeft !== null && (
          <div className="mb-8 p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.08] flex items-center justify-between text-xs sm:text-sm text-[#1d1d1f]">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#0071e3]" />
              <span>
                Room hold active for booking <strong>{holdBookingRef}</strong>.
              </span>
            </div>
            <div className="font-mono font-semibold text-[#0071e3] text-sm sm:text-base">
              {Math.floor(holdSecondsLeft / 60)}:{(holdSecondsLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Guest Form (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
                Checkout
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
                Guest details & payment.
              </h1>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleProceedToPayment} className="space-y-6">
              <div className="p-7 rounded-3xl bg-[#f5f5f7] border border-black/[0.04] space-y-4">
                <h3 className="text-base font-semibold text-[#1d1d1f]">
                  Primary Guest
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#86868b] mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="e.g. Rameshwar Shinde"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-12 bg-white border border-black/[0.12] rounded-2xl px-4 text-base sm:text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#86868b] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      placeholder="rameshwar@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 bg-white border border-black/[0.12] rounded-2xl px-4 text-base sm:text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#86868b] mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-12 bg-white border border-black/[0.12] rounded-2xl px-4 text-base sm:text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#86868b] mb-1">
                      Special Requests / Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Ground floor preference for senior devotees, early morning arrival..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full bg-white border border-black/[0.12] rounded-2xl p-3 text-base sm:text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-7 rounded-3xl bg-[#f5f5f7] border border-black/[0.04] space-y-3">
                <h3 className="text-base font-semibold text-[#1d1d1f]">
                  Secure Online Payment
                </h3>
                <p className="text-xs text-[#86868b] leading-relaxed">
                  Encrypted checkout via Razorpay. Supports UPI (Google Pay, PhonePe, Paytm), Credit &amp; Debit cards, and NetBanking.
                </p>

                <label className="flex items-start space-x-2.5 text-xs text-[#86868b] cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded text-[#0071e3] focus:ring-0"
                    required
                  />
                  <span>
                    I agree to the lodge stay policies and 24-hour flexible cancellation terms.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoadingAvailability}
                className="w-full h-13 sm:h-12 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-sm sm:text-xs font-semibold tracking-tight flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 disabled:opacity-60"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Securing Room...'
                    : `Pay ${pricing ? formatPaise(Math.max(0, pricing.totalAmountPaise - (appliedCoupon?.discountPaise || 0))) : '...'} & Confirm`}
                </span>
              </button>
            </form>
          </div>

          {/* Stay Summary (Right 5 Cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-[#f5f5f7] rounded-3xl p-7 border border-black/[0.04] space-y-6">
              <h3 className="text-lg font-semibold text-[#1d1d1f] tracking-tight">Stay Summary</h3>

              {roomType && (
                <div className="space-y-4 text-xs">
                  <div className="h-40 rounded-2xl overflow-hidden relative">
                    <img
                      src={roomType.images[0]?.url}
                      alt={roomType.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <span className="block font-semibold text-sm">{roomType.name}</span>
                      <span className="text-[11px] opacity-80">{roomType.viewType}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-black/[0.04] space-y-2">
                    <div className="flex justify-between text-[#86868b]">
                      <span>Check-in</span>
                      <span className="text-[#1d1d1f] font-medium">{formatDisplayDate(checkIn)} (12:00 PM)</span>
                    </div>
                    <div className="flex justify-between text-[#86868b]">
                      <span>Check-out</span>
                      <span className="text-[#1d1d1f] font-medium">{formatDisplayDate(checkOut)} (11:00 AM)</span>
                    </div>
                    <div className="flex justify-between text-[#86868b]">
                      <span>Duration</span>
                      <span className="text-[#1d1d1f] font-medium">{pricing?.numNights} Nights</span>
                    </div>
                    <div className="flex justify-between text-[#86868b]">
                      <span>Guests</span>
                      <span className="text-[#1d1d1f] font-medium">{adults} Guests</span>
                    </div>
                  </div>

                  {/* Coupon Code Section */}
                  <div className="p-4 rounded-2xl bg-white border border-black/[0.04] space-y-2.5">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                      Promotion / Pilgrim Coupon
                    </span>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-xs text-emerald-800 tracking-wider">
                            {appliedCoupon.code}
                          </span>
                          <span className="block text-[10px] text-emerald-700">
                            {appliedCoupon.description} (-{formatPaise(appliedCoupon.discountPaise)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-[11px] text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="e.g. VITTHAL10"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          className="flex-1 h-9 px-3 text-xs uppercase font-mono bg-[#f5f5f7] border border-black/[0.08] rounded-xl focus:outline-none focus:border-[#0071e3]"
                        />
                        <button
                          type="button"
                          disabled={isValidatingCoupon || !couponCodeInput.trim()}
                          onClick={handleApplyCoupon}
                          className="px-3.5 h-9 bg-[#1d1d1f] hover:bg-black text-white text-xs font-medium rounded-xl transition-all disabled:opacity-50"
                        >
                          {isValidatingCoupon ? 'Checking...' : 'Apply'}
                        </button>
                      </div>
                    )}

                    {couponMessage && (
                      <p className={`text-[11px] ${couponMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {couponMessage.text}
                      </p>
                    )}
                  </div>

                  {pricing && (
                    <div className="space-y-2 pt-2 border-t border-black/[0.06] text-xs">
                      <div className="flex justify-between text-[#86868b]">
                        <span>Room Tariff ({pricing.numNights} nights)</span>
                        <span className="text-[#1d1d1f]">{formatPaise(pricing.subtotalPaise)}</span>
                      </div>
                      {pricing.resortFeePaise > 0 && (
                        <div className="flex justify-between text-[#86868b]">
                          <span>Resort Service Fee</span>
                          <span className="text-[#1d1d1f]">{formatPaise(pricing.resortFeePaise)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#86868b]">
                        <span>GST (Hospitality Tax)</span>
                        <span className="text-[#1d1d1f]">{formatPaise(pricing.taxPaise)}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>Coupon Discount ({appliedCoupon.code})</span>
                          <span>-{formatPaise(appliedCoupon.discountPaise)}</span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-black/[0.08] flex justify-between items-baseline">
                        <span className="text-sm font-semibold text-[#1d1d1f]">Total Payable</span>
                        <span className="text-2xl font-semibold text-[#0071e3] tracking-tight">
                          {formatPaise(Math.max(0, pricing.totalAmountPaise - (appliedCoupon?.discountPaise || 0)))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Razorpay Sandbox Simulator Dialog */}
        {showSandboxModal && currentOrderData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6 border border-black/[0.06]">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">Razorpay Checkout</h3>
                <p className="text-xs text-[#86868b]">
                  Order: <span className="font-mono text-[#1d1d1f]">{currentOrderData.order.id}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f5f5f7] space-y-2 text-xs">
                <div className="flex justify-between text-[#86868b]">
                  <span>Guest:</span>
                  <span className="text-[#1d1d1f] font-medium">{fullName}</span>
                </div>
                <div className="flex justify-between text-[#86868b]">
                  <span>Ref:</span>
                  <span className="font-mono text-[#0071e3] font-semibold">{currentOrderData.bookingReference}</span>
                </div>
                <div className="flex justify-between text-[#86868b] pt-2 border-t border-black/[0.06]">
                  <span className="font-semibold text-[#1d1d1f]">Amount:</span>
                  <span className="text-base font-semibold text-[#1d1d1f]">
                    {formatPaise(currentOrderData.order.amount)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleVerifyPayment({
                    bookingReference: currentOrderData.bookingReference,
                    razorpayOrderId: currentOrderData.order.id,
                    razorpayPaymentId: `pay_rzp_mock_${Date.now()}`,
                    razorpaySignature: `sig_mock_verified_${Date.now()}`
                  })}
                  className="w-full py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-xs font-medium tracking-tight transition-all active:scale-[0.98]"
                >
                  Simulate Successful Payment
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSandboxModal(false);
                    setIsSubmitting(false);
                  }}
                  className="w-full py-2 text-xs text-[#86868b] hover:text-[#1d1d1f]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white text-[#1d1d1f] flex items-center justify-center">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

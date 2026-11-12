'use client';

import React, { useState, useEffect } from 'react';
import {
  MailCheck,
  Send,
  Sparkles,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Tag,
  Mail,
  User,
  ExternalLink
} from 'lucide-react';
import { PostCheckoutCampaign, EmailNotificationRecord } from '@/lib/types';
import { formatPaise } from '@/lib/utils/currency';

export default function PostCheckoutOffersPage() {
  const [campaign, setCampaign] = useState<PostCheckoutCampaign | null>(null);
  const [notifications, setNotifications] = useState<EmailNotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Retrying state
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'settings' | 'preview'>('settings');

  // Form states
  const [isEnabled, setIsEnabled] = useState(true);
  const [name, setName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBodyIntro, setEmailBodyIntro] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [discountValue, setDiscountValue] = useState('15');
  const [validityDays, setValidityDays] = useState('90');
  const [minBookingSpend, setMinBookingSpend] = useState('1000');
  const [maxDiscountCap, setMaxDiscountCap] = useState('500');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/marketing/campaign');
      const data = await res.json();
      if (data.campaign) {
        setCampaign(data.campaign);
        setIsEnabled(data.campaign.isEnabled);
        setName(data.campaign.name || '');
        setEmailSubject(data.campaign.emailSubject || '');
        setEmailBodyIntro(data.campaign.emailBodyIntro || '');
        setDiscountType(data.campaign.discountType || 'percentage');
        setDiscountValue(
          data.campaign.discountType === 'percentage'
            ? data.campaign.discountValue.toString()
            : (data.campaign.discountValue / 100).toString()
        );
        setValidityDays(data.campaign.validityDays?.toString() || '90');
        setMinBookingSpend(data.campaign.minBookingAmountPaise ? (data.campaign.minBookingAmountPaise / 100).toString() : '');
        setMaxDiscountCap(data.campaign.maxDiscountAmountPaise ? (data.campaign.maxDiscountAmountPaise / 100).toString() : '');
      }
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to load campaign data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const parsedVal = parseFloat(discountValue);
      if (isNaN(parsedVal) || parsedVal <= 0) {
        throw new Error('Please enter a valid discount value.');
      }

      const val = discountType === 'percentage' ? parsedVal : Math.round(parsedVal * 100);

      const payload = {
        name: name.trim(),
        isEnabled,
        emailSubject: emailSubject.trim(),
        emailBodyIntro: emailBodyIntro.trim(),
        discountType,
        discountValue: val,
        validityDays: parseInt(validityDays) || 90,
        minBookingAmountPaise: minBookingSpend ? Math.round(parseFloat(minBookingSpend) * 100) : undefined,
        maxDiscountAmountPaise: maxDiscountCap ? Math.round(parseFloat(maxDiscountCap) * 100) : undefined,
        generateUniqueCodePerCustomer: true
      };

      const res = await fetch('/api/admin/marketing/campaign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update campaign settings');
      }

      setCampaign(data.campaign);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetryEmail = async (notificationId: string) => {
    setRetryingId(notificationId);
    try {
      const res = await fetch('/api/admin/marketing/notifications/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Retry failed');
      } else {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRetryingId(null);
    }
  };

  const calculateExpiryDisplay = () => {
    const d = new Date();
    d.setDate(d.getDate() + (parseInt(validityDays) || 90));
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <MailCheck className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-purple-800">
              Automated Retention Marketing
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
            Post-Checkout Loyalty Offers
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            Idempotent automated gift emails dispatched when front desk marks checkout
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-white border border-black/[0.08] text-[#86868b] hover:text-[#1d1d1f]"
            title="Refresh logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Campaign Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Campaign Editor & Live Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-base text-[#1d1d1f]">
                  Checkout Campaign Configuration
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isEnabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}>
                  {isEnabled ? 'Campaign Active' : 'Campaign Paused'}
                </span>
              </div>

              {/* Tab Switcher */}
              <div className="flex items-center p-1 bg-[#f5f5f7] rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTab('settings')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    previewTab === 'settings' ? 'bg-white shadow text-[#1d1d1f]' : 'text-[#86868b]'
                  }`}
                >
                  Settings
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('preview')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center space-x-1 ${
                    previewTab === 'preview' ? 'bg-white shadow text-[#1d1d1f]' : 'text-[#86868b]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Email Preview</span>
                </button>
              </div>
            </div>

            {previewTab === 'settings' ? (
              <form onSubmit={handleSaveCampaign} className="space-y-4">
                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
                  <div>
                    <span className="text-xs font-bold text-[#1d1d1f]">
                      Automatically Send Gift Coupon on Checkout
                    </span>
                    <p className="text-[11px] text-[#86868b]">
                      Generates unique RETURN-XXXX code and emails guest immediately upon departure
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => setIsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0071e3]"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                      Campaign Title
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                      Email Subject Line *
                    </label>
                    <input
                      type="text"
                      required
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    Opening Greeting / Pilgrim Blessing Note
                  </label>
                  <textarea
                    rows={2}
                    value={emailBodyIntro}
                    onChange={(e) => setEmailBodyIntro(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-black/[0.06] rounded-xl p-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:bg-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                      Discount Type
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-2.5 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    >
                      <option value="percentage">Percent (%)</option>
                      <option value="fixed_amount">Fixed (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs font-bold text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                      Validity (Days)
                    </label>
                    <input
                      type="number"
                      required
                      value={validityDays}
                      onChange={(e) => setValidityDays(e.target.value)}
                      className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                      Max Cap (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={maxDiscountCap}
                      onChange={(e) => setMaxDiscountCap(e.target.value)}
                      className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                </div>

                {saveError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
                    {saveError}
                  </div>
                )}
                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Post-checkout campaign settings updated successfully!</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Saving Changes...' : 'Save Campaign Settings'}
                  </button>
                </div>
              </form>
            ) : (
              /* Live Visual Hospitality Email Preview */
              <div className="bg-stone-100 p-6 rounded-2xl border border-black/[0.06] space-y-4">
                <div className="bg-white max-w-lg mx-auto rounded-2xl shadow-md border border-stone-200 overflow-hidden text-[#1d1d1f]">
                  {/* Email Header */}
                  <div className="bg-[#1d1d1f] text-white p-6 text-center space-y-1">
                    <p className="text-amber-300 font-serif font-bold text-lg">आ</p>
                    <h2 className="text-lg font-bold tracking-tight">Aarunodya Residency</h2>
                    <p className="text-[11px] text-stone-300 uppercase tracking-widest">
                      Bhakt Niwas • Pandharpur
                    </p>
                  </div>

                  {/* Email Body */}
                  <div className="p-6 space-y-4 text-xs leading-relaxed text-stone-700">
                    <p className="font-semibold text-stone-900">
                      Dear Devotee Ramesh Kulkarni,
                    </p>
                    <p>
                      {emailBodyIntro || 'Thank you for choosing Aarunodya Residency during your holy pilgrimage to Shri Vitthal-Rukmini Mandir. We hope your stay was peaceful and blessed.'}
                    </p>
                    <p>
                      As a token of our appreciation for returning devotees, please accept this special welcome-back gift voucher for your next visit:
                    </p>

                    {/* Voucher Card */}
                    <div className="bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-2xl p-4 text-center space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Exclusive Return Devotee Voucher
                      </span>
                      <div className="font-mono text-2xl font-bold tracking-widest text-[#1d1d1f]">
                        RETURN-7K9A2M
                      </div>
                      <p className="text-sm font-bold text-amber-900">
                        {discountType === 'percentage' ? `${discountValue}% OFF` : `₹${discountValue} OFF`} on your entire booking
                      </p>
                      <p className="text-[10px] text-stone-500">
                        Valid until {calculateExpiryDisplay()} • Applicable on all AC & Non-AC rooms
                      </p>
                    </div>

                    <p className="text-stone-600">
                      Simply enter this code when booking online or present it at the front desk upon your next arrival in Pandharpur.
                    </p>

                    <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500">
                      <p className="font-semibold text-stone-700">Warm regards & Jai Hari Vitthal,</p>
                      <p>The Malave Family & Aarunodya Front Desk Team</p>
                      <p>1563 Ghongade Galli, Nath Chowk, Pandharpur</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Dispatch Statistics */}
        <div className="space-y-6">
          <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-4">
            <span className="font-semibold text-base text-[#1d1d1f] block pb-2 border-b border-black/[0.04]">
              Dispatch Metrics
            </span>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-purple-900 font-medium">Delivered Emails</p>
                  <p className="text-2xl font-bold text-purple-950">
                    {notifications.filter((n) => (n.deliveryStatus || n.status) === 'sent').length}
                  </p>
                </div>
                <MailCheck className="w-6 h-6 text-purple-600" />
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-stone-600 font-medium">Failed / Undeliverable</p>
                  <p className="text-2xl font-bold text-stone-800">
                    {notifications.filter((n) => (n.deliveryStatus || n.status) === 'failed').length}
                  </p>
                </div>
                <AlertCircle className="w-6 h-6 text-stone-400" />
              </div>
            </div>

            <p className="text-[11px] text-[#86868b] leading-relaxed pt-2">
              Emails are sent via Resend API using verified host domain <code>devtushar.uk</code>. If no guest email was collected at check-in, the system generates the coupon record safely in the customer folio.
            </p>
          </div>
        </div>
      </div>

      {/* Email Notification History Table */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
          <div>
            <h2 className="text-base font-semibold text-[#1d1d1f]">
              Automated Outbox & Delivery History
            </h2>
            <p className="text-xs text-[#86868b]">
              Audit trail of every post-checkout loyalty email dispatched
            </p>
          </div>
          <span className="text-xs font-bold text-[#86868b]">
            {notifications.length} Records
          </span>
        </div>

        {notifications.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Mail className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold text-[#1d1d1f]">No post-checkout emails logged yet</p>
            <p className="text-xs text-[#86868b]">
              When front desk marks any guest as Checked Out, their return coupon will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.04] text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Devotee Guest</th>
                  <th className="py-3 px-3">Booking Ref</th>
                  <th className="py-3 px-3">Coupon Assigned</th>
                  <th className="py-3 px-3">Recipient Email</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {notifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-3 text-[#86868b] whitespace-nowrap">
                      {new Date(notif.sentAt || notif.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[#1d1d1f]">
                      {notif.customerName || notif.recipientName}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#86868b]">
                      {notif.bookingReference}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {notif.couponCode ? (
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg text-[11px]">
                          {notif.couponCode}
                        </span>
                      ) : (
                        <span className="text-[#86868b]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-[#86868b]">
                      {notif.recipientEmail}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {(() => {
                        const st = notif.deliveryStatus || notif.status;
                        return (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            st === 'sent'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : st === 'failed'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {st}
                          </span>
                        );
                      })()}
                      {notif.failureReason && (
                        <p className="text-[10px] text-rose-600 truncate max-w-xs mt-0.5">
                          {notif.failureReason}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      {(notif.deliveryStatus === 'failed' || notif.status === 'failed') && (
                        <button
                          onClick={() => handleRetryEmail(notif.id)}
                          disabled={retryingId === notif.id}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#1d1d1f] text-[11px] font-semibold transition-colors disabled:opacity-50"
                        >
                          {retryingId === notif.id ? 'Retrying...' : 'Retry Email'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

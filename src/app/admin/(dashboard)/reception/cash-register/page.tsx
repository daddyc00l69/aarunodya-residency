'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Search,
  PlusCircle,
  RefreshCw,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Lock,
  Unlock
} from 'lucide-react';
import { formatPaise } from '@/lib/utils/currency';

interface CashSummary {
  openingFloatPaise: number;
  totalPaymentsPaise: number;
  totalRefundsPaise: number;
  netCashPaise: number;
  paymentsCount: number;
  refundsCount: number;
}

interface CashTxn {
  id: string;
  bookingId: string;
  bookingReference: string;
  guestName: string;
  roomNumber?: string;
  type: 'payment' | 'refund';
  amountPaise: number;
  receiptNumber: string;
  paymentMethod: string;
  cashierName: string;
  authorizedBy?: string;
  notes?: string;
  createdAt: string;
}

export default function CashRegisterPage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<CashSummary | null>(null);
  const [transactions, setTransactions] = useState<CashTxn[]>([]);
  const [activeShift, setActiveShift] = useState<any | null>(null);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  // Additional Payment Form
  const [paymentBookingRef, setPaymentBookingRef] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentCashier, setPaymentCashier] = useState('Front Desk Staff');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  // Refund Form
  const [refundBookingRef, setRefundBookingRef] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundAuthPin, setRefundAuthPin] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundError, setRefundError] = useState('');
  const [refundSuccess, setRefundSuccess] = useState('');

  // Shift Form
  const [openingFloatInput, setOpeningFloatInput] = useState('2000');
  const [closingActualCashInput, setClosingActualCashInput] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');
  const [shiftSubmitting, setShiftSubmitting] = useState(false);

  const fetchRegisterData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/reception/cash-register?date=${selectedDate}`);
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
      }
      if (data.transactions) {
        setTransactions(data.transactions);
      }
      if (data.activeShift !== undefined) {
        setActiveShift(data.activeShift);
      }
    } catch (err) {
      console.error('Failed to load cash register data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegisterData();
  }, [selectedDate]);

  // Handle Record Additional Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSubmitting(true);
    setPaymentError('');
    setPaymentSuccess('');
    try {
      const amountPaise = Math.round(parseFloat(paymentAmount) * 100);
      if (isNaN(amountPaise) || amountPaise <= 0) {
        throw new Error('Please enter a valid positive payment amount.');
      }

      const res = await fetch('/api/admin/reception/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingReference: paymentBookingRef.trim(),
          amountPaise,
          cashierName: paymentCashier.trim(),
          notes: paymentNote.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record payment');
      }

      setPaymentSuccess(`Payment of ₹${paymentAmount} recorded. Receipt: ${data.cashTransaction.receiptNumber}`);
      setTimeout(() => {
        setIsPaymentModalOpen(false);
        setPaymentBookingRef('');
        setPaymentAmount('');
        setPaymentNote('');
        setPaymentSuccess('');
        fetchRegisterData();
      }, 1500);
    } catch (err: any) {
      setPaymentError(err.message);
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // Handle Record Refund
  const handleRecordRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setRefundSubmitting(true);
    setRefundError('');
    setRefundSuccess('');
    try {
      const amountPaise = Math.round(parseFloat(refundAmount) * 100);
      if (isNaN(amountPaise) || amountPaise <= 0) {
        throw new Error('Please enter a valid refund amount.');
      }
      if (!refundReason.trim()) {
        throw new Error('Please enter an authorized reason for refund.');
      }

      const res = await fetch('/api/admin/reception/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingReference: refundBookingRef.trim(),
          amountPaise,
          reason: refundReason.trim(),
          authorizedBy: 'Owner / Manager',
          authorizationPin: refundAuthPin.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record refund');
      }

      setRefundSuccess(`Refund of ₹${refundAmount} authorized. Voucher: ${data.refundTransaction.receiptNumber}`);
      setTimeout(() => {
        setIsRefundModalOpen(false);
        setRefundBookingRef('');
        setRefundAmount('');
        setRefundReason('');
        setRefundSuccess('');
        fetchRegisterData();
      }, 1500);
    } catch (err: any) {
      setRefundError(err.message);
    } finally {
      setRefundSubmitting(false);
    }
  };

  // Handle Open / Close Shift
  const handleToggleShift = async (action: 'open' | 'close') => {
    setShiftSubmitting(true);
    try {
      const payload: any = { action };
      if (action === 'open') {
        payload.openingFloatPaise = Math.round(parseFloat(openingFloatInput || '0') * 100);
      } else {
        payload.closingActualCashPaise = Math.round(parseFloat(closingActualCashInput || '0') * 100);
        payload.notes = shiftNotes.trim();
      }

      const res = await fetch('/api/admin/reception/cash-shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed shift operation');
      }

      setIsShiftModalOpen(false);
      fetchRegisterData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setShiftSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Coins className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-amber-800">
              Front Desk Cash Register
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
            Cash Ledger & Daily Shift
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            Physical drawer cash accounting, verified receipts, and refund audit trail
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-black/[0.08] shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-[#86868b]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-medium text-[#1d1d1f] focus:outline-none"
            />
          </div>

          <button
            onClick={fetchRegisterData}
            className="p-2 rounded-xl bg-white border border-black/[0.08] text-[#86868b] hover:text-[#1d1d1f] hover:bg-stone-50"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Collect Payment</span>
          </button>

          <button
            onClick={() => setIsRefundModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 shadow-sm transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Issue Refund</span>
          </button>
        </div>
      </div>

      {/* Cash Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Cash in Drawer */}
        <div className="bg-white border border-black/[0.06] rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#86868b]">
            <span className="font-semibold uppercase tracking-wider">Drawer Net Cash</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
            {summary ? formatPaise(summary.netCashPaise) : '₹0'}
          </p>
          <p className="text-[11px] text-[#86868b]">
            Includes float + collections - refunds
          </p>
        </div>

        {/* Total Cash Collections */}
        <div className="bg-white border border-black/[0.06] rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#86868b]">
            <span className="font-semibold uppercase tracking-wider text-emerald-800">Collections</span>
            <div className="p-1 rounded-full bg-emerald-100 text-emerald-700">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-emerald-700">
            {summary ? formatPaise(summary.totalPaymentsPaise) : '₹0'}
          </p>
          <p className="text-[11px] text-[#86868b]">
            {summary?.paymentsCount || 0} cash receipts issued
          </p>
        </div>

        {/* Total Refunds */}
        <div className="bg-white border border-black/[0.06] rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#86868b]">
            <span className="font-semibold uppercase tracking-wider text-rose-800">Cash Refunds</span>
            <div className="p-1 rounded-full bg-rose-100 text-rose-700">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-rose-700">
            {summary ? formatPaise(summary.totalRefundsPaise) : '₹0'}
          </p>
          <p className="text-[11px] text-[#86868b]">
            {summary?.refundsCount || 0} refunds authorized
          </p>
        </div>

        {/* Shift Reconciliation Status */}
        <div className="bg-white border border-black/[0.06] rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#86868b]">
            <span className="font-semibold uppercase tracking-wider">Shift Status</span>
            {activeShift ? (
              <span className="flex items-center space-x-1 text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Unlock className="w-3 h-3" />
                <span>OPEN</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-stone-500 font-bold text-[10px] bg-stone-100 px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3" />
                <span>CLOSED</span>
              </span>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1d1d1f]">
              {activeShift ? `Float: ${formatPaise(activeShift.openingFloatPaise)}` : 'No open cashier shift'}
            </p>
            <p className="text-[11px] text-[#86868b] truncate">
              {activeShift ? `Started by ${activeShift.cashierName}` : 'Open shift to track drawer'}
            </p>
          </div>
          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="w-full py-1.5 rounded-xl border border-black/[0.08] text-xs font-semibold hover:bg-stone-50 transition-colors"
          >
            {activeShift ? 'Reconcile & Close Shift' : 'Open Register Shift'}
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
          <div>
            <h2 className="text-base font-semibold text-[#1d1d1f]">
              Cash Transactions Ledger
            </h2>
            <p className="text-xs text-[#86868b]">
              Official receipt vouchers and cashier entries for {selectedDate}
            </p>
          </div>
          <span className="text-xs font-bold text-[#86868b]">
            {transactions.length} Entries
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Coins className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold text-[#1d1d1f]">No cash transactions on this date</p>
            <p className="text-xs text-[#86868b]">
              New walk-ins or cash receipts will appear here immediately
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.04] text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Receipt / Ref</th>
                  <th className="py-3 px-3">Guest & Room</th>
                  <th className="py-3 px-3">Cashier</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-3 text-[#86868b] whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tx.type === 'payment'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {tx.type === 'payment' ? '+ Cash In' : '- Refund'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#1d1d1f] whitespace-nowrap">
                      {tx.receiptNumber}
                      <span className="block text-[10px] text-[#86868b] font-normal">
                        Booking: {tx.bookingReference}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-[#1d1d1f]">{tx.guestName}</p>
                      <p className="text-[11px] text-[#86868b]">
                        {tx.roomNumber ? `Room ${tx.roomNumber}` : 'Unassigned'}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 text-[#86868b] whitespace-nowrap">
                      <p className="text-[#1d1d1f] font-medium">{tx.cashierName}</p>
                      {tx.notes && <p className="text-[10px] truncate max-w-xs">{tx.notes}</p>}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-sm whitespace-nowrap">
                      <span className={tx.type === 'payment' ? 'text-emerald-700' : 'text-rose-700'}>
                        {tx.type === 'payment' ? '+' : '-'}{formatPaise(tx.amountPaise)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <Link
                        href={`/booking/invoice/${tx.bookingReference}`}
                        target="_blank"
                        className="text-xs text-[#0071e3] hover:underline font-medium"
                      >
                        Receipt
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Collect Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/[0.08] animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-[#0071e3]" />
                <h3 className="font-bold text-base text-[#1d1d1f]">Record Additional Payment</h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Booking Reference Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ARN-202611-XXXX"
                  value={paymentBookingRef}
                  onChange={(e) => setPaymentBookingRef(e.target.value.toUpperCase())}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 font-mono uppercase text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Cash Collected Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="e.g. 1500"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs font-bold text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Cashier Name *
                </label>
                <input
                  type="text"
                  required
                  value={paymentCashier}
                  onChange={(e) => setPaymentCashier(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Transaction Notes / Bill Settlement
                </label>
                <input
                  type="text"
                  placeholder="e.g. Balance settlement at check-out"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              {paymentError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
                  {paymentError}
                </div>
              )}
              {paymentSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
                  {paymentSuccess}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-black/[0.08] hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] disabled:opacity-50 shadow-sm"
                >
                  {paymentSubmitting ? 'Recording...' : 'Record Payment & Issue Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Authorized Refund Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/[0.08] animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-[#1d1d1f]">Issue Cash Refund</h3>
              </div>
              <button
                onClick={() => setIsRefundModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordRefund} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Booking Reference Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ARN-202611-XXXX"
                  value={refundBookingRef}
                  onChange={(e) => setRefundBookingRef(e.target.value.toUpperCase())}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 font-mono uppercase text-xs text-[#1d1d1f] focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Refund Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="e.g. 500"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs font-bold text-rose-700 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Authorized Reason for Refund *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Guest cut trip short by 1 day due to temple darshan timing change"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-[#f5f5f7] border border-black/[0.06] rounded-xl p-2.5 text-xs text-[#1d1d1f] focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Manager Authorization PIN
                </label>
                <input
                  type="password"
                  placeholder="Manager PIN"
                  value={refundAuthPin}
                  onChange={(e) => setRefundAuthPin(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-rose-500"
                />
              </div>

              {refundError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
                  {refundError}
                </div>
              )}
              {refundSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
                  {refundSuccess}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-black/[0.08] hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 shadow-sm"
                >
                  {refundSubmitting ? 'Authorizing...' : 'Authorize Cash Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shift Open / Close Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/[0.08] animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-[#1d1d1f]">
                  {activeShift ? 'Close & Reconcile Shift' : 'Open Front Desk Shift'}
                </h3>
              </div>
              <button
                onClick={() => setIsShiftModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {activeShift ? (
                <>
                  <div className="p-3 rounded-xl bg-stone-50 border border-black/[0.04] text-xs space-y-1">
                    <p className="text-[#86868b]">Opening Float: <strong>{formatPaise(activeShift.openingFloatPaise)}</strong></p>
                    <p className="text-[#86868b]">Collections: <strong>{formatPaise(summary?.totalPaymentsPaise || 0)}</strong></p>
                    <p className="text-[#86868b]">Refunds: <strong>{formatPaise(summary?.totalRefundsPaise || 0)}</strong></p>
                    <p className="text-sm font-bold text-[#1d1d1f] pt-1 border-t border-black/[0.06]">
                      Expected Cash in Drawer: {formatPaise(summary?.netCashPaise || 0)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                      Actual Physical Count in Drawer (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Count total currency in drawer"
                      value={closingActualCashInput}
                      onChange={(e) => setClosingActualCashInput(e.target.value)}
                      className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs font-bold text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                      Reconciliation / Handover Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Handed over ₹5000 cash to evening shift cashier"
                      value={shiftNotes}
                      onChange={(e) => setShiftNotes(e.target.value)}
                      className="w-full bg-[#f5f5f7] border border-black/[0.06] rounded-xl p-2.5 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsShiftModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-medium border border-black/[0.08]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={shiftSubmitting}
                      onClick={() => handleToggleShift('close')}
                      className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1d1d1f] text-white hover:bg-black disabled:opacity-50 shadow-sm"
                    >
                      {shiftSubmitting ? 'Closing...' : 'Close Shift & Seal Ledger'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                      Opening Drawer Float (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 2000"
                      value={openingFloatInput}
                      onChange={(e) => setOpeningFloatInput(e.target.value)}
                      className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs font-bold text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    />
                    <p className="text-[11px] text-[#86868b] mt-1">
                      Small change/notes kept in drawer before opening for walk-ins
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsShiftModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-medium border border-black/[0.08]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={shiftSubmitting}
                      onClick={() => handleToggleShift('open')}
                      className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] disabled:opacity-50 shadow-sm"
                    >
                      {shiftSubmitting ? 'Opening...' : 'Start New Cash Shift'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

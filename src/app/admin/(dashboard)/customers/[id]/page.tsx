'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  ShieldCheck,
  FileText,
  Upload,
  ArrowLeft,
  Calendar,
  BedDouble,
  Coins,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Download,
  Eye,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { Customer, CustomerIdentityDocument, Booking } from '@/lib/types';
import { formatPaise } from '@/lib/utils/currency';

export default function CustomerProfilePage() {
  const params = useParams();
  const customerId = params?.id as string;
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docType, setDocType] = useState('aadhaar');
  const [docNumber, setDocNumber] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [docSide, setDocSide] = useState<'front' | 'back' | 'both'>('front');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const onFileChange = (file: File | null) => {
    setDocFile(file);
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`);
      const data = await res.json();
      if (data.customer) {
        setCustomer(data.customer);
      }
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchProfile();
    }
  }, [customerId]);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      setUploadError('Please take a photo or select an ID document file.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('documentType', docType);
      formData.append('documentNumber', docNumber.trim());
      formData.append('file', docFile);

      const res = await fetch(`/api/admin/customers/${customerId}/documents`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }

      setIsUploadModalOpen(false);
      setDocFile(null);
      setPreviewUrl(null);
      setDocNumber('');
      fetchProfile();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleVerifyDocument = async (docId: string, status: 'verified' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/customers/${customerId}/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#86868b]">Loading guest profile and identity records...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center space-y-4">
        <Users className="w-12 h-12 text-stone-300 mx-auto" />
        <h2 className="text-lg font-bold text-[#1d1d1f]">Guest Profile Not Found</h2>
        <Link
          href="/admin/customers"
          className="text-xs font-semibold text-[#0071e3] hover:underline"
        >
          ← Return to Guest Database
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/customers"
          className="flex items-center space-x-1.5 text-xs text-[#86868b] hover:text-[#1d1d1f] font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Guests</span>
        </Link>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center space-x-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-sm transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload ID Document</span>
        </button>
      </div>

      {/* Guest Summary Card */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center font-bold text-xl font-serif shadow-md">
              {customer.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
                  {customer.fullName}
                </h1>
                {customer.vipStatus && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>VIP Devotee</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#86868b] mt-0.5 font-mono">
                Customer ID: {customer.id} • Registered {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-6 text-xs bg-[#f5f5f7] p-3 rounded-2xl border border-black/[0.04]">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#86868b]">Visits</p>
              <p className="text-lg font-bold text-[#1d1d1f]">{customer.totalVisits || 1}</p>
            </div>
            <div className="h-6 w-px bg-black/[0.08]" />
            <div>
              <p className="text-[10px] uppercase font-bold text-[#86868b]">Lifetime Spend</p>
              <p className="text-lg font-bold text-emerald-700">{formatPaise(customer.totalSpendPaise || 0)}</p>
            </div>
          </div>
        </div>

        {/* Contact & Personal Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-black/[0.04] text-xs">
          <div className="space-y-1">
            <p className="text-[#86868b] font-medium">Contact Numbers</p>
            <p className="font-semibold text-[#1d1d1f] flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-stone-400" />
              <span>{customer.phone}</span>
            </p>
            {customer.alternatePhone && (
              <p className="text-[11px] text-[#86868b]">Alt: {customer.alternatePhone}</p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-[#86868b] font-medium">Email Address</p>
            <p className="font-semibold text-[#1d1d1f] flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              <span>{customer.email || 'No email registered'}</span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[#86868b] font-medium">Residential Location</p>
            <p className="font-semibold text-[#1d1d1f] flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>{customer.city || 'Unknown City'}, {customer.state || 'Maharashtra'}</span>
            </p>
            {customer.address && (
              <p className="text-[11px] text-[#86868b] truncate">{customer.address}</p>
            )}
          </div>
        </div>

        {customer.notes && (
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900">
            <strong>Front Desk Note:</strong> {customer.notes}
          </div>
        )}
      </div>

      {/* Government ID Documents Vault */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f]">
                Identity Document Vault
              </h2>
              <p className="text-xs text-[#86868b]">
                Secure non-public storage. Access is strictly audited.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="text-xs font-semibold text-[#0071e3] hover:underline"
          >
            + Add New Document
          </button>
        </div>

        {customer.documents.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <FileText className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs font-semibold text-[#1d1d1f]">No identity documents uploaded yet</p>
            <p className="text-[11px] text-[#86868b]">
              Upload Aadhaar, Passport, or Driving License to comply with hospitality police verification
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl border border-black/[0.06] bg-[#f5f5f7]/60 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1d1d1f] uppercase">
                      {doc.documentType.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      doc.verificationStatus === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : doc.verificationStatus === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {doc.verificationStatus}
                    </span>
                  </div>

                  <p className="font-mono text-sm font-bold text-[#1d1d1f]">
                    {doc.maskedNumber || doc.documentNumberMasked}
                  </p>
                  <p className="text-[10px] text-[#86868b]">
                    File: {doc.originalFileName || 'Scan'} • {(((doc.fileSize || doc.fileSizeBytes || 0)) / 1024).toFixed(1)} KB • Uploaded {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-black/[0.04] text-xs">
                  {/* Secure Authenticated Stream Link */}
                  <a
                    href={`/api/admin/documents/${doc.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 text-xs font-semibold text-[#0071e3] hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </a>

                  {/* Verification Toggle */}
                  <div className="flex items-center space-x-2">
                    {doc.verificationStatus !== 'verified' && (
                      <button
                        onClick={() => handleVerifyDocument(doc.id, 'verified')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[10px] hover:bg-emerald-700 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {doc.verificationStatus !== 'rejected' && (
                      <button
                        onClick={() => handleVerifyDocument(doc.id, 'rejected')}
                        className="px-2.5 py-1 rounded-lg bg-stone-200 text-stone-700 font-semibold text-[10px] hover:bg-rose-100 hover:text-rose-700 transition-colors"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Devotee Stay Folio & Reservations History */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
          <h2 className="text-base font-semibold text-[#1d1d1f]">
            Stay History & Reservations ({bookings.length})
          </h2>
          <span className="text-xs text-[#86868b]">
            All visits across Aarunodya Residency (18 physical units)
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#86868b]">
            No completed reservations found for this customer profile.
          </div>
        ) : (
          <>
            {/* Mobile Cards View (< 768px, zero horizontal scrolling) */}
            <div className="md:hidden space-y-2.5">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#1d1d1f] block">
                        {b.assignedRoomNumber ? `Room #${b.assignedRoomNumber}` : 'Room Pending'}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-[#0071e3]">
                        {b.bookingReference}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      b.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.paymentStatus === 'partially_paid'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {b.paymentStatus?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-black/[0.04]">
                    <span className="text-[11px] text-[#86868b]">
                      {b.checkInDate} → {b.checkOutDate}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#1d1d1f]">
                        {formatPaise(b.totalPricePaise || b.totalAmountPaise || 0)}
                      </span>
                      <Link
                        href={`/booking/invoice/${b.bookingReference}`}
                        target="_blank"
                        className="text-xs text-[#0071e3] font-semibold hover:underline inline-flex items-center space-x-0.5"
                      >
                        <span>Receipt</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/[0.04] text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                    <th className="py-3 px-3">Dates</th>
                    <th className="py-3 px-3">Room</th>
                    <th className="py-3 px-3">Reference</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3 text-right">Total</th>
                    <th className="py-3 px-3 text-right">Folio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50/70">
                      <td className="py-3.5 px-3 whitespace-nowrap text-[#1d1d1f] font-medium">
                        {b.checkInDate} → {b.checkOutDate}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[#1d1d1f]">
                        {b.assignedRoomNumber ? `Room ${b.assignedRoomNumber}` : '—'}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[#86868b]">
                        {b.bookingReference}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-800'
                            : b.paymentStatus === 'partially_paid'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}>
                          {b.paymentStatus?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-[#1d1d1f]">
                        {formatPaise(b.totalPricePaise || b.totalAmountPaise || 0)}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Link
                          href={`/booking/invoice/${b.bookingReference}`}
                          target="_blank"
                          className="text-xs text-[#0071e3] hover:underline font-medium inline-flex items-center space-x-1"
                        >
                          <span>Receipt</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Upload Document Modal with Camera & Gallery Dual Option */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-black/[0.08] animate-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#0071e3]" />
                <h3 className="font-bold text-base text-[#1d1d1f]">Capture / Upload Devotee ID</h3>
              </div>
              <button
                onClick={() => { setIsUploadModalOpen(false); setPreviewUrl(null); setDocFile(null); }}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Government ID Type *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full h-11 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs font-medium text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                >
                  <option value="aadhaar">Aadhaar Card (12 Digits)</option>
                  <option value="voter_id">Voter ID (Election Card)</option>
                  <option value="driving_license">Driving License</option>
                  <option value="passport">Indian / International Passport</option>
                  <option value="other">Other Official Government ID</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Document ID Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5432 8765 1234 or DL1420110012345"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full h-11 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs font-mono font-medium text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              {/* Document Side Selector */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Document Section
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#f5f5f7] rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setDocSide('front')}
                    className={`py-1.5 rounded-lg font-medium transition-all ${
                      docSide === 'front' ? 'bg-white shadow text-[#1d1d1f]' : 'text-[#86868b]'
                    }`}
                  >
                    Front Side
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocSide('back')}
                    className={`py-1.5 rounded-lg font-medium transition-all ${
                      docSide === 'back' ? 'bg-white shadow text-[#1d1d1f]' : 'text-[#86868b]'
                    }`}
                  >
                    Back Side
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocSide('both')}
                    className={`py-1.5 rounded-lg font-medium transition-all ${
                      docSide === 'both' ? 'bg-white shadow text-[#1d1d1f]' : 'text-[#86868b]'
                    }`}
                  >
                    Full / Both
                  </button>
                </div>
              </div>

              {/* Mobile Camera & Gallery Dual Buttons */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                  Capture Photograph or Document Scan *
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-[#0071e3] flex flex-col items-center justify-center space-y-1 active:scale-95 transition-all hover:bg-blue-100/60"
                  >
                    <Camera className="w-5 h-5 text-[#0071e3]" />
                    <span className="text-xs font-bold">Use Camera</span>
                    <span className="text-[10px] text-blue-700">Snap ID instantly</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-black/[0.08] text-[#1d1d1f] flex flex-col items-center justify-center space-y-1 active:scale-95 transition-all hover:bg-stone-100/70"
                  >
                    <ImageIcon className="w-5 h-5 text-stone-600" />
                    <span className="text-xs font-bold">From Gallery</span>
                    <span className="text-[10px] text-stone-500">Pick saved file</span>
                  </button>
                </div>

                {/* Hidden native file inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onFileChange(e.target.files[0]);
                    }
                  }}
                />

                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onFileChange(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-black/[0.08] bg-stone-100 p-2 text-center animate-in fade-in">
                  <img
                    src={previewUrl}
                    alt="ID Scan Preview"
                    className="max-h-44 mx-auto rounded-xl object-contain shadow-sm"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#86868b] pt-1.5 px-1">
                    <span className="truncate max-w-[200px]">{docFile?.name}</span>
                    <button
                      type="button"
                      onClick={() => { setDocFile(null); setPreviewUrl(null); }}
                      className="text-rose-600 font-bold hover:underline"
                    >
                      Retake / Remove
                    </button>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsUploadModalOpen(false); setPreviewUrl(null); setDocFile(null); }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-black/[0.08] text-[#1d1d1f] hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !docFile}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] disabled:opacity-50 shadow-sm flex items-center space-x-1.5"
                >
                  {isUploading ? (
                    <span>Securing in Vault...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Save to Secure Vault</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GitMerge,
  Star,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Customer } from '@/lib/types';
import { formatPaise } from '@/lib/utils/currency';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  // New Customer Form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [address, setAddress] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('Marathi');
  const [vipStatus, setVipStatus] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Merge Form
  const [primaryCustomerId, setPrimaryCustomerId] = useState('');
  const [secondaryCustomerId, setSecondaryCustomerId] = useState('');
  const [isMerging, setIsMerging] = useState(false);
  const [mergeError, setMergeError] = useState('');

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (data.customers) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim() || undefined,
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        address: address.trim() || undefined,
        preferredLanguage,
        vipStatus,
        notes: notes.trim() || undefined
      };

      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create customer');
      }

      setIsCreateModalOpen(false);
      // Reset form
      setFullName('');
      setPhone('');
      setAlternatePhone('');
      setEmail('');
      setCity('');
      setAddress('');
      setNotes('');
      fetchCustomers();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMergeCustomers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryCustomerId || !secondaryCustomerId || primaryCustomerId === secondaryCustomerId) {
      setMergeError('Please select two distinct profiles to merge.');
      return;
    }

    setIsMerging(true);
    setMergeError('');

    try {
      const res = await fetch('/api/admin/customers/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryCustomerId,
          secondaryCustomerId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to merge profiles');
      }

      setIsMergeModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setMergeError(err.message);
    } finally {
      setIsMerging(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-[#0071e3]">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-[#0071e3]">
              CRM & Identity Storage
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
            Guest Database & Government IDs
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            Encrypted Aadhaar / Passport vault, stay folios, and pilgrimage repeat visitor analytics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsMergeModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-[#1d1d1f] hover:bg-stone-50 shadow-sm transition-all"
          >
            <GitMerge className="w-3.5 h-3.5 text-stone-600" />
            <span>Merge Duplicates</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Guest</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by devotee name, mobile number, email, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl pl-10 pr-4 text-xs text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] focus:bg-white transition-all"
          />
        </div>

        <span className="text-xs font-bold text-[#86868b] shrink-0">
          {filteredCustomers.length} Guests Recorded
        </span>
      </div>

      {/* Customer List Table */}
      <div className="bg-white border border-black/[0.06] rounded-3xl shadow-sm overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold text-[#1d1d1f]">No guest profiles found</p>
            <p className="text-xs text-[#86868b]">Register a new guest or perform a walk-in at reception</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.04] bg-stone-50/70 text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                  <th className="py-3.5 px-4">Devotee Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Origin / City</th>
                  <th className="py-3.5 px-4">ID Documents</th>
                  <th className="py-3.5 px-4 text-center">Visits</th>
                  <th className="py-3.5 px-4 text-right">Lifetime Spend</th>
                  <th className="py-3.5 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {filteredCustomers.map((cust) => {
                  const verifiedDocs = cust.documents.filter((d) => d.verificationStatus === 'verified').length;
                  const totalDocs = cust.documents.length;

                  return (
                    <tr key={cust.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-semibold text-sm text-[#1d1d1f]">{cust.fullName}</span>
                              {cust.vipStatus && (
                                <span className="p-0.5 rounded bg-amber-100 text-amber-800" title="VIP Devotee">
                                  <Star className="w-3 h-3 fill-amber-500" />
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#86868b] font-mono">
                              ID: {cust.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-[#86868b]">
                        <p className="font-mono text-xs font-semibold text-[#1d1d1f] flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{cust.phone}</span>
                        </p>
                        {cust.email && (
                          <p className="text-[11px] truncate max-w-xs">{cust.email}</p>
                        )}
                      </td>

                      <td className="py-4 px-4 text-[#86868b]">
                        <p className="text-xs text-[#1d1d1f]">{cust.city || '—'}</p>
                        <p className="text-[10px]">{cust.state || 'Maharashtra'}</p>
                      </td>

                      <td className="py-4 px-4">
                        {totalDocs === 0 ? (
                          <span className="text-[11px] text-stone-400 italic">No document on file</span>
                        ) : (
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            verifiedDocs > 0
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            <ShieldCheck className="w-3 h-3" />
                            <span>{verifiedDocs}/{totalDocs} Verified</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-xs text-[#1d1d1f]">
                        {cust.totalVisits || 1}
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-xs text-[#1d1d1f]">
                        {formatPaise(cust.totalSpendPaise || 0)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/admin/customers/${cust.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl bg-stone-100 hover:bg-[#0071e3] hover:text-white text-[#1d1d1f] text-xs font-medium transition-all"
                        >
                          <span>Open Folio</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register New Customer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-black/[0.08] animate-in zoom-in-95 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#0071e3]" />
                <h3 className="font-bold text-base text-[#1d1d1f]">Register Guest Profile</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh V. Kulkarni"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    Primary Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="Family member phone"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="ramesh@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    City / District
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Solapur, Pune"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Full Street Address
                </label>
                <input
                  type="text"
                  placeholder="Door / Flat, Society, Landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#f5f5f7]">
                <input
                  type="checkbox"
                  id="vipCheckbox"
                  checked={vipStatus}
                  onChange={(e) => setVipStatus(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0071e3]"
                />
                <label htmlFor="vipCheckbox" className="text-xs font-semibold text-[#1d1d1f] cursor-pointer">
                  Mark as VIP Devotee (Temple Trust / Trustee / Priority Clean)
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Front Desk Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Preferences, customary darshan timings, family members"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#f5f5f7] border border-black/[0.06] rounded-xl p-2.5 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] resize-none"
                />
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-black/[0.08]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? 'Registering...' : 'Save Guest Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Merge Duplicates Modal */}
      {isMergeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/[0.08] animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center space-x-2">
                <GitMerge className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-[#1d1d1f]">Merge Duplicate Profiles</h3>
              </div>
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMergeCustomers} className="space-y-4">
              <p className="text-xs text-[#86868b] leading-relaxed">
                Merging transfers all past reservations, government ID documents, and spend totals from the secondary profile into the primary profile, then removes the duplicate safely.
              </p>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Primary Profile (To Keep) *
                </label>
                <select
                  required
                  value={primaryCustomerId}
                  onChange={(e) => setPrimaryCustomerId(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-indigo-600"
                >
                  <option value="">Select primary guest profile</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phone}) — {c.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1">
                  Secondary Profile (To Merge & Archive) *
                </label>
                <select
                  required
                  value={secondaryCustomerId}
                  onChange={(e) => setSecondaryCustomerId(e.target.value)}
                  className="w-full h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-indigo-600"
                >
                  <option value="">Select duplicate guest profile</option>
                  {customers
                    .filter((c) => c.id !== primaryCustomerId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.phone}) — {c.id}
                      </option>
                    ))}
                </select>
              </div>

              {mergeError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {mergeError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMergeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-black/[0.08]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMerging}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
                >
                  {isMerging ? 'Merging...' : 'Confirm Profile Merge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

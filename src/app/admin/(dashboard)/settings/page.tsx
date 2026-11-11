import React from 'react';
import { getDb } from '@/lib/db';
import { Building, Clock, ShieldCheck, Users } from 'lucide-react';

export default async function SettingsAdminPage() {
  const db = getDb();
  const property = await db.getProperty();
  const staff = await db.getStaffUsers();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <p className="text-xs uppercase font-semibold tracking-wider text-[#86868b]">
          Settings
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-0.5">
          Lodge Settings & Policies
        </h1>
        <p className="text-xs text-[#86868b] mt-1">
          Property profile, check-in schedules, tax configuration, and staff roles.
        </p>
      </div>

      {/* Property Details */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-base font-semibold text-[#1d1d1f] flex items-center space-x-2">
          <Building className="w-4 h-4 text-[#86868b]" />
          <span>Sanctuary Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-0.5">
            <span className="text-[#86868b] block">Property Name</span>
            <span className="text-[#1d1d1f] font-semibold text-sm block">{property.name}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#86868b] block">Tagline</span>
            <span className="text-[#1d1d1f] block">{property.tagline}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#86868b] block">Location</span>
            <span className="text-[#1d1d1f] block">{property.address}, {property.city}, {property.state}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#86868b] block">Contact</span>
            <span className="text-[#1d1d1f] block">{property.phone} • {property.email}</span>
          </div>
        </div>
      </div>

      {/* Policies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3 text-xs">
          <h3 className="text-base font-semibold text-[#1d1d1f] flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#86868b]" />
            <span>Stay Timings</span>
          </h3>

          <div className="space-y-2 text-[#1d1d1f]">
            <div className="flex justify-between py-1.5 border-b border-black/[0.06]">
              <span className="text-[#86868b]">Check-In</span>
              <span className="font-semibold">{property.checkInTime} (2:00 PM)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-black/[0.06]">
              <span className="text-[#86868b]">Check-Out</span>
              <span className="font-semibold">{property.checkOutTime} (11:00 AM)</span>
            </div>
            <div className="pt-1">
              <span className="text-[#86868b] block mb-1">Cancellation Terms</span>
              <p className="text-xs text-[#86868b] leading-relaxed">
                {property.cancellationPolicy}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3 text-xs">
          <h3 className="text-base font-semibold text-[#1d1d1f] flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#86868b]" />
            <span>Taxation & Currencies</span>
          </h3>

          <div className="space-y-2 text-[#1d1d1f]">
            <div className="flex justify-between py-1.5 border-b border-black/[0.06]">
              <span className="text-[#86868b]">Currency</span>
              <span className="font-semibold">INR (₹)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-black/[0.06]">
              <span className="text-[#86868b]">Accounting Units</span>
              <span className="font-mono text-[#0071e3]">Paise (Integer math)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-black/[0.06]">
              <span className="text-[#86868b]">GST Rates</span>
              <span>12% (&le; ₹7,500) / 18% (&gt; ₹7,500)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#86868b]">Resort Preservation Fee</span>
              <span>5.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Accounts Table */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-base font-semibold text-[#1d1d1f] flex items-center space-x-2">
          <Users className="w-4 h-4 text-[#86868b]" />
          <span>Staff Accounts ({staff.length})</span>
        </h3>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="text-[#86868b] uppercase tracking-wider font-semibold border-b border-black/[0.06]">
              <tr>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] text-[#1d1d1f]">
              {staff.map((u) => (
                <tr key={u.id} className="hover:bg-[#f5f5f7]">
                  <td className="py-3 px-3 font-semibold">{u.fullName}</td>
                  <td className="py-3 px-3 text-[#86868b] font-mono">{u.email}</td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-[#f5f5f7] text-[#1d1d1f]">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-emerald-600 font-medium">Active</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

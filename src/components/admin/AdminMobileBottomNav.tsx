'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpenCheck,
  BedDouble,
  Users,
  Menu,
  X,
  UserPlus,
  Coins,
  CalendarDays,
  Tag,
  MailCheck,
  FileSpreadsheet,
  FolderDown,
  Settings,
  ExternalLink,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { AdminSession } from '@/lib/auth/session';
import { SignOutButton } from './SignOutButton';

interface AdminMobileBottomNavProps {
  session: AdminSession;
}

export function AdminMobileBottomNav({ session }: AdminMobileBottomNavProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs = [
    {
      name: 'Home',
      href: '/admin',
      icon: LayoutDashboard,
      isActive: pathname === '/admin'
    },
    {
      name: 'Bookings',
      href: '/admin/reservations',
      icon: BookOpenCheck,
      isActive: pathname.startsWith('/admin/reservations')
    },
    {
      name: 'Rooms',
      href: '/admin/rooms',
      icon: BedDouble,
      isActive: pathname.startsWith('/admin/rooms')
    },
    {
      name: 'Guests',
      href: '/admin/customers',
      icon: Users,
      isActive: pathname.startsWith('/admin/customers')
    },
    {
      name: 'More',
      href: '#more',
      icon: Menu,
      isActive: isMoreOpen || [
        '/admin/reception',
        '/admin/coupons',
        '/admin/marketing',
        '/admin/reports',
        '/admin/data',
        '/admin/calendar',
        '/admin/settings'
      ].some(prefix => pathname.startsWith(prefix)),
      isAction: true
    }
  ];

  const isSuperAdminOrManager = ['super_admin', 'manager'].includes(session.role);

  return (
    <>
      {/* Persistent Bottom Bar (Visible on phones & tablets < 768px) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-black/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] print:hidden pb-[calc(env(safe-area-inset-bottom,0px)+6px)] pt-1.5 transition-all"
        aria-label="Staff Mobile Bottom Navigation"
      >
        <div className="max-w-md mx-auto px-2 grid grid-cols-5 items-center">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.isActive;

            if (tab.isAction) {
              return (
                <button
                  key={tab.name}
                  type="button"
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className="flex flex-col items-center justify-center py-1 text-center transition-all active:scale-95 group focus:outline-none"
                  aria-expanded={isMoreOpen}
                  aria-label="Toggle More Lodge Operations"
                >
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                      active
                        ? 'bg-[#1d1d1f] text-white shadow-sm'
                        : 'text-[#86868b] group-active:bg-stone-100'
                    }`}
                  >
                    {isMoreOpen ? <X className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-[10px] tracking-tight mt-0.5 font-medium ${
                      active ? 'text-[#1d1d1f] font-semibold' : 'text-[#86868b]'
                    }`}
                  >
                    {tab.name}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={tab.name}
                href={tab.href}
                onClick={() => setIsMoreOpen(false)}
                className="flex flex-col items-center justify-center py-1 text-center transition-all active:scale-95 group focus:outline-none"
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                    active
                      ? 'bg-[#1d1d1f] text-white shadow-sm'
                      : 'text-[#86868b] group-active:bg-stone-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] tracking-tight mt-0.5 font-medium ${
                    active ? 'text-[#1d1d1f] font-semibold' : 'text-[#86868b]'
                  }`}
                >
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* "More" Slide-up Bottom Sheet (Mobile) */}
      {isMoreOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsMoreOpen(false)}
            className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Sheet Container */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl border-t border-black/[0.08] animate-in slide-in-from-bottom duration-300 pb-[calc(env(safe-area-inset-bottom,0px)+24px)]">
            {/* Grab Handle */}
            <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto my-3" />

            <div className="px-5 pb-5 space-y-5">
              {/* Staff Profile Header */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] text-amber-300 flex items-center justify-center font-bold text-base font-serif shadow-sm">
                    आ
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1d1d1f] leading-tight">
                      {session.fullName}
                    </h3>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-[#0071e3]" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
                        {session.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-200/70 flex items-center justify-center text-stone-600 active:scale-95"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Front Desk & Reception Section */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] px-1">
                  Reception Operations
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/admin/reception/walkin"
                    onClick={() => setIsMoreOpen(false)}
                    className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/70 flex flex-col justify-between active:scale-[0.98] transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#0071e3] text-white flex items-center justify-center shadow-sm">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div className="mt-2.5">
                      <span className="text-xs font-bold text-[#1d1d1f] block leading-tight">Walk-in Booking</span>
                      <span className="text-[10px] text-blue-800">Direct cash booking</span>
                    </div>
                  </Link>

                  <Link
                    href="/admin/reception/cash-register"
                    onClick={() => setIsMoreOpen(false)}
                    className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex flex-col justify-between active:scale-[0.98] transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div className="mt-2.5">
                      <span className="text-xs font-bold text-[#1d1d1f] block leading-tight">Cash Register</span>
                      <span className="text-[10px] text-amber-800">Shift float & ledger</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Secondary Navigation List */}
              <div className="space-y-1 bg-[#f5f5f7] rounded-2xl p-1.5 border border-black/[0.04]">
                <Link
                  href="/admin/calendar"
                  onClick={() => setIsMoreOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white text-xs font-medium text-[#1d1d1f] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <CalendarDays className="w-4 h-4 text-[#86868b]" />
                    <span>Visual Room Calendar</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#86868b]" />
                </Link>

                <Link
                  href="/admin/coupons"
                  onClick={() => setIsMoreOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white text-xs font-medium text-[#1d1d1f] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Coupon Management</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#86868b]" />
                </Link>

                <Link
                  href="/admin/marketing/post-checkout"
                  onClick={() => setIsMoreOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white text-xs font-medium text-[#1d1d1f] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <MailCheck className="w-4 h-4 text-[#0071e3]" />
                    <span>Post-Checkout Offers</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#86868b]" />
                </Link>

                {isSuperAdminOrManager && (
                  <>
                    <Link
                      href="/admin/reports"
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white text-xs font-medium text-[#1d1d1f] transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                        <span>Financial Reports</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#86868b]" />
                    </Link>

                    <Link
                      href="/admin/data/import-export"
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white text-xs font-medium text-[#1d1d1f] transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FolderDown className="w-4 h-4 text-purple-600" />
                        <span>Excel Import / Export</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#86868b]" />
                    </Link>

                    <Link
                      href="/admin/settings"
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white text-xs font-medium text-[#1d1d1f] transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Settings className="w-4 h-4 text-[#86868b]" />
                        <span>Lodge Settings & Policies</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#86868b]" />
                    </Link>
                  </>
                )}
              </div>

              {/* Public Website & Logout */}
              <div className="pt-2 border-t border-black/[0.06] space-y-2">
                <Link
                  href="/"
                  target="_blank"
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white border border-black/[0.06] text-xs font-semibold text-[#1d1d1f] hover:bg-stone-50 transition-all"
                >
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>View Public Devotee Website</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#86868b]" />
                </Link>

                <div className="pt-1">
                  <SignOutButton />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}


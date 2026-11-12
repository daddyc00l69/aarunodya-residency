'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  FileSpreadsheet,
  Settings,
  ExternalLink,
  BookOpenCheck,
  UserPlus,
  Coins,
  Users,
  Tag,
  MailCheck,
  FolderDown,
  Menu,
  X
} from 'lucide-react';
import { SignOutButton } from './SignOutButton';
import { AdminSession } from '@/lib/auth/session';

interface AdminSidebarProps {
  session: AdminSession;
}

export function AdminSidebar({ session }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navSections = [
    {
      title: 'Front Desk & Cashier',
      items: [
        { label: 'Executive Deck', href: '/admin', icon: LayoutDashboard },
        { label: 'Reception Walk-in', href: '/admin/reception/walkin', icon: UserPlus },
        { label: 'Cash Register & Shifts', href: '/admin/reception/cash-register', icon: Coins },
        { label: 'Reservations Desk', href: '/admin/reservations', icon: BookOpenCheck },
        { label: 'Room Calendar', href: '/admin/calendar', icon: CalendarDays },
        { label: 'Rooms & Housekeeping', href: '/admin/rooms', icon: BedDouble },
      ]
    },
    {
      title: 'Guests & Marketing',
      items: [
        { label: 'Guest Database & IDs', href: '/admin/customers', icon: Users },
        { label: 'Coupon Management', href: '/admin/coupons', icon: Tag },
        { label: 'Post-Checkout Offers', href: '/admin/marketing/post-checkout', icon: MailCheck },
      ]
    },
    {
      title: 'Financials & Data',
      items: [
        { label: 'Financial Reports', href: '/admin/reports', icon: FileSpreadsheet },
        { label: 'Excel Import / Export', href: '/admin/data/import-export', icon: FolderDown },
        { label: 'Lodge Settings', href: '/admin/settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Top Header (Visible on phone/tablet) */}
      <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-black/[0.08] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-full bg-[#1d1d1f] flex items-center justify-center text-amber-300 font-bold font-serif text-xs">
            आ
          </div>
          <span className="font-semibold text-xs tracking-tight text-[#1d1d1f]">
            Aarunodya PMS (18 Units)
          </span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg bg-stone-100 text-[#1d1d1f] active:scale-95"
          aria-label="Toggle staff navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in"
        />
      )}

      {/* Main Sidebar (Desktop fixed + Mobile sliding drawer) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#f5f5f7] border-r border-black/[0.08] flex flex-col justify-between shrink-0 h-full text-[#1d1d1f] transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          {/* Brand */}
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1d1d1f] flex items-center justify-center text-amber-300 font-bold font-serif text-sm">
                आ
              </div>
              <div>
                <span className="block font-semibold text-sm tracking-tight text-[#1d1d1f]">
                  Aarunodya Residency
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-[#86868b] font-medium">
                  Bhakt Niwas PMS (18 Units)
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="space-y-4">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#86868b]/80">
                  {section.title}
                </p>
                <nav className="space-y-0.5 text-xs">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all font-medium ${
                          isActive
                            ? 'bg-white text-[#0071e3] shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
                            : 'text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-black/[0.04]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0071e3]' : 'text-[#86868b]'}`} />
                        <span className="text-xs truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Session & Sign Out */}
        <div className="p-4 border-t border-black/[0.06] bg-white/60 space-y-3 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-[11px] text-[#86868b] hover:text-[#1d1d1f] px-2.5 py-2 rounded-xl bg-white border border-black/[0.06] transition-colors"
          >
            <span>View Public Guest Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5 truncate pr-2">
              <span className="block text-xs font-semibold text-[#1d1d1f] truncate">
                {session.fullName}
              </span>
              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-[#f5f5f7] text-[#86868b] border border-black/[0.06]">
                {session.role.replace('_', ' ')}
              </span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>
    </>
  );
}

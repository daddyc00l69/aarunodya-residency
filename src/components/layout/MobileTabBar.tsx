'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bed, Sparkles, Search, PhoneCall } from 'lucide-react';

export function MobileTabBar() {
  const pathname = usePathname();

  // Hide on admin routes to let staff PMS have full screen real estate
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const tabs = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/'
    },
    {
      name: 'Rooms',
      href: '/rooms',
      icon: Bed,
      isActive: pathname.startsWith('/rooms')
    },
    {
      name: 'Darshan',
      href: '/darshan',
      icon: Sparkles,
      isActive: pathname === '/darshan'
    },
    {
      name: 'Lookup',
      href: '/booking/lookup',
      icon: Search,
      isActive: pathname.startsWith('/booking/lookup')
    },
    {
      name: 'Host Call',
      href: 'tel:8530000820',
      icon: PhoneCall,
      isActive: false,
      isExternal: true
    }
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-2xl border-t border-black/[0.08] shadow-[0_-4px_20px_rgba(0,0,0,0.04)] print:hidden pb-[calc(env(safe-area-inset-bottom,0px)+6px)] pt-1.5 transition-all"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="max-w-md mx-auto px-3 grid grid-cols-5 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;

          if (tab.isExternal) {
            return (
              <a
                key={tab.name}
                href={tab.href}
                className="flex flex-col items-center justify-center py-1 text-center transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#1d1d1f] group-active:bg-stone-100 transition-colors">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-[10px] font-medium tracking-tight text-[#86868b] mt-0.5">
                  {tab.name}
                </span>
              </a>
            );
          }

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex flex-col items-center justify-center py-1 text-center transition-all active:scale-95"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  active ? 'bg-blue-50 text-[#0071e3]' : 'text-[#86868b] hover:text-[#1d1d1f]'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-[#0071e3]' : 'text-[#86868b]'}`} />
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
                  active ? 'text-[#0071e3] font-semibold' : 'text-[#86868b] font-medium'
                }`}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


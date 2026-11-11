import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] flex flex-col md:flex-row font-sans selection:bg-[#0071e3] selection:text-white">
      {/* Sidebar Navigation */}
      <AdminSidebar session={session} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header (Desktop only) */}
        <header className="hidden md:flex h-14 bg-white/80 backdrop-blur-md border-b border-black/[0.06] px-6 sm:px-8 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-[#1d1d1f]">
              Aarunodya Residency Bhakt Niwas • Operations Console (Pandharpur)
            </span>
          </div>

          <div className="text-xs text-[#86868b]">
            IST (2026-11-11)
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 sm:p-8 flex-1 bg-[#fafafa]">
          {children}
        </main>
      </div>
    </div>
  );
}

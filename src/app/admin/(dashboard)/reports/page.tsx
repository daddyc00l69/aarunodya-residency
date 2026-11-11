import React from 'react';
import { getDb } from '@/lib/db';
import { formatPaise } from '@/lib/utils/currency';
import { CsvExportButton } from '@/components/admin/CsvExportButton';

export default async function ReportsAdminPage() {
  const db = getDb();
  const bookings = await db.getAllBookings();
  const roomTypes = await db.getRoomTypes();
  const kpis = await db.getDashboardKpis();

  const totalSubtotalPaise = bookings.reduce((sum, b) => sum + b.subtotalPaise, 0);
  const totalTaxPaise = bookings.reduce((sum, b) => sum + b.taxPaise, 0);
  const totalResortFeePaise = bookings.reduce((sum, b) => sum + b.resortFeePaise, 0);

  const roomTypeRevenue = roomTypes.map((rt) => {
    const rtBookings = bookings.filter(b => b.roomTypeId === rt.id);
    const revenuePaise = rtBookings.reduce((sum, b) => sum + b.totalAmountPaise, 0);
    const totalNights = rtBookings.reduce((sum, b) => sum + b.numNights, 0);

    return {
      roomType: rt,
      bookingsCount: rtBookings.length,
      totalNights,
      revenuePaise
    };
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase font-semibold tracking-wider text-[#86868b]">
            Ledger & Accounting
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-0.5">
            Financial & Tax Reports
          </h1>
          <p className="text-xs text-[#86868b] mt-1">
            Revenue reconciliation, GST tax summaries, and booking ledger exports.
          </p>
        </div>

        <CsvExportButton bookings={bookings} />
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 space-y-1 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-[#86868b] font-medium block">Gross Revenue</span>
          <span className="text-2xl font-semibold tracking-tight text-[#1d1d1f] block">
            {formatPaise(kpis.totalRevenuePaise)}
          </span>
          <span className="text-[11px] text-[#86868b]">Total Captured</span>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 space-y-1 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-[#86868b] font-medium block">Room Tariffs</span>
          <span className="text-2xl font-semibold tracking-tight text-[#1d1d1f] block">
            {formatPaise(totalSubtotalPaise)}
          </span>
          <span className="text-[11px] text-[#86868b]">Net Accommodation</span>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 space-y-1 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-[#86868b] font-medium block">GST Taxes</span>
          <span className="text-2xl font-semibold tracking-tight text-[#1d1d1f] block">
            {formatPaise(totalTaxPaise)}
          </span>
          <span className="text-[11px] text-[#86868b]">12% / 18% Brackets</span>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 space-y-1 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-[#86868b] font-medium block">Resort Fees</span>
          <span className="text-2xl font-semibold tracking-tight text-[#1d1d1f] block">
            {formatPaise(totalResortFeePaise)}
          </span>
          <span className="text-[11px] text-[#86868b]">5% Preservation Fee</span>
        </div>
      </div>

      {/* Revenue by Room Category */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-base font-semibold text-[#1d1d1f]">Revenue by Suite Category</h3>
        
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="text-[#86868b] uppercase tracking-wider font-semibold border-b border-black/[0.06]">
              <tr>
                <th className="py-2.5 px-3">Suite Tier</th>
                <th className="py-2.5 px-3">Base Tariff</th>
                <th className="py-2.5 px-3">Reservations</th>
                <th className="py-2.5 px-3">Nights Sold</th>
                <th className="py-2.5 px-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] text-[#1d1d1f]">
              {roomTypeRevenue.map(({ roomType, bookingsCount, totalNights, revenuePaise }) => (
                <tr key={roomType.id} className="hover:bg-[#f5f5f7] transition-colors">
                  <td className="py-3 px-3 font-medium">
                    {roomType.name}
                  </td>
                  <td className="py-3 px-3 text-[#86868b]">
                    {formatPaise(roomType.basePricePaise)}
                  </td>
                  <td className="py-3 px-3 text-[#86868b]">
                    {bookingsCount}
                  </td>
                  <td className="py-3 px-3 text-[#86868b]">
                    {totalNights} nights
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-[#0071e3]">
                    {formatPaise(revenuePaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

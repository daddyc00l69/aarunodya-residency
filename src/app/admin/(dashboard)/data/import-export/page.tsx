'use client';

import React, { useState } from 'react';
import {
  FolderDown,
  Download,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Users,
  Coins,
  Ticket,
  BookOpenCheck,
  RefreshCw,
  Info
} from 'lucide-react';

interface ImportResult {
  totalRows: number;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{ row: number; reason: string }>;
}

export default function ImportExportPage() {
  // Export states
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Import states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'update' | 'fail'>('update');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState('');

  const datasets = [
    {
      id: 'customers',
      title: 'Devotee Customers Database',
      description: 'Full guest records, phone numbers, addresses, visit counts, and lifetime spends.',
      icon: Users,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      id: 'reservations',
      title: 'Reservations & Room Folios',
      description: 'Check-in/out dates, assigned room numbers, tariffs, status, and guest details.',
      icon: BookOpenCheck,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: 'payments',
      title: 'All Payment Transactions',
      description: 'Razorpay online captures, cash collections, refunds, and gateway payment IDs.',
      icon: Coins,
      color: 'text-amber-600 bg-amber-50'
    },
    {
      id: 'cash_ledger',
      title: 'Front Desk Cash Register Ledger',
      description: 'Physical drawer cash shifts, float reconciliations, cashier receipts, and refunds.',
      icon: FileSpreadsheet,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      id: 'coupons',
      title: 'Coupons & Devotee Redemptions',
      description: 'Marketing promo codes, usage counts, discount totals, and customer ledger entries.',
      icon: Ticket,
      color: 'text-rose-600 bg-rose-50'
    }
  ];

  const handleDownloadDataset = (datasetId: string) => {
    setIsExporting(datasetId);
    let url = `/api/admin/data/export?type=${datasetId}`;
    if (exportStartDate) url += `&startDate=${exportStartDate}`;
    if (exportEndDate) url += `&endDate=${exportEndDate}`;

    // Direct browser navigation triggers file download
    window.location.href = url;
    setTimeout(() => {
      setIsExporting(null);
    }, 1500);
  };

  const handleDownloadTemplate = () => {
    window.location.href = '/api/admin/data/template?type=customers';
  };

  const handleExecuteImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      setImportError('Please select an Excel (.xlsx, .xls) or CSV file.');
      return;
    }

    setIsImporting(true);
    setImportError('');
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('type', 'customers');
      formData.append('duplicateStrategy', duplicateStrategy);

      const res = await fetch('/api/admin/data/import', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process import file.');
      }

      setImportResult(data);
    } catch (err: any) {
      setImportError(err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-black/[0.06]">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <FolderDown className="w-5 h-5" />
          </span>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-800">
            Enterprise Data Management
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
          Excel Data Import & Export
        </h1>
        <p className="text-xs text-[#86868b] mt-0.5">
          Generate real Excel (.xlsx) workbooks for accounting and batch import guest databases
        </p>
      </div>

      {/* SECTION 1: EXPORT WORKBOOKS */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.04]">
          <div>
            <h2 className="text-lg font-bold text-[#1d1d1f]">
              Export Real Excel (.xlsx) Workbooks
            </h2>
            <p className="text-xs text-[#86868b]">
              Export full datasets formatted for Microsoft Excel, Apple Numbers, or Google Sheets
            </p>
          </div>

          {/* Date Range Optional Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#86868b] font-medium">Filter Dates:</span>
            <input
              type="date"
              placeholder="From"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
              className="h-9 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-2.5 text-xs text-[#1d1d1f]"
            />
            <span className="text-[#86868b]">to</span>
            <input
              type="date"
              placeholder="To"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
              className="h-9 bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-2.5 text-xs text-[#1d1d1f]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {datasets.map((d) => {
            const Icon = d.icon;
            const downloading = isExporting === d.id;

            return (
              <div
                key={d.id}
                className="p-5 rounded-2xl border border-black/[0.06] bg-[#f5f5f7]/50 space-y-4 flex flex-col justify-between hover:border-black/[0.15] transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-xl ${d.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-[#1d1d1f]">{d.title}</h3>
                  </div>
                  <p className="text-xs text-[#86868b] leading-relaxed">
                    {d.description}
                  </p>
                </div>

                <button
                  onClick={() => handleDownloadDataset(d.id)}
                  disabled={downloading}
                  className="w-full py-2.5 rounded-xl bg-white border border-black/[0.08] hover:bg-stone-50 text-[#1d1d1f] text-xs font-semibold shadow-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-[#0071e3]" />
                  <span>{downloading ? 'Generating XLSX...' : 'Download .xlsx File'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: GUIDED BATCH IMPORT */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-black/[0.04]">
          <div>
            <h2 className="text-lg font-bold text-[#1d1d1f]">
              Batch Customer Database Import
            </h2>
            <p className="text-xs text-[#86868b]">
              Upload previous lodge guestbooks or pilgrim rosters with automatic duplicate handling
            </p>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.08] text-[#1d1d1f] hover:bg-stone-200 shadow-sm transition-all shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>Download Sample Template (.xlsx)</span>
          </button>
        </div>

        <form onSubmit={handleExecuteImport} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Picker & Strategy */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-2">
                Step 1: Select Excel or CSV Spreadsheet (.xlsx, .xls, .csv) *
              </label>
              <div className="border-2 border-dashed border-black/[0.1] rounded-2xl p-6 text-center bg-[#f5f5f7]/40 hover:bg-[#f5f5f7] transition-colors">
                <UploadCloud className="w-8 h-8 text-[#0071e3] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#1d1d1f] mb-1">
                  {importFile ? importFile.name : 'Choose Excel workbook file to import'}
                </p>
                <p className="text-[11px] text-[#86868b] mb-3">
                  Must include columns: Full Name, Phone (10 digits), Email, City, State
                </p>
                <input
                  type="file"
                  required
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImportFile(e.target.files[0]);
                    }
                  }}
                  className="text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1d1d1f] file:text-white hover:file:bg-black cursor-pointer"
                />
              </div>
            </div>

            {/* Duplicate Strategy Radio Options */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-2">
                Step 2: Choose Conflict & Duplicate Handling Strategy
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                  duplicateStrategy === 'update'
                    ? 'border-[#0071e3] bg-blue-50/50 shadow-sm'
                    : 'border-black/[0.06] bg-[#f5f5f7]/50'
                }`}>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="strategy"
                      value="update"
                      checked={duplicateStrategy === 'update'}
                      onChange={() => setDuplicateStrategy('update')}
                      className="text-[#0071e3]"
                    />
                    <span className="text-xs font-bold text-[#1d1d1f]">Update Existing</span>
                  </div>
                  <p className="text-[11px] text-[#86868b] mt-1 ml-5">
                    Updates address & notes if phone number is already registered.
                  </p>
                </label>

                <label className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                  duplicateStrategy === 'skip'
                    ? 'border-[#0071e3] bg-blue-50/50 shadow-sm'
                    : 'border-black/[0.06] bg-[#f5f5f7]/50'
                }`}>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="strategy"
                      value="skip"
                      checked={duplicateStrategy === 'skip'}
                      onChange={() => setDuplicateStrategy('skip')}
                      className="text-[#0071e3]"
                    />
                    <span className="text-xs font-bold text-[#1d1d1f]">Skip Duplicates</span>
                  </div>
                  <p className="text-[11px] text-[#86868b] mt-1 ml-5">
                    Leaves existing profile untouched and imports only new records.
                  </p>
                </label>

                <label className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                  duplicateStrategy === 'fail'
                    ? 'border-[#0071e3] bg-blue-50/50 shadow-sm'
                    : 'border-black/[0.06] bg-[#f5f5f7]/50'
                }`}>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="strategy"
                      value="fail"
                      checked={duplicateStrategy === 'fail'}
                      onChange={() => setDuplicateStrategy('fail')}
                      className="text-[#0071e3]"
                    />
                    <span className="text-xs font-bold text-[#1d1d1f]">Abort on Conflict</span>
                  </div>
                  <p className="text-[11px] text-[#86868b] mt-1 ml-5">
                    Fails the entire batch if any duplicate phone number is detected.
                  </p>
                </label>
              </div>
            </div>

            {importError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isImporting || !importFile}
              className="px-6 py-3 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {isImporting ? (
                <span>Validating & Parsing Spreadsheet...</span>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Execute Customer Batch Import</span>
                </>
              )}
            </button>
          </div>

          {/* Import Result Feedback Card */}
          <div className="space-y-4">
            <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f] block pb-2 border-b border-black/[0.06]">
                Import Execution Report
              </span>

              {importResult ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-[#86868b]">
                    <span>Total Rows Processed:</span>
                    <span className="font-bold text-[#1d1d1f]">{importResult.totalRows}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Newly Created:</span>
                    <span className="font-bold">{importResult.imported}</span>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>Updated Existing:</span>
                    <span className="font-bold">{importResult.updated}</span>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span>Skipped Rows:</span>
                    <span className="font-bold">{importResult.skipped}</span>
                  </div>
                  <div className="flex justify-between text-rose-700">
                    <span>Failed Rows:</span>
                    <span className="font-bold">{importResult.failed}</span>
                  </div>

                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="pt-2 border-t border-black/[0.06] space-y-1">
                      <p className="font-semibold text-rose-800 text-[11px]">Validation Failures:</p>
                      <ul className="text-[10px] text-rose-700 space-y-0.5 max-h-32 overflow-y-auto">
                        {importResult.errors.map((err, i) => (
                          <li key={i}>
                            Row {err.row}: {err.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[#86868b] space-y-1">
                  <Info className="w-5 h-5 mx-auto text-stone-400" />
                  <p>No import run in current session</p>
                  <p className="text-[10px]">Results will appear here upon completion</p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

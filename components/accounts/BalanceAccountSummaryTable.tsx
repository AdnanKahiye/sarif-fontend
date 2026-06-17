"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AccountService } from "@/lib/account";
import toast from "react-hot-toast";
import { Loader2, ChevronLeft, ChevronRight, Filter, Calendar } from "lucide-react";

interface AccountBalanceSummaryDto {
  accountId: string;
  accountName: string;
  currencyCode: number;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export default function BalanceSummaryTable() {
  const [data, setData] = useState<AccountBalanceSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);

  const [accountType, setAccountType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const loadData = useCallback(async (page: number, type: string, fDate: string, tDate: string) => {
    setLoading(true);
    try {
      const res = await AccountService.getBalanceAccountSummary(page, itemsPerPage, "", fDate, tDate, type);
      const apiResponse = res.data?.data;
      if (apiResponse) {
        setData(apiResponse.data || []);
        setTotalItems(apiResponse.totalRecords || 0);
      }
    } catch {
      toast.error("Failed to load balance summaries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(1, "", "", "");
  }, [loadData]);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift(-1);
    if (currentPage + delta < totalPages - 1) range.push(-2);
    if (totalPages > 1) range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return [...new Set(range)];
  };

  const accountTypes = ["Cash", "Bank", "Wallet", "Customer", "Loan", "Expense", "Revenue", "Capital", "RECEIVABLE", "PAYABLE"];

  return (
    <div className="bg-[#f3f3f9] dark:bg-gray-900 min-h-screen p-3 sm:p-4 md:p-6 font-sans text-[#495057]">
      <div className="mx-auto max-w-7xl">

        <h2 className="text-[15px] font-bold mb-4 uppercase tracking-wide dark:text-gray-200">Balance Summary Report</h2>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">

          {/* FILTERS — responsive */}
          <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row lg:items-center gap-3">

            {/* Account Type */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 w-full lg:w-auto">
              <Filter size={14} className="text-gray-400 shrink-0" />
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="bg-transparent text-[13px] outline-none w-full lg:min-w-[120px] dark:text-gray-300"
              >
                <option value="">All Types</option>
                {accountTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            {/* Date range */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <Calendar size={14} className="text-gray-400 shrink-0" />
              <input
                type="date"
                onChange={(e) => setFromDate(e.target.value)}
                className="flex-1 lg:flex-none border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-[13px] bg-white dark:bg-gray-900 outline-none dark:text-gray-300 min-w-0"
              />
              <span className="text-gray-400 text-[12px]">to</span>
              <input
                type="date"
                onChange={(e) => setToDate(e.target.value)}
                className="flex-1 lg:flex-none border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-[13px] bg-white dark:bg-gray-900 outline-none dark:text-gray-300 min-w-0"
              />
            </div>

            {/* Action button */}
            <button
              onClick={() => { setCurrentPage(1); loadData(1, accountType, fromDate, toDate); }}
              className="bg-[#299cdb] hover:brightness-110 text-white px-6 py-2 rounded text-[13px] w-full lg:w-auto lg:ml-auto transition-all"
            >
              Show Report
            </button>
          </div>

          {/* DATA AREA */}
          <div className="relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#405189]" size={30} />
              </div>
            )}

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f3f6f9] dark:bg-gray-700/50 text-[#878a99] text-[13px] font-bold uppercase border-y border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3">Account Name</th>
                    <th className="p-3">Currency</th>
                    <th className="p-3">Total Debit</th>
                    <th className="p-3">Total Credit</th>
                    <th className="p-3">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.accountId} className="text-[13px] hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50">
                        <td className="p-3 font-medium">{item.accountName}</td>
                        <td className="p-3 text-[#878a99]">{item.currencyCode}</td>
                        <td className="p-3 text-red-500">{item.totalDebit?.toFixed(2)}</td>
                        <td className="p-3 text-green-600">${item.totalCredit?.toFixed(2)}</td>
                        <td className="p-3 font-bold">${item.balance?.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="p-4 text-center text-gray-500">No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden">
              {data.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.map((item) => (
                    <div key={item.accountId} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[14px] font-semibold text-[#212529] dark:text-gray-200 truncate">{item.accountName}</span>
                        <span className="text-[14px] font-bold text-[#405189] dark:text-blue-400 shrink-0 ml-2">
                          ${item.balance?.toFixed(2)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">Currency</p>
                          <p className="text-[12px] text-[#495057] dark:text-gray-300">{item.currencyCode}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">Balance</p>
                          <p className="text-[12px] font-bold text-[#495057] dark:text-gray-300">${item.balance?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">Total Debit</p>
                          <p className="text-[12px] text-red-500">{item.totalDebit?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">Total Credit</p>
                          <p className="text-[12px] text-green-600">${item.totalCredit?.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500 text-[13px]">No data available</div>
              )}
            </div>
          </div>

          {/* PAGINATION */}
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 dark:border-gray-700 gap-3 bg-white dark:bg-gray-800">
            <span className="text-[13px] text-[#878a99] order-2 sm:order-1">
              Showing <span className="font-semibold">{startIndex}</span> to <span className="font-semibold">{endIndex}</span> of <span className="font-semibold">{totalItems}</span> Results
            </span>
            <div className="flex items-center gap-1 flex-wrap justify-center order-1 sm:order-2">
              <button disabled={currentPage === 1 || loading} onClick={() => setCurrentPage(p => p - 1)} className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"><ChevronLeft size={14} /></button>
              {getPageNumbers().map((page, idx) =>
                page < 0 ? (
                  <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-[13px]">…</span>
                ) : (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center rounded text-[13px] ${currentPage === page ? "bg-[#405189] text-white" : "border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>{page}</button>
                )
              )}
              <button disabled={currentPage >= totalPages || loading} onClick={() => setCurrentPage(p => p + 1)} className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

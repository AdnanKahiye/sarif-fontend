"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AccountService } from "@/lib/account";
import toast from "react-hot-toast";
import { Loader2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DailyReportDto {
  date: string;
  totalIn: number;
  totalOut: number;
  balance: number;
}

export default function DailyReportTable() {
  const [data, setData] = useState<DailyReportDto[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const loadData = useCallback(async (page: number, fDate: string, tDate: string) => {
    setLoading(true);
    try {
      const res = await AccountService.getDailyReport(page, itemsPerPage, fDate, tDate);
      if (res.data && res.data.success) {
        const responseData = res.data.data;
        setData(responseData.data || []);
        setTotalItems(responseData.totalRecords || 0);
        setTotalPages(responseData.totalPages || 0);
        setCurrentPage(page);
      }
    } catch {
      toast.error("Failed to load Daily Report");
    } finally {
      setLoading(false);
    }
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  useEffect(() => {
    loadData(currentPage, fromDate, toDate);
  }, [currentPage, loadData]);

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

  return (
    <div className="bg-[#f3f3f9] dark:bg-gray-900 min-h-screen p-3 sm:p-4 md:p-6 font-sans text-[#495057]">
      <div className="mx-auto max-w-7xl">

        <h2 className="text-[15px] font-bold mb-4 uppercase tracking-wide dark:text-gray-200">Daily Report</h2>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">

          {/* FILTERS */}
          <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 w-full sm:w-auto">
              <Calendar size={14} className="text-gray-400 shrink-0" />
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="flex-1 sm:flex-none bg-transparent text-[13px] outline-none dark:text-gray-300 min-w-0" />
              <span className="text-gray-400 text-[12px]">to</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="flex-1 sm:flex-none bg-transparent text-[13px] outline-none dark:text-gray-300 min-w-0" />
            </div>
            <button onClick={() => loadData(1, fromDate, toDate)} className="bg-[#299cdb] hover:bg-[#2386bd] text-white px-6 py-2 rounded text-[13px] sm:ml-auto transition-all w-full sm:w-auto">
              Show Report
            </button>
          </div>

          {/* TABLE */}
          <div className="relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#405189]" size={30} />
              </div>
            )}

            {/* DESKTOP */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f3f6f9] dark:bg-gray-700/50 text-[#878a99] text-[13px] font-bold uppercase border-y border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Total In</th>
                    <th className="p-3">Total Out</th>
                    <th className="p-3">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.length > 0 ? data.map((item, index) => (
                    <tr key={index} className="text-[13px] hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50">
                      <td className="p-3 font-medium">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="p-3 text-green-600 font-semibold">{item.totalIn.toFixed(2)}</td>
                      <td className="p-3 text-red-600 font-semibold">{item.totalOut.toFixed(2)}</td>
                      <td className={`p-3 font-bold ${item.balance < 0 ? "text-red-600" : "text-green-600"}`}>
                        {item.balance.toFixed(2)}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden">
              {data.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.map((item, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[14px] font-semibold text-[#212529] dark:text-gray-200">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                        <span className={`text-[14px] font-bold ${item.balance < 0 ? "text-red-600" : "text-green-600"}`}>
                          {item.balance.toFixed(2)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">Total In</p>
                          <p className="text-[12px] font-semibold text-green-600">{item.totalIn.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">Total Out</p>
                          <p className="text-[12px] font-semibold text-red-600">{item.totalOut.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 text-[13px]">No data available</div>
              )}
            </div>
          </div>

          {/* PAGINATION */}
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 dark:border-gray-700 gap-3 bg-white dark:bg-gray-800">
            <span className="text-[13px] text-[#878a99] order-2 sm:order-1">
              Showing <span className="font-semibold">{totalItems > 0 ? startIndex : 0}</span> to <span className="font-semibold">{endIndex}</span> of <span className="font-semibold">{totalItems}</span> Results
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
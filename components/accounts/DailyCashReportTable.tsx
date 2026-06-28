"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AccountService } from "@/lib/account";
import toast from "react-hot-toast";
import { Loader2, Calendar, Search } from "lucide-react";

interface DailyCashReportDto {
  accountId: string;
  accountName: string;
  currencyCode: string;
  openingCash: number;
  cashIn: number;
  cashOut: number;
  systemClosingCash: number;
}

export default function DailyCashReportTable() {
  const [data, setData] = useState<DailyCashReportDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

  const loadData = useCallback(async (reportDate: string) => {
    setLoading(true);

    try {
      const res = await AccountService.getDailyCashReport(reportDate);

      if (res.data?.success) {
        setData(res.data?.data || []);
      } else {
        setData([]);
        toast.error(res.data?.message || "Failed to load daily cash report");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load daily cash report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(date);
  }, [loadData]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return data;

    return data.filter((item) =>
      [
        item.accountName,
        item.currencyCode,
        item.openingCash,
        item.cashIn,
        item.cashOut,
        item.systemClosingCash,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [data, search]);

  const formatAmount = (amount: number, currencyCode: string) => {
    return `${currencyCode || ""} ${Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const totalOpeningCash = filteredData.reduce(
    (sum, item) => sum + Number(item.openingCash || 0),
    0
  );

  const totalCashIn = filteredData.reduce(
    (sum, item) => sum + Number(item.cashIn || 0),
    0
  );

  const totalCashOut = filteredData.reduce(
    (sum, item) => sum + Number(item.cashOut || 0),
    0
  );

  const totalClosingCash = filteredData.reduce(
    (sum, item) => sum + Number(item.systemClosingCash || 0),
    0
  );

  return (
    <div className="bg-[#f3f3f9] dark:bg-gray-900 min-h-screen p-3 sm:p-4 md:p-6 font-sans text-[#495057]">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold uppercase tracking-wide dark:text-gray-200">
            Daily Cash Report
          </h2>

          <div className="text-[13px] font-medium hidden sm:block">
            Account{" "}
            <span className="text-gray-400 mx-1">&gt;</span>{" "}
            <span className="text-gray-400">Daily Cash Report</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
          {/* FILTERS */}
          <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 w-full sm:w-auto">
              <Calendar size={14} className="text-gray-400 shrink-0" />

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 sm:flex-none bg-transparent text-[13px] outline-none dark:text-gray-300 min-w-0"
              />
            </div>

            <button
              type="button"
              onClick={() => loadData(date)}
              disabled={loading}
              className="bg-[#299cdb] hover:bg-[#2386bd] text-white px-6 py-2 rounded text-[13px] transition-all w-full sm:w-auto disabled:opacity-60"
            >
              {loading ? "Loading..." : "Show Report"}
            </button>

            <div className="relative w-full sm:w-64 lg:ml-auto">
              <input
                type="text"
                placeholder="Search account or currency..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded text-[13px] focus:outline-none dark:bg-gray-900 dark:text-gray-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={16}
              />
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700">
            <SummaryCard title="Opening Cash" value={totalOpeningCash} />
            <SummaryCard title="Cash In" value={totalCashIn} positive />
            <SummaryCard title="Cash Out" value={totalCashOut} negative />
            <SummaryCard title="Closing Cash" value={totalClosingCash} />
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
                    <th className="p-3">Account Name</th>
                    <th className="p-3">Currency</th>
                    <th className="p-3">Opening Cash</th>
                    <th className="p-3">Cash In</th>
                    <th className="p-3">Cash Out</th>
                    <th className="p-3">System Closing Cash</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr
                        key={item.accountId}
                        className="text-[13px] hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                      >
                        <td className="p-3 font-medium">
                          {item.accountName}
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-[12px] font-semibold">
                            {item.currencyCode}
                          </span>
                        </td>

                        <td className="p-3 font-semibold">
                          {formatAmount(item.openingCash, item.currencyCode)}
                        </td>

                        <td className="p-3 text-green-600 font-semibold">
                          {formatAmount(item.cashIn, item.currencyCode)}
                        </td>

                        <td className="p-3 text-red-600 font-semibold">
                          {formatAmount(item.cashOut, item.currencyCode)}
                        </td>

                        <td
                          className={`p-3 font-bold ${
                            item.systemClosingCash < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {formatAmount(
                            item.systemClosingCash,
                            item.currencyCode
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-gray-500 text-[13px]"
                      >
                        No daily cash report found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden">
              {filteredData.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredData.map((item) => (
                    <div
                      key={item.accountId}
                      className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-[14px] font-semibold text-[#212529] dark:text-gray-200 block">
                            {item.accountName}
                          </span>
                          <span className="text-[11px] text-[#878a99]">
                            {item.currencyCode}
                          </span>
                        </div>

                        <span
                          className={`text-[14px] font-bold ${
                            item.systemClosingCash < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {formatAmount(
                            item.systemClosingCash,
                            item.currencyCode
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">
                            Opening Cash
                          </p>
                          <p className="text-[12px] font-semibold dark:text-gray-300">
                            {formatAmount(
                              item.openingCash,
                              item.currencyCode
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">
                            Cash In
                          </p>
                          <p className="text-[12px] font-semibold text-green-600">
                            {formatAmount(item.cashIn, item.currencyCode)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">
                            Cash Out
                          </p>
                          <p className="text-[12px] font-semibold text-red-600">
                            {formatAmount(item.cashOut, item.currencyCode)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">
                            Closing Cash
                          </p>
                          <p
                            className={`text-[12px] font-bold ${
                              item.systemClosingCash < 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {formatAmount(
                              item.systemClosingCash,
                              item.currencyCode
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 text-[13px]">
                  No daily cash report found
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-3 sm:p-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <span className="text-[13px] text-[#878a99]">
              Showing{" "}
              <span className="font-semibold">{filteredData.length}</span>{" "}
              of <span className="font-semibold">{data.length}</span> Accounts
            </span>

            <span className="text-[13px] text-[#878a99]">
              Date: <span className="font-semibold">{date}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  positive = false,
  negative = false,
}: {
  title: string;
  value: number;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3">
      <p className="text-[11px] uppercase tracking-wide text-[#878a99] mb-1">
        {title}
      </p>

      <p
        className={`text-[16px] font-bold ${
          positive
            ? "text-green-600"
            : negative
            ? "text-red-600"
            : "text-[#405189] dark:text-gray-200"
        }`}
      >
        {Number(value || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </div>
  );
}
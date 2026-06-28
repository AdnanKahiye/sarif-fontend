"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AccountService } from "@/lib/account";
import toast from "react-hot-toast";
import { Search, Loader2 } from "lucide-react";
import FundModalCash from "./FundingFormModal";

interface FundingDto {
  transactionId: string;
  referenceNo: string;
  date: string;
  cashAccountName: string;
  capitalAccountName: string;
  currencyCode: string;
  amount: number;
  description: string;
}

export default function FundingTable() {
  const [data, setData] = useState<FundingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openFundModal, setOpenFundModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await AccountService.getCashOpeningReport();
      setData(res.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load funding report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return data;

    return data.filter((item) =>
      [
        item.referenceNo,
        item.cashAccountName,
        item.capitalAccountName,
        item.currencyCode,
        item.description,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [data, search]);

  const handleCreateFund = async (payload: any) => {
    setSaving(true);

    try {
      await AccountService.createCashOpening(payload);

      toast.success("Cash funding added successfully");
      setOpenFundModal(false);
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add cash funding");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number, currencyCode: string) => {
    return `${currencyCode || ""} ${Number(amount || 0).toLocaleString()}`;
  };

  return (
    <div className="bg-[#f3f3f9] dark:bg-gray-900 min-h-screen p-3 sm:p-4 md:p-6 font-sans text-[#495057]">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold dark:text-gray-200 uppercase tracking-wide">
            Funding List
          </h2>

          <div className="text-[13px] font-medium hidden sm:block">
            Account <span className="text-gray-400 mx-1">&gt;</span>{" "}
            <span className="text-gray-400">Funding</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 dark:border-gray-700 p-4">
            <h3 className="text-[16px] font-semibold text-[#495057] dark:text-gray-300">
              Cash Opening Funding
            </h3>
          </div>

          <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setOpenFundModal(true)}
              className="bg-[#0ab39c] text-white px-4 py-2 rounded text-[13px] hover:bg-[#099885] w-full sm:w-auto"
            >
              + Add Fund
            </button>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded text-[13px] focus:outline-none dark:bg-gray-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={16}
              />
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto relative min-h-[300px]">
            {loading && data.length > 0 && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#405189]" size={30} />
              </div>
            )}

            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f3f6f9] dark:bg-gray-700/50 text-[#878a99] text-[13px] font-bold uppercase border-y border-gray-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Cash Account</th>
                  <th className="p-3">Capital Account</th>
                  <th className="p-3">Currency</th>
                  <th className="p-3">Amount</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading && data.length === 0 ? (
                  <SkeletonRows />
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-gray-500 text-[13px]"
                    >
                      No funding records found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr
                      key={item.transactionId}
                      className="text-[13px] hover:bg-gray-50 dark:hover:bg-gray-700/40"
                    >
                      <td className="p-3">{formatDate(item.date)}</td>
                      <td className="p-3">{item.cashAccountName}</td>
                      <td className="p-3">{item.capitalAccountName}</td>
                      <td className="p-3">{item.currencyCode}</td>
                      <td className="p-3 font-semibold text-[#0ab39c]">
                        {formatAmount(item.amount, item.currencyCode)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden relative">
            {loading && data.length > 0 && (
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#405189]" size={28} />
              </div>
            )}

            {loading && data.length === 0 ? (
              <MobileSkeletonCards />
            ) : filteredData.length === 0 ? (
              <p className="p-6 text-center text-gray-500 text-[13px]">
                No funding records found
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredData.map((item) => (
                  <div
                    key={item.transactionId}
                    className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[13px] font-semibold text-[#212529] dark:text-gray-200">
                        {item.referenceNo}
                      </span>

                      <span className="text-[14px] font-bold text-[#0ab39c]">
                        {formatAmount(item.amount, item.currencyCode)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">
                          Date
                        </p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300">
                          {formatDate(item.date)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">
                          Currency
                        </p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300">
                          {item.currencyCode}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">
                          Cash Account
                        </p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300">
                          {item.cashAccountName}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">
                          Capital Account
                        </p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300">
                          {item.capitalAccountName}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">
                          Description
                        </p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300">
                          {item.description || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <FundModalCash
        open={openFundModal}
        onClose={() => setOpenFundModal(false)}
        onSubmit={handleCreateFund}
        loading={saving}
      />
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="animate-pulse">
          <td
            colSpan={7}
            className="p-4 border-b border-gray-100 dark:border-gray-700"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </td>
        </tr>
      ))}
    </>
  );
}

function MobileSkeletonCards() {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 animate-pulse space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Filter, Search, Tag, DollarSign, Clock } from "lucide-react";
import { CustomerService } from "@/lib/customers";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ExpensSummaryFilterModal from "./expensesSumaryFormModal";

/* =========================
   Types
========================= */
interface CustomerCreditDto {
  categoryName: string;
  totalAmount: number;
  lastExpenseAt?: string;
}

export default function ExpensesSummaryTable() {
  const router = useRouter();

  const [expenses, setExpensesSumary] = useState<CustomerCreditDto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<{
    fromDate?: string;
    toDate?: string;
  }>({});

  /* =========================
      LOAD DATA
  ========================= */
  async function loadExpensesSumary() {
    setLoading(true);
    try {
      const res = await CustomerService.getExpensesSummary(filters);
      setExpensesSumary(res.data.data);
    } catch {
      toast.error("Failed to load Expenses Summary");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpensesSumary();
  }, [filters]);

  /* =========================
      SEARCH
  ========================= */
  const filteredExpenses = expenses.filter(
    (c) =>
      c.categoryName &&
      c.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
          Expenses Summary
        </h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              placeholder="Search category..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all w-full md:w-64 dark:bg-gray-800 dark:border-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Normal Button */}
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition"
          >
            <Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="rounded-xl border border-gray-50 dark:border-gray-800 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50">
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Tag size={13} /> Category Name
                </div>
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <DollarSign size={13} /> Total Amount
                </div>
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Clock size={13} /> Last Expense At
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={3} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"></div>
                    <span className="text-sm text-gray-400 font-medium tracking-wide">
                      Loading data...
                    </span>
                  </div>
                </td>
              </tr>
            ) : filteredExpenses.length > 0 ? (
              filteredExpenses.map((c, idx) => (
                <tr
                  key={idx}
                  className="group hover:bg-slate-50 transition-all cursor-default dark:hover:bg-gray-800/50"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {c.categoryName}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-base font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                      $
                      {c.totalAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md dark:bg-gray-800 dark:text-gray-400">
                      {c.lastExpenseAt
                        ? new Date(c.lastExpenseAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "N/A"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="py-16 text-center text-gray-400 text-sm italic"
                >
                  No expenses found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        {/* Mobile cards */}
        <div className="block md:hidden divide-y divide-gray-50 dark:divide-gray-800">
          {loading ? (
            <div className="py-10 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"></div>
                <span className="text-sm text-gray-400 font-medium tracking-wide">Loading data...</span>
              </div>
            </div>
          ) : filteredExpenses.length > 0 ? filteredExpenses.map((c, idx) => (
            <div key={idx} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-gray-800/50 cursor-default">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{c.categoryName}</span>
                <span className="text-base font-bold text-rose-600 dark:text-rose-400 shrink-0 tabular-nums">
                  ${c.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md dark:bg-gray-800 dark:text-gray-400">
                {c.lastExpenseAt ? new Date(c.lastExpenseAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
              </span>
            </div>
          )) : (
            <div className="py-10 text-center text-gray-400 text-sm italic">No expenses found matching your search.</div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <ExpensSummaryFilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setFilters(f);
          setFilterOpen(false);
        }}
      />
    </div>
  );
}

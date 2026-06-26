"use client";

import React, { useEffect, useState, useCallback } from "react";
import ExchangeModal, { ExchangeFormData } from "./ExchangeSettingsModel";
import ConfirmDeleteModal from "../ui/Model/ConfirmDeleteModal";
import { AccountService } from "@/lib/account";
import toast from "react-hot-toast";
import { usePermission } from "@/context/PermissionContext";
import { Search, Loader2, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface ExchangeDto {
  id: number;
  currencyId: number;
  feeRate: number;
  profitRate: number;
  isActive: boolean;
}

export default function ExchangeTable() {
  const { hasPermission } = usePermission();
  const [exchanges, setExchanges] = useState<ExchangeDto[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedExchange, setSelectedExchange] = useState<ExchangeDto | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const res = await AccountService.getCurrencyLookup();
        setCurrencies(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load currencies", err);
      }
    };
    loadCurrencies();
  }, []);

  const currencyMap: Record<number, string> = Object.fromEntries(
    (currencies || []).map((c: any) => [c.id, c.code || c.currencyCode || c.name])
  );

  const loadExchanges = useCallback(async (page: number, searchQuery: string) => {
    setLoading(true);
    try {
      const res = await AccountService.getExchangeSettings();
      const raw = res.data;
      let list: ExchangeDto[] = [];
      let total = 0;

      if (Array.isArray(raw)) {
        list = raw; total = raw.length;
      } else if (Array.isArray(raw?.data)) {
        list = raw.data; total = raw.totalRecords ?? raw.data.length;
      } else if (Array.isArray(raw?.data?.data)) {
        list = raw.data.data; total = raw.data.totalRecords ?? raw.data.data.length;
      }

      setExchanges(list);
      setTotalItems(total);
    } catch {
      toast.error("Failed to load exchanges");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { loadExchanges(currentPage, search); }, 400);
    return () => clearTimeout(timer);
  }, [currentPage, search, loadExchanges]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleFormSubmit = async (data: ExchangeFormData) => {
    try {
      if (mode === "add") {
        await AccountService.createExchangeSetting({
          currencyId: data.currencyId,
          // feeRate: Number(data.feeRate),
          profitRate: Number(data.profitRate),
          isActive: true,
        });
        toast.success("Exchange created successfully");
      } else {
        if (!selectedExchange) return;
        await AccountService.updateExchangeSetting(selectedExchange.id, {
          id: selectedExchange.id,
          // feeRate: Number(data.feeRate),
          profitRate: Number(data.profitRate),
          isActive: selectedExchange.isActive ?? true,
        });
        toast.success("Exchange updated successfully");
      }
      setOpenModal(false);
      setSelectedExchange(null);
      loadExchanges(currentPage, search);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Operation failed");
    }
  };

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

  const canAdd = hasPermission("CREATE.USER");
  const canEdit = hasPermission("EDIT.USER");
  const canDelete = hasPermission("DELETE.USER");

  return (
    <div className="bg-[#f3f3f9] dark:bg-gray-900 min-h-screen p-3 sm:p-4 md:p-6 font-sans">
      <div className="mx-auto max-w-7xl">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-[#495057] dark:text-gray-200 uppercase tracking-wide">List Exchange Settings</h2>
          <div className="text-[13px] text-[#495057] font-medium hidden sm:block">
            Tables <span className="text-gray-400 mx-1">&gt;</span> <span className="text-gray-400">List Exchange Settings</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 dark:border-gray-700 p-4">
            <h3 className="text-[16px] font-semibold text-[#495057] dark:text-gray-300">Add, Edit</h3>
          </div>

          <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {canAdd && (
                <button onClick={() => { setMode("add"); setSelectedExchange(null); setOpenModal(true); }} className="bg-[#0ab39c] hover:bg-[#099885] text-white px-4 py-2 rounded text-[13px] flex items-center gap-1 transition-all w-full sm:w-auto justify-center">
                  <span className="text-lg leading-none">+</span> Add Exchange
                </button>
              )}
            </div>
            <div className="relative w-full sm:w-64">
              <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded text-[13px] focus:outline-none focus:border-[#405189] dark:bg-gray-900" value={search} onChange={handleSearchChange} />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto relative">
            {loading && exchanges.length > 0 && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#405189]" size={30} />
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f3f6f9] dark:bg-gray-700/50 text-[#878a99] text-[13px] font-bold uppercase border-y border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-3 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                  <th className="p-3">ID</th>
                  <th className="p-3">Currency</th>
                  {/* <th className="p-3">Fee Rate</th> */}
                  <th className="p-3">Profit Rate</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading && exchanges.length === 0 && <SkeletonRows />}
                {!loading && exchanges.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-[13px] text-gray-400">No exchange settings found.</td></tr>
                )}
                {exchanges.map((exchange) => (
                  <tr key={exchange.id} className="text-[13px] text-[#212529] dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="p-3 text-center"><input type="checkbox" /></td>
                    <td className="p-3 font-medium">{exchange.id}</td>
                    <td className="p-3 text-[#878a99]">{currencyMap[exchange.currencyId] || "Unknown"}</td>
                    {/* <td className="p-3">{exchange.feeRate}%</td> */}
                    <td className="p-3">{exchange.profitRate}%</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        {canEdit && (
                          <button onClick={() => { setSelectedExchange(exchange); setMode("edit"); setOpenModal(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-[12px] font-medium transition-all">
                            <Pencil size={12} /> Edit
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => { setSelectedExchange(exchange); setOpenDelete(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-[12px] font-medium transition-all">
                            <Trash2 size={12} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden relative">
            {loading && exchanges.length > 0 && (
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#405189]" size={28} />
              </div>
            )}
            {loading && exchanges.length === 0 ? (
              <MobileSkeletonCards />
            ) : exchanges.length === 0 ? (
              <p className="p-6 text-center text-gray-500 text-[13px]">No exchange settings found.</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {exchanges.map((exchange) => (
                  <div key={exchange.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[14px] font-semibold text-[#212529] dark:text-gray-200">
                        #{exchange.id} — {currencyMap[exchange.currencyId] || "Unknown"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">Fee Rate</p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300">{exchange.feeRate}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">Profit Rate</p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300">{exchange.profitRate}%</p>
                      </div>
                    </div>
                    {(canEdit || canDelete) && (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        {canEdit && (
                          <button onClick={() => { setSelectedExchange(exchange); setMode("edit"); setOpenModal(true); }} className="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-[12px] flex-1">
                            <Pencil size={12} /> Edit
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => { setSelectedExchange(exchange); setOpenDelete(true); }} className="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded text-[12px] flex-1">
                            <Trash2 size={12} /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PAGINATION */}
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 dark:border-gray-700 gap-3">
            <span className="text-[13px] text-[#878a99] order-2 sm:order-1">
              Showing <span className="font-semibold">{startIndex}</span> to <span className="font-semibold">{endIndex}</span> of <span className="font-semibold">{totalItems}</span> Results
            </span>
            <div className="flex items-center gap-1 flex-wrap justify-center order-1 sm:order-2">
              <button disabled={currentPage === 1 || loading} onClick={() => setCurrentPage(p => p - 1)} className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded text-[13px] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"><ChevronLeft size={14} /></button>
              {getPageNumbers().map((page, idx) =>
                page < 0 ? (
                  <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-[13px]">…</span>
                ) : (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center rounded text-[13px] ${currentPage === page ? "bg-[#405189] text-white" : "border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>{page}</button>
                )
              )}
              <button disabled={currentPage >= totalPages || loading} onClick={() => setCurrentPage(p => p + 1)} className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded text-[13px] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      </div>

      <ExchangeModal
        open={openModal}
        mode={mode}
        initialData={selectedExchange ? {
          id: selectedExchange.id,
          currencyId: selectedExchange.currencyId,
          // feeRate: selectedExchange.feeRate,
          profitRate: selectedExchange.profitRate,
        } : undefined}
        onClose={() => setOpenModal(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="animate-pulse">
          <td colSpan={6} className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
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
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

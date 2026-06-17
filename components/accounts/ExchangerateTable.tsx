"use client";

import React, { useEffect, useState, useCallback } from "react";
import ExchangeModel, { ExchangeRateFormData } from "./Exchange-rateFormModal";
import ConfirmDeleteModal from "../ui/Model/ConfirmDeleteModal";
import toast from "react-hot-toast";
import { usePermission } from "@/context/PermissionContext";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { AccountService } from "@/lib/account";

interface ExchangeRateDto {
  id: number;
  rate: number;
  currencyId: number;
  currencyCode: string;
  currencyName: string;
  branchId: number | null;
  branchName: string;
  agencyId: string;
  agencyName: string;
  userId: string;
  userName: string;
}

export default function ExchangeRateTable() {
  const { hasPermission } = usePermission();
  const [users, setCurrencies] = useState<ExchangeRateDto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedCurrency, setSelectedCurrency] = useState<ExchangeRateDto | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const loadCurrencies = useCallback(async (page: number, searchQuery: string) => {
    setLoading(true);
    try {
      const res = await AccountService.getExchangeRates(page, itemsPerPage);
      const apiResponse = res.data?.data;
      if (apiResponse) {
        setCurrencies(apiResponse.data || []);
        setTotalItems(apiResponse.totalRecords || 0);
      }
    } catch {
      toast.error("Failed to load currencies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { loadCurrencies(currentPage, search); }, 400);
    return () => clearTimeout(timer);
  }, [currentPage, search, loadCurrencies]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleFormSubmit = async (data: ExchangeRateFormData) => {
    try {
      if (mode === "add") {
        await AccountService.CreateExchangeRate(data);
        toast.success("Exchange rate created successfully");
      } else {
        if (!selectedCurrency) return;
        await AccountService.updateExchangeRate(selectedCurrency.id, data);
        toast.success("Exchange rate updated");
      }
      setOpenModal(false);
      loadCurrencies(currentPage, search);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const confirmDelete = async () => {
    if (!selectedCurrency) return;
    setDeleting(true);
    try {
      await AccountService.deleteExchangeRate(selectedCurrency.id);
      toast.success("Exchange rate removed");
      setOpenDelete(false);
      loadCurrencies(currentPage, search);
    } catch {
      toast.error("Could not delete exchange rate");
    } finally {
      setDeleting(false);
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-[15px] font-bold text-[#495057] dark:text-gray-200 uppercase tracking-wide">List Exchange Rates</h2>
          <div className="text-[13px] text-[#495057] font-medium hidden sm:block">
            Tables <span className="text-gray-400 mx-1">&gt;</span> <span className="text-gray-400">List Exchange Rates</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 dark:border-gray-700 p-4">
            <h3 className="text-[16px] font-semibold text-[#495057] dark:text-gray-300">Add, Edit & Remove</h3>
          </div>

          <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {canAdd && (
                <button onClick={() => { setMode("add"); setSelectedCurrency(null); setOpenModal(true); }} className="w-full sm:w-auto bg-[#0ab39c] hover:bg-[#099885] text-white px-4 py-2 rounded text-[13px] flex items-center justify-center gap-1 transition-all">
                  <span className="text-lg">+</span> Add Exchange-rate
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
            {loading && users.length > 0 && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#405189]" size={30} />
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f3f6f9] dark:bg-gray-700/50 text-[#878a99] text-[13px] font-bold uppercase border-y border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-3 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                  <th className="p-3">#</th>
                  <th className="p-3">Exchange Rate</th>
                  <th className="p-3">Currency</th>
                  <th className="p-3">Agency</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading && users.length === 0 ? (
                  <SkeletonRows />
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-gray-500">Xog lama helin</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="text-[13px] text-[#212529] dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <td className="p-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                      <td className="p-3 font-medium">{u.id}</td>
                      <td className="p-3 text-[#878a99]">{u.rate}</td>
                      <td className="p-3">{u.currencyName || "N/A"}</td>
                      <td className="p-3 font-medium">{u.agencyName}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          {canEdit && <button onClick={() => { setMode("edit"); setSelectedCurrency(u); setOpenModal(true); }} className="bg-[#299cdb] text-white px-3 py-1 rounded text-[11px]">Edit</button>}
                          {canDelete && <button onClick={() => { setSelectedCurrency(u); setOpenDelete(true); }} className="bg-[#f06548] text-white px-3 py-1 rounded text-[11px]">Remove</button>}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden relative">
            {loading && users.length > 0 && (
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#405189]" size={28} />
              </div>
            )}
            {loading && users.length === 0 ? (
              <MobileSkeletonCards />
            ) : users.length === 0 ? (
              <p className="p-6 text-center text-gray-500 text-[13px]">Xog lama helin</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((u) => (
                  <div key={u.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[14px] font-semibold text-[#212529] dark:text-gray-200">
                        #{u.id} — {u.currencyName || "N/A"}
                      </span>
                      <span className="text-[14px] font-bold text-[#405189] dark:text-blue-400">{u.rate}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                      <div className="col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">Agency</p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300 break-words">{u.agencyName}</p>
                      </div>
                    </div>
                    {(canEdit || canDelete) && (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        {canEdit && <button onClick={() => { setMode("edit"); setSelectedCurrency(u); setOpenModal(true); }} className="bg-[#299cdb] text-white px-4 py-1.5 rounded text-[12px] flex-1 sm:flex-none">Edit</button>}
                        {canDelete && <button onClick={() => { setSelectedCurrency(u); setOpenDelete(true); }} className="bg-[#f06548] text-white px-4 py-1.5 rounded text-[12px] flex-1 sm:flex-none">Remove</button>}
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

      <ExchangeModel
        open={openModal}
        mode={mode}
        initialData={selectedCurrency ? {
          rate: selectedCurrency.rate,
          currencyId: selectedCurrency.currencyId,
        } : undefined}
        onClose={() => setOpenModal(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDeleteModal open={openDelete} loading={deleting} onClose={() => setOpenDelete(false)} onConfirm={confirmDelete} />
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map(i => (
        <tr key={i} className="animate-pulse">
          <td colSpan={6} className="p-4 border-b border-gray-100 dark:border-gray-700">
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
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import DetailViewModelFormModal from "./TransactionDetailFormModal";
import ConfirmDeleteModal from "../ui/Model/ConfirmDeleteModal";
import { AccountService } from "@/lib/account";
import toast from "react-hot-toast";
import { usePermission } from "@/context/PermissionContext";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface TransactionDto {
  id: string;
  transactionType: number;
  status: number;
  referenceNo: string | null;
  description: string | null;
  totalAmount: number;
  agencyName: string;
  userName: string;
  details: any[];
}

export default function TransactionTable() {
  const { hasPermission } = usePermission();

  const [data, setData] = useState<TransactionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TransactionDto | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await AccountService.getTransactionHistory(page, itemsPerPage);
      const apiResponse = res.data?.data;
      if (apiResponse) {
        setData(apiResponse.data || []);
        setTotalItems(apiResponse.totalRecords || 0);
      }
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, loadData]);

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setDeleting(true);
    try {
      await AccountService.deleteTransaction(selectedItem.id);
      toast.success("Transaction deleted");
      setOpenDelete(false);
      loadData(currentPage);
    } catch {
      toast.error("Delete failed");
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

  return (
    <div className="bg-[#f3f3f9] dark:bg-gray-900 min-h-screen p-3 sm:p-4 md:p-6 font-sans text-[#495057]">
      <div className="mx-auto max-w-7xl">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold dark:text-gray-200 uppercase tracking-wide">Transaction List</h2>
          <div className="text-[13px] font-medium hidden sm:block">
            Account <span className="text-gray-400 mx-1">&gt;</span> <span className="text-gray-400">Transactions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">

          <div className="border-b border-gray-100 dark:border-gray-700 p-4">
            <h3 className="text-[16px] font-semibold text-[#495057] dark:text-gray-300">Add, Edit & Remove</h3>
          </div>

          <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button className="bg-[#0ab39c] text-white px-4 py-2 rounded text-[13px] opacity-80 cursor-not-allowed w-full sm:w-auto">+ Add Transaction</button>
            <div className="relative w-full sm:w-64">
              <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded text-[13px] focus:outline-none dark:bg-gray-900" value={search} onChange={(e) => setSearch(e.target.value)} />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
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
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Agency</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && data.length === 0 ? (
                  <SkeletonRows />
                ) : data.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-gray-500">No transactions found</td></tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="text-[13px] hover:bg-gray-50">
                      <td className="p-3">{item.transactionType}</td>
                      <td className="p-3">{item.status}</td>
                      <td className="p-3">{item.referenceNo}</td>
                      <td className="p-3">${item.totalAmount?.toFixed(2)}</td>
                      <td className="p-3">{item.agencyName}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => { setSelectedItem(item); setOpenModal(true); }} className="bg-[#299cdb] text-white px-3 py-1 rounded text-[11px]">View</button>
                          <button onClick={() => { setSelectedItem(item); setOpenDelete(true); }} className="bg-[#f06548] text-white px-3 py-1 rounded text-[11px]">Remove</button>
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
            {loading && data.length > 0 && (
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#405189]" size={28} />
              </div>
            )}
            {loading && data.length === 0 ? (
              <MobileSkeletonCards />
            ) : data.length === 0 ? (
              <p className="p-6 text-center text-gray-500 text-[13px]">No transactions found</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[14px] font-semibold text-[#212529] dark:text-gray-200">
                        {item.referenceNo || `TXN-${item.id.slice(0, 6)}`}
                      </span>
                      <span className="text-[14px] font-bold text-[#0ab39c]">${item.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">Type</p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300">{item.transactionType}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">Status</p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300">{item.status}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">Agency</p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300">{item.agencyName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <button onClick={() => { setSelectedItem(item); setOpenModal(true); }} className="bg-[#299cdb] text-white px-4 py-1.5 rounded text-[12px] flex-1">View</button>
                      <button onClick={() => { setSelectedItem(item); setOpenDelete(true); }} className="bg-[#f06548] text-white px-4 py-1.5 rounded text-[12px] flex-1">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PAGINATION */}
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 dark:border-gray-700 gap-3 bg-white dark:bg-gray-800">
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

      <DetailViewModelFormModal
        open={openModal}
        item={selectedItem || undefined}
        onClose={() => setOpenModal(false)}
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

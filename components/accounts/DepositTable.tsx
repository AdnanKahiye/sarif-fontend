"use client";

import React, { useEffect, useState, useCallback } from "react";
import DepositForm, { CreateDepositRequest } from "./DepositsFormModal";
import ConfirmDeleteModal from "../ui/Model/ConfirmDeleteModal";
import { AccountService } from "@/lib/account";
import toast from "react-hot-toast";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import DepositFormModal from "./DepositsFormModal";

export const getDepositStatusBadge = (status: number) => {
  switch (status) {
    case 1:
      return { text: "Pending", class: "bg-yellow-100 text-yellow-700" };
    case 2:
      return { text: "Partial", class: "bg-blue-100 text-blue-700" };
    case 3:
      return { text: "Completed", class: "bg-green-100 text-green-700" };
    default:
      return { text: "Unknown", class: "bg-gray-100 text-gray-600" };
  }
};

interface DepositDto {
  id: string;
  depositNo: string;
  status: number;
  accountName: string;
  amount: number;
  customerName: string;
  currencyId: number;
  currencyCode: string;
  toAccountName: string;
  openedAt: string;
}

export default function DepositTable() {
  const today = new Date().toISOString().split("T")[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [data, setData] = useState<DepositDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(today);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DepositDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const getCurrencySymbol = (currencyId?: number) => {
    if (!currencyId) return "";

    switch (currencyId) {
      case 1:
        return "$";
      case 6:
        return "KSh";
      default:
        return "";
    }
  };

  const formatMoney = (amount?: number, currencyId?: number) => {
    const symbol = getCurrencySymbol(currencyId);

    return (
      <span className="flex items-center gap-1">
        {/* Symbol */}
        <span className="text-gray-400 text-xs font-normal">
          {symbol}
        </span>

        {/* Amount */}
        <span className="font-bold text-[#212529]">
          {new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(amount || 0)}
        </span>
      </span>
    );
  };

  const itemsPerPage = 10;

  const loadData = useCallback(
    async (page: number, useFilters: boolean = true) => {
      setLoading(true);
      try {
        const res = await AccountService.getDeposits(
          page,
          itemsPerPage,
          useFilters ? fromDate : firstDay,
          useFilters ? toDate : today
        );
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
    },
    [fromDate, toDate, firstDay, today]
  );

  useEffect(() => {
    loadData(currentPage, true);
  }, [currentPage]);

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

  const handleEdit = (item: DepositDto) => {
    setSelectedItem(item);
    setIsEdit(true);
    setOpenForm(true);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-[#f3f3f9] dark:bg-gray-900 min-h-screen p-4 sm:p-6 font-sans text-[#495057]">
      <div className="mx-auto max-w-7xl">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-[15px] font-bold uppercase">Deposit List</h2>
          <div className="text-[13px] font-medium text-gray-500">
            Account &gt; Deposits
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded shadow-sm overflow-hidden">
          {/* TOOLBAR */}
          <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <button
              onClick={() => {
                setIsEdit(false);
                setOpenForm(true);
              }}
              className="w-full md:w-auto bg-[#0ab39c] text-white px-4 py-2 rounded text-[13px] hover:bg-[#089a86]"
            >
              + Add Deposit
            </button>

            {/* DATE FILTERS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              <input
                type="date"
                value={fromDate}
                className="w-full sm:w-auto border p-2 rounded text-[13px]"
                onChange={(e) => setFromDate(e.target.value)}
              />
              <input
                type="date"
                value={toDate}
                className="w-full sm:w-auto border p-2 rounded text-[13px]"
                onChange={(e) => setToDate(e.target.value)}
              />
              <button
                onClick={() => loadData(1, true)}
                className="w-full sm:w-auto bg-[#405189] text-white px-5 py-2 rounded text-[13px] hover:bg-[#364574]"
              >
                Show
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              TABLE BODY AREA — with loading overlay
          ───────────────────────────────────────────── */}
          <div className="relative min-h-[200px]">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
                <Loader2 className="animate-spin text-[#405189]" size={30} />
              </div>
            )}

            {/* ══════════════════════════════════════════
                DESKTOP TABLE  (hidden on mobile)
            ══════════════════════════════════════════ */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f3f6f9] text-[#878a99] text-[13px] font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Account</th>
                    <th className="p-3">Balance</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created At</th>
                    {/* <th className="p-3 text-center">Action</th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((item) => {
                    const status = getDepositStatusBadge(item.status);
                    return (
                      <tr key={item.id} className="text-[13px] hover:bg-gray-50">
                        <td className="p-3">{item.customerName}</td>
                        <td className="p-3">{item.accountName}</td>
                        <td>{formatMoney(item.amount, item.currencyId)}</td>
                        <td className="p-3 text-[#0ab39c] font-bold">{item.currencyCode}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${status.class}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="p-3">
                          {new Date(item.openedAt).toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "2-digit",
                          })}
                        </td>
                        {/* <td className="p-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(item)}
                              className="bg-[#299cdb] text-white px-3 py-1 rounded text-[11px]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setOpenDelete(true);
                              }}
                              className="bg-[#f06548] text-white px-3 py-1 rounded text-[11px]"
                            >
                              Remove
                            </button>
                          </div>
                        </td> */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ══════════════════════════════════════════
                MOBILE CARDS  (shown only on mobile)
            ══════════════════════════════════════════ */}
            <div className="block md:hidden divide-y divide-gray-100">
              {data.map((item) => {
                const status = getDepositStatusBadge(item.status);
                return (
                  <div key={item.id} className="px-4 py-3 hover:bg-gray-50">

                    {/* Row 1: customer name (left) + status badge (right) */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-[#495057] truncate">
                        {item.customerName}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${status.class}`}>
                        {status.text}
                      </span>
                    </div>

                    {/* Row 2: account name (left) + amount+code (right) */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[12px] text-gray-400 truncate">{item.accountName}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <span className="text-gray-400 text-[11px] font-medium">
                          {getCurrencySymbol(item.currencyId)}
                        </span>
                        <span className="text-[14px] font-bold text-gray-800">
                          {new Intl.NumberFormat("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(item.amount || 0)}
                        </span>
                        <span className="text-[#0ab39c] font-bold text-[11px]">
                          {item.currencyCode}
                        </span>
                      </span>
                    </div>

                    {/* Row 3: date (left) + compact action buttons (right) */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-400">
                        {new Date(item.openedAt).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "2-digit",
                        })}
                      </span>
                      {/* <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-[#299cdb] text-white px-2.5 py-1 rounded text-[11px] leading-none"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setOpenDelete(true);
                          }}
                          className="bg-[#f06548] text-white px-2.5 py-1 rounded text-[11px] leading-none"
                        >
                          Remove
                        </button>
                      </div> */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PAGINATION */}
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
            <span className="text-[13px] text-[#878a99]">
              Showing {startIndex} to {endIndex} of {totalItems} Results
            </span>
            <div className="flex gap-1 flex-wrap justify-center">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1.5 border rounded disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded text-[13px] ${currentPage === page ? "bg-[#405189] text-white" : "border"
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 border rounded disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <DepositFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={async (data: CreateDepositRequest) => {
          try {
            if (isEdit && selectedItem) {
              await AccountService.updateDeposit(selectedItem.id, data);
              toast.success("Transaction updated");
            } else {
              await AccountService.createDeposit(data);
              toast.success("Transaction created");
            }
            setOpenForm(false);
            loadData(currentPage);
          } catch {
            toast.error("Save failed");
          }
        }}
      />
      <ConfirmDeleteModal
        open={openDelete}
        loading={deleting}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

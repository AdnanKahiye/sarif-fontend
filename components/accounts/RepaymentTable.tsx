"use client";

import React, { useEffect, useState, useCallback } from "react";
import RepaymentFormModal, { CreateRepaymentRequest } from "./RepaymentFormModal";
import ConfirmDeleteModal from "../ui/Model/ConfirmDeleteModal";
import { AccountService } from "@/lib/account";
import toast from "react-hot-toast";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export const getDepositStatusBadge = (status: number) => {
  switch (status) {
    case 1: return { text: "Pending", class: "bg-yellow-100 text-yellow-700" };
    case 2: return { text: "Partial", class: "bg-blue-100 text-blue-700" };
    case 3: return { text: "Completed", class: "bg-green-100 text-green-700" };
    default: return { text: "Unknown", class: "bg-gray-100 text-gray-600" };
  }
};

interface RepaymentDto {
  id: string;
  loanId: string;
  loanNo: string;
  amount: number;
  note: string;
  cashAccountName: string;
  loanAccountName: string;
  paymentDate: string;
}

export default function RepaymentTable() {
  const today = new Date().toISOString().split("T")[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split("T")[0];

  const [data, setData] = useState<RepaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(today);

  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RepaymentDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const itemsPerPage = 10;

  const loadData = useCallback(async (page: number, useFilters: boolean = true) => {
    setLoading(true);
    try {
      const res = await AccountService.getRepayments(
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
      toast.error("Failed to load repayments");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, firstDay, today]);

  useEffect(() => { loadData(currentPage, true); }, [currentPage]);

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setDeleting(true);
    try {
      await AccountService.deleteTransaction(selectedItem.id);
      toast.success("Repayment deleted");
      setOpenDelete(false);
      loadData(currentPage);
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  const handleEdit = (item: RepaymentDto) => {
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-[15px] font-bold uppercase">Repayment List</h2>
          <div className="text-[13px] font-medium text-gray-500">Account &gt; Repayments</div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <button
              onClick={() => { setIsEdit(false); setSelectedItem(null); setOpenForm(true); }}
              className="w-full md:w-auto bg-[#0ab39c] text-white px-4 py-2 rounded text-[13px] hover:bg-[#089a86]"
            >
              + Add Repayment
            </button>

            <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2">
              <input type="date" value={fromDate} className="w-full sm:w-auto border p-2 rounded text-[13px]" onChange={(e) => setFromDate(e.target.value)} />
              <input type="date" value={toDate} className="w-full sm:w-auto border p-2 rounded text-[13px]" onChange={(e) => setToDate(e.target.value)} />
              <button onClick={() => loadData(1, true)} className="w-full sm:w-auto bg-[#405189] text-white px-5 py-2 rounded text-[13px] hover:bg-[#364574]">
                Show
              </button>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px] relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                <Loader2 className="animate-spin text-[#405189]" size={30} />
              </div>
            )}

            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f3f6f9] text-[#878a99] text-[13px] font-bold uppercase border-b border-gray-200">
                <tr>
                  <th className="p-3">Cash Acc</th>
                  <th className="p-3">Customer Acc</th>
                  <th className="p-3">Note</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">CreateAt</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {data.map((item) => (
                  <tr key={item.id} className="text-[13px] hover:bg-gray-50">
                    <td className="p-3">{item.cashAccountName}</td>
                    <td className="p-3">{item.loanAccountName}</td>
                    <td className="p-3">{item.note}</td>
                    <td className="p-3 text-[#0ab39c] font-bold">
                      {(item.amount || 0).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </td>
                    <td className="p-3">
                      {new Date(item.paymentDate).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "2-digit",
                      })}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-[#299cdb] text-white px-3 py-1 rounded text-[11px]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { setSelectedItem(item); setOpenDelete(true); }}
                          className="bg-[#f06548] text-white px-3 py-1 rounded text-[11px]"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[13px] text-[#878a99]">
              Showing {startIndex} to {endIndex} of {totalItems} Results
            </span>
            <div className="flex gap-1">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 border rounded">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded text-[13px] ${currentPage === page ? "bg-[#405189] text-white" : "border"}`}
                >
                  {page}
                </button>
              ))}
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 border rounded">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── REPAYMENT FORM MODAL ── */}
      <RepaymentFormModal
        open={openForm}
        loanId={isEdit ? selectedItem?.loanId ?? "" : ""}
        onClose={() => { setOpenForm(false); setSelectedItem(null); }}
        onSubmit={async (formData: CreateRepaymentRequest) => {
          try {
            if (isEdit && selectedItem) {
              await AccountService.updateRepayment(selectedItem.id, formData);
              toast.success("Repayment updated");
            } else {
              await AccountService.createRepayment(formData);
              toast.success("Repayment created");
            }
            setOpenForm(false);
            setSelectedItem(null);
            loadData(currentPage);
          } catch {
            toast.error("Save failed");
          }
        }}
      />

      {/* ── DELETE MODAL ── */}
      <ConfirmDeleteModal
        open={openDelete}
        loading={deleting}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
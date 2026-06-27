"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { CreateLoanRequest } from "./LoanFormModal";
import ConfirmDeleteModal from "../ui/Model/ConfirmDeleteModal";
import { AccountService } from "@/lib/account";
import { useRouter } from "next/navigation";
import ReactDOM from "react-dom";
import toast from "react-hot-toast";
import { Loader2, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2, RefreshCw } from "lucide-react";
import LoanFormModal from "./LoanFormModal";
import RepaymentFormModal, { CreateRepaymentRequest } from "./RepaymentFormModal";

export const getDepositStatusBadge = (status: number) => {
  switch (status) {
    case 1: return { text: "Pending", class: "bg-yellow-100 text-yellow-700" };
    case 2: return { text: "Partial", class: "bg-blue-100 text-blue-700" };
    case 3: return { text: "Completed", class: "bg-green-100 text-green-700" };
    default: return { text: "Unknown", class: "bg-gray-100 text-gray-600" };
  }
};

interface LoanDto {
  id: string;
  loanNo: string;
  principalAmount: number;
  accountName: string;
  startDate: string;
  dueDate: string;
  status: number;
  customerName: string;
  paidAmount: number;
}

// ── Dropdown component ──────────────────────────────────────────
function ActionDropdown({
  item,
  onEdit,
  onDelete,
  onRepayment,
}: {
  item: LoanDto;
  onEdit: (item: LoanDto) => void;
  onDelete: (item: LoanDto) => void;
  onRepayment: (item: LoanDto) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Xid marka dibadda la gujiyо
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Xid marka scroll ama resize dhaco
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4,
        left: rect.right - 160,
      });
    }
    setOpen((v) => !v);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
        title="More actions"
      >
        <MoreHorizontal size={15} className="text-gray-500" />
      </button>

      {open && typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
            }}
            className="w-40 bg-white border border-gray-200 rounded shadow-lg py-1 text-[13px]"
          >
            <button
              onClick={() => { setOpen(false); onRepayment(item); }}
              className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-[#0ab39c] font-medium transition-colors"
            >
              <RefreshCw size={13} />
              Repayment
            </button>
          </div>,
          document.body
        )
      }
    </div>
  );
}

// ── Main Table ───────────────────────────────────────────────────
export default function LoanTable() {

  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split("T")[0];

  const [data, setData] = useState<LoanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(today);

  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openRepayment, setOpenRepayment] = useState(false);

  const [selectedItem, setSelectedItem] = useState<LoanDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const itemsPerPage = 10;

  const loadData = useCallback(async (page: number, useFilters: boolean = true) => {
    setLoading(true);
    try {
      const res = await AccountService.getLoans(
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
      toast.error("Failed to load loans");
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
      toast.success("Loan deleted");
      setOpenDelete(false);
      loadData(currentPage);
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  const handleEdit = (item: LoanDto) => {
    setSelectedItem(item);
    setIsEdit(true);
    setOpenForm(true);
  };

  const handleRepayment = (item: LoanDto) => {
    setSelectedItem(item);
    setOpenRepayment(true);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-[#f3f3f9] dark:bg-gray-900 min-h-screen p-4 sm:p-6 font-sans text-[#495057]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-[15px] font-bold uppercase">Loan List</h2>
          <div className="text-[13px] font-medium text-gray-500">Account &gt; Loans</div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <button
              onClick={() => { setIsEdit(false); setOpenForm(true); }}
              className="w-full md:w-auto bg-[#0ab39c] text-white px-4 py-2 rounded text-[13px] hover:bg-[#089a86]"
            >
              + Add Loan
            </button>

            <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2">
              <input type="date" value={fromDate} className="w-full sm:w-auto border p-2 rounded text-[13px]" onChange={(e) => setFromDate(e.target.value)} />
              <input type="date" value={toDate} className="w-full sm:w-auto border p-2 rounded text-[13px]" onChange={(e) => setToDate(e.target.value)} />
              <button onClick={() => loadData(1, true)} className="w-full sm:w-auto bg-[#405189] text-white px-5 py-2 rounded text-[13px] hover:bg-[#364574]">
                Show
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              TABLE BODY AREA — with loading overlay
          ───────────────────────────────────────────── */}
          <div className="relative min-h-[200px]">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
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
                    <th className="p-3">Customer</th>
                    <th className="p-3">Account</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Paid</th>
                    <th className="p-3">Balances</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Start</th>
                    <th className="p-3">End</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {data.map((item) => (
                    <tr key={item.id} className="text-[13px] hover:bg-gray-50">
                      <td className="p-3">{item.customerName}</td>
                      <td className="p-3">{item.accountName}</td>
                      <td className="p-3 text-blue font-bold">
                        {(item.principalAmount || 0).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </td>
                      <td className="p-3 text-[#0ab39c] font-bold">
                        {(item.paidAmount || 0).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </td>
                      <td className="p-3 text-red-500 font-bold">
                        {(item.paidAmount
                          ? item.principalAmount - item.paidAmount
                          : 0
                        ).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </td>
                      <td className="p-3">
                        {(() => {
                          const status = getDepositStatusBadge(item.status);
                          return (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${status.class}`}>
                              {status.text}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-3">
                        {new Date(item.startDate).toLocaleDateString("en-US", {
                          month: "2-digit", day: "2-digit", year: "2-digit",
                        })}
                      </td>
                      <td className="p-3">
                        {new Date(item.dueDate).toLocaleDateString("en-US", {
                          month: "2-digit", day: "2-digit", year: "2-digit",
                        })}
                      </td>
                      <td className="p-3 text-center">
                        <ActionDropdown
                          item={item}
                          onEdit={handleEdit}
                          onDelete={(i) => { setSelectedItem(i); setOpenDelete(true); }}
                          onRepayment={handleRepayment}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ══════════════════════════════════════════
                MOBILE CARDS  (shown only on mobile)
            ══════════════════════════════════════════ */}
            <div className="block md:hidden divide-y divide-gray-100">
              {data.map((item) => {
                const status = getDepositStatusBadge(item.status);
                const balance = item.paidAmount
                  ? item.principalAmount - item.paidAmount
                  : 0;
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

                    {/* Row 2: account name (left) + principal amount (right) */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[12px] text-gray-400 truncate">
                        {item.accountName}
                      </span>
                      <span className="text-[13px] font-bold text-gray-800 shrink-0">
                        {(item.principalAmount || 0).toLocaleString("en-US", {
                          style: "currency", currency: "USD",
                        })}
                      </span>
                    </div>

                    {/* Row 3: paid (left) + balance (right) */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] text-gray-400">
                        Paid:{" "}
                        <span className="text-[#0ab39c] font-semibold">
                          {(item.paidAmount || 0).toLocaleString("en-US", {
                            style: "currency", currency: "USD",
                          })}
                        </span>
                      </span>
                      <span className="text-[11px] text-gray-400 shrink-0">
                        Balance:{" "}
                        <span className="text-red-500 font-semibold">
                          {balance.toLocaleString("en-US", {
                            style: "currency", currency: "USD",
                          })}
                        </span>
                      </span>
                    </div>

                    {/* Row 4: dates (left) + action buttons (right) */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-400">
                        {new Date(item.startDate).toLocaleDateString("en-US", {
                          month: "2-digit", day: "2-digit", year: "2-digit",
                        })}
                        {" → "}
                        {new Date(item.dueDate).toLocaleDateString("en-US", {
                          month: "2-digit", day: "2-digit", year: "2-digit",
                        })}
                      </span>

                      {/* Mobile action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* <button
                          onClick={() => handleEdit(item)}
                          className="bg-[#299cdb] text-white px-2.5 py-1 rounded text-[11px] leading-none flex items-center gap-1"
                        >
                          <Pencil size={10} /> Edit
                        </button>
                        <button
                          onClick={() => { setSelectedItem(item); setOpenDelete(true); }}
                          className="bg-[#f06548] text-white px-2.5 py-1 rounded text-[11px] leading-none flex items-center gap-1"
                        >
                          <Trash2 size={10} /> Remove
                        </button> */}
                        <button
                          onClick={() => handleRepayment(item)}
                          className="bg-[#0ab39c] text-white px-2.5 py-1 rounded text-[11px] leading-none flex items-center gap-1"
                        >
                          <RefreshCw size={10} /> Pay
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
            <span className="text-[13px] text-[#878a99]">
              Showing {startIndex} to {endIndex} of {totalItems} Results
            </span>
            <div className="flex gap-1 flex-wrap justify-center">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 border rounded disabled:opacity-40">
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
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 border rounded disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── LOAN FORM MODAL ── */}
      <LoanFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={async (data: CreateLoanRequest) => {
          try {
            if (isEdit && selectedItem) {
              await AccountService.updateLoan(selectedItem.id, data);
              toast.success("Loan updated");
            } else {
              await AccountService.createLoan(data);
              toast.success("Loan created");
            }
            setOpenForm(false);
            loadData(currentPage);
          } catch {
            toast.error("Save failed");
          }
        }}
      />

      {/* ── REPAYMENT MODAL ── */}
      <RepaymentFormModal
        open={openRepayment}
        loanId={selectedItem?.id ?? ""}
        onClose={() => setOpenRepayment(false)}
        onSubmit={async (repaymentData: CreateRepaymentRequest) => {
          try {
            await AccountService.createRepayment(repaymentData);
            toast.success("Repayment saved");
            setOpenRepayment(false);
            loadData(currentPage);
            router.push("/dashboard/Repayment");
          } catch {
            toast.error("Repayment failed");
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

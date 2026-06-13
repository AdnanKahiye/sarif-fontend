"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import CustomerFormModal, { CustomerFormData } from "./CustomerFormModal";
import ConfirmDeleteModal from "../ui/Model/ConfirmDeleteModal";
import LoanFormModal from "@/components/accounts/LoanFormModal";
import { useRouter } from "next/navigation";
import AccountFormModal, { AccountFormData } from "@/components/accounts/AccountFormModal";
import DepositFormModal from "@/components/accounts/DepositsFormModal";
import WithdrawFormModal from "@/components/accounts/WithdrawFormModal";
import { CustomerService } from "@/lib/customers";
import { AccountService } from "@/lib/account";
import toast from "react-hot-toast";
import { usePermission } from "@/context/PermissionContext";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CreditCard,
  PiggyBank,
  ArrowUpDown,
  Pencil,
  Trash2,
} from "lucide-react";

interface CustomerDto {
  id: string;
  fullName: string;
  gender: number;
  dateOfBirth: string | null;
  email: string;
  phoneNumber: string;
  altPhoneNumber: string;
  address: string;
  agencyId: string;
  branchId: string | null;
  agencyName: string;
  branchName: string;
  userId: string;
  userName: string;
}

// ── Dropdown component ──────────────────────────────────────────────────────
function ActionDropdown({
  item,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onLoan,
  onDeposit,
  onWithdraw,
  onCreateAccount,
}: {
  item: CustomerDto;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (item: CustomerDto) => void;
  onDelete: (item: CustomerDto) => void;
  onLoan: (item: CustomerDto) => void;
  onDeposit: (item: CustomerDto) => void;
  onWithdraw: (item: CustomerDto) => void;
  onCreateAccount: (item: CustomerDto) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-center justify-center gap-2">
      {canEdit && (
        <button
          onClick={() => onEdit(item)}
          className="bg-[#299cdb] text-white px-3 py-1 rounded text-[11px] shadow-sm hover:brightness-110 flex items-center gap-1"
        >
          <Pencil size={11} /> Edit
        </button>
      )}

      {canDelete && (
        <button
          onClick={() => onDelete(item)}
          className="bg-[#f06548] text-white px-3 py-1 rounded text-[11px] shadow-sm hover:brightness-110 flex items-center gap-1"
        >
          <Trash2 size={11} /> Remove
        </button>
      )}

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-1.5 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="More actions"
        >
          <MoreHorizontal size={15} className="text-gray-500 dark:text-gray-400" />
        </button>

        {open && (
          <div className="absolute right-0 bottom-full mb-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 py-1 text-[13px]">
            <button
              onClick={() => { setOpen(false); onDeposit(item); }}
              className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#0ab39c] dark:text-emerald-400 font-medium transition-colors"
            >
              <PiggyBank size={14} /> Deposit
            </button>
            <button
              onClick={() => { setOpen(false); onWithdraw(item); }}
              className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#f7b731] dark:text-yellow-400 font-medium transition-colors"
            >
              <ArrowUpDown size={14} /> Withdraw
            </button>
            <button
              onClick={() => { setOpen(false); onLoan(item); }}
              className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#405189] dark:text-blue-400 font-medium transition-colors"
            >
              <CreditCard size={14} /> Loan
            </button>
            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
            <button
              onClick={() => { setOpen(false); onCreateAccount(item); }}
              className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#f06548] font-medium transition-colors"
            >
              <CreditCard size={14} /> Create Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main table component ────────────────────────────────────────────────────
export default function CustomerTable() {
  const { hasPermission } = usePermission();

  const [data, setData] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<CustomerDto | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [openLoanModal, setOpenLoanModal] = useState(false);
  const [loanCustomer, setLoanCustomer] = useState<CustomerDto | null>(null);

  const [openDepositModal, setOpenDepositModal] = useState(false);
  const [depositCustomer, setDepositCustomer] = useState<CustomerDto | null>(null);

  const [openWithdrawModal, setOpenWithdrawModal] = useState(false);
  const [withdrawCustomer, setWithdrawCustomer] = useState<CustomerDto | null>(null);

  const [openAccountModal, setOpenAccountModal] = useState(false);
  const [accountCustomer, setAccountCustomer] = useState<CustomerDto | null>(null);

  const loadData = useCallback(async (page: number, searchQuery: string) => {
    setLoading(true);
    try {
      const res = await CustomerService.getCustomers(page, itemsPerPage);
      const apiResponse = res.data?.data;
      if (apiResponse) {
        let rawData = apiResponse.data || [];
        if (searchQuery) {
          rawData = rawData.filter(
            (c: CustomerDto) =>
              c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.phoneNumber.includes(searchQuery)
          );
        }
        setData(rawData);
        setTotalItems(apiResponse.totalRecords || 0);
      }
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(currentPage, search);
    }, 400);
    return () => clearTimeout(timer);
  }, [currentPage, search, loadData]);

  const handleFormSubmit = async (formData: CustomerFormData) => {
    try {
      if (mode === "add") {
        await CustomerService.createCustomer(formData);
        toast.success("Customer registered");
      } else {
        if (!selectedItem) return;
        await CustomerService.updateCustomer(selectedItem.id, formData);
        toast.success("Customer updated");
      }
      setOpenModal(false);
      loadData(currentPage, search);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setDeleting(true);
    try {
      await CustomerService.deleteCustomer(selectedItem.id);
      toast.success("Customer removed");
      setOpenDelete(false);
      loadData(currentPage, search);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const canAdd = hasPermission("CREATE.USER");
  const canEdit = hasPermission("EDIT.USER");
  const canDelete = hasPermission("DELETE.USER");
  const router = useRouter();

  return (
    <div className="bg-[#f3f3f9] dark:bg-gray-900 min-h-screen p-4 sm:p-6 font-sans text-[#495057]">
      <div className="mx-auto max-w-7xl">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold dark:text-gray-200 uppercase tracking-wide">
            Customer Lists
          </h2>
          <div className="text-[13px] font-medium">
            Settings <span className="text-gray-400 mx-1">&gt;</span>{" "}
            <span className="text-gray-400">Customers</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">

          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <h3 className="text-[16px] font-semibold text-[#495057] dark:text-gray-300">
              Add, Edit &amp; Remove
            </h3>
          </div>

          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              {canAdd && (
                <button
                  onClick={() => { setMode("add"); setSelectedItem(null); setOpenModal(true); }}
                  className="bg-[#0ab39c] hover:bg-[#099885] text-white px-4 py-2 rounded text-[13px] flex items-center gap-1 transition-all"
                >
                  <span className="text-lg">+</span> Add Customer
                </button>
              )}
            </div>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search name or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded text-[13px] focus:outline-none focus:border-[#405189] dark:bg-gray-900 dark:text-white"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              TABLE BODY AREA — with loading overlay
          ───────────────────────────────────────────── */}
          <div className="relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#405189]" size={30} />
              </div>
            )}

            {/* ══════════════════════════════════════════
                DESKTOP TABLE  (hidden on mobile)
            ══════════════════════════════════════════ */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f3f6f9] dark:bg-gray-700/50 text-[#878a99] text-[13px] font-bold uppercase border-y border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Email</th>
                    <th className="p-3 text-center">Gender</th>
                    <th className="p-3">Location</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-gray-400 italic text-sm">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    data.map((item) => (
                      <tr
                        key={item.id}
                        className="text-[13px] dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="p-3 text-center">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="p-3 font-semibold text-[#405189] dark:text-blue-400">
                          {item.fullName}
                        </td>
                        <td className="p-3 font-medium text-[#212529] dark:text-gray-200">
                          {item.phoneNumber}
                        </td>
                        <td className="p-3 text-gray-500">{item.email}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-[2px] rounded text-[10px] font-bold uppercase tracking-wider ${item.gender === 0 ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"}`}>
                            {item.gender === 0 ? "MALE" : "FEMALE"}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 italic">{item.address}</td>
                        <td className="p-3">
                          <ActionDropdown
                            item={item}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            onEdit={(i) => { setMode("edit"); setSelectedItem(i); setOpenModal(true); }}
                            onDelete={(i) => { setSelectedItem(i); setOpenDelete(true); }}
                            onLoan={(i) => { setLoanCustomer(i); setOpenLoanModal(true); }}
                            onDeposit={(i) => { setDepositCustomer(i); setOpenDepositModal(true); }}
                            onWithdraw={(i) => { setWithdrawCustomer(i); setOpenWithdrawModal(true); }}
                            onCreateAccount={(i) => { setAccountCustomer(i); setOpenAccountModal(true); }}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ══════════════════════════════════════════
                MOBILE CARDS  (shown only on mobile)
            ══════════════════════════════════════════ */}
            <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-700">
              {data.length === 0 && !loading ? (
                <div className="p-6 text-center text-gray-400 italic text-sm">
                  No records found
                </div>
              ) : (
                data.map((item) => (
                  <div key={item.id} className="p-4 mx-3 my-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">

                    {/* Row 1: name + gender badge + actions */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex flex-col gap-2.5">
                        <span className="text-[15px] font-bold text-[#405189] dark:text-blue-400 leading-tight">
                          {item.fullName}
                        </span>
                        <span className={`inline-block w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.gender === 0
                            ? "bg-blue-100 text-blue-600"
                            : "bg-pink-100 text-pink-600"
                          }`}>
                          {item.gender === 0 ? "Male" : "Female"}
                        </span>
                      </div>

                      <ActionDropdown
                        item={item}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onEdit={(i) => { setMode("edit"); setSelectedItem(i); setOpenModal(true); }}
                        onDelete={(i) => { setSelectedItem(i); setOpenDelete(true); }}
                        onLoan={(i) => { setLoanCustomer(i); setOpenLoanModal(true); }}
                        onDeposit={(i) => { setDepositCustomer(i); setOpenDepositModal(true); }}
                        onWithdraw={(i) => { setWithdrawCustomer(i); setOpenWithdrawModal(true); }}
                        onCreateAccount={(i) => { setAccountCustomer(i); setOpenAccountModal(true); }}
                      />
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-gray-100 dark:border-gray-700 mb-3" />

                    {/* Row 2: chips */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 font-medium">
                        📞 {item.phoneNumber}
                      </span>
                      {item.email && (
                        <span className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 font-medium">
                          ✉️ {item.email}
                        </span>
                      )}
                      {item.address && (
                        <span className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 font-medium">
                          📍 {item.address}
                        </span>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>

          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <span className="text-[13px] text-[#878a99]">
              Showing <span className="font-semibold">{startIndex}</span> to{" "}
              <span className="font-semibold">{endIndex}</span> of{" "}
              <span className="font-semibold">{totalItems}</span> Results
            </span>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-[13px] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded text-[13px] transition-all font-medium ${currentPage === page
                      ? "bg-[#405189] text-white shadow-sm"
                      : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600"
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-[13px] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Form Modal */}
      <CustomerFormModal
        open={openModal}
        mode={mode}
        initialData={
          selectedItem ? {
            fullName: selectedItem.fullName,
            gender: selectedItem.gender,
            email: selectedItem.email,
            phoneNumber: selectedItem.phoneNumber,
            altPhoneNumber: selectedItem.altPhoneNumber,
            address: selectedItem.address,
          } : undefined
        }
        onClose={() => setOpenModal(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDeleteModal
        open={openDelete}
        loading={deleting}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />

      {openLoanModal && loanCustomer && (
        <LoanFormModal
          open={openLoanModal}
          customerId={loanCustomer.id}
          customerName={loanCustomer.fullName}
          onClose={() => { setOpenLoanModal(false); setLoanCustomer(null); }}
          onSubmit={async (form) => {
            try {
              await AccountService.createLoan(form);
              toast.success("Loan created successfully");
              setOpenLoanModal(false);
              setLoanCustomer(null);
              loadData(currentPage, search);
              router.push("/dashboard/loans");
            } catch (error: any) {
              toast.error(error.response?.data?.message || "Loan failed");
            }
          }}
        />
      )}

      {openDepositModal && depositCustomer && (
        <DepositFormModal
          open={openDepositModal}
          customerId={depositCustomer.id}
          customerName={depositCustomer.fullName}
          onClose={() => { setOpenDepositModal(false); setDepositCustomer(null); }}
          onSubmit={async (form) => {
            try {
              await AccountService.createLoan(form);
              toast.success("Loan created successfully");
              setOpenLoanModal(false);
              setLoanCustomer(null);
              loadData(currentPage, search);
              router.push("/dashboard/deposits");
            } catch (error: any) {
              toast.error(error.response?.data?.message || "Loan failed");
            }
          }}
        />
      )}

      {openWithdrawModal && withdrawCustomer && (
        <WithdrawFormModal
          open={openWithdrawModal}
          customerId={withdrawCustomer.id}
          customerName={withdrawCustomer.fullName}
          onClose={() => { setOpenWithdrawModal(false); setWithdrawCustomer(null); }}
          onSubmit={async (form) => {
            try {
              await AccountService.createLoan(form);
              toast.success("Loan created successfully");
              setOpenLoanModal(false);
              setLoanCustomer(null);
              loadData(currentPage, search);
              router.push("/dashboard/withdrawals");
            } catch (error: any) {
              toast.error(error.response?.data?.message || "Loan failed");
            }
          }}
        />
      )}

      {openAccountModal && accountCustomer && (
        <AccountFormModal
          open={openAccountModal}
          mode="add"
          customerId={accountCustomer.id}
          customerName={accountCustomer.fullName}
          onClose={() => { setOpenAccountModal(false); setAccountCustomer(null); }}
          onSubmit={async (form) => {
            try {
              await AccountService.createLoan(form);
              toast.success("Loan created successfully");
              setOpenLoanModal(false);
              setLoanCustomer(null);
              loadData(currentPage, search);
              router.push("/dashboard/accounts");
            } catch (error: any) {
              toast.error(error.response?.data?.message || "Loan failed");
            }
          }}
        />
      )}

    </div>
  );
}

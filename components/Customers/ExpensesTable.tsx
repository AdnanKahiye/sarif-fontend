"use client";

import React, { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import ExpensesFormModal, { ExpensesFormData } from "./ExpensesFormModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { CustomerService } from "@/lib/customers";
import toast from "react-hot-toast";

interface ExpenseDto {
  id: string;
  categoryName: string;
  amount: number;
  remark: string;
  expenseCategoryId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function ExpensesTable() {
  const [expenses, setExpenses] = useState<ExpenseDto[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseDto | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    setLoading(true);
    try {
      const res = await CustomerService.getAllExpenses();

      if (res.data.success) {
        const data = res.data.data;

        if (Array.isArray(data)) {
          setExpenses(data);
        } else if (Array.isArray(data?.data)) {
          setExpenses(data.data);
        } else {
          setExpenses([]);
        }
      } else {
        toast.error(res.data.message || "Failed to load expenses");
        setExpenses([]);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: ExpensesFormData) {
    try {
      let res;

      if (mode === "add") {
        res = await CustomerService.createExpenses(data);
      } else {
        if (!selectedExpense?.id) return;
        res = await CustomerService.updateExpenses(
          selectedExpense.id,
          data
        );
      }

      if (res.data.success) {
        toast.success(res.data.message || "Operation successful");
        setOpenModal(false);
        loadExpenses();
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  }

  async function confirmDelete() {
    if (!selectedExpense) return;

    try {
      setDeleting(true);
      const res = await CustomerService.deleteExpenses(selectedExpense.id);

      if (res.data.success) {
        toast.success(res.data.message || "Expense deleted successfully");
        setOpenDelete(false);
        loadExpenses();
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  const filteredExpenses = expenses.filter((e) =>
    e.categoryName?.toLowerCase().includes(search.toLowerCase()) ||
    e.remark?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Expenses
            </h2>
            <p className="text-sm text-gray-500">
              Manage expense records
            </p>
          </div>

          <button
            onClick={() => {
              setMode("add");
              setSelectedExpense(null);
              setOpenModal(true);
            }}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl 
                       hover:bg-indigo-700 transition shadow-sm"
          >
            + Add New
          </button>
        </div>

        {/* SEARCH */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="w-80">
            <Input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full text-sm"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="relative">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Amount</th>
                <th className="px-6 py-4 text-left">Remark</th>
                <th className="px-6 py-4 text-left">Created At</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Loading expenses...
                  </td>
                </tr>
              )}

              {!loading && filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    No expenses found
                  </td>
                </tr>
              )}

              {!loading &&
                filteredExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition">

                    <td className="px-6 py-4 font-medium text-gray-800">
                      {e.categoryName}
                    </td>

                    <td className="px-6 py-4 font-semibold text-red-600">
                      {e.amount}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {e.remark}
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">

                        <button
                          onClick={() => {
                            setMode("edit");
                            setSelectedExpense(e);
                            setOpenModal(true);
                          }}
                          className="px-3 py-1 rounded-lg text-indigo-600 
                                     hover:bg-indigo-50 transition font-medium"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            setSelectedExpense(e);
                            setOpenDelete(true);
                          }}
                          className="px-3 py-1 rounded-lg text-red-600 
                                     hover:bg-red-50 transition font-medium"
                        >
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

            </tbody>
          </table>
          </div>

          {/* Mobile cards */}
          <div className="block md:hidden divide-y divide-gray-100">
            {loading ? (
              <div className="px-6 py-10 text-center text-gray-500">Loading expenses...</div>
            ) : filteredExpenses.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400">No expenses found</div>
            ) : filteredExpenses.map((e) => (
              <div key={e.id} className="px-4 py-3 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-gray-800 text-sm truncate">{e.categoryName}</span>
                  <span className="font-semibold text-red-600 text-sm shrink-0">{e.amount}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs text-gray-600 line-clamp-1">{e.remark}</span>
                  <span className="text-[11px] text-gray-400 shrink-0">{new Date(e.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => { setMode("edit"); setSelectedExpense(e); setOpenModal(true); }} className="px-3 py-1 rounded-lg text-indigo-600 hover:bg-indigo-50 transition font-medium text-xs">Edit</button>
                  <button onClick={() => { setSelectedExpense(e); setOpenDelete(true); }} className="px-3 py-1 rounded-lg text-red-600 hover:bg-red-50 transition font-medium text-xs">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing {filteredExpenses.length} of {expenses.length} entries
          </p>
        </div>

      </div>

      <ExpensesFormModal
        open={openModal}
        mode={mode}
        initialData={selectedExpense ?? undefined}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
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

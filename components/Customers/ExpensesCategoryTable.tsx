"use client";

import React, { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import ExpensesCategoryFormModal, { ExpensesCategoryFormData } from "./ExpensesCategoryFormModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { CustomerService } from "@/lib/customers";
import toast from "react-hot-toast";

interface ExpensesCategoryDto {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function ExpensesCategoryTable() {
  const [expensesCategories, setExpensesCategories] = useState<ExpensesCategoryDto[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedExpensesCategory, setSelectedExpensesCategory] =
    useState<ExpensesCategoryDto | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadExpensesCategories();
  }, []);

  async function loadExpensesCategories() {
    setLoading(true);
    try {
      const res = await CustomerService.getAllExpensesCategories();

      if (res.data.success) {
        const data = res.data.data;

        if (Array.isArray(data)) {
          setExpensesCategories(data);
        } else if (Array.isArray(data?.data)) {
          setExpensesCategories(data.data);
        } else {
          setExpensesCategories([]);
        }
      } else {
        toast.error(res.data.message || "Failed to load expense categories");
        setExpensesCategories([]);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      setExpensesCategories([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: ExpensesCategoryFormData) {
    try {
      let res;

      if (mode === "add") {
        res = await CustomerService.createExpensesCategory(data);
      } else {
        if (!selectedExpensesCategory?.id) return;
        res = await CustomerService.updateExpensesCategory(
          selectedExpensesCategory.id,
          data
        );
      }

      if (res.data.success) {
        toast.success(res.data.message || "Operation successful");
        setOpenModal(false);
        loadExpensesCategories();
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  }

  async function confirmDelete() {
    if (!selectedExpensesCategory) return;

    try {
      setDeleting(true);
      const res = await CustomerService.deleteExpensesCategory(selectedExpensesCategory.id);

      if (res.data.success) {
        toast.success(res.data.message || "Expense category deleted successfully");
        setOpenDelete(false);
        loadExpensesCategories();
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  const filteredExpensesCategories = Array.isArray(expensesCategories)
    ? expensesCategories.filter((s) =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Expense Categories
            </h2>
            <p className="text-sm text-gray-500">
              Manage expense classification
            </p>
          </div>

          <button
            onClick={() => {
              setMode("add");
              setSelectedExpensesCategory(null);
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
              placeholder="Search categories..."
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
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Description</th>
                <th className="px-6 py-4 text-left">Created At</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    Loading categories...
                  </td>
                </tr>
              )}

              {!loading && filteredExpensesCategories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                    No categories found
                  </td>
                </tr>
              )}

              {!loading &&
                filteredExpensesCategories.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition">

                    <td className="px-6 py-4 font-medium text-gray-800">
                      {s.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {s.description}
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {new Date(s.createdAt).toISOString().split("T")[0]}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">

                        <button
                          onClick={() => {
                            setMode("edit");
                            setSelectedExpensesCategory(s);
                            setOpenModal(true);
                          }}
                          className="px-3 py-1 rounded-lg text-indigo-600 
                                     hover:bg-indigo-50 transition font-medium"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            setSelectedExpensesCategory(s);
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
              <div className="px-6 py-10 text-center text-gray-500">Loading categories...</div>
            ) : filteredExpensesCategories.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400">No categories found</div>
            ) : filteredExpensesCategories.map((s) => (
              <div key={s.id} className="px-4 py-3 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-gray-800 text-sm truncate">{s.name}</span>
                  <span className="text-xs text-gray-500 shrink-0">{new Date(s.createdAt).toISOString().split("T")[0]}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-600 line-clamp-1">{s.description}</span>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => { setMode("edit"); setSelectedExpensesCategory(s); setOpenModal(true); }} className="px-3 py-1 rounded-lg text-indigo-600 hover:bg-indigo-50 transition font-medium text-xs">Edit</button>
                    <button onClick={() => { setSelectedExpensesCategory(s); setOpenDelete(true); }} className="px-3 py-1 rounded-lg text-red-600 hover:bg-red-50 transition font-medium text-xs">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing {filteredExpensesCategories.length} of {expensesCategories.length} entries
          </p>
        </div>

      </div>

      <ExpensesCategoryFormModal
        open={openModal}
        mode={mode}
        initialData={selectedExpensesCategory ?? undefined}
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

"use client";

import React, { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import CustomerFormModal, { CustomerFormData } from "./CustomerFormModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { CustomerService } from "@/lib/customers";
import toast from "react-hot-toast";

interface CustomerDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  type: string;
  gender: string;
}

export default function CustomerTable() {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerDto | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    try {
      const res = await CustomerService.getAllCustomer();

      if (res.data.success) {
        const data = res.data.data;

        if (Array.isArray(data)) {
          setCustomers(data);
        } else if (Array.isArray(data?.data)) {
          setCustomers(data.data);
        } else {
          setCustomers([]);
        }
      } else {
        toast.error(res.data.message || "Failed to load customers");
        setCustomers([]);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: CustomerFormData) {
    try {
      let res;

      if (mode === "add") {
        res = await CustomerService.createCustomer(data);
      } else {
        if (!selectedCustomer?.id) return;
        res = await CustomerService.updateCustomer(
          selectedCustomer.id,
          data
        );
      }

      if (res.data.success) {
        toast.success(res.data.message || "Operation successful");
        setOpenModal(false);
        loadCustomers();
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  }

  async function confirmDelete() {
    if (!selectedCustomer) return;

    try {
      setDeleting(true);
      const res = await CustomerService.deleteCustomer(selectedCustomer.id);

      if (res.data.success) {
        toast.success(res.data.message || "Customer deleted successfully");
        setOpenDelete(false);
        loadCustomers();
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  const filteredCustomers = Array.isArray(customers)
    ? customers.filter((c) =>
        c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phoneNumber?.toLowerCase().includes(search.toLowerCase()) ||
        c.type?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Customers
            </h2>
            <p className="text-sm text-gray-500">
              Manage customer records
            </p>
          </div>

          <button
            onClick={() => {
              setMode("add");
              setSelectedCustomer(null);
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
              placeholder="Search customers..."
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
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Phone</th>
                <th className="px-6 py-4 text-left">Type</th>
                <th className="px-6 py-4 text-left">Address</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    Loading customers...
                  </td>
                </tr>
              )}

              {!loading && filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    No customers found
                  </td>
                </tr>
              )}

              {!loading &&
                filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {c.fullName}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {c.email}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {c.phoneNumber}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                        {c.type}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {c.address}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">

                        <button
                          onClick={() => {
                            setMode("edit");
                            setSelectedCustomer(c);
                            setOpenModal(true);
                          }}
                          className="px-3 py-1 rounded-lg text-indigo-600 
                                     hover:bg-indigo-50 transition font-medium"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCustomer(c);
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
              <div className="px-6 py-10 text-center text-gray-500">Loading customers...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400">No customers found</div>
            ) : filteredCustomers.map((c) => (
              <div key={c.id} className="px-4 py-3 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-gray-800 text-sm truncate">{c.fullName}</span>
                  <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 shrink-0">{c.type}</span>
                </div>
                <div className="text-xs text-gray-600 mb-1 truncate">{c.email}</div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-500 truncate">{c.phoneNumber}</span>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => { setMode("edit"); setSelectedCustomer(c); setOpenModal(true); }} className="px-3 py-1 rounded-lg text-indigo-600 hover:bg-indigo-50 transition font-medium text-xs">Edit</button>
                    <button onClick={() => { setSelectedCustomer(c); setOpenDelete(true); }} className="px-3 py-1 rounded-lg text-red-600 hover:bg-red-50 transition font-medium text-xs">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing {filteredCustomers.length} of {customers.length} entries
          </p>
        </div>

      </div>

      <CustomerFormModal
        open={openModal}
        mode={mode}
        initialData={selectedCustomer ?? undefined}
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

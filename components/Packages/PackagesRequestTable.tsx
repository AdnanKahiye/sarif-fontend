"use client";

import React, { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import PackageRequestFormModal, {
  PackageReuestFormData
} from "./PackagesRequestFormModal";
import ConfirmDeleteModal from "../common/ConfirmDeleteModal";
import { packageService } from "@/lib/packages";
import toast from "react-hot-toast";

/* =========================
   Types
========================= */
interface PackageDto {
  id: string;
  name: string;
  email: string;
  packageName: string;
  phone: string;
  message: string;
  createdAt: string;
  packageId: string;
  status:string;
}

/* =========================
   Package Table
========================= */
export default function PackageTable() {
  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedPackage, setSelectedPackage] = useState<PackageDto | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =========================
     LOAD PACKAGES
  ========================= */
  useEffect(() => {
    loadPackages();
  }, []);

  async function loadPackages() {
    setLoading(true);
    try {
      const res = await packageService.getReuqestPackages();

      if (res.data.success) {
        setPackages(res.data.data);
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message || "Failed to load packages");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     ADD / UPDATE
  ========================= */
  async function handleSubmit(data: PackageReuestFormData) {
    try {
      let res;

      if (mode === "add") {
        res = await packageService.createequestPackage(data);
      } else {
        if (!selectedPackage?.id) return;
        res = await packageService.updateRequestPackage(selectedPackage.id, data);
      }

      if (res.data.success) {
        toast.success(res.data.message);
        setOpenModal(false);
        loadPackages();
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  }

  /* =========================
     DELETE
  ========================= */
  async function confirmDelete() {
    if (!selectedPackage) return;

    try {
      setDeleting(true);
      const res = await packageService.deletePackageRequest(selectedPackage.id);

      if (res.data.success) {
        toast.success(res.data.message);
        setOpenDelete(false);
        loadPackages();
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  /* =========================
     FILTER
  ========================= */
  const filteredPackages = packages.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.packageName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      {/* Header with Title and Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 md:px-6 py-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Package Requests</h2>
        <button
          onClick={() => {
            setMode("add");
            setSelectedPackage(null);
            setOpenModal(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add New
        </button>
      </div>

      {/* Search */}
      <div className="border-b border-gray-200 px-4 md:px-6 py-4 dark:border-gray-700">
        <div className="relative w-full sm:w-72">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full pl-9 text-sm"
          />
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full min-w-160">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Email
              </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Package
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Message
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Date
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            
            {!loading && filteredPackages.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No package requests found
                </td>
              </tr>
            )}

            {filteredPackages.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {p.name}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {p.email}
                </td>
                   <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {p.status}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {p.phone}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {p.packageName}
                  </span>
                </td>
                <td className="max-w-[200px] px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  <p className="truncate" title={p.message}>
                    {p.message || "—"}
                  </p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {new Date(p.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => {
                        setMode("edit");
                        setSelectedPackage(p);
                        setOpenModal(true);
                      }}
                      className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                      title="Edit"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPackage(p);
                        setOpenDelete(true);
                      }}
                      className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      title="View"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {loading && [1,2,3].map(i => (
          <div key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
          </div>
        ))}
        {!loading && filteredPackages.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">No package requests found</div>
        )}
        {!loading && filteredPackages.map((p) => (
          <div key={p.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">{p.name}</span>
              <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 whitespace-nowrap">{p.packageName}</span>
            </div>
            <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">{p.email} · {p.phone}</div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">{new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              <div className="flex gap-1">
                <button onClick={() => { setMode("edit"); setSelectedPackage(p); setOpenModal(true); }} className="bg-[#299cdb] text-white px-2.5 py-1 rounded text-[11px] leading-none">Edit</button>
                <button onClick={() => { setSelectedPackage(p); setOpenDelete(true); }} className="bg-[#f06548] text-white px-2.5 py-1 rounded text-[11px] leading-none">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 md:px-6 py-3 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing {filteredPackages.length} of {packages.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800">
              Previous
            </button>
            <button className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700">
              1
            </button>
            <button className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800">
              2
            </button>
            <button className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800">
              3
            </button>
            <button className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PackageRequestFormModal
        open={openModal}
        mode={mode}
        initialData={
          selectedPackage
            ? {
                name: selectedPackage.name,
                phone: selectedPackage.phone,
                email: selectedPackage.email,
                message: selectedPackage.message,
                packageId: selectedPackage.packageId,
                status:selectedPackage.status,
              }
            : undefined
        }
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
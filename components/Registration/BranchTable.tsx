"use client";

import React, { useEffect, useState, useCallback } from "react";
import BranchModal, { BranchFormData } from "./BranchFormModal";
import ConfirmDeleteModal from "../ui/Model/ConfirmDeleteModal";
import { SetupService } from "@/lib/setup";
import toast from "react-hot-toast";
import { usePermission } from "@/context/PermissionContext";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface BranchDto {
  id: string;
  name: string;
  location: string;
  agencyName: string;
  isMain: boolean;
  agencyId: string;
  createdAt: string;
  userName: string;
  isActive: boolean;
}

export default function BranchTable() {
  const { hasPermission } = usePermission();
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedBranch, setSelectedBranch] = useState<BranchDto | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const loadBranches = useCallback(async (page: number, searchQuery: string) => {
    setLoading(true);
    try {
      const res = await SetupService.getBranches(page, itemsPerPage);
      const apiResponse = res.data?.data;
      if (apiResponse) {
        setBranches(apiResponse.data || []);
        setTotalItems(apiResponse.totalRecords || 0);
      }
    } catch {
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBranches(currentPage, search);
    }, 400);
    return () => clearTimeout(timer);
  }, [currentPage, search, loadBranches]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleFormSubmit = async (data: BranchFormData) => {
    try {
      if (mode === "add") {
        await SetupService.createBranch(data);
        toast.success("Branch created successfully");
      } else {
        if (!selectedBranch) return;
        await SetupService.updateBranch(selectedBranch.id, data);
        toast.success("Branch updated successfully");
      }
      setOpenModal(false);
      loadBranches(currentPage, search);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const confirmDelete = async () => {
    if (!selectedBranch) return;
    setDeleting(true);
    try {
      await SetupService.deleteBranch(selectedBranch.id);
      toast.success("Branch removed");
      setOpenDelete(false);
      loadBranches(currentPage, search);
    } catch {
      toast.error("Could not delete branch");
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
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
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

        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-[#495057] dark:text-gray-200 uppercase tracking-wide">
            List Branches
          </h2>
          <div className="text-[13px] text-[#495057] font-medium hidden sm:block">
            Tables <span className="text-gray-400 mx-1">&gt;</span>{" "}
            <span className="text-gray-400">List Branches</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 dark:border-gray-700 p-4">
            <h3 className="text-[16px] font-semibold text-[#495057] dark:text-gray-300">
              Add, Edit & Remove
            </h3>
          </div>

          {/* Toolbar */}
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {canAdd && (
                <button
                  onClick={() => { setMode("add"); setSelectedBranch(null); setOpenModal(true); }}
                  className="bg-[#0ab39c] hover:bg-[#099885] text-white px-4 py-2 rounded text-[13px] flex items-center gap-1 transition-all w-full sm:w-auto justify-center"
                >
                  <span className="text-lg">+</span> Add Branch
                </button>
              )}
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded text-[13px] focus:outline-none focus:border-[#405189] dark:bg-gray-900"
                value={search}
                onChange={handleSearchChange}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          {/* ── DESKTOP TABLE (md and above) ── */}
          <div className="hidden md:block overflow-x-auto relative">
            {loading && branches.length > 0 && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#405189]" size={30} />
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f3f6f9] dark:bg-gray-700/50 text-[#878a99] text-[13px] font-bold uppercase border-y border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">isMain</th>
                  <th className="p-3 text-center">Agency</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">CreateAt</th>
                  <th className="p-3 text-center">CreateBy</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading && branches.length === 0 ? (
                  <SkeletonRows />
                ) : branches.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-gray-500">
                      No branches found
                    </td>
                  </tr>
                ) : (
                  branches.map((branch) => (
                    <tr
                      key={branch.id}
                      className="text-[13px] text-[#212529] dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      <td className="p-3 text-center">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="p-3 font-medium">{branch.name}</td>
                      <td className="p-3 text-[#878a99]">{branch.location}</td>
                      <td className="p-3">{branch.isMain ? "Yes" : "No"}</td>
                      <td className="p-3 text-center">{branch.agencyName}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-[2px] rounded text-[10px] font-bold uppercase tracking-wider ${
                            branch.isActive
                              ? "bg-[#0ab39c20] text-[#0ab39c]"
                              : "bg-[#f0654820] text-[#f06548]"
                          }`}
                        >
                          {branch.isActive ? "ACTIVE" : "BLOCK"}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-center">
                        {new Date(branch.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="p-3 font-medium text-center">{branch.userName}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          {canEdit && (
                            <button
                              onClick={() => { setMode("edit"); setSelectedBranch(branch); setOpenModal(true); }}
                              className="bg-[#299cdb] text-white px-3 py-1 rounded text-[11px]"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => { setSelectedBranch(branch); setOpenDelete(true); }}
                              className="bg-[#f06548] text-white px-3 py-1 rounded text-[11px]"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE CARDS (below md) ── */}
          <div className="md:hidden relative">
            {loading && branches.length > 0 && (
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#405189]" size={28} />
              </div>
            )}
            {loading && branches.length === 0 ? (
              <MobileSkeletonCards />
            ) : branches.length === 0 ? (
              <p className="p-6 text-center text-gray-500 text-[13px]">No branches found</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Card top: name + status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[14px] font-semibold text-[#212529] dark:text-gray-200">
                        {branch.name}
                      </span>
                      <span
                        className={`px-2 py-[2px] rounded text-[10px] font-bold uppercase tracking-wider ${
                          branch.isActive
                            ? "bg-[#0ab39c20] text-[#0ab39c]"
                            : "bg-[#f0654820] text-[#f06548]"
                        }`}
                      >
                        {branch.isActive ? "ACTIVE" : "BLOCK"}
                      </span>
                    </div>

                    {/* Card meta grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">
                          Location
                        </p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300">
                          {branch.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">
                          Agency
                        </p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300">
                          {branch.agencyName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">
                          Main Branch
                        </p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300">
                          {branch.isMain ? "Yes" : "No"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">
                          Created By
                        </p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300">
                          {branch.userName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-0.5">
                          Created At
                        </p>
                        <p className="text-[12px] text-[#495057] dark:text-gray-300">
                          {new Date(branch.createdAt).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                    </div>

                    {/* Card actions */}
                    {(canEdit || canDelete) && (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        {canEdit && (
                          <button
                            onClick={() => { setMode("edit"); setSelectedBranch(branch); setOpenModal(true); }}
                            className="bg-[#299cdb] text-white px-4 py-1.5 rounded text-[12px] flex-1 sm:flex-none"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => { setSelectedBranch(branch); setOpenDelete(true); }}
                            className="bg-[#f06548] text-white px-4 py-1.5 rounded text-[12px] flex-1 sm:flex-none"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 dark:border-gray-700 gap-3">
            <span className="text-[13px] text-[#878a99] order-2 sm:order-1">
              Showing <span className="font-semibold">{startIndex}</span> to{" "}
              <span className="font-semibold">{endIndex}</span> of{" "}
              <span className="font-semibold">{totalItems}</span> Results
            </span>
            <div className="flex items-center gap-1 flex-wrap justify-center order-1 sm:order-2">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded text-[13px] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              {getPageNumbers().map((page, idx) =>
                page < 0 ? (
                  <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-[13px]">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-[13px] ${
                      currentPage === page
                        ? "bg-[#405189] text-white"
                        : "border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded text-[13px] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <BranchModal
        open={openModal}
        mode={mode}
        initialData={
          selectedBranch
            ? {
                name: selectedBranch.name,
                location: selectedBranch.location,
                isMain: selectedBranch.isMain ?? false,
                agencyId: selectedBranch.agencyId,
              }
            : undefined
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
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="animate-pulse">
          <td colSpan={9} className="p-4 border-b border-gray-100 dark:border-gray-700">
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
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

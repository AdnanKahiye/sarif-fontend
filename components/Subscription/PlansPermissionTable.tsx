"use client";

import React, { useEffect, useState, useCallback } from "react";
import PlanPermissionFormModal, { PlanPermissionFormData } from "./PlanPermissionFormModal";
import ConfirmDeleteModal from "../ui/Model/ConfirmDeleteModal";
import { SubscriptionService } from "@/lib/subcription";
import toast from "react-hot-toast";
import { usePermission } from "@/context/PermissionContext";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface RawPlanPermission {
  id: string;
  planId: string;
  planName: string;
  permissionId: number;
  permissionName: string;
  permissionKey: string;
  userId: string | null;
  userName: string;
}

interface GroupedPlanPermission {
  planId: string;
  planName: string;
  permissionAssignmentIds: string[];
  permissions: { id: number; name: string; key: string }[];
}

export default function PlanPermissionTable() {
  const { hasPermission } = usePermission();

  const [data, setData] = useState<GroupedPlanPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<GroupedPlanPermission | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async (page: number, searchQuery: string) => {
    setLoading(true);
    try {
      const res = await SubscriptionService.getPlanPermissions(page, itemsPerPage);
      const apiResponse = res.data?.data?.data as RawPlanPermission[];

      if (apiResponse) {
        const grouped: Record<string, GroupedPlanPermission> = {};
        apiResponse.forEach((item) => {
          if (!grouped[item.planId]) {
            grouped[item.planId] = {
              planId: item.planId,
              planName: item.planName,
              permissionAssignmentIds: [],
              permissions: [],
            };
          }
          grouped[item.planId].permissionAssignmentIds.push(item.id);
          grouped[item.planId].permissions.push({
            id: item.permissionId,
            name: item.permissionName,
            key: item.permissionKey,
          });
        });

        let finalData = Object.values(grouped);
        if (searchQuery) {
          finalData = finalData.filter((m) =>
            m.planName.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setData(finalData);
        setTotalItems(res.data?.data?.totalRecords || 0);
      }
    } catch {
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { loadData(currentPage, search); }, 400);
    return () => clearTimeout(timer);
  }, [currentPage, search, loadData]);

  const handleFormSubmit = async (formData: PlanPermissionFormData) => {
    try {
      const payload = {
        planId: formData.planId,
        permissionIds: formData.permissionIds
      };

      if (mode === "add") {
        await SubscriptionService.AssignPlanPermissions(payload);
        toast.success("Permissions assigned");
      } else {
        await SubscriptionService.UpdatePlanPermissions(selectedItem!.planId, payload);
        toast.success("Permissions updated");
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
      const idToRemove = selectedItem.permissionAssignmentIds[0];
      await SubscriptionService.deletePlanPermissions(idToRemove);
      toast.success("Permissions removed");
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
          <h2 className="text-[15px] font-bold dark:text-gray-200 uppercase tracking-wide">Plan Permissions</h2>
          <div className="text-[13px] font-medium hidden sm:block">
            Subscription <span className="text-gray-400 mx-1">&gt;</span> <span className="text-gray-400">Permissions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">

          <div className="border-b border-gray-100 dark:border-gray-700 p-4">
            <h3 className="text-[16px] font-semibold text-[#495057] dark:text-gray-300">Add, Edit & Remove</h3>
          </div>

          <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button onClick={() => { setMode("add"); setSelectedItem(null); setOpenModal(true); }} className="bg-[#0ab39c] hover:bg-[#099885] text-white px-4 py-2 rounded text-[13px] flex items-center gap-1 transition-all w-full sm:w-auto justify-center">
              <span className="text-lg">+</span> Add Permission
            </button>
            <div className="relative w-full sm:w-64">
              <input type="text" placeholder="Search plan..." className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded text-[13px] focus:outline-none focus:border-[#405189] dark:bg-gray-900 dark:text-white" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto relative">
            {loading && data.length > 0 && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#405189]" size={30} />
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f3f6f9] dark:bg-gray-700/50 text-[#878a99] text-[13px] font-bold uppercase border-y border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-3 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                  <th className="p-3">Plan Name</th>
                  <th className="p-3">Permissions</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading && data.length === 0 ? (
                  <SkeletonRows />
                ) : data.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-400 italic text-sm">No records found</td></tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.planId} className="text-[13px] dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                      <td className="p-3 font-semibold text-[#405189] dark:text-blue-400">{item.planName}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {item.permissions.map((p, idx) => (
                            <span key={idx} className="bg-[#0ab39c15] text-[#0ab39c] px-2 py-0.5 rounded text-[10px] font-bold uppercase">{p.name}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => { setMode("edit"); setSelectedItem(item); setOpenModal(true); }} className="bg-[#299cdb] text-white px-3 py-1 rounded text-[11px]">Edit</button>
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
              <p className="p-6 text-center text-gray-400 italic text-[13px]">No records found</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.map((item) => (
                  <div key={item.planId} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[14px] font-semibold text-[#405189] dark:text-blue-400">{item.planName}</span>
                      <span className="text-[11px] text-[#878a99]">{item.permissions.length} perms</span>
                    </div>
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-wider text-[#878a99] font-medium mb-1.5">Permissions</p>
                      <div className="flex flex-wrap gap-1">
                        {item.permissions.map((p, idx) => (
                          <span key={idx} className="bg-[#0ab39c15] text-[#0ab39c] px-2 py-0.5 rounded text-[10px] font-bold uppercase">{p.name}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <button onClick={() => { setMode("edit"); setSelectedItem(item); setOpenModal(true); }} className="bg-[#299cdb] text-white px-4 py-1.5 rounded text-[12px] flex-1">Edit</button>
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
              <button disabled={currentPage === 1 || loading} onClick={() => setCurrentPage(p => p - 1)} className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"><ChevronLeft size={14} /></button>
              {getPageNumbers().map((page, idx) =>
                page < 0 ? (
                  <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-[13px]">…</span>
                ) : (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center rounded text-[13px] ${currentPage === page ? "bg-[#405189] text-white" : "border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>{page}</button>
                )
              )}
              <button disabled={currentPage >= totalPages || loading} onClick={() => setCurrentPage(p => p + 1)} className="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      </div>

      <PlanPermissionFormModal
        open={openModal}
        mode={mode}
        initialData={selectedItem ? {
          planId: selectedItem.planId,
          permissionIds: selectedItem.permissions.map(p => p.id)
        } : undefined}
        onClose={() => setOpenModal(false)}
        onSubmit={handleFormSubmit}
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
          <td colSpan={4} className="p-4 border-b border-gray-100 dark:border-gray-700">
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
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="flex flex-wrap gap-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-14"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import RolePermissionFormModal, { RolePermissionFormData } from "./RolePermissionFormModal";
import ConfirmDeleteModal from "../ui/Model/ConfirmDeleteModal";
import { SetupService } from "@/lib/setup";
import toast from "react-hot-toast";
import { usePermission } from "@/context/PermissionContext";
import { Search, Loader2 } from "lucide-react";

// Matches your provided Role Permission JSON structure
interface RolePermissionDto {
  id: number;
  roleId: string;
  roleName: string;
  permissionId: number;
  permissionName: string;
  permissionKey: string;
  userName: string; // The user who assigned it
}

export default function RolePermissionTable() {
  const { hasPermission } = usePermission();
  const [data, setData] = useState<RolePermissionDto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<RolePermissionDto | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0); 
  const itemsPerPage = 10;

  const loadData = useCallback(async (page: number, searchQuery: string) => {
    setLoading(true);
    try {
      // Logic for: res.data.data.data
      const res = await SetupService.getRolePermissions(page, itemsPerPage);
      const apiResponse = res.data?.data;
      
      if (apiResponse) {
        const rawData = apiResponse.data || [];
        
        // Filtering by Role Name or Permission Name to keep search functional
        const filtered = rawData.filter((item: RolePermissionDto) => 
            item.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.permissionName.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setData(filtered);
        setTotalItems(apiResponse.totalRecords || 0);
      }
    } catch {
      toast.error("Failed to load role permissions");
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); 
  };

  const handleFormSubmit = async (formData: RolePermissionFormData) => {
    try {
      if (mode === "add") {
        await SetupService.assignRolePermissions(formData);
        toast.success("Permissions assigned successfully");
      } else {
        // Edit logic if applicable
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
      await SetupService.deleteRolePermission(selectedItem.id.toString());
      toast.success("Permission removed");
      setOpenDelete(false);
      loadData(currentPage, search);
    } catch {
      toast.error("Could not remove permission");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const canAdd = hasPermission("CREATE.USER");
  const canDelete = hasPermission("DELETE.USER");

  return (
    <div className="bg-[#f3f3f9] dark:bg-gray-900 min-h-screen p-4 sm:p-6 font-sans">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-[15px] font-bold text-[#495057] dark:text-gray-200 uppercase tracking-wide">Role Permissions</h2>
          <div className="text-[13px] text-[#495057] font-medium">
            Setup <span className="text-gray-400 mx-1">&gt;</span> <span className="text-gray-400">Role Permissions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 dark:border-gray-700 p-4">
            <h3 className="text-[16px] font-semibold text-[#495057] dark:text-gray-300">Roles & Permissions Management</h3>
          </div>

          <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              {canAdd && (
                <button
                  onClick={() => { setMode("add"); setSelectedItem(null); setOpenModal(true); }}
                  className="bg-[#0ab39c] hover:bg-[#099885] text-white px-4 py-2 rounded text-[13px] flex items-center gap-1 transition-all"
                >
                  <span className="text-lg">+</span> Assign Permissions
                </button>
              )}
            </div>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search role or permission..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded text-[13px] focus:outline-none focus:border-[#405189] dark:bg-gray-900"
                value={search}
                onChange={handleSearchChange}
              />
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
                  <th className="p-3">ID</th>
                  <th className="p-3">Role Name</th>
                  <th className="p-3">Permission</th>
                  <th className="p-3">Assigned By</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading && data.length === 0 ? (
                  <SkeletonRows />
                ) : data.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-gray-500 italic">No records found</td></tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="text-[13px] text-[#212529] dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <td className="p-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                      <td className="p-3 font-medium text-[#405189]">{item.id}</td>
                      <td className="p-3 font-semibold text-[#495057] dark:text-white">{item.roleName}</td>
                      <td className="p-3">
                        <span className="bg-[#0ab39c15] text-[#0ab39c] px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider">{item.permissionName}</span>
                      </td>
                      <td className="p-3"><span className="text-gray-700 dark:text-gray-300 font-medium">{item.userName}</span></td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          {canDelete && (
                            <button onClick={() => { setSelectedItem(item); setOpenDelete(true); }} className="bg-[#f06548] hover:bg-[#d95337] text-white px-3 py-1 rounded text-[11px] transition-colors">Remove</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-700 relative">
            {loading && data.length > 0 && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#405189]" size={30} />
              </div>
            )}
            {loading && data.length === 0 ? (
              [1,2,3].map(i => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              ))
            ) : data.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-[13px] italic">No records found</div>
            ) : (
              data.map((item) => (
                <div key={item.id} className="px-4 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-[#495057] dark:text-white">
                      #{item.id} — {item.roleName}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="bg-[#0ab39c15] text-[#0ab39c] px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">{item.permissionName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-gray-400">{item.userName}</span>
                    {canDelete && (
                      <button onClick={() => { setSelectedItem(item); setOpenDelete(true); }} className="bg-[#f06548] text-white px-2.5 py-1 rounded text-[11px] leading-none">Remove</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Footer */}
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-[13px] text-[#878a99]">
              Showing <span className="font-semibold">{startIndex}</span> to <span className="font-semibold">{endIndex}</span> of <span className="font-semibold">{totalItems}</span> Results
            </span>
            <div className="flex flex-wrap items-center gap-1">
              <button 
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded text-[13px] disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded text-[13px] transition-all ${currentPage === page ? "bg-[#405189] text-white" : "border border-gray-200 hover:bg-gray-50"}`}
                >
                  {page}
                </button>
              ))}
              <button 
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded text-[13px] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <RolePermissionFormModal 
        open={openModal} 
        mode={mode} 
        initialData={selectedItem ? {
          roleId: selectedItem.roleId,
          permissionIds: [selectedItem.permissionId],
        } : undefined} 
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
      {[1, 2, 3, 4, 5].map(i => (
        <tr key={i} className="animate-pulse">
          <td colSpan={6} className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </td>
        </tr>
      ))}
    </>
  );
}
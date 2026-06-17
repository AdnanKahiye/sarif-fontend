"use client";

import React, { useEffect, useState, useCallback } from "react";
import MenuPermissionFormModal, { RolePermissionFormData } from "./MenuPermissionFormModal";
import ConfirmDeleteModal from "../ui/Model/ConfirmDeleteModal";
import { SetupService } from "@/lib/setup";
import toast from "react-hot-toast";
import { usePermission } from "@/context/PermissionContext";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface MenuPermissionDto {
  menuId: number;
  menuTitle: string;
  parentId: number | null;
  parentTitle: string | null;
  permissions: string[];
  permissionKeys: string[];
}

export default function MenuPermissionTable() {
  const { hasPermission } = usePermission();
  
  // State
  const [data, setData] = useState<MenuPermissionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<MenuPermissionDto | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // --- GET Data ---
  const loadData = useCallback(async (page: number, searchQuery: string) => {
    setLoading(true);
    try {
      const res = await SetupService.getMenuPermissions(page, itemsPerPage);
      const apiResponse = res.data?.data;
      
      if (apiResponse) {
        let rawData = apiResponse.data || [];
        if (searchQuery) {
          rawData = rawData.filter((m: MenuPermissionDto) => 
            m.menuTitle.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setData(rawData);
        setTotalItems(apiResponse.totalRecords || 0);
      }
    } catch {
      toast.error("Failed to load permissions");
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

  // --- CRUD Actions ---
  const handleFormSubmit = async (formData: RolePermissionFormData) => {
    try {
      // Per Swagger: menuId is needed in the body
      // We take the first ID from menuIds or fall back to roleId
      const targetMenuId = Number(formData.menuIds?.[0] || formData.roleId);

      const payload = {
        menuId: targetMenuId,
        permissionIds: formData.permissionIds
      };

      if (mode === "add") {
        await SetupService.AssignMenuPermissions(payload);
        toast.success("Permissions assigned");
      } else {
        // Per Swagger: ID is required in the PATH /Setup/menu-permission/{id}
        await SetupService.UpdateMenuPermissions(targetMenuId, payload);
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
      // Per Swagger: ID is required in the PATH
      await SetupService.RemoveMenuPermissions(selectedItem.menuId);
      toast.success("Permissions removed");
      setOpenDelete(false);
      loadData(currentPage, search);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-[#f3f3f9] dark:bg-gray-900 min-h-screen p-4 sm:p-6 font-sans text-[#495057]">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold dark:text-gray-200 uppercase tracking-wide">Menu Permissions</h2>
          <div className="text-[13px] font-medium">
            Settings <span className="text-gray-400 mx-1">&gt;</span> <span className="text-gray-400">Permissions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <button
              onClick={() => { setMode("add"); setSelectedItem(null); setOpenModal(true); }}
              className="bg-[#0ab39c] hover:bg-[#099885] text-white px-4 py-2 rounded text-[13px] flex items-center gap-1 transition-all"
            >
              <span className="text-lg">+</span> Add Permission
            </button>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search menu..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded text-[13px] focus:outline-none focus:border-[#405189] dark:bg-gray-900 dark:text-white"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          {/* Table Body */}
          <div className="relative min-h-75">
            {loading && (
               <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 z-10 flex items-center justify-center">
                 <Loader2 className="animate-spin text-[#405189]" size={30} />
               </div>
            )}

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f3f6f9] dark:bg-gray-700/50 text-[#878a99] text-[13px] font-bold uppercase border-y border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                    <th className="p-3">Menu Title</th>
                    <th className="p-3">Parent Menu</th>
                    <th className="p-3">Available Permissions</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.length === 0 && !loading ? (
                    <tr><td colSpan={5} className="p-6 text-center text-gray-400 italic text-sm">No records found</td></tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.menuId} className="text-[13px] dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="p-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                        <td className="p-3 font-semibold text-[#405189] dark:text-blue-400">{item.menuTitle}</td>
                        <td className="p-3 text-gray-500">{item.parentTitle || "Root"}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {item.permissions.map((p, idx) => (
                              <span key={idx} className="bg-[#0ab39c15] text-[#0ab39c] px-2 py-0.5 rounded text-[10px] font-bold uppercase">{p}</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => { setMode("edit"); setSelectedItem(item); setOpenModal(true); }} className="bg-[#299cdb] text-white px-3 py-1 rounded text-[11px] shadow-sm hover:brightness-110">Edit</button>
                            <button onClick={() => { setSelectedItem(item); setOpenDelete(true); }} className="bg-[#f06548] text-white px-3 py-1 rounded text-[11px] shadow-sm hover:brightness-110">Remove</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-700">
              {data.length === 0 && !loading ? (
                <div className="p-6 text-center text-gray-400 italic text-sm">No records found</div>
              ) : (
                data.map((item) => (
                  <div key={item.menuId} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-[#405189] dark:text-blue-400 truncate">{item.menuTitle}</span>
                      <span className="text-[11px] text-gray-400 shrink-0">{item.parentTitle || "Root"}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.permissions.map((p, idx) => (
                        <span key={idx} className="bg-[#0ab39c15] text-[#0ab39c] px-2 py-0.5 rounded text-[10px] font-bold uppercase">{p}</span>
                      ))}
                    </div>
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => { setMode("edit"); setSelectedItem(item); setOpenModal(true); }} className="bg-[#299cdb] text-white px-2.5 py-1 rounded text-[11px] leading-none">Edit</button>
                      <button onClick={() => { setSelectedItem(item); setOpenDelete(true); }} className="bg-[#f06548] text-white px-2.5 py-1 rounded text-[11px] leading-none">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <span className="text-[13px] text-[#878a99]">
              Showing <span className="font-semibold">{startIndex}</span> to <span className="font-semibold">{endIndex}</span> of <span className="font-semibold">{totalItems}</span> Results
            </span>
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1.5 border border-gray-200 dark:border-gray-700 rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded text-[13px] transition-all ${
                    currentPage === page 
                      ? "bg-[#405189] text-white shadow-md font-bold" 
                      : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1.5 border border-gray-200 dark:border-gray-700 rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FIXED: Passing menuIds to resolve TypeScript error */}
      <MenuPermissionFormModal 
        open={openModal} 
        mode={mode} 
        initialData={selectedItem ? {
          roleId: selectedItem.menuId.toString(),
          menuIds: [selectedItem.menuId], // Added this to fix the missing property error
          permissionIds: [] // You can pass selectedItem.permissionIds here if available
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
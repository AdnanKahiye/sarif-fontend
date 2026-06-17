"use client";

import React, { useEffect, useState, useCallback } from "react";
import RoleFormModal, { RoleFormData } from "./RoleFormModal";
import ConfirmDeleteModal from "../ui/Model/ConfirmDeleteModal";
import { UsersService } from "@/lib/users";
import toast from "react-hot-toast";
import { usePermission } from "@/context/PermissionContext";
import { Search, Loader2 } from "lucide-react";

interface RoleDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  isActive: boolean;
  createdByUserName: string | null;
}

export default function RoleTable() {
  const { hasPermission } = usePermission();
  const [roles, setModules] = useState<RoleDto[]>([]); // Kept 'setModules' as per original
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0); 
  const itemsPerPage = 10;

  const loadRoles = useCallback(async (page: number, searchQuery: string) => {
    setLoading(true);
    try {
      const res = await UsersService.getRoles();
      const apiResponse = res.data?.data;
      if (apiResponse) {
        setModules(apiResponse.data || []);
        setTotalItems(apiResponse.totalRecords || 0);
      } else if (Array.isArray(res.data)) {
        setModules(res.data);
        setTotalItems(res.data.length);
      }
    } catch {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRoles(currentPage, search);
    }, 400);
    return () => clearTimeout(timer);
  }, [currentPage, search, loadRoles]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); 
  };

  const handleFormSubmit = async (data: RoleFormData) => {
    try {
      if (mode === "add") {
        await UsersService.createRole(data);
        toast.success("Role created successfully");
      } else {
        if (!selectedRole) return;
        // Correcting the Update payload to match your Service
        await UsersService.updateRole({
          roleId: selectedRole.id,
          name: data.roleName,
          description: data.description
        });
        toast.success("Role updated");
      }
      setOpenModal(false);
      loadRoles(currentPage, search);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const confirmDelete = async () => {
    if (!selectedRole) return;
    setDeleting(true);
    try {
      await UsersService.deleteRole(selectedRole.id);
      toast.success("Role removed");
      setOpenDelete(false);
      loadRoles(currentPage, search);
    } catch {
      toast.error("Could not delete role");
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

  return (
    <div className="bg-[#f3f3f9] dark:bg-gray-900 min-h-screen p-4 sm:p-6 font-sans">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-[#495057] dark:text-gray-200 uppercase tracking-wide">List Roles</h2>
          <div className="text-[13px] text-[#495057] font-medium">
            Tables <span className="text-gray-400 mx-1">&gt;</span> <span className="text-gray-400">List Roles</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 dark:border-gray-700 p-4">
            <h3 className="text-[16px] font-semibold text-[#495057] dark:text-gray-300">Add, Edit & Remove</h3>
          </div>

          <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              {canAdd && (
                <button
                  onClick={() => { setMode("add"); setSelectedRole(null); setOpenModal(true); }}
                  className="bg-[#0ab39c] hover:bg-[#099885] text-white px-4 py-2 rounded text-[13px] flex items-center gap-1 transition-all"
                >
                  <span className="text-lg">+</span> Add Role
                </button>
              )}
            </div>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded text-[13px] focus:outline-none focus:border-[#405189] dark:bg-gray-900 dark:text-gray-200"
                value={search}
                onChange={handleSearchChange}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          <div className="relative">
            {loading && roles.length > 0 && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#405189]" size={30} />
              </div>
            )}

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f3f6f9] dark:bg-gray-700/50 text-[#878a99] text-[13px] font-bold uppercase border-y border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                    <th className="p-3">Name</th>
                    <th className="p-3 text-center">description</th>
                    <th className="p-3 text-center">isActive</th>
                    <th className="p-3 text-center">CreateAt</th>
                    <th className="p-3 text-center">CreateBy</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {loading && roles.length === 0 ? (
                    <SkeletonRows />
                  ) : roles.length === 0 ? (
                    <tr><td colSpan={7} className="p-6 text-center text-gray-500">Xog lama helin</td></tr>
                  ) : (
                    roles.map((r) => (
                      <tr key={r.id} className="text-[13px] text-[#212529] dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <td className="p-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                        <td className="p-3 font-medium">{r.name}</td>
                        <td className="p-3 text-center text-gray-500">{r.description || "---"}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${r.isActive ? 'bg-[#0ab39c20] text-[#0ab39c]' : 'bg-[#f0654820] text-[#f06548]'}`}>
                            {r.isActive ? 'ACTIVE' : 'BLOCK'}
                          </span>
                        </td>
                        <td className="p-3 text-center text-gray-500">{new Date(r.createdAt).toLocaleDateString("en-GB")}</td>
                        <td className="p-3 text-center text-gray-500">{r.createdByUserName || "---"}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            {canEdit && (<button onClick={() => { setMode("edit"); setSelectedRole(r); setOpenModal(true); }} className="bg-[#299cdb] text-white px-3 py-1 rounded text-[11px]">Edit</button>)}
                            {canDelete && (<button onClick={() => { setSelectedRole(r); setOpenDelete(true); }} className="bg-[#f06548] text-white px-3 py-1 rounded text-[11px]">Remove</button>)}
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
              {loading && roles.length === 0 ? (
                <div className="p-6 text-center text-gray-400 animate-pulse">Loading...</div>
              ) : roles.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Xog lama helin</div>
              ) : (
                roles.map((r) => (
                  <div key={r.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-[#212529] dark:text-gray-300">{r.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.isActive ? 'bg-[#0ab39c20] text-[#0ab39c]' : 'bg-[#f0654820] text-[#f06548]'}`}>
                        {r.isActive ? 'ACTIVE' : 'BLOCK'}
                      </span>
                    </div>
                    {r.description && (
                      <div className="mb-1">
                        <span className="text-[11px] text-gray-500">{r.description}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-400">{r.createdByUserName || "---"} · {new Date(r.createdAt).toLocaleDateString("en-GB")}</span>
                      <div className="flex gap-1.5 shrink-0">
                        {canEdit && (<button onClick={() => { setMode("edit"); setSelectedRole(r); setOpenModal(true); }} className="bg-[#299cdb] text-white px-2.5 py-1 rounded text-[11px] leading-none">Edit</button>)}
                        {canDelete && (<button onClick={() => { setSelectedRole(r); setOpenDelete(true); }} className="bg-[#f06548] text-white px-2.5 py-1 rounded text-[11px] leading-none">Remove</button>)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="p-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
            <span className="text-[13px] text-[#878a99]">
              Showing <span className="font-semibold">{startIndex}</span> to <span className="font-semibold">{endIndex}</span> of <span className="font-semibold">{totalItems}</span> Results
            </span>
            <div className="flex items-center gap-1">
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
                  className={`px-3 py-1.5 rounded text-[13px] ${currentPage === page ? "bg-[#405189] text-white" : "border border-gray-200"}`}
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

      <RoleFormModal 
        open={openModal} 
        mode={mode} 
        initialData={selectedRole ? {
          roleName: selectedRole.name,
          description: selectedRole.description || "",
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
          <td colSpan={7} className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </td>
        </tr>
      ))}
    </>
  );
}
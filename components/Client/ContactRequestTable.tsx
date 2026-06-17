"use client";

import React, { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import ContactRequestModal, { ContactRequestFormData } from "./ContactRequestModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { UtilityService } from "@/lib/utils"; 
import toast from "react-hot-toast";

interface ContactRequestDto {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function ContactRequestTable() {
  const [requests, setRequests] = useState<ContactRequestDto[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedRequest, setSelectedRequest] = useState<ContactRequestDto | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadRequests();
  }, [currentPage]);

  async function loadRequests() {
    setLoading(true);
    try {
      const res = await UtilityService.getAllContactRequests(currentPage, pageSize);
      if (res.data.success) {
        const payload = res.data.data;
        setRequests(Array.isArray(payload.items) ? payload.items : []);
        setTotalPages(payload.totalPages || 1);
        setTotalCount(payload.totalCount || 0);
      } else {
        toast.error(res.data.message || "Failed to load requests");
        setRequests([]);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: ContactRequestFormData) {
    try {
      let res;
      if (mode === "add") {
        res = await UtilityService.createContactRequest(data);
      } else {
        if (!selectedRequest?.id) return;
        res = await UtilityService.updateContactRequest(selectedRequest.id, data);
      }

      if (res.data.success) {
        toast.success(res.data.message || "Operation successful");
        setOpenModal(false);
        loadRequests();
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  }

  async function confirmDelete() {
    if (!selectedRequest) return;
    try {
      setDeleting(true);
      const res = await UtilityService.deleteContactRequest(selectedRequest.id);
      if (res.data.success) {
        toast.success(res.data.message || "Request deleted successfully");
        setOpenDelete(false);
        loadRequests();
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  const filteredRequests = requests.filter((r) =>
    r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b bg-white gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Contact Requests</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Manage incoming digital inquiries.</p>
          </div>

          <button
            onClick={() => {
              setMode("add");
              setSelectedRequest(null);
              setOpenModal(true);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:transform active:scale-95 transition-all shadow-md shadow-indigo-100"
          >
            <span className="mr-2 text-lg">+</span> New Request
          </button>
        </div>

        {/* SEARCH AREA */}
        <div className="px-4 md:px-8 py-3 md:py-4 border-b bg-white">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search inquiries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* RESPONSIVE TABLE CONTAINER */}
        <div className="relative flex-grow">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] md:text-[11px] font-bold tracking-widest border-b">
              <tr>
                <th className="px-4 md:px-8 py-3">Sender</th>
                <th className="hidden sm:table-cell px-4 md:px-8 py-3">Contact</th>
                <th className="hidden md:table-cell px-4 md:px-8 py-3">Message</th>
                <th className="px-4 md:px-8 py-3">Status</th>
                <th className="px-4 md:px-8 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-medium text-xs text-gray-500">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-gray-400 text-xs">No records found</td>
                </tr>
              ) : (
                filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/30 transition-colors">
                    {/* Sender - Always Visible */}
                    <td className="px-4 md:px-8 py-3">
                      <div className="font-semibold text-gray-900 text-xs md:text-sm">{r.fullName}</div>
                      <div className="text-[10px] md:text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                      {/* Mobile-only sub-info if needed */}
                      <div className="sm:hidden text-[10px] text-indigo-500 mt-0.5 truncate max-w-[120px]">{r.email}</div>
                    </td>

                    {/* Contact Info - Hidden on smallest phones */}
                    <td className="hidden sm:table-cell px-4 md:px-8 py-3">
                      <div className="text-gray-700 font-medium text-xs md:text-sm">{r.email}</div>
                      <div className="text-gray-400 text-[10px] md:text-xs">{r.phone}</div>
                    </td>

                    {/* Message - Hidden on small/medium screens to save space */}
                    <td className="hidden md:table-cell px-4 md:px-8 py-3 max-w-xs">
                      <p className="text-gray-600 text-xs line-clamp-1" title={r.message}>{r.message}</p>
                    </td>

                    {/* Status - Always Visible */}
                    <td className="px-4 md:px-8 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] md:text-[10px] font-bold ring-1 ring-inset ${
                        r.status === 'Pending' 
                          ? 'bg-amber-50 text-amber-700 ring-amber-600/20' 
                          : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${r.status === 'Pending' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                        {r.status || "New"}
                      </span>
                    </td>

                    {/* Actions - Always Visible */}
                    <td className="px-4 md:px-8 py-3">
                      <div className="flex items-center justify-center gap-1.5 md:gap-2">
                        <button
                          onClick={() => { setMode("edit"); setSelectedRequest(r); setOpenModal(true); }}
                          className="p-1.5 md:p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-100/30 transition-all"
                        >
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => { setSelectedRequest(r); setOpenDelete(true); }}
                          className="p-1.5 md:p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100/30 transition-all"
                        >
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          {/* Mobile cards */}
          <div className="block md:hidden divide-y divide-gray-100">
            {loading ? (
              <div className="py-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium text-xs text-gray-500">Loading...</span>
                </div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-400 text-xs">No records found</div>
            ) : filteredRequests.map((r) => (
              <div key={r.id} className="px-4 py-3 hover:bg-gray-50/30 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-xs truncate">{r.fullName}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ring-inset shrink-0 ${r.status === 'Pending' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'}`}>
                    <span className={`w-1 h-1 rounded-full ${r.status === 'Pending' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    {r.status || "New"}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 mb-1 truncate">{r.email} · {r.phone}</div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] text-gray-500 line-clamp-1 flex-1">{r.message}</p>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => { setMode("edit"); setSelectedRequest(r); setOpenModal(true); }} className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-100/30 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => { setSelectedRequest(r); setOpenDelete(true); }} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100/30 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="px-4 md:px-8 py-4 border-t bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[10px] md:text-xs text-gray-500 order-2 sm:order-1">
            Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-semibold text-gray-900">{totalCount}</span>
          </div>

          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition text-[10px] md:text-xs font-bold text-gray-600"
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition text-[10px] md:text-xs font-bold text-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ContactRequestModal
        open={openModal}
        mode={mode}
        initialData={selectedRequest ? { ...selectedRequest, id: selectedRequest.id } : undefined}
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
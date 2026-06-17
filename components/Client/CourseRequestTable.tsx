"use client";

import React, { useEffect, useState } from "react";
import CourseRequestModal from "./CourseRequestModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { CoursesService } from "@/lib/courses"; 
import toast from "react-hot-toast";
import { BookOpen, User, UserPlus, Trash2, Search, Loader2, Edit3 } from "lucide-react";

interface CourseRequestDto {
  id: string;
  status: string;
  paymentStatus: string;
  coursePrice: number;
  discountAmount: number;
  paidAmount: number;
  remainingAmount: number;
  studentName: string;
  studentId: string;
  courseTitle: string;
  courseType: string;
  createdAt: string;
}

export default function CourseRequestTable() {
  const [requests, setRequests] = useState<CourseRequestDto[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedRequest, setSelectedRequest] = useState<CourseRequestDto | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);

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
      const res = await CoursesService.getAllRequests(currentPage, pageSize);
      if (res.data.success) {
        const payload = res.data.data;
        setRequests(Array.isArray(payload.items) ? payload.items : []);
        setTotalPages(payload.totalPages || 1);
        setTotalCount(payload.totalCount || 0);
      } else {
        toast.error(res.data.message || "Failed to load requests");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignStudent(userId: string) {
    if (!userId) {
      toast.error("Invalid Student ID");
      return;
    }

    setAssigningId(userId);
    try {
      const res = await CoursesService.assignUserToStudent({ userId });
      if (res.data.success) {
        toast.success(res.data.message || "User successfully assigned as student!");
        loadRequests(); 
      } else {
        toast.error(res.data.message || "Assignment failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Internal Server Error");
    } finally {
      setAssigningId(null);
    }
  }

  async function handleSubmit(data: any) {
    try {
      let res;
      if (mode === "add") {
        res = await CoursesService.createRequest(data);
      } else {
        if (!selectedRequest?.id) return;
        res = await CoursesService.updateRequest(selectedRequest.id, data);
      }

      if (res.data.success) {
        toast.success(res.data.message || "Operation successful");
        setOpenModal(false);
        loadRequests();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  }

  async function confirmDelete() {
    if (!selectedRequest) return;
    try {
      setDeleting(true);
      const res = await CoursesService.deleteRequest(selectedRequest.id);
      if (res.data.success) {
        toast.success("Enrollment deleted successfully");
        setOpenDelete(false);
        loadRequests();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const filteredRequests = requests.filter((r) =>
    r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    r.courseTitle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b bg-white gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Course Enrollments</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">Manage student requests and assign profiles.</p>
          </div>

          <button
            onClick={() => { setMode("add"); setSelectedRequest(null); setOpenModal(true); }}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all"
          >
            + New Request
          </button>
        </div>

        {/* SEARCH AREA */}
        <div className="px-4 md:px-8 py-3 md:py-4 border-b bg-white">
          <div className="relative w-full max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search student or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="relative">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[950px]">
            <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] font-bold tracking-widest border-b">
              <tr>
                <th className="px-6 py-4 text-center w-16">#</th>
                <th className="px-6 py-4">Student & Course</th>
                <th className="px-6 py-4 text-center">Pricing</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-xs text-gray-400 mt-2 font-medium">Fetching records...</p>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-400">No enrollment requests found.</td></tr>
              ) : (
                filteredRequests.map((r, index) => (
                  <tr key={r.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-4 text-center font-medium text-gray-400">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                           <User size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm capitalize">{r.studentName || "N/A"}</div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                            <BookOpen size={12} className="text-gray-400" />
                            <span className="font-medium text-indigo-600">{r.courseTitle}</span>
                            <span className="text-gray-300 mx-1">•</span>
                            <span>{r.courseType}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <div className="text-xs font-bold text-gray-900">${r.coursePrice}</div>
                        <div className="text-[10px] font-medium text-emerald-600">Paid: ${r.paidAmount}</div>
                        {r.remainingAmount > 0 && (
                          <div className="text-[10px] font-medium text-rose-500">Bal: ${r.remainingAmount}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'Pending' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'}`}>
                          {r.status}
                        </span>
                        <span className={`text-[10px] font-semibold ${r.paymentStatus === 'Unpaid' ? 'text-rose-500' : 'text-emerald-500'}`}>
                           {r.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* 1. ASSIGN ACTION */}
                        <button
                          onClick={() => handleAssignStudent(r.studentId)}
                          disabled={assigningId === r.studentId}
                          title="Assign as Student"
                          className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all disabled:opacity-50"
                        >
                          {assigningId === r.studentId ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <UserPlus size={16} />
                          )}
                        </button>

                        {/* 2. EDIT ACTION */}
                        <button
                          onClick={() => { setMode("edit"); setSelectedRequest(r); setOpenModal(true); }}
                          title="Edit Request"
                          className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"
                        >
                          <Edit3 size={16} />
                        </button>

                        {/* 3. DELETE ACTION */}
                        <button
                          onClick={() => { setSelectedRequest(r); setOpenDelete(true); }}
                          title="Delete Request"
                          className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
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
              <div className="py-10 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                <p className="text-xs text-gray-400 mt-2">Fetching records...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="py-10 text-center text-gray-400">No enrollment requests found.</div>
            ) : filteredRequests.map((r, index) => (
              <div key={r.id} className="px-4 py-3 hover:bg-gray-50/40 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <User size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 text-sm capitalize truncate">{r.studentName || "N/A"}</div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <BookOpen size={11} className="text-gray-400 shrink-0" />
                        <span className="font-medium text-indigo-600 truncate">{r.courseTitle}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${r.status === 'Pending' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'}`}>{r.status}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-3 text-xs">
                    <span className="font-bold text-gray-900">${r.coursePrice}</span>
                    <span className="text-emerald-600 font-medium">Paid: ${r.paidAmount}</span>
                    {r.remainingAmount > 0 && <span className="text-rose-500 font-medium">Bal: ${r.remainingAmount}</span>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => handleAssignStudent(r.studentId)} disabled={assigningId === r.studentId} title="Assign as Student" className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all disabled:opacity-50">
                      {assigningId === r.studentId ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                    </button>
                    <button onClick={() => { setMode("edit"); setSelectedRequest(r); setOpenModal(true); }} title="Edit" className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"><Edit3 size={14} /></button>
                    <button onClick={() => { setSelectedRequest(r); setOpenDelete(true); }} title="Delete" className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PAGINATION */}
        <div className="px-8 py-4 border-t bg-white flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Total Enrollments: <span className="font-bold text-gray-900">{totalCount}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-indigo-600 px-3">Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <CourseRequestModal
        open={openModal}
        mode={mode}
        initialData={selectedRequest}
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
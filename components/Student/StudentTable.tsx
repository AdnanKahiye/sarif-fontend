"use client";

import React, { useEffect, useState, useCallback } from "react";
import { StudentService } from "@/lib/students"; 
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import StudentModal, { StudentFormData } from "./StudentModal"; 
import EnrollStudentModal from "./EnrollStudentModal"; 
import AssignCourseTypesModal from "./AssignCourseTypesModal";
import toast from "react-hot-toast";
import { 
  User, 
  Mail, 
  BookOpen, 
  Edit3, 
  Trash2, 
  Search, 
  Loader2, 
  PlusCircle, 
  UserPlus,
  ShieldCheck
} from "lucide-react";

// MATCHED INTERFACE: Updated to support the 'courses' array from your JSON
interface StudentCourse {
  courseId: string;
  courseName: string;
}

interface StudentDto {
  id: string;
  userId: string;
  userName: string;
  email: string;
  isActive: boolean;
  courses: StudentCourse[]; // Updated from single courseId/courseName
}

export default function StudentTable() {
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [openDelete, setOpenDelete] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openEnroll, setOpenEnroll] = useState(false);
  const [openAssignTypes, setOpenAssignTypes] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await StudentService.getStudents(currentPage, pageSize);
      if (res.data.success) {
        const payload = res.data.data;
        setStudents(payload.items || []);
        setTotalPages(payload.totalPages || 1);
        setTotalCount(payload.totalCount || 0);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  /* --- Action Handlers --- */

  const handleAddClick = () => {
    setModalMode("add");
    setSelectedStudent(null);
    setOpenForm(true);
  };

  const handleEditClick = (student: StudentDto) => {
    setModalMode("edit");
    setSelectedStudent(student);
    setOpenForm(true);
  };

  const handleEnrollClick = (student: StudentDto) => {
    setSelectedStudent(student);
    setOpenEnroll(true);
  };

  const handleAssignClick = (student: StudentDto) => {
    setSelectedStudent(student);
    setOpenAssignTypes(true);
  };

  const handleDeleteClick = (student: StudentDto) => {
    setSelectedStudent(student);
    setOpenDelete(true);
  };

  const handleFormSubmit = async (formData: StudentFormData) => {
    try {
      if (modalMode === "add") {
        await StudentService.createStudent({ userId: formData.userId });
        toast.success("Student registered successfully");
      } else {
        await StudentService.updateStudent({ 
          id: selectedStudent!.id, 
          isActive: formData.isActive 
        });
        toast.success("Student status updated");
      }
      loadStudents();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Operation failed");
      throw err; 
    }
  };

  async function confirmDelete() {
    if (!selectedStudent) return;
    try {
      const res = await StudentService.deleteStudent(selectedStudent.id);
      if (res.data.success) {
        toast.success("Student removed successfully");
        setOpenDelete(false);
        loadStudents();
      }
    } catch (err: any) {
      toast.error("Delete failed");
    }
  }

  const filteredStudents = students.filter((s) =>
    s.userName?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-3 md:p-6 text-gray-900">
      <div className="max-w-7xl mx-auto bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b bg-white gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Registered Students</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">Manage student academic records and course assignments.</p>
          </div>
          <button 
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
          >
            <UserPlus size={18} />
            Add Student
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
              placeholder="Search by name or email..."
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
          <table className="w-full text-sm text-left border-collapse min-w-[800px]">
            <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] font-bold tracking-widest border-b">
              <tr>
                <th className="px-6 py-4">Student Information</th>
                <th className="px-6 py-4">Enrolled Courses</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-xs text-gray-400 mt-2">Loading data...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center text-gray-400">No students found.</td></tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                           {s.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm capitalize">{s.userName}</div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-500">
                            <Mail size={12} /> {s.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[300px]">
                        {s.courses && s.courses.length > 0 ? (
                          s.courses.map((c) => (
                            <span key={c.courseId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium border border-indigo-100">
                              <BookOpen size={10} />
                              {c.courseName}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-300 italic text-xs">No Courses</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ring-1 ring-inset ${
                        s.isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-rose-50 text-rose-700 ring-rose-600/20'
                      }`}>
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEnrollClick(s)}
                          title="Enroll in Course"
                          className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all"
                        >
                          <PlusCircle size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleAssignClick(s)}
                          title="Assign Course Types"
                          className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all"
                        >
                          <ShieldCheck size={16} />
                        </button>

                        <button
                          onClick={() => handleEditClick(s)}
                          title="Edit Student"
                          className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(s)}
                          title="Remove Student"
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
                <p className="text-xs text-gray-400 mt-2">Loading data...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-10 text-center text-gray-400">No students found.</div>
            ) : filteredStudents.map((s) => (
              <div key={s.id} className="px-4 py-3 hover:bg-gray-50/40 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                      {s.userName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 text-sm capitalize truncate">{s.userName}</div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 truncate">
                        <Mail size={10} /> {s.email}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 ring-inset shrink-0 ${s.isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-rose-50 text-rose-700 ring-rose-600/20'}`}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {s.courses && s.courses.length > 0 ? (
                    s.courses.map((c) => (
                      <span key={c.courseId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium border border-indigo-100">
                        <BookOpen size={9} /> {c.courseName}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-300 italic text-xs">No Courses</span>
                  )}
                </div>
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => handleEnrollClick(s)} title="Enroll in Course" className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all"><PlusCircle size={14} /></button>
                  <button onClick={() => handleAssignClick(s)} title="Assign Course Types" className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all"><ShieldCheck size={14} /></button>
                  <button onClick={() => handleEditClick(s)} title="Edit Student" className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"><Edit3 size={14} /></button>
                  <button onClick={() => handleDeleteClick(s)} title="Remove Student" className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PAGINATION */}
        <div className="px-8 py-4 border-t bg-white flex items-center justify-between">
          <p className="text-xs text-gray-500">Total: {totalCount}</p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-indigo-600 px-3">Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Assign Course Types Modal: Pass the ID of the FIRST course if available */}
   {/* Updated Modal Call */}
<AssignCourseTypesModal
  open={openAssignTypes}
  studentId={selectedStudent?.id || ""}
  // Pass all courses instead of just the first one
  courses={selectedStudent?.courses || []} 
  studentName={selectedStudent?.userName || ""}
  onClose={() => setOpenAssignTypes(false)}
  onSuccess={loadStudents}
/>

      <EnrollStudentModal
        open={openEnroll}
        studentId={selectedStudent?.id || ""}
        studentName={selectedStudent?.userName || ""}
        onClose={() => setOpenEnroll(false)}
        onSuccess={loadStudents}
      />

      <StudentModal
        open={openForm}
        mode={modalMode}
        initialData={selectedStudent ? { 
            id: selectedStudent.id, 
            userId: selectedStudent.userId, 
            isActive: selectedStudent.isActive 
        } : undefined}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDeleteModal
        open={openDelete}
        loading={false}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import TeamMemberModal from "./TeamMemberModal";
import { UsersService } from "@/lib/users"; 
import toast from "react-hot-toast";
import { Edit3, Trash2, Linkedin, Globe, Search, Phone } from "lucide-react"; 

// Updated to match your exact API Response Body
interface TeamMemberDto {
  id: string;
  name: string | null;
  phone: string | null;
  title: string;
  description: string;
  coverImageUrl: string;
  status: string | null;
  linkedin: string | null;
  facebook: string | null;
  website: string | null; // Changed from instagram to website
  createdAt: string;
}

export default function TeamMemberTable() {
  const [members, setMembers] = useState<TeamMemberDto[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedMember, setSelectedMember] = useState<TeamMemberDto | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadMembers();
  }, [currentPage]);

  async function loadMembers() {
    setLoading(true);
    try {
      const res = await UsersService.getAllTeamMembers(currentPage, pageSize);
      if (res.data.success) {
        const payload = res.data.data; 
        setMembers(payload.items || []);
        setTotalPages(payload.totalPages || 1);
        setTotalCount(payload.totalCount || 0);
      }
    } catch (err: any) {
      toast.error("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = members.filter((m) =>
    (m.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (data: any) => {
    try {
      if (mode === "add") {
        await UsersService.createTeamMember(data);
        toast.success("Member added successfully");
      } else {
        if (!selectedMember?.id) return;
        await UsersService.updateTeamMember(selectedMember.id, data);
        toast.success("Profile updated successfully");
      }
      setOpenModal(false);
      loadMembers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Check your input fields";
      console.error("400 Error Details:", err.response?.data);
      toast.error(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-6 text-[#4B5563]">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
        
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Team Management</h2>
            <p className="text-sm text-gray-500">Manage your digital agency team profiles.</p>
          </div>
          <button
            onClick={() => { setMode("add"); setSelectedMember(null); setOpenModal(true); }}
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 w-fit"
          >
            <span className="text-xl">+</span> Add Member
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or role..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="relative">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white text-[11px] font-bold text-[#6B7280] uppercase tracking-widest border-b">
              <tr>
                <th className="px-6 py-4">Profile</th>
                <th className="px-6 py-4">Bio & Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Networks</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-400">Loading directory...</td></tr>
              ) : filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={m.coverImageUrl || "https://via.placeholder.com/40"} 
                        className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-gray-100" 
                        alt={m.title}
                      />
                      <div>
                        <div className="font-bold text-[#111827] text-sm leading-none mb-1">{m.title}</div>
                        <div className="text-[11px] text-gray-400 font-medium">{m.name || "User"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-500 line-clamp-1 italic">"{m.description}"</p>
                      {m.phone && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Phone size={10} /> {m.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FB923C] mr-2"></span>
                      {m.status || "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {m.linkedin && <div className="p-1 rounded bg-blue-50 text-blue-600"><Linkedin size={12} /></div>}
                      {m.facebook && <div className="p-1 rounded bg-indigo-50 text-indigo-600"><Globe size={12} /></div>}
                      {m.website && <div className="p-1 rounded bg-gray-50 text-gray-600"><Globe size={12} /></div>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-3">
                      <button 
                        onClick={() => { setMode("edit"); setSelectedMember(m); setOpenModal(true); }}
                        className="p-2.5 bg-[#EEF2FF] text-[#4F46E5] rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => { setSelectedMember(m); setOpenDelete(true); }}
                        className="p-2.5 bg-[#FFF1F2] text-[#E11D48] rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
                      >
                        <Trash2 size={18} />
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
              <div className="py-10 text-center text-gray-400">Loading directory...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-10 text-center text-gray-400">No members found.</div>
            ) : filteredMembers.map((m) => (
              <div key={m.id} className="px-4 py-4 hover:bg-gray-50/30 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <img src={m.coverImageUrl || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-gray-100 shrink-0" alt={m.title} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#111827] text-sm leading-none mb-1">{m.title}</div>
                    <div className="text-[11px] text-gray-400 font-medium">{m.name || "User"}</div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FB923C] mr-2"></span>
                    {m.status || "Active"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {m.linkedin && <div className="p-1 rounded bg-blue-50 text-blue-600"><Linkedin size={12} /></div>}
                    {m.facebook && <div className="p-1 rounded bg-indigo-50 text-indigo-600"><Globe size={12} /></div>}
                    {m.website && <div className="p-1 rounded bg-gray-50 text-gray-600"><Globe size={12} /></div>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setMode("edit"); setSelectedMember(m); setOpenModal(true); }} className="p-2.5 bg-[#EEF2FF] text-[#4F46E5] rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"><Edit3 size={16} /></button>
                    <button onClick={() => { setSelectedMember(m); setOpenDelete(true); }} className="p-2.5 bg-[#FFF1F2] text-[#E11D48] rounded-xl hover:bg-rose-100 transition-colors shadow-sm"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PAGINATION */}
        <div className="p-5 border-t bg-white flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing <span className="font-bold text-[#111827]">{currentPage}</span> to <span className="font-bold text-[#111827]">{totalPages}</span> of {totalCount} members
          </span>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-600 disabled:opacity-40 transition-all"
            >
              Previous
            </button>
            <div className="w-9 h-9 flex items-center justify-center bg-[#4F46E5] text-white rounded-xl text-sm font-bold">
              {currentPage}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-600 disabled:opacity-40 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <TeamMemberModal
        open={openModal}
        mode={mode}
        initialData={selectedMember}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={async () => {
          try {
            await UsersService.deleteTeamMember(selectedMember!.id);
            toast.success("Member removed");
            setOpenDelete(false);
            loadMembers();
          } catch (err) {
            toast.error("Delete failed");
          }
        }}
      />
    </div>
  );
}
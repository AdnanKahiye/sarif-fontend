"use client";

import React, { useEffect, useState } from "react";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import BlogModal, { BlogFormData } from "./BlogModal"; 
import { BlogService, BlogItem } from "@/lib/blog"; 
import toast from "react-hot-toast";
import Link from "next/link"; 
import { Edit3, Trash2, Search, Eye, Sparkles, FileText, CheckCircle2, Clock } from "lucide-react"; 

export default function BlogTable() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadBlogs();
  }, [currentPage]);

  async function loadBlogs() {
    setLoading(true);
    try {
      const res = await BlogService.getBlogs(currentPage, pageSize);
      if (res.data.success) {
        const payload = res.data.data; 
        setBlogs(payload.items || []);
        setTotalPages(payload.totalPages || 1);
        setTotalCount(payload.totalCount || 0);
      }
    } catch (err: any) {
      toast.error("Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  }

  const filteredBlogs = blogs.filter((b) =>
    (b.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.categoryName || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (formData: BlogFormData) => {
    setLoading(true);
    try {
      // FIX: We pass the raw formData object. 
      // The BlogService.createBlog/updateBlog handles the FormData conversion.
      if (mode === "add") {
        await BlogService.createBlog(formData as any); 
        toast.success("Article published!");
      } else {
        if (!selectedBlog?.id) return;
        await BlogService.updateBlog(selectedBlog.id, formData as any);
        toast.success("Article updated!");
      }
      setOpenModal(false);
      loadBlogs();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Check your input fields";
      toast.error(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-6 text-[#4B5563]">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b gap-4 bg-white">
          <div>
            <h2 className="text-2xl font-black text-[#090044] tracking-tight">Editorial Content</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage articles and news</p>
          </div>
          <button
            onClick={() => { setMode("add"); setSelectedBlog(null); setOpenModal(true); }}
            className="bg-[#00bf63] hover:bg-[#090044] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
          >
            + New Article
          </button>
        </div>

        {/* FILTERS */}
        <div className="p-4 border-b bg-gray-50/30">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input
              type="text"
              placeholder="Filter by title or category..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00bf63]/10 focus:border-[#00bf63] outline-none transition-all text-sm font-medium"
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
            <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">
              <tr>
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Stats</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center font-bold text-gray-300 animate-pulse uppercase text-xs">Fetching Library...</td></tr>
              ) : filteredBlogs.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-400 text-sm">No articles found.</td></tr>
              ) : filteredBlogs.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={b.imageUrl || "/placeholder.png"} 
                        className="w-14 h-10 rounded-lg object-cover shadow-sm border border-gray-100 flex-shrink-0" 
                        alt="" 
                      />
                      <div>
                        <div className="font-bold text-[#090044] text-sm line-clamp-1 group-hover:text-[#00bf63] transition-colors">{b.title}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">{new Date(b.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-[#090044] bg-gray-100 px-3 py-1 rounded-full border border-gray-200 flex items-center w-fit gap-1.5 uppercase">
                      <Sparkles size={10} className="text-[#00bf63]" /> {b.categoryName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {b.isPublished ? (
                      <span className="inline-flex items-center text-[10px] font-black uppercase text-[#00bf63] tracking-widest gap-1">
                        <CheckCircle2 size={12} /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-black uppercase text-amber-500 tracking-widest gap-1">
                        <Clock size={12} /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-gray-400">
                       <div className="flex items-center gap-1"><Eye size={14}/> <span className="text-xs font-bold">{b.viewsCount || 0}</span></div>
                       <div className="flex items-center gap-1"><FileText size={14}/> <span className="text-xs font-bold">{b.commentsCount || 0}</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2">
                      <button 
                        onClick={() => { setMode("edit"); setSelectedBlog(b); setOpenModal(true); }}
                        className="p-2 text-gray-400 hover:text-[#00bf63] hover:bg-[#00bf63]/5 rounded-lg transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => { setSelectedBlog(b); setOpenDelete(true); }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
              <div className="py-20 text-center font-bold text-gray-300 animate-pulse uppercase text-xs">Fetching Library...</div>
            ) : filteredBlogs.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">No articles found.</div>
            ) : filteredBlogs.map((b) => (
              <div key={b.id} className="px-4 py-3 hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={b.imageUrl || "/placeholder.png"} className="w-10 h-7 rounded object-cover shadow-sm border border-gray-100 shrink-0" alt="" />
                    <span className="font-bold text-[#090044] text-sm line-clamp-1 group-hover:text-[#00bf63] transition-colors">{b.title}</span>
                  </div>
                  {b.isPublished ? (
                    <span className="inline-flex items-center text-[10px] font-black uppercase text-[#00bf63] tracking-widest gap-1 shrink-0"><CheckCircle2 size={10} /> Live</span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-black uppercase text-amber-500 tracking-widest gap-1 shrink-0"><Clock size={10} /> Draft</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-[#090044] bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 flex items-center gap-1 uppercase">
                      <Sparkles size={9} className="text-[#00bf63]" /> {b.categoryName}
                    </span>
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="flex items-center gap-0.5"><Eye size={12}/> <span className="text-xs font-bold">{b.viewsCount || 0}</span></div>
                      <div className="flex items-center gap-0.5"><FileText size={12}/> <span className="text-xs font-bold">{b.commentsCount || 0}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { setMode("edit"); setSelectedBlog(b); setOpenModal(true); }} className="p-1.5 text-gray-400 hover:text-[#00bf63] hover:bg-[#00bf63]/5 rounded-lg transition-all"><Edit3 size={16} /></button>
                    <button onClick={() => { setSelectedBlog(b); setOpenDelete(true); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PAGINATION */}
        <div className="p-6 border-t bg-white flex items-center justify-between">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-3">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30"
            >
              Back
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-[#090044] text-white rounded-lg hover:bg-[#00bf63] disabled:opacity-30 shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL COMPONENTS */}
      <BlogModal
        open={openModal}
        mode={mode}
        initialData={selectedBlog || undefined}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={async () => {
          if (!selectedBlog) return;
          try {
            await BlogService.deleteBlog(selectedBlog.id);
            toast.success("Article deleted");
            setOpenDelete(false);
            loadBlogs();
          } catch (err) {
            toast.error("Delete failed");
          }
        }}
      />
    </div>
  );
}
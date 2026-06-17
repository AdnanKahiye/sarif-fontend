"use client";

import React, { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import ServicesFormModal, { ServiceFormData } from "./ServicesFormModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { CustomerService } from "@/lib/customers";
import toast from "react-hot-toast";

interface ServiceDto {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function ServicesTable() {
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedService, setSelectedService] =
    useState<ServiceDto | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    try {
      const res = await CustomerService.getAllServices();

      if (res.data.success) {
        const data = res.data.data;

        if (Array.isArray(data)) {
          setServices(data);
        } else if (Array.isArray(data?.data)) {
          setServices(data.data);
        } else {
          setServices([]);
        }
      } else {
        toast.error(res.data.message || "Failed to load services");
        setServices([]);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: ServiceFormData) {
    try {
      let res;

      if (mode === "add") {
        res = await CustomerService.createService(data);
      } else {
        if (!selectedService?.id) return;
        res = await CustomerService.updateService(
          selectedService.id,
          data
        );
      }

      if (res.data.success) {
        toast.success(res.data.message || "Operation successful");
        setOpenModal(false);
        loadServices();
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  }

  async function confirmDelete() {
    if (!selectedService) return;

    try {
      setDeleting(true);
      const res = await CustomerService.deleteService(selectedService.id);

      if (res.data.success) {
        toast.success(res.data.message || "Service deleted successfully");
        setOpenDelete(false);
        loadServices();
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  const filteredServices = Array.isArray(services)
    ? services.filter((s) =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-4 md:py-5 border-b bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Services
            </h2>
            <p className="text-sm text-gray-500">
              Manage service offerings
            </p>
          </div>

          <button
            onClick={() => {
              setMode("add");
              setSelectedService(null);
              setOpenModal(true);
            }}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl
                       hover:bg-indigo-700 transition shadow-sm"
          >
            + Add New
          </button>
        </div>

        {/* SEARCH */}
        <div className="px-4 md:px-6 py-4 border-b bg-gray-50">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full text-sm"
            />
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Description</th>
                <th className="px-6 py-4 text-left">Created At</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">Loading services...</td></tr>}
              {!loading && filteredServices.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">No services found</td></tr>}
              {filteredServices.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{s.name}</td>
                  <td className="px-6 py-4 text-gray-600">{s.description}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(s.createdAt).toISOString().split("T")[0]}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => { setMode("edit"); setSelectedService(s); setOpenModal(true); }} className="px-3 py-1 rounded-lg text-indigo-600 hover:bg-indigo-50 transition font-medium">Edit</button>
                      <button onClick={() => { setSelectedService(s); setOpenDelete(true); }} className="px-3 py-1 rounded-lg text-red-600 hover:bg-red-50 transition font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="block md:hidden divide-y divide-gray-100">
          {loading && [1,2,3].map(i => (
            <div key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-full"></div>
            </div>
          ))}
          {!loading && filteredServices.length === 0 && (
            <div className="p-6 text-center text-gray-400 text-sm">No services found</div>
          )}
          {!loading && filteredServices.map((s) => (
            <div key={s.id} className="px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[13px] font-semibold text-gray-800">{s.name}</span>
                <span className="text-[11px] text-gray-400">{new Date(s.createdAt).toISOString().split("T")[0]}</span>
              </div>
              <p className="text-[12px] text-gray-500 truncate mb-2">{s.description}</p>
              <div className="flex justify-end gap-1.5">
                <button onClick={() => { setMode("edit"); setSelectedService(s); setOpenModal(true); }} className="bg-indigo-600 text-white px-2.5 py-1 rounded text-[11px] leading-none">Edit</button>
                <button onClick={() => { setSelectedService(s); setOpenDelete(true); }} className="bg-red-500 text-white px-2.5 py-1 rounded text-[11px] leading-none">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="px-4 md:px-6 py-4 border-t bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing {filteredServices.length} of {services.length} entries
          </p>
        </div>

      </div>

      <ServicesFormModal
        open={openModal}
        mode={mode}
        initialData={selectedService ?? undefined}
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

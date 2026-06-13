"use client";

import React, { useEffect, useState, useCallback } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { X, Save } from "lucide-react";
import { SetupService } from "@/lib/setup";

export interface BranchFormData {
  name: string;
  location: string;
  isMain: boolean;
  agencyId: string;
}

interface Props {
  open: boolean;
  mode: "add" | "edit";
  initialData?: BranchFormData;
  onClose: () => void;
  onSubmit: (data: BranchFormData) => void;
}

const emptyForm: BranchFormData = {
  name: "",
  location: "",
  isMain: false,
  agencyId: "",
};

export default function BranchFormModal({ open, mode, initialData, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<BranchFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof BranchFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [agencies, setAgencies] = useState<{ id: string; name: string }[]>([]);
  const [agencyLoading, setAgencyLoading] = useState(false);

  // FETCH Agencies FROM API
  useEffect(() => {
    const fetchCats = async () => {
      try {
        setAgencyLoading(true);
        const res = await SetupService.getAgencies(1, 100);
        if (res.data?.success) {
           const apiResponse = res.data?.data;
          setAgencies(apiResponse.data || []);
        }
      } catch (err) {
        console.error("Failed to load agencies", err);
      } finally {
        setAgencyLoading(false);
      }
    };

    if (open) fetchCats();
  }, [open]);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setForm({
          ...initialData,
          location: initialData.location ?? "",
        });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
    }
  }, [mode, initialData, open]);

  const update = (k: keyof BranchFormData, v: string | boolean) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.agencyId.trim()) e.agencyId = "Agency Name is required";

    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, handleEsc]);

  const submit = async () => {
    if (!validate() || loading) return;
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const selectClassName = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-[#090044] focus:ring-2 focus:ring-[#00bf63] outline-none appearance-none disabled:opacity-50 transition-all";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-none p-3 sm:p-4">
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {mode === "add" ? "Add New Branch" : "Edit Branch Profile"}
          </h3>
          <button 
            onClick={onClose} 
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" required error={errors.name}>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full Name" />
            </Field>

            <Field label="Location" required error={errors.location}>
              <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Location" />
            </Field>

            <Field label="Is Main Branch" required error={errors.isMain}>
              <select 
                value={String(form.isMain)} 
                onChange={(e) => update("isMain", e.target.value === "true")}
                className={selectClassName}
              >
                <option value="false">No (Sub-Branch)</option>
                <option value="true">Yes (Main Branch)</option>
              </select>
            </Field>

            <Field label="Agency" required error={errors.agencyId}>
              <select
                disabled={agencyLoading}
                className={selectClassName}
                value={form.agencyId}
                onChange={(e) => update("agencyId", e.target.value)}
              >
                <option value="">{agencyLoading ? "Loading Agencies..." : "Select Agency"}</option>
                {agencies?.map((agency) => (
                  <option key={agency.id} value={agency.id}>{agency.name}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-2 sm:gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors text-center rounded-lg border border-gray-200 sm:border-0"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          >
            {loading ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {mode === "add" ? "Create" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helpers
function Field({ label, children, error, required }: { label: string; children: React.ReactNode; error?: string; required?: boolean }) {
  return (
    <div className="space-y-1">
      <Label className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
    </div>
  );
}

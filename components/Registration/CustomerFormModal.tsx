"use client";

import React, { useEffect, useState, useCallback } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { X, Save } from "lucide-react";

export interface CustomerFormData {
  fullName: string;
  gender: number;
  email: string;
  phoneNumber: string;
  altPhoneNumber: string;
  address: string;
}

interface Props {
  open: boolean;
  mode: "add" | "edit";
  initialData?: CustomerFormData;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
}

const emptyForm: CustomerFormData = {
  fullName: "",
  gender: 0,
  email: "",
  phoneNumber: "",
  altPhoneNumber: "",
  address: "",
};

export default function CustomerFormModal({ open, mode, initialData, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<CustomerFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setForm({ ...initialData });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
    }
  }, [mode, initialData, open]);

  const update = (k: keyof CustomerFormData, v: string | number) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.fullName.trim()) e.fullName = "Full Name is required";
    if (!form.phoneNumber.trim()) e.phoneNumber = "Phone Number is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
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

  const selectClassName = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-[#090044] focus:ring-2 focus:ring-[#00bf63] outline-none appearance-none transition-all";

  return (
    /* ── Backdrop ── */
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 p-4">
      {/* MEEL 1 — max-h-[90dvh] overflow-y-auto mx-4 ku daray */}
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 max-h-[90dvh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 text-center">
          {/* MEEL 2 — text-base sm:text-lg */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-2">
            {mode === "add" ? "New Customer" : "Edit Customer"}
          </h3>
          {/* MEEL 3 — p-1.5 hover:bg-gray-100 rounded-full */}
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        {/* MEEL 4 — p-5 sm:p-6 */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" required error={errors.fullName}>
              <Input
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="Enter Full Name"
              />
            </Field>

            <Field label="Gender" required>
              <select
                value={form.gender}
                onChange={(e) => update("gender", Number(e.target.value))}
                className={selectClassName}
              >
                <option value={0}>Male</option>
                <option value={1}>Female</option>
              </select>
            </Field>

            <Field label="Phone Number" required error={errors.phoneNumber}>
              <Input
                value={form.phoneNumber}
                onChange={(e) => update("phoneNumber", e.target.value)}
                placeholder="e.g. 61xxxxxxx"
              />
            </Field>

            <Field label="Alt Phone Number">
              <Input
                value={form.altPhoneNumber}
                onChange={(e) => update("altPhoneNumber", e.target.value)}
                placeholder="Optional secondary phone"
              />
            </Field>

            <Field label="Email Address" error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="customer@example.com"
              />
            </Field>

            <Field label="Address" required error={errors.address}>
              <Input
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Street name / Location"
              />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-end items-center gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-[#405189] hover:bg-[#364473] text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {mode === "add" ? "Save Customer" : "Edit Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error, required }: { label: string; children: React.ReactNode; error?: string; required?: boolean }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-[10px] font-medium text-red-500 pl-1">{error}</p>}
    </div>
  );
}

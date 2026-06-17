"use client";

import React, { useEffect, useState, useCallback } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { X, Save } from "lucide-react";

export interface UserFormData {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  password: string;
  confirmPassword: string;
}

interface Props {
  open: boolean;
  mode: "add" | "edit";
  initialData?: UserFormData;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
}

const emptyForm: UserFormData = {
  fullName: "",
  email: "",
  phone: "",
  gender: "",
  password: "",
  confirmPassword: "",
};

export default function UserFormModal({ open, mode, initialData, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setForm({
          ...initialData,
          phone: initialData.phone ?? "",
          password: "",
          confirmPassword: "",
        });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
    }
  }, [mode, initialData, open]);

  const update = (k: keyof UserFormData, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const validate = () => {
    const e: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!emailRegex.test(form.email)) e.email = "Invalid email address";

    if (mode === "add") {
      if (form.password.length < 6) e.password = "Minimum 6 characters";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords mismatch";
    }

    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

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

  return (
    /* ── Backdrop ── */
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      {/* RESPONSIVE: max-h-[90dvh] overflow-y-auto mx-4 — same as WithdrawFormModal */}
      <div
        className="relative w-full max-w-xl bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 max-h-[90dvh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="relative flex items-center justify-center p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="text-center">
            {/* RESPONSIVE: text-base sm:text-lg — same as WithdrawFormModal */}
            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
              {mode === "add" ? "Add New User" : "Edit User Profile"}
            </h3>
          </div>
          {/* RESPONSIVE: p-1.5 hover:bg-gray-100 rounded-full — same as WithdrawFormModal */}
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* BODY */}
        {/* RESPONSIVE: p-5 sm:p-6 — padding yar mobile-ka */}
        <div className="p-5 sm:p-6 space-y-4">

          {/* Row 1 — Full Name + Email */}
          {/* RESPONSIVE: grid-cols-1 md:grid-cols-2 — mobile single column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" required error={errors.fullName}>
              <Input
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="Full Name"
              />
            </Field>

            <Field label="Email Address" required error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="email@example.com"
              />
            </Field>
          </div>

          {/* Row 2 — Phone + Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Phone Number" error={errors.phone}>
              <Input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="Phone"
              />
            </Field>

            <Field label="Gender">
              <GenderSelect
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
              />
            </Field>
          </div>

          {/* Row 3 — Password fields (divider on top) */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-900 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Password" required={mode === "add"} error={errors.password}>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            <Field label="Confirm Password" required={mode === "add"} error={errors.confirmPassword}>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="••••••••"
              />
            </Field>
          </div>
        </div>

        {/* ACTIONS — same layout as WithdrawFormModal (flex gap-3, py-2.5, w-1/2) */}
        <div className="flex gap-3 px-5 sm:px-6 pb-5 sm:pb-6">
          <button
            onClick={onClose}
            className="w-1/2 border border-gray-300 py-2.5 rounded text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="w-1/2 flex items-center justify-center gap-2 bg-[#405189] hover:bg-[#364574] text-white py-2.5 rounded text-[13px] font-semibold transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {mode === "add" ? "Create User" : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ── Helpers ── */

function GenderSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
    >
      <option value="">Select Gender</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
    </select>
  );
}

function Field({
  label,
  children,
  error,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

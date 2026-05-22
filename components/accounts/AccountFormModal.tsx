"use client";

import React, { useEffect, useState, useCallback } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { X, Save } from "lucide-react";

/* ================================
   MODEL
================================ */
export interface AccountFormData {
    id : string;
    name: string;
    accountType: number;
    referenceId: string | null; 
    currencyId: number;
}

interface Props {
    open: boolean;
    mode: "add" | "edit";
    initialData?: AccountFormData;
    onClose: () => void;
    onSubmit: (data: any) => void; 
}

const emptyForm: AccountFormData = {
    id: "",
    name: "",
    accountType: 0,
    referenceId: "",
    currencyId: 0
};

export default function AccountFormModal({
    open,
    mode,
    initialData,
    onClose,
    onSubmit
}: Props) {

    const [form, setForm] = useState<AccountFormData>(emptyForm);
    const [errors, setErrors] = useState<Partial<Record<keyof AccountFormData, string>>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (mode === "edit" && initialData) {
                setForm(initialData);
            } else {
                setForm(emptyForm);
            }
            setErrors({});
        }
    }, [mode, initialData, open]);

  const update = (k: keyof AccountFormData, v: string | number) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

    const validate = () => {
        const e: typeof errors = {};

        if (!form.name.trim()) e.name = "Name is required";
        if (!form.accountType) e.accountType = "Account Type is required";
        if (!form.currencyId) e.currencyId = "Currency is required";

        // ❌ ReferenceId validation waa laga saaray (optional)

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
        console.log("FORM DATA:", form);

        if (!validate() || loading) return;

        setLoading(true);
        try {
            await onSubmit({
                ...form,
                referenceId: form.referenceId ? form.referenceId : null // ✅ HALKAN FIX
            });
        } finally {
            setLoading(false);
        }
    };

  if (!open) return null;

    const selectClassName =
        "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-[#090044] focus:ring-2 focus:ring-[#00bf63] outline-none";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 p-4">
            <div className="w-full max-w-xl bg-white rounded-xl shadow-xl border">

                {/* HEADER */}
                <div className="p-6 border-b text-center relative">
                    <h3 className="text-lg font-semibold">
                        {mode === "add" ? "Add New Account" : "Edit Account"}
                    </h3>

                    <button onClick={onClose} className="absolute right-4 top-4">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4">

                    <Field label="Account Name" error={errors.name} required>
                        <Input
                            value={form.name}
                            onChange={(e) => update("name", e.target.value)}
                            placeholder="Enter Account Name"
                        />
                    </Field>

                    <Field label="Account Type" error={errors.accountType} required>
                        <select
                            value={form.accountType}
                            onChange={(e) => update("accountType", Number(e.target.value))}
                            className={selectClassName}
                        >
                            <option value={0}>Select</option>
                            <option value={1}>Cash</option>
                            <option value={2}>Bank</option>
                            <option value={3}>Wallet</option>
                            <option value={4}>Customer</option>
                            <option value={5}>Loan</option>
                            <option value={6}>Expense</option>
                            <option value={7}>Revenue</option>
                            <option value={8}>Capital</option>
                            <option value={9}>Receivable</option>
                            <option value={10}>Payable</option>
                        </select>
                    </Field>

                    <Field label="Reference ID (Optional)" error={errors.referenceId}>
                        <Input
                            value={form.referenceId ?? ""}
                            onChange={(e) => update("referenceId", e.target.value)}
                            placeholder="Leave empty if not needed"
                        />
                    </Field>

                    <Field label="Currency" error={errors.currencyId} required>
                        <select
                            value={form.currencyId}
                            onChange={(e) => update("currencyId", Number(e.target.value))}
                            className={selectClassName}
                        >
                            <option value={0}>Select</option>
                            <option value={1}>USD</option>
                            <option value={2}>SOS</option>
                            <option value={3}>KES</option>
                        </select>
                    </Field>
                </div>

                {/* FOOTER */}
                <div className="p-4 flex justify-end gap-3 border-t">
                    <button onClick={onClose} className="text-gray-500">
                        Cancel
                    </button>

                    <button
                        onClick={submit}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        {loading ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
                    </button>
                </div>

            </div>
        </div>
    );
}

// FIELD COMPONENT
function Field({ label, children, error, required }: any) {
    return (
        <div>
            <Label className="text-xs font-bold text-gray-500 uppercase">
                {label} {required && "*"}
            </Label>
            {children}
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { X, Save } from "lucide-react";
import { SetupService } from "@/lib/setup";
import { AccountService } from "@/lib/account";





export interface AccountFormData {
    id: string;
    name: string;
    accountType: number;
    referenceId:   null;
    currencyId: number;
}


interface Props {
    open: boolean;
    mode: "add" | "edit";
    initialData?: AccountFormData;
    onClose: () => void;
    onSubmit: (data: AccountFormData) => void;
}

const emptyForm: AccountFormData = {
    id: "",
    name: "",
    accountType: 0,
    referenceId: null,
    currencyId: 0,
};

export default function AccountFormModal({ open, mode, initialData, onClose, onSubmit }: Props) {
    const [form, setForm] = useState<AccountFormData>(emptyForm);
    const [errors, setErrors] = useState<Partial<Record<keyof AccountFormData, string>>>({});
    const [loading, setLoading] = useState(false);
    const [agencies, setAgencies] = useState<{ id: string; name: string }[]>([]);
    const [agencyLoading, setAgencyLoading] = useState(false);
    const [currencies, setCurrencies] = useState<{ id: number; name: string }[]>([]);
    const [currenciesLoading, setCurrenciesLoading] = useState(false);

    // FETCH Agencies FROM API
    useEffect(() => {
        const fetchCats = async () => {
            try {
                setAgencyLoading(true);
                const res = await SetupService.getAgencies(1, 100);
                if (res.data?.success) {
                    const apiResponse = res.data?.data;
                    setAgencies(apiResponse.data || []); // Assuming the API returns { success: boolean, data: { data: Agency[] } }
                }
            } catch (err) {
                console.error("Failed to load agencies", err);
            } finally {
                setAgencyLoading(false);
            }
        };

        if (open) fetchCats(); // Fetch only when modal opens
    }, [open]);

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

    // Changed 'v' type to 'any' or 'string | boolean' to handle the checkbox/select
    const update = (k: keyof AccountFormData, v: string | boolean) => {
        setForm((p) => ({ ...p, [k]: v }));
        if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
    };

    const validate = () => {
        const e: typeof errors = {};
        
        if (!form.name.trim()) e.name = "Name is required";
        if (!form.accountType) e.accountType = "Account Type is required";
        if (!form.currencyId) e.currencyId = "Currency is required";

        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleEsc = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    }, [onClose]);



    useEffect(() => {
        const loadCurrencies = async () => {
            try {
                setCurrenciesLoading(true);

                const res = await AccountService.getCurrencyLookup();


                if (res.data?.success) {
                    setCurrencies(res.data.data || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setCurrenciesLoading(false);
            }
        };

        if (open) {
            loadCurrencies();
        }
    }, [open]);

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

    // Shared class for your custom select styling
    const selectClassName = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-[#090044] focus:ring-2 focus:ring-[#00bf63] outline-none appearance-none disabled:opacity-50 transition-all";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-none p-4">
            <div
                className="relative w-full max-w-xl bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative p-6 border-b border-gray-100 dark:border-gray-800 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {mode === "add" ? "Add New Account" : "Edit Account Profile"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Account Name" required error={errors.name}>
                            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Account Name" />
                        </Field>

                        <Field label="Account Type" required error={errors.accountType}>
                            <select
                                value={String(form.accountType)}
                                onChange={(e) => update("accountType", (e.target.value))}
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

                        <Field label="Reference" required error={errors.referenceId}>
                            <input
                                type="text"
                                value={form.referenceId || ""}
                                onChange={(e) => update("referenceId", e.target.value)} placeholder="Reference"
                                className={selectClassName}
                            >
                            </input>
                        </Field>

                        <Field label="Currency" required error={errors.currencyId}>
                            <select
                                value={String(form.currencyId)}
                                onChange={(e) => update("currencyId", (e.target.value))}
                                className={selectClassName}
                            >
                                <option value="">Select Currency</option>
                                {currencies?.map((currency) => (
                                    <option key={currency.id} value={String(currency.id)}>
                                        {currency.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </div>

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
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
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
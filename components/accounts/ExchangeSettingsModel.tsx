"use client";

import React, { useEffect, useState, useCallback } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { X, Save } from "lucide-react";
import { SetupService } from "@/lib/setup";
import { AccountService } from "@/lib/account";


export interface ExchangeFormData {
    id: number;
    currencyId: number;
    // feeRate: number;
    profitRate: number;
}

interface Props {
    open: boolean;
    mode: "add" | "edit";
    initialData?: ExchangeFormData;
    onClose: () => void;
    onSubmit: (data: ExchangeFormData) => void;
}

const emptyForm: ExchangeFormData = {
    id: 0,
    currencyId: 0,
    // feeRate: 0,
    profitRate: 0,
};

export default function ExchangeFormModal({ open, mode, initialData, onClose, onSubmit }: Props) {
    const [form, setForm] = useState<ExchangeFormData>(emptyForm);
    const [errors, setErrors] = useState<Partial<Record<keyof ExchangeFormData, string>>>({});
    const [loading, setLoading] = useState(false);
    const [agencies, setAgencies] = useState<{ id: string; name: string }[]>([]);
    const [agencyLoading, setAgencyLoading] = useState(false);
    const [currencies, setCurrencies] = useState<{ id: number; name: string }[]>([]);
    const [currencyLoading, setCurrencyLoading] = useState(false);

    // FETCH Agencies & Currencies FROM API
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("MODAL OPEN:", open);

                const currenciesRes = await AccountService.getCurrencyLookup();

                console.log("CURRENCIES RAW:", currenciesRes.data);

                // 🔥 FIX HERE
                const list = currenciesRes.data?.data || [];

                setCurrencies(list);

            } catch (err) {
                console.error("Currency fetch error:", err);
                setCurrencies([]);
            }
        };

        if (open) fetchData();
    }, [open]);
    useEffect(() => {
        if (open) {
            if (mode === "edit" && initialData) {
                setForm({
                    ...initialData,
                    id: initialData.id ?? 0,
                    currencyId: initialData.currencyId ?? 0,
                    // feeRate: initialData.feeRate ?? 0,
                    profitRate: initialData.profitRate ?? 0,
                });
            } else {
                setForm(emptyForm);
            }
            setErrors({});
        }
    }, [mode, initialData, open]);

    // Handle updates and convert strings to numbers for numeric fields
    const update = (k: keyof ExchangeFormData, v: string | boolean) => {
        let value: any = v;
        if (k === "currencyId") {
            value = Number(v) || 0;
        } else {
            // feeRate and profitRate
            value = Number(v) || 0;
        }

        setForm((p) => ({ ...p, [k]: value }));
        if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
    };

    const validate = () => {
        const e: typeof errors = {};
        if (!form.currencyId) e.currencyId = "Currency is required";
        // if (!form.feeRate) e.feeRate = "Fee Rate is required";
        if (!form.profitRate) e.profitRate = "Profit Rate is required";

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
                        {mode === "add" ? "Add New Exchange Setting" : "Edit Exchange Setting"}
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
                        <Field label="Currency" required error={errors.currencyId}>
                            <select
                                value={form.currencyId}
                                onChange={(e) => update("currencyId", e.target.value)}
                                className={selectClassName}
                            >
                                <option value="0">Select Currency</option>
                                {currencies?.map((currency: any) => (
                                    <option key={currency.id} value={currency.id}>
                                        {currency.code || currency.name || currency.currencyCode}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        {/* <Field label="Fee Rate (%)" required error={errors.feeRate}>
                            <Input
                                type="number"
                                value={form.feeRate}
                                onChange={(e) => update("feeRate", (e.target.value))}
                                placeholder="Enter fee rate"
                            />
                        </Field> */}

                        <Field label="Profit Rate (%)" required error={errors.profitRate}>
                            <Input
                                type="number"
                                value={form.profitRate}
                                onChange={(e) => update("profitRate", (e.target.value))}
                                placeholder="Enter profit rate"
                            />
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
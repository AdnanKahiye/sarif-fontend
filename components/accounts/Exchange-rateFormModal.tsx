"use client";

import React, { useEffect, useState, useCallback } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { X, Save } from "lucide-react";
// import { SetupService } from "@/lib/setup";
import { AccountService } from "@/lib/account";

export interface ExchangeRateFormData {
  rate: number;
  currencyId: number;
}

interface Props {
  open: boolean;
  mode: "add" | "edit";
  initialData?: ExchangeRateFormData;
  onClose: () => void;
  onSubmit: (data: ExchangeRateFormData) => void;
}

const emptyForm: ExchangeRateFormData = {
  rate: 0,
  currencyId: 0,
};

export default function ExchangeRateFormModal({ open, mode, initialData, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<ExchangeRateFormData>(emptyForm);
  
  // 1. Beddel 'number' oo ka dhig 'string' sadarkan:
  const [errors, setErrors] = useState<Partial<Record<keyof ExchangeRateFormData, string>>>({});
  
  const [loading, setLoading] = useState(false);
  
  // 2. Beddel 'name: number' oo ka dhig 'name: string' sadarkan:
  const [currencies, setCurrencies] = useState<{ id: number; name: string }[]>([]);
  
  const [currencyLoading, setCurrencyLoading] = useState(false);

  // FETCH CURRENCIES FROM API
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setCurrencyLoading(true);
        const res = await AccountService.getCurrencies(1, 100);
        if (res.data?.success) {
           const apiResponse = res.data?.data;
          setCurrencies(apiResponse.data || []); // Assuming the API returns { success: boolean, data: { data: Currency[] } }
        }
      } catch (err) {
        console.error("Failed to load currencies", err);
      } finally {
        setCurrencyLoading(false);
      }
    };

    if (open) fetchCurrencies(); // Fetch only when modal opens
  }, [open]);



  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setForm({
          rate: initialData.rate ?? 0,
          currencyId: initialData.currencyId ?? 0,
        });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
    }
  }, [open, mode, initialData]);

  // Changed 'v' type to 'any' or 'string | boolean' to handle the checkbox/select
  const update = (k: keyof ExchangeRateFormData, v: number | boolean) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: 0 }));
  };

  const validate = () => {
    const e: typeof errors = {};
    
    if (!form.rate) e.rate = "Rate is required";
    if (!form.currencyId) e.currencyId = "Currency is required";

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
            {mode === "add" ? "Add New Exchange Rate" : "Edit Exchange Rate"}
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
            <Field label="Rate" required error={errors.rate}>
            <Input
              type="number"
              value={form.rate}
              onChange={(e) => update("rate", parseFloat(e.target.value) || 0)}
              placeholder="Enter rate"
            />
          </Field>

            <Field label="Currency" required error={errors.currencyId}>
            <select
              className={selectClassName}
              value={form.currencyId}
              onChange={(e) => update("currencyId", parseInt(e.target.value) || 0)}
              disabled={currencyLoading}
            >
              <option value="">Select currency</option>

              {currencies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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

"use client";

import { useEffect, useState, useCallback } from "react";
import Select from "react-select";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { X, Save } from "lucide-react";
import { AccountService } from "@/lib/account";

/* ================================
   MODEL
================================ */
export interface CreateDepositRequest {
  transactionType: number;
  description: string;
  deposit: {
    accountId: string;
    customerId: string;
    amount: number;
  };
}

/* ================================
   EMPTY FORM
================================ */
const emptyForm: CreateDepositRequest = {
  transactionType: 1,
  description: "",
  deposit: {
    accountId: "",
    customerId: "",
    amount: 0,
  },
};

interface DepositFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: CreateDepositRequest) => void;
  customerId?: string;
  customerName?: string;
}

export default function DepositFormModal({
  open,
  onClose,
  onSubmit,
  customerId = "",
  customerName = "",
}: DepositFormModalProps) {
  const [form, setForm] = useState<CreateDepositRequest>(emptyForm);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...emptyForm,
      deposit: {
        ...emptyForm.deposit,
        customerId: customerId,
      },
    });
    setErrors({});
  }, [open, customerId]);

  useEffect(() => {
    if (!open) return;
    AccountService.getAccountExchangeLookup().then((res) => {
      setAccounts(res.data?.data || []);
    });
  }, [open]);

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

  const updateDeposit = (key: keyof CreateDepositRequest["deposit"], value: any) => {
    setForm((prev) => ({
      ...prev,
      deposit: { ...prev.deposit, [key]: value },
    }));
    if (errors[key]) setErrors((prev: any) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const e: any = {};
    if (!form.deposit.accountId) e.account = "Account is required";
    if (!form.deposit.customerId) e.customer = "Customer ID is required";
    if (!form.deposit.amount || form.deposit.amount <= 0)
      e.amount = "Amount must be greater than 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const accountOptions = accounts.map((a) => ({
    value: a.id,
    label: a.name,
  }));

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
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-gray-900/40 backdrop-blur-none p-3 sm:p-4">
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="relative p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Deposit
          </h3>
          {customerName && (
            <p className="text-sm text-gray-500 mt-0.5">
              Customer:{" "}
              <span className="font-semibold text-[#405189]">{customerName}</span>
            </p>
          )}
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 space-y-4">

          {/* ACCOUNT */}
          <Field label="Account" required error={errors.account}>
            <Select
              options={accountOptions}
              onChange={(v: any) => updateDeposit("accountId", v?.value)}
              classNamePrefix="react-select"
            />
          </Field>

          {/* CUSTOMER — hidden */}
          <input type="hidden" value={form.deposit.customerId} />

          {/* AMOUNT */}
          <Field label="Amount" required error={errors.amount}>
            <Input
              type="number"
              placeholder="Enter amount"
              value={form.deposit.amount || ""}
              onChange={(e: any) =>
                updateDeposit("amount", Number(e.target.value))
              }
            />
          </Field>

          {/* DESCRIPTION */}
          <Field label="Description">
            <Input
              type="text"
              placeholder="Optional description"
              value={form.description}
              onChange={(e: any) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Field>

        </div>

        {/* FOOTER */}
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
            className="flex items-center justify-center gap-2 px-6 py-2.5 sm:py-2 bg-[#405189] hover:bg-[#364574] text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Deposit
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================
   HELPERS
================================ */
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
      {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
    </div>
  );
}

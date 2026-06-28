"use client";

import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { X } from "lucide-react";
import { AccountService } from "@/lib/account";
import toast from "react-hot-toast";

/* ================================
   CASH OPENING MODEL
================================ */
export interface CreateCashOpeningRequest {
  transactionType: number;
  description: string;
  cashOpening: {
    cashAccountId: string;
    capitalAccountId: string;
    amount: number;
    note: string;
  };
}

/* ================================
   EMPTY FORM
================================ */
const emptyForm: CreateCashOpeningRequest = {
  transactionType: 9,
  description: "",
  cashOpening: {
    cashAccountId: "",
    capitalAccountId: "",
    amount: 0,
    note: "",
  },
};

export default function FundModalCash({
  open,
  onClose,
  onSubmit,
  loading = false,
}: any) {
  const [form, setForm] = useState<CreateCashOpeningRequest>(emptyForm);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [capitalAccounts, setCapitalAccounts] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [lookupLoading, setLookupLoading] = useState(false);

  /* ================================
     LOAD CASH + CAPITAL ACCOUNTS
  ================================= */
  useEffect(() => {
    if (!open) return;

    const loadLookups = async () => {
      setLookupLoading(true);

      try {
        const [cashRes, capitalRes] = await Promise.all([
          AccountService.getMainCashAccounts(),
          AccountService.getCapitalAccounts(),
        ]);

        setCashAccounts(cashRes.data?.data || []);
        setCapitalAccounts(capitalRes.data?.data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load accounts");
      } finally {
        setLookupLoading(false);
      }
    };

    loadLookups();
  }, [open]);

  /* ================================
     OPTIONS
  ================================= */
  const cashAccountOptions = useMemo(
    () =>
      cashAccounts.map((a) => ({
        value: a.id,
        label: a.name || a.accountName || a.accountTitle || "Unnamed account",
      })),
    [cashAccounts]
  );

  const capitalAccountOptions = useMemo(
    () =>
      capitalAccounts.map((a) => ({
        value: a.id,
        label: a.name || a.accountName || a.accountTitle || "Unnamed account",
      })),
    [capitalAccounts]
  );

  const selectedCashAccount =
    cashAccountOptions.find(
      (x) => x.value === form.cashOpening.cashAccountId
    ) || null;

  const selectedCapitalAccount =
    capitalAccountOptions.find(
      (x) => x.value === form.cashOpening.capitalAccountId
    ) || null;

  /* ================================
     VALIDATION
  ================================= */
  const validate = () => {
    const e: any = {};

    if (!form.cashOpening.cashAccountId) {
      e.cashAccount = "Select cash account";
    }

    if (!form.cashOpening.capitalAccountId) {
      e.capitalAccount = "Select capital account";
    }

    if (!form.cashOpening.amount || form.cashOpening.amount <= 0) {
      e.amount = "Amount required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ================================
     UPDATE
  ================================= */
  const updateCashOpening = (key: string, value: any) => {
    setForm((p) => ({
      ...p,
      cashOpening: {
        ...p.cashOpening,
        [key]: value,
      },
    }));

    setErrors((p: any) => ({
      ...p,
      [key]: "",
    }));
  };

  const updateNote = (value: string) => {
    setForm((p) => ({
      ...p,
      description: value,
      cashOpening: {
        ...p.cashOpening,
        note: value,
      },
    }));
  };

  /* ================================
     SUBMIT
  ================================= */
  const handleSubmit = () => {
    if (!validate()) return;

    const note = form.cashOpening.note || "Initial cash opening";

    const payload: CreateCashOpeningRequest = {
      transactionType: 9,
      description: form.description || note,
      cashOpening: {
        cashAccountId: form.cashOpening.cashAccountId,
        capitalAccountId: form.cashOpening.capitalAccountId,
        amount: Number(form.cashOpening.amount),
        note,
      },
    };

    onSubmit(payload);
  };

  const handleClose = () => {
    setForm(emptyForm);
    setErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 z-50">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl p-5">
        <div className="relative flex items-center justify-center mb-3">
          <h3 className="font-bold text-lg dark:text-gray-200">
            Fund Cash Account
          </h3>

          <button
            type="button"
            onClick={handleClose}
            className="absolute right-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ACCOUNTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Cash Account</Label>
            <Select
              isLoading={lookupLoading}
              isDisabled={lookupLoading || loading}
              placeholder="Select cash account"
              options={cashAccountOptions}
              value={selectedCashAccount}
              onChange={(v: any) =>
                updateCashOpening("cashAccountId", v?.value || "")
              }
            />
            {errors.cashAccount && (
              <p className="text-red-500 text-xs mt-1">
                {errors.cashAccount}
              </p>
            )}
          </div>

          <div>
            <Label>Capital Account</Label>
            <Select
              isLoading={lookupLoading}
              isDisabled={lookupLoading || loading}
              placeholder="Select capital account"
              options={capitalAccountOptions}
              value={selectedCapitalAccount}
              onChange={(v: any) =>
                updateCashOpening("capitalAccountId", v?.value || "")
              }
            />
            {errors.capitalAccount && (
              <p className="text-red-500 text-xs mt-1">
                {errors.capitalAccount}
              </p>
            )}
          </div>
        </div>

        {/* AMOUNT */}
        <div className="mt-3">
          <Label>Amount</Label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={form.cashOpening.amount === 0 ? "" : form.cashOpening.amount}
            onChange={(e: any) =>
              updateCashOpening("amount", Number(e.target.value))
            }
          />
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
          )}
        </div>

        {/* DESCRIPTION / NOTE */}
        <div className="mt-3">
          <Label>Note</Label>
          <Input
            type="text"
            placeholder="Initial cash opening"
            value={form.cashOpening.note}
            onChange={(e: any) => updateNote(e.target.value)}
          />
        </div>

        {/* SUBMIT */}
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="w-1/2 border border-gray-300 py-2.5 rounded text-[13px] disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || lookupLoading}
            className="w-1/2 bg-[#405189] text-white py-2.5 rounded text-[13px] hover:bg-[#364574] disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
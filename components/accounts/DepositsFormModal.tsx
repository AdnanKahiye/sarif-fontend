"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { X } from "lucide-react";
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

  const updateDeposit = (key: keyof CreateDepositRequest["deposit"], value: any) => {
    setForm((prev) => ({
      ...prev,
      deposit: { ...prev.deposit, [key]: value },
    }));
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

  if (!open) return null;

  return (
    /* ── Backdrop ── */
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 z-50">
      {/*
        Mobile  → slides up from bottom, full width, rounded top corners
        Desktop → centred card, max-w-lg, rounded all corners
      */}
      <div className="w-full max-w-lg bg-white rounded-xl p-5 sm:p-6 shadow-lg max-h-[90dvh] overflow-y-auto mx-4">

        {/* HEADER */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="text-center">
            <h3 className="font-bold text-base sm:text-lg">Deposit</h3>
            {customerName && (
              <p className="text-sm text-gray-500 mt-0.5">
                Customer:{" "}
                <span className="font-semibold text-[#405189]">{customerName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute right-0 p-1.5 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ACCOUNT */}
        <div className="mb-4">
          <Label>Account</Label>
          <Select
            options={accountOptions}
            onChange={(v: any) => updateDeposit("accountId", v?.value)}
            classNamePrefix="react-select"
          />
          {errors.account && (
            <p className="text-red-500 text-xs mt-1">{errors.account}</p>
          )}
        </div>

        {/* CUSTOMER — hidden */}
        <input type="hidden" value={form.deposit.customerId} />

        {/* AMOUNT */}
        <div className="mb-4">
          <Label>Amount</Label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={form.deposit.amount || ""}
            onChange={(e: any) =>
              updateDeposit("amount", Number(e.target.value))
            }
          />
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="mb-4">
          <Label>Description</Label>
          <Input
            type="text"
            placeholder="Optional description"
            value={form.description}
            onChange={(e: any) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="w-1/2 border border-gray-300 py-2.5 rounded text-[13px]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!validate()) return;
              onSubmit(form);
            }}
            className="w-1/2 bg-[#405189] text-white py-2.5 rounded text-[13px] hover:bg-[#364574]"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}

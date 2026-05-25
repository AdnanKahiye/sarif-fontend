"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { AccountService } from "@/lib/account";

/* ================================
   MODEL (CLEAN)
================================ */
export interface CreateWithdrawRequest {
  transactionType: number;
  description: string; // ✅ used as sender → receiver comment
  withdraw: {
    accountId: string;
    customerId: string;
    amount: number;
  };
}

/* ================================
   EMPTY FORM
================================ */
const emptyForm: CreateWithdrawRequest = {
  transactionType: 2,
  description: "",
  withdraw: {
    accountId: "",
    customerId: "",
    amount: 0,
  },
};

export default function WithdrawFormModal({
  open,
  onClose,
  onSubmit,
}: any) {
  const [form, setForm] = useState<CreateWithdrawRequest>(emptyForm);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "";

  useEffect(() => {
    const idFromUrl = searchParams.get("customerId");
    if (idFromUrl) {
      setForm((prev) => ({ ...prev, withdraw: { ...prev.withdraw, customerId: idFromUrl } }));
    }
  }, [searchParams]);

  /* ================================
     withdraw ACCOUNTS
  ================================= */
  useEffect(() => {
    if (!open) return;

    AccountService.getAccountExchangeLookup().then((res) => {
      setAccounts(res.data?.data || []);
    });
  }, [open]);

  <WithdrawFormModal
    open={open}
    customerId={customerId}  // ← sidaan
  />



  /* ================================
     UPDATE
  ================================= */
  const updateWithdraw = (key: keyof CreateWithdrawRequest["withdraw"], value: any) => {
    setForm((prev) => ({
      ...prev,
      withdraw: {
        ...prev.withdraw,
        [key]: value,
      },
    }));
  };

  /* ================================
     VALIDATION (FIXED)
  ================================= */
  const validate = () => {
    const e: any = {};

    if (!form.withdraw.accountId)
      e.account = "Account is required";

    if (!form.withdraw.customerId)
      e.customer = "Customer ID is required";

    if (!form.withdraw.amount || form.withdraw.amount <= 0)
      e.amount = "Amount must be greater than 0";

    if (!form.description)
      e.description = "Comment is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ================================
     OPTIONS
  ================================= */
  const accountOptions = accounts.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 z-50">
      <div className="w-full max-w-lg bg-white rounded-xl p-6 shadow-lg">

        {/* HEADER */}
        <div className="relative flex items-center justify-center mb-4">
          <h3 className="font-bold text-lg">Withdraw</h3>
          <button
            onClick={onClose}
            className="absolute right-0 p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ACCOUNT */}
        <div className="mb-3">
          <Label>Account</Label>
          <Select
            options={accountOptions}
            onChange={(v: any) =>
              updateWithdraw("accountId", v?.value)
            }
          />
          {errors.account && (
            <p className="text-red-500 text-xs mt-1">{errors.account}</p>
          )}
        </div>

        {/* CUSTOMER */}
        <div className="mb-3">
          <Label>Customer ID</Label>
          <Input
            type="text"
            placeholder="Enter Customer ID"
            value={form.withdraw.customerId}
            onChange={(e: any) =>
              updateWithdraw("customerId", e.target.value)
            }
          />
          {errors.customer && (
            <p className="text-red-500 text-xs mt-1">{errors.customer}</p>
          )}
        </div>

        {/* AMOUNT */}
        <div className="mb-3">
          <Label>Amount</Label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={form.withdraw.amount || ""}
            onChange={(e: any) =>
              updateWithdraw("amount", Number(e.target.value))
            }
          />
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
          )}
        </div>

        {/* COMMENT (SENDER → RECEIVER) */}
        <div className="mb-3">
          <Label>Comment (Sender → Receiver)</Label>
          <Input
            type="text"
            placeholder="e.g. Sender: Ahmed → Receiver: Ali"
            value={form.description}
            onChange={(e: any) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="w-1/2 border border-gray-300 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              if (!validate()) return;
              onSubmit(form);
            }}
            className="w-1/2 bg-[#405189] text-white py-2 rounded"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
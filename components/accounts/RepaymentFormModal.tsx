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
export interface CreateRepaymentRequest {
  transactionType: number;
  description: string;
  repayment: {
    loanId: string;
    amount: number;
    note: string;
    cashAccountId: string;
  };
}

/* ================================
   EMPTY FORM
================================ */
const emptyForm: CreateRepaymentRequest = {
  transactionType: 6,
  description: "",
  repayment: {
    loanId: "",
    amount: 0,
    note: "",
    cashAccountId: "",
  },
};

/* ================================
   PROPS
================================ */
interface RepaymentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRepaymentRequest) => void;
  loanId?: string;
}

export default function RepaymentFormModal({
  open,
  onClose,
  onSubmit,
  loanId,
}: RepaymentFormModalProps) {

  const [form, setForm] = useState<CreateRepaymentRequest>(emptyForm);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});

  /* ================================
     LOAD CASH ACCOUNTS
  ================================= */
  useEffect(() => {
    if (!open) return;
    AccountService.getAccountExchangeLookup().then((res) => {
      console.log("ACCOUNTS DATA:", res.data?.data);
      setAccounts(res.data?.data || []);
    });
  }, [open]);

  /* ================================
     RESET
  ================================= */
  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setErrors({});
    }
  }, [open]);

  /* ================================
     AUTO-FILL LOAN ID
  ================================= */
  useEffect(() => {
    if (open && loanId) {
      setForm((prev) => ({
        ...prev,
        repayment: {
          ...prev.repayment,
          loanId: loanId,
        },
      }));
    }
  }, [open, loanId]);

  /* ================================
     UPDATE
  ================================= */
  const updateRepayment = (key: keyof CreateRepaymentRequest["repayment"], value: any) => {
    setForm((prev) => ({
      ...prev,
      repayment: {
        ...prev.repayment,
        [key]: value,
      },
    }));
  };

  /* ================================
     VALIDATION
  ================================= */
  const validate = () => {
    const e: any = {};

    if (!form.repayment.loanId)
      e.loan = "Loan ID required";

    if (!form.repayment.amount || form.repayment.amount <= 0)
      e.amount = "Amount must be greater than 0";

    if (!form.repayment.cashAccountId)
      e.cash = "Cash account required";

    if (!form.description)
      e.description = "Description required";

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
          <h3 className="font-bold text-lg">Loan Repayment</h3>
          <button onClick={onClose} className="absolute right-0 p-1">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* GRID FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* LOAN ID - HIDDEN (auto-filled) */}
          <input type="hidden" value={form.repayment.loanId} readOnly />

          {/* CASH ACCOUNT */}
          <div className="md:col-span-2">
            <Label>Cash Account</Label>
            <Select
              options={accountOptions}
              onChange={(v: any) => updateRepayment("cashAccountId", v?.value)}
            />
            {errors.cash && <p className="text-red-500 text-xs">{errors.cash}</p>}
          </div>

          {/* AMOUNT */}
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              value={form.repayment.amount || ""}
              onChange={(e: any) =>
                updateRepayment("amount", Number(e.target.value))
              }
            />
            {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
          </div>

          {/* NOTE */}
          <div>
            <Label>Note</Label>
            <Input
              value={form.repayment.note}
              onChange={(e: any) => updateRepayment("note", e.target.value)}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e: any) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
          </div>

        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="w-1/2 border py-2 rounded">
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
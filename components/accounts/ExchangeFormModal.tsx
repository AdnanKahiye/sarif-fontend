"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { X } from "lucide-react";
import { AccountService } from "@/lib/account";

/* ================================
   CLEAN MODEL (NO CURRENCY)
================================ */
export interface CreateExchangeRequest {
  transactionType: number;
  description: string;
  exchange: {
    fromAccountId: string;
    toAccountId: string;
    fromAmount: number;
  };
}

/* ================================
   EMPTY FORM
================================ */
const emptyForm: CreateExchangeRequest = {
  transactionType: 4,
  description: "",
  exchange: {
    fromAccountId: "",
    toAccountId: "",
    fromAmount: 0,
  },
};

export default function ExchangeFormModal({ open, onClose, onSubmit }: any) {
  const [form, setForm] = useState<CreateExchangeRequest>(emptyForm);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});

  /* ================================
     LOAD ACCOUNTS ONLY
  ================================= */
  useEffect(() => {
    if (!open) return;

    AccountService.getAccountExchangeLookup().then((a) => {
      setAccounts(a.data?.data || []);
    });
  }, [open]);

  /* ================================
     VALIDATION
  ================================= */
  const validate = () => {
    const e: any = {};

    if (!form.exchange.fromAmount || form.exchange.fromAmount <= 0)
      e.amount = "Amount required";

    if (!form.exchange.fromAccountId)
      e.source = "Select source account";

    if (!form.exchange.toAccountId)
      e.dest = "Select destination account";

    if (form.exchange.fromAccountId === form.exchange.toAccountId)
      e.dest = "Same account not allowed";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ================================
     UPDATE
  ================================= */
  const updateExchange = (key: any, value: any) => {
    setForm((p) => ({
      ...p,
      exchange: {
        ...p.exchange,
        [key]: value,
      },
    }));
  };

  /* ================================
     OPTIONS
  ================================= */
  const accOpt = accounts.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl p-5">
        <div className="relative flex items-center justify-center mb-3">
          <h3 className="font-bold text-lg">Exchange</h3>

          {/* Close button stays right */}
          <button
            onClick={onClose}
            className="absolute right-0 p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ACCOUNTS */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Exchange From</Label>
            <Select
              onChange={(v: any) => updateExchange("fromAccountId", v.value)}
              options={accOpt}
            />
            {errors.source && <p className="text-red-500 text-xs">{errors.source}</p>}
          </div>

          <div>
            <Label>Exchange To</Label>
            <Select
              onChange={(v: any) => updateExchange("toAccountId", v.value)}
              options={accOpt}
            />
            {errors.dest && <p className="text-red-500 text-xs">{errors.dest}</p>}
          </div>
        </div>

        {/* AMOUNT */}
        <div className="mt-3">
          <Label>Amount</Label>
          <Input
            type="number"
            onChange={(e: any) =>
              updateExchange("fromAmount", Number(e.target.value))
            }
          />
          {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
        </div>

        {/* SUBMIT */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="w-1/2 border border-gray-300 py-2.5 rounded text-[13px]"
          >
            Cancel
          </button>
          <button
            onClick={() => validate() && onSubmit(form)}
            className="w-1/2 bg-[#405189] text-white py-2.5 rounded text-[13px] hover:bg-[#364574]"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
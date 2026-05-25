"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useSearchParams } from "next/navigation";
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

export default function DepositFormModal({
  open,
  onClose,
  onSubmit,
}: any) {


  const [form, setForm] = useState<CreateDepositRequest>(emptyForm);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "";

  useEffect(() => {
    const idFromUrl = searchParams.get("customerId");
    if (idFromUrl) {
      setForm((prev) => ({ ...prev, deposit: { ...prev.deposit, customerId: idFromUrl } }));
    }
  }, [searchParams]);

  /* ================================
     deposit ACCOUNTS
  ================================= */
  useEffect(() => {
    if (!open) return;

    AccountService.getAccountExchangeLookup().then((res) => {
      setAccounts(res.data?.data || []);
    });
  }, [open]);

  <DepositFormModal
    open={open}
    customerId={customerId}  // ← sidaan
  />



  /* ================================
     VALIDATION
  ================================= */
  const validate = () => {
    const e: any = {};

    if (!form.deposit.accountId)
      e.account = "Account is required";

    if (!form.deposit.customerId)
      e.customer = "Customer ID is required";

    if (!form.deposit.amount || form.deposit.amount <= 0)
      e.amount = "Amount must be greater than 0";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ================================
     UPDATE HANDLER
  ================================= */
  const updateDeposit = (key: any, value: any) => {
    setForm((prev) => ({
      ...prev,
      deposit: {
        ...prev.deposit,
        [key]: value,
      },
    }));
  };

  /* ================================
     OPTIONS
  ================================= */
  const accountOptions = accounts.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  /* ================================
     RESET FORM ON CLOSE
  ================================= */
  

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 z-50">
      <div className="w-full max-w-lg bg-white rounded-xl p-6 shadow-lg">

        {/* HEADER */}
        <div className="relative flex items-center justify-center mb-4">
          <h3 className="font-bold text-lg">Deposit</h3>
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
              updateDeposit("accountId", v?.value)
            }
          />
          {errors.account && (
            <p className="text-red-500 text-xs mt-1">
              {errors.account}
            </p>
          )}
        </div>

        {/* CUSTOMER ID */}
        <div className="mb-3">
          <Label>Customer ID</Label>
          <Input
            type="text"
            placeholder="Enter Customer ID"
            value={form.deposit.customerId}
            onChange={(e: any) =>
              updateDeposit("customerId", e.target.value)
            }
          />
          {errors.customer && (
            <p className="text-red-500 text-xs mt-1">
              {errors.customer}
            </p>
          )}
        </div>

        {/* AMOUNT */}
        <div className="mb-3">
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
            <p className="text-red-500 text-xs mt-1">
              {errors.amount}
            </p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="mb-3">
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

              onSubmit(form); // ✅ correct payload
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
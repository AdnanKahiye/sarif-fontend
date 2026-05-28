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
  customerId?: string;       // ← prop ahaan yimaada (CustomerTable)
  customerName?: string;     // ← optional: magaca customer si loogu tuso
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
        customerId: customerId, // ← prop-ka ayaa loo doortay
      },
    });
    setErrors({});
  }, [open, customerId]);

  /* ================================
     deposit ACCOUNTS
  ================================= */
  useEffect(() => {
    if (!open) return;

    AccountService.getAccountExchangeLookup().then((res) => {
      setAccounts(res.data?.data || []);
    });
  }, [open]);



  /* ================================
     UPDATE HANDLER
  ================================= */
  const updateDeposit = (key: keyof CreateDepositRequest["deposit"], value: any) => {
    setForm((prev) => ({
      ...prev,
      deposit: {
        ...prev.deposit,
        [key]: value,
      },
    }));
  };


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
          <div className="text-center">
            <h3 className="font-bold text-lg">deposit</h3>
            {/* Customer magaciisa hadduu jiro ayaa lagu tusi karaa */}
            {customerName && (
              <p className="text-sm text-gray-500 mt-0.5">
                Customer: <span className="font-semibold text-[#405189]">{customerName}</span>
              </p>
            )}
          </div>
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

        {/* CUSTOMER - FULLY HIDDEN */}
        <input type="hidden" value={form.deposit.customerId} />

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
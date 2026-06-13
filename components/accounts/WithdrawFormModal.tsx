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
export interface CreateWithdrawRequest {
  transactionType: number;
  description: string;
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

/* ================================
   PROPS
================================ */
interface WithdrawFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: CreateWithdrawRequest) => void;
  customerId?: string;
  customerName?: string;
}

export default function WithdrawFormModal({
  open,
  onClose,
  onSubmit,
  customerId = "",
  customerName = "",
}: WithdrawFormModalProps) {

  const [form, setForm] = useState<CreateWithdrawRequest>(emptyForm);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (!open) return;
    setForm({
      ...emptyForm,
      withdraw: {
        ...emptyForm.withdraw,
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

  const updateWithdraw = (key: keyof CreateWithdrawRequest["withdraw"], value: any) => {
    setForm((prev) => ({
      ...prev,
      withdraw: { ...prev.withdraw, [key]: value },
    }));
  };

  const validate = () => {
    const e: any = {};
    if (!form.withdraw.accountId)                              e.account     = "Account is required";
    if (!form.withdraw.customerId)                             e.customer    = "Customer ID is required";
    if (!form.withdraw.amount || form.withdraw.amount <= 0)    e.amount      = "Amount must be greater than 0";
    if (!form.description)                                     e.description = "Comment is required";
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
      {/* MEEL 1 — max-h-[90dvh] overflow-y-auto mx-4 ku daray */}
      <div className="w-full max-w-lg bg-white rounded-xl p-5 sm:p-6 shadow-lg max-h-[90dvh] overflow-y-auto mx-4">

        {/* HEADER */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="text-center">
            {/* MEEL 2 — text-base sm:text-lg */}
            <h3 className="font-bold text-base sm:text-lg">Withdraw</h3>
            {customerName && (
              <p className="text-sm text-gray-500 mt-0.5">
                Customer:{" "}
                <span className="font-semibold text-[#405189]">{customerName}</span>
              </p>
            )}
          </div>
          {/* MEEL 3 — p-1.5 hover:bg-gray-100 rounded-full */}
          <button
            onClick={onClose}
            className="absolute right-0 p-1.5 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ACCOUNT */}
        {/* MEEL 4 — mb-4 */}
        <div className="mb-4">
          <Label>Account</Label>
          <Select
            options={accountOptions}
            onChange={(v: any) => updateWithdraw("accountId", v?.value)}
            classNamePrefix="react-select"
          />
          {errors.account && (
            <p className="text-red-500 text-xs mt-1">{errors.account}</p>
          )}
        </div>

        {/* CUSTOMER — hidden */}
        <input type="hidden" value={form.withdraw.customerId} />

        {/* AMOUNT */}
        {/* MEEL 4 — mb-4 */}
        <div className="mb-4">
          <Label>Amount</Label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={form.withdraw.amount || ""}
            onChange={(e: any) => updateWithdraw("amount", Number(e.target.value))}
          />
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
          )}
        </div>

        {/* COMMENT */}
        {/* MEEL 4 — mb-4 */}
        <div className="mb-4">
          <Label>Comment</Label>
          <Input
            type="text"
            placeholder="e.g. Withdraw for customer"
            value={form.description}
            onChange={(e: any) => setForm({ ...form, description: e.target.value })}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        {/* ACTIONS */}
        {/* MEEL 4 — gap-3 + py-2.5 */}
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

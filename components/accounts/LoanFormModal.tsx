"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { X } from "lucide-react";
import { AccountService } from "@/lib/account";

/* ================================
   MODEL (FUTURE READY)
================================ */
export interface CreateLoanRequest {
  transactionType: number;
  description: string;
  loan: {
    accountId: string;
    customerId: string;
    principalAmount: number;
    interestRate: number;
    dueDate: string;
  };
}

/* ================================
   EMPTY FORM
================================ */
const emptyForm: CreateLoanRequest = {
  transactionType: 5,
  description: "",
  loan: {
    accountId: "",
    customerId: "",
    principalAmount: 0,
    interestRate: 0,
    dueDate: "",
  },
};

/* ================================
   PROPS
================================ */
interface LoanFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: CreateLoanRequest) => void;
  customerId?: string;
  customerName?: string;
}

export default function LoanFormModal({
  open,
  onClose,
  onSubmit,
  customerId = "",
  customerName = "",
}: LoanFormModalProps) {

  const [form, setForm] = useState<CreateLoanRequest>(emptyForm);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (!open) return;
    setForm({
      ...emptyForm,
      loan: {
        ...emptyForm.loan,
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

  const updateLoan = (key: keyof CreateLoanRequest["loan"], value: any) => {
    setForm((prev) => ({
      ...prev,
      loan: { ...prev.loan, [key]: value },
    }));
  };

  const validate = () => {
    const e: any = {};
    if (!form.loan.accountId)       e.account     = "Account is required";
    if (!form.loan.customerId)      e.customer    = "Customer ID is required";
    if (!form.loan.principalAmount || form.loan.principalAmount <= 0)
                                    e.amount      = "Amount must be greater than 0";
    if (!form.loan.dueDate)         e.dueDate     = "Due date required";
    if (!form.description)          e.description = "Description required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const accountOptions = accounts.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  if (!open) return null;

  return (
    /* ── Backdrop — same as DepositFormModal ── */
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 z-50">
      {/* MEEL 1 — max-h + overflow + mx-4 ku daray */}
      <div className="w-full max-w-lg bg-white rounded-xl p-5 sm:p-6 shadow-lg max-h-[90dvh] overflow-y-auto mx-4">

        {/* HEADER */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="text-center">
            {/* MEEL 2 — text-base sm:text-lg */}
            <h3 className="font-bold text-base sm:text-lg">Loan</h3>
            {customerName && (
              <p className="text-sm text-gray-500 mt-0.5">
                Customer:{" "}
                <span className="font-semibold text-[#405189]">{customerName}</span>
              </p>
            )}
          </div>
          {/* MEEL 2 — p-1.5 */}
          <button
            onClick={onClose}
            className="absolute right-0 p-1.5 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ACCOUNT */}
        {/* MEEL 3 — mb-4 */}
        <div className="mb-4">
          <Label>Account</Label>
          <Select
            options={accountOptions}
            onChange={(v: any) => updateLoan("accountId", v?.value)}
            classNamePrefix="react-select"
          />
          {errors.account && (
            <p className="text-red-500 text-xs mt-1">{errors.account}</p>
          )}
        </div>

        {/* CUSTOMER — hidden */}
        <input type="hidden" value={form.loan.customerId} />

        {/* AMOUNT */}
        {/* MEEL 3 — mb-4 */}
        <div className="mb-4">
          <Label>Loan Amount</Label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={form.loan.principalAmount || ""}
            onChange={(e: any) =>
              updateLoan("principalAmount", Number(e.target.value))
            }
          />
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
          )}
        </div>

        {/* DUE DATE */}
        {/* MEEL 3 — mb-4 */}
        <div className="mb-4">
          <Label>Pay Date</Label>
          <Input
            type="date"
            value={form.loan.dueDate}
            onChange={(e: any) => updateLoan("dueDate", e.target.value)}
          />
          {errors.dueDate && (
            <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>
          )}
        </div>

        {/* DESCRIPTION */}
        {/* MEEL 3 — mb-4 */}
        <div className="mb-4">
          <Label>Description</Label>
          <Input
            placeholder="e.g. Loan given to customer"
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

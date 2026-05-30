"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import RepaymentFormModal from "@/components/accounts/RepaymentFormModal";
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

    /**
     * Interest Rate (%)
     * - Optional for now
     * - Future use:
     *   • Calculate total payable
     *   • Monthly installments
     *   • Profit tracking
     */
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
  customerId?: string;       // ← prop ahaan yimaada (CustomerTable)
  customerName?: string;     // ← optional: magaca customer si loogu tuso
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

  /* ================================
     MARKA MODAL FURMO: set customerId
     prop-ka ama URL-ka (whichever available)
  ================================ */
  useEffect(() => {
    if (!open) return;

    setForm({
      ...emptyForm,
      loan: {
        ...emptyForm.loan,
        customerId: customerId, // ← prop-ka ayaa loo doortay
      },
    });
    setErrors({});
  }, [open, customerId]);

  /* ================================
     LOAD ACCOUNTS
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
  const updateLoan = (key: keyof CreateLoanRequest["loan"], value: any) => {
    setForm((prev) => ({
      ...prev,
      loan: {
        ...prev.loan,
        [key]: value,
      },
    }));
  };

  /* ================================
     VALIDATION
  ================================= */
  const validate = () => {
    const e: any = {};

    if (!form.loan.accountId)
      e.account = "Account is required";

    if (!form.loan.customerId)
      e.customer = "Customer ID is required";

    if (!form.loan.principalAmount || form.loan.principalAmount <= 0)
      e.amount = "Amount must be greater than 0";

    if (!form.loan.dueDate)
      e.dueDate = "Due date required";

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

  /* ================================
     FUTURE CALCULATION (OPTIONAL)
  ================================= */
  const calculateTotal = () => {
    const { principalAmount, interestRate } = form.loan;
    if (!interestRate) return principalAmount;
    return principalAmount + (principalAmount * interestRate) / 100;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 z-50">
      <div className="w-full max-w-lg bg-white rounded-xl p-6 shadow-lg">

        {/* HEADER */}
        <div className="relative flex items-center justify-center mb-4">
          <div className="text-center">
            <h3 className="font-bold text-lg">Loan</h3>
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
            onChange={(v: any) => updateLoan("accountId", v?.value)}
          />
          {errors.account && <p className="text-red-500 text-xs">{errors.account}</p>}
        </div>

        {/* CUSTOMER - FULLY HIDDEN */}
        <input type="hidden" value={form.loan.customerId} />

        {/* AMOUNT */}
        <div className="mb-3">
          <Label>Loan Amount</Label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={form.loan.principalAmount || ""}
            onChange={(e: any) =>
              updateLoan("principalAmount", Number(e.target.value))
            }
          />
          {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
        </div>

        {/* INTEREST — commented out (future use) */}
        {/* <div className="mb-3">
          <Label>Interest Rate (%)</Label>
          <Input
            type="number"
            placeholder="Optional (future use)"
            value={form.loan.interestRate || ""}
            onChange={(e: any) =>
              updateLoan("interestRate", Number(e.target.value))
            }
          />
          <p className="text-gray-400 text-xs mt-1">
            Optional. Will be used later for loan profit and repayment calculation.
          </p>
        </div> */}

        {/* DUE DATE */}
        <div className="mb-3">
          <Label>Pay Date</Label>
          <Input
            type="date"
            value={form.loan.dueDate}
            onChange={(e: any) =>
              updateLoan("dueDate", e.target.value)
            }
          />
          {errors.dueDate && <p className="text-red-500 text-xs">{errors.dueDate}</p>}
        </div>

        {/* DESCRIPTION */}
        <div className="mb-3">
          <Label>Description</Label>
          <Input
            placeholder="e.g. Loan given to customer"
            value={form.description}
            onChange={(e: any) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
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
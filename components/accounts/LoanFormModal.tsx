"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useSearchParams } from "next/navigation";
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

export default function LoanFormModal({
  open,
  onClose,
  onSubmit,
}: any) {

  const [form, setForm] = useState<CreateLoanRequest>(emptyForm);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "";

  useEffect(() => {
    const idFromUrl = searchParams.get("customerId");
    if (idFromUrl) {
      setForm((prev) => ({ ...prev, loan: { ...prev.loan, customerId: idFromUrl } }));
    }
  }, [searchParams]);

  /* ================================
     loan ACCOUNTS
  ================================= */
  useEffect(() => {
    if (!open) return;

    AccountService.getAccountExchangeLookup().then((res) => {
      setAccounts(res.data?.data || []);
    });
  }, [open]);

  <LoanFormModal
    open={open}
    customerId={customerId}  // ← sidaan
  />

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
     RESET FORM
  ================================= */

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
          <h3 className="font-bold text-lg">Loan</h3>
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

        {/* CUSTOMER */}
        <div className="mb-3">
          <Label>Customer ID</Label>
          <Input
            placeholder="Enter customer ID"
            value={form.loan.customerId}
            onChange={(e: any) =>
              updateLoan("customerId", e.target.value)
            }
          />
          {errors.customer && <p className="text-red-500 text-xs">{errors.customer}</p>}
        </div>

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

        {/* INTEREST */}
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
          <Label>Pay Date</Label>          <Input
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
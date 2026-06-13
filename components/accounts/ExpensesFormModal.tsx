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
export interface CreateExpenseRequest {
  transactionType: number;
  description: string;
  expense: {
    title: string;
    amount: number;
    accountId: string;
    cashAccountId: string;
  };
}

/* ================================
   EMPTY FORM
================================ */
const emptyForm: CreateExpenseRequest = {
  transactionType: 7,
  description: "",
  expense: {
    title: "",
    amount: 0,
    accountId: "",
    cashAccountId: "",
  },
};

export default function ExpenseFormModal({
  open,
  onClose,
  onSubmit,
}: any) {

  const [form, setForm] = useState<CreateExpenseRequest>(emptyForm);
  const [expenseAccounts, setExpenseAccounts] = useState<any[]>([]);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (!open) return;
    AccountService.getAccountExpensesLookup().then((res) => {
      setExpenseAccounts(res.data?.data || []);
    });
    AccountService.getAccountExchangeLookup().then((res) => {
      setCashAccounts(res.data?.data || []);
    });
  }, [open]);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setErrors({});
    }
  }, [open]);

  const updateExpense = (key: keyof CreateExpenseRequest["expense"], value: any) => {
    setForm((prev) => ({
      ...prev,
      expense: { ...prev.expense, [key]: value },
    }));
  };

  const validate = () => {
    const e: any = {};
    if (!form.expense.title)                               e.title       = "Title is required";
    if (!form.expense.amount || form.expense.amount <= 0)  e.amount      = "Amount must be greater than 0";
    if (!form.expense.accountId)                           e.account     = "Expense account required";
    if (!form.expense.cashAccountId)                       e.cash        = "Cash account required";
    if (!form.description)                                 e.description = "Description is required";
    if (form.expense.accountId === form.expense.cashAccountId)
                                                           e.cash        = "Cash account cannot be same as expense account";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const expenseOptions = expenseAccounts.map((a) => ({ value: a.id, label: a.name }));
  const cashOptions    = cashAccounts.map((a)    => ({ value: a.id, label: a.name }));

  if (!open) return null;

  return (
    /* ── Backdrop ── */
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 z-50">
      {/* MEEL 1 — max-h-[90dvh] overflow-y-auto mx-4 ku daray */}
      <div className="w-full max-w-lg bg-white rounded-xl p-5 sm:p-6 shadow-lg max-h-[90dvh] overflow-y-auto mx-4">

        {/* HEADER */}
        {/* MEEL 2 — mb-5, text-base sm:text-lg */}
        <div className="relative flex items-center justify-center mb-5">
          <h3 className="font-bold text-base sm:text-lg">Add Expense</h3>
          {/* MEEL 3 — p-1.5 */}
          <button
            onClick={onClose}
            className="absolute right-0 p-1.5 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* TITLE */}
        {/* MEEL 4 — mb-4 */}
        <div className="mb-4">
          <Label>Title</Label>
          <Input
            placeholder="e.g. Rent, Salary"
            value={form.expense.title}
            onChange={(e: any) => updateExpense("title", e.target.value)}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        {/* AMOUNT */}
        {/* MEEL 4 — mb-4 */}
        <div className="mb-4">
          <Label>Amount</Label>
          <Input
            type="number"
            value={form.expense.amount || ""}
            onChange={(e: any) => updateExpense("amount", Number(e.target.value))}
          />
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
          )}
        </div>

        {/* EXPENSE ACCOUNT */}
        {/* MEEL 4 — mb-4 */}
        <div className="mb-4">
          <Label>Expense Account</Label>
          <Select
            options={expenseOptions}
            value={expenseOptions.find(o => o.value === form.expense.accountId) || null}
            onChange={(v: any) => updateExpense("accountId", v?.value)}
            classNamePrefix="react-select"
          />
          {errors.account && (
            <p className="text-red-500 text-xs mt-1">{errors.account}</p>
          )}
        </div>

        {/* CASH ACCOUNT */}
        {/* MEEL 4 — mb-4 */}
        <div className="mb-4">
          <Label>Cash Account</Label>
          <Select
            options={cashOptions}
            value={cashOptions.find(o => o.value === form.expense.cashAccountId) || null}
            onChange={(v: any) => updateExpense("cashAccountId", v?.value)}
            classNamePrefix="react-select"
          />
          {errors.cash && (
            <p className="text-red-500 text-xs mt-1">{errors.cash}</p>
          )}
        </div>

        {/* DESCRIPTION */}
        {/* MEEL 4 — mb-4 */}
        <div className="mb-4">
          <Label>Description</Label>
          <Input
            placeholder="e.g. April office rent"
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

"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (filters: {
    fromDate?: string;
    toDate?: string;
  }) => void;
}

export default function ExpensSummaryFilterModal({
  open,
  onClose,
  onApply,
}: Props) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-5 sm:p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-center text-gray-900 dark:text-white">
          Filter Expenses By Date
        </h3>

        <div className="space-y-4">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="From date"
          />

          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="To date"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onApply({
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
              })
            }
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

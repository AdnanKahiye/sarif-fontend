"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (filters: {
    fromDate?: string;
    toDate?: string;
    phoneNumber?: string;
  }) => void;
}

export default function InFilterModal({
  open,
  onClose,
  onApply,
}: Props) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-white p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-center">
          Filter Customer Credits
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

          <Input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Phone Number"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onApply({
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                phoneNumber: phoneNumber || undefined,
              })
            }
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

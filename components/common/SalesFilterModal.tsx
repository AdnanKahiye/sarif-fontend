"use client";

import React, { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => void;
}

export default function SalesFilterModal({
  open,
  onClose,
  onApply,
}: Props) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4 text-center">
          Filter Sales
        </h3>

        <div className="space-y-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onApply({
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                status: status || undefined,
              })
            }
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

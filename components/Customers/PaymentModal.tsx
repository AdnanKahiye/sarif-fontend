"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { CustomerService } from "@/lib/customers";

interface Props {
  sale: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ sale, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const paymentAmount = Number(amount);

    if (paymentAmount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    if (paymentAmount > sale.balance) {
      toast.error("Amount exceeds remaining balance");
      return;
    }

    try {
      setLoading(true);

      const res = await CustomerService.addPayment({
        saleId: sale.saleId,
        amount: paymentAmount,
      });

      if (res.data.success) {
        toast.success("Payment added successfully");
        onSuccess();
        onClose();
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-lg p-5 sm:p-6">

        <h3 className="text-lg font-semibold mb-4">
          Add Payment
        </h3>

        <div className="space-y-2 text-sm">
          <p><strong>Customer:</strong> {sale.customerName}</p>
          <p><strong>Total:</strong> {sale.totalAmount}</p>
          <p><strong>Paid:</strong> {sale.paidAmount}</p>
          <p className="text-red-600 font-medium">
            <strong>Balance:</strong> {sale.balance}
          </p>
        </div>

        <div className="mt-4">
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>

      </div>
    </div>
  );
}

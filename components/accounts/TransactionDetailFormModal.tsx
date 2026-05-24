import React from "react";
import { X, FileText, CreditCard, DollarSign, ArrowRightLeft } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  item: any;
}

export default function TransactionDetailModal({ open, onClose, item }: Props) {
  if (!open || !item) return null;

  const details = Array.isArray(item.details) ? item.details : [];

  const getCurrencyCode = (currencyId?: number) => {
    switch (currencyId) {
      case 1: return "USD";
      case 2: return "SOS";
      case 3: return "KES";
      default: return "";
    }
  };

  const formatAmount = (amount?: number) => {
    if (amount === null || amount === undefined || Number.isNaN(amount)) return "0.00";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const isExchange =
    item.transactionType === "Exchange" ||
    item.transactionType === 4 ||
    /exchange|sarif/i.test(item.description || "");

  const isProfitOrFee = (detail: any) =>
    /profit|fee/i.test(detail.accountName || "");

  // ✅ Correct logic:
  // EntryType 1 = Debit = Cash In = You Received
  // EntryType 2 = Credit = Cash Out = You Paid
  const receivedDetail = details.find(
    (d: any) => d.entryType === 1 && !isProfitOrFee(d)
  );

  const paidDetail = details.find(
    (d: any) => d.entryType === 2 && !isProfitOrFee(d)
  );

  const profitDetail = details.find(
    (d: any) => d.entryType === 2 && isProfitOrFee(d)
  );

  const grossAmount = (paidDetail?.amount || 0) + (profitDetail?.amount || 0);

  const businessRows = isExchange && receivedDetail && paidDetail
    ? [
        {
          label: "You Received",
          accountName: receivedDetail.accountName,
          sign: "+",
          amount: receivedDetail.amount,
          currencyId: receivedDetail.currencyId,
          currencyCode: receivedDetail.currencyCode,
          color: "text-emerald-600",
        },
        {
          label: "You Paid",
          accountName: paidDetail.accountName,
          sign: "-",
          amount: paidDetail.amount,
          currencyId: paidDetail.currencyId,
          currencyCode: paidDetail.currencyCode,
          color: "text-rose-600",
        },
        ...(profitDetail
          ? [
              {
                label: "Your Profit",
                accountName: profitDetail.accountName,
                sign: "+",
                amount: profitDetail.amount,
                currencyId: profitDetail.currencyId,
                currencyCode: profitDetail.currencyCode,
                color: "text-emerald-600",
              },
            ]
          : []),
        {
          label: "Customer Received",
          accountName: paidDetail.accountName,
          sign: "+",
          amount: paidDetail.amount,
          currencyId: paidDetail.currencyId,
          currencyCode: paidDetail.currencyCode,
          color: "text-emerald-600",
          highlight: true,
        },
        ...(profitDetail
          ? [
              {
                label: "Gross Before Profit",
                accountName: paidDetail.accountName,
                sign: "+",
                amount: grossAmount,
                currencyId: paidDetail.currencyId,
                currencyCode: paidDetail.currencyCode,
                color: "text-[#405189]",
              },
            ]
          : []),
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-none p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-[#405189]">
            <FileText size={18} />
            <h3 className="font-bold text-sm uppercase tracking-wider">Transaction Details</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Reference No</p>
              <p className="font-semibold text-gray-700">{item.referenceNo || "N/A"}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Agency</p>
              <p className="font-semibold text-gray-700">{item.agencyName || "N/A"}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Description</p>
            <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded">{item.description || "No description"}</p>
          </div>

          <div className="bg-[#405189]/5 p-4 rounded-lg flex justify-between items-center border border-[#405189]/10">
            <span className="text-sm font-bold text-[#405189]">TOTAL AMOUNT</span>
            <span className="text-lg font-bold text-[#405189] flex items-center gap-1">
              <DollarSign size={18} />
              {formatAmount(item.totalAmount)} {getCurrencyCode(item.currencyId)}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold uppercase text-gray-400 mb-3 flex items-center gap-2">
              <ArrowRightLeft size={14} /> Business View
            </p>
            <div className="space-y-2">
              {businessRows.length > 0 ? (
                businessRows.map((row, i) => (
                  <div key={i} className={`flex justify-between items-center text-sm py-2 px-3 rounded ${row.highlight ? "bg-gray-50 border border-gray-100" : "hover:bg-gray-50"}`}>
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-gray-400" />
                      <div>
                        <div className="text-gray-700 font-medium">{row.label}</div>
                        <div className="text-[11px] text-gray-400">{row.accountName}</div>
                      </div>
                    </div>
                    <span className={`font-mono ${row.color}`}>
                      {row.sign} {formatAmount(row.amount)}
                      <span className="text-[10px] text-gray-400 ml-1">
                        {row.currencyCode || getCurrencyCode(row.currencyId)}
                      </span>
                    </span>
                  </div>
                ))
              ) : (
                item.details?.map((d: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm py-2 px-3 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-gray-400" />
                      <span className="text-gray-700 font-medium">{d.accountName}</span>
                    </div>
                    <span className={`font-mono ${d.entryType === 1 ? "text-emerald-600" : "text-rose-600"}`}>
                      {d.entryType === 1 ? "+" : "-"} {formatAmount(d.amount)}
                      <span className="text-[10px] text-gray-400 ml-1">
                        {d.currencyCode || getCurrencyCode(d.currencyId)}
                      </span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <button
            onClick={onClose}
            className="w-full bg-[#405189] text-white py-2.5 rounded shadow-lg hover:bg-[#364574] transition-all font-medium text-sm"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useEffect, useState, useCallback } from "react";
import ExchangeFormModal, { CreateExchangeRequest } from "./ExchangeFormModal";
import ConfirmDeleteModal from "../ui/Model/ConfirmDeleteModal";
import { AccountService } from "@/lib/account";
import toast from "react-hot-toast";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface ExchangeDto {
  id: string;
  rate: number;
  fromAmount: number;
  toAmount: number;
  fee: number;
  profit: number;
  reference: string;
  fromAccountName: string;
  toAccountName: string;
  createdAt: string;
  fromCurrencyId: number;
  toCurrencyId:number
  netAmount: number;
}

export default function ExchangeTable() {
  const today = new Date().toISOString().split("T")[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  const [data, setData] = useState<ExchangeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(today);
  
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExchangeDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

const getCurrencySymbol = (currencyId?: number) => {
  if (!currencyId) return "";

  switch (currencyId) {
    case 1: return "$";
    case 2: return "Sh";
    case 3: return "KSh";
    default: return "";
  }
};


const formatMoney = (amount?: number, currencyId?: number) => {
  const symbol = getCurrencySymbol(currencyId);

  const value = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return (
    <span className="flex items-center gap-1">
      {/* Symbol */}
      <span className="text-gray-400 text-xs font-semibold">
        {symbol}
      </span>

      {/* Amount */}
      <span className="text-gray-900 font-bold">
        {value}
      </span>
    </span>
  );
};




  const itemsPerPage = 10;

  const loadData = useCallback(async (page: number, useFilters: boolean = true) => {
    setLoading(true);
    try {
      const res = await AccountService.getExchanges(
        page, 
        itemsPerPage, 
        useFilters ? fromDate : firstDay, 
        useFilters ? toDate : today
      );
      const apiResponse = res.data?.data;
      if (apiResponse) {
        setData(apiResponse.data || []);
        setTotalItems(apiResponse.totalRecords || 0);
      }
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, firstDay, today]);

  useEffect(() => { loadData(currentPage, true); }, [currentPage]);

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setDeleting(true);
    try {
      await AccountService.deleteTransaction(selectedItem.id);
      toast.success("Transaction deleted");
      setOpenDelete(false);
      loadData(currentPage);
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  const handleEdit = (item: ExchangeDto) => {
    setSelectedItem(item);
    setIsEdit(true);
    setOpenForm(true);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-[#f3f3f9] dark:bg-gray-900 min-h-screen p-4 sm:p-6 font-sans text-[#495057]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-[15px] font-bold uppercase">Exchange List</h2>
          <div className="text-[13px] font-medium text-gray-500">Account &gt; Exchanges</div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <button 
              onClick={() => { setIsEdit(false); setOpenForm(true); }} 
              className="w-full md:w-auto bg-[#0ab39c] text-white px-4 py-2 rounded text-[13px] hover:bg-[#089a86]"
            >
              + Add Exchange
            </button>
            
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2">
              <input type="date" value={fromDate} className="w-full sm:w-auto border p-2 rounded text-[13px]" onChange={(e) => setFromDate(e.target.value)} />
              <input type="date" value={toDate} className="w-full sm:w-auto border p-2 rounded text-[13px]" onChange={(e) => setToDate(e.target.value)} />
              <button onClick={() => loadData(1, true)} className="w-full sm:w-auto bg-[#405189] text-white px-5 py-2 rounded text-[13px] hover:bg-[#364574]">
                Show
              </button>
            </div>
          </div>

         <div className="overflow-x-auto min-h-[300px] relative">
  {loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
      <Loader2 className="animate-spin text-[#405189]" size={30} />
    </div>
  )}

  <table className="w-full text-left border-collapse">
    <thead className="bg-[#f3f6f9] text-[#878a99] text-[13px] font-bold uppercase border-b border-gray-200">
      <tr>
        <th className="p-3">Accounts</th>
        <th className="p-3">From</th>
        <th className="p-3">To</th>
        <th className="p-3">Net</th>
        <th className="p-3">Profit</th>
        {/* <th className="p-3">Rate</th> */}
        <th className="p-3">CreateAt</th>
        <th className="p-3 text-center">Action</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-100">
      {data.map((item) => (
        <tr key={item.id} className="text-[13px] hover:bg-gray-50">

          {/* Accounts */}
          <td className="p-3">
            {item.fromAccountName} → {item.toAccountName}
          </td>

          {/* FROM */}
          <td className="p-3">
            {formatMoney(item.fromAmount, item.fromCurrencyId)}
          </td>

          {/* TO */}
          <td className="p-3 text-[#0ab39c] font-bold">
            {formatMoney(item.toAmount, item.toCurrencyId)}
          </td>
             {/* NET */}
          <td className="p-3 text-[#0ab39c] font-bold">
            {formatMoney(item.netAmount, item.toCurrencyId)}
          </td>

          {/* PROFIT (USD ONLY) */}
          <td className="p-3">
            {formatMoney((item.profit || 0) + (item.fee || 0), 1)}
          </td>

        {/* <td className="p-3">
  {getCurrencySymbol(item.toCurrencyId)} {item.rate?.toLocaleString()}
</td> */}

          {/* DATE */}
          <td className="p-3">
            {new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "2-digit",
            })}
          </td>

          {/* ACTION */}
          <td className="p-3 text-center">
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleEdit(item)}
                className="bg-[#299cdb] text-white px-3 py-1 rounded text-[11px]"
              >
                Edit
              </button>

              <button
                onClick={() => {
                  setSelectedItem(item);
                  setOpenDelete(true);
                }}
                className="bg-[#f06548] text-white px-3 py-1 rounded text-[11px]"
              >
                Remove
              </button>
            </div>
          </td>

        </tr>
      ))}
    </tbody>
  </table>
</div>

          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
             <span className="text-[13px] text-[#878a99]">Showing {startIndex} to {endIndex} of {totalItems} Results</span>
             <div className="flex gap-1">
               <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 border rounded"><ChevronLeft size={16} /></button>
               {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                 <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1.5 rounded text-[13px] ${currentPage === page ? "bg-[#405189] text-white" : "border"}`}>{page}</button>
               ))}
               <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 border rounded"><ChevronRight size={16} /></button>
             </div>
          </div>
        </div>
      </div>
      
<ExchangeFormModal 
  open={openForm}
  onClose={() => setOpenForm(false)}
  onSubmit={async (data: CreateExchangeRequest) => {
    try {
      if (isEdit && selectedItem) {
        // UPDATE
        await AccountService.updateExchange(selectedItem.id, data);
        toast.success("Transaction updated");
      } else {
        // ADD
        await AccountService.createExchange(data);
        toast.success("Transaction created");
      }

      setOpenForm(false);
      loadData(currentPage); // refresh table
    } catch (err) {
      toast.error("Save failed");
    }
  }}
/>
      <ConfirmDeleteModal open={openDelete} loading={deleting} onClose={() => setOpenDelete(false)} onConfirm={confirmDelete} />
    </div>
  );
}
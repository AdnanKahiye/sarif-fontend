"use client";

import React, { useEffect, useState, useCallback } from "react";
import ExchangeModal, { ExchangeFormData } from "./ExchangeSettingsModel";
import ConfirmDeleteModal from "../ui/Model/ConfirmDeleteModal";
import { AccountService } from "@/lib/account";
import toast from "react-hot-toast";
import { usePermission } from "@/context/PermissionContext";
import { Search, Loader2, Pencil, Trash2 } from "lucide-react";

interface ExchangeDto {
    id: number;
    currencyId: number;
    feeRate: number;
    profitRate: number;
    isActive: boolean;
}

export default function ExchangeTable() {
    const { hasPermission } = usePermission();

    const [exchanges, setExchanges] = useState<ExchangeDto[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [openModal, setOpenModal] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [selectedExchange, setSelectedExchange] = useState<ExchangeDto | null>(null);

    const [openDelete, setOpenDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const itemsPerPage = 10;

    // ─── Load Currencies ────────────────────────────────────────────────
    useEffect(() => {
        const loadCurrencies = async () => {
            try {
                const res = await AccountService.getCurrencyLookup();
                setCurrencies(res.data?.data || []);
            } catch (err) {
                console.error("Failed to load currencies", err);
            }
        };
        loadCurrencies();
    }, []);

    // ─── Currency Map: id → code ─────────────────────────────────────────
    const currencyMap: Record<number, string> = Object.fromEntries(
        (currencies || []).map((c: any) => [
            c.id,
            c.code || c.currencyCode || c.name,
        ])
    );

    // ─── Load Exchanges ──────────────────────────────────────────────────
    const loadExchanges = useCallback(async (page: number, searchQuery: string) => {
        setLoading(true);
        try {
            const res = await AccountService.getExchangeSettings();
            console.log("EXCHANGES API FULL:", JSON.stringify(res.data, null, 2));

            // Handle different possible response shapes
            const raw = res.data;
            let list: ExchangeDto[] = [];
            let total = 0;

            if (Array.isArray(raw)) {
                // Shape: res.data = [...]
                list = raw;
                total = raw.length;
            } else if (Array.isArray(raw?.data)) {
                // Shape: res.data = { data: [...] }
                list = raw.data;
                total = raw.totalRecords ?? raw.data.length;
            } else if (Array.isArray(raw?.data?.data)) {
                // Shape: res.data = { data: { data: [...], totalRecords: N } }
                list = raw.data.data;
                total = raw.data.totalRecords ?? raw.data.data.length;
            }

            setExchanges(list);
            setTotalItems(total);
        } catch {
            toast.error("Failed to load exchanges");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadExchanges(currentPage, search);
        }, 400);
        return () => clearTimeout(timer);
    }, [currentPage, search, loadExchanges]);

    // ─── Search ──────────────────────────────────────────────────────────
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    // ─── Add / Edit Submit ───────────────────────────────────────────────
    const handleFormSubmit = async (data: ExchangeFormData) => {
        try {
            if (mode === "add") {
                await AccountService.createExchangeSetting(data);
                toast.success("Exchange created successfully");
            } else {
                if (!selectedExchange) return;
                await AccountService.updateExchangeSetting(selectedExchange.id, data);
                toast.success("Exchange updated successfully");
            }
            setOpenModal(false);
            loadExchanges(currentPage, search);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Operation failed");
        }
    };


    // ─── Pagination ──────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    const canAdd    = hasPermission("CREATE.USER");
    const canEdit   = hasPermission("EDIT.USER");
    const canDelete = hasPermission("DELETE.USER");

    return (
        <div className="bg-[#f3f3f9] dark:bg-gray-900 min-h-screen p-4 sm:p-6 font-sans">
            <div className="mx-auto max-w-7xl">

                {/* Breadcrumb */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[15px] font-bold text-[#495057] dark:text-gray-200 uppercase tracking-wide">
                        List Exchange Settings
                    </h2>
                    <div className="text-[13px] text-[#495057] font-medium">
                        Tables <span className="text-gray-400 mx-1">&gt;</span>
                        <span className="text-gray-400">List Exchange Settings</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">

                    {/* Card Header */}
                    <div className="border-b border-gray-100 dark:border-gray-700 p-4">
                        <h3 className="text-[16px] font-semibold text-[#495057] dark:text-gray-300">
                            Add, Edit
                        </h3>
                    </div>

                    {/* Toolbar */}
                    <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            {canAdd && (
                                <button
                                    onClick={() => {
                                        setMode("add");
                                        setSelectedExchange(null);
                                        setOpenModal(true);
                                    }}
                                    className="bg-[#0ab39c] hover:bg-[#099885] text-white px-4 py-2 rounded text-[13px] flex items-center gap-1 transition-all"
                                >
                                    <span className="text-lg leading-none">+</span> Add Exchange
                                </button>
                            )}
                        </div>

                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded text-[13px] focus:outline-none focus:border-[#405189] dark:bg-gray-900"
                                value={search}
                                onChange={handleSearchChange}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto relative">

                        {/* Refresh overlay (data exists but re-fetching) */}
                        {loading && exchanges.length > 0 && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 z-10 flex items-center justify-center">
                                <Loader2 className="animate-spin text-[#405189]" size={30} />
                            </div>
                        )}

                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#f3f6f9] dark:bg-gray-700/50 text-[#878a99] text-[13px] font-bold uppercase border-y border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="p-3 w-10 text-center">
                                        <input type="checkbox" className="rounded border-gray-300" />
                                    </th>
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Currency</th>
                                    <th className="p-3">Fee Rate</th>
                                    <th className="p-3">Profit Rate</th>
                                    <th className="p-3 text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">

                                {/* ── Initial loading skeleton ── */}
                                {loading && exchanges.length === 0 && <SkeletonRows />}

                                {/* ── Empty state ── */}
                                {!loading && exchanges.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-[13px] text-gray-400">
                                            No exchange settings found.
                                        </td>
                                    </tr>
                                )}

                                {/* ── Data rows ── */}
                                {exchanges.map((exchange) => (
                                    <tr
                                        key={exchange.id}
                                        className="text-[13px] text-[#212529] dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                    >
                                        <td className="p-3 text-center">
                                            <input type="checkbox" />
                                        </td>

                                        <td className="p-3 font-medium">{exchange.id}</td>

                                        <td className="p-3 text-[#878a99]">
                                            {currencyMap[exchange.currencyId] || "Unknown"}
                                        </td>

                                        <td className="p-3">{exchange.feeRate}%</td>

                                        <td className="p-3">{exchange.profitRate}%</td>

                                        {/* ── Action buttons ── */}
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-2">
                                                {canEdit && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedExchange(exchange);
                                                            setMode("edit");
                                                            setOpenModal(true);
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-[12px] font-medium transition-all"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={12} /> Edit
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedExchange(exchange);
                                                            setOpenDelete(true);
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-[12px] font-medium transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                        <span className="text-[13px] text-[#878a99]">
                            Showing <span className="font-semibold">{startIndex}</span> to{" "}
                            <span className="font-semibold">{endIndex}</span> of{" "}
                            <span className="font-semibold">{totalItems}</span> Results
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                disabled={currentPage === 1 || loading}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="px-3 py-1.5 border border-gray-200 rounded text-[13px] disabled:opacity-40"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1.5 rounded text-[13px] ${
                                        currentPage === page
                                            ? "bg-[#405189] text-white"
                                            : "border border-gray-200"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                disabled={currentPage >= totalPages || loading}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="px-3 py-1.5 border border-gray-200 rounded text-[13px] disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modals ── */}
            <ExchangeModal
                open={openModal}
                mode={mode}
                initialData={
                    selectedExchange
                        ? {
                              id: selectedExchange.id,
                              currencyId: selectedExchange.currencyId,
                              feeRate: selectedExchange.feeRate,
                              profitRate: selectedExchange.profitRate,
                          }
                        : undefined
                }
                onClose={() => setOpenModal(false)}
                onSubmit={handleFormSubmit}
            />

            
        </div>
    );
}

// ── Skeleton loading rows ────────────────────────────────────────────────────
function SkeletonRows() {
    return (
        <>
            {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                    <td className="p-3 text-center">
                        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                    </td>
                    {[...Array(4)].map((_, j) => (
                        <td key={j} className="p-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        </td>
                    ))}
                    <td className="p-3">
                        <div className="flex justify-center gap-2">
                            <div className="h-7 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                    </td>
                </tr>
            ))}
        </>
    );
}

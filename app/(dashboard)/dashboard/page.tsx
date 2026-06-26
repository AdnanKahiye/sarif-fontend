"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Wallet,
  TrendingUp,
  CreditCard,
  BarChart3,
  AlertCircle,
  ArrowUpRight,
  User,
  CalendarClock,
  CircleDollarSign,
  ArrowRightLeft,
  Repeat,
  RefreshCcw,
} from "lucide-react";
import { AccountService } from "@/lib/account";

/* =========================
   TYPES
========================= */

type BalanceByCurrency = {
  currencyId: number;
  currencyCode: string;
  balance: number;
};

type DashboardData = {
  totalPayableAccountBase: number;
  totalReceivableAccountBase: number;
  currentBalanceBase: number;
  dailyProfitBase: number;
  todayTransactions: number;
  balancesByCurrency: BalanceByCurrency[];
};

type DashboardApiResponse = {
  data: DashboardData;
  success: boolean;
  message: string;
  errors: string[];
  statusCode: number;
};

type RecentTransaction = {
  referenceNo: string;
  transactionType: string;
  status: string;
  username: string;
  totalAmount: number;
  createdAt: string;
};

type RecentTransactionsApiResponse = {
  data: RecentTransaction[];
  success: boolean;
  message: string;
  errors: string[];
  statusCode: number;
};

type RateMap = Record<string, number>;

type ExchangeRate = {
  id: number;
  rate: number;
  currencyId: number;
  currencyCode: string;
  currencyName: string;
  branchId: number | null;
  branchName: string;
  agencyId: string;
  agencyName: string;
  userId: string;
  userName: string;
};

type ExchangeRateApiResponse = {
  data: {
    items: ExchangeRate[];
    totalCount: number;
  };
  success: boolean;
  message: string;
  errors: string[];
  statusCode: number;
};

/* =========================
   HELPERS
========================= */

function formatBaseAmount(value: number) {
  return `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCurrencyAmount(value: number, currencyCode: string) {
  const amount = Number(value || 0);
  if (currencyCode === "SOS") {
    return `${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })} ${currencyCode}`;
  }
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currencyCode}`;
}

function formatDateTime(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCurrencyIcon(currencyCode: string) {
  const icons: Record<string, string> = {
    USD: "$", SOS: "S", EUR: "€", GBP: "£", AED: "د.إ", KES: "K", ETB: "E",
  };
  return icons[currencyCode] || currencyCode.slice(0, 1);
}

function statusStyle(status: string) {
  const s = status?.toLowerCase();
  if (s === "completed") return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  if (s === "pending") return "bg-amber-50 text-amber-700 border border-amber-100";
  if (s === "cancelled" || s === "failed") return "bg-red-50 text-red-700 border border-red-100";
  return "bg-slate-50 text-slate-600 border border-slate-100";
}

/* =========================
   MAIN COMPONENT
========================= */

export default function DashboardContent() {
  const { user, loading: authLoading } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [transactionsError, setTransactionsError] = useState("");
  const [apiMessage, setApiMessage] = useState("");
  const [transactionsMessage, setTransactionsMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  const PREVIEW_COUNT = 5;

  const fetchDashboard = async () => {
    try {
      setDashboardLoading(true);
      setDashboardError("");
      const response = await AccountService.getDashboardLookup();
      const result: DashboardApiResponse = response.data;
      if (!result.success) {
        setDashboardError(result.message || "Failed to fetch dashboard cards.");
        return;
      }
      setDashboard(result.data);
      setApiMessage(result.message || "Dashboard cards fetched successfully");
    } catch (err: any) {
      setDashboardError(
        err?.response?.data?.message || err?.message || "Something went wrong while loading dashboard."
      );
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      setTransactionsLoading(true);
      setTransactionsError("");
      const response = await AccountService.getRecentTransactions();
      const result: RecentTransactionsApiResponse = response.data;
      if (!result.success) {
        setTransactionsError(result.message || "Failed to fetch recent transactions.");
        return;
      }
      setRecentTransactions(result.data || []);
      setTransactionsMessage(result.message || "Recent transactions fetched");
    } catch (err: any) {
      setTransactionsError(
        err?.response?.data?.message || err?.message || "Something went wrong while loading recent transactions."
      );
    } finally {
      setTransactionsLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchDashboard(), fetchRecentTransactions()]);
  };

  useEffect(() => {
    if (!authLoading && user) {
      refreshAll();
    }
  }, [authLoading, user]);

  const balancesByCurrency = useMemo(() => {
    const source = dashboard?.balancesByCurrency || [];
    const map = new Map<number, BalanceByCurrency>();
    source.forEach((item) => {
      const existing = map.get(item.currencyId);
      if (existing) {
        map.set(item.currencyId, { ...existing, balance: existing.balance + item.balance });
      } else {
        map.set(item.currencyId, item);
      }
    });
    return Array.from(map.values());
  }, [dashboard]);

  const filteredTransactions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return recentTransactions;
    return recentTransactions.filter(
      (item) =>
        item.referenceNo?.toLowerCase().includes(keyword) ||
        item.transactionType?.toLowerCase().includes(keyword) ||
        item.status?.toLowerCase().includes(keyword) ||
        item.username?.toLowerCase().includes(keyword) ||
        String(item.totalAmount).includes(keyword)
    );
  }, [recentTransactions, searchTerm]);

  const isSearching = searchTerm.trim().length > 0;

  // When searching, show all matches. Otherwise show 5 unless "show more" is on.
  const visibleTransactions = useMemo(() => {
    if (isSearching || showAll) return filteredTransactions;
    return filteredTransactions.slice(0, PREVIEW_COUNT);
  }, [filteredTransactions, isSearching, showAll]);

  const hasMore = !isSearching && filteredTransactions.length > PREVIEW_COUNT;

  if (authLoading || !user) return null;

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-slate-50 min-h-screen space-y-4 sm:space-y-5">

      {/* ERRORS */}
      {(dashboardError || transactionsError) && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              {dashboardError && <p className="text-sm font-medium break-words">{dashboardError}</p>}
              {transactionsError && <p className="text-sm font-medium break-words">{transactionsError}</p>}
            </div>
          </div>
          <button
            onClick={refreshAll}
            className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-colors w-full sm:w-auto shrink-0"
          >
            <RefreshCcw size={13} />
            Retry
          </button>
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <MetricCard
          title="Total Profit"
          value={dashboardLoading ? "Loading..." : formatBaseAmount(dashboard?.currentBalanceBase || 0)}
          sub="Overall profit in base currency"
          icon={<Wallet size={15} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Daily Profit"
          value={dashboardLoading ? "Loading..." : formatBaseAmount(dashboard?.dailyProfitBase || 0)}
          sub="Profit recorded today"
          icon={<TrendingUp size={15} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          
        />
        <MetricCard
          title="Today Transactions"
          value={dashboardLoading ? "Loading..." : String(dashboard?.todayTransactions || 0)}
          sub="Transactions processed today"
          icon={<CreditCard size={15} />}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />
        <MetricCard
          title="Receivable / Payable"
          value={
            dashboardLoading
              ? "Loading..."
              : `${formatBaseAmount(dashboard?.totalReceivableAccountBase || 0)} / ${formatBaseAmount(dashboard?.totalPayableAccountBase || 0)}`
          }
          sub="Expected money in and out"
          icon={<BarChart3 size={15} />}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          smallValue
        />
      </div>

      {/* RECENT TRANSACTIONS — full width */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-100">
          <div>
            <p className="text-[15px] font-medium text-slate-900">Recent Transactions</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {transactionsMessage || "Latest transactions from your system"}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search reference, type, user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#1D4ED8]/15 focus:border-[#1D4ED8]/40 transition-all"
            />
          </div>
        </div>

        {/* DESKTOP / TABLET TABLE — hidden on small screens */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr>
                {["Reference", "Type", "User", "Amount", "Date", "Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-[11px] font-medium text-slate-400 border-b border-slate-100 whitespace-nowrap bg-slate-50/60"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactionsLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-3.5 bg-slate-100 rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visibleTransactions.length > 0 ? (
                visibleTransactions.map((trx) => (
                  <TrxRow key={trx.referenceNo} trx={trx} />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <p className="text-sm font-medium text-slate-500">No recent transactions found</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing the search field or refresh the data.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD LIST — hidden on md+ */}
        <div className="md:hidden divide-y divide-slate-100">
          {transactionsLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-4 space-y-2.5">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
              </div>
            ))
          ) : visibleTransactions.length > 0 ? (
            visibleTransactions.map((trx) => (
              <TrxCard key={trx.referenceNo} trx={trx} />
            ))
          ) : (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-500">No recent transactions found</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing the search field or refresh the data.</p>
            </div>
          )}
        </div>

        {/* SHOW MORE / LESS */}
        {!transactionsLoading && hasMore && (
          <div className="border-t border-slate-100 p-3 flex justify-center">
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="text-[13px] font-medium text-[#1D4ED8] hover:bg-blue-50 px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              {showAll
                ? "Show less"
                : `Show more (${filteredTransactions.length - PREVIEW_COUNT})`}
            </button>
          </div>
        )}
      </div>

      {/* CURRENCY CONVERTER + CURRENCY OVERVIEW — side by side on xl */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
        <CurrencyConverter />

        {/* CURRENCY OVERVIEW */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-slate-900">Currency Overview</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {apiMessage || "Balances currently available in your accounts"}
              </p>
            </div>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full shrink-0">
              {balancesByCurrency.length} active
            </span>
          </div>

          {dashboardLoading ? (
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : balancesByCurrency.length > 0 ? (
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
              {balancesByCurrency.map((item) => (
                <CurrencyOverviewCard key={`co-${item.currencyId}`} item={item} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 rounded-xl py-8 text-center">
              <p className="text-sm font-medium text-slate-500">No currency balances available</p>
              <p className="text-xs text-slate-400 mt-1">Once accounts have balances, they will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   CURRENCY CONVERTER
========================= */

function CurrencyConverter() {
  const [amount, setAmount]               = useState<string>("100");
  const [from, setFrom]                   = useState<string>("");
  const [to, setTo]                       = useState<string>("");
  const [rates, setRates]                 = useState<RateMap>({});
  const [currencies, setCurrencies]       = useState<string[]>([]);
  const [ratesLoading, setRatesLoading]   = useState(true);
  const [ratesError, setRatesError]       = useState("");
  const [convertedResult, setConvertedResult]     = useState<number | null>(null);
  const [convertedUnitRate, setConvertedUnitRate] = useState<number | null>(null);
  const [convertedFrom, setConvertedFrom]         = useState<string>("");
  const [convertedTo, setConvertedTo]             = useState<string>("");

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setRatesLoading(true);
        setRatesError("");

        const response = await AccountService.getExchangeRates(1, 100, "");
        const result: ExchangeRateApiResponse = response.data;

        if (!result.success) {
          setRatesError(result.message || "Failed to load exchange rates.");
          return;
        }

        const items: ExchangeRate[] = result.data?.items || [];

        // Build RateMap — USD is always base = 1, API items are other currencies
        const map: RateMap = { USD: 1 };
        items.forEach((item) => {
          if (item.currencyCode && item.currencyCode !== "USD" && item.rate > 0) {
            map[item.currencyCode] = item.rate;
          }
        });
        setRates(map);

        // Build unique currency list — USD first, then API currencies
        const apiCodes = items
          .map((i) => i.currencyCode)
          .filter((code) => code && code !== "USD");
        const unique = ["USD", ...Array.from(new Set(apiCodes))];
        setCurrencies(unique);

        // Set default from/to on first load
        setFrom(unique[0] ?? "");
        setTo(unique[1] ?? unique[0] ?? "");
      } catch (err: any) {
        setRatesError(
          err?.response?.data?.message || err?.message || "Network error. Could not fetch rates."
        );
      } finally {
        setRatesLoading(false);
      }
    };

    fetchRates();
  }, []);

  const swap = () => {
    setFrom(to);
    setTo(from);
    setConvertedResult(null);
    setConvertedUnitRate(null);
  };

  const handleConvert = () => {
    const amt = parseFloat(amount);

    if (isNaN(amt) || amt <= 0) {
      setRatesError("Please enter a valid amount greater than 0.");
      return;
    }

    const f = rates[from];
    const t = rates[to];

    if (!f) {
      setRatesError(`Rate not available for ${from}.`);
      return;
    }

    if (!t) {
      setRatesError(`Rate not available for ${to}.`);
      return;
    }

    setRatesError("");
    setConvertedResult((amt / f) * t);
    setConvertedUnitRate(t / f);
    setConvertedFrom(from);
    setConvertedTo(to);
  };

  const selClass =
    "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1D4ED8]/15 focus:border-[#1D4ED8]/40 transition-all cursor-pointer";

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0">
          <ArrowRightLeft size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-slate-900">Currency Converter</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {ratesLoading ? "Loading rates..." : `${currencies.length} currencies available`}
          </p>
        </div>
        {ratesLoading && (
          <div className="w-4 h-4 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin shrink-0" />
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {ratesError && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg break-words">
            {ratesError}
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Amount</label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setConvertedResult(null);
              setRatesError("");
            }}
            placeholder="0.00"
            className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#1D4ED8]/15 focus:border-[#1D4ED8]/40 transition-all"
          />
        </div>

        {/* From / Swap / To */}
        <div className="flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">From</label>
            <select
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setConvertedResult(null);
                setRatesError("");
              }}
              disabled={ratesLoading}
              className={`mt-1.5 ${selClass}`}
            >
              {currencies.map((c) => (
                <option key={`f-${c}`} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={swap}
            disabled={ratesLoading}
            className="shrink-0 w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 text-[#1D4ED8] flex items-center justify-center hover:bg-slate-100 transition-colors mb-px cursor-pointer disabled:opacity-40"
            aria-label="Swap currencies"
          >
            <Repeat size={14} />
          </button>

          <div className="flex-1 min-w-0">
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">To</label>
            <select
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setConvertedResult(null);
                setRatesError("");
              }}
              disabled={ratesLoading}
              className={`mt-1.5 ${selClass}`}
            >
              {currencies.map((c) => (
                <option key={`t-${c}`} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={ratesLoading || !amount || !from || !to}
          className="w-full bg-[#1D4ED8] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowRightLeft size={14} />
          Convert
        </button>

        {/* Result */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-center">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            {convertedTo || to || "—"} you receive
          </p>
          {ratesLoading ? (
            <div className="mt-2 h-8 bg-slate-200 rounded animate-pulse w-40 mx-auto" />
          ) : (
            <p className="mt-1.5 text-xl sm:text-2xl font-medium text-[#1D4ED8] break-words">
              {convertedResult === null ? "—" : formatCurrencyAmount(convertedResult, convertedTo)}
            </p>
          )}
          {convertedUnitRate !== null && convertedFrom && convertedTo && (
            <p className="text-[11px] text-slate-400 mt-1">
              1 {convertedFrom} = {formatCurrencyAmount(convertedUnitRate, convertedTo)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   SUB-COMPONENTS
========================= */

function MetricCard({
  title,
  value,
  sub,
  icon,
  iconBg,
  iconColor,
  smallValue,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  smallValue?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-4 flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">{title}</span>
        <div className={`w-7 h-7 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>
      <p className={`font-medium text-slate-900 leading-snug break-words ${smallValue ? "text-sm sm:text-base" : "text-xl sm:text-[22px]"}`}>
        {value}
      </p>
      <p className="text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

function CurrencyOverviewCard({ item }: { item: BalanceByCurrency }) {
  const isPositive = item.balance >= 0;
  return (
    <div className="border border-slate-100 bg-slate-50/70 rounded-xl p-4 hover:bg-white hover:shadow-sm transition-all">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-[11px] text-slate-400">{item.currencyCode} Balance</p>
          <p className="text-[13px] font-medium text-slate-700 mt-0.5">{item.currencyCode}</p>
        </div>
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
            isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {getCurrencyIcon(item.currencyCode)}
        </div>
      </div>
      <p className={`text-base font-medium break-words ${isPositive ? "text-emerald-700" : "text-red-600"}`}>
        {formatCurrencyAmount(item.balance, item.currencyCode)}
      </p>
      <p className="text-[11px] text-slate-400 mt-0.5">
        {isPositive ? "Available balance" : "Needs attention"}
      </p>
    </div>
  );
}

function TrxRow({ trx }: { trx: RecentTransaction }) {
  return (
    <tr className="hover:bg-slate-50/70 transition-colors">
      <td className="px-4 py-3.5">
        <span className="font-mono text-[12px] text-slate-400">{trx.referenceNo}</span>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0">
            <ArrowUpRight size={13} />
          </div>
          <span className="text-[13px] font-medium text-slate-700">{trx.transactionType}</span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 text-slate-600">
          <User size={13} className="text-slate-400" />
          <span className="text-[13px]">{trx.username}</span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 font-medium text-slate-900">
          <CircleDollarSign size={13} className="text-slate-400" />
          {formatBaseAmount(trx.totalAmount)}
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 text-slate-500">
          <CalendarClock size={13} className="text-slate-400" />
          <span className="text-[12px] whitespace-nowrap">{formatDateTime(trx.createdAt)}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 text-right">
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusStyle(trx.status)}`}>
          {trx.status}
        </span>
      </td>
    </tr>
  );
}

function TrxCard({ trx }: { trx: RecentTransaction }) {
  return (
    <div className="p-4 hover:bg-slate-50/70 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0">
            <ArrowUpRight size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-slate-700 truncate">{trx.transactionType}</p>
            <p className="font-mono text-[11px] text-slate-400 truncate">{trx.referenceNo}</p>
          </div>
        </div>
        <span className={`inline-flex shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusStyle(trx.status)}`}>
          {trx.status}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 pl-10">
        <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
          <User size={13} className="text-slate-400 shrink-0" />
          <span className="text-[13px] truncate">{trx.username}</span>
        </div>
        <span className="flex items-center gap-1 text-[13px] font-medium text-slate-900 shrink-0">
          <CircleDollarSign size={13} className="text-slate-400" />
          {formatBaseAmount(trx.totalAmount)}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-500 mt-1.5 pl-10">
        <CalendarClock size={13} className="text-slate-400 shrink-0" />
        <span className="text-[12px]">{formatDateTime(trx.createdAt)}</span>
      </div>
    </div>
  );
}

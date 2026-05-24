"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Wallet,
  TrendingUp,
  CreditCard,
  BarChart3,
  RefreshCcw,
  AlertCircle,
  ArrowUpRight,
  User,
  CalendarClock,
  CircleDollarSign,
  Activity,
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

type CashFlowTodayByCurrency = {
  currencyId: number;
  currencyCode: string;
  cashInToday: number;
  cashOutToday: number;
  netToday: number;
};

type DashboardData = {
  totalPayableAccountBase: number;
  totalReceivableAccountBase: number;
  currentBalanceBase: number;
  dailyProfitBase: number;
  todayTransactions: number;
  balancesByCurrency: BalanceByCurrency[];
  cashFlowTodayByCurrency: CashFlowTodayByCurrency[];
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
    return `${amount.toLocaleString("en-US", {
      maximumFractionDigits: 0,
    })} ${currencyCode}`;
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
    USD: "$",
    SOS: "S",
    EUR: "€",
    GBP: "£",
    AED: "د.إ",
    KES: "K",
    ETB: "E",
  };

  return icons[currencyCode] || currencyCode.slice(0, 1);
}

function statusStyle(status: string) {
  const normalized = status?.toLowerCase();

  if (normalized === "completed") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  if (normalized === "pending") {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }

  if (normalized === "cancelled" || normalized === "failed") {
    return "bg-red-50 text-red-700 border-red-100";
  }

  return "bg-slate-50 text-slate-700 border-slate-100";
}

/* =========================
   MAIN COMPONENT
========================= */

export default function DashboardContent() {
  const { user, loading: authLoading } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<
    RecentTransaction[]
  >([]);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  const [dashboardError, setDashboardError] = useState("");
  const [transactionsError, setTransactionsError] = useState("");

  const [apiMessage, setApiMessage] = useState("");
  const [transactionsMessage, setTransactionsMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

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
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while loading dashboard."
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
        setTransactionsError(
          result.message || "Failed to fetch recent transactions."
        );
        return;
      }

      setRecentTransactions(result.data || []);
      setTransactionsMessage(result.message || "Recent transactions fetched");
    } catch (err: any) {
      setTransactionsError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while loading recent transactions."
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
      const old = map.get(item.currencyId);

      if (old) {
        map.set(item.currencyId, {
          ...old,
          balance: old.balance + item.balance,
        });
      } else {
        map.set(item.currencyId, item);
      }
    });

    return Array.from(map.values());
  }, [dashboard]);

  const cashFlowToday = useMemo(() => {
    const source = dashboard?.cashFlowTodayByCurrency || [];
    const map = new Map<number, CashFlowTodayByCurrency>();

    source.forEach((item) => {
      const old = map.get(item.currencyId);

      if (old) {
        map.set(item.currencyId, {
          ...old,
          cashInToday: old.cashInToday + item.cashInToday,
          cashOutToday: old.cashOutToday + item.cashOutToday,
          netToday: old.netToday + item.netToday,
        });
      } else {
        map.set(item.currencyId, item);
      }
    });

    return Array.from(map.values());
  }, [dashboard]);

  const filteredTransactions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return recentTransactions;

    return recentTransactions.filter((item) => {
      return (
        item.referenceNo?.toLowerCase().includes(keyword) ||
        item.transactionType?.toLowerCase().includes(keyword) ||
        item.status?.toLowerCase().includes(keyword) ||
        item.username?.toLowerCase().includes(keyword) ||
        String(item.totalAmount).includes(keyword)
      );
    });
  }, [recentTransactions, searchTerm]);

  if (authLoading || !user) return null;

  return (
    <div className="max-w-[1600px] mx-auto p-4 space-y-6">
      {/* TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.18em]">
            Financial Overview
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
            Welcome back, {user?.userId || "User"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here is the latest summary of your balances and transactions.
          </p>
        </div>

        <button
          onClick={refreshAll}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl text-sm font-semibold hover:bg-slate-800 transition"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {/* ERRORS */}
      {(dashboardError || transactionsError) && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5" />
            <div>
              {dashboardError && (
                <p className="text-sm font-semibold">{dashboardError}</p>
              )}
              {transactionsError && (
                <p className="text-sm font-semibold">{transactionsError}</p>
              )}
            </div>
          </div>

          <button
            onClick={refreshAll}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}


























      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Profit"
          value={
            dashboardLoading
              ? "Loading..."
              : formatBaseAmount(dashboard?.currentBalanceBase || 0)
          }
          subtitle="Overall profit in base currency"
          icon={<Wallet size={20} />}
          color="blue"
        />

        <DashboardCard
          title="Daily Profit"
          value={
            dashboardLoading
              ? "Loading..."
              : formatBaseAmount(dashboard?.dailyProfitBase || 0)
          }
          subtitle="Profit recorded today"
          icon={<TrendingUp size={20} />}
          color="emerald"
        />

        <DashboardCard
          title="Today Transactions"
          value={
            dashboardLoading
              ? "Loading..."
              : String(dashboard?.todayTransactions || 0)
          }
          subtitle="Transactions processed today"
          icon={<CreditCard size={20} />}
          color="violet"
        />

        <DashboardCard
          title="Receivable / Payable"
          value={
            dashboardLoading
              ? "Loading..."
              : `${formatBaseAmount(
                  dashboard?.totalReceivableAccountBase || 0
                )} / ${formatBaseAmount(dashboard?.totalPayableAccountBase || 0)}`
          }
          subtitle="Expected money in and money out"
          icon={<BarChart3 size={20} />}
          color="orange"
        />
      </div>

      {/* REAL CURRENCY OVERVIEW */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Currency Overview
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {apiMessage || "Balances currently available in your accounts"}
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
            {balancesByCurrency.length} active currencies
          </span>
        </div>

        {dashboardLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <MiniSkeleton />
            <MiniSkeleton />
          </div>
        ) : balancesByCurrency.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {balancesByCurrency.map((item) => (
              <CurrencyOverviewCard
                key={`currency-overview-${item.currencyId}`}
                item={item}
              />
            ))}
          </div>
        ) : (
          <EmptyBox
            title="No currency balances available"
            description="Once accounts have balances, they will appear here."
          />
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* RECENT TRANSACTIONS */}
        <div className="xl:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Recent Transactions
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {transactionsMessage || "Latest transactions from your system"}
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search reference, type, user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/60 text-[10px] uppercase font-semibold text-slate-400">
                <tr>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {transactionsLoading ? (
                  <>
                    <TransactionSkeletonRow />
                    <TransactionSkeletonRow />
                    <TransactionSkeletonRow />
                  </>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((trx) => (
                    <TrxRow key={trx.referenceNo} trx={trx} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-500">
                          No recent transactions found
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try clearing the search field or refresh the data.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* CASH FLOW */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">
                Cash Flow Today
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Cash in, cash out, and net movement
              </p>
            </div>

            <div className="p-6">
              {dashboardLoading ? (
                <MiniSkeleton />
              ) : cashFlowToday.length > 0 ? (
                <div className="space-y-4">
                  {cashFlowToday.map((item) => (
                    <CashFlowMiniCard
                      key={`cash-flow-${item.currencyId}`}
                      item={item}
                    />
                  ))}
                </div>
              ) : (
                <EmptyBox
                  title="No cash flow today"
                  description="There is no cash movement recorded for today."
                />
              )}
            </div>
          </div>

        
        </div>
      </div>
    </div>
  );
}

/* =========================
   COMPONENTS
========================= */

function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "violet" | "orange";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 px-6 py-5 shadow-sm hover:shadow-md transition min-w-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
            {title}
          </p>
          <h3 className="text-xl font-bold text-slate-900 mt-2 truncate">
            {value}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>

        <div
          className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ${colors[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function CurrencyOverviewCard({ item }: { item: BalanceByCurrency }) {
  const isPositive = item.balance >= 0;

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 hover:bg-white hover:shadow-sm transition">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-slate-400 font-medium">
            {item.currencyCode} Balance
          </p>
          <h3 className="text-xl font-semibold text-slate-800 mt-1">
            {item.currencyCode}
          </h3>
        </div>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
            isPositive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {getCurrencyIcon(item.currencyCode)}
        </div>
      </div>

      <p
        className={`mt-4 text-lg font-semibold ${
          isPositive ? "text-emerald-700" : "text-red-700"
        }`}
      >
        {formatCurrencyAmount(item.balance, item.currencyCode)}
      </p>

      <p className="text-[11px] text-slate-400 mt-1">
        {isPositive ? "Available account balance" : "Balance needs attention"}
      </p>
    </div>
  );
}

function CashFlowMiniCard({ item }: { item: CashFlowTodayByCurrency }) {
  const positive = item.netToday >= 0;

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">{item.currencyCode}</h3>

        <span
          className={`px-3 py-1 rounded-full text-[10px] font-semibold ${
            positive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          Net
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div>
          <p className="text-[10px] uppercase font-semibold text-slate-400">
            Cash In
          </p>
          <p className="text-xs font-semibold text-emerald-700 mt-1">
            {formatCurrencyAmount(item.cashInToday, item.currencyCode)}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase font-semibold text-slate-400">
            Cash Out
          </p>
          <p className="text-xs font-semibold text-red-700 mt-1">
            {formatCurrencyAmount(item.cashOutToday, item.currencyCode)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-lg font-bold text-slate-900">
        {formatCurrencyAmount(item.netToday, item.currencyCode)}
      </p>
    </div>
  );
}

function TrxRow({ trx }: { trx: RecentTransaction }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4">
        <p className="text-xs font-mono text-slate-500">{trx.referenceNo}</p>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <ArrowUpRight size={15} />
          </div>
          <span className="font-semibold text-slate-700">
            {trx.transactionType}
          </span>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-slate-600">
          <User size={14} />
          <span className="text-xs font-semibold">{trx.username}</span>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <CircleDollarSign size={15} className="text-slate-400" />
          {formatBaseAmount(trx.totalAmount)}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-slate-500">
          <CalendarClock size={14} />
          <span className="text-xs font-semibold">
            {formatDateTime(trx.createdAt)}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-right">
        <span
          className={`inline-flex border px-3 py-1 rounded-full text-[10px] font-semibold ${statusStyle(
            trx.status
          )}`}
        >
          {trx.status}
        </span>
      </td>
    </tr>
  );
}

function EmptyBox({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="col-span-full border border-dashed border-slate-200 rounded-2xl p-8 text-center">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
  );
}

function MiniSkeleton() {
  return <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />;
}

function DarkSkeleton() {
  return <div className="h-20 bg-white/10 rounded-2xl animate-pulse" />;
}

function TransactionSkeletonRow() {
  return (
    <tr>
      <td className="px-6 py-4">
        <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="h-4 w-16 bg-slate-100 rounded animate-pulse ml-auto" />
      </td>
    </tr>
  );
}
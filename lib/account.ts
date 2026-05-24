// 1. Ka saar kuwan waayo looma baahna (waxay keeni karaan error dhanka build-ka)
// import { rawListeners } from "process"; 
// import { data } from "framer-motion/m";
// import { get } from "http";

// import { create } from "domain";
import api from "./api";

export const AccountService = {

  // --- CURRENCY ---
  getCurrencies(page: number = 1, pageSize: number = 10, search: string = "") {
    return api.get(`/Account/currency?page=${page}&pageSize=${pageSize}&search=${search}`);
  },

  CreateCurrency(data: any) {
    return api.post("/Account/currency", data);
  },

  updateCurrency(id: string, data: any) {
    return api.put(`/Account/currency/${id}`, data);
  },

  deleteCurrency(id: string) {
    return api.delete(`/Account/currency/${id}`);
  },

  // --- EXCHANGE RATE ---
  getExchangeRates(page: number = 1, pageSize: number = 10, search: string = "") {
    return api.get(`/Account/exchange-rate?page=${page}&pageSize=${pageSize}&search=${search}`);
  },

  CreateExchangeRate(data: any) {
    return api.post("/Account/exchange-rate", data);
  },

  updateExchangeRate(id: string, data: any) {
    return api.put(`/Account/exchange-rate/${id}`, data);
  },

  deleteExchangeRate(id: string) {
    return api.delete(`/Account/exchange-rate/${id}`);
  },


  // Ku dar method-kaan gudaha exchange-settings

  getExchangeSettings() {
    return api.get("/Account/exchange-settings");
  },

  createExchangeSetting(data: any) {
    return api.post("/Account/exchange-settings", data);
  },

  updateExchangeSetting(id: number, data: any) {
    return api.put(`/Account/exchange-settings/${id}`, data);
  },

  // --- ACCOUNTS (Hadda waa ay isku mid yihiin magacyada Table-kaaga) ---
  getAccounts(page: number = 1, pageSize: number = 10, search: string = "") {
    return api.get(`/Account/account?page=${page}&pageSize=${pageSize}&search=${search}`);
  },

  createAccount(data: any) {
    return api.post("/Account/account", data);
  },

  updateAccount(id: string, data: any) {
    return api.put(`/Account/account/${id}`, data);
  },

  deleteAccount(id: string) {
    return api.delete(`/Account/account/${id}`);
  },

  // --- TRANSACTIONS ---
  getTransactionHistory(page: number = 1, pageSize: number = 10, search: string = "") {
    return api.get(`/Account/transaction?page=${page}&pageSize=${pageSize}&search=${search}`);
  },

  deleteTransaction(id: string) {
    return api.delete(`/Account/transaction/${id}`);
  },



  getBalanceAccountSummary(
    page: number = 1,
    pageSize: number = 10,
    search: string = "",
    fromDate?: string, // Taariikhda bilowga
    toDate?: string,   // Taariikhda dhamaadka
    accountType?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      search
    });

    // Ku dar filtarrada haddii ay jiraan
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    if (accountType) params.append("accountType", accountType);

    return api.get(`/Account/balances-summary?${params.toString()}`);
  },

  getProfitLoss(fromDate?: string, toDate?: string) {
    const params = new URLSearchParams();
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    return api.get(`/Account/profit-loss?${params.toString()}`);
  },


  getDailyReport(page: number, pageSize: number, fromDate?: string, toDate?: string) {
    return api.get(`/Account/daily-report?page=${page}&pageSize=${pageSize}&fromDate=${fromDate}&toDate=${toDate}`);
  },

  getProfitDetailLoss(page: number, pageSize: number, fromDate?: string, toDate?: string) {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    return api.get(`/Account/profit-loss-detailed?${params.toString()}`);
  },


  // Si aad u hubiso in URL-ku uu sax yahay:
  getAccountStatement(
    id: string,
    page: number,
    pageSize: number,
    entryType?: number | null,
    fromDate?: string,
    toDate?: string
  ) {
    // Waxaan isticmaalayaa URLSearchParams si aan u dhisno query string sax ah
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());

    if (entryType !== undefined && entryType !== null) {
      params.append("entryType", entryType.toString());
    }
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    // ID-ga wuxuu ku jiraa URL-ka (path parameter), inta kalena waa query params
    return api.get(`/Account/account-statement/${id}?${params.toString()}`);
  },


  getAccountsLookup() {
    return api.get("/Account/accounts-lookup");
  },

  getAccountExchangeLookup() {
    return api.get("/Account/account-exchange-lookup");
  },

  getAccountExpensesLookup() {
    return api.get("/Account/account-expenses-lookup");
  },


  getCurrencyLookup() {
    return api.get("/Account/currency-lookup");
  },



  createExchange(data: any) {
    //console.log("Creating user with data:", data);
    return api.post("/Account/transaction", data);
  },

  // Ku dar method-kaan gudaha AccountService
  getExchanges(
    page: number = 1,
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    return api.get(`/Account/exchanges?${params.toString()}`);
  },


  updateExchange(id: string, data: any) {
    return api.put(`/Account/exchange/${id}`, data);
  },


  // Ku dar method-kaan gudaha AccountService
  getDeposits(
    page: number = 1,
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    return api.get(`/Account/deposits?${params.toString()}`);
  },


  updateDeposit(id: string, data: any) {
    return api.put(`/Account/deposit/${id}`, data);
  },
  createDeposit(data: any) {
    //console.log("Creating user with data:", data);
    return api.post("/Account/transaction", data);
  },





  // Ku dar method-kaan gudaha AccountService
  getWithdrawals(
    page: number = 1,
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    return api.get(`/Account/withdrawals?${params.toString()}`);
  },


  updateWithdrawal(id: string, data: any) {
    return api.put(`/Account/deposit/${id}`, data);
  },
  createWithdraw(data: any) {
    //console.log("Creating user with data:", data);
    return api.post("/Account/transaction", data);
  },



  // Ku dar method-kaan gudaha AccountService
  getExpenses(
    page: number = 1,
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    return api.get(`/Account/expenses?${params.toString()}`);
  },


  updateExpense(id: string, data: any) {
    return api.put(`/Account/expense/${id}`, data);
  },
  createExpense(data: any) {
    //console.log("Creating user with data:", data);
    return api.post("/Account/transaction", data);
  },


  // Ku dar method-kaan gudaha exchange-settings



  // Ku dar method-kaan gudaha AccountService
  getLoans(
    page: number = 1,
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    return api.get(`/Account/loans?${params.toString()}`);
  },


  updateLoan(id: string, data: any) {
    return api.put(`/Account/loan/${id}`, data);
  },
  createLoan(data: any) {
    //console.log("Creating user with data:", data);
    return api.post("/Account/transaction", data);
  },



  // Ku dar method-kaan gudaha AccountService
  getTransfers(
    page: number = 1,
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    return api.get(`/Account/transfers?${params.toString()}`);
  },


  updateTransfer(id: string, data: any) {
    return api.put(`/Account/transfer/${id}`, data);
  },
  createTransfer(data: any) {
    //console.log("Creating user with data:", data);
    return api.post("/Account/transaction", data);
  },



  // Ku dar method-kaan gudaha AccountService
  getRepayments(
    page: number = 1,
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    return api.get(`/Account/loanPayment?${params.toString()}`);
  },


  updateRepayment(id: string, data: any) {
    return api.put(`/Account/loanPayment/${id}`, data);
  },
  createRepayment(data: any) {
    //console.log("Creating user with data:", data);
    return api.post("/Account/transaction", data);
  },

  getAccountRevenueLookup() {
    return api.get("/Account/account-revenue-lookup");
  },


  // Ku dar method-kaan gudaha AccountService
  getRevenues(
    page: number = 1,
    pageSize: number = 10,
    fromDate?: string,
    toDate?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    return api.get(`/Account/revinues?${params.toString()}`);
  },


  updateRevenue(id: string, data: any) {
    return api.put(`/Account/revenue/${id}`, data);
  },
  createRevenue(data: any) {
    //console.log("Creating user with data:", data);
    return api.post("/Account/transaction", data);
  },

};

"use client";

import React, { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import toast from "react-hot-toast";
import { CustomerService } from "@/lib/customers";
import InFilterModal from "@/components/common/DateFromToDateModal";

interface CustomerDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  type: string;
  createdAt: string;
}

interface ServiceItemDto {
  id: string;
  name: string;
  possiblePrice: number;
}

export default function CustomerSalesTable() {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [services, setServices] = useState<ServiceItemDto[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<{
    phoneNumber?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  useEffect(() => {
    loadCustomers();
  }, [page, filters]);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadCustomers() {
    try {
      const res = await CustomerService.getAllBySalesCustomer(
        page,
        pageSize,
        filters.phoneNumber,
        filters.startDate,
        filters.endDate
      );

      if (res.data.success) {
        setCustomers(res.data.data?.data || []);
      }
    } catch {
      toast.error("Failed to load customers");
    }
  }

  async function loadServices() {
    try {
      const res = await CustomerService.getAllServicesItems();
      if (res.data.success) {
        setServices(res.data.data?.data || []);
      }
    } catch {
      toast.error("Failed to load services");
    }
  }

  function addService(service: ServiceItemDto) {
    const exists = selectedItems.find(i => i.serviceItemId === service.id);
    if (exists) return;

    setSelectedItems(prev => [
      ...prev,
      {
        serviceItemId: service.id,
        name: service.name,
        price: service.possiblePrice
      }
    ]);
  }

  function removeService(serviceItemId: string) {
    setSelectedItems(prev =>
      prev.filter(item => item.serviceItemId !== serviceItemId)
    );
  }

  const subTotal = selectedItems.reduce(
    (acc, item) => acc + item.price,
    0
  );

  const calculatedTotal = subTotal - discount;

  useEffect(() => {
    setPaidAmount(calculatedTotal > 0 ? calculatedTotal : 0);
  }, [discount, subTotal]);

  async function handleCreateSale() {
    if (!selectedCustomer) {
      toast.error("Select a customer first");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Select at least one service");
      return;
    }

    const payload = {
      customerId: selectedCustomer.id,
      discount,
      paidAmount,
      status: "Pending",
      items: selectedItems.map(i => ({
        serviceItemId: i.serviceItemId,
        price: i.price,
        quantity: 1
      })),
    };

    try {
      const res = await CustomerService.createSales(payload);
      if (res.data.success) {
        toast.success("Sale created successfully");
        setSelectedItems([]);
        setDiscount(0);
        setPaidAmount(0);
      }
    } catch {
      toast.error("Failed to create sale");
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">
          Customer Sales
        </h2>

        <button
          onClick={() => setFilterOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg 
                     hover:bg-indigo-700 transition shadow-sm"
        >
          Filter
        </button>
      </div>

      {/* FILTER MODAL */}
      <InFilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setFilters({
            phoneNumber: f.phoneNumber,
            startDate: f.fromDate,
            endDate: f.toDate
          });
          setPage(1);
          setFilterOpen(false);
        }}
      />

      {/* CUSTOMER TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="relative">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Phone</th>
                <th className="px-6 py-4 text-left">Type</th>
                <th className="px-6 py-4 text-left">Address</th>
                <th className="px-6 py-4 text-left">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {customers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className={`cursor-pointer transition-all duration-150
                    ${selectedCustomer?.id === c.id
                      ? "bg-indigo-50 border-l-4 border-indigo-600"
                      : "hover:bg-gray-50"
                    }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {c.fullName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {c.email}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {c.phoneNumber}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {c.type}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {c.address}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(c.createdAt).toISOString().split("T")[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Mobile cards */}
          <div className="block md:hidden divide-y divide-gray-100">
            {customers.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className={`px-4 py-3 cursor-pointer transition-all duration-150 ${selectedCustomer?.id === c.id ? "bg-indigo-50 border-l-4 border-indigo-600" : "hover:bg-gray-50"}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-gray-800 text-sm truncate">{c.fullName}</span>
                  <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 shrink-0">{c.type}</span>
                </div>
                <div className="text-xs text-gray-600 truncate">{c.email}</div>
                <div className="text-xs text-gray-500">{c.phoneNumber}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SALES SECTION */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Select Service
          </h3>

          <Input
            placeholder="Search service"
            className="h-10 w-full mb-4"
          />

          <div className="max-h-72 overflow-y-auto border rounded-lg divide-y">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => addService(service)}
                className="flex justify-between items-center px-4 py-3 
                           hover:bg-indigo-50 cursor-pointer transition"
              >
                <span className="text-gray-700 font-medium">
                  {service.name}
                </span>
                <span className="text-indigo-600 font-semibold">
                  {service.possiblePrice}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Service Details
          </h3>

          <div className="grid grid-cols-4 bg-indigo-600 text-white px-4 py-2 rounded-t-lg text-sm font-medium">
            <div>Name</div>
            <div>Price</div>
            <div>Total</div>
            <div className="text-right">Action</div>
          </div>

          <div className="divide-y border border-t-0 rounded-b-lg">
            {selectedItems.map((item) => (
              <div
                key={item.serviceItemId}
                className="grid grid-cols-4 px-4 py-3 text-sm bg-gray-50 items-center"
              >
                <div>{item.name}</div>
                <div>{item.price}</div>
                <div>{item.price}</div>
                <div className="text-right">
                  <button
                    onClick={() => removeService(item.serviceItemId)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-600 
                               rounded-md hover:bg-red-200 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded-lg space-y-4">

            <div className="flex justify-between font-medium">
              <span>Sub Total</span>
              <span>{subTotal}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Discount</span>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-28"
              />
            </div>

            <div className="flex justify-between items-center">
              <span>Paid Amount</span>
              <Input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-28"
              />
            </div>

            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>Total</span>
              <span className="text-green-600">
                {calculatedTotal}
              </span>
            </div>

            <button
              onClick={handleCreateSale}
              className="w-full py-3 bg-indigo-600 text-white 
                         rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
              Create Sale
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

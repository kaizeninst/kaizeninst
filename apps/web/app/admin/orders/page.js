"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, CheckCircle, Clock, Truck, Package, Plus, Search } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import SummaryCard from "@/components/orders/SummaryCard";
import TableSkeleton from "@/components/orders/TableSkeleton";
import OrderRow from "@/components/orders/OrderRow";

/* ============================================================
   ORDERS MANAGEMENT PAGE
   ============================================================ */
export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  });

  /* ------------------------------------------------------------
     Debounce Search
     ------------------------------------------------------------ */
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  /* ------------------------------------------------------------
     Fetch Orders
     ------------------------------------------------------------ */
  async function fetchOrders(p = page, s = debouncedSearch, f = statusFilter, pay = paymentFilter) {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/orders?page=${p}&limit=10${
          f !== "all" ? `&status=${f}` : ""
        }${pay !== "all" ? `&payment=${pay}` : ""}&search=${encodeURIComponent(s)}`,
        { credentials: "include" }
      );

      const data = await response.json();
      const list = data?.data || [];

      setOrders(list);
      setPagination(data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
      setPage(data?.pagination?.page || p);

      // Compute stats for summary cards
      const summary = {
        total: list.length,
        pending: list.filter((x) => x.order_status === "pending").length,
        processing: list.filter((x) => x.order_status === "processing").length,
        shipped: list.filter((x) => x.order_status === "shipped").length,
        delivered: list.filter((x) => x.order_status === "delivered").length,
      };
      setStats(summary);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders(1, debouncedSearch, statusFilter, paymentFilter);
  }, [debouncedSearch, statusFilter, paymentFilter]);

  /* ------------------------------------------------------------
     Update Order Status
     ------------------------------------------------------------ */
  async function handleStatusChange(id, newStatus) {
    await fetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ order_status: newStatus }),
    });
    fetchOrders(page, debouncedSearch, statusFilter);
  }

  /* ------------------------------------------------------------
     Update Payment Status
     ------------------------------------------------------------ */
  async function handlePaymentChange(id, newStatus) {
    await fetch(`/api/orders/${id}/payment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ payment_status: newStatus }),
    });
    fetchOrders(page, debouncedSearch, statusFilter);
  }

  /* ------------------------------------------------------------
     Render
     ------------------------------------------------------------ */
  return (
    <div className="w-full p-4 sm:p-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Orders" }]} />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Orders Management</h1>
          <p className="text-secondary text-sm">Manage and track customer orders</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:border-primary w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:ring focus:ring-red-200 sm:w-64"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="focus:border-primary rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring focus:ring-red-100"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="focus:border-primary rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring focus:ring-red-100"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>

          <Link
            href="/admin/orders/create"
            className="add-btn bg-primary flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-white shadow transition hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Add Order
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCard icon={FileText} label="Total" value={stats.total} color="bg-gray-500" />
        <SummaryCard icon={Clock} label="Pending" value={stats.pending} color="bg-yellow-500" />
        <SummaryCard
          icon={Package}
          label="Processing"
          value={stats.processing}
          color="bg-gray-400"
        />
        <SummaryCard icon={Truck} label="Shipped" value={stats.shipped} color="bg-blue-500" />
        <SummaryCard
          icon={CheckCircle}
          label="Delivered"
          value={stats.delivered}
          color="bg-green-500"
        />
      </div>

      {/* Orders Table */}
      {loading ? (
        <TableSkeleton />
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <>
          <div className="table-container w-full">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    router={router}
                    onStatusChange={handleStatusChange}
                    onPaymentChange={handlePaymentChange}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            pagination={pagination}
            page={page}
            onPageChange={(newPage) => fetchOrders(newPage, debouncedSearch, statusFilter)}
          />
        </>
      )}
    </div>
  );
}

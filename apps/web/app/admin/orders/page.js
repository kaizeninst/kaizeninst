"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Eye,
  Plus,
  Search,
  CreditCard,
  Package,
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";

/* ---------------------- Summary Card ---------------------- */
function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md">
      <div className={`flex h-10 w-10 items-center justify-center rounded-md ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}

/* ---------------------- Status Dropdown ---------------------- */
function StatusDropdown({ value, onChange }) {
  const statuses = ["pending", "processing", "shipped", "delivered"];
  const colors = {
    pending: "text-yellow-600",
    processing: "text-gray-700",
    shipped: "text-blue-700",
    delivered: "text-green-700",
  };
  return (
    <select
      value={value || "pending"}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-md border border-gray-300 px-2 py-1 text-xs font-medium focus:ring focus:ring-red-100 ${colors[value]}`}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}

/* ---------------------- Payment Dropdown ---------------------- */
function PaymentDropdown({ value, onChange }) {
  const statuses = ["unpaid", "paid"];
  const colors = {
    unpaid: "text-red-600",
    paid: "text-green-700",
  };
  return (
    <select
      value={value || "unpaid"}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-md border border-gray-300 px-2 py-1 text-xs font-medium focus:ring focus:ring-red-100 ${colors[value]}`}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}

/* ---------------------- Table Skeleton ---------------------- */
function TableSkeleton() {
  return (
    <div className="table-container w-full animate-pulse">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: 8 }).map((_, i) => (
              <th key={i}>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: 8 }).map((_, j) => (
                <td key={j}>
                  <div className="h-5 w-full rounded bg-gray-100"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------- Row ---------------------- */
function OrderRow({ o, router, onStatusChange, onPaymentChange }) {
  return (
    <tr className="border-t transition hover:bg-gray-50">
      <td className="font-medium">OD-{String(o.id).padStart(4, "0")}</td>
      <td>
        <div className="font-medium">{o.customer_name}</div>
        <div className="text-xs text-gray-500">{o.customer_email}</div>
      </td>
      <td className="text-right font-semibold text-red-600">
        THB{" "}
        {Number(o.total || 0).toLocaleString("th-TH", {
          minimumFractionDigits: 2,
        })}
      </td>
      <td>
        <PaymentDropdown value={o.payment_status} onChange={(v) => onPaymentChange(o.id, v)} />
      </td>
      <td>
        <StatusDropdown value={o.order_status} onChange={(v) => onStatusChange(o.id, v)} />
      </td>
      <td className="text-gray-600">{new Date(o.created_at).toLocaleDateString()}</td>
      <td className="table-actions text-center">
        <button
          onClick={() => router.push(`/admin/orders/${o.id}`)}
          className="rounded bg-gray-100 p-2 hover:bg-gray-200"
          title="View"
        >
          <Eye className="h-4 w-4 text-gray-700" />
        </button>
      </td>
    </tr>
  );
}

/* ---------------------- Main Page ---------------------- */
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
  const [filter, setFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchOrders = async (p = page, s = debouncedSearch, f = filter, pay = paymentFilter) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders?page=${p}&limit=10${
          f !== "all" ? `&status=${f}` : ""
        }${pay !== "all" ? `&payment=${pay}` : ""}&search=${encodeURIComponent(s)}`,
        { credentials: "include" }
      );
      const data = await res.json();
      const list = data?.data || [];
      setOrders(list);
      setPagination(data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
      setPage(data?.pagination?.page || p);

      const stats = {
        total: list.length,
        pending: list.filter((x) => x.order_status === "pending").length,
        processing: list.filter((x) => x.order_status === "processing").length,
        shipped: list.filter((x) => x.order_status === "shipped").length,
        delivered: list.filter((x) => x.order_status === "delivered").length,
      };
      setStats(stats);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, debouncedSearch, filter, paymentFilter);
  }, [debouncedSearch, filter, paymentFilter]);

  // 🔄 Update status
  const handleStatusChange = async (id, newStatus) => {
    await fetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ order_status: newStatus }),
    });
    fetchOrders(page, debouncedSearch, filter);
  };

  // 💰 Update payment
  const handlePaymentChange = async (id, newStatus) => {
    await fetch(`/api/orders/${id}/payment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ payment_status: newStatus }),
    });
    fetchOrders(page, debouncedSearch, filter);
  };

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
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
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

      {/* Table */}
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
                {orders.map((o) => (
                  <OrderRow
                    key={o.id}
                    o={o}
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
            onPageChange={(newPage) => fetchOrders(newPage, debouncedSearch, filter)}
          />
        </>
      )}
    </div>
  );
}

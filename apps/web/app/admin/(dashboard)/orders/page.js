"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, CheckCircle, XCircle, Clock, Truck, Eye } from "lucide-react";

export default function OrderManagementPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders`, { credentials: "include" });
      const data = await res.json();
      setOrders(data.data || []);
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSummary() {
    try {
      const res = await fetch(`/api/orders/summary`, { credentials: "include" });
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("Failed to load summary:", err);
    }
  }

  async function updateStatus(id, newStatus) {
    await fetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ order_status: newStatus }),
    });
    fetchOrders();
    fetchSummary();
  }

  useEffect(() => {
    fetchOrders();
    fetchSummary();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-sm text-gray-500">Manage and track customer orders</p>
        </div>
      </div>

      {/* Summary cards */}
      {summary ? (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <SummaryCard
            icon={<FileText size={20} className="text-blue-600" />}
            label="Total Orders"
            value={summary.total}
            color="blue"
          />
          <SummaryCard
            icon={<Clock size={20} className="text-yellow-600" />}
            label="Pending"
            value={summary.pending}
            color="yellow"
          />
          <SummaryCard
            icon={<CheckCircle size={20} className="text-gray-600" />}
            label="Processing"
            value={summary.processing}
            color="gray"
          />
          <SummaryCard
            icon={<Truck size={20} className="text-blue-600" />}
            label="Shipped"
            value={summary.shipped}
            color="blue"
          />
          <SummaryCard
            icon={<XCircle size={20} className="text-green-600" />}
            label="Delivered"
            value={summary.delivered}
            color="green"
          />
        </div>
      ) : (
        <p className="mb-6 text-sm text-gray-500">Loading summary...</p>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">OD-{o.id}</td>
                  <td className="p-3">
                    <div className="font-medium">{o.customer_name}</div>
                    <div className="text-xs text-gray-500">{o.customer_email}</div>
                  </td>
                  <td className="p-3 font-semibold text-red-600">
                    THB {Number(o.total).toFixed(2)}
                  </td>
                  <td className="p-3">
                    {o.payment_status === "paid" ? (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                        Paid
                      </span>
                    ) : (
                      <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
                        Unpaid
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <StatusBadge
                      value={o.order_status}
                      onChange={(val) => updateStatus(o.id, val)}
                    />
                  </td>
                  <td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="flex items-center gap-1 rounded bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200"
                      >
                        <Eye size={14} /> View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Summary Card */
function SummaryCard({ icon, label, value, color }) {
  const styles = {
    blue: "bg-blue-100 text-blue-600",
    gray: "bg-gray-100 text-gray-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };
  return (
    <div className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded ${styles[color]}`}>
        {icon}
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-600">{label}</div>
        <div className="text-xl font-bold text-black">{value}</div>
      </div>
    </div>
  );
}

/* Status Badge */
function StatusBadge({ value, onChange }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-gray-100 text-gray-700",
    shipped: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
  };
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded border px-2 py-1 text-xs ${colors[value]} focus:outline-none`}
    >
      <option value="pending">Pending</option>
      <option value="processing">Processing</option>
      <option value="shipped">Shipped</option>
      <option value="delivered">Delivered</option>
    </select>
  );
}

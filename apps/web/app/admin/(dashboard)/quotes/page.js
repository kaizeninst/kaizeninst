"use client";
import { useEffect, useState } from "react";
import { FileText, FileEdit, Send, CheckCircle, XCircle, Clock, Eye, Plus } from "lucide-react";

export default function QuoteManagementPage() {
  const [quotes, setQuotes] = useState([]);
  const [summary, setSummary] = useState(null); // 🆕 state สำหรับ summary
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchQuotes() {
    try {
      setLoading(true);
      const res = await fetch(`/api/quotes`, { credentials: "include" });
      const data = await res.json();
      setQuotes(data.data || []);
    } catch (err) {
      setError("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  }

  // 🆕 ดึง summary
  async function fetchSummary() {
    try {
      const res = await fetch(`/api/quotes/summary`, { credentials: "include" });
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("Failed to load summary:", err);
    }
  }

  async function updateStatus(id, newStatus) {
    await fetch(`/api/quotes/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: newStatus }),
    });
    fetchQuotes();
    fetchSummary(); // 🆕 refresh summary หลังเปลี่ยน status
  }

  useEffect(() => {
    fetchQuotes();
    fetchSummary();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quote Management</h1>
          <p className="text-sm text-gray-500">Manage and track customer quotes</p>
        </div>
        <button className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
          <Plus size={16} /> Add Order
        </button>
      </div>

      {/* Summary cards */}
      {summary ? (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-6">
          <SummaryCard
            icon={<FileText size={20} className="text-blue-600" />}
            label="Total Quote"
            value={summary.total}
            color="blue"
          />
          <SummaryCard
            icon={<FileEdit size={20} className="text-gray-600" />}
            label="Draft"
            value={summary.draft}
            color="gray"
          />
          <SummaryCard
            icon={<Send size={20} className="text-blue-600" />}
            label="Sent"
            value={summary.sent}
            color="blue"
          />
          <SummaryCard
            icon={<CheckCircle size={20} className="text-green-600" />}
            label="Accept"
            value={summary.accepted}
            color="green"
          />
          <SummaryCard
            icon={<XCircle size={20} className="text-red-600" />}
            label="Reject"
            value={summary.rejected}
            color="red"
          />
          <SummaryCard
            icon={<Clock size={20} className="text-yellow-600" />}
            label="Expired"
            value={summary.expired}
            color="yellow"
          />
        </div>
      ) : (
        <p className="mb-6 text-sm text-gray-500">Loading summary...</p>
      )}

      {/* Search + filter */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search orders, customers, or emails..."
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-80"
        />
        <select className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Status</option>
          <option>Draft</option>
          <option>Sent</option>
          <option>Accepted</option>
          <option>Rejected</option>
          <option>Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Quote ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Company</th>
              <th className="p-3">Date</th>
              <th className="p-3">Valid Until</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : quotes.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  No quotes found
                </td>
              </tr>
            ) : (
              quotes.map((q) => (
                <tr key={q.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">ORD-{q.id}</td>
                  <td className="p-3">
                    <div className="font-medium">{q.customer_name}</div>
                    <div className="text-xs text-gray-500">{q.customer_email}</div>
                  </td>
                  <td className="p-3">{q.company_name || "-"}</td>
                  <td className="p-3">{new Date(q.requested_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    {q.valid_until ? new Date(q.valid_until).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-3 font-semibold text-red-600">
                    THB{" "}
                    {q.QuoteItems?.reduce(
                      (sum, item) => sum + parseFloat(item.line_total || 0),
                      0
                    ).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <StatusBadge value={q.status} onChange={(val) => updateStatus(q.id, val)} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="flex items-center gap-1 rounded bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200">
                        <Eye size={14} /> View
                      </button>
                      {q.status === "accepted" && (
                        <button className="rounded bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600">
                          Convert to Order
                        </button>
                      )}
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

/* ✅ Summary Card */
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

/* ✅ Status Badge */
function StatusBadge({ value, onChange }) {
  const colors = {
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    expired: "bg-yellow-100 text-yellow-700",
  };
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded border px-2 py-1 text-xs ${colors[value]} focus:outline-none`}
    >
      <option value="draft">Draft</option>
      <option value="sent">Sent</option>
      <option value="accepted">Accepted</option>
      <option value="rejected">Rejected</option>
      <option value="expired">Expired</option>
    </select>
  );
}

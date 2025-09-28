"use client";
import { useEffect, useState } from "react";

export default function QuoteManagementPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  async function fetchQuotes() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status) params.append("status", status);

      const res = await fetch(`/api/quotes?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      setQuotes(data.data || []);
    } catch (err) {
      setError("Failed to load quotes");
    } finally {
      setLoading(false);
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
  }

  useEffect(() => {
    fetchQuotes();
  }, [search, status]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Quote Management</h1>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <input
            type="text"
            placeholder="Search by name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Company</th>
              <th className="p-3">Requested At</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : quotes.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No quotes found
                </td>
              </tr>
            ) : (
              quotes.map((q) => (
                <tr key={q.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{q.id}</td>
                  <td className="p-3">
                    <div className="font-medium">{q.customer_name}</div>
                    <div className="text-xs text-gray-500">{q.customer_email}</div>
                  </td>
                  <td className="p-3">{q.company_name || "-"}</td>
                  <td className="p-3">{new Date(q.requested_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <select
                      value={q.status}
                      onChange={(e) => updateStatus(q.id, e.target.value)}
                      className={`rounded border px-2 py-1 text-xs focus:outline-none focus:ring-2 ${
                        q.status === "draft"
                          ? "bg-gray-100 text-gray-700"
                          : q.status === "sent"
                            ? "bg-blue-100 text-blue-700"
                            : q.status === "accepted"
                              ? "bg-green-100 text-green-700"
                              : q.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600">
                      Delete
                    </button>
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

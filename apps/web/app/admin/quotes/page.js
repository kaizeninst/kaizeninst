"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, FileText } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";

/* ---------------------- Skeleton Loader ---------------------- */
function TableSkeleton() {
  return (
    <div className="table-container w-full animate-pulse">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: 7 }).map((_, i) => (
              <th key={i}>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: 7 }).map((_, j) => (
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

/* ---------------------- Status Badge ---------------------- */
function StatusBadge({ status }) {
  const color =
    status === "accepted"
      ? "bg-green-100 text-green-700"
      : status === "rejected"
        ? "bg-red-100 text-red-700"
        : status === "sent"
          ? "bg-blue-100 text-blue-700"
          : status === "draft"
            ? "bg-gray-100 text-gray-700"
            : "bg-yellow-100 text-yellow-700";

  const label = status?.charAt(0).toUpperCase() + status?.slice(1);
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${color}`}>{label || "-"}</span>
  );
}

/* ---------------------- Quote Row ---------------------- */
function QuoteRow({ quote, onView }) {
  return (
    <tr className="border-t transition hover:bg-gray-50">
      <td className="px-4 py-2 font-medium">{quote.code}</td>
      <td className="px-4 py-2">{quote.customer_name}</td>
      <td className="px-4 py-2 text-gray-600">
        {quote.created_at ? new Date(quote.created_at).toLocaleDateString() : "—"}
      </td>
      <td className="px-4 py-2 text-gray-600">
        {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : "—"}
      </td>
      <td className="px-4 py-2 text-center text-gray-600">{quote.total_items}</td>
      <td className="px-4 py-2 text-right font-semibold text-gray-800">
        {quote.total_amount?.toLocaleString() ?? 0} ฿
      </td>
      <td className="px-4 py-2">
        <StatusBadge status={quote.status} />
      </td>
      <td className="flex gap-2 px-4 py-2">
        <button
          onClick={() => onView(quote.id)}
          className="rounded bg-gray-100 p-2 hover:bg-gray-200"
          title="View Quote"
        >
          <Eye className="h-4 w-4 text-blue-600" />
        </button>
        <button className="rounded bg-gray-100 p-2 hover:bg-gray-200" title="Convert to Order">
          <FileText className="h-4 w-4 text-green-600" />
        </button>
      </td>
    </tr>
  );
}

/* ---------------------- Main Page ---------------------- */
export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState({
    total: 0,
    draft: 0,
    sent: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchQuotes = async (p = 1, s = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes?page=${p}&limit=10&search=${encodeURIComponent(s)}`);
      const data = await res.json();
      setQuotes(data?.data || []);
      setPagination(data?.pagination || pagination);
      setSummary(data?.summary || summary);
      setPage(data?.pagination?.page || p);
    } catch (err) {
      console.error("Error fetching quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes(1, debouncedSearch);
  }, [debouncedSearch]);

  return (
    <div className="w-full p-4 sm:p-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Quotes" }]} />

      {/* Header */}
      <div className="admin-header mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Quote Management</h1>
          <p className="text-secondary text-sm">Track, manage, and convert customer quotes</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search quotes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:border-primary w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:ring focus:ring-red-200 sm:w-64"
            />
          </div>
          <button
            onClick={() => alert("Open create quote modal")}
            className="add-btn bg-primary flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-white shadow transition hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> New Quote
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <SummaryCard title="Total Quotes" value={summary.total} color="bg-blue-100 text-blue-800" />
        <SummaryCard title="Draft" value={summary.draft} color="bg-gray-100 text-gray-700" />
        <SummaryCard title="Sent" value={summary.sent} color="bg-yellow-100 text-yellow-700" />
        <SummaryCard
          title="Accepted"
          value={summary.accepted}
          color="bg-green-100 text-green-700"
        />
        <SummaryCard title="Rejected" value={summary.rejected} color="bg-red-100 text-red-700" />
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : quotes.length === 0 ? (
        <p className="text-gray-500">No quotes found.</p>
      ) : (
        <>
          <div className="table-container w-full">
            <table className="table">
              <thead>
                <tr>
                  <th>Quote Code</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Valid Until</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <QuoteRow key={q.id} quote={q} onView={(id) => alert(`Open quote ${id}`)} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            page={pagination.page}
            onPageChange={(newPage) => {
              setPage(newPage);
              fetchQuotes(newPage, debouncedSearch);
            }}
          />
        </>
      )}
    </div>
  );
}

/* ---------------------- Summary Card ---------------------- */
function SummaryCard({ title, value, color }) {
  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

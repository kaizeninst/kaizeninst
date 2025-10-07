"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Eye,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCcw,
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
  const statuses = ["draft", "sent", "accepted", "rejected", "expired"];
  const colors = {
    draft: "text-gray-700",
    sent: "text-blue-600",
    accepted: "text-green-600",
    rejected: "text-red-600",
    expired: "text-orange-600",
  };
  return (
    <select
      value={value || "draft"}
      onChange={(e) => onChange(e.target.value)}
      className={`focus:border-primary rounded-md border border-gray-300 px-2 py-1 text-xs font-medium focus:ring focus:ring-red-100 ${colors[value]}`}
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
          {Array.from({ length: 10 }).map((_, i) => (
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

/* ---------------------- Quote Row ---------------------- */
function QuoteRow({ q, router, onStatusChange, onConvert }) {
  const total = q.QuoteItems?.reduce((sum, item) => sum + parseFloat(item.line_total || 0), 0);

  return (
    <tr className="border-t transition hover:bg-gray-50">
      <td className="font-medium">QT-{String(q.id).padStart(4, "0")}</td>
      <td>
        <div className="font-medium">{q.customer_name}</div>
        <div className="text-xs text-gray-500">{q.customer_email}</div>
      </td>
      <td className="hidden text-gray-600 sm:table-cell">{q.company_name || "—"}</td>
      <td className="text-gray-600">{new Date(q.requested_at).toLocaleDateString()}</td>
      <td className="text-gray-600">
        {q.valid_until ? new Date(q.valid_until).toLocaleDateString() : "—"}
      </td>
      <td className="text-right font-semibold text-red-600">
        THB{" "}
        {Number(total || 0).toLocaleString("th-TH", {
          minimumFractionDigits: 2,
        })}
      </td>
      <td>
        <StatusDropdown value={q.status} onChange={(v) => onStatusChange(q.id, v)} />
      </td>
      <td className="table-actions text-center">
        <div className="flex justify-center gap-2 sm:justify-start">
          <button
            onClick={() => router.push(`/admin/quotes/${q.id}`)}
            className="rounded bg-gray-100 p-2 hover:bg-gray-200"
            title="View"
          >
            <Eye className="h-4 w-4 text-gray-700" />
          </button>

          {q.status === "accepted" && (
            <button
              onClick={() => onConvert(q.id)}
              className="flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
              title="Convert to Order"
            >
              <RefreshCcw className="h-3 w-3" /> Convert
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ---------------------- Main Page ---------------------- */
export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState([]);
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
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    sent: 0,
    accepted: 0,
    rejected: 0,
    expired: 0,
  });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchQuotes = async (p = page, s = debouncedSearch, f = filter) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/quotes?page=${p}&limit=10${f !== "all" ? `&status=${f}` : ""}&search=${encodeURIComponent(
          s
        )}`
      );
      const data = await res.json();
      const list = data?.data || [];
      setQuotes(list);
      setPagination(data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
      setPage(data?.pagination?.page || p);

      const stats = {
        total: list.length,
        draft: list.filter((x) => x.status === "draft").length,
        sent: list.filter((x) => x.status === "sent").length,
        accepted: list.filter((x) => x.status === "accepted").length,
        rejected: list.filter((x) => x.status === "rejected").length,
        expired: list.filter((x) => x.status === "expired").length,
      };
      setStats(stats);
    } catch (err) {
      console.error("Error fetching quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes(1, debouncedSearch, filter);
  }, [debouncedSearch, filter]);

  // 🔄 Update status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/quotes/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchQuotes(page, debouncedSearch, filter);
    } catch (err) {
      alert(err.message);
    }
  };

  // 💼 Convert to Order
  const handleConvert = async (id) => {
    if (!confirm("Convert this quote to an order?")) return;
    try {
      const res = await fetch(`/api/quotes/${id}/convert`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to convert to order");
      alert("✅ Converted to order successfully!");
      fetchQuotes(page, debouncedSearch, filter);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Quotes" }]} />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Quotes Management</h1>
          <p className="text-secondary text-sm">Manage customer quotations</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Quotes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:border-primary w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:ring focus:ring-red-200 sm:w-64"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="focus:border-primary rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring focus:ring-red-100"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>

          <Link
            href="/admin/quotes/create"
            className="add-btn bg-primary flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-white shadow transition hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Add Quote
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard icon={FileText} label="Total" value={stats.total} color="bg-gray-500" />
        <SummaryCard icon={FileText} label="Draft" value={stats.draft} color="bg-gray-400" />
        <SummaryCard icon={Send} label="Sent" value={stats.sent} color="bg-blue-500" />
        <SummaryCard
          icon={CheckCircle}
          label="Accepted"
          value={stats.accepted}
          color="bg-green-500"
        />
        <SummaryCard icon={XCircle} label="Rejected" value={stats.rejected} color="bg-red-500" />
        <SummaryCard icon={Clock} label="Expired" value={stats.expired} color="bg-orange-500" />
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
                  <th>Quote ID</th>
                  <th>Customer</th>
                  <th>Company</th>
                  <th>Date</th>
                  <th>Valid Until</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <QuoteRow
                    key={q.id}
                    q={q}
                    router={router}
                    onStatusChange={handleStatusChange}
                    onConvert={handleConvert}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            pagination={pagination}
            page={page}
            onPageChange={(newPage) => fetchQuotes(newPage, debouncedSearch, filter)}
          />
        </>
      )}
    </div>
  );
}

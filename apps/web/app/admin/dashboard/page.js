"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ----------------------------------------
   COLORS: used for charts & status badges
---------------------------------------- */
const COLORS = {
  accepted: "#22c55e",
  rejected: "#ef4444",
  pending: "#f59e0b",
  sent: "#3b82f6",
  draft: "#9ca3af",
};

export default function QuoteDashboardPage() {
  // Dashboard data states
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    sent: 0,
    accepted: 0,
    rejected: 0,
    expired: 0,
    converted: 0,
  });

  const [trend, setTrend] = useState([]); // line chart data
  const [recentQuotes, setRecentQuotes] = useState([]); // latest quotes table
  const [loading, setLoading] = useState(true);

  /* ----------------------------------------
     Fetch dashboard data from API (/api/quotes)
  ---------------------------------------- */
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const res = await fetch("/api/quotes?limit=100", { cache: "no-store" });
        const data = await res.json();
        const list = data?.data || [];

        /* ---------- 1. Summary (for top cards) ---------- */
        const summary = {
          total: list.length,
          draft: list.filter((x) => x.status === "draft").length,
          sent: list.filter((x) => x.status === "sent").length,
          accepted: list.filter((x) => x.status === "accepted").length,
          rejected: list.filter((x) => x.status === "rejected").length,
          expired: list.filter((x) => x.status === "expired").length,
          converted: list.filter((x) => x.status === "converted").length,
        };
        setStats(summary);

        /* ---------- 2. Recent Quotes (latest 5) ---------- */
        const recent = list.slice(0, 5).map((q) => {
          const total =
            q.QuoteItems?.reduce((sum, it) => sum + parseFloat(it.line_total || 0), 0) || 0;

          return {
            id: q.id,
            customer: q.customer_name || "-",
            company: q.company_name || "-",
            status: q.status || "draft",
            total,
          };
        });
        setRecentQuotes(recent);

        /* ---------- 3. Trend Data (grouped by month) ---------- */
        const byMonth = {};
        list.forEach((q) => {
          const d = new Date(q.created_at);
          const key = d.toLocaleString("en-US", { month: "short" });

          if (!byMonth[key]) {
            byMonth[key] = { month: key, created: 0, accepted: 0, rejected: 0 };
          }
          byMonth[key].created++;
          if (q.status === "accepted") byMonth[key].accepted++;
          if (q.status === "rejected") byMonth[key].rejected++;
        });

        setTrend(Object.values(byMonth));
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  /* ----------------------------------------
     Render Dashboard UI
  ---------------------------------------- */
  return (
    <div className="w-full p-4 sm:p-6">
      {/* ---------- Header ---------- */}
      <div className="mb-6 flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Dashboard Overview</h1>
          <p className="text-secondary text-sm">Overview of recent quotes and trends</p>
        </div>

        <Link
          href="/admin/quotes"
          className="text-primary mt-2 inline-flex items-center gap-1 text-sm font-medium transition hover:text-red-700 sm:mt-0"
        >
          View all quotes →
        </Link>
      </div>

      {/* ---------- Summary Cards ---------- */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          icon={FileText}
          title="Total Quotes"
          value={stats.total}
          color="from-gray-400 to-gray-500"
        />
        <DashboardCard
          icon={CheckCircle}
          title="Accepted"
          value={stats.accepted}
          color="from-green-500 to-emerald-600"
        />
        <DashboardCard
          icon={XCircle}
          title="Rejected"
          value={stats.rejected}
          color="from-rose-500 to-red-600"
        />
        <DashboardCard
          icon={Clock}
          title="Pending / Sent"
          value={stats.sent + stats.draft}
          color="from-amber-400 to-yellow-500"
        />
      </div>

      {/* ---------- Charts Section ---------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* --- Line Chart (Monthly trend) --- */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-md transition hover:shadow-lg">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-gray-800">Quotes Trend (6 months)</h2>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trend}>
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="created" stroke="#60a5fa" strokeWidth={2} />
              <Line type="monotone" dataKey="accepted" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* --- Pie Chart (Status Breakdown) --- */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-md transition hover:shadow-lg">
          <h2 className="mb-3 font-semibold text-gray-800">Quote Status Breakdown</h2>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "Accepted", value: stats.accepted },
                  { name: "Rejected", value: stats.rejected },
                  { name: "Pending", value: stats.draft + stats.sent },
                ]}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                <Cell fill={COLORS.accepted} />
                <Cell fill={COLORS.rejected} />
                <Cell fill={COLORS.pending} />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------- Recent Quotes Table ---------- */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-5 shadow-md transition hover:shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recent Quotes</h2>
          <Link
            href="/admin/quotes"
            className="text-primary text-sm font-medium hover:text-red-700"
          >
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-2 text-left">Customer</th>
                <th className="p-2 text-left">Company</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-right">Total (THB)</th>
              </tr>
            </thead>

            <tbody>
              {recentQuotes.map((q) => {
                // Match status color with Quote Management page
                const statusColor =
                  {
                    draft: "bg-gray-100 text-gray-700",
                    sent: "bg-blue-100 text-blue-700",
                    accepted: "bg-green-100 text-green-700",
                    rejected: "bg-red-100 text-red-700",
                    expired: "bg-orange-100 text-orange-700",
                    converted: "bg-purple-100 text-purple-700",
                  }[q.status] || "bg-gray-100 text-gray-700";

                return (
                  <tr key={q.id} className="border-t transition hover:bg-gray-50">
                    <td className="p-2 font-medium text-gray-800">{q.customer}</td>
                    <td className="p-2 text-gray-600">{q.company}</td>
                    <td className="p-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
                        {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-2 text-right font-semibold text-gray-800">
                      {q.total.toLocaleString("th-TH")}
                    </td>
                  </tr>
                );
              })}

              {/* Show message when no data */}
              {!recentQuotes.length && !loading && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No quotes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------
   Dashboard summary card component
---------------------------------------- */
function DashboardCard({ icon: Icon, title, value, color }) {
  return (
    <div
      className={`group flex items-center gap-3 rounded-lg border border-gray-200 bg-gradient-to-br ${color} p-4 text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className="rounded-lg bg-white/25 p-2 transition group-hover:rotate-3">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm opacity-90">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </div>
  );
}

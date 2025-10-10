"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import QuoteLineChart from "@/components/dashboard/QuoteLineChart";
import QuotePieChart from "@/components/dashboard/QuotePieChart";
import RecentQuotesTable from "@/components/dashboard/RecentQuotesTable";

/* ============================================================
   DASHBOARD OVERVIEW PAGE
   ============================================================ */
export default function QuoteDashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    sent: 0,
    accepted: 0,
    rejected: 0,
    expired: 0,
    converted: 0,
  });

  const [trend, setTrend] = useState([]);
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------------
     Fetch dashboard data from API
     ------------------------------------------------------------ */
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await fetch("/api/quotes?limit=100", { cache: "no-store" });
        const data = await res.json();
        const list = data?.data || [];

        // Summary
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

        // Recent Quotes
        const recent = list.slice(0, 5).map((q) => ({
          id: q.id,
          customer: q.customer_name || "-",
          company: q.company_name || "-",
          status: q.status || "draft",
          total: q.QuoteItems?.reduce((sum, it) => sum + parseFloat(it.line_total || 0), 0) || 0,
        }));
        setRecentQuotes(recent);

        // Trend Data
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

  /* ------------------------------------------------------------
     Render
     ------------------------------------------------------------ */
  return (
    <div className="w-full p-4 sm:p-6">
      {/* Header */}
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

      {/* Summary Cards */}
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

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <QuoteLineChart trend={trend} />
        <QuotePieChart stats={stats} />
      </div>

      {/* Recent Quotes Table */}
      <RecentQuotesTable recentQuotes={recentQuotes} loading={loading} />
    </div>
  );
}

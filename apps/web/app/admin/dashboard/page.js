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

/* ------------------ MOCK DATA ------------------ */
const mockSummary = {
  total: 48,
  accepted: 18,
  rejected: 10,
  pending: 20,
};

const mockTrend = [
  { month: "May", created: 12, accepted: 6, rejected: 3 },
  { month: "Jun", created: 18, accepted: 7, rejected: 5 },
  { month: "Jul", created: 25, accepted: 9, rejected: 6 },
  { month: "Aug", created: 28, accepted: 12, rejected: 8 },
  { month: "Sep", created: 22, accepted: 11, rejected: 4 },
  { month: "Oct", created: 30, accepted: 15, rejected: 10 },
];

const mockRecent = [
  { id: 1, customer: "Somchai Ltd.", company: "Thai Steel", status: "pending", total: 45000 },
  { id: 2, customer: "Ananya Co.", company: "Bangkok Tools", status: "accepted", total: 67000 },
  { id: 3, customer: "Kawin Group", company: "Smart Power", status: "rejected", total: 23000 },
  { id: 4, customer: "Suda Tech", company: "SolarOne", status: "accepted", total: 54000 },
];

/* ------------------ COLOR THEME ------------------ */
const COLORS = {
  accepted: "#22c55e",
  rejected: "#ef4444",
  pending: "#f59e0b",
};

export default function QuoteDashboardPage() {
  const [summary, setSummary] = useState(mockSummary);
  const [trend, setTrend] = useState(mockTrend);
  const [recentQuotes, setRecentQuotes] = useState(mockRecent);

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="mb-6 text-2xl font-semibold text-gray-800">Dashboard Overview</h1>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          icon={FileText}
          title="Total Quotes"
          value={summary.total}
          color="from-sky-500 to-blue-600"
        />
        <DashboardCard
          icon={CheckCircle}
          title="Accepted"
          value={summary.accepted}
          color="from-green-500 to-emerald-600"
        />
        <DashboardCard
          icon={XCircle}
          title="Rejected"
          value={summary.rejected}
          color="from-rose-500 to-red-600"
        />
        <DashboardCard
          icon={Clock}
          title="Pending"
          value={summary.pending}
          color="from-amber-400 to-yellow-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trend Chart */}
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-gray-800">Quotes Trend (6 months)</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trend}>
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="created"
                stroke="#60a5fa"
                strokeWidth={2}
                name="Created"
              />
              <Line
                type="monotone"
                dataKey="accepted"
                stroke="#22c55e"
                strokeWidth={2}
                name="Accepted"
              />
              <Line
                type="monotone"
                dataKey="rejected"
                stroke="#ef4444"
                strokeWidth={2}
                name="Rejected"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie Chart */}
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-800">Quote Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "Accepted", value: summary.accepted },
                  { name: "Rejected", value: summary.rejected },
                  { name: "Pending", value: summary.pending },
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

      {/* Recent Quotes Table */}
      <div className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recent Quotes</h2>
          <Link href="/admin/quotes" className="text-sm text-blue-600 hover:underline">
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
              {recentQuotes.map((q) => (
                <tr key={q.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{q.customer}</td>
                  <td className="p-2">{q.company}</td>
                  <td className="p-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        q.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : q.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="p-2 text-right font-semibold text-gray-800">
                    {q.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------ Card Component ------------------ */
function DashboardCard({ icon: Icon, title, value, color }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border bg-gradient-to-br ${color} p-4 text-white shadow-sm`}
    >
      <div className="rounded-lg bg-white/20 p-2">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </div>
  );
}

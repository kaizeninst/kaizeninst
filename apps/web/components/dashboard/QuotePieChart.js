"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

/* ============================================================
   QUOTE STATUS BREAKDOWN (PIE CHART)
   ============================================================ */
const COLORS = {
  accepted: "#22c55e",
  rejected: "#ef4444",
  pending: "#f59e0b",
};

export default function QuotePieChart({ stats }) {
  const data = [
    { name: "Accepted", value: stats.accepted },
    { name: "Rejected", value: stats.rejected },
    { name: "Pending", value: stats.draft + stats.sent },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-md transition hover:shadow-lg">
      <h2 className="mb-3 font-semibold text-gray-800">Quote Status Breakdown</h2>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
            <Cell fill={COLORS.accepted} />
            <Cell fill={COLORS.rejected} />
            <Cell fill={COLORS.pending} />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

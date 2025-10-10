"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";

/* ============================================================
   QUOTE TREND (LINE CHART)
   ============================================================ */
export default function QuoteLineChart({ trend }) {
  return (
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
  );
}

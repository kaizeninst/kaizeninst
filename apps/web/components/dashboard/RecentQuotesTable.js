"use client";

import Link from "next/link";

/* ============================================================
   RECENT QUOTES TABLE COMPONENT
   ============================================================ */
export default function RecentQuotesTable({ recentQuotes, loading }) {
  return (
    <div className="mt-8 rounded-lg border border-gray-200 bg-white p-5 shadow-md transition hover:shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Recent Quotes</h2>
        <Link href="/admin/quotes" className="text-primary text-sm font-medium hover:text-red-700">
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
            {recentQuotes.map((quote) => {
              const statusColor =
                {
                  draft: "bg-gray-100 text-gray-700",
                  sent: "bg-blue-100 text-blue-700",
                  accepted: "bg-green-100 text-green-700",
                  rejected: "bg-red-100 text-red-700",
                  expired: "bg-orange-100 text-orange-700",
                  converted: "bg-purple-100 text-purple-700",
                }[quote.status] || "bg-gray-100 text-gray-700";

              return (
                <tr key={quote.id} className="border-t transition hover:bg-gray-50">
                  <td className="p-2 font-medium text-gray-800">{quote.customer}</td>
                  <td className="p-2 text-gray-600">{quote.company}</td>
                  <td className="p-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-2 text-right font-semibold text-gray-800">
                    {quote.total.toLocaleString("th-TH")}
                  </td>
                </tr>
              );
            })}

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
  );
}

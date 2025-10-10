"use client";

/* ============================================================
   SUMMARY CARD COMPONENT
   ============================================================ */
export default function SummaryCard({ icon: Icon, label, value, color }) {
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

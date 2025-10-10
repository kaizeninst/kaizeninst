"use client";

/* ============================================================
   DASHBOARD SUMMARY CARD COMPONENT
   ============================================================ */
export default function DashboardCard({ icon: Icon, title, value, color }) {
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

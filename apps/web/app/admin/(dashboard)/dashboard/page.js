import StatCard from "@/components/admin/StatCard";
import RecentQuotes from "@/components/admin/RecentQuotes";

export default async function AdminDashboardPage() {
  // TODO: fetch real data from API (protected) e.g. GET /api/admin/overview
  const stats = [
    { title: "Total Quotes", value: "1,234", sub: "+12% from last month", icon: "file" },
    { title: "Revenue", value: "$45,678", sub: "+8% from last month", icon: "dollar" },
    { title: "Out of Stock", value: "23", sub: "-5% from last month", icon: "alert" },
    { title: "Active Users", value: "892", sub: "+15% from last month", icon: "users" },
  ];

  return (
    <div className="p-6 sm:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Welcome back! Here’s what’s happening with your store.
        </p>
      </header>

      {/* Top stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.title} title={s.title} value={s.value} sub={s.sub} icon={s.icon} />
        ))}
      </section>

      {/* Charts + Recent quotes */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 lg:col-span-2">
          <h3 className="font-semibold text-neutral-800">Sales Overview</h3>
          <div className="mt-4 grid h-64 place-items-center rounded-md border border-dashed border-neutral-300 text-sm text-neutral-500">
            Sales chart would go here
          </div>
        </div>

        <RecentQuotes />
      </section>
    </div>
  );
}

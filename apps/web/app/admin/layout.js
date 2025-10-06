import Sidebar from "@/components/layout/Sidebar";

export const metadata = {
  title: "Admin Dashboard",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="flex min-h-screen">
        <Sidebar />

        {/* Main content */}
        <main className="min-h-screen w-full flex-1 p-4 pt-[64px] transition-all duration-300 md:pl-[250px] md:pt-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

import Sidebar from "@/components/layout/Sidebar";

export const metadata = {
  title: "Admin Dashboard",
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="min-h-screen w-full flex-1 overflow-x-hidden p-4 pt-[64px] transition-all duration-300 md:pt-6">
        {children}
      </main>
    </div>
  );
}

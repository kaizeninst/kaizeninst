import Sidebar from "@/components/layout/Sidebar";

export const metadata = {
  title: "Admin Dashboard",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="flex">
        <Sidebar />
        <main className="min-h-screen flex-1">{children}</main>
      </div>
    </div>
  );
}

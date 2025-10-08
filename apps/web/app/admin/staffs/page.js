"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash, KeyRound, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";

/* ---------- Skeleton Loader ---------- */
function TableSkeleton() {
  return (
    <div className="table-container w-full animate-pulse">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: 7 }).map((_, i) => (
              <th key={i}>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: 7 }).map((_, j) => (
                <td key={j}>
                  <div className="h-5 w-full rounded bg-gray-100"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function StaffManagementPage() {
  const router = useRouter();

  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 🔹 Temporary password popup
  const [tempPassword, setTempPassword] = useState(null);
  const [copied, setCopied] = useState(false);

  // 🔹 debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // 🔹 fetch staffs
  const fetchStaffs = async (p = page, s = debouncedSearch) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/staff?page=${p}&limit=${limit}&search=${encodeURIComponent(s)}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setStaffs(data?.data || []);
      setPagination(data?.pagination || { total: 0, page: 1, limit, totalPages: 1 });
      setPage(data?.pagination?.page || p);
    } catch (err) {
      console.error("Error fetching staff:", err);
      alert("❌ Failed to load staff data.");
      setStaffs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs(1, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // 🔹 delete staff
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this staff?")) return;
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to delete staff");

      alert("✅ Staff deleted successfully!");
      fetchStaffs(page, debouncedSearch);
    } catch (err) {
      console.error("Delete error:", err);
      alert(`❌ ${err.message}`);
    }
  };

  // 🔹 reset password
  const handleResetPassword = async (id) => {
    if (!confirm("Generate a new temporary password for this staff?")) return;
    try {
      const res = await fetch(`/api/staff/${id}/reset-password`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      setTempPassword(data.tempPassword);
      setCopied(false);
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  };

  const handleCopy = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="w-full p-4 sm:p-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Staffs" }]} />

      {/* Header */}
      <div className="admin-header mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Staff Management</h1>
          <p className="text-secondary text-sm">Manage your admin and staff accounts</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:border-primary w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:ring focus:ring-red-200 sm:w-64"
            />
          </div>

          {/* Add Staff */}
          <Link
            href="/admin/staffs/create"
            className="add-btn bg-primary flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Add Staff
          </Link>
        </div>
      </div>

      {/* Temporary password popup */}
      {tempPassword && (
        <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-5 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-yellow-800">Temporary Password (shown once)</h2>
          <p className="mt-3 rounded bg-white px-4 py-3 font-mono text-lg font-semibold text-gray-700 shadow">
            {tempPassword}
          </p>

          {!copied ? (
            <button
              onClick={handleCopy}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Copy to Clipboard
            </button>
          ) : (
            <button
              onClick={() => setTempPassword(null)}
              className="mt-4 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
            >
              ✅ Close
            </button>
          )}
        </div>
      )}

      {/* Table / Skeleton */}
      {loading ? (
        <TableSkeleton />
      ) : staffs.length === 0 ? (
        <div className="rounded border border-gray-200 bg-white py-10 text-center text-gray-500 shadow-sm">
          No staff found
        </div>
      ) : (
        <>
          <div className="table-container w-full">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Password</th>
                  <th>Last Login</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {staffs.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.name}</td>
                    <td className="text-gray-600">{s.username}</td>

                    {/* Role */}
                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          s.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {s.role.charAt(0).toUpperCase() + s.role.slice(1)}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          s.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>

                    {/* Password change status */}
                    <td>
                      {s.must_change_password ? (
                        <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                          <ShieldAlert className="h-3.5 w-3.5" /> Must Change
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Normal
                        </span>
                      )}
                    </td>

                    {/* Last Login */}
                    <td>{s.last_login ? new Date(s.last_login).toLocaleDateString() : "-"}</td>

                    {/* Actions */}
                    <td className="table-actions text-center">
                      <div className="flex justify-center gap-2 sm:justify-start">
                        <button
                          onClick={() => handleResetPassword(s.id)}
                          className="rounded bg-gray-100 p-2 hover:bg-gray-200"
                          title="Reset Password"
                        >
                          <KeyRound className="h-4 w-4 text-yellow-600" />
                        </button>

                        <button
                          onClick={() => router.push(`/admin/staffs/${s.id}/edit`)}
                          className="rounded bg-gray-100 p-2 hover:bg-gray-200"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>

                        <button
                          onClick={() => handleDelete(s.id)}
                          className="rounded bg-gray-100 p-2 hover:bg-gray-200"
                        >
                          <Trash className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              pagination={pagination}
              page={page}
              onPageChange={(newPage) => fetchStaffs(newPage, debouncedSearch)}
            />
          </div>
        </>
      )}
    </div>
  );
}

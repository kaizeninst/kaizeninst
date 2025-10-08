"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function AddStaffPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "staff",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tempPassword, setTempPassword] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create staff");

      setTempPassword(data.tempPassword || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
    }
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Staffs", href: "/admin/staffs" }, { label: "Add Staff" }]} />

      <h1 className="mb-6 text-2xl font-semibold">Add Staff</h1>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Temporary password view */}
        {tempPassword ? (
          <div className="space-y-6 p-6 text-center">
            <h2 className="text-lg font-medium text-yellow-700">Temporary Password (shown once)</h2>
            <p className="rounded border bg-gray-50 px-4 py-3 font-mono text-lg font-semibold text-gray-700 shadow">
              {tempPassword}
            </p>

            {!copied ? (
              <button
                onClick={handleCopy}
                className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Copy to Clipboard
              </button>
            ) : (
              <button
                onClick={() => router.push("/admin/staffs")}
                className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                ✅ Go Back to Staff Management
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {error && (
              <p className="rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {/* Basic info */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Username <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Password (optional)</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Leave empty to auto-generate"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded border px-3 py-2 text-sm"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded border px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={() => router.push("/admin/staffs")}
                className="rounded border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-100"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded bg-red-600 px-5 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Staff"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function EditStaffPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    role: "staff",
    status: "active",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ โหลดข้อมูล staff เดิม
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch(`/api/staff/${id}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load staff");

        setForm({
          name: data.name,
          username: data.username,
          email: data.email,
          role: data.role,
          status: data.status,
        });
      } catch (err) {
        alert(`❌ ${err.message}`);
        router.push("/admin/staffs");
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update staff");

      alert("✅ Staff updated successfully!");
      router.push("/admin/staffs");
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Staffs", href: "/admin/staffs" }, { label: "Edit Staff" }]} />

      <h1 className="mb-6 text-2xl font-semibold">Edit Staff</h1>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Name */}
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

          {/* Username */}
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

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              placeholder="(Optional)"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          {/* Role */}
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

          {/* Status */}
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

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={() => router.push("/admin/staffs")}
              className="rounded border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-100"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-red-600 px-5 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

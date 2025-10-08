"use client";

import { useState } from "react";

export default function StaffChangePasswordPage() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      return setError("All fields are required.");
    }
    if (form.newPassword !== form.confirmPassword) {
      return setError("New passwords do not match.");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/staff/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ ต้องมี cookie JWT
        body: JSON.stringify({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md rounded-lg border border-green-300 bg-white p-6 text-center shadow">
          <h1 className="text-xl font-semibold text-green-700">Password Changed Successfully 🎉</h1>
          <p className="mt-3 text-sm text-gray-600">You can now use your new password to log in.</p>
          <button
            onClick={() => (window.location.href = "/staff/login")}
            className="mt-6 w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h1 className="text-center text-2xl font-semibold text-gray-800">Change Password</h1>
        <p className="mb-6 mt-2 text-center text-sm text-gray-500">
          Enter your old password and set a new one.
        </p>

        {error && (
          <p className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Old Password */}
          <div>
            <label className="mb-1 block text-sm font-medium">Current Password</label>
            <input
              type="password"
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring focus:ring-red-200"
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="mb-1 block text-sm font-medium">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring focus:ring-red-200"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-sm font-medium">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring focus:ring-red-200"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

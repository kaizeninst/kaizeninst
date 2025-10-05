"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin/dashboard";

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin!234");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function safeJson(res) {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      // login via same-origin proxy
      const loginRes = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ username, password }),
      });

      const loginData = await safeJson(loginRes);
      if (!loginRes.ok) {
        setError(loginData?.error || "Login failed");
        setSubmitting(false);
        return;
      }

      // verify cookie/session via proxy
      const meRes = await fetch("/api/admin/auth/me", { cache: "no-store" });
      const me = await safeJson(meRes);

      if (!meRes.ok || !me?.authenticated) {
        setError("Cookie not set or unauthorized. Check CORS/cookie options.");
        setSubmitting(false);
        return;
      }

      // success
      router.replace(nextPath);
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="p-6 sm:p-8">
          <h1 className="text-center text-xl font-semibold text-neutral-800">Admin Panel Login</h1>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm text-neutral-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-neutral-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
                required
              />
            </div>

            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-red-600 py-2.5 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing In…" : "Sign In for Admin / Staff"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

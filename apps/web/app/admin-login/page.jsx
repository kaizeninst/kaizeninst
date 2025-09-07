"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // TODO: call your API
    // const res = await fetch("/api/admin/auth", { ... })

    // demo only
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-screen-xl px-4">
        <div
          className="flex items-center justify-center"
          style={{ minHeight: "calc(100vh - 40px)" }}
        >
          <div className="w-full max-w-md">
            <div className="rounded-md border border-gray-200 bg-white shadow-sm">
              <div className="p-6 sm:p-7">
                <h1 className="text-center text-lg font-semibold text-black">Admin Panel Login</h1>

                <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                  <div className="space-y-1.5">
                    <label htmlFor="username" className="block text-sm text-gray-700">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-red-500/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-sm text-gray-700">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-red-500/30"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-md bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:bg-red-700 disabled:opacity-70"
                  >
                    {loading ? "Signing In..." : "Sign In for Admin / Staff"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

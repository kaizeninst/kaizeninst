"use client";

import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

export default function AdminLayoutProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 โหลดข้อมูล user จาก API (ใช้ JWT cookie)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (data?.authenticated) setUser(data.user);
      } catch {
        // ignore error
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <UserContext.Provider value={user}>
      {/* Global Loading (optional) */}
      {loading ? (
        <div className="flex min-h-screen items-center justify-center text-gray-400">
          Loading user...
        </div>
      ) : (
        children
      )}
    </UserContext.Provider>
  );
}

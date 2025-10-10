"use client";

import { useState } from "react";

/* ============================================================
   STATUS TOGGLE COMPONENT
   ============================================================ */
export default function StatusToggle({ category, onStatusChange }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/categories/${category.id}/toggle`, { method: "PATCH" });
      const data = await response.json();
      if (response.ok) onStatusChange?.(data.status);
      else alert(data.error || "Failed to update");
    } catch (error) {
      console.error("Toggle status error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const isActive = category.status === "active";

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isLoading}
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          isActive ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            isActive ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

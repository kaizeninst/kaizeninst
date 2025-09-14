"use client";

export default function StatusToggle({ item, type = "category", onStatusChange }) {
  if (!item) return null; // ป้องกัน error

  const handleToggle = async () => {
    try {
      const res = await fetch(
        `/api/${type === "category" ? "categories" : "products"}/${item.id}/toggle`,
        {
          method: "PATCH",
        }
      );
      const data = await res.json();
      if (res.ok) {
        onStatusChange?.(data.status);
      } else {
        alert(data.error || "Failed to update");
      }
    } catch (err) {
      console.error("Toggle status error:", err);
    }
  };

  const isActive = item.status === "active";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          isActive ? "bg-black" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            isActive ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span
        className={`rounded px-2 py-1 text-xs font-medium ${
          isActive ? "bg-black text-white" : "bg-gray-200 text-gray-600"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

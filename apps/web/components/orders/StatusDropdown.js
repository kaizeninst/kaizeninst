"use client";

/* ============================================================
   ORDER STATUS DROPDOWN COMPONENT
   ============================================================ */
export default function StatusDropdown({ value, onChange }) {
  const statuses = ["pending", "processing", "shipped", "delivered"];
  const colors = {
    pending: "text-yellow-600",
    processing: "text-gray-700",
    shipped: "text-blue-700",
    delivered: "text-green-700",
  };

  return (
    <select
      value={value || "pending"}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-md border border-gray-300 px-2 py-1 text-xs font-medium focus:ring focus:ring-red-100 ${colors[value]}`}
    >
      {statuses.map((status) => (
        <option key={status} value={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      ))}
    </select>
  );
}

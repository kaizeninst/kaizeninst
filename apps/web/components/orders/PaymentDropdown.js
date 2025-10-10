"use client";

/* ============================================================
   PAYMENT STATUS DROPDOWN COMPONENT
   ============================================================ */
export default function PaymentDropdown({ value, onChange }) {
  const statuses = ["unpaid", "paid"];
  const colors = {
    unpaid: "text-red-600",
    paid: "text-green-700",
  };

  return (
    <select
      value={value || "unpaid"}
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

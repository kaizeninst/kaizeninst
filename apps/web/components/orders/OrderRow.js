"use client";

import { Eye } from "lucide-react";
import PaymentDropdown from "./PaymentDropdown";
import StatusDropdown from "./StatusDropdown";

/* ============================================================
   SINGLE ORDER TABLE ROW
   ============================================================ */
export default function OrderRow({ order, router, onStatusChange, onPaymentChange }) {
  return (
    <tr className="border-t transition hover:bg-gray-50">
      <td className="font-medium">OD-{String(order.id).padStart(4, "0")}</td>

      <td>
        <div className="font-medium">{order.customer_name}</div>
        <div className="text-xs text-gray-500">{order.customer_email}</div>
      </td>

      <td className="text-right font-semibold text-red-600">
        THB{" "}
        {Number(order.total || 0).toLocaleString("th-TH", {
          minimumFractionDigits: 2,
        })}
      </td>

      <td>
        <PaymentDropdown
          value={order.payment_status}
          onChange={(value) => onPaymentChange(order.id, value)}
        />
      </td>

      <td>
        <StatusDropdown
          value={order.order_status}
          onChange={(value) => onStatusChange(order.id, value)}
        />
      </td>

      <td className="text-gray-600">{new Date(order.created_at).toLocaleDateString("th-TH")}</td>

      <td className="table-actions text-center">
        <button
          onClick={() => router.push(`/admin/orders/${order.id}`)}
          className="rounded bg-gray-100 p-2 hover:bg-gray-200"
          title="View Order"
        >
          <Eye className="h-4 w-4 text-gray-700" />
        </button>
      </td>
    </tr>
  );
}

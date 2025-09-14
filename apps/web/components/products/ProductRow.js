import StatusToggle from "../common/StatusToggle";
import { Edit, Trash } from "lucide-react";

export default function ProductRow({ product, onStatusUpdate, onEdit, onDelete }) {
  return (
    <tr className="border-t">
      <td className="px-4 py-2">{product.name}</td>
      <td className="px-4 py-2 text-gray-600">{product.slug}</td>
      <td className="px-4 py-2">{product.price}</td>
      <td className="px-4 py-2">{product.stock_quantity}</td>
      <td className="px-4 py-2">
        <StatusToggle
          type="product"
          item={product}
          onStatusChange={(newStatus) => onStatusUpdate?.(product.id, newStatus)}
        />
      </td>
      <td className="flex gap-2 px-4 py-2">
        <button
          onClick={() => onEdit?.(product)}
          className="rounded bg-gray-100 p-2 hover:bg-gray-200"
        >
          <Edit className="h-4 w-4 text-blue-600" />
        </button>
        <button
          onClick={() => onDelete?.(product.id)}
          className="rounded bg-gray-100 p-2 hover:bg-gray-200"
        >
          <Trash className="h-4 w-4 text-red-600" />
        </button>
      </td>
    </tr>
  );
}

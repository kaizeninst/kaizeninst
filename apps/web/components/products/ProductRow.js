import { Edit, Trash } from "lucide-react";

export default function ProductRow({ product, onToggleShowPrice, onEdit, onDelete }) {
  // ✅ Auto check: if stock = 0 → out of stock
  const isOutOfStock = product.stock_quantity === 0 || product.status !== "active";

  return (
    <tr className="border-t hover:bg-gray-50">
      {/* Image */}
      <td className="px-4 py-2">
        <img
          src={
            product.image_path && product.image_path.trim() !== ""
              ? product.image_path
              : "/images/placeholder.png"
          }
          alt={product.name}
          className="h-10 w-10 rounded border object-cover"
        />
      </td>

      {/* Name */}
      <td className="px-4 py-2 font-medium">{product.name}</td>

      {/* Category */}
      <td className="px-4 py-2 text-gray-600">{product.Category?.name || "-"}</td>

      {/* Price */}
      <td className="px-4 py-2 font-semibold text-red-600">
        THB{" "}
        {Number(product.price).toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}
      </td>

      {/* Show Price toggle */}
      <td className="px-4 py-2 text-left">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={!product.hide_price}
            onChange={() => onToggleShowPrice?.(product)}
          />
          <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-red-600 peer-checked:after:translate-x-full"></div>
        </label>
      </td>

      {/* Stock */}
      <td className="px-4 py-2">{product.stock_quantity}</td>

      {/* ✅ Status */}
      <td className="px-4 py-2">
        <span
          className={`rounded px-3 py-1 text-xs font-semibold ${
            isOutOfStock ? "bg-red-500 text-white" : "bg-black text-white"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "In Stock"}
        </span>
      </td>

      {/* Actions */}
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

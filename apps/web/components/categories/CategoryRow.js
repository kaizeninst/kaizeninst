"use client";

import { ChevronRight, ChevronDown, Edit, Trash, ArrowUp, ArrowDown } from "lucide-react";
import StatusToggle from "./StatusToggle";

/* ============================================================
   CATEGORY TABLE ROW (RECURSIVE)
   ============================================================ */
export default function CategoryRow({
  category,
  depth = 0,
  expanded,
  toggleExpand,
  onStatusUpdate,
  onMove,
  onEdit,
  onDelete,
}) {
  const hasChildren = category.children && category.children.length > 0;
  const productCount = category.productsCount ?? 0;

  return (
    <>
      <tr className={depth === 0 ? "border-t bg-gray-50" : "border-t"}>
        {/* Name with Expand/Collapse */}
        <td className="px-4 py-2">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
            {hasChildren && (
              <button
                onClick={() => toggleExpand(category.id)}
                className="rounded p-1 hover:bg-gray-100"
              >
                {expanded[category.id] ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
            )}
            <span className="font-medium">{category.name}</span>
          </div>
        </td>

        {/* Slug */}
        <td className="px-4 py-2 text-gray-600">{category.slug}</td>

        {/* Sort Order with Move Buttons */}
        <td className="px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onMove?.(category.id, "up")}
              className="rounded p-1 hover:bg-gray-100"
              title="Move Up"
            >
              <ArrowUp className="h-4 w-4 text-gray-500" />
            </button>
            <span className="font-medium">{category.sort_order ?? "-"}</span>
            <button
              onClick={() => onMove?.(category.id, "down")}
              className="rounded p-1 hover:bg-gray-100"
              title="Move Down"
            >
              <ArrowDown className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </td>

        {/* Status */}
        <td className="px-4 py-2">
          <StatusToggle
            category={category}
            onStatusChange={(newStatus) => onStatusUpdate?.(category.id, newStatus)}
          />
        </td>

        {/* Product Count */}
        <td className="px-4 py-2 text-center">{productCount}</td>

        {/* Actions */}
        <td className="flex gap-2 px-4 py-2">
          <button
            onClick={() => onEdit?.(category)}
            className="rounded bg-gray-100 p-2 hover:bg-gray-200"
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </button>
          <button
            onClick={() => onDelete?.(category.id)}
            className="rounded bg-gray-100 p-2 hover:bg-gray-200"
          >
            <Trash className="h-4 w-4 text-red-600" />
          </button>
        </td>
      </tr>

      {/* Render Child Categories Recursively */}
      {hasChildren &&
        expanded[category.id] &&
        category.children.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            depth={depth + 1}
            expanded={expanded}
            toggleExpand={toggleExpand}
            onStatusUpdate={onStatusUpdate}
            onMove={onMove}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </>
  );
}

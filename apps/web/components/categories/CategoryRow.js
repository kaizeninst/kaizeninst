import StatusToggle from "./StatusToggle";
import { Edit, Trash, ChevronRight, ChevronDown } from "lucide-react";

export default function CategoryRow({
  category,
  depth = 0,
  expanded,
  toggleExpand,
  onStatusUpdate,
}) {
  const hasChildren = category.children && category.children.length > 0;
  const productCount = category.productsCount ?? 0;

  return (
    <>
      <tr className={depth === 0 ? "border-t bg-gray-50" : "border-t"}>
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
        <td className="px-4 py-2 text-gray-600">{category.slug}</td>
        <td className="px-4 py-2">{category.sort_order ?? "-"}</td>
        <td className="px-4 py-2">
          <StatusToggle
            category={category}
            onStatusChange={(newStatus) => {
              onStatusUpdate?.(category.id, newStatus); // ✅ ส่งขึ้นไปบอก parent
            }}
          />
        </td>
        <td className="px-4 py-2">{productCount}</td>
        <td className="flex gap-2 px-4 py-2">
          <button className="rounded bg-gray-100 p-2 hover:bg-gray-200">
            <Edit className="h-4 w-4 text-blue-600" />
          </button>
          <button className="rounded bg-gray-100 p-2 hover:bg-gray-200">
            <Trash className="h-4 w-4 text-red-600" />
          </button>
        </td>
      </tr>

      {/* Children */}
      {hasChildren &&
        expanded[category.id] &&
        category.children.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            depth={depth + 1}
            expanded={expanded}
            toggleExpand={toggleExpand}
            onStatusUpdate={onStatusUpdate} // ✅ ส่งต่อไป child ด้วย
          />
        ))}
    </>
  );
}

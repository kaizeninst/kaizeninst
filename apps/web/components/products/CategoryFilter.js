"use client";
import { useEffect, useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

export default function CategoryFilter({ selectedId, onSelect }) {
  const [open, setOpen] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // โหลด top-level categories + children
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories?limit=100&parent_id=null", { cache: "no-store" });
        const json = await res.json();
        setCategories(json?.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleOpen = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const Row = ({ children, active }) => (
    <div
      className={`flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100 ${
        active ? "bg-gray-200 font-medium" : ""
      }`}
    >
      {children}
    </div>
  );

  const renderCategory = (cat) => {
    const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;
    const isOpen = !!open[cat.id];
    const isSelected = selectedId === cat.id;

    return (
      <li key={cat.id}>
        <Row active={isSelected}>
          {/* ซ้าย: กดชื่อเพื่อ "เลือก" แม้เป็น parent */}
          <button type="button" onClick={() => onSelect?.(cat.id)} className="flex-1 text-left">
            {cat.name}{" "}
            {typeof cat.productsCount === "number" && cat.productsCount > 0 && (
              <span className="ml-1 text-xs text-gray-500">({cat.productsCount})</span>
            )}
          </button>

          {/* ขวา: ปุ่มพับ/กาง เฉพาะที่มี children */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleOpen(cat.id);
              }}
              aria-label={isOpen ? "Collapse" : "Expand"}
              className="ml-2 inline-flex items-center rounded p-1 hover:bg-gray-200"
            >
              {isOpen ? (
                <ChevronDown size={16} className="text-gray-600" />
              ) : (
                <ChevronRight size={16} className="text-gray-600" />
              )}
            </button>
          ) : null}
        </Row>

        {hasChildren && isOpen && (
          <ul className="ml-4 mt-1 space-y-1 border-l pl-3">
            {cat.children.map((child) => renderCategory(child))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="text-foreground mb-3 text-lg font-semibold">Product Category</h3>

      {loading && <p className="text-sm text-gray-500">Loading categories...</p>}

      {!loading && (
        <ul className="space-y-1">
          {/* ปุ่ม All */}
          <li>
            <button
              type="button"
              onClick={() => onSelect?.("All")}
              className={`w-full rounded-md px-2 py-1 text-left hover:bg-gray-100 ${
                selectedId === "All" ? "bg-gray-200 font-medium" : ""
              }`}
            >
              All
            </button>
          </li>

          {categories.length > 0 ? (
            categories.map((cat) => renderCategory(cat))
          ) : (
            <li className="text-sm text-gray-500">No categories found</li>
          )}
        </ul>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

// Mock data
const mockCategories = [
  {
    id: 1,
    name: "Electrical",
    slug: "electrical",
    productsCount: 4,
    children: [],
  },
  {
    id: 2,
    name: "Fans",
    slug: "fans",
    productsCount: 2,
    children: [
      {
        id: 3,
        name: "Industrial Fans",
        slug: "industrial-fans",
        productsCount: 4,
        children: [],
      },
    ],
  },
  {
    id: 4,
    name: "Lighting",
    slug: "lighting",
    productsCount: 4,
    children: [
      {
        id: 5,
        name: "LED Lighting",
        slug: "led-lighting",
        productsCount: 4,
        children: [],
      },
      {
        id: 11,
        name: "LED Lighting 2",
        slug: "led-lighting-2",
        productsCount: 0,
        children: [],
      },
    ],
  },
  {
    id: 8,
    name: "Tools",
    slug: "tools",
    productsCount: 2,
    children: [
      {
        id: 9,
        name: "Hand Tools",
        slug: "hand-tools",
        productsCount: 3,
        children: [],
      },
      {
        id: 10,
        name: "Power Tools",
        slug: "power-tools",
        productsCount: 3,
        children: [],
      },
    ],
  },
];

export default function CategoryFilter() {
  const [open, setOpen] = useState({});
  const [selected, setSelected] = useState(null);

  const toggleOpen = (id) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCategory = (cat) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isOpen = open[cat.id];

    return (
      <li key={cat.id}>
        <div
          onClick={() => (hasChildren ? toggleOpen(cat.id) : setSelected(cat.slug))}
          className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100 ${
            selected === cat.slug ? "bg-gray-200 font-medium" : ""
          }`}
        >
          <span>
            {cat.name}{" "}
            {cat.productsCount > 0 && (
              <span className="ml-1 text-xs text-gray-500">({cat.productsCount})</span>
            )}
          </span>
          {hasChildren &&
            (isOpen ? (
              <ChevronDown size={16} className="text-gray-500" />
            ) : (
              <ChevronRight size={16} className="text-gray-500" />
            ))}
        </div>

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
      <ul className="space-y-1">{mockCategories.map((cat) => renderCategory(cat))}</ul>

      {selected && (
        <div className="text-primary mt-4 text-sm">
          ✅ เลือก: <span className="font-medium">{selected}</span>
        </div>
      )}
    </div>
  );
}

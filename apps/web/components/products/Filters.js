"use client";

export default function Filters({
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  inStockOnly,
  setInStockOnly,
  brands,
  categories,
}) {
  return (
    <div className="space-y-4">
      {/* Category */}
      <div>
        <label className="text-foreground block font-medium">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Brand */}
      <div>
        <label className="text-foreground block font-medium">Brand</label>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
        >
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="text-foreground block font-medium">Price Range</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
            className="w-1/2 rounded-lg border px-3 py-2"
          />
          <span className="text-secondary">-</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Math.max(minPrice, Number(e.target.value)))}
            className="w-1/2 rounded-lg border px-3 py-2"
          />
        </div>
      </div>

      {/* In stock */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="text-primary focus:ring-primary rounded"
        />
        <label className="text-foreground">In Stock Only</label>
      </div>
    </div>
  );
}

"use client";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Dummy product data with new brand and category properties
import { products } from "../../data/productsdata";

function Filters({
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
      {/* Category Filter */}
      <div className="space-y-2">
        <label className="block font-medium">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2">
        <label className="block font-medium">Brand</label>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-4">
        <label className="block font-medium">Price Range</label>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
              className="w-1/2 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Math.max(minPrice, Number(e.target.value)))}
              className="w-1/2 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={0}
              max={30000}
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="range"
              min={0}
              max={30000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* In Stock Only Filter */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="rounded text-blue-600 focus:ring-blue-500"
        />
        <label className="font-medium">In Stock Only</label>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialBrand = searchParams.get("brand") || "All";
  const initialCategory = searchParams.get("category") || "All";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(30000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("name-asc");
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Calculate unique brands and categories on initial load
  useEffect(() => {
    const allBrands = ["All", ...new Set(products.map((p) => p.brand))];
    setBrands(allBrands);
    const allCategories = ["All", ...new Set(products.map((p) => p.category))];
    setCategories(allCategories);
    const prices = products.map((p) => p.price);
    setMinPrice(Math.min(...prices));
    setMaxPrice(Math.max(...prices));
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand;
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
      const matchesStock = !inStockOnly || product.inStock;
      return matchesSearch && matchesBrand && matchesCategory && matchesPrice && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <div>
      <Navbar />
      <div className="p-8 md:p-12 lg:p-16">
        <div className="space-y-8">
          {/* Header + Search */}
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <h1 className="text-4xl font-bold">Products</h1>
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-6 md:flex-row md:space-x-8 md:space-y-0">
            {/* Mobile Filter Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="w-full rounded-md bg-blue-500 py-2 font-medium text-white transition-colors hover:bg-blue-600"
              >
                Show Filters
              </button>
            </div>

            {/* Mobile Drawer */}
            <div
              className={`fixed inset-y-0 right-0 z-50 w-full transform overflow-y-auto bg-white p-6 shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
                isFilterOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Filters</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <Filters
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
                brands={brands}
                categories={categories}
              />
            </div>

            {/* Desktop sidebar filter */}
            <div className="hidden md:block md:w-1/4">
              <h3 className="mb-4 text-2xl font-semibold">Filters</h3>
              <Filters
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
                brands={brands}
                categories={categories}
              />
            </div>

            {/* Product Grid */}
            <div className="w-full md:w-3/4">
              <div className="mb-4 flex justify-end">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAndSortedProducts.length > 0 ? (
                  filteredAndSortedProducts.map((product) => (
                    <Link href={`/products/${product.id}`} key={product.id} className="group block">
                      <div className="group block overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-xl">
                        <div>
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={400}
                            height={300}
                            className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                            unoptimized
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold">{product.name}</h3>
                          <p className="font-medium text-gray-600">${product.price}</p>
                          <p className="text-sm text-gray-500">Brand: {product.brand}</p>
                          <p
                            className="mt-1 text-sm"
                            style={{ color: product.inStock ? "green" : "red" }}
                          >
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500">
                    No products match your filters.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

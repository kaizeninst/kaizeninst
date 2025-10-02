"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Components
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { products } from "@/data/productsdata";

// -------------------- Pagination Component --------------------
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [inputPage, setInputPage] = useState(currentPage.toString());

  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputPage(value);

    if (!value) return;

    const pageNumber = Number(value);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  return (
    <div className="mt-8 flex items-center justify-center space-x-2">
      {/* Prev button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f80000] text-white transition-colors hover:bg-[#A80000] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Page number input */}
      <span className="flex items-center text-sm font-semibold text-gray-700">
        <input
          type="number"
          value={inputPage}
          onChange={handleInputChange}
          min="1"
          max={totalPages}
          className="w-12 rounded-lg border px-1 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="ml-1">of {totalPages}</span>
      </span>

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f80000] text-white transition-colors hover:bg-[#A80000] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

// -------------------- Filters Component --------------------
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
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
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
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <label className="block font-medium">Price Range</label>
        <div className="flex flex-col space-y-2">
          {/* Input (min-max) */}
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

          {/* Slider */}
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

      {/* In Stock Only */}
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

// -------------------- Main Products Page --------------------
export default function ProductsPage() {
  const searchParams = useSearchParams();

  // Initial filter state from URL
  const initialBrand = searchParams.get("brand") || "All";
  const initialCategory = searchParams.get("category") || "All";

  // States
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
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 8;

  // Load brands & categories from products
  useEffect(() => {
    const allBrands = ["All", ...new Set(products.map((p) => p.brand))];
    const allCategories = ["All", ...new Set(products.map((p) => p.category))];

    setBrands(allBrands);
    setCategories(allCategories);

    const prices = products.map((p) => p.price);
    setMinPrice(Math.min(...prices));
    setMaxPrice(Math.max(...prices));
  }, []);

  // Filter + sort products
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

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBrand, selectedCategory, minPrice, maxPrice, inStockOnly, sortBy]);

  // -------------------- Render --------------------
  return (
    <div>
      <Navbar />

      <div className="p-8 md:p-12 lg:p-16">
        <div className="space-y-8">
          <div className="flex flex-col space-y-6 md:flex-row md:space-x-8 md:space-y-0">
            {/* --------- Mobile Filter Button --------- */}
            <div className="md:hidden">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="w-full rounded-md bg-blue-500 py-2 font-medium text-white transition-colors hover:bg-blue-600"
              >
                Show Filters
              </button>
            </div>

            {/* --------- Mobile Drawer --------- */}
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

            {/* --------- Desktop Sidebar --------- */}
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

              {/* Sort option */}
              <div className="mt-4 flex justify-start">
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
            </div>

            {/* --------- Product Grid --------- */}
            <div className="w-full md:w-3/4">
              {/* Search Bar */}
              <div className="mb-4 flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-[5px] border border-[#8D8D8D] py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Product List */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <Link href={`/products/${product.id}`} key={product.id}>
                      <div className="group overflow-hidden rounded-xl border bg-white shadow transition hover:shadow-lg">
                        <div className="relative h-56 w-full overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={400}
                            height={300}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            unoptimized
                          />
                        </div>
                        <div className="flex flex-col space-y-2 p-4">
                          <h3 className="line-clamp-2 text-base font-semibold transition group-hover:text-[#A80000]">
                            {product.name}
                          </h3>
                          <p className="text-lg font-bold text-[#f80000]">฿{product.price}</p>
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

              {/* Pagination */}
              {filteredAndSortedProducts.length > productsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

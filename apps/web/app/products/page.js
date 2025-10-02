"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { products } from "@/data/productsdata";
import Pagination from "@/components/common/Pagination";
import Filters from "@/components/products/Filters";
import ProductCard from "@/components/products/ProductCard";

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
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 8;

  // โหลด brands & categories
  useEffect(() => {
    const allBrands = ["All", ...new Set(products.map((p) => p.brand))];
    const allCategories = ["All", ...new Set(products.map((p) => p.category))];
    setBrands(allBrands);
    setCategories(allCategories);
  }, []);

  // filter & sort
  const filteredAndSortedProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = selectedBrand === "All" || p.brand === selectedBrand;
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
      const matchesStock = !inStockOnly || p.inStock;
      return matchesSearch && matchesBrand && matchesCategory && matchesPrice && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      return 0;
    });

  // pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const pagination = {
    page: currentPage,
    limit: productsPerPage,
    total: filteredAndSortedProducts.length,
    totalPages,
  };

  const indexOfLast = currentPage * productsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(
    indexOfLast - productsPerPage,
    indexOfLast
  );

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Filters */}
        <aside className="space-y-4 md:w-1/4">
          <h3 className="text-foreground text-2xl font-semibold">Filters</h3>
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
          <div className="mt-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="focus:ring-primary rounded-lg border px-3 py-2 focus:ring-2"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
        </aside>

        {/* Product Section */}
        <main className="md:w-3/4">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-secondary text-foreground focus:ring-primary w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-2"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-secondary h-5 w-5"
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

          {/* Product Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => <ProductCard key={product.id} product={product} />)
            ) : (
              <p className="text-secondary col-span-full text-center">
                No products match your filters.
              </p>
            )}
          </div>

          {/* Pagination */}
          {filteredAndSortedProducts.length > productsPerPage && (
            <Pagination pagination={pagination} page={currentPage} onPageChange={setCurrentPage} />
          )}
        </main>
      </div>
    </div>
  );
}

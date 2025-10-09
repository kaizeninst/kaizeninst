"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

/* ============================================================
   PROMOTION BANNERS
   ============================================================ */
const promotionBanners = [
  "https://placehold.co/800x400/png?text=Promotion+1",
  "https://placehold.co/400x200/png?text=Promotion+2",
  "https://placehold.co/400x200/png?text=Promotion+3",
];

/* ============================================================
   HOME PAGE CONTENT COMPONENT
   ============================================================ */
export default function HomePageContent() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // Fetch categories and products from API
  useEffect(() => {
    (async () => {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/products", { cache: "no-store" }),
        ]);

        const categoryData = await categoryResponse.json();
        const productData = await productResponse.json();

        setCategories(categoryData?.data || categoryData);
        setProducts(productData?.data || productData);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto space-y-16 py-12">
      {/* ---------- PROMOTIONS ---------- */}
      <section>
        <h2 className="mb-6 text-3xl font-bold text-gray-900">Promotions</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="overflow-hidden rounded-2xl md:col-span-2">
            <Image
              src={promotionBanners[0]}
              alt="Promotion Banner 1"
              width={800}
              height={400}
              className="h-full w-full rounded-2xl object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="grid gap-6 md:grid-rows-2">
            {promotionBanners.slice(1).map((banner, index) => (
              <Image
                key={index}
                src={banner}
                alt={`Promotion Banner ${index + 2}`}
                width={400}
                height={200}
                className="h-full w-full rounded-2xl object-cover transition-transform duration-500 hover:scale-105"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Category</h2>
          <Link href="/products" className="text-primary font-semibold hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Link
              href={`/products?category=${category.id}`}
              key={category.id}
              className="hover:border-primary flex h-40 items-center justify-center rounded-xl border border-gray-200 bg-white text-center shadow-md transition-all hover:shadow-lg"
            >
              <span className="group-hover:text-primary text-xl font-semibold text-gray-800">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- NEW PRODUCTS ---------- */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
          <Link href="/products" className="text-primary font-semibold hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <Link
              href={`/products/${product.id}`}
              key={product.id}
              className="group overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-2xl"
            >
              <div className="relative aspect-square">
                <Image
                  src={
                    product.image_path && product.image_path.trim() !== ""
                      ? product.image_path.startsWith("http")
                        ? product.image_path
                        : product.image_path.startsWith("/uploads")
                          ? product.image_path
                          : `/uploads/${product.image_path}`
                      : "https://placehold.co/400x400/png"
                  }
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-4">
                <h3 className="group-hover:text-primary text-lg font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-primary mt-1 font-bold">฿{product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState, use } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import DOMPurify from "dompurify";

export default function ProductDetailPage({ params }) {
  const { id } = use(params);

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch product detail by ID
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`, { cache: "no-store" });
        const json = await res.json();

        if (!res.ok) throw new Error(json?.error || "Failed to fetch product");
        const p = json?.data || json;

        if (mounted) setProduct(p || null);
      } catch (err) {
        console.error("Load product error:", err);
        if (mounted) setError("Cannot load product");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, [id]);

  // Handle quantity increment / decrement
  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  // Format price
  // If hide_price is 1 → show 0 instead of actual price
  const priceText = useMemo(() => {
    if (!product) return "";
    const value = product.hide_price ? 0 : Number(product.price || 0);

    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 2,
    }).format(value);
  }, [product]);

  // Determine image source
  const imageSrc =
    product?.image_url ||
    (product?.image_path?.trim()
      ? product.image_path.startsWith("http")
        ? product.image_path
        : product.image_path.startsWith("/uploads")
          ? product.image_path
          : `/uploads/${product.image_path}`
      : "/images/placeholder.png");

  const brandText = product?.brand || product?.Category?.name || "";

  // Build breadcrumb items
  function buildBreadcrumbItems(p) {
    const items = [{ label: "Products", href: "/products" }];
    const trail = buildCategoryTrail(p?.Category);
    trail.forEach((cat) =>
      items.push({
        label: cat.name,
        href: `/products?category_id=${cat.id}&descendants=1`,
      })
    );
    items.push({ label: p?.name });
    return items;
  }

  // Build breadcrumb category trail
  function buildCategoryTrail(cat) {
    const trail = [];
    let cur = cat;
    while (cur) {
      trail.unshift(cur);
      cur = cur.parent || cur.Parent || null;
    }
    return trail;
  }

  // Add product to cart (localStorage)
  const handleAddToCart = () => {
    if (!product) return;

    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    const exist = stored.find((i) => i.id === product.id);

    if (exist) {
      exist.quantity += quantity;
    } else {
      stored.push({
        id: product.id,
        name: product.name,
        image: product.image_path,
        price: Number(product.price || 0),
        quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(stored));
    window.dispatchEvent(new Event("storage"));

    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  // If product is inactive → do not show it
  if (product && product.status === "inactive") {
    return (
      <div className="container mx-auto min-h-screen p-8 text-center text-gray-600 md:p-12">
        <h1 className="text-xl font-semibold text-red-600">This product is not available</h1>
        <div className="mt-2">
          <Link href="/products" className="text-red-600 hover:text-red-700 hover:underline">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Handle loading and error states
  if (loading)
    return <div className="container mx-auto min-h-screen p-8 md:p-12">Loading product...</div>;

  if (error || !product) {
    return (
      <div className="container mx-auto min-h-screen p-8 md:p-12">
        <h1 className="text-xl font-semibold text-red-600">Product Not Found</h1>
        <div className="mt-2">
          <Link href="/products" className="text-red-600 hover:text-red-700 hover:underline">
            ← Continue view Products
          </Link>
        </div>
      </div>
    );
  }

  // Render product detail
  return (
    <div className="container mx-auto min-h-screen p-8 md:p-12">
      {/* Back link */}
      <div className="mb-2 text-sm">
        <Link href="/products" className="text-red-600 hover:text-red-700 hover:underline">
          ← Continue view Products
        </Link>
      </div>

      <div className="space-y-8">
        <Breadcrumb items={buildBreadcrumbItems(product)} />

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Product image */}
          <div className="flex items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <Image
              src={imageSrc}
              alt={product.name}
              width={550}
              height={550}
              className="h-[420px] w-[420px] object-cover md:h-[520px] md:w-[520px]"
              unoptimized
            />
          </div>

          {/* Product details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold md:text-4xl">{product.name}</h1>
            <p className="text-gray-600">{brandText}</p>
            <div className="text-2xl font-bold text-black">{priceText}</div>

            {/* Quantity control and Add to cart */}
            <div className="flex w-full flex-col gap-3 sm:max-w-sm">
              <div className="flex items-stretch overflow-hidden rounded-md border">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="px-5 py-2 text-lg hover:bg-gray-100"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <div className="flex w-full items-center justify-center border-x px-6 py-2 text-lg">
                  {quantity}
                </div>

                <button
                  onClick={() => handleQuantityChange(1)}
                  className="px-5 py-2 text-lg hover:bg-gray-100"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full rounded-md bg-red-600 py-3 font-semibold tracking-wide text-white transition-colors hover:bg-red-700"
              >
                ADD TO CART
              </button>
            </div>
          </div>
        </div>

        {/* Product description */}
        <div className="space-y-6 md:col-span-2">
          <div className="space-y-3">
            <div
              className="prose max-w-none leading-7 text-gray-700"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  product.description ||
                    "<em>No additional information is available for this product.</em>"
                ),
              }}
            />
          </div>
        </div>
      </div>

      {/* Popup message after adding to cart */}
      {showPopup && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-red-600 px-6 py-3 text-white shadow-xl">
          Added {quantity} of {product?.name} to cart!
        </div>
      )}
    </div>
  );
}

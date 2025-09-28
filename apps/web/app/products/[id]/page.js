"use client";
import Image from "next/image";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import React, { useState } from "react";
import Link from "next/link";
import { products } from "../../../data/productsdata";

export default function ProductDetailPage({ params }) {
  const { id } = React.use(params);
  const [quantity, setQuantity] = useState(1);
  const [showPopup, setShowPopup] = useState(false);

  const product = products.find((p) => p.id === id);

  const handleQuantityChange = (change) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + change));
  };

  const handleAddToCart = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = storedCart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      storedCart.push({ id: product.id, quantity });
    }

    localStorage.setItem("cart", JSON.stringify(storedCart));
    window.dispatchEvent(new Event("storage")); // update navbar

    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  if (!product) {
    return <h1>Product Not Found</h1>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="p-8 md:p-12 lg:p-12">
        <div className="mb-2 text-sm">
          <Link href="/products" className="text-[#f80000] hover:text-[#A80000] hover:underline">
            ← Continue view Products
          </Link>
        </div>
        <div className="space-y-8">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-gray-500">
            <Link href="/products" className="hover:underline">
              Products
            </Link>
            <span>&gt;</span>
            <span className="font-semibold text-gray-800">{product.name}</span>
          </div>

          {/* Main Info */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex justify-center overflow-hidden rounded-lg shadow-lg">
              <Image
                src={product.image}
                alt={product.name}
                width={480}
                height={480}
                className="h-[480px] w-[480px] object-cover"
              />
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">{product.name}</h1>
              <p className="text-md text-gray-600">{product.brand}</p>
              <h2 className="text-2xl font-bold text-black">{product.price}$</h2>

              {/* Quantity + Add to Cart */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center overflow-hidden rounded-lg border">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="bg-gray-100 px-4 py-2 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="w-12 border-x px-4 py-2 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="bg-gray-100 px-4 py-2 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="rounded-lg bg-red-600 px-6 py-2 text-white shadow hover:bg-red-700"
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>

          {/* Datasheet + Info + Specs */}
          <div className="space-y-6 md:col-span-2">
            <button className="rounded-lg border border-red-600 px-6 py-2 text-red-600 hover:bg-red-50">
              Download Datasheet
            </button>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Product Information</h2>
              <p className="text-gray-700">{product.description}</p>

              <h2 className="text-2xl font-bold">Specifications</h2>
              <ul className="list-inside list-disc space-y-1 text-gray-700">
                {product.specifications &&
                  Object.entries(product.specifications).map(([key, value]) => (
                    <li key={key}>
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:{" "}
                      {value}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Popup */}
      {showPopup && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-red-500 px-6 py-3 text-white shadow-xl">
          Added {quantity} of {product?.name} to cart!
        </div>
      )}
    </div>
  );
}

"use client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import React from "react";
import { products } from "../data/productsdata";
// ============================================================================
// DATA (Consolidated from src/data/data.ts)
// ============================================================================
const uniqueBrands = [...new Set(products.map((p) => p.brand))];
const brandsWithImages = uniqueBrands.map((brandName) => {
  const product = products.find((p) => p.brand === brandName);
  return {
    name: brandName,
    image: product?.brand_image ?? "https://placehold.co/400x400?text=No+Image",
  };
});
const brandsToShow = brandsWithImages.slice(0, 4);

const heroSlides = ["https://placehold.co/1200x400/F0F0F0/000000?text=Hero+Slide+1"];

const promotionBanners = [
  "https://placehold.co/600x200/F0F0F0/000000?text=Promotion+Banner+1",
  "https://placehold.co/600x200/F0F0F0/000000?text=Promotion+Banner+2",
];

// HomePage component
const HomePage = () => {
  return (
    <div className="space-y-12">
      <div className="relative overflow-hidden rounded-lg shadow-lg">
        <Image
          src={heroSlides[0]}
          alt="Hero Banner"
          className="object-cover"
          width={1024}
          height={1024}
          unoptimized
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25">
          <h1 className="text-4xl font-bold text-white">Hero Banner</h1>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {promotionBanners.map((banner, index) => (
          <div key={index} className="overflow-hidden rounded-lg shadow-lg">
            <Image
              src={banner}
              alt={`Promotion Banner ${index + 1}`}
              width={600}
              height={600}
              className="object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>
      {/* Brand Categories Section */}
      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Category</h2>
          <Link href="/products" className="text-blue-600 hover:underline">
            View All &gt;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {brandsToShow.map((brandObj) => (
            <a
              href={`/products?brand=${encodeURIComponent(brandObj.name)}`}
              key={brandObj.name}
              className="group block"
            >
              <div className="relative flex h-40 flex-col items-center justify-center overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-xl">
                <Image
                  src={brandObj.image}
                  alt={brandObj.name}
                  width={400}
                  height={400}
                  unoptimized
                  className="mb-2 h-full w-full object-cover"
                />
                <h3 className="absolute text-2xl font-bold text-gray-800 transition-colors group-hover:text-blue-600">
                  {brandObj.name}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </section>
      {/* New Product Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl font-bold">New Product</h2>
          <Link href="/products" className="text-blue-600 hover:underline">
            View All &gt;
          </Link>
        </div>
        {/* new products data fetch from data */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <Link href={`/products/${product.id}`} key={product.id} className="group block">
              <div className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-xl">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                  unoptimized
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// MAIN APPLICATION COMPONENT
// This component manages the state and renders the appropriate page.
// ============================================================================
const App = () => {
  return (
    <div className="App">
      <Navbar />
      <main className="container mx-auto min-h-screen px-4 py-8">{HomePage()}</main>
      <Footer />
    </div>
  );
};

export default App;

"use client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import React, { useState, useEffect } from "react";
import { products } from "../data/productsdata";
import { MoveLeft, MoveRight } from "lucide-react";

const uniqueBrands = [...new Set(products.map((p) => p.brand))];
const brandsWithImages = uniqueBrands.map((brandName) => {
  const product = products.find((p) => p.brand === brandName);
  return {
    name: brandName,
    image: product?.brand_image ?? "https://placehold.co/400x400?text=No+Image",
  };
});
const brandsToShow = brandsWithImages.slice(0, 8); // show 8 brands

const heroSlides = ["/assets/Black.jpg", "/assets/Black.jpg", "/assets/Black.jpg"];

const promotionBanners = [
  "https://placehold.co/600x200/F0F0F0/000000?text=Promotion+Banner+1",
  "https://placehold.co/600x200/F0F0F0/000000?text=Promotion+Banner+2",
  "https://placehold.co/600x200/F0F0F0/000000?text=Promotion+Banner+3",
];

// ============================================================================
// HERO BANNER (FULLSCREEN CAROUSEL)
// ============================================================================
const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-full">
      <Image
        src={heroSlides[currentSlide]}
        alt={`Hero Slide ${currentSlide + 1}`}
        fill
        className="object-cover"
        sizes="100vw"
        unoptimized
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
        <h1 className="text-4xl font-bold text-white">Hero Banner</h1>
      </div>
      <button
        onClick={() =>
          setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
      >
        <MoveLeft />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
      >
        <MoveRight />
      </button>
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 space-x-2">
        {heroSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-3 w-3 rounded-full ${idx === currentSlide ? "bg-[#A80000]" : "bg-gray-400"}`}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// HOME PAGE CONTENT
// ============================================================================
const HomePageContent = () => {
  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      {/* Promotion Banners Section */}
      <div>
        <h2 className="mb-4 text-xl font-bold">Promotion</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Link href="/promotion/1">
              <Image
                src={promotionBanners[0]}
                alt="Promotion Banner 1"
                width={800}
                height={400}
                className="h-full w-full rounded-lg object-cover shadow-lg"
                unoptimized
              />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-rows-2">
            <Link href="/promotion/2">
              <Image
                src={promotionBanners[1]}
                alt="Promotion Banner 2"
                width={400}
                height={200}
                className="h-full w-full rounded-lg object-cover shadow-lg"
                unoptimized
              />
            </Link>
            <Link href="/promotion/3">
              <Image
                src={promotionBanners[2]}
                alt="Promotion Banner 3"
                width={400}
                height={200}
                className="h-full w-full rounded-lg object-cover shadow-lg"
                unoptimized
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Brand Categories Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Category</h2>
          <Link href="/products" className="text-[#A80000] hover:underline">
            View All &gt;
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {brandsToShow.map((brandObj) => (
            <a
              href={`/products?brand=${encodeURIComponent(brandObj.name)}`}
              key={brandObj.name}
              className="group block"
            >
              <div className="relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-xl">
                <Image
                  src={brandObj.image}
                  alt={brandObj.name}
                  fill
                  unoptimized
                  className="object-cover"
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
          <Link href="/products" className="text-[#A80000] hover:underline">
            View All &gt;
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <Link href={`/products/${product.id}`} key={product.id} className="group block">
              <div className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-xl">
                <div className="relative aspect-square w-full">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                </div>
                <div className="p-4 pt-0">
                  <h1 className="font-semibold text-[#A80000]">฿{product.price}</h1>
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
// MAIN APP
// ============================================================================
const App = () => {
  return (
    <div className="App">
      <Navbar />
      <HeroBanner />
      <HomePageContent />
      <Footer />
    </div>
  );
};

export default App;

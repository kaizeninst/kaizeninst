"use client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
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
const brandsToShow = brandsWithImages.slice(0, 8);

const heroSlides = ["/assets/Black.jpg", "/assets/Black.jpg", "/assets/Black.jpg"];

const promotionBanners = [
  "https://placehold.co/600x200/F0F0F0/000000?text=Promotion+Banner+1",
  "https://placehold.co/600x200/F0F0F0/000000?text=Promotion+Banner+2",
  "https://placehold.co/600x200/F0F0F0/000000?text=Promotion+Banner+3",
];

// ============================================================================
// HERO BANNER
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
      {/* Prev/Next */}
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
      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 space-x-2">
        {heroSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-3 w-3 rounded-full ${
              idx === currentSlide ? "bg-primary" : "bg-secondary"
            }`}
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
      {/* Promotion */}
      <div>
        <h2 className="text-foreground mb-4 text-xl font-bold">Promotion</h2>
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
            {promotionBanners.slice(1).map((banner, i) => (
              <Link href={`/promotion/${i + 2}`} key={i}>
                <Image
                  src={banner}
                  alt={`Promotion Banner ${i + 2}`}
                  width={400}
                  height={200}
                  className="h-full w-full rounded-lg object-cover shadow-lg"
                  unoptimized
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Categories */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-foreground text-3xl font-bold">Category</h2>
          <Link href="/products" className="text-primary hover:underline">
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
              <div className="bg-background relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl">
                <Image
                  src={brandObj.image}
                  alt={brandObj.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
                <h3 className="text-foreground group-hover:text-primary absolute text-2xl font-bold transition-colors">
                  {brandObj.name}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* New Products */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-foreground text-3xl font-bold">New Product</h2>
          <Link href="/products" className="text-primary hover:underline">
            View All &gt;
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <Link href={`/products/${product.id}`} key={product.id} className="group block">
              <div className="bg-background overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl">
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
                  <h3 className="text-foreground text-lg font-semibold">{product.name}</h3>
                </div>
                <div className="p-4 pt-0">
                  <h1 className="text-primary font-semibold">฿{product.price}</h1>
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
export default function Home() {
  return (
    <>
      <HeroBanner />
      <HomePageContent />
    </>
  );
}

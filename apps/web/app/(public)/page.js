"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ============================================================
   HERO IMAGE SOURCES
   ============================================================ */
const heroImagesDesktop = [
  "https://placehold.co/1600x800/png?text=Desktop+1",
  "https://placehold.co/1600x800/png?text=Desktop+2",
  "https://placehold.co/1600x800/png?text=Desktop+3",
];

const heroImagesMobile = [
  "https://placehold.co/800x1200/png?text=Mobile+1",
  "https://placehold.co/800x1200/png?text=Mobile+2",
  "https://placehold.co/800x1200/png?text=Mobile+3",
];

const promotionBanners = [
  "https://placehold.co/800x400/png?text=Promotion+1",
  "https://placehold.co/400x200/png?text=Promotion+2",
  "https://placehold.co/400x200/png?text=Promotion+3",
];

/* ============================================================
   HERO BANNER COMPONENT
   ============================================================ */
const HeroBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1); // 1 = next, -1 = previous
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const autoSlideRef = useRef(null);

  /* ---------- Detect screen size ---------- */
  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ---------- Start auto-slide ---------- */
  const startAutoSlide = () => {
    clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setSlideDirection(1);
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(autoSlideRef.current);
  }, [isMobileScreen]);

  /* ---------- Handle indicator click ---------- */
  const handleIndicatorClick = (targetIndex) => {
    const newDirection = targetIndex > currentIndex ? 1 : -1;
    setSlideDirection(newDirection);
    setCurrentIndex(targetIndex);
    startAutoSlide(); // reset timer after manual change
  };

  /* ---------- Slide animation variants ---------- */
  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%" }),
    center: { x: 0 },
    exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%" }),
  };

  /* ---------- Select image set based on screen size ---------- */
  const activeSlides = isMobileScreen ? heroImagesMobile : heroImagesDesktop;

  return (
    <div className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden">
      {/* Slide container */}
      <AnimatePresence custom={slideDirection} mode="popLayout" initial={false}>
        <motion.div
          key={currentIndex}
          custom={slideDirection}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 120, damping: 20 },
            duration: 0.8,
          }}
          className="absolute inset-0"
        >
          <Image
            src={activeSlides[currentIndex]}
            alt={`Hero Slide ${currentIndex + 1}`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* Indicator buttons */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
        {activeSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleIndicatorClick(index)}
            className={`h-3 w-3 rounded-full transition-all ${
              index === currentIndex ? "scale-125 bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   HOME PAGE CONTENT
   ============================================================ */
const HomePageContent = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

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
};

/* ============================================================
   MAIN PAGE EXPORT
   ============================================================ */
export default function Home() {
  return (
    <>
      <HeroBanner />
      <HomePageContent />
    </>
  );
}

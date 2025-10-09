"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- Hero Images ---------- */
const heroSlidesDesktop = [
  "https://placehold.co/1600x800/png?text=Desktop+1",
  "https://placehold.co/1600x800/png?text=Desktop+2",
];

const heroSlidesMobile = [
  "https://placehold.co/800x1200/png?text=Mobile+1",
  "https://placehold.co/800x1200/png?text=Mobile+2",
];

const promotionBanners = [
  "https://placehold.co/800x400/png?text=Promotion+1",
  "https://placehold.co/400x200/png?text=Promotion+2",
  "https://placehold.co/400x200/png?text=Promotion+3",
];

/* ---------- HERO BANNER ---------- */
const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef(null);

  // ตรวจขนาดหน้าจอ
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Auto slide
  const startAutoSlide = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentSlide(
        (prev) => (prev + 1) % (isMobile ? heroSlidesMobile.length : heroSlidesDesktop.length)
      );
    }, 5000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(intervalRef.current);
  }, [isMobile]);

  // เมื่อคลิก indicator
  const handleIndicatorClick = (idx) => {
    const dir = idx > currentSlide ? 1 : -1;
    setDirection(dir);
    setCurrentSlide(idx);
    startAutoSlide(); // reset timer
  };

  // แอนิเมชัน slide ซ้ายขวา
  const variants = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%" }),
    center: { x: 0 },
    exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%" }),
  };

  // เลือกรูปตามขนาดจอ
  const slides = isMobile ? heroSlidesMobile : heroSlidesDesktop;

  return (
    <div className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden">
      {/* Slides */}
      <AnimatePresence custom={direction} mode="popLayout" initial={false}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={variants}
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
            src={slides[currentSlide]}
            alt={`Hero Slide ${currentSlide + 1}`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleIndicatorClick(idx)}
            className={`h-3 w-3 rounded-full transition-all ${
              idx === currentSlide ? "scale-125 bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/* ---------- HOME PAGE CONTENT ---------- */
const HomePageContent = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/products", { cache: "no-store" }),
        ]);

        const catJson = await catRes.json();
        const prodJson = await prodRes.json();

        setCategories(catJson?.data || catJson);
        setProducts(prodJson?.data || prodJson);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto space-y-16 py-12">
      {/* ---------- PROMOTIONS ---------- */}
      <div>
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
            {promotionBanners.slice(1).map((banner, i) => (
              <Image
                key={i}
                src={banner}
                alt={`Promotion Banner ${i + 2}`}
                width={400}
                height={200}
                className="h-full w-full rounded-2xl object-cover transition-transform duration-500 hover:scale-105"
              />
            ))}
          </div>
        </div>
      </div>

      {/* ---------- CATEGORIES ---------- */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Category</h2>
          <Link href="/products" className="text-primary font-semibold hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((cat) => (
            <Link
              href={`/products?category=${cat.id}`}
              key={cat.id}
              className="hover:border-primary flex h-40 items-center justify-center rounded-xl border border-gray-200 bg-white text-center shadow-md transition-all hover:shadow-lg"
            >
              <span className="group-hover:text-primary text-xl font-semibold text-gray-800">
                {cat.name}
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

/* ---------- MAIN ---------- */
export default function Home() {
  return (
    <>
      <HeroBanner />
      <HomePageContent />
    </>
  );
}
